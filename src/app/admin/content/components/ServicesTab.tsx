"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, Power, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import ProvinceCitySelector from "@/components/ProvinceCitySelector";

interface City {
  id: string;
  name: string;
}

interface CustomerServiceCity {
  id: string;
  city: City;
}

interface CustomerService {
  id: string;
  name: string;
  wechatQrCode: string;
  wechatId: string | null;
  qq: string | null;
  workingHours: string;
  isActive: boolean;
  order: number;
  cityId: string | null;
  city: City | null;
  cities: CustomerServiceCity[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ServiceForm {
  name: string;
  cityNames: string[];
  wechatQrCode: string;
  wechatId: string;
  qq: string;
  workingHours: string;
}

interface ServicesTabProps {
  initialData: CustomerService[];
}

export function ServicesTab({ initialData }: ServicesTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<CustomerService | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<ServiceForm>({
    name: "",
    cityNames: [],
    wechatQrCode: "",
    wechatId: "",
    qq: "",
    workingHours: "9:00 - 22:00",
  });

  const handleAdd = () => {
    setEditingService(null);
    setForm({
      name: "",
      cityNames: [],
      wechatQrCode: "",
      wechatId: "",
      qq: "",
      workingHours: "9:00 - 22:00",
    });
    setShowDialog(true);
  };

  const handleEdit = (service: CustomerService) => {
    setEditingService(service);
    setForm({
      name: service.name,
      cityNames: service.cities?.map((c) => c.city.name) || [],
      wechatQrCode: service.wechatQrCode,
      wechatId: service.wechatId || "",
      qq: service.qq || "",
      workingHours: service.workingHours,
    });
    setShowDialog(true);
  };

  const handleQrCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "customer-service-qr");

      const res = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setForm({ ...form, wechatQrCode: data.url });
        toast({
          title: "成功",
          description: "二维码上传成功",
        });
      } else {
        toast({
          title: "错误",
          description: data.error || "上传失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingService
        ? `/api/admin/customer-services/${editingService.id}`
        : "/api/admin/customer-services";

      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          cityNames: form.cityNames,
          wechatQrCode: form.wechatQrCode,
          wechatId: form.wechatId || null,
          qq: form.qq || null,
          workingHours: form.workingHours,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "成功",
          description: editingService ? "更新成功" : "添加成功",
        });
        setShowDialog(false);
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "操作失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customer-services/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "成功",
          description: data.message,
        });
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "操作失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/customer-services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "成功",
          description: "删除成功",
        });
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "删除失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-pure-white">客服配置</h2>
          <p className="text-xs md:text-sm text-secondary/60 mt-1">管理平台客服信息和联系方式</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加客服
        </Button>
      </div>

      {/* 客服列表表格 */}
      <div className="rounded-md border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                客服名称
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                负责城市
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                微信号
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                QQ号
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                工作时间
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                状态
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm text-right">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="text-center text-secondary/60 py-12">
                  暂无客服配置，点击"添加客服"来创建
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((service) => (
                <TableRow key={service.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white text-xs md:text-sm">
                    {service.name}
                  </TableCell>
                  <TableCell>
                    {service.cities && service.cities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {service.cities.map((sc) => (
                          <Badge
                            key={sc.id}
                            className="bg-primary-cyan/20 text-primary-cyan border-primary-cyan/30 text-xs"
                          >
                            {sc.city.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-secondary/60 text-xs md:text-sm">全国服务</span>
                    )}
                  </TableCell>
                  <TableCell className="text-white text-xs md:text-sm">
                    {service.wechatId || "-"}
                  </TableCell>
                  <TableCell className="text-white text-xs md:text-sm">
                    {service.qq || "-"}
                  </TableCell>
                  <TableCell className="text-white text-xs md:text-sm">
                    {service.workingHours}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        service.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                          : "bg-white/10 text-secondary/60 border-white/20 text-xs"
                      }
                    >
                      {service.isActive ? "启用" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleToggle(service.id)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
                      >
                        <Power className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
                      >
                        <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setServiceToDelete(service.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 text-xs"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 添加/编辑Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-pure-white text-xl">
              {editingService ? "编辑客服" : "添加客服"}
            </DialogTitle>
            <DialogDescription className="text-secondary/60">
              配置客服信息和微信二维码
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                客服名称
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：小李客服、张客服"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">负责城市（可多选）</Label>

              {form.cityNames.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  {form.cityNames.map((cityName, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-cyan/20 text-primary-cyan border border-primary-cyan/30 text-sm rounded-full"
                    >
                      {cityName}
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            cityNames: form.cityNames.filter((_, i) => i !== index),
                          })
                        }
                        className="hover:bg-primary-cyan/30 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <ProvinceCitySelector
                value=""
                onChange={(city) => {
                  if (city && !form.cityNames.includes(city)) {
                    setForm({ ...form, cityNames: [...form.cityNames, city] });
                  }
                }}
                placeholder="点击选择城市"
              />
              <p className="text-xs text-secondary/60">
                不选择城市将为全国服务客服，可选择多个城市
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">微信二维码（必填）</Label>
              {form.wechatQrCode && (
                <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-primary-cyan/30 bg-white">
                  <Image
                    src={form.wechatQrCode}
                    alt="客服微信二维码"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleQrCodeUpload}
                disabled={uploadingQr}
                className="hidden"
                id="qr-upload"
              />
              <label
                htmlFor="qr-upload"
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary-cyan transition-colors text-white ${uploadingQr ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploadingQr ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary-cyan" />
                    <span>上传中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>{form.wechatQrCode ? "更换二维码" : "上传二维码"}</span>
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wechatId" className="text-white">
                  微信号
                </Label>
                <Input
                  id="wechatId"
                  value={form.wechatId}
                  onChange={(e) => setForm({ ...form, wechatId: e.target.value })}
                  placeholder="填写可选客服微信号"
                  className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qq" className="text-white">
                  客服QQ号
                </Label>
                <Input
                  id="qq"
                  value={form.qq}
                  onChange={(e) => setForm({ ...form, qq: e.target.value })}
                  placeholder="填写可选客服QQ号"
                  className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours" className="text-white">
                工作时间
              </Label>
              <Input
                id="workingHours"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                placeholder="例如：9:00 - 22:00"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setShowDialog(false)}
                className="border border-white/10 text-white hover:bg-white/10 bg-transparent"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.name || !form.wechatQrCode || !form.workingHours}
                className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "确认保存"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pure-white">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/60">
              此操作不可撤销。确定要删除这个客服吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-white/10 text-white hover:bg-white/10 bg-transparent">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && handleDelete(serviceToDelete)}
              disabled={deleting}
              className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
