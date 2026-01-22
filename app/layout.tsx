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
    title: 'B2B Management System',
    description: 'Professional B2B Web Application for PDF Management and Distribution',
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
            </head>
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}


