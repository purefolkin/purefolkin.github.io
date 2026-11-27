export const metadata = {
  title: { default: "Nucleus Admin", template: "%s | Nucleus" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
