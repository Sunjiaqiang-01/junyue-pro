import type { Metadata } from "next";
import TherapistNavigation from "@/components/TherapistNavigation";

export const metadata: Metadata = {
  title: "技师中心 - 君悦SPA",
  description: "君悦SPA技师管理中心",
};

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-deep-black">
      <TherapistNavigation />
      {children}
    </div>
  );
}
