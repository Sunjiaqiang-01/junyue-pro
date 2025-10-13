"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// 动态导入Markdown编辑器（避免SSR问题）
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
});

export default function AdminGuidePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("必看攻略");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    try {
      const response = await fetch("/api/guide");
      const data = await response.json();

      if (data.success) {
        setTitle(data.data.title);
        setContent(data.data.content);
      }
    } catch (error) {
      console.error("获取攻略失败:", error);
      toast.error("获取攻略失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content || content.trim() === "") {
      toast.error("内容不能为空");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/guide", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("保存成功");
      } else {
        toast.error(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-gold to-yellow-600 bg-clip-text text-transparent mb-2">
              编辑必看攻略
            </h1>
            <p className="text-gray-400">使用Markdown格式编写攻略内容</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>

        {/* 标题输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-800 text-white focus:border-primary-gold focus:outline-none"
            placeholder="必看攻略"
          />
        </div>

        {/* Markdown编辑器 */}
        <div
          className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          data-color-mode="dark"
        >
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || "")}
            height={600}
            preview="live"
            hideToolbar={false}
            enableScroll={true}
            visibleDragbar={true}
          />
        </div>

        {/* Markdown语法提示 */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-gold mb-3">Markdown语法提示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="mb-1">
                <code className="text-primary-gold"># 一级标题</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">## 二级标题</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">**加粗文本**</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">*斜体文本*</code>
              </p>
            </div>
            <div>
              <p className="mb-1">
                <code className="text-primary-gold">- 无序列表项</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">1. 有序列表项</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">[链接文字](url)</code>
              </p>
              <p className="mb-1">
                <code className="text-primary-gold">---</code> 分隔线
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
