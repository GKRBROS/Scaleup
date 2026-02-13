import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "frameforge";

/**
 * Extracts the S3 key from a full S3 URL
 * e.g. https://frameforge.s3.ap-south-1.amazonaws.com/final/123.png -> final/123.png
 */
function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Pattern 1: bucket.s3.region.amazonaws.com/key
    // Pattern 2: bucket.s3-region.amazonaws.com/key
    if (urlObj.hostname.includes(".s3.") || urlObj.hostname.includes(".s3-")) {
      return urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
    }
    
    // Pattern 3: s3.region.amazonaws.com/bucket/key
    if (urlObj.hostname.startsWith("s3.")) {
      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (parts.length > 1) {
        // The first part is the bucket name, the rest is the key
        return parts.slice(1).join("/");
      }
    }

    // Pattern 4: raw s3:// protocol (unlikely but possible)
    if (url.startsWith("s3://")) {
      const withoutProtocol = url.replace("s3://", "");
      const parts = withoutProtocol.split("/");
      return parts.slice(1).join("/");
    }

    return null;
  } catch {
    return null;
  }
}

export async function HEAD(req: NextRequest) {
  return GET(req);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let url = searchParams.get("url");
    let filename = searchParams.get("filename") || "image.png";
    const disposition = searchParams.get("disposition") || "attachment";

    // Sanitize filename to remove any characters that might break headers
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    console.log("Proxy-image: Request received for URL:", url);
    
    /**
     * URL ROUTING SYSTEM
     * 1. Check if the URL is an Amazon S3 URL that belongs to OUR bucket (frameforge)
     * 2. Check if it's already presigned (contains X-Amz-Signature)
     * 3. Check if it's using the s3:// protocol
     * 
     * If it's our bucket and not presigned, or if it's s3://, we use S3 client to get a presigned URL.
     * For all other URLs (including other S3 buckets like MakeMyPass), we fetch them directly as public URLs.
     */
    const isS3Protocol = url.startsWith("s3://");
    const isAlreadyPresigned = url.includes("X-Amz-Signature");
    
    // Only treat it as "Our S3" if it explicitly contains our bucket name and is an amazonaws link
    const isOurS3Url = url.includes("amazonaws.com") && url.includes(BUCKET_NAME);

    if ((isOurS3Url || isS3Protocol) && !isAlreadyPresigned) {
      // Amazon-specific routing for OUR bucket: extract key and presign
      const key = extractS3Key(url);
      if (key) {
        console.log("Proxy-image: Our S3 bucket detected, generating presigned URL for key:", key);
        try {
          const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          });
          const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 });
          url = presignedUrl;
        } catch (s3Error) {
          console.error("Proxy-image: S3 presigned URL generation failed:", s3Error);
          // Fallback to original URL if presigning fails
        }
      }
    } else {
      console.log("Proxy-image: Public URL or Already Presigned detected, fetching directly through proxy");
    }

    if (!url.startsWith("http")) {
      if (url.startsWith("//")) {
        url = "https:" + url;
      } else {
        console.error("Proxy-image: Invalid URL protocol:", url);
        return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
      }
    }

    console.log("Proxy-image: Final fetch target URL:", url);

    const response = await fetch(url, {
      method: "GET", // Force GET for the actual fetch to ensure we get the data
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "no-store"
    });
    
    if (!response.ok) {
      console.error(`Proxy-image: Fetch failed with status ${response.status} for URL: ${url}`);
      return NextResponse.json(
        { error: `Failed to fetch image from source (${response.status})` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    console.log(`Proxy-image: Successfully fetched ${buffer.byteLength} bytes, content-type: ${contentType}`);

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Content-Disposition", `${disposition}; filename="${filename}"`);
    // Disable caching to prevent cross-user image contamination and ensure fresh S3 content
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");
    // Always use the actual buffer length to avoid mismatches if the source was compressed
    responseHeaders.set("Content-Length", buffer.byteLength.toString());

    // CRITICAL: Safety check for cross-contamination
    // If filename suggests avatar but URL looks like ticket, or vice versa, log it
    const lowUrl = url.toLowerCase();
    const lowFile = filename.toLowerCase();
    const isTicketUrl = lowUrl.includes("makemypass") || lowUrl.includes("-ticket");
    const isAvatarFile = lowFile.includes("avatar");
    const isTicketFile = lowFile.includes("ticket");

    if (isTicketUrl && isAvatarFile) {
      console.warn(`Proxy-image: POTENTIAL MISMATCH - Ticket URL being downloaded as Avatar file: ${filename}`);
    } else if (!isTicketUrl && isTicketFile) {
      console.warn(`Proxy-image: POTENTIAL MISMATCH - Avatar URL being downloaded as Ticket file: ${filename}`);
    }

    return new Response(buffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
