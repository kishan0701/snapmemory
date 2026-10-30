import type {
  User,
  Event,
  Album,
  Media,
  UploadRequest,
  EventMember,
  Notification,
  EventAnalytics,
} from '@/types';
import { generateSeededEmbedding } from '@/services/faceMatcher';

// Deterministic face embedding clusters for people in mock events
export const PERSON_BRIDE_EMB = generateSeededEmbedding('priya-bride-face-cluster');
export const PERSON_GROOM_EMB = generateSeededEmbedding('rohan-groom-face-cluster');
export const PERSON_FRIEND_EMB = generateSeededEmbedding('friends-group-face-cluster');
export const PERSON_FAMILY_EMB = generateSeededEmbedding('family-elders-face-cluster');

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Kishan Yadav',
    email: 'kishan@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=kishan&backgroundColor=7c3aed',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Priya Mehta',
    email: 'priya@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=priya&backgroundColor=4f46e5',
    created_at: '2025-03-10T12:00:00Z',
    updated_at: '2026-09-10T10:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=rahul&backgroundColor=2563eb',
    created_at: '2025-06-20T09:00:00Z',
    updated_at: '2026-09-15T14:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Sneha Kapoor',
    email: 'sneha@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=sneha&backgroundColor=7c3aed',
    created_at: '2025-08-05T11:00:00Z',
    updated_at: '2026-09-16T09:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=vikram&backgroundColor=6d28d9',
    created_at: '2025-10-12T15:00:00Z',
    updated_at: '2026-09-17T11:00:00Z',
  },
];

export const CURRENT_USER = MOCK_USERS[0];

// ─── Photo URLs (Using Unsplash collections for realism) ──────────────────────
const WEDDING_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
  'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80',
  'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
  'https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?w=800&q=80',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
  'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=800&q=80',
];

const COLLEGE_PHOTOS = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1496469888073-80de7e952517?w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80',
  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
];
function makeThumb(url: string): string {
  return url.replace('?w=800&q=80', '?w=400&q=70');
}

// ─── Mock Albums ──────────────────────────────────────────────────────────────
export const MOCK_ALBUMS_WEDDING: Album[] = [
  { id: 'alb-w1', event_id: 'evt-1', name: 'Wedding Ceremony', description: 'The sacred rituals and vows', cover_url: WEDDING_PHOTOS[0], visibility: 'public', sort_order: 1, created_at: '2026-09-01T10:00:00Z', media_count: 42 },
  { id: 'alb-w2', event_id: 'evt-1', name: 'Reception', description: 'Celebrations and festivities', cover_url: WEDDING_PHOTOS[4], visibility: 'public', sort_order: 2, created_at: '2026-09-01T10:01:00Z', media_count: 35 },
  { id: 'alb-w3', event_id: 'evt-1', name: 'Couple Shoot', description: 'Romantic moments for the couple', cover_url: WEDDING_PHOTOS[2], visibility: 'public', sort_order: 3, created_at: '2026-09-01T10:02:00Z', media_count: 28 },
  { id: 'alb-w4', event_id: 'evt-1', name: 'Family', description: 'Precious family portraits', cover_url: WEDDING_PHOTOS[7], visibility: 'public', sort_order: 4, created_at: '2026-09-01T10:03:00Z', media_count: 19 },
  { id: 'alb-w5', event_id: 'evt-1', name: 'Friends', description: 'Fun moments with friends', cover_url: WEDDING_PHOTOS[9], visibility: 'public', sort_order: 5, created_at: '2026-09-01T10:04:00Z', media_count: 31 },
];

