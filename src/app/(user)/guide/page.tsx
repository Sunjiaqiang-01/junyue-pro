"use client";

import { useEffect, useState } from "react";
import ResizableNavigation from "@/components/ResizableNavigation";
import PageContainer from "@/components/PageContainer";
import CustomerServiceButton from "@/components/CustomerServiceButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GuideData {
  title: string;
  content: string;
  updatedAt: string;
}

export default function GuidePage() {
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    try {
      const response = await fetch("/api/guide");
      const data = await response.json();

      if (data.success) {
        setGuide(data.data);
      } else {
        toast.error("获取攻略失败");
      }
    } catch (error) {
      console.error("获取攻略失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* 导航栏 */}
      <ResizableNavigation />

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-gold to-yellow-600 bg-clip-text text-transparent mb-2">
              {guide?.title || "必看攻略"}
            </h1>
            {guide?.updatedAt && (
              <p className="text-gray-400 text-sm">
                最后更新：{new Date(guide.updatedAt).toLocaleString("zh-CN")}
              </p>
            )}
          </div>

          {/* 内容区域 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
            </div>
          ) : guide ? (
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-10 shadow-2xl">
              <div
                className="guide-content prose prose-invert prose-lg max-w-none 
                prose-headings:font-bold
                prose-headings:drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]
                prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 prose-h1:first:mt-0
                prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                prose-p:leading-relaxed prose-p:mb-4
                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-black/20 prose-blockquote:py-2
                prose-code:bg-black/50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-yellow-400
                prose-hr:my-8
              "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-2xl border border-gray-800">
              <p className="text-gray-400 text-lg">暂无攻略内容</p>
            </div>
          )}
        </div>
      </div>

      {/* 悬浮客服按钮 */}
      <CustomerServiceButton variant="floating" />
    </PageContainer>
  );
}
