import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export function ConfirmEmail({
  username,
  password,
}: {
  username: String;
  password: String;
}) {
  return (
    <Html>
      <Head />
      <Preview>Account registered successfully</Preview>
      <Body
        style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}
        >
          <Section style={{ textAlign: "center" }}>
            <Heading
              style={{
                color: "#1d1c1d",
                fontSize: "24px",
                fontWeight: "bold",
                marginTop: "20px",
              }}
            >
              Account registered successfully! Please log in!
            </Heading>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", margin: "20px 0" }}
            >
              Hello <strong>{username}</strong>, your account has been
              successfully registered. For security reasons, you are required to
              change your password upon your first login. Use the information
              below to log in.
            </Text>
            <Section
              style={{
                background: "#f5f4f5",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <Text
                style={{
                  fontSize: "24px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                username: {username}
              </Text>
              <Text
                style={{
                  fontSize: "24px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                password: {password}
              </Text>
            </Section>
            <Text
              style={{ fontSize: "14px", color: "#555", marginTop: "20px" }}
            >
              Your new password must be a combination of minimum 8 uppercase and
              lowercase letters, numbers, and symbols
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
