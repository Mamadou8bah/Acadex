import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import type { Announcement, PageResponse } from "../../types";

export function useAnnouncements() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const tenantId = useAuthStore((state) => state.tenantId);

  return useQuery({
    queryKey: ["announcements", tenantId],
    enabled: Boolean(accessToken && tenantId),
    queryFn: () =>
      apiRequest<PageResponse<Announcement>>({
        path: "/announcements?page=0&size=20",
        accessToken,
        tenantId
      })
  });
}
