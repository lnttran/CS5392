import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ConfirmEmail } from "../../../../components/users/confirmationEmail";
import { render } from "@react-email/components";

export async function POST(req: Request) {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // const { data, error } = await resend.emails.send({
    //   from: "Lyle Application Form Website <onboarding@resend.dev>",
    //   to: [email],
    //   subject: "Account registered successfully",
    //   react: confirmEmail({ username: username, password: password }),
    // });

    console.log(process.env.HOST_EMAIL, "email");
    console.log(process.env.HOST_EMAIL_PASS, "email");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      //   port: 465,
      secure: false,
      auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.HOST_EMAIL_PASS,
      },
    });

    const htmlEmail = await render(
      ConfirmEmail({ username: username, password: password })
    );

    const options = {
      from: `Lyle Application Form Website <${process.env.HOST_EMAIL}>`,
      to: email,
      subject: "Account registered successfully",
      html: htmlEmail,
    };

    await transporter.sendMail(options);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
