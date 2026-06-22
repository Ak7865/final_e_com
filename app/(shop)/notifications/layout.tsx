import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View updates about your orders, accounts, and clean beauty news.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