export const MOCK_ALBUMS_COLLEGE: Album[] = [
  { id: 'alb-c1', event_id: 'evt-2', name: 'Stage Events', description: 'Main stage performances and events', cover_url: COLLEGE_PHOTOS[0], visibility: 'public', sort_order: 1, created_at: '2026-09-05T10:00:00Z', media_count: 56 },
  { id: 'alb-c2', event_id: 'evt-2', name: 'Performances', description: 'Dance, music and drama', cover_url: COLLEGE_PHOTOS[3], visibility: 'public', sort_order: 2, created_at: '2026-09-05T10:01:00Z', media_count: 48 },
  { id: 'alb-c3', event_id: 'evt-2', name: 'Crowd & Vibes', description: 'The energy of the fest', cover_url: COLLEGE_PHOTOS[1], visibility: 'public', sort_order: 3, created_at: '2026-09-05T10:02:00Z', media_count: 33 },
  { id: 'alb-c4', event_id: 'evt-2', name: 'Cultural', description: 'Cultural showcase events', cover_url: COLLEGE_PHOTOS[6], visibility: 'public', sort_order: 4, created_at: '2026-09-05T10:03:00Z', media_count: 27 },
  { id: 'alb-c5', event_id: 'evt-2', name: 'Sports', description: 'Athletic events and competitions', cover_url: COLLEGE_PHOTOS[10], visibility: 'public', sort_order: 5, created_at: '2026-09-05T10:04:00Z', media_count: 22 },
  { id: 'alb-c6', event_id: 'evt-2', name: 'Backstage', description: 'Behind the scenes', cover_url: COLLEGE_PHOTOS[8], visibility: 'contributors_only', sort_order: 6, created_at: '2026-09-05T10:05:00Z', media_count: 18 },
  { id: 'alb-c7', event_id: 'evt-2', name: 'Friends', description: 'Squad moments', cover_url: COLLEGE_PHOTOS[4], visibility: 'public', sort_order: 7, created_at: '2026-09-05T10:06:00Z', media_count: 41 },
];

// ─── Mock Media ───────────────────────────────────────────────────────────────
function makePhoto(
  id: string,
  eventId: string,
  albumId: string,
  url: string,
  uploaderId: string,
  filename: string,
  size: number,
  width: number,
  height: number,
  daysAgo: number,
  isFavorited = false,
  customDescriptors?: number[][]
): Media {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);

  // Clustered realistic face embeddings for demo events
  let descriptors = customDescriptors;
  if (!descriptors) {
    if (filename.includes('ceremony') || filename.includes('couple')) {
      descriptors = [PERSON_BRIDE_EMB, PERSON_GROOM_EMB];
    } else if (filename.includes('reception')) {
      descriptors = [PERSON_BRIDE_EMB, PERSON_GROOM_EMB, PERSON_FRIEND_EMB];
    } else if (filename.includes('friends') || filename.includes('party') || filename.includes('dance')) {
      descriptors = [PERSON_FRIEND_EMB];
    } else if (filename.includes('family') || filename.includes('dinner')) {
      descriptors = [PERSON_BRIDE_EMB, PERSON_FAMILY_EMB];
    } else {
      descriptors = [generateSeededEmbedding(id + filename)];
    }
  }

  return {
    id,
    event_id: eventId,
    album_id: albumId,
    uploader_id: uploaderId,
    uploader: MOCK_USERS.find(u => u.id === uploaderId),
    type: 'photo',
    original_url: url,
    preview_url: url,
    thumbnail_url: makeThumb(url),
    filename,
    mime_type: 'image/jpeg',
    size,
    width,
    height,
    processing_status: 'ready',
    created_at: d.toISOString(),
    is_favorited: isFavorited,
    favorite_count: Math.floor(Math.random() * 20),
    download_count: Math.floor(Math.random() * 50),
    approval_status: 'approved',
    is_approved: true,
    face_descriptors: descriptors,
  };
}

