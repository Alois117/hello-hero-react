import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchHosts,
  fetchHostsSilent,
  selectHosts,
  selectHostsLoading,
  selectHostsError,
  selectHostsLastUpdated,
  Host,
} from "@/store/slices/hostsSlice";
import type { AppDispatch } from "@/store";

const REFRESH_INTERVAL = 120000; // 2 minutes

export type { Host };

export const useHosts = () => {
  const dispatch = useDispatch<AppDispatch>();

  const hosts = useSelector(selectHosts);
  const isLoading = useSelector(selectHostsLoading);
  const error = useSelector(selectHostsError);
  const lastUpdatedTimestamp = useSelector(selectHostsLastUpdated);

  const initializedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // Initial load (cache-first)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (hosts.length === 0) {
      dispatch(fetchHosts()); // show loading only if no cache
    } else {
      dispatch(fetchHostsSilent()); // silent refresh if cache exists
    }
  }, [dispatch, hosts.length]);

  // Silent auto-refresh
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (hosts.length === 0) {
      dispatch(fetchHosts()); // show loading only if no cache
    } else {
      dispatch(fetchHostsSilent()); // silent refresh if cache exists
    }
  }, [dispatch, hosts.length]);

  // Silent auto-refresh
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      dispatch(fetchHostsSilent());
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  const refresh = useCallback(async () => {
    await dispatch(fetchHosts());
  }, [dispatch]);

  return {
    hosts,
    isLoading,
    error,
    lastUpdated: lastUpdatedTimestamp
      ? new Date(lastUpdatedTimestamp)
      : null,
    refresh,
  };
};
