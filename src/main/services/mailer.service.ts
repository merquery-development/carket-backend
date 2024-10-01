import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Click the following link to verify your email: ${verificationUrl}`,
      html: `<p>Click the following link to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
