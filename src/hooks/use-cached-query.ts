import { useEffect, useState } from "react";

type Loader<T> = () => Promise<T>;

/**
 * Stale-while-revalidate cache for Supabase reads.
 * - Returns cached data instantly (from sessionStorage) — no spinner on revisit.
 * - Re-fetches in background to keep data fresh.
 */
export function useCachedQuery<T>(key: string, loader: Loader<T>, fallback: T) {
  const [data, setData] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = sessionStorage.getItem(`q:${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    let active = true;
    loader()
      .then((res) => {
        if (!active) return;
        setData(res);
        try {
          sessionStorage.setItem(`q:${key}`, JSON.stringify(res));
        } catch {
          /* quota or serialization issue — ignore */
        }
      })
      .catch(() => {
        /* keep cached/fallback */
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return data;
}
