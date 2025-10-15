/**
 * 前端视频处理工具
 * 使用HTML5 Video API和Canvas API生成视频缩略图
 * 完全不依赖FFmpeg，在浏览器中运行
 */

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

export interface VideoProcessResult {
  thumbnail: string; // Base64格式的缩略图
  info: VideoInfo;
}

/**
 * 生成视频缩略图
 * @param videoFile 视频文件
 * @param timePercent 截取时间点（0-1之间，默认0.3即30%位置）
 * @returns Promise<string> Base64格式的缩略图
 */
export const generateVideoThumbnail = async (
  videoFile: File,
  timePercent: number = 0.3
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("无法创建Canvas上下文"));
      return;
    }

    video.preload = "metadata";
    video.muted = true; // 静音以避免自动播放限制

    video.onloadedmetadata = () => {
      // 设置画布尺寸，最大800x600
      const maxWidth = 800;
      const maxHeight = 600;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      let canvasWidth = videoWidth;
      let canvasHeight = videoHeight;

      // 按比例缩放
      if (videoWidth > maxWidth) {
        canvasWidth = maxWidth;
        canvasHeight = (videoHeight * maxWidth) / videoWidth;
      }
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = (canvasWidth * maxHeight) / canvasHeight;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 跳转到指定时间点
      video.currentTime = video.duration * timePercent;
    };

    video.onseeked = () => {
      try {
        // 绘制视频帧到画布
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 添加播放按钮叠加
        drawPlayButton(ctx, canvas.width, canvas.height);

        // 转换为WebP格式（如果支持）或JPEG
        const thumbnailUrl =
          canvas.toDataURL("image/webp", 0.8) || canvas.toDataURL("image/jpeg", 0.8);

        resolve(thumbnailUrl);
      } catch (error) {
        reject(new Error("生成缩略图失败: " + error));
      } finally {
        // 清理资源
        URL.revokeObjectURL(video.src);
      }
    };

    video.onerror = () => {
      reject(new Error("视频加载失败，请检查文件格式"));
    };

    video.ontimeupdate = () => {
      // 防止无限循环
      if (Math.abs(video.currentTime - video.duration * timePercent) < 0.1) {
        video.pause();
      }
    };

    // 开始加载视频
    video.src = URL.createObjectURL(videoFile);
  });
};

/**
 * 获取视频信息
 * @param videoFile 视频文件
 * @returns Promise<VideoInfo> 视频信息
 */
export const getVideoInfo = async (videoFile: File): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      const info: VideoInfo = {
        duration: Math.round(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
        size: videoFile.size,
        type: videoFile.type,
      };

      resolve(info);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error("无法读取视频信息"));
    };

    video.src = URL.createObjectURL(videoFile);
  });
};

/**
 * 处理视频文件（生成缩略图 + 获取信息）
 * @param videoFile 视频文件
 * @returns Promise<VideoProcessResult> 处理结果
 */
export const processVideo = async (videoFile: File): Promise<VideoProcessResult> => {
  try {
    const [thumbnail, info] = await Promise.all([
      generateVideoThumbnail(videoFile),
      getVideoInfo(videoFile),
    ]);

    return { thumbnail, info };
  } catch (error) {
    throw new Error("视频处理失败: " + error);
  }
};

/**
 * 生成多个时间点的缩略图，选择最佳的一个
 * @param videoFile 视频文件
 * @returns Promise<string> 最佳缩略图
 */
export const generateBestThumbnail = async (videoFile: File): Promise<string> => {
  const timePoints = [0.1, 0.3, 0.5, 0.7]; // 多个时间点
  const thumbnails: { thumbnail: string; clarity: number }[] = [];

  for (const timePoint of timePoints) {
    try {
      const thumbnail = await generateVideoThumbnail(videoFile, timePoint);
      const clarity = await calculateImageClarity(thumbnail);
      thumbnails.push({ thumbnail, clarity });
    } catch (error) {
      console.warn(`生成时间点 ${timePoint} 的缩略图失败:`, error);
    }
  }

  if (thumbnails.length === 0) {
    throw new Error("无法生成任何缩略图");
  }

  // 返回最清晰的缩略图
  thumbnails.sort((a, b) => b.clarity - a.clarity);
  return thumbnails[0].thumbnail;
};

/**
 * 计算图像清晰度（简单的方差算法）
 * @param imageDataUrl Base64图像数据
 * @returns Promise<number> 清晰度分数
 */
const calculateImageClarity = async (imageDataUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      if (!ctx) {
        resolve(0);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 计算灰度方差作为清晰度指标
      let sum = 0;
      let sumSquare = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += gray;
        sumSquare += gray * gray;
      }

      const mean = sum / pixelCount;
      const variance = sumSquare / pixelCount - mean * mean;
      resolve(variance);
    };

    img.onerror = () => resolve(0);
    img.src = imageDataUrl;
  });
};

/**
 * 在画布上绘制播放按钮
 * @param ctx Canvas上下文
 * @param width 画布宽度
 * @param height 画布高度
 */
const drawPlayButton = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.08; // 响应式大小

  // 绘制半透明圆形背景
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制白色边框
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 绘制播放三角形
  ctx.fillStyle = "white";
  ctx.beginPath();
  const triangleSize = radius * 0.6;
  ctx.moveTo(centerX - triangleSize * 0.4, centerY - triangleSize * 0.6);
  ctx.lineTo(centerX - triangleSize * 0.4, centerY + triangleSize * 0.6);
  ctx.lineTo(centerX + triangleSize * 0.8, centerY);
  ctx.closePath();
  ctx.fill();
};

/**
 * 将Base64转换为Blob
 * @param dataUrl Base64数据URL
 * @returns Blob对象
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

/**
 * 格式化视频时长
 * @param seconds 秒数
 * @returns 格式化的时长字符串 (mm:ss)
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
