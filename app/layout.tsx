import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Voiply Business Advanced Solutions Checkout',
  description: 'Get reliable business phone service from Voiply. Advanced checkout for Voiply business phone solutions.',
  icons: {
    icon: '/business-advanced-checkout/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://us-autocomplete-pro.api.smarty.com" />
        <link rel="preconnect" href="https://gtmss.voiply.com" />
        <link rel="dns-prefetch" href="https://0bf3cfc9bffb318dd3ae21430a09ef03.cdn.bubble.io" />
        
        {/* Google Tag Manager - Server-Side (GTMSS) */}
        <Script 
          id="google-tag-manager" 
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n'https://gtmss.voiply.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,'script','dataLayer','GTM-M29KG8V');`
          }}
        />
      </head>
      <body>
        {children}
        
        {/* Google Tag Manager GTMSS (noscript) */}
        <noscript>
          <iframe 
            src="https://gtmss.voiply.com/ns.html?id=GTM-M29KG8V"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
      </body>
    </html>
  )
}
