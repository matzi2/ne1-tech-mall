import { AdminGate } from "@/components/admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate next="/admin">{children}</AdminGate>;
}
