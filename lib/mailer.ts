import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import Subscriber from "@/models/Subscriber";
import { NewCommentEmail } from "@/emails/new-comment";
import { CommentApprovedEmail } from "@/emails/comment-approved";
import { NewsletterPostEmail } from "@/emails/newsletter-post";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "PureBlog";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendToSubscribers(postTitle: string, postExcerpt: string, postSlug: string): Promise<void> {
  const subscribers = await Subscriber.find({ status: "active" })
    .select("email unsubscribeToken")
    .lean();

  if (!subscribers.length) return;

  const transporter = createTransporter();

  await Promise.all(
    subscribers.map(async (subscriber) => {
      let token = subscriber.unsubscribeToken as string | undefined;

      if (!token) {
        token = crypto.randomUUID();
        await Subscriber.updateOne({ _id: subscriber._id }, { unsubscribeToken: token });
      }

      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${token}`;
      const postUrl = `${siteUrl}/blog/${postSlug}`;

      const html = await render(
        NewsletterPostEmail({ postTitle, postExcerpt, postUrl, siteName, unsubscribeUrl })
      );

      return transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: subscriber.email as string,
        subject: `New post: ${postTitle}`,
        html,
      });
    })
  );
}

export async function sendCommentNotification(
  postTitle: string,
  postSlug: string,
  commenterName: string,
  commentContent: string,
): Promise<void> {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  if (!adminEmail || !process.env.GMAIL_USER) return;

  const html = await render(
    NewCommentEmail({ postTitle, postSlug, commenterName, commentContent, adminUrl: siteUrl, siteUrl })
  );

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: adminEmail,
    subject: `New comment on "${postTitle}"`,
    html,
  });
}

export async function sendCommentApprovedNotification(
  to: string,
  commenterName: string,
  postTitle: string,
  postSlug: string,
): Promise<void> {
  if (!process.env.GMAIL_USER) return;

  const html = await render(
    CommentApprovedEmail({ commenterName, postTitle, postSlug, siteUrl })
  );

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: `Your comment on "${postTitle}" was approved`,
    html,
  });
}

export async function sendCustomNewsletter(subject: string, body: string): Promise<void> {
  const subscribers = await Subscriber.find({ status: "active" })
    .select("email unsubscribeToken")
    .lean();

  if (!subscribers.length) return;

  const transporter = createTransporter();

  await Promise.all(
    subscribers.map(async (subscriber) => {
      let token = subscriber.unsubscribeToken as string | undefined;
      if (!token) {
        token = crypto.randomUUID();
        await Subscriber.updateOne({ _id: subscriber._id }, { unsubscribeToken: token });
      }
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${token}`;
      return transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: subscriber.email as string,
        subject,
        text: body,
        html: `<p style="font-family:sans-serif;white-space:pre-wrap">${body.replace(/\n/g, "<br>")}</p><br><br><p style="font-size:12px;color:#888">To unsubscribe, <a href="${unsubscribeUrl}">click here</a>.</p>`,
      });
    })
  );
}

export async function sendContactNotification(
  name: string,
  email: string,
  subject: string,
  content: string,
): Promise<void> {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  if (!adminEmail || !process.env.GMAIL_USER) return;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: adminEmail,
    subject: `New contact message: ${subject}`,
    text: `From: ${name} <${email}>\n\n${content}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><hr><p style="white-space:pre-wrap">${content}</p>`,
  });
}

export async function sendSingleEmail(
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
}
