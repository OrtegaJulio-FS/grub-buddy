// Aggregates logs (each with a required 1-5 rating) into display-ready stats.
// There's no aggregate endpoint on the backend yet, so this is computed
// client-side from raw /logs rows - fine at current data volumes, but if the
// log table grows large this should move server-side (e.g. a GROUP BY in
// spot.model.js or a dedicated /spots/:id/stats endpoint).
export function summarizeLogs(logs) {
  if (!logs || logs.length === 0) {
    return { average: null, count: 0 };
  }
  const total = logs.reduce((sum, log) => sum + Number(log.rating), 0);
  return { average: total / logs.length, count: logs.length };
}

export function groupLogsBySpot(logs) {
  const map = new Map();
  for (const log of logs) {
    const key = String(log.spot_id);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(log);
  }
  return map;
}

// Ranks a set of logs (typically one user's) by spot: highest average rating
// first, ties broken by visit count then by most recent visit. Used by the
// Profile page's Top Spots section.
export function rankSpotsByRating(logs) {
  const grouped = groupLogsBySpot(logs);
  const ranked = [];

  for (const [spotId, spotLogs] of grouped) {
    const { average, count } = summarizeLogs(spotLogs);
    const mostRecentVisit = spotLogs.reduce(
      (latest, log) => (!latest || new Date(log.visited_at) > new Date(latest) ? log.visited_at : latest),
      null
    );
    ranked.push({ spotId, average, count, mostRecentVisit });
  }

  ranked.sort((a, b) => {
    if (b.average !== a.average) return b.average - a.average;
    if (b.count !== a.count) return b.count - a.count;
    return new Date(b.mostRecentVisit) - new Date(a.mostRecentVisit);
  });

  return ranked;
}
