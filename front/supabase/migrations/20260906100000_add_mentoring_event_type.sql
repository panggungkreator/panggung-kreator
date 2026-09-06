-- Add mentoring to events_event_type_check constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE events ADD CONSTRAINT events_event_type_check CHECK (
  event_type = ANY (ARRAY[
    'open_mic'::text,
    'sharing_session'::text,
    'networking'::text,
    'level_up'::text,
    'speech_practice'::text,
    'mc_practice'::text,
    'voice_over'::text,
    'workshop'::text,
    'content_class'::text,
    'branding_class'::text,
    'mentoring'::text,
    'lainnya'::text
  ])
);
