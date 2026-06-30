import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Finance Planner MicroSaaS",
  description: "Portfolio demo for monthly freelancer finance planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