export const MOCK_MEDIA_WEDDING: Media[] = [
  makePhoto('med-w1', 'evt-1', 'alb-w1', WEDDING_PHOTOS[0], 'user-1', 'ceremony_01.jpg', 4200000, 3840, 5760, 2, true),
  makePhoto('med-w2', 'evt-1', 'alb-w1', WEDDING_PHOTOS[1], 'user-2', 'ceremony_02.jpg', 3800000, 4032, 3024, 2),
  makePhoto('med-w3', 'evt-1', 'alb-w2', WEDDING_PHOTOS[2], 'user-1', 'reception_01.jpg', 5100000, 5184, 3456, 1, true),
  makePhoto('med-w4', 'evt-1', 'alb-w3', WEDDING_PHOTOS[3], 'user-3', 'couple_01.jpg', 4600000, 3840, 5760, 1),
  makePhoto('med-w5', 'evt-1', 'alb-w4', WEDDING_PHOTOS[4], 'user-1', 'family_01.jpg', 3200000, 6000, 4000, 1),
  makePhoto('med-w6', 'evt-1', 'alb-w5', WEDDING_PHOTOS[5], 'user-4', 'friends_01.jpg', 2900000, 4032, 3024, 0),
  makePhoto('med-w7', 'evt-1', 'alb-w1', WEDDING_PHOTOS[6], 'user-2', 'ceremony_03.jpg', 4400000, 3840, 5760, 2),
  makePhoto('med-w8', 'evt-1', 'alb-w2', WEDDING_PHOTOS[7], 'user-1', 'reception_02.jpg', 3700000, 5184, 3456, 1, true),
  makePhoto('med-w9', 'evt-1', 'alb-w3', WEDDING_PHOTOS[8], 'user-3', 'couple_02.jpg', 5200000, 6000, 4000, 1),
  makePhoto('med-w10', 'evt-1', 'alb-w4', WEDDING_PHOTOS[9], 'user-1', 'family_02.jpg', 4100000, 4032, 3024, 1),
  makePhoto('med-w11', 'evt-1', 'alb-w5', WEDDING_PHOTOS[10], 'user-4', 'friends_02.jpg', 3300000, 3840, 5760, 0, true),
  makePhoto('med-w12', 'evt-1', 'alb-w1', WEDDING_PHOTOS[11], 'user-2', 'ceremony_04.jpg', 4800000, 5184, 3456, 2),
  makePhoto('med-w13', 'evt-1', 'alb-w2', WEDDING_PHOTOS[12], 'user-1', 'reception_03.jpg', 3900000, 6000, 4000, 1),
  makePhoto('med-w14', 'evt-1', 'alb-w3', WEDDING_PHOTOS[13], 'user-3', 'couple_03.jpg', 4300000, 3840, 5760, 1),
  makePhoto('med-w15', 'evt-1', 'alb-w4', WEDDING_PHOTOS[14], 'user-1', 'family_03.jpg', 3600000, 4032, 3024, 1),
  makePhoto('med-w16', 'evt-1', 'alb-w5', WEDDING_PHOTOS[15], 'user-5', 'friends_03.jpg', 2800000, 5184, 3456, 0),
];

export const MOCK_MEDIA_COLLEGE: Media[] = [
  makePhoto('med-c1', 'evt-2', 'alb-c1', COLLEGE_PHOTOS[0], 'user-1', 'stage_01.jpg', 4200000, 5184, 3456, 5),
  makePhoto('med-c2', 'evt-2', 'alb-c2', COLLEGE_PHOTOS[1], 'user-2', 'perf_01.jpg', 3800000, 3840, 5760, 5, true),
  makePhoto('med-c3', 'evt-2', 'alb-c3', COLLEGE_PHOTOS[2], 'user-3', 'crowd_01.jpg', 5100000, 6000, 4000, 4),
  makePhoto('med-c4', 'evt-2', 'alb-c1', COLLEGE_PHOTOS[3], 'user-1', 'stage_02.jpg', 4600000, 4032, 3024, 4, true),
  makePhoto('med-c5', 'evt-2', 'alb-c4', COLLEGE_PHOTOS[4], 'user-4', 'cultural_01.jpg', 3200000, 5184, 3456, 3),
  makePhoto('med-c6', 'evt-2', 'alb-c5', COLLEGE_PHOTOS[5], 'user-1', 'sports_01.jpg', 2900000, 3840, 5760, 3),
  makePhoto('med-c7', 'evt-2', 'alb-c6', COLLEGE_PHOTOS[6], 'user-2', 'backstage_01.jpg', 4400000, 6000, 4000, 5),
  makePhoto('med-c8', 'evt-2', 'alb-c7', COLLEGE_PHOTOS[7], 'user-3', 'friends_01.jpg', 3700000, 4032, 3024, 4, true),
  makePhoto('med-c9', 'evt-2', 'alb-c2', COLLEGE_PHOTOS[8], 'user-1', 'perf_02.jpg', 5200000, 5184, 3456, 5),
  makePhoto('med-c10', 'evt-2', 'alb-c3', COLLEGE_PHOTOS[9], 'user-5', 'crowd_02.jpg', 4100000, 6000, 4000, 4),
  makePhoto('med-c11', 'evt-2', 'alb-c1', COLLEGE_PHOTOS[10], 'user-1', 'stage_03.jpg', 3300000, 3840, 5760, 5),
  makePhoto('med-c12', 'evt-2', 'alb-c4', COLLEGE_PHOTOS[11], 'user-4', 'cultural_02.jpg', 4800000, 4032, 3024, 3),
  makePhoto('med-c13', 'evt-2', 'alb-c7', COLLEGE_PHOTOS[12], 'user-2', 'friends_02.jpg', 3900000, 5184, 3456, 4),
  makePhoto('med-c14', 'evt-2', 'alb-c5', COLLEGE_PHOTOS[13], 'user-1', 'sports_02.jpg', 4300000, 6000, 4000, 3),
  makePhoto('med-c15', 'evt-2', 'alb-c6', COLLEGE_PHOTOS[14], 'user-3', 'backstage_02.jpg', 3600000, 3840, 5760, 5),
];

