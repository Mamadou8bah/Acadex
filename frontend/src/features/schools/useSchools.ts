import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import type { PageResponse, School } from "../../types";

export function useSchools() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const tenantId = useAuthStore((state) => state.tenantId);

  return useQuery({
    queryKey: ["schools"],
    enabled: Boolean(accessToken && tenantId),
    queryFn: () =>
      apiRequest<PageResponse<School>>({
        path: "/platform/schools?page=0&size=20",
        accessToken,
        tenantId
      })
  });
}
