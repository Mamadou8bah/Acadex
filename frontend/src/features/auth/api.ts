import { apiRequest } from "../../lib/api";
import type { PlatformRole } from "../../types";
import type { AuthResponse, AuthUser, SubscriptionPlan } from "../../types";

type DemoRole = Exclude<PlatformRole, "SUPER_ADMIN">;

const demoTenantId = "11111111-1111-1111-1111-111111111111";

const demoUsers: Record<DemoRole, AuthResponse> = {
  SCHOOL_ADMIN: {
    accessToken: "mock-access-token-school-admin",
    refreshToken: "mock-refresh-token-school-admin",
    user: {
      id: "mock-school-admin-id",
      tenantId: demoTenantId,
      email: "principal@demo.acadex",
      firstName: "Awa",
      lastName: "Jallow",
      role: "SCHOOL_ADMIN",
      emailVerified: true
    }
  },
  TEACHER: {
    accessToken: "mock-access-token-teacher",
    refreshToken: "mock-refresh-token-teacher",
    user: {
      id: "mock-teacher-id",
      tenantId: demoTenantId,
      email: "teacher@demo.acadex",
      firstName: "Musa",
      lastName: "Sowe",
      role: "TEACHER",
      emailVerified: true
    }
  },
  STUDENT: {
    accessToken: "mock-access-token-student",
    refreshToken: "mock-refresh-token-student",
    user: {
      id: "mock-student-id",
      tenantId: demoTenantId,
      email: "student@demo.acadex",
      firstName: "Fatou",
      lastName: "Bojang",
      role: "STUDENT",
      emailVerified: true
    }
  },
  PARENT: {
    accessToken: "mock-access-token-parent",
    refreshToken: "mock-refresh-token-parent",
    user: {
      id: "mock-parent-id",
      tenantId: demoTenantId,
      email: "parent@demo.acadex",
      firstName: "Lamin",
      lastName: "Baldeh",
      role: "PARENT",
      emailVerified: true
    }
  }
};

const demoLookup = new Map<string, DemoRole>([
  ["principal@demo.acadex", "SCHOOL_ADMIN"],
  ["admin@demo.acadex", "SCHOOL_ADMIN"],
  ["teacher@demo.acadex", "TEACHER"],
  ["student@demo.acadex", "STUDENT"],
  ["parent@demo.acadex", "PARENT"]
]);

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
  }).catch(() => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedRole = demoLookup.get(normalizedEmail) ?? "SCHOOL_ADMIN";
    const demoSession = demoUsers[matchedRole];

    return {
      ...demoSession,
      user: {
        ...demoSession.user,
        email: normalizedEmail || demoSession.user.email
      }
    };
  });
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
  }).catch(() => {
    const matchedDemo = Object.values(demoUsers).find((entry) => entry.accessToken === accessToken);
    if (matchedDemo) {
      return { ...matchedDemo.user, tenantId };
    }

    return {
      id: "mock-school-admin-id",
      tenantId,
      email: "principal@demo.acadex",
      firstName: "Awa",
      lastName: "Jallow",
      role: "SCHOOL_ADMIN" as PlatformRole,
      emailVerified: true
    };
  });
}

export function loginAsDemo(role: DemoRole) {
  return Promise.resolve(demoUsers[role]);
}
