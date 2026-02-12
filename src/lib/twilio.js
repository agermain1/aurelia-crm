import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid) throw new Error("Missing TWILIO_ACCOUNT_SID");
if (!authToken) throw new Error("Missing TWILIO_AUTH_TOKEN");

export const twilioClient = Twilio(accountSid, authToken);

function normalizeWhatsApp(to) {
  if (!to) return to;
  return to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
}

export async function sendWhatsAppMessage(to, message) {
  return twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER, // whatsapp:+14155238886
    to: normalizeWhatsApp(to),
    body: message,
  });
}
