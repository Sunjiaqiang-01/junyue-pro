"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Loader2,
  Copy,
  Check,
  Download,
  Maximize2,
  X as CloseIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CustomerServiceButtonProps {
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
}

interface CustomerServiceData {
  wechatQrCode: string;
  wechatId: string | null;
  phone: string | null;
  workingHours: string;
}

export default function CustomerServiceButton({
  variant = "floating",
  size = "md",
}: CustomerServiceButtonProps) {
  const [open, setOpen] = useState(false);
  const [customerService, setCustomerService] = useState<CustomerServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedWechat, setCopiedWechat] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [fullscreenQR, setFullscreenQR] = useState(false);

  // 复制微信号
  const copyWechat = async () => {
    if (customerService?.wechatId) {
      await navigator.clipboard.writeText(customerService.wechatId);
      setCopiedWechat(true);
      setTimeout(() => setCopiedWechat(false), 2000);
    }
  };

  // 复制电话号码
  const copyPhone = async () => {
    if (customerService?.phone) {
      await navigator.clipboard.writeText(customerService.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // 下载二维码
  const downloadQRCode = async () => {
    if (!customerService?.wechatQrCode) return;

    try {
      const response = await fetch(customerService.wechatQrCode);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "君悦SPA客服微信二维码.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("下载二维码失败:", error);
    }
  };

  // 当弹窗打开时获取客服信息
  useEffect(() => {
    if (open && !customerService) {
      fetchCustomerService();
    }
  }, [open]);

  // 监听自定义事件，从导航栏触发客服弹窗（防重复打开）
  useEffect(() => {
    const handleOpenCustomerService = () => {
      // 只有在关闭状态才打开，防止重复
      if (!open) {
        setOpen(true);
      }
    };

    window.addEventListener("openCustomerService", handleOpenCustomerService);

    return () => {
      window.removeEventListener("openCustomerService", handleOpenCustomerService);
    };
  }, [open]); // 依赖 open 状态

  const fetchCustomerService = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer-services");
      const data = await res.json();

      if (data.success) {
        setCustomerService(data.data);
      } else {
        setError(data.error || "获取客服信息失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "floating") {
    return (
      <>
        {/* 悬浮按钮 */}
        <button onClick={() => setOpen(true)} className="fixed bottom-8 right-8 z-50 group">
          <div className="relative">
            {/* 脉冲动画背景 */}
            <div className="absolute inset-0 rounded-full bg-primary-cyan animate-ping opacity-75" />

            {/* 按钮主体 */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-pure-white shadow-2xl hover:shadow-primary-cyan/30 transition-all duration-300 group-hover:scale-110">
              <MessageCircle className="w-8 h-8 text-pure-black" />
            </div>
          </div>

          {/* 提示文字 */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/90 text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium">
              联系客服预约
            </div>
          </div>
        </button>

        {/* 客服弹窗 */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-pure-black border-white/5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-pure-white">
                联系客服预约
              </DialogTitle>
            </DialogHeader>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchCustomerService} variant="outline">
                  重试
                </Button>
              </div>
            ) : customerService ? (
              <div className="space-y-6 py-4">
                {/* 微信二维码 */}
                <div className="flex flex-col items-center">
                  {/* 二维码图片 */}
                  <div className="relative w-64 h-64 mb-3 rounded-2xl overflow-hidden border-2 border-white/10">
                    <Image
                      src={customerService.wechatQrCode}
                      alt="客服微信二维码"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 操作按钮（固定显示） */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                      title="下载二维码"
                    >
                      <Download className="w-4 h-4 text-primary-cyan" />
                      <span className="text-sm text-white font-medium">下载</span>
                    </button>
                    <button
                      onClick={() => setFullscreenQR(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                      title="全屏查看"
                    >
                      <Maximize2 className="w-4 h-4 text-primary-cyan" />
                      <span className="text-sm text-white font-medium">全屏</span>
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm">扫描二维码添加客服微信</p>
                  {customerService.wechatId && (
                    <div className="flex items-center justify-center gap-2 mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-primary-cyan font-medium">
                        微信号：{customerService.wechatId}
                      </p>
                      <button
                        onClick={copyWechat}
                        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                        title="复制微信号"
                      >
                        {copiedWechat ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-secondary/60 hover:text-primary-cyan" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 其他联系方式 */}
                {(customerService.phone || customerService.workingHours) && (
                  <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
                    {customerService.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">客服电话</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{customerService.phone}</span>
                          <button
                            onClick={copyPhone}
                            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                            title="复制电话号码"
                          >
                            {copiedPhone ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-secondary/60 hover:text-primary-cyan" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {customerService.workingHours && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">工作时间</span>
                        <span className="text-white font-medium">
                          {customerService.workingHours}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 提示信息 */}
                <div className="p-4 rounded-xl bg-transparent border border-white/5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    💡 添加客服微信后，请告知您看中的技师编号或姓名，客服将为您安排预约服务。
                  </p>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* 全屏查看二维码 */}
        {fullscreenQR && customerService && (
          <div
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setFullscreenQR(false)}
          >
            <div className="relative max-w-2xl w-full p-8">
              {/* 关闭按钮 */}
              <button
                onClick={() => setFullscreenQR(false)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                title="关闭"
              >
                <CloseIcon className="w-6 h-6 text-white" />
              </button>

              {/* 二维码图片 */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl mb-6">
                <Image
                  src={customerService.wechatQrCode}
                  alt="客服微信二维码"
                  fill
                  className="object-cover"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadQRCode();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-cyan text-pure-black font-medium rounded-lg hover:bg-primary-cyan/90 transition-all duration-200 shadow-lg shadow-primary-cyan/30"
                >
                  <Download className="w-5 h-5" />
                  下载二维码
                </button>
                {customerService.wechatId && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white font-medium">
                      微信号：{customerService.wechatId}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyWechat();
                      }}
                      className="p-2 rounded-md hover:bg-white/10 transition-colors"
                      title="复制微信号"
                    >
                      {copiedWechat ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-secondary/60 hover:text-primary-cyan" />
                      )}
                    </button>
                  </div>
                )}
                <p className="text-gray-400 text-sm">点击空白处关闭</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 内联按钮
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={`bg-pure-white text-pure-black hover:bg-secondary/90 font-medium rounded-full shadow-lg hover:shadow-primary-cyan/30 transition-all duration-300 ${sizeClasses[size]}`}
      >
        <MessageCircle className="mr-2" />
        联系客服预约
      </Button>

      {/* 客服弹窗（同上） */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-pure-black border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-pure-white">
              联系客服预约
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchCustomerService} variant="outline">
                重试
              </Button>
            </div>
          ) : customerService ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center">
                {/* 二维码图片 */}
                <div className="relative w-64 h-64 mb-3 rounded-2xl overflow-hidden border-2 border-white/10">
                  <Image
                    src={customerService.wechatQrCode}
                    alt="客服微信二维码"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 操作按钮（固定显示） */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                    title="下载二维码"
                  >
                    <Download className="w-4 h-4 text-primary-cyan" />
                    <span className="text-sm text-white font-medium">下载</span>
                  </button>
                  <button
                    onClick={() => setFullscreenQR(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                    title="全屏查看"
                  >
                    <Maximize2 className="w-4 h-4 text-primary-cyan" />
                    <span className="text-sm text-white font-medium">全屏</span>
                  </button>
                </div>

                <p className="text-gray-400 text-sm">扫描二维码添加客服微信</p>
                {customerService.wechatId && (
                  <div className="flex items-center justify-center gap-2 mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-primary-cyan font-medium">
                      微信号：{customerService.wechatId}
                    </p>
                    <button
                      onClick={copyWechat}
                      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                      title="复制微信号"
                    >
                      {copiedWechat ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-secondary/60 hover:text-primary-cyan" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {(customerService.phone || customerService.workingHours) && (
                <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
                  {customerService.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">客服电话</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{customerService.phone}</span>
                        <button
                          onClick={copyPhone}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="复制电话号码"
                        >
                          {copiedPhone ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-secondary/60 hover:text-primary-cyan" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {customerService.workingHours && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">工作时间</span>
                      <span className="text-white font-medium">{customerService.workingHours}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-xl bg-transparent border border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  💡 添加客服微信后，请告知您看中的技师编号或姓名，客服将为您安排预约服务。
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 全屏查看二维码 */}
      {fullscreenQR && customerService && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setFullscreenQR(false)}
        >
          <div className="relative max-w-2xl w-full p-8">
            {/* 关闭按钮 */}
            <button
              onClick={() => setFullscreenQR(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
              title="关闭"
            >
              <CloseIcon className="w-6 h-6 text-white" />
            </button>

            {/* 二维码图片 */}
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl mb-6">
              <Image
                src={customerService.wechatQrCode}
                alt="客服微信二维码"
                fill
                className="object-cover"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadQRCode();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary-cyan text-pure-black font-medium rounded-lg hover:bg-primary-cyan/90 transition-all duration-200 shadow-lg shadow-primary-cyan/30"
              >
                <Download className="w-5 h-5" />
                下载二维码
              </button>
              {customerService.wechatId && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white font-medium">微信号：{customerService.wechatId}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyWechat();
                    }}
                    className="p-2 rounded-md hover:bg-white/10 transition-colors"
                    title="复制微信号"
                  >
                    {copiedWechat ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-secondary/60 hover:text-primary-cyan" />
                    )}
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-sm">点击空白处关闭</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
