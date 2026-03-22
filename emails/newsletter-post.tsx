import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface NewsletterPostEmailProps {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  siteName: string;
  unsubscribeUrl: string;
}

export function NewsletterPostEmail({
  postTitle,
  postExcerpt,
  postUrl,
  siteName,
  unsubscribeUrl,
}: NewsletterPostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{postTitle} — {siteName}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px 0" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            {siteName}
          </Text>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px", lineHeight: "1.3" }}>
            {postTitle}
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>
            {postExcerpt}
          </Text>
          <Link
            href={postUrl}
            style={{ display: "inline-block", backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}
          >
            Read Article →
          </Link>
          <hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
            You received this because you subscribed to {siteName}.{" "}
            <Link href={unsubscribeUrl} style={{ color: "#9ca3af" }}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
