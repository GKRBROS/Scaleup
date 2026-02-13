import nodemailer from "nodemailer";

export const runtime = "nodejs";

import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Send-mail: Received request body:", body);
    const { to, subject, finalImageUrl } = body;

    if (!to || !finalImageUrl) {
      console.error("Send-mail: Missing required fields (to or finalImageUrl)");
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Load HTML template
    const templatePath = path.join(
      process.cwd(),
      "app",
      "api",
      "send-mail",
      "mail.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholder
    html = html.replace("{{DOWNLOAD_URL}}", finalImageUrl);

    console.log("Send-mail: Creating transporter with host:", process.env.SMTP_HOST_NAME, "port:", process.env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST_NAME,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // ✅ FIX
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("Send-mail: Sending email to:", to);
    await transporter.sendMail({
      from: `"ScaleUp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Send-mail: Email sent successfully");

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("SMTP ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

