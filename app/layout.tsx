import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = "force-dynamic";


const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Spentica Chemicals — Chemical Industry Intelligence & Distribution Platform',
    description: 'Spentica Chemicals connects verified chemical manufacturers and distributors worldwide. Public industry news, COA transfers, compliance alerts, and secure document exchange.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&display=block"
                    rel="stylesheet"
                />
            </head>
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}


