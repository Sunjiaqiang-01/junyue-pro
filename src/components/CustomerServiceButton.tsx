"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-gold to-yellow-600 animate-ping opacity-75" />

            {/* 按钮主体 */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-gold to-yellow-600 shadow-2xl hover:shadow-primary-gold/50 transition-all duration-300 group-hover:scale-110">
              <MessageCircle className="w-8 h-8 text-white" />
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
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-gold">
                联系客服预约
              </DialogTitle>
            </DialogHeader>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
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
                  <div className="relative w-64 h-64 mb-4 rounded-2xl overflow-hidden border-2 border-primary-gold/30">
                    <Image
                      src={customerService.wechatQrCode}
                      alt="客服微信二维码"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-gray-400 text-sm">扫描二维码添加客服微信</p>
                  {customerService.wechatId && (
                    <p className="text-primary-gold font-medium mt-2">
                      微信号：{customerService.wechatId}
                    </p>
                  )}
                </div>

                {/* 其他联系方式 */}
                {(customerService.phone || customerService.workingHours) && (
                  <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    {customerService.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">客服电话</span>
                        <span className="text-white font-medium">{customerService.phone}</span>
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
                <div className="p-4 rounded-xl bg-primary-gold/10 border border-primary-gold/30">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    💡 添加客服微信后，请告知您看中的技师编号或姓名，客服将为您安排预约服务。
                  </p>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
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
        className={`bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold text-white font-bold rounded-full shadow-lg hover:shadow-primary-gold/50 transition-all duration-300 ${sizeClasses[size]}`}
      >
        <MessageCircle className="mr-2" />
        联系客服预约
      </Button>

      {/* 客服弹窗（同上） */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-gold">联系客服预约</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
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
                <div className="relative w-64 h-64 mb-4 rounded-2xl overflow-hidden border-2 border-primary-gold/30">
                  <Image
                    src={customerService.wechatQrCode}
                    alt="客服微信二维码"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-gray-400 text-sm">扫描二维码添加客服微信</p>
                {customerService.wechatId && (
                  <p className="text-primary-gold font-medium mt-2">
                    微信号：{customerService.wechatId}
                  </p>
                )}
              </div>

              {(customerService.phone || customerService.workingHours) && (
                <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                  {customerService.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">客服电话</span>
                      <span className="text-white font-medium">{customerService.phone}</span>
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

              <div className="p-4 rounded-xl bg-primary-gold/10 border border-primary-gold/30">
                <p className="text-sm text-gray-300 leading-relaxed">
                  💡 添加客服微信后，请告知您看中的技师编号或姓名，客服将为您安排预约服务。
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
