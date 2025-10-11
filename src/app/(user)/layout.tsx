import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '君悦SPA - 高端技师预约服务',
  description: '专业SPA技师在线预约平台',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-deep-black">
      {children}
    </div>
  );
}

