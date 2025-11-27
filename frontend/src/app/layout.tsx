import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import MessagingPopup from "@/components/messaging/MessagingPopup";

export const metadata: Metadata = {
  title: "ProNet - Professional Community Platform",
  description: "Connect, learn, and grow with professionals in your field",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              {children}
              <MessagingPopup />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
