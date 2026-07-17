-- Seeds the fake user used by src/middleware/fakeUser.js (id=1) so that logs/spots
-- created through the no-auth routes satisfy their foreign key constraints.
INSERT INTO users (id, name, email, password_hash, city)
VALUES (1, 'Test User', 'test@grubbuds.dev', 'not-a-real-hash', 'Des Moines')
ON CONFLICT (id) DO NOTHING;

-- Keep the sequence in sync since we inserted an explicit id.
SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 1) FROM users));

-- Dev/demo spots for the frontend to render against - real rows via the real
-- API, just seeded rather than entered by hand through the UI (there's no
-- "add a spot" screen yet). Cover photos are stable picsum.photos placeholders.
-- Guarded by name so re-running this file doesn't create duplicates.
INSERT INTO spots (name, category, address, lat, lng, cover_photo_url, created_by, city)
SELECT * FROM (VALUES
  ('Django Coffee', 'cafe', '100 Locust St', 41.5883, -93.6217, 'https://picsum.photos/seed/django-coffee/800/600', 1, 'Des Moines'),
  ('Scenic Route Bakery', 'bakery', '1912 Ingersoll Ave', 41.5804, -93.6444, 'https://picsum.photos/seed/scenic-route/800/600', 1, 'Des Moines'),
  ('Centro', 'restaurant', '1011 Locust St', 41.5872, -93.6238, 'https://picsum.photos/seed/centro-dsm/800/600', 1, 'Des Moines'),
  ('El Bait Shop', 'bar', '200 SW 2nd St', 41.5805, -93.6236, 'https://picsum.photos/seed/bait-shop/800/600', 1, 'Des Moines'),
  ('Horizon Line Coffee', 'cafe', '620 SW 5th St', 41.5822, -93.6265, 'https://picsum.photos/seed/horizon-line/800/600', 1, 'Des Moines'),
  ('Flour Child Bakeshop', 'bakery', '4700 University Ave', 41.5988, -93.5905, NULL, 1, 'Des Moines')
) AS v(name, category, address, lat, lng, cover_photo_url, created_by, city)
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE spots.name = v.name);

-- A handful of logs so the Feed/Spot pages have real ratings and at least one
-- spot shows the visit stamp for the fake user (id=1). Guarded so re-running
-- this file doesn't pile up duplicate logs.
INSERT INTO logs (user_id, spot_id, visited_at, rating, quick_note)
SELECT 1, s.id, v.visited_at::timestamptz, v.rating, v.quick_note
FROM (VALUES
  ('Django Coffee', now() - interval '3 days', 5, 'Cortado was perfect, went back for a second.'),
  ('Django Coffee', now() - interval '20 days', 4, NULL),
  ('Centro', now() - interval '10 days', 5, 'Sunday brunch special, worth the wait.'),
  ('El Bait Shop', now() - interval '2 days', 3, 'Solid beer list, food was just okay.')
) AS v(spot_name, visited_at, rating, quick_note)
JOIN spots s ON s.name = v.spot_name
WHERE NOT EXISTS (
  SELECT 1 FROM logs WHERE logs.user_id = 1 AND logs.spot_id = s.id AND logs.quick_note IS NOT DISTINCT FROM v.quick_note
);
