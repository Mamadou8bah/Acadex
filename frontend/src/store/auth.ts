import { create } from "zustand";
import type { AuthUser } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  tenantId: null,
  user: null,
  setSession: (accessToken, refreshToken, user) =>
    set({ accessToken, refreshToken, tenantId: user.tenantId, user }),
  clearSession: () => set({ accessToken: null, refreshToken: null, tenantId: null, user: null })
}));
