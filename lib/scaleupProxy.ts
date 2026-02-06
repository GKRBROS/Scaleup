import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const REQUIRED_FIELDS = [
  "name",
  "email",
  "phone_no",
  "district",
  "category",
  "organization",
  "prompt_type",
  "photo",
];

const getBaseUrl = () => {
  const baseUrl =
    process.env.SCALEUP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_SCALEUP_API_BASE_URL;
  if (baseUrl) {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  return "http://13.127.247.90";
};

export const handleGenerateProxy = async (request: NextRequest) => {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 }
    );
  }

  const formData = await request.formData();

  for (const field of REQUIRED_FIELDS) {
    const value = formData.get(field);
    if (!value) {
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 }
      );
    }
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return NextResponse.json(
      { error: "Photo is required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
    return NextResponse.json(
      {
        error: "Invalid image format",
        details: `Only JPEG and PNG formats are allowed. Received: ${photo.type || "unknown"}`,
      },
      { status: 400 }
    );
  }

  if (photo.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      {
        error: "Image file too large",
        details: `Maximum file size is 2MB. Current size: ${(photo.size / (1024 * 1024)).toFixed(2)}MB`,
      },
      { status: 400 }
    );
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "Generation service not configured",
        details: "Set SCALEUP_API_BASE_URL to your backend service URL.",
      },
      { status: 501 }
    );
  }

  try {
    const upstreamResponse = await fetch(`${baseUrl}/scaleup2026/generate`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(75000), // 75 second timeout - slightly higher than nginx 60s to catch errors
    });

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const body = await upstreamResponse.arrayBuffer();
    const bodyText = new TextDecoder().decode(body);

    if (!upstreamResponse.ok) {
      console.error(
        `Backend error (${upstreamResponse.status}):`,
        bodyText
      );

      // Handle 504 timeout - the backend might still process the request asynchronously
      if (upstreamResponse.status === 504) {
        console.log("Backend returned 504, will retry polling for results");
        return NextResponse.json(
          {
            error: "Backend processing",
            details: "Image is being generated. Please wait and try retrieving the result.",
            status: 504,
          },
          { status: 202 } // Return 202 Accepted to indicate async processing
        );
      }

      // If backend returned empty response, provide meaningful error
      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json(
          {
            error: "Backend error",
            details: `Server returned ${upstreamResponse.status} with no response body`,
          },
          { status: upstreamResponse.status }
        );
      }

      // Try to parse backend error as JSON, fallback to plain text
      try {
        const errorData = JSON.parse(bodyText);
        return NextResponse.json(errorData, { status: upstreamResponse.status });
      } catch {
        return NextResponse.json(
          { error: "Backend error", details: bodyText },
          { status: upstreamResponse.status }
        );
      }
    }

    // Success response - ensure it's valid JSON if content-type is JSON
    if (contentType.includes("application/json")) {
      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json(
          {
            error: "Invalid response",
            details: "Backend returned empty JSON response",
          },
          { status: 502 }
        );
      }

      try {
        JSON.parse(bodyText); // Validate JSON
      } catch {
        console.error("Backend returned invalid JSON:", bodyText);
        return NextResponse.json(
          {
            error: "Invalid response",
            details: "Backend returned malformed JSON",
          },
          { status: 502 }
        );
      }
    }

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error: any) {
    console.error("Failed to reach backend:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Backend timeout",
          details: "Image generation is taking longer than expected. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: `Unable to connect to generation service at ${baseUrl}. Please try again later.`,
      },
      { status: 502 }
    );
  }
};

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const isValidPhone = (value: string) =>
  /^\+?\d{10,15}$/.test(value);

