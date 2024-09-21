import { appEnv } from '#src/config/env.js';
import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: appEnv.GG_MAILER_USER,
    pass: appEnv.GG_MAILER_PW,
  },
});

export async function sendMail({ to, subject, text, html }) {
  let info = await transporter.sendMail({
    from: appEnv.GG_MAILER_USER, // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });

  return info;
}
