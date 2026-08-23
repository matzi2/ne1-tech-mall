import { NasWorkWindow } from "@/components/nas-work-window";

export const dynamic = "force-dynamic";

export default function AdminNasPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <NasWorkWindow />
    </div>
  );
}
