import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

interface ContactFormData {
  email: string;
  message: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body: ContactFormData = await request.json();
  const { email, message } = body;

  // ------------------------------
  // 1. VALIDATION
  // ------------------------------
  const errors: string[] = [];


  if (!email || !validateEmail(email))
    errors.push("A valid email address is required.");

  if (!message || message.trim().length < 10)
    errors.push("Message must be at least 10 characters long.");

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ------------------------------
  // 2. BEAUTIFUL EMAIL TEMPLATE
  // ------------------------------
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5; color: #171717;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background-color: #f43f5e; padding: 32px 20px; text-align: center;">
      <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">New Contact Message</h2>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #737373; margin-bottom: 8px;">From</label>
        <p style="margin: 0; font-size: 16px; color: #171717; font-weight: 500;">${email}</p>
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #737373; margin-bottom: 8px;">Message</label>
        <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 8px; padding: 20px; color: #171717; line-height: 1.6; font-size: 15px;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f5f5f5;">
      <p style="margin: 0; font-size: 12px; color: #a3a3a3;">Sent via portfolio Contact Form</p>
    </div>
  </div>
</body>
</html>
  `;

  // ------------------------------
  // 3. SENDING EMAIL
  // ------------------------------
  const { error } = await resend.emails.send({
    from: "Portfolio <portfolio@sahilkhan.site>",
    to: ["sahilkh9087@gmail.com"],
    subject: "New Portfolio Message",
    html: htmlTemplate,
  });

  if (error) {
    return new Response(JSON.stringify({ error: JSON.stringify(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Email sent successfully",
      success: true,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
