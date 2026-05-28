import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { RoleProvider } from '@/context/RoleContext';
import { PrototypeDataProvider } from '@/context/PrototypeDataContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Seven Gym Management System",
  description: "Modern gym management platform for Seven Gym",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-50">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <RoleProvider>
            <PrototypeDataProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </PrototypeDataProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
