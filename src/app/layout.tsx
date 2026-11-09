import type { Metadata } from "next";
import { getDepartmentsWithTree } from "@/server/services/catalog";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { MobileDock } from "@/components/store/MobileDock";
import { StarfieldCanvas } from "@/components/store/StarfieldCanvas";
import { PwaRegister } from "@/components/store/PwaRegister";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Astrox — Astral Luxury E-Commerce Bangladesh",
  description: "Bengali regal heritage meets modern sovereignty. Handwoven Dhakai Muslin sarees, royal Jacquard panjabis, authentic K-Beauty, and precision audio. Fast 24-48h Cash on Delivery across Bangladesh.",
  icons: {
    icon: "/brand/astrox-mark.svg",
    shortcut: "/brand/astrox-mark.svg",
    apple: "/brand/astrox-mark.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let departments: any[] = [];
  try {
    departments = await getDepartmentsWithTree();
  } catch (err) {
    console.warn("Could not load departments for layout:", err);
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/brand/astrox-mark.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#07070A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              name: "Astrox",
              alternateName: "Astrox Astral Luxury",
              url: "https://astrox.com",
              logo: "https://astrox.com/brand/astrox-logo.svg",
              description:
                "Bengali regal heritage meets modern sovereignty. Handwoven Dhakai Muslin sarees, royal Jacquard panjabis, authentic K-Beauty, and precision audio.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Gulshan-2 & Sonargaon",
                addressLocality: "Dhaka",
                addressRegion: "Dhaka Division",
                postalCode: "1212",
                addressCountry: "BD",
              },
              currenciesAccepted: "BDT",
              paymentAccepted: "Cash, Credit Card, bKash, Nagad",
              priceRange: "৳৳৳",
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#07070A] text-[#F4F1EA] flex flex-col antialiased selection:bg-[#d9bc82] selection:text-black relative">
        {/* Ambient Astral Starfield Canvas */}
        <StarfieldCanvas />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#121319",
              color: "#F4F1EA",
              border: "1px solid rgba(217, 188, 130, 0.25)",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />

        {/* Global Store Header */}
        <Header departments={departments} />

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-16 sm:pb-0">{children}</main>

        {/* Global Shopping Bag Drawer */}
        <CartDrawer />

        {/* Global Footer */}
        <Footer />

        {/* Global Mobile Bottom Dock Navigation */}
        <MobileDock />

        {/* PWA Service Worker Registration & Installation Banner */}
        <PwaRegister />
      </body>
    </html>
  );
}
