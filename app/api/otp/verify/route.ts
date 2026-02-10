import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;
    
    if (!email || !otp) {
        return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const backendUrl = process.env.SCALEUP_API_BASE_URL || "https://scaleup.frameforge.one";
    
    const backendRes = await fetch(`${backendUrl}/scaleup2026/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        otp,
        phone_no: email, 
        phoneNumber: email 
      }),
    });

    let backendData = {};
    try {
        backendData = await backendRes.json();
    } catch (e) {
        console.error("Failed to parse backend verify response", e);
    }

    if (!backendRes.ok) {
        return NextResponse.json(
            { error: (backendData as any).error || "Verification failed" }, 
            { status: backendRes.status }
        );
    }

    return NextResponse.json(backendData);

  } catch (error: any) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
