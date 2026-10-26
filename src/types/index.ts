// ─── User & Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────
export type EventType =
  | 'Wedding'
  | 'College Event'
  | 'Birthday'
  | 'Corporate'
  | 'School Event'
  | 'Family Function'
  | 'Other';

export type EventPrivacy = 'public' | 'unlisted' | 'private' | 'password';

export interface Event {
  id: string;
  owner_id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  description: string;
  cover_url?: string;
  privacy: EventPrivacy;
  access_code_hash?: string;
  allow_contributor_requests: boolean;
  allow_downloads: boolean;
  enable_find_my_photos: boolean;
  expiry_at?: string;
  created_at: string;
  updated_at: string;
  // computed
  photo_count?: number;
  video_count?: number;
  album_count?: number;
  contributor_count?: number;
  guest_count?: number;
  storage_used?: number;
  view_count?: number;
  download_count?: number;
  current_user_role?: EventMemberRole;
}

// ─── Event Members ────────────────────────────────────────────────────────────
export type EventMemberRole = 'owner' | 'contributor' | 'guest';
export type EventMemberStatus = 'active' | 'pending' | 'revoked' | 'expired';

export interface EventMember {
  id: string;
  event_id: string;
  user_id: string;
  user?: User;
  role: EventMemberRole;
  status: EventMemberStatus;
  album_scope?: string[];
  expires_at?: string;
  created_at: string;
}

// ─── Albums ───────────────────────────────────────────────────────────────────
export type AlbumVisibility = 'public' | 'contributors_only' | 'private';

export interface Album {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  cover_media_id?: string;
  cover_url?: string;
  visibility: AlbumVisibility;
  sort_order: number;
  created_at: string;
  media_count?: number;
}

// ─── Media ────────────────────────────────────────────────────────────────────
export type MediaType = 'photo' | 'video';
export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Media {
  id: string;
  event_id: string;
  album_id?: string;
  uploader_id: string;
  uploader?: User;
  type: MediaType;
  original_url: string;
  preview_url?: string;
  thumbnail_url?: string;
  filename: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  hash?: string;
  processing_status: ProcessingStatus;
  created_at: string;
  is_favorited?: boolean;
  favorite_count?: number;
  download_count?: number;
  approval_status?: 'pending' | 'approved' | 'rejected';
  face_descriptors?: number[][];
  is_approved?: boolean;
  uploader_name?: string;
  uploader_email?: string;
  is_creator_upload?: boolean;
}

// ─── Upload Requests ──────────────────────────────────────────────────────────
export type UploadRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';

export interface UploadRequest {
  id: string;
  event_id: string;
  requester_id: string;
  requester?: User;
  message?: string;
  selected_album_id?: string;
  selected_album?: Album;
  status: UploadRequestStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  expires_at?: string;
  created_at: string;
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export interface Favorite {
  id: string;
  user_id: string;
  media_id: string;
  created_at: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType =
  | 'upload_request_received'
  | 'upload_request_approved'
  | 'upload_request_rejected'
  | 'contributor_access_revoked'
  | 'upload_completed'
  | 'upload_failed'
  | 'event_invitation'
  | 'event_expiry_approaching'
  | 'download_ready';

export interface Notification {
  id: string;
  user_id: string;
  event_id?: string;
  type: NotificationType;
  message: string;
  read_at?: string;
  created_at: string;
}

// ─── Download Logs ────────────────────────────────────────────────────────────
export interface DownloadLog {
  id: string;
  user_id: string;
  event_id: string;
  media_id: string;
  created_at: string;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  event_id: string;
  actor_id: string;
  actor?: User;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── Matching Sessions ────────────────────────────────────────────────────────
export type MatchingSessionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'deleted';

export interface MatchingSession {
  id: string;
  event_id: string;
  user_id: string;
  selfie_reference?: string;
  consent_status: boolean;
  status: MatchingSessionStatus;
  expires_at: string;
  created_at: string;
  results?: MatchingResult[];
}

export interface MatchingResult {
  media_id: string;
  media?: Media;
  confidence: number;
}

// ─── Upload Queue ─────────────────────────────────────────────────────────────
export type UploadStatus = 'waiting' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface UploadQueueItem {
  id: string;
  file: File;
  preview_url?: string;
  album_id?: string;
  caption?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  media?: Media;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface EventAnalytics {
  event_id: string;
  total_photos: number;
  total_videos: number;
  storage_used: number;
  total_uploads: number;
  total_downloads: number;
  total_views: number;
  active_contributors: number;
  pending_requests: number;
  failed_uploads: number;
  most_viewed_albums: { album: Album; views: number }[];
  most_downloaded_media: { media: Media; downloads: number }[];
  upload_activity: { date: string; count: number }[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────
export interface GalleryFilter {
  album_id?: string;
  media_type?: MediaType;
  uploader_id?: string;
  sort_by: 'newest' | 'oldest' | 'popular';
  search_query?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}
