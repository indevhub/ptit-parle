import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TranslationProvider } from '@/context/TranslationContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TopNav } from '@/components/TopNav';

export const metadata: Metadata = {
  title: "P'tit Parlé - Apprends le français en t'amusant",
  description: 'Interactive French learning for children',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <TooltipProvider>
            <TranslationProvider>
              <TopNav />
              <div className="pt-16">
                {children}
              </div>
              <Toaster />
            </TranslationProvider>
          </TooltipProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
