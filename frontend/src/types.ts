export type FeatureFlag =
  | "ENABLE_PARENT_PORTAL"
  | "ENABLE_FINANCE_MODULE"
  | "ENABLE_ANALYTICS"
  | "ENABLE_SMS_ALERTS"
  | "ENABLE_ATTENDANCE_ALERTS";

export type SubscriptionPlan = "STARTER" | "GROWTH" | "ENTERPRISE";
export type SchoolStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface School {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  subscriptionPlan: SubscriptionPlan;
  status: SchoolStatus;
  enabledFeatures: FeatureFlag[];
}

export type PlatformRole = "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: PlatformRole;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AnalyticsSummary {
  totalSchools: number;
  totalUsersForTenant: number;
  pendingNotificationsForTenant: number;
  announcementsForTenant: number;
}

export type AnnouncementAudience =
  | "SCHOOL_WIDE"
  | "TEACHERS"
  | "STUDENTS"
  | "PARENTS"
  | "CLASS_SPECIFIC";

export interface Announcement {
  id: string;
  tenantId: string;
  authorId: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
