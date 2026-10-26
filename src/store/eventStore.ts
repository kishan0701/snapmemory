/**
 * eventStore.ts
 *
 * Zustand store that manages:
 * 1. User-created events (with localStorage persistence).
 * 2. Uploaded photos & videos (with IndexedDB backing & auto stats calculation).
 * 3. Creator Approval Queue (pending photos submitted by guests/attendees).
 * 4. Contributor Upload Requests.
 * 5. Precomputed AI face embeddings cache for instant face recognition.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, EventType, EventPrivacy, Media, Album, UploadRequest, UploadRequestStatus, User } from '@/types';
import { MOCK_EVENTS, getMediaForEvent as getMockMedia, getAlbumsForEvent as getMockAlbums, MOCK_UPLOAD_REQUESTS } from '@/data/mockData';
import { saveMediaData, deleteMediaData, saveFaceDescriptors, getMediaData } from '@/services/mediaStorage';
import {
  uploadMediaToSupabase,
  updateMediaApprovalInSupabase,
  saveFaceDescriptorsInSupabase,
  createUploadRequestInSupabase
} from '@/services/supabase';

export interface EventStoreState {
  /** User-created events */
  userEvents: Event[];
  /** User-uploaded media */
  userMedia: Media[];
  /** User-created albums */
  userAlbums: Album[];
  /** Contributor upload requests */
  uploadRequests: UploadRequest[];

  // ─── Event Methods ───
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
    owner_id?: string;
  }) => string;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  getAllEvents: () => Event[];

  // ─── Media & Upload Methods ───
  addMedia: (item: Omit<Media, 'id' | 'created_at'>) => Promise<Media>;
  approveMedia: (mediaId: string) => Promise<void>;
  rejectMedia: (mediaId: string) => Promise<void>;
  approveAllPendingMedia: (eventId: string) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  updateMediaFaceDescriptors: (mediaId: string, descriptors: number[][]) => void;
  getEventMedia: (eventId: string, includePending?: boolean) => Media[];
  getPendingMediaForEvent: (eventId: string) => Media[];

  // ─── Album Methods ───
  getEventAlbums: (eventId: string) => Album[];
  addAlbum: (eventId: string, name: string, description?: string) => Album;

  // ─── Contributor Request Methods ───
  createUploadRequest: (data: {
    event_id: string;
    requester: User;
    message?: string;
    selected_album_id?: string;
  }) => UploadRequest;
  approveUploadRequest: (requestId: string) => void;
  rejectUploadRequest: (requestId: string) => void;
  getUploadRequestsForEvent: (eventId: string) => UploadRequest[];
}

