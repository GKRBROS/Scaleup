import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const backendUrl = process.env.SCALEUP_API_BASE_URL || "https://scaleup.frameforge.one";

    console.log("Proxying OTP generate request to:", `${backendUrl}/scaleup2026/otp/generate`);
    console.log("Payload:", payload);

    // Proxy to backend generate
    // Backend expects phone_no usually, but we are passing what we have.
    // If payload has email, we pass it.
    const backendPayload = {
        ...payload,
        // Ensure common fields are present if needed, but for now just pass through
        // or map email to phone_no if backend treats them same? 
        // Let's just pass the payload + ensure email is there.
    };

    const response = await fetch(`${backendUrl}/scaleup2026/otp/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Backend OTP generate failed:", data);
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("OTP Generate Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP via backend" },
      { status: 500 }
    );
  }
}
