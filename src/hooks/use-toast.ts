"use client";

import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const message = title || description || "";
    const fullMessage = title && description ? `${title}: ${description}` : message;

    switch (variant) {
      case "destructive":
        sonnerToast.error(fullMessage);
        break;
      case "success":
        sonnerToast.success(fullMessage);
        break;
      default:
        sonnerToast(fullMessage);
        break;
    }
  };

  return { toast };
}
