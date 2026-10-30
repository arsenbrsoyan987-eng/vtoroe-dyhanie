import { createCollection } from './collection';
import { events as seedEvents } from '../data/events';
import { publishedOr } from '../data/published';
import type { Event } from '../types';

export const eventsStore = createCollection<Event>(
  'db_events',
  publishedOr<Event>('events', seedEvents)
);

export const useEvents = eventsStore.useAll;