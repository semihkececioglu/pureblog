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

interface CommentApprovedEmailProps {
  commenterName: string;
  postTitle: string;
  postSlug: string;
  siteUrl: string;
}

export function CommentApprovedEmail({
  commenterName,
  postTitle,
  postSlug,
  siteUrl,
}: CommentApprovedEmailProps) {
  const postUrl = `${siteUrl}/blog/${postSlug}`;

  return (
    <Html>
      <Head />
      <Preview>Your comment on &quot;{postTitle}&quot; has been approved</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px 0" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
            Your comment was approved!
          </Heading>
          <Text style={{ color: "#374151" }}>
            Hi {commenterName},
          </Text>
          <Text style={{ color: "#374151" }}>
            Your comment on{" "}
            <Link href={postUrl} style={{ color: "#2563eb" }}>
              {postTitle}
            </Link>{" "}
            has been approved and is now visible to other readers.
          </Text>
          <Link
            href={postUrl}
            style={{ display: "inline-block", marginTop: "8px", backgroundColor: "#111827", color: "#ffffff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}
          >
            View Your Comment
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
