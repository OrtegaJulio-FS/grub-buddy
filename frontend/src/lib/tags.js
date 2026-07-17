// Shared tag vocabulary for reviews. Free-form for now (reviews.tags is just
// a TEXT[] column, no enum enforced by the backend) - fine at this scale,
// but worth turning into a real lookup table if tag search/autocomplete
// becomes a feature.
export const REVIEW_TAGS = [
  'Cozy',
  'Good for groups',
  'Quiet',
  'Date night',
  'Quick bite',
  'Pet friendly',
];