export const handleUserProxy = async (request: NextRequest) => {
  if (request.method !== "GET") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 }
    );
  }

  const url = new URL(request.url);
  const userId = url.pathname.split("/").pop() || "";

  if (!isValidUuid(userId) && !isValidPhone(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID or phone number format" },
      { status: 400 }
    );
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "Generation service not configured",
        details: "Set SCALEUP_API_BASE_URL to your backend service URL.",
      },
      { status: 501 }
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${baseUrl}/scaleup2026/user/${userId}`,
      {
        method: "GET",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const body = await upstreamResponse.arrayBuffer();
    const bodyText = new TextDecoder().decode(body);

    // If backend returned empty response
    if (!bodyText || bodyText.trim() === "") {
      console.error(`Backend returned empty response (${upstreamResponse.status})`);
      return NextResponse.json(
        {
          error: "Empty response",
          details: "Backend returned no data",
        },
        { status: upstreamResponse.ok ? 502 : upstreamResponse.status }
      );
    }

    // Validate JSON if content-type is JSON
    if (contentType.includes("application/json")) {
      try {
        JSON.parse(bodyText);
      } catch {
        console.error("Backend returned invalid JSON:", bodyText);
        return NextResponse.json(
          {
            error: "Invalid response",
            details: "Backend returned malformed JSON",
          },
          { status: 502 }
        );
      }
    }

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error: any) {
    console.error("Failed to reach backend (GET):", error);

    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: "Unable to retrieve image. Please try again later.",
      },
      { status: 502 }
    );
  }
};

const readJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export const handleOtpGenerateProxy = async (request: NextRequest) => {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 },
    );
  }

  const payload = await readJsonBody(request);
  console.log("OTP Generate - Received payload:", payload);

  if (!payload?.phoneNumber) {
    console.log("OTP Generate - Missing phoneNumber in payload");
    return NextResponse.json(
      { error: "phoneNumber is required" },
      { status: 400 },
    );
  }

  console.log("OTP Generate - Phone number:", payload.phoneNumber);

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "OTP service not configured",
        details: "Set SCALEUP_API_BASE_URL to your backend service URL.",
      },
      { status: 501 },
    );
  }

  // Transform payload: Try multiple parameter names to find what backend expects
  const backendPayload = {
    phone_number: payload.phoneNumber,
    phone: payload.phoneNumber,
    phoneNumber: payload.phoneNumber,
    phone_no: payload.phoneNumber,
    mobile: payload.phoneNumber,
    phoneNo: payload.phoneNumber,
  };

  console.log("OTP Generate - Sending to backend:", backendPayload);

  try {
    const upstreamResponse = await fetch(`${baseUrl}/scaleup2026/otp/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(backendPayload),
      signal: AbortSignal.timeout(30000),
    });

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const body = await upstreamResponse.arrayBuffer();
    const bodyText = new TextDecoder().decode(body);

    console.log("OTP Generate - Backend response status:", upstreamResponse.status);
    console.log("OTP Generate - Backend response body:", bodyText);

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error: any) {
    console.error("Failed to reach backend (OTP generate):", error);
    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: "Unable to send OTP. Please try again later.",
      },
      { status: 502 },
    );
  }
};

export const handleOtpVerifyProxy = async (request: NextRequest) => {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 },
    );
  }

  const payload = await readJsonBody(request);
  if (!payload?.phoneNumber || !payload?.otp) {
    return NextResponse.json(
      { error: "phoneNumber and otp are required" },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "OTP service not configured",
        details: "Set SCALEUP_API_BASE_URL to your backend service URL.",
      },
      { status: 501 },
    );
  }

  // Transform payload: Try multiple parameter names to find what backend expects
  const backendPayload = {
    phone_number: payload.phoneNumber,
    phone: payload.phoneNumber,
    phoneNumber: payload.phoneNumber,
    phone_no: payload.phoneNumber,
    mobile: payload.phoneNumber,
    phoneNo: payload.phoneNumber,
    otp: payload.otp,
  };

  console.log("OTP Verify - Sending to backend:", backendPayload);

  try {
    const upstreamResponse = await fetch(`${baseUrl}/scaleup2026/otp/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(backendPayload),
      signal: AbortSignal.timeout(30000),
    });

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const body = await upstreamResponse.arrayBuffer();
    const bodyText = new TextDecoder().decode(body);

    console.log("OTP Verify - Backend response status:", upstreamResponse.status);
    console.log("OTP Verify - Backend response body:", bodyText);

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error: any) {
    console.error("Failed to reach backend (OTP verify):", error);
    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: "Unable to verify OTP. Please try again later.",
      },
      { status: 502 },
    );
  }
};

export const handleRegisterProxy = async (request: NextRequest) => {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 },
    );
  }

  const payload = await readJsonBody(request);
  console.log("Register - Received payload:", payload);

  // Validate required fields
  const requiredFields = ["name", "email", "phone_no", "district", "category", "organization"];
  for (const field of requiredFields) {
    if (!payload?.[field]) {
      console.log(`Register - Missing ${field} in payload`);
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 },
      );
    }
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "Register service not configured",
        details: "Set SCALEUP_API_BASE_URL to your backend service URL.",
      },
      { status: 501 },
    );
  }

  console.log("Register - Sending to backend:", payload);

  try {
    const upstreamResponse = await fetch(`${baseUrl}/scaleup2026/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const body = await upstreamResponse.arrayBuffer();
    const bodyText = new TextDecoder().decode(body);

    console.log("Register - Backend response status:", upstreamResponse.status);
    console.log("Register - Backend response body:", bodyText);

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error: any) {
    console.error("Failed to reach backend (Register):", error);
    return NextResponse.json(
      {
        error: "Backend unreachable",
        details: "Unable to register. Please try again later.",
      },
      { status: 502 },
    );
  }
};
