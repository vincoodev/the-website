import Link from "next/link";

import '../styles/globals.css' // Baris ini harus ada!

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
