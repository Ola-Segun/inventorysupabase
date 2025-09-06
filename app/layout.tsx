import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  preload: true,
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  preload: true,
})

import type { Viewport } from "next"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  title: "InventoryPro - Smart Inventory Management System",
  description:
    "Transform your business with AI-powered inventory management. Real-time tracking, predictive analytics, and seamless integrations.",
  generator: "v0.dev",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InventoryPro",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#7e1b8e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/placeholder.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/placeholder.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="InventoryPro" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Simple browser extension cleanup
                  function cleanup() {
                    document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                      el.removeAttribute('bis_skin_checked');
                    });
                  }

                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', cleanup);
                  } else {
                    cleanup();
                  }

                  // Service worker registration
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').catch(function(err) {
                        console.log('SW registration failed:', err);
                      });
                    });
                  }
                } catch (e) {
                  console.warn('Layout script error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}