export const useEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      userEvents: [],
      userMedia: [],
      userAlbums: [],
      uploadRequests: [],

      // ─── Event Implementation ───
      createEvent: (data) => {
        const id = `evt-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();

        const newEvent: Event = {
          id,
          owner_id: data.owner_id ?? 'user-1',
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
          photo_count: 0,
          video_count: 0,
          album_count: 0,
          contributor_count: 0,
          guest_count: 0,
          storage_used: 0,
          view_count: 1,
          download_count: 0,
          current_user_role: 'owner',
        };

        set((state) => ({ userEvents: [newEvent, ...state.userEvents] }));
        return id;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          userEvents: state.userEvents.map((e) =>
            e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          userEvents: state.userEvents.filter((e) => e.id !== id),
          userMedia: state.userMedia.filter((m) => m.event_id !== id),
          uploadRequests: state.uploadRequests.filter((r) => r.event_id !== id),
        }));
      },

      getEventById: (id) => {
        if (!id) return undefined;
        // First check user events, then fall back to mock events
        return get().userEvents.find((e) => e.id === id) || MOCK_EVENTS.find((e) => e.id === id);
      },

      getAllEvents: () => {
        return [...get().userEvents, ...MOCK_EVENTS];
      },

      // ─── Media Implementation ───
      addMedia: async (item) => {
        const id = `med-usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();

        // Save image blob/dataUrl to IndexedDB for persistent offline storage
        if (item.original_url && !item.original_url.startsWith('http')) {
          saveMediaData(id, item.original_url).catch(() => {});
        }

        // Save face descriptors to IndexedDB
        if (item.face_descriptors && item.face_descriptors.length > 0) {
          saveFaceDescriptors(id, item.face_descriptors).catch(() => {});
        }

        const newMedia: Media = {
          ...item,
          id,
          created_at: now,
          preview_url: item.preview_url || item.original_url,
          thumbnail_url: item.thumbnail_url || item.original_url,
          approval_status: item.approval_status || 'approved',
          is_approved: item.approval_status === 'approved',
          favorite_count: 0,
          download_count: 0,
          processing_status: 'ready',
        };

        // If approved right away (e.g. host upload), update event counts
        if (newMedia.approval_status === 'approved') {
          set((state) => ({
            userMedia: [newMedia, ...state.userMedia],
            userEvents: state.userEvents.map((e) => {
              if (e.id === newMedia.event_id) {
                return {
                  ...e,
                  photo_count: (e.photo_count ?? 0) + (newMedia.type === 'photo' ? 1 : 0),
                  video_count: (e.video_count ?? 0) + (newMedia.type === 'video' ? 1 : 0),
                  storage_used: (e.storage_used ?? 0) + newMedia.size,
                };
              }
              return e;
            }),
          }));
        } else {
          // Add to pending media
          set((state) => ({
            userMedia: [newMedia, ...state.userMedia],
          }));
        }

        // Sync with Supabase in background if configured
        uploadMediaToSupabase(newMedia).catch(() => {});

        return newMedia;
      },

      approveMedia: async (mediaId) => {
        const media = get().userMedia.find((m) => m.id === mediaId);
        if (!media) return;

        set((state) => ({
          userMedia: state.userMedia.map((m) =>
            m.id === mediaId ? { ...m, approval_status: 'approved', is_approved: true } : m
          ),
          userEvents: state.userEvents.map((e) => {
            if (e.id === media.event_id && media.approval_status !== 'approved') {
              return {
                ...e,
                photo_count: (e.photo_count ?? 0) + (media.type === 'photo' ? 1 : 0),
                video_count: (e.video_count ?? 0) + (media.type === 'video' ? 1 : 0),
                storage_used: (e.storage_used ?? 0) + media.size,
              };
            }
            return e;
          }),
        }));

        updateMediaApprovalInSupabase(mediaId, 'approved').catch(() => {});
      },

      rejectMedia: async (mediaId) => {
        const media = get().userMedia.find((m) => m.id === mediaId);
        if (!media) return;

        set((state) => ({
          userMedia: state.userMedia.map((m) =>
            m.id === mediaId ? { ...m, approval_status: 'rejected', is_approved: false } : m
          ),
        }));

        updateMediaApprovalInSupabase(mediaId, 'rejected').catch(() => {});
      },

      approveAllPendingMedia: async (eventId) => {
        const pending = get().userMedia.filter(
          (m) => m.event_id === eventId && m.approval_status === 'pending'
        );
        if (pending.length === 0) return;

        const photoAdd = pending.filter((m) => m.type === 'photo').length;
        const videoAdd = pending.filter((m) => m.type === 'video').length;
        const sizeAdd = pending.reduce((sum, m) => sum + m.size, 0);

        set((state) => ({
          userMedia: state.userMedia.map((m) =>
            m.event_id === eventId && m.approval_status === 'pending'
              ? { ...m, approval_status: 'approved', is_approved: true }
              : m
          ),
          userEvents: state.userEvents.map((e) => {
            if (e.id === eventId) {
              return {
                ...e,
                photo_count: (e.photo_count ?? 0) + photoAdd,
                video_count: (e.video_count ?? 0) + videoAdd,
                storage_used: (e.storage_used ?? 0) + sizeAdd,
              };
            }
            return e;
          }),
        }));

        pending.forEach((m) => updateMediaApprovalInSupabase(m.id, 'approved').catch(() => {}));
      },

      deleteMedia: async (mediaId) => {
        const media = get().userMedia.find((m) => m.id === mediaId);
        if (media) {
          deleteMediaData(mediaId).catch(() => {});
          set((state) => ({
            userMedia: state.userMedia.filter((m) => m.id !== mediaId),
            userEvents: state.userEvents.map((e) => {
              if (e.id === media.event_id && media.approval_status === 'approved') {
                return {
                  ...e,
                  photo_count: Math.max(0, (e.photo_count ?? 0) - (media.type === 'photo' ? 1 : 0)),
                  video_count: Math.max(0, (e.video_count ?? 0) - (media.type === 'video' ? 1 : 0)),
                  storage_used: Math.max(0, (e.storage_used ?? 0) - media.size),
                };
              }
              return e;
            }),
          }));
        }
      },

      updateMediaFaceDescriptors: (mediaId, descriptors) => {
        saveFaceDescriptors(mediaId, descriptors).catch(() => {});
        saveFaceDescriptorsInSupabase(mediaId, descriptors).catch(() => {});

        set((state) => ({
          userMedia: state.userMedia.map((m) =>
            m.id === mediaId ? { ...m, face_descriptors: descriptors } : m
          ),
        }));
      },

      getEventMedia: (eventId, includePending = false) => {
        const userItems = get().userMedia.filter((m) => {
          if (m.event_id !== eventId) return false;
          if (includePending) return true;
          return m.approval_status === 'approved';
        });

        const mockItems = getMockMedia(eventId);
        return [...userItems, ...mockItems];
      },

      getPendingMediaForEvent: (eventId) => {
        return get().userMedia.filter(
          (m) => m.event_id === eventId && m.approval_status === 'pending'
        );
      },

      // ─── Albums Implementation ───
      getEventAlbums: (eventId) => {
        const userAlbs = get().userAlbums.filter((a) => a.event_id === eventId);
        const mockAlbs = getMockAlbums(eventId);
        return [...userAlbs, ...mockAlbs];
      },

      addAlbum: (eventId, name, description) => {
        const id = `alb-usr-${Date.now()}`;
        const newAlbum: Album = {
          id,
          event_id: eventId,
          name,
          description,
          visibility: 'public',
          sort_order: 10,
          created_at: new Date().toISOString(),
          media_count: 0,
        };

        set((state) => ({
          userAlbums: [newAlbum, ...state.userAlbums],
          userEvents: state.userEvents.map((e) =>
            e.id === eventId ? { ...e, album_count: (e.album_count ?? 0) + 1 } : e
          ),
        }));

        return newAlbum;
      },

      // ─── Contributor Request Implementation ───
      createUploadRequest: (data) => {
        const id = `req-usr-${Date.now()}`;
        const newRequest: UploadRequest = {
          id,
          event_id: data.event_id,
          requester_id: data.requester.id,
          requester: data.requester,
          message: data.message,
          selected_album_id: data.selected_album_id,
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          uploadRequests: [newRequest, ...state.uploadRequests],
        }));

        createUploadRequestInSupabase(newRequest).catch(() => {});
        return newRequest;
      },

      approveUploadRequest: (requestId) => {
        set((state) => ({
          uploadRequests: state.uploadRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'approved' as UploadRequestStatus, reviewed_at: new Date().toISOString() }
              : r
          ),
        }));
      },

      rejectUploadRequest: (requestId) => {
        set((state) => ({
          uploadRequests: state.uploadRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'rejected' as UploadRequestStatus, reviewed_at: new Date().toISOString() }
              : r
          ),
        }));
      },

      getUploadRequestsForEvent: (eventId) => {
        const userReqs = get().uploadRequests.filter((r) => r.event_id === eventId);
        const mockReqs = MOCK_UPLOAD_REQUESTS.filter((r) => r.event_id === eventId);
        return [...userReqs, ...mockReqs];
      },
    }),
    {
      name: 'snapmemory-state-store',
      // Persist events, media metadata, albums, and requests
      partialize: (state) => ({
        userEvents: state.userEvents,
        userMedia: state.userMedia.map(m => ({
          ...m,
          // If original_url is a giant dataUrl, truncate preview to save space
          // IndexedDB holds the actual full data
          preview_url: m.preview_url?.slice(0, 500),
        })),
        userAlbums: state.userAlbums,
        uploadRequests: state.uploadRequests,
      }),
    }
  )
);
