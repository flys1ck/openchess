import { QueryClient } from "@tanstack/vue-query";

export default new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Lichess rate-limits aggressively; repeated retries on a 429 only extend the lockout.
      retry: 1,
    },
  },
});
