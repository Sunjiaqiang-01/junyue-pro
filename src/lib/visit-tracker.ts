// 访问统计工具函数

/**
 * 记录网站页面访问
 * @param page 页面路径
 * @param referrer 来源页面
 */
export const trackSiteVisit = async (page: string, referrer?: string) => {
  try {
    await fetch("/api/visit/site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page,
        referrer: referrer || document.referrer || undefined,
      }),
    });
  } catch (error) {
    console.error("记录网站访问失败:", error);
  }
};

/**
 * 记录技师浏览
 * @param therapistId 技师ID
 * @param referrer 来源页面
 */
export const trackTherapistView = async (therapistId: string, referrer?: string) => {
  try {
    await fetch("/api/visit/therapist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        therapistId,
        referrer: referrer || document.referrer || undefined,
      }),
    });
  } catch (error) {
    console.error("记录技师浏览失败:", error);
  }
};

/**
 * 自动记录页面访问的Hook
 * @param page 页面路径
 */
export const usePageVisitTracker = (page: string) => {
  if (typeof window !== "undefined") {
    // 页面加载时记录访问
    trackSiteVisit(page);
  }
};
