import "./globals.css"
import { Roboto, Roboto_Mono } from "next/font/google"

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-sans"
})

const mono = Roboto_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-mono"
})

export const metadata = {
    title: "Angular Certification Prep",
    description: "Quiz"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt">
        <body className={`${roboto.variable} ${mono.variable}`}>{children}</body>
        </html>
    )
}
