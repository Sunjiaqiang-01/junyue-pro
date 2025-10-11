'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoginPage from '@/components/ui/gaming-login';

const { LoginForm, VideoBackground } = LoginPage;

export default function TherapistLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (phone: string, password: string, remember: boolean) => {
    setLoading(true);
    try {
      const result = await signIn('therapist', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        toast.success('登录成功');
        router.push('/therapist/dashboard');
      }
    } catch (error) {
      toast.error('登录失败，请稍后重试');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景视频（可选，如果没有视频可以注释掉） */}
      {/* <VideoBackground videoUrl="/your-video.mp4" /> */}
      
      {/* 渐变背景（当没有视频时使用） */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900"></div>
      
      {/* 登录表单 */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <LoginForm onSubmit={handleSubmit} isSubmitting={loading} />
        </div>
      </div>
    </div>
  );
}

