import { AdminNav } from "@/components/admin-nav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}
