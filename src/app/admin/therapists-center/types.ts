// 技师管理中心类型定义

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
  profile?: {
    id: string;
    introduction: string;
    specialties: string[];
    serviceType: string[];
  };
  photos: Array<{
    id: string;
    isPrimary: boolean;
    mediumUrl: string;
  }>;
  _count?: {
    photos: number;
    videos: number;
  };
}

export interface DeactivationRequestWithRelations {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date;
  processedAt: Date | null;
  adminNote: string | null;
  therapist: {
    id: string;
    username: string;
    nickname: string;
    phone: string | null;
    city: string;
  };
}

export type TabType = "all" | "pending" | "deactivation";
