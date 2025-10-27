"use client";

import { useEffect } from "react";

interface PageVisitTrackerProps {
  page: string;
}

export default function PageVisitTracker({ page }: PageVisitTrackerProps) {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch("/api/visit/site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page,
            referrer: typeof document !== "undefined" ? document.referrer : undefined,
          }),
        });
      } catch (error) {
        // 静默失败，不影响用户体验
        console.debug("访问记录失败:", error);
      }
    };

    trackVisit();
  }, [page]);

  return null; // 不渲染任何内容
}
