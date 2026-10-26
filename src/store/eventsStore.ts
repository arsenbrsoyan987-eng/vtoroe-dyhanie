import { createCollection } from './collection';
import { events as seedEvents } from '../data/events';
import type { Event } from '../types';

export const eventsStore = createCollection<Event>('db_events', seedEvents);

export const useEvents = eventsStore.useAll;
