/**
 * useKeycloakMemberCounts
 * Fetches member counts for all organizations in parallel.
 * Returns a Map<orgId, memberCount> for use in summary cards.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

const BASE = KEYCLOAK_ADMIN_API_URL;
const REFRESH_INTERVAL = 60_000;

interface UseKeycloakMemberCountsOptions {
  orgIds: string[];
  enabled?: boolean;
}

interface UseKeycloakMemberCountsReturn {
  /** Map from orgId → member count */
  counts: Map<string, number>;
  /** Total users across all orgs */
  totalUsers: number;
  loading: boolean;
}

export const useKeycloakMemberCounts = ({
  orgIds,
  enabled = true,
}: UseKeycloakMemberCountsOptions): UseKeycloakMemberCountsReturn => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable serialized key for orgIds to avoid unnecessary refetches
  const orgIdsKey = useMemo(() => [...orgIds].sort().join(","), [orgIds]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchCounts = useCallback(async (silent = false) => {
    if (!enabled || orgIds.length === 0) return;

    if (!silent) setLoading(true);

    const newCounts = new Map<string, number>();
    const CONCURRENCY = 6;
    let idx = 0;

    async function worker() {
      while (idx < orgIds.length) {
        const i = idx++;
        const orgId = orgIds[i];
        try {
          // Keycloak Members API: GET /organizations/{id}/members
          // We only need the count, fetch with max=1 and read array length or use HEAD
          const res = await authenticatedFetch(
            `${BASE}/organizations/${orgId}/members?first=0&max=500`
          );
          if (res.ok) {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const data = await res.json();
              newCounts.set(orgId, Array.isArray(data) ? data.length : 0);
            } else {
              newCounts.set(orgId, 0);
            }
          } else {
            newCounts.set(orgId, 0);
          }
        } catch {
          newCounts.set(orgId, 0);
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(CONCURRENCY, orgIds.length) },
      () => worker()
    );
    await Promise.all(workers);

    if (!mountedRef.current) return;

    setCounts((prev) => {
      // Only update if changed
      let changed = prev.size !== newCounts.size;
      if (!changed) {
        newCounts.forEach((v, k) => {
          if (prev.get(k) !== v) changed = true;
        });
      }
      return changed ? newCounts : prev;
    });

    if (!silent) setLoading(false);
  }, [orgIds, orgIdsKey, enabled, authenticatedFetch]);

  useEffect(() => {
    fetchCounts(false);
  }, [fetchCounts]);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(() => fetchCounts(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, fetchCounts]);

  const totalUsers = useMemo(() => {
    let total = 0;
    counts.forEach((v) => { total += v; });
    return total;
  }, [counts]);

  return { counts, totalUsers, loading };
};
