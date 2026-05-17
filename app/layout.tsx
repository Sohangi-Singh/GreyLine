import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greyline — Contract Intelligence",
  description: "Read before you sign. Understand before you agree. AI-powered adversarial contract analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ backgroundColor: "#0F1623", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
