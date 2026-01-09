import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Charts - Generate Charts from Natural Language",
  description: "Create beautiful charts instantly by describing your data in plain language. Powered by AI.",
  keywords: ["AI", "charts", "data visualization", "ECharts", "natural language"],
  openGraph: {
    title: "AI Charts - Generate Charts from Natural Language",
    description: "Create beautiful charts instantly by describing your data in plain language. Powered by AI.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
