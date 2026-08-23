import { AdminGate } from "@/components/admin-gate";
import { DevChrome } from "@/components/dev-chrome";

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate next="/connect">
      <DevChrome>{children}</DevChrome>
    </AdminGate>
  );
}
