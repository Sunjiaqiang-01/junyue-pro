'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import RegisterForm from '@/components/ui/gaming-register';

export default function TherapistRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码（暂时跳过，直接使用密码注册）
  const handleSendCode = useCallback(async (phone: string) => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    try {
      // TODO: 实现发送验证码API
      // 暂时模拟发送成功
      toast.success('验证码已发送（演示模式：请输入任意验证码）');
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  }, []);

  const handleSubmit = async (phone: string, code: string, password: string, name: string) => {
    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    // 验证密码
    if (!password || password.length < 6) {
      toast.error('密码至少需要6位');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/therapist/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          invitedBy: code || null, // 暂时使用code字段作为邀请码
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || '注册失败');
        return;
      }

      toast.success('注册成功，请登录');
      router.push('/therapist/login');
    } catch (error) {
      toast.error('注册失败，请稍后重试');
      console.error('注册错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900"></div>
      
      {/* 注册表单 */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <RegisterForm
            onSubmit={handleSubmit}
            onSendCode={handleSendCode}
            isSubmitting={loading}
            isSendingCode={sendingCode}
            countdown={countdown}
          />
        </div>
      </div>
    </div>
  );
}

