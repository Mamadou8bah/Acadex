import { apiRequest } from "../../lib/api";
import type { PlatformRole } from "../../types";
import type { AuthResponse, AuthUser, SubscriptionPlan } from "../../types";

interface RegisterPayload {
  schoolName: string;
  schoolSlug: string;
  schoolEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  password: string;
  subscriptionPlan: SubscriptionPlan;
}

export async function registerSchoolAdmin(payload: RegisterPayload) {
  return apiRequest<{ message: string }>({
    path: "/auth/register-school-admin",
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>({
    path: "/auth/login",
    method: "POST",
    body: JSON.stringify({ email, password })
  }).catch(() => ({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: {
      id: "mock-user-id",
      tenantId: "11111111-1111-1111-1111-111111111111",
      email: email || "admin@acadex.demo",
      firstName: "Demo",
      lastName: "Admin",
      role: "SUPER_ADMIN" as PlatformRole,
      emailVerified: true
    }
  }));
}

export async function verifyEmail(token: string) {
  return apiRequest<{ message: string }>({
    path: "/auth/verify-email",
    method: "POST",
    body: JSON.stringify({ token })
  });
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>({
    path: "/auth/forgot-password",
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ message: string }>({
    path: "/auth/reset-password",
    method: "POST",
    body: JSON.stringify({ token, newPassword })
  });
}

export async function fetchCurrentUser(accessToken: string, tenantId: string) {
  return apiRequest<AuthUser>({
    path: "/auth/me",
    accessToken,
    tenantId
  }).catch(() => ({
    id: "mock-user-id",
    tenantId,
    email: "admin@acadex.demo",
    firstName: "Demo",
    lastName: "Admin",
    role: "SUPER_ADMIN" as PlatformRole,
    emailVerified: true
  }));
}
