import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

import NavigationBar from '@/app/(delete-this-and-modify-page.tsx)/NavigationBar';
import '@/app/globals.css';
import ChatBot from '@/components/ui/ChatBot';
import { Toaster } from '@/registry/new-york-v4/ui/sonner';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    // ? https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    // ? https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors
    <html suppressHydrationWarning lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground overscroll-none antialiased`}>
        <ThemeProvider attribute='class'>
          <NavigationBar />
          {children}
          <ChatBot className='right-6 bottom-6' promptType='coach' title='Coach Carter 🏀' />
          <ChatBot className='right-25 bottom-6' promptType='docteur' title='Docteur Maboul 🩺' />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
