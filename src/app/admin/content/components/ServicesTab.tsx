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
  cityId: string | null;
  city: City | null;
  name: string;
  wechatQrCode: string;
  wechatId: string | null;
  phone: string | null;
  workingHours: string;
  isActive: boolean;
  priority: number;
  cities: CustomerServiceCity[];
}

interface ServiceForm {
  cityNames: string[];
  name: string;
  wechatQrCode: string;
  wechatId: string;
  phone: string;
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
    cityNames: [],
    name: "",
    wechatQrCode: "",
    wechatId: "",
    phone: "",
    workingHours: "9:00 - 22:00",
  });

  const handleAdd = () => {
    setEditingService(null);
    setForm({
      cityNames: [],
      name: "",
      wechatQrCode: "",
      wechatId: "",
      phone: "",
      workingHours: "9:00 - 22:00",
    });
    setShowDialog(true);
  };

  const handleEdit = (service: CustomerService) => {
    setEditingService(service);
    setForm({
      cityNames: service.cities?.map((c) => c.city.name) || [],
      name: service.name,
      wechatQrCode: service.wechatQrCode,
      wechatId: service.wechatId || "",
      phone: service.phone || "",
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
          cityNames: form.cityNames,
          name: form.name,
          wechatQrCode: form.wechatQrCode,
          wechatId: form.wechatId || null,
          phone: form.phone || null,
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
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">客服配置</h2>
          <p className="text-sm text-muted-foreground">管理平台客服信息和联系方式</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加客服
        </Button>
      </div>

      {/* 客服列表表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客服名称</TableHead>
              <TableHead>服务城市</TableHead>
              <TableHead>微信号</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>工作时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  暂无客服配置，点击"添加客服"来创建
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    {service.cities && service.cities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {service.cities.map((sc) => (
                          <Badge key={sc.id} variant="outline">
                            {sc.city.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">全国服务</span>
                    )}
                  </TableCell>
                  <TableCell>{service.wechatId || "-"}</TableCell>
                  <TableCell>{service.phone || "-"}</TableCell>
                  <TableCell>{service.workingHours}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "启用" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(service.id)}>
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setServiceToDelete(service.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "编辑客服" : "添加客服"}</DialogTitle>
            <DialogDescription>配置客服信息和微信二维码</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>负责城市（可多选）</Label>

              {form.cityNames.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                  {form.cityNames.map((cityName, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full"
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
                        className="hover:bg-primary/30 rounded-full p-0.5"
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
              <p className="text-xs text-muted-foreground">
                不选择城市将为全国服务客服，可选择多个城市
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">客服名称</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：小李客服、张客服"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>微信二维码</Label>
              {form.wechatQrCode && (
                <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-primary/30">
                  <Image
                    src={form.wechatQrCode}
                    alt="客服微信二维码"
                    fill
                    className="object-cover"
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
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${uploadingQr ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploadingQr ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
                <Label htmlFor="wechatId">微信号</Label>
                <Input
                  id="wechatId"
                  value={form.wechatId}
                  onChange={(e) => setForm({ ...form, wechatId: e.target.value })}
                  placeholder="填写可选客服微信号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">客服电话</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="填写可选客服电话"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">工作时间</Label>
              <Input
                id="workingHours"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                placeholder="如例如：9:00 - 22:00"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.name || !form.wechatQrCode || !form.workingHours}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销。确定要删除这个客服吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && handleDelete(serviceToDelete)}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
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
