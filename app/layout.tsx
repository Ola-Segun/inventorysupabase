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
              // Remove browser extension attributes that cause hydration mismatches
              (function () {
                function removeExtensionAttributes() {
                  try {
                    const elements = document.querySelectorAll('[bis_skin_checked]');
                    elements.forEach(el => {
                      if (el && typeof el.removeAttribute === 'function') {
                        el.removeAttribute('bis_skin_checked');
                      }
                    });
                  } catch (e) {
                    // defensive: if DOM isn't ready or selector fails, ignore
                    console.warn('removeExtensionAttributes failed', e);
                  }
                }

                // Remove attributes immediately if possible
                if (typeof document !== 'undefined') {
                  removeExtensionAttributes();
                }

                // Setup observer safely when body is available
                function setupObserver() {
                  try {
                    const observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                        try {
                          if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                            const target = mutation.target;
                            if (target && target.nodeType === Node.ELEMENT_NODE && typeof (target).removeAttribute === 'function') {
                              (target).removeAttribute('bis_skin_checked');
                            }
                          }
                        } catch (innerErr) {
                          // swallow per-mutation errors
                          console.warn('mutation handling failed', innerErr);
                        }
                      });
                    });

                    if (document.body) {
                      observer.observe(document.body, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['bis_skin_checked']
                      });
                    } else {
                      document.addEventListener('DOMContentLoaded', function () {
                        if (document.body) {
                          observer.observe(document.body, {
                            attributes: true,
                            subtree: true,
                            attributeFilter: ['bis_skin_checked']
                          });
                        }
                      }, { once: true });
                    }
                  } catch (e) {
                    // If MutationObserver isn't available or observing fails, don't crash the app
                    console.warn('MutationObserver setup failed', e);
                  }
                }

                if (typeof window !== 'undefined') {
                  setupObserver();
                }

                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
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
