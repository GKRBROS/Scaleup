import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Call Backend to Generate OTP
    const backendUrl = process.env.SCALEUP_API_BASE_URL || "https://scaleup.frameforge.one";
    
    // We send email as phone parameters too, as backend might expect phone fields
    const backendRes = await fetch(`${backendUrl}/scaleup2026/otp/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        phone_no: email, 
        phoneNumber: email 
      }),
    });

    // Parse backend response
    // If backend returns 4xx/5xx, we should handle it
    let backendData = {};
    try {
        backendData = await backendRes.json();
    } catch (e) {
        console.error("Failed to parse backend response", e);
    }
    
    if (!backendRes.ok) {
       console.error("Backend OTP Generate Failed:", backendData);
       return NextResponse.json(
         { error: (backendData as any).error || "Failed to generate OTP from backend" }, 
         { status: backendRes.status }
       );
    }

    // 2. Get OTP from backend response
    const otp = (backendData as any).otp || (backendData as any).code;

    if (!otp) {
        console.warn("Backend did not return OTP in body. Assuming backend sent it or it's hidden.");
        // If we can't get OTP, we can't send email. 
        // Return success message from backend or default.
        return NextResponse.json({ 
            success: true, 
            message: (backendData as any).message || "OTP generated" 
        });
    }

    // 3. Send Email via SMTP
    try {
        const templatePath = path.join(process.cwd(), "app", "api", "send-otp", "mail.html");
        let html = fs.readFileSync(templatePath, "utf-8");
        html = html.replace("{{OTP}}", otp);

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST_NAME,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"ScaleUp" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Your ScaleUp OTP",
          html,
        });
        
        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (mailError) {
        console.error("Failed to send email:", mailError);
        // Even if email fails, we might want to return success if backend succeeded?
        // But user needs OTP. So return error.
        return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("OTP Generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
