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
