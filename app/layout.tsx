import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MachinePassport | Verified service standing",
  description: "A GenLayer equipment passport grounded in OEM procedure and inspector evidence.",
  icons: { icon: "/machinepassport-logo.png", apple: "/machinepassport-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
