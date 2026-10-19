import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Pin — Your Health. All in One Place.",
  description:
    "Find trusted hospitals, book doctor appointments, and keep your medical prescriptions safely organized — all from one simple platform.",
  openGraph: {
    title: "Health Pin — Your Health. All in One Place.",
    description:
      "Find hospitals, book doctor appointments, and keep your prescriptions organized with Health Pin.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
