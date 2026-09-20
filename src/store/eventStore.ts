/**
 * eventStore.ts
 *
 * An in-memory Zustand store that holds user-created events (during the
 * current browser session). These events are merged with the demo MOCK_EVENTS
 * so the Dashboard and other pages can display both together.
 *
 * When Supabase is wired up, this store will be replaced by real API calls.
 */

import { create } from 'zustand';
import type { Event, EventType, EventPrivacy } from '@/types';
import { CURRENT_USER } from '@/data/mockData';

export interface EventStoreState {
  /** User-created events (this session only — no photos until uploaded) */
  userEvents: Event[];
  /** Create a new blank event and return its generated ID */
  createEvent: (data: {
    title: string;
    type: EventType;
    date: string;
    location: string;
    description: string;
    cover_url: string;
    privacy: EventPrivacy;
    access_code?: string;
    allow_contributor_requests: boolean;
    allow_downloads: boolean;
    enable_find_my_photos: boolean;
    expiry_at?: string;
  }) => string;
  /** Get an event by ID (returns undefined if not found) */
  getEventById: (id: string) => Event | undefined;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  userEvents: [],

  createEvent: (data) => {
    const id = `evt-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const newEvent: Event = {
      id,
      owner_id: CURRENT_USER.id,
      title: data.title,
      type: data.type,
      date: data.date,
      location: data.location,
      description: data.description,
      cover_url: data.cover_url,
      privacy: data.privacy,
      allow_contributor_requests: data.allow_contributor_requests,
      allow_downloads: data.allow_downloads,
      enable_find_my_photos: data.enable_find_my_photos,
      expiry_at: data.expiry_at || undefined,
      created_at: now,
      updated_at: now,
      // Start with zeroed counts — no media until user uploads
      photo_count: 0,
      video_count: 0,
      album_count: 0,
      contributor_count: 0,
      guest_count: 0,
      storage_used: 0,
      view_count: 0,
      download_count: 0,
      current_user_role: 'owner',
    };

    set((state) => ({ userEvents: [newEvent, ...state.userEvents] }));
    return id;
  },

  getEventById: (id) => {
    return get().userEvents.find((e) => e.id === id);
  },
}));
