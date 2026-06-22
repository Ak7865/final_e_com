import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/site";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
});

export async function sendResetEmail(to: string, token: string) {
  const url = `${getSiteUrl()}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your Lumière password",
    html: `<div style="font-family:sans-serif;padding:24px">
      <h2 style="color:#5b6b52">Lumière</h2>
      <p>Reset your password by clicking the link below (valid 1 hour):</p>
      <a href="${url}" style="background:#5b6b52;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password</a>
    </div>`,
  });
}