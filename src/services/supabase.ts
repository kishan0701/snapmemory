import { createClient } from '@supabase/supabase-js';
import type { Media, UploadRequest } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Only create real client if valid env vars are provided
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;

/** Upload a media record to Supabase PostgreSQL table */
export async function uploadMediaToSupabase(media: Media): Promise<Media | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('media')
      .insert({
        id: media.id,
        event_id: media.event_id,
        album_id: media.album_id || null,
        uploader_id: media.uploader_id || null,
        uploader_name: media.uploader_name || 'Guest Attendee',
        uploader_email: media.uploader_email || null,
        is_creator_upload: !!media.is_creator_upload,
        type: media.type,
        original_url: media.original_url,
        preview_url: media.preview_url || media.original_url,
        thumbnail_url: media.thumbnail_url || media.original_url,
        filename: media.filename,
        mime_type: media.mime_type,
        size: media.size,
        width: media.width || null,
        height: media.height || null,
        approval_status: media.approval_status || 'approved',
        is_approved: media.approval_status === 'approved',
        face_descriptors: media.face_descriptors || [],
        processing_status: 'ready',
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase media insert error:', error);
      return null;
    }
    return data as Media;
  } catch (err) {
    console.warn('Supabase media exception:', err);
    return null;
  }
}

/** Fetch media for an event from Supabase */
export async function fetchEventMediaFromSupabase(eventId: string): Promise<Media[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch media error:', error);
      return null;
    }
    return (data || []) as Media[];
  } catch {
    return null;
  }
}

/** Update media approval status in Supabase */
export async function updateMediaApprovalInSupabase(
  mediaId: string,
  approval_status: 'approved' | 'rejected'
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('media')
      .update({
        approval_status,
        is_approved: approval_status === 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', mediaId);

    return !error;
  } catch {
    return false;
  }
}

/** Save 128-D face descriptors for a photo in Supabase */
export async function saveFaceDescriptorsInSupabase(
  mediaId: string,
  descriptors: number[][]
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('media')
      .update({
        face_descriptors: descriptors,
        faces_detected_count: descriptors.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mediaId);

    return !error;
  } catch {
    return false;
  }
}

/** Create an upload request in Supabase */
export async function createUploadRequestInSupabase(
  request: UploadRequest
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('upload_requests')
      .insert({
        id: request.id,
        event_id: request.event_id,
        requester_id: request.requester_id || null,
        requester_name: request.requester?.name || 'Guest Attendee',
        requester_email: request.requester?.email || '',
        selected_album_id: request.selected_album_id || null,
        message: request.message || null,
        status: request.status || 'pending',
      });

    return !error;
  } catch {
    return false;
  }
}
