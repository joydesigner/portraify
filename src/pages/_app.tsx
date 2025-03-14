import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // Add iOS web app meta tags
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      // Add iOS web app meta tags dynamically
      const metaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ]

      metaTags.forEach(tag => {
        const metaTag = document.createElement('meta')
        metaTag.name = tag.name
        metaTag.content = tag.content
        document.head.appendChild(metaTag)
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>Portraify - AI Portrait Generator</title>
        <meta name="description" content="Generate professional portraits for different scenarios using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
} 