import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理中心 - 君悦SPA',
  description: '君悦SPA管理中心',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