// ─── Mock Events ──────────────────────────────────────────────────────────────
export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    owner_id: 'user-1',
    title: 'Karan & Riya Wedding',
    type: 'Wedding',
    date: '2026-02-21T10:00:00Z',
    location: 'Jaipur, Rajasthan',
    description: 'A beautiful celebration of love, tradition and new beginnings. Join us as Karan and Riya tie the knot in a grand ceremony at the Rambagh Palace, Jaipur.',
    cover_url: WEDDING_PHOTOS[2],
    privacy: 'unlisted',
    allow_contributor_requests: true,
    allow_downloads: true,
    enable_find_my_photos: true,
    expiry_at: '2026-05-21T23:59:59Z',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
    photo_count: 155,
    video_count: 8,
    album_count: 5,
    contributor_count: 4,
    guest_count: 128,
    storage_used: 2.4 * 1024 * 1024 * 1024,
    view_count: 1247,
    download_count: 342,
    current_user_role: 'owner',
  },
  {
    id: 'evt-2',
    owner_id: 'user-1',
    title: 'TSDC Annual Fest 2026',
    type: 'College Event',
    date: '2026-03-15T09:00:00Z',
    location: 'Mumbai, Maharashtra',
    description: 'The biggest annual cultural festival of Tech Students Development Council. Three days of music, dance, tech, sports, food and unforgettable memories.',
    cover_url: COLLEGE_PHOTOS[1],
    privacy: 'public',
    allow_contributor_requests: true,
    allow_downloads: true,
    enable_find_my_photos: true,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-09-05T10:00:00Z',
    photo_count: 245,
    video_count: 12,
    album_count: 7,
    contributor_count: 9,
    guest_count: 563,
    storage_used: 4.1 * 1024 * 1024 * 1024,
    view_count: 3891,
    download_count: 1024,
    current_user_role: 'owner',
  },
  {
    id: 'evt-3',
    owner_id: 'user-2',
    title: "Priya's 25th Birthday Bash",
    type: 'Birthday',
    date: '2026-04-12T19:00:00Z',
    location: 'Delhi, India',
    description: 'Celebrating a quarter century of awesomeness! Join Priya for a spectacular birthday bash.',
    cover_url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
    privacy: 'private',
    allow_contributor_requests: true,
    allow_downloads: true,
    enable_find_my_photos: false,
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-09-10T10:00:00Z',
    photo_count: 89,
    video_count: 3,
    album_count: 3,
    contributor_count: 6,
    guest_count: 45,
    storage_used: 1.2 * 1024 * 1024 * 1024,
    view_count: 456,
    download_count: 112,
    current_user_role: 'contributor',
  },
  {
    id: 'evt-4',
    owner_id: 'user-3',
    title: 'TechCorp Annual Summit 2026',
    type: 'Corporate',
    date: '2026-06-20T09:00:00Z',
    location: 'Bangalore, Karnataka',
    description: 'Annual corporate summit featuring keynote speeches, product launches and team building activities.',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    privacy: 'private',
    allow_contributor_requests: false,
    allow_downloads: false,
    enable_find_my_photos: false,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-09-12T10:00:00Z',
    photo_count: 67,
    video_count: 5,
    album_count: 4,
    contributor_count: 2,
    guest_count: 87,
    storage_used: 0.8 * 1024 * 1024 * 1024,
    view_count: 234,
    download_count: 0,
    current_user_role: 'guest',
  },
];

