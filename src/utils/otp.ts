import dotenv from "dotenv"
import twilio from "twilio";
import jwt from "jsonwebtoken"
import { transporter } from "../config.js";
dotenv.config()

const TOKEN_KEY = process.env.JWT_SECRET_KEY as string
const SERVICE_ID = process.env.TWILIO_SERVICE_SID
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
// const BASE_URL = `${process.env.TWILIO_URL}/${SERVICE_ID}`
const client = twilio(
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN
);


export const sendOTP = async (to: string) => {
  const verification = await client.verify.v2.services(`${SERVICE_ID}`).verifications.create({
    to: to,
    channel: "sms",
  });
  console.log(verification)
}

export const validateOTP = async () => {

}

export const generateToken = (email: string) => {
  const token = jwt.sign({ email }, TOKEN_KEY)
  return token
}

export const mailOTP = async (to: string, otp: string) => {
  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DYRTN OTP Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#111827,#1f2937); padding:30px;">
              <h1 style="color:#ffffff; margin:0; font-size:32px; letter-spacing:2px;">
                DYRTN
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px; color:#333333;">

              <h2 style="margin-top:0; font-size:24px;">
                Verify Your Email
              </h2>

              <p style="font-size:16px; line-height:1.7; color:#555555;">
                Hello,
              </p>

              <p style="font-size:16px; line-height:1.7; color:#555555;">
                Use the OTP below to complete your verification process for your DYRTN account.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:35px 0;">
                <span
                  style="display:inline-block; background-color:#111827; color:#ffffff; font-size:34px; letter-spacing:10px; padding:18px 35px; border-radius:10px; font-weight:bold;">
                  ${otp}
                </span>
              </div>

              <p style="font-size:15px; line-height:1.7; color:#777777;">
                This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
              </p>

              <p style="font-size:15px; line-height:1.7; color:#777777;">
                If you did not request this verification, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="background-color:#f9fafb; padding:25px; border-top:1px solid #e5e7eb;">

              <p style="margin:0; font-size:14px; color:#6b7280;">
                © 2026 DYRTN. All rights reserved.
              </p>

              <p style="margin-top:8px; font-size:13px; color:#9ca3af;">
                Owner: Himanshu Parnami
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
  const response = await transporter.sendMail({
    from: 'kunalindia59@gmail.com',
    to: to,
    subject: "DYRTN APP OTP",
    html: htmlBody
  })
  if (!response.messageId) {
    return false
  }
  return true
}