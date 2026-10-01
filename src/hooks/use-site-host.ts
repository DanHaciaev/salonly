"use client";

import { useEffect, useState } from "react";

/**
 * Current deployment's host (e.g. "salonly-nu.vercel.app"), for display only
 * — starts with a generic fallback so server and client render the same
 * markup on first paint, then swaps in the real `window.location.host`
 * after mount (this value doesn't exist on the server).
 */
export function useSiteHost() {
  const [host, setHost] = useState("yourdomain.com");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window.location only exists in the browser; this is the standard post-mount sync to avoid a hydration mismatch
    setHost(window.location.host);
  }, []);

  return host;
}
