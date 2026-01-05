import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UNCU Page",
  description: "UNCU Worklabs",
};

const navItems = [
  { name: "Home", link: "/" },
  { name: "About", link: "/#work" },
  { name: "Work", link: "/#about" },
  { name: "Contact", link: "/#contact" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Navbar className="fixed inset-x-0 top-6 z-[100]">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />

            <div className="relative z-20 flex items-center gap-2">
              <NavbarButton
                href="/login"
                variant="secondary"
                className="text-white"
              >
                Sign In
              </NavbarButton>

              <NavbarButton href="/contact" variant="dark">
                Lets talk
              </NavbarButton>
            </div>
          </NavBody>
        </Navbar>

        <div className="pt-32">{children}</div>
      </body>
    </html>
  );
}
