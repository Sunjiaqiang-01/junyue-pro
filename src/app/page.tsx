import { redirect } from 'next/navigation';

export default function Home() {
  // 重定向到首页
  redirect('/home');
}
