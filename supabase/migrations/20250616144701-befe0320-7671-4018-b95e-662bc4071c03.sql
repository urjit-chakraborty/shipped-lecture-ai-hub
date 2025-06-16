
-- Update lecture events to use minimalistic naming convention
UPDATE public.events 
SET title = CASE 
  WHEN event_date = '2025-06-16 17:00:00+00' THEN 'Week 1 Lecture'
  WHEN event_date = '2025-06-23 17:00:00+00' THEN 'Week 2 Lecture'
  WHEN event_date = '2025-06-30 17:00:00+00' THEN 'Week 3 Lecture'
  WHEN event_date = '2025-07-07 17:00:00+00' THEN 'Week 4 Lecture'
  WHEN event_date = '2025-07-14 17:00:00+00' THEN 'Week 5 Lecture'
  WHEN event_date = '2025-07-21 17:00:00+00' THEN 'Week 6 Lecture'
END
WHERE event_type = 'Lecture';

-- Update fireside chat events to use minimalistic naming convention
UPDATE public.events 
SET title = CASE 
  WHEN event_date = '2025-06-19 17:00:00+00' THEN 'Week 1 Fireside Chat'
  WHEN event_date = '2025-06-26 17:00:00+00' THEN 'Week 2 Fireside Chat'
  WHEN event_date = '2025-07-03 17:00:00+00' THEN 'Week 3 Fireside Chat'
  WHEN event_date = '2025-07-10 17:00:00+00' THEN 'Week 4 Fireside Chat'
  WHEN event_date = '2025-07-17 17:00:00+00' THEN 'Week 5 Fireside Chat'
  WHEN event_date = '2025-07-24 17:00:00+00' THEN 'Week 6 Fireside Chat'
END
WHERE event_type = 'Fireside Chat';
