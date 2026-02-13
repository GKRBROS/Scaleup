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
  const filename = searchParams.get("filename") || "image.png";
  const disposition = searchParams.get("disposition") || "attachment";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    console.log("Proxy-image: Request received for URL:", url);
    
    /**
     * URL ROUTING SYSTEM
     * 1. Check for Amazon/S3 related patterns (3 designated patterns: s3 hostname, s3-region hostname, or X-Amz-Signature)
     * 2. If it's an Amazon URL, handle S3-specific logic (extract key and presign if needed)
     * 3. For all other URLs, bypass all S3 conversion/validation and pass through directly
     */
    const isS3Url = url.includes("s3") && url.includes("amazonaws.com");
    const isAlreadyPresigned = url.includes("X-Amz-Signature");
    const isS3Protocol = url.startsWith("s3://");

    const isAmazonRelated = isS3Url || isAlreadyPresigned || isS3Protocol;

    if (isAmazonRelated) {
      // Amazon-specific routing: handle S3 logic without proxy intervention for others
      if (!isAlreadyPresigned) {
        const key = extractS3Key(url);
        if (key) {
          console.log("Proxy-image: Amazon URL detected, generating presigned URL for S3 key:", key);
          try {
            const command = new GetObjectCommand({
              Bucket: BUCKET_NAME,
              Key: key,
            });
            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 });
            console.log("Proxy-image: Successfully generated presigned URL for Amazon link");
            url = presignedUrl;
          } catch (s3Error) {
            console.error("Proxy-image: Amazon presigned URL generation failed:", s3Error);
          }
        }
      }
    } else {
      // Non-Amazon routing: Bypass all S3 logic and proxy intervention
      console.log("Proxy-image: Non-Amazon URL detected, bypassing conversion and passing through directly");
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
    responseHeaders.set("Cache-Control", "public, max-age=3600");
    // Always use the actual buffer length to avoid mismatches if the source was compressed
    responseHeaders.set("Content-Length", buffer.byteLength.toString());

    return new Response(buffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
