"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
});

interface Guide {
  id: string;
  title: string;
  content: string;
}

interface GuideTabProps {
  initialData: Guide | null;
}

export function GuideTab({ initialData }: GuideTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState(initialData?.content || "");
  const [title, setTitle] = useState(initialData?.title || "使用指南");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content || content.trim() === "") {
      toast({
        title: "错误",
        description: "内容不能为空",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/guide", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "成功",
          description: "保存成功",
        });
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "保存失败",
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
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-pure-white">平台指南</h2>
          <p className="text-xs md:text-sm text-secondary/60 mt-1">
            编辑平台使用指南内容（支持Markdown格式）
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">
            标题
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入指南标题"
            className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">内容（Markdown格式）</Label>
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={600}
              preview="live"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
