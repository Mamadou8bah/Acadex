import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import type { AnalyticsSummary } from "../../types";

export function useAnalytics() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const tenantId = useAuthStore((state) => state.tenantId);

  return useQuery({
    queryKey: ["analytics-summary", tenantId],
    enabled: Boolean(accessToken && tenantId),
    queryFn: () =>
      apiRequest<AnalyticsSummary>({
        path: "/analytics/summary",
        accessToken,
        tenantId
      })
  });
}
