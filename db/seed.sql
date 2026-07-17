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

-- Social layer needs more than one real user to mean anything - the app
-- still only ever acts AS user id=1 (fakeUser middleware), but follows,
-- the activity feed, and friends-first sorting all need other real users
-- with their own logs/reviews to follow and see activity from.
INSERT INTO users (id, name, email, password_hash, bio, city)
VALUES
  (2, 'Priya Nair', 'priya@grubbuds.dev', 'not-a-real-hash', 'Always hunting for the best cortado in town.', 'Des Moines'),
  (3, 'Marcus Webb', 'marcus@grubbuds.dev', 'not-a-real-hash', 'Bar food connoisseur, professional brunch attendee.', 'Des Moines'),
  (4, 'Dana Osei', 'dana@grubbuds.dev', 'not-a-real-hash', 'Bakery-first, always.', 'Des Moines')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 1) FROM users));

-- Logs for the new users, spread across existing seeded spots.
INSERT INTO logs (user_id, spot_id, visited_at, rating, quick_note)
SELECT v.user_id, s.id, v.visited_at::timestamptz, v.rating, v.quick_note
FROM (VALUES
  (2, 'Django Coffee', now() - interval '1 day', 5, 'Best cortado in Des Moines, hands down.'),
  (2, 'Horizon Line Coffee', now() - interval '5 days', 4, 'Good but a bit slow at rush hour.'),
  (3, 'El Bait Shop', now() - interval '4 days', 4, 'Great wing night.'),
  (3, 'Centro', now() - interval '8 days', 5, 'Best brunch in the East Village.'),
  (4, 'Scenic Route Bakery', now() - interval '2 days', 5, 'Their sourdough is unreal.'),
  (4, 'Flour Child Bakeshop', now() - interval '6 days', 4, 'Solid croissants.')
) AS v(user_id, spot_name, visited_at, rating, quick_note)
JOIN spots s ON s.name = v.spot_name
WHERE NOT EXISTS (
  SELECT 1 FROM logs WHERE logs.user_id = v.user_id AND logs.spot_id = s.id AND logs.quick_note IS NOT DISTINCT FROM v.quick_note
);

-- A few reviews from the new users - gives friends-first sorting and the
-- activity feed real "review" entries, not just "log" entries.
INSERT INTO reviews (log_id, body, rating, tags)
SELECT l.id, v.body, v.rating, v.tags
FROM (VALUES
  (2, 'Django Coffee', 'This is easily the best espresso bar in the metro - the baristas know what they''re doing and the space is cozy without being cramped.', 5, ARRAY['Cozy', 'Quick bite']),
  (3, 'Centro', 'Brunch here is a religious experience. Get the shakshuka and thank me later.', 5, ARRAY['Good for groups', 'Date night']),
  (4, 'Scenic Route Bakery', 'Their sourdough sells out by 10am for a reason. Get there early.', 5, ARRAY['Quiet'])
) AS v(user_id, spot_name, body, rating, tags)
JOIN spots s ON s.name = v.spot_name
JOIN logs l ON l.user_id = v.user_id AND l.spot_id = s.id
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE reviews.log_id = l.id);

-- User 1 (the fake current user) follows Priya and Marcus but not Dana -
-- gives "Trusted by friends" and friends-first sorting something to
-- correctly include AND something to correctly exclude.
INSERT INTO follows (follower_id, followed_id)
VALUES (1, 2), (1, 3)
ON CONFLICT DO NOTHING;