// ─── Mock Upload Requests ─────────────────────────────────────────────────────
export const MOCK_UPLOAD_REQUESTS: UploadRequest[] = [
  {
    id: 'req-1',
    event_id: 'evt-1',
    requester_id: 'user-3',
    requester: MOCK_USERS[2],
    message: "Hi! I'm a friend of Riya and have some great candid shots from the ceremony. Would love to contribute to the album!",
    selected_album_id: 'alb-w5',
    selected_album: MOCK_ALBUMS_WEDDING[4],
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-2',
    event_id: 'evt-1',
    requester_id: 'user-4',
    requester: MOCK_USERS[3],
    message: "Professional photographer here. I clicked some amazing shots during the reception. Happy to share the full album.",
    selected_album_id: 'alb-w2',
    selected_album: MOCK_ALBUMS_WEDDING[1],
    status: 'approved',
    reviewed_by: 'user-1',
    reviewed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-3',
    event_id: 'evt-2',
    requester_id: 'user-5',
    requester: MOCK_USERS[4],
    message: "Part of the organizing committee. Have photos from backstage and setup.",
    selected_album_id: 'alb-c6',
    selected_album: MOCK_ALBUMS_COLLEGE[5],
    status: 'pending',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// ─── Mock Members ─────────────────────────────────────────────────────────────
export const MOCK_MEMBERS: EventMember[] = [
  { id: 'mem-1', event_id: 'evt-1', user_id: 'user-1', user: MOCK_USERS[0], role: 'owner', status: 'active', created_at: '2026-01-15T10:00:00Z' },
  { id: 'mem-2', event_id: 'evt-1', user_id: 'user-2', user: MOCK_USERS[1], role: 'contributor', status: 'active', created_at: '2026-01-16T10:00:00Z' },
  { id: 'mem-3', event_id: 'evt-1', user_id: 'user-3', user: MOCK_USERS[2], role: 'contributor', status: 'active', created_at: '2026-01-17T10:00:00Z' },
  { id: 'mem-4', event_id: 'evt-1', user_id: 'user-4', user: MOCK_USERS[3], role: 'contributor', status: 'active', created_at: '2026-01-18T10:00:00Z' },
  { id: 'mem-5', event_id: 'evt-1', user_id: 'user-5', user: MOCK_USERS[4], role: 'guest', status: 'active', created_at: '2026-01-19T10:00:00Z' },
];

// ─── Mock Notifications ───────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    event_id: 'evt-1',
    type: 'upload_request_received',
    message: 'Rahul Verma requested upload access to Karan & Riya Wedding',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    event_id: 'evt-2',
    type: 'upload_request_received',
    message: 'Vikram Singh requested upload access to TSDC Annual Fest 2026',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    event_id: 'evt-1',
    type: 'upload_completed',
    message: 'Priya Mehta uploaded 12 photos to Reception album',
    read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Mock Analytics ───────────────────────────────────────────────────────────
export const MOCK_ANALYTICS: EventAnalytics = {
  event_id: 'evt-1',
  total_photos: 155,
  total_videos: 8,
  storage_used: 2.4 * 1024 * 1024 * 1024,
  total_uploads: 163,
  total_downloads: 342,
  total_views: 1247,
  active_contributors: 4,
  pending_requests: 1,
  failed_uploads: 2,
  most_viewed_albums: [
    { album: MOCK_ALBUMS_WEDDING[2], views: 487 },
    { album: MOCK_ALBUMS_WEDDING[0], views: 342 },
    { album: MOCK_ALBUMS_WEDDING[1], views: 198 },
  ],
  most_downloaded_media: [
    { media: MOCK_MEDIA_WEDDING[2], downloads: 89 },
    { media: MOCK_MEDIA_WEDDING[0], downloads: 67 },
    { media: MOCK_MEDIA_WEDDING[8], downloads: 54 },
  ],
  upload_activity: [
    { date: '2026-09-11', count: 12 },
    { date: '2026-09-12', count: 28 },
    { date: '2026-09-13', count: 45 },
    { date: '2026-09-14', count: 19 },
    { date: '2026-09-15', count: 34 },
    { date: '2026-09-16', count: 22 },
    { date: '2026-09-17', count: 3 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getMediaForEvent(eventId: string): Media[] {
  if (eventId === 'evt-1') return MOCK_MEDIA_WEDDING;
  if (eventId === 'evt-2') return MOCK_MEDIA_COLLEGE;
  return [];
}

export function getAlbumsForEvent(eventId: string): Album[] {
  if (eventId === 'evt-1') return MOCK_ALBUMS_WEDDING;
  if (eventId === 'evt-2') return MOCK_ALBUMS_COLLEGE;
  return [];
}

export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find(e => e.id === id);
}

// ─── Find My Photos mock results ──────────────────────────────────────────────
export const MOCK_FACE_MATCH_RESULTS = [
  { media_id: 'med-w1', media: MOCK_MEDIA_WEDDING[0], confidence: 0.94 },
  { media_id: 'med-w7', media: MOCK_MEDIA_WEDDING[6], confidence: 0.88 },
  { media_id: 'med-w11', media: MOCK_MEDIA_WEDDING[10], confidence: 0.82 },
  { media_id: 'med-w3', media: MOCK_MEDIA_WEDDING[2], confidence: 0.79 },
  { media_id: 'med-w15', media: MOCK_MEDIA_WEDDING[14], confidence: 0.73 },
];
