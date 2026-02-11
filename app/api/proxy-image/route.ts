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
    if (urlObj.hostname.includes("s3.ap-south-1.amazonaws.com")) {
      // For hostname like bucket.s3.region.amazonaws.com, the path is the key
      return urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
    }
    return null;
  } catch {
    return null;
  }
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
    // Check if it's an S3 URL that might need a presigned URL
    // If it's a raw S3 URL (not already presigned), we generate a presigned one
    if (url.includes("s3.ap-south-1.amazonaws.com") && !url.includes("X-Amz-Signature")) {
      const key = extractS3Key(url);
      if (key) {
        console.log("Generating presigned URL for S3 key:", key);
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });
        url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      }
    }

    console.log("Proxy fetching from URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "no-store"
    });
    
    if (!response.ok) {
      console.error(`Proxy: Fetch failed with status ${response.status} for URL: ${url}`);
      return NextResponse.json(
        { error: `Failed to fetch image from source (${response.status})` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
