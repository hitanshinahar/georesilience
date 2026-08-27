import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { NotificationsProvider } from '@/components/notifications-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GeoResilience - Landslide Intelligence',
  description: 'AI-powered landslide early warning and risk monitoring',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased h-screen overflow-hidden flex`}>
        <TooltipProvider>
          <NotificationsProvider />
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto bg-black/20">
              {children}
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
