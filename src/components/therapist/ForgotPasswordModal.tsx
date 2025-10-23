"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Modal from "@/components/ui/modal-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, CheckCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordModal({
  open,
  onClose,
  onSwitchToLogin,
}: ForgotPasswordModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 步骤1：检查用户名
  const handleCheckUsername = async () => {
    if (!username) {
      toast.error("请输入用户名");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/therapist/check-username?username=${username}`);
      const data = await res.json();

      if (!data.exists) {
        toast.error("用户名不存在");
        return;
      }

      setEmailHint(data.emailHint);
      setStep(2);
    } catch (error) {
      toast.error("查询失败，请稍后重试");
      console.error("查询错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 步骤2：发送验证码
  const handleSendCode = async () => {
    if (!email) {
      toast.error("请输入邮箱");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/therapist/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "发送失败");
        return;
      }

      toast.success("验证码已发送到您的邮箱");
      setStep(3);

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
      toast.error("发送失败，请稍后重试");
      console.error("发送错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 步骤3：验证验证码并重置密码
  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      toast.error("请填写完整信息");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("密码至少需要6位");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/therapist/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "重置失败");
        return;
      }

      toast.success("密码重置成功，请登录");
      onClose();
      // 重置状态
      setStep(1);
      setUsername("");
      setEmail("");
      setCode("");
      setNewPassword("");
      onSwitchToLogin();
    } catch (error) {
      toast.error("重置失败，请稍后重试");
      console.error("重置错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      type="blur"
      animationType="scale"
      showCloseButton
      showEscText={false}
      borderBottom={false}
      className="bg-black/95 backdrop-blur-xl border-gray-800 sm:max-w-md"
    >
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-cyan/10 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-primary-cyan" />
          </div>
          <h2 className="text-3xl font-bold text-primary-cyan mb-2">找回密码</h2>
          <p className="text-gray-400">请按照以下步骤重置您的密码</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? "text-primary-cyan" : "text-gray-500"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? "border-primary-cyan bg-primary-cyan/20" : "border-gray-500"}`}
            >
              1
            </div>
            <span className="text-xs hidden sm:inline">用户名</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-700 mx-2"></div>
          <div
            className={`flex items-center gap-2 ${step >= 2 ? "text-primary-cyan" : "text-gray-500"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? "border-primary-cyan bg-primary-cyan/20" : "border-gray-500"}`}
            >
              2
            </div>
            <span className="text-xs hidden sm:inline">验证邮箱</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-700 mx-2"></div>
          <div
            className={`flex items-center gap-2 ${step >= 3 ? "text-primary-cyan" : "text-gray-500"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? "border-primary-cyan bg-primary-cyan/20" : "border-gray-500"}`}
            >
              3
            </div>
            <span className="text-xs hidden sm:inline">重置密码</span>
          </div>
        </div>

        {/* 步骤1：输入用户名 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="forgot-username" className="text-gray-300">
                用户名
              </Label>
              <Input
                id="forgot-username"
                placeholder="请输入您的用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheckUsername()}
                className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleCheckUsername}
              className="w-full bg-gradient-to-r bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold"
              disabled={loading}
            >
              {loading ? "查询中..." : "下一步"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* 步骤2：输入邮箱 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-300">请输入您注册时填写的邮箱</p>
              <p className="text-sm text-blue-400 mt-1">提示：{emailHint}</p>
            </div>

            <div>
              <Label htmlFor="forgot-email" className="text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  邮箱
                </div>
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="请输入完整邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleSendCode}
              className="w-full bg-gradient-to-r bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold"
              disabled={loading || countdown > 0}
            >
              {countdown > 0 ? `${countdown}秒后可重新发送` : loading ? "发送中..." : "发送验证码"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full border-gray-700 text-gray-300 hover:bg-white/5"
            >
              上一步
            </Button>
          </div>
        )}

        {/* 步骤3：输入验证码和新密码 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">验证码已发送</span>
              </div>
              <p className="text-xs text-gray-400">发送到：{email}</p>
              <p className="text-xs text-gray-400 mt-1">请查收邮件，验证码5分钟内有效</p>
            </div>

            <div>
              <Label htmlFor="forgot-code" className="text-gray-300">
                验证码
              </Label>
              <Input
                id="forgot-code"
                placeholder="请输入6位验证码"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500 text-center text-lg tracking-widest"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="forgot-new-password" className="text-gray-300">
                新密码
              </Label>
              <div className="relative">
                <Input
                  id="forgot-new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入新密码（至少6位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleResetPassword}
              className="w-full bg-gradient-to-r bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold"
              disabled={loading}
            >
              {loading ? "重置中..." : "重置密码"}
            </Button>

            <Button
              variant="outline"
              onClick={handleSendCode}
              className="w-full border-gray-700 text-gray-300 hover:bg-white/5"
              disabled={loading || countdown > 0}
            >
              {countdown > 0 ? `${countdown}秒后可重新发送` : "重新发送验证码"}
            </Button>
          </div>
        )}

        {/* 底部提示 */}
        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-800">
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-primary-cyan hover:underline font-medium"
          >
            返回登录
          </button>
        </div>
      </div>
    </Modal>
  );
}
