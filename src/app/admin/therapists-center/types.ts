// 技师管理中心类型定义
import { ServiceType } from "@prisma/client";

export interface TherapistWithRelations {
  id: string;
  username: string;
  nickname: string;
  phone: string | null;
  email: string | null;
  age: number;
  height: number;
  weight: number;
  cardValue: string | null;
  city: string;
  areas: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  auditReason: string | null;
  isOnline: boolean;
  lastOnlineAt: Date | null;
  isNew: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  auditedAt: Date | null;
  profile: {
    id: string;
    introduction: string;
    specialties: string[];
    serviceType: ServiceType[];
  } | null;
  photos: Array<{
    id: string;
    isPrimary: boolean;
    url: string;
    mediumUrl: string | null;
    isVideo: boolean;
  }>;
  _count?: {
    photos: number;
    videos: number;
  };
}

export interface DeactivationRequestWithRelations {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewerId: string | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  requestedAt: Date;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  therapist: {
    id: string;
    username: string;
    nickname: string;
    phone: string | null;
    city: string;
  };
}

export type TabType = "all" | "pending" | "deactivation";
