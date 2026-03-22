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

interface NewCommentEmailProps {
  postTitle: string;
  postSlug: string;
  commenterName: string;
  commentContent: string;
  adminUrl: string;
  siteUrl: string;
}

export function NewCommentEmail({
  postTitle,
  postSlug,
  commenterName,
  commentContent,
  adminUrl,
  siteUrl,
}: NewCommentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New comment on &quot;{postTitle}&quot; awaiting moderation</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px 0" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
            New comment awaiting approval
          </Heading>
          <Text style={{ color: "#374151", marginBottom: "8px" }}>
            <strong>{commenterName}</strong> left a comment on{" "}
            <Link href={`${siteUrl}/blog/${postSlug}`} style={{ color: "#2563eb" }}>
              {postTitle}
            </Link>
            :
          </Text>
          <Text style={{ backgroundColor: "#f3f4f6", padding: "16px", borderLeft: "4px solid #d1d5db", color: "#374151", borderRadius: "4px" }}>
            {commentContent}
          </Text>
          <Link
            href={`${adminUrl}/admin/comments`}
            style={{ display: "inline-block", marginTop: "16px", backgroundColor: "#111827", color: "#ffffff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}
          >
            Review in Admin Panel
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
