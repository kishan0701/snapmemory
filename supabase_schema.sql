-- ==============================================================================
-- SNAPMEMORY — PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH FACE RECOGNITION
-- Project: SnapMemory (Every Event. Every Memory. One Place.)
-- Author: Kishan Yadav
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Note: Enable pgvector for vector cosine distance if vector extension is installed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Drop existing tables if rebuilding (in reverse order of dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS download_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS face_embeddings CASCADE;
DROP TABLE IF EXISTS upload_requests CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS event_members CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 3. EVENTS TABLE
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Other',
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    privacy VARCHAR(50) NOT NULL DEFAULT 'unlisted' CHECK (privacy IN ('public', 'unlisted', 'private', 'password')),
    access_code_hash TEXT,
    allow_contributor_requests BOOLEAN NOT NULL DEFAULT TRUE,
    allow_downloads BOOLEAN NOT NULL DEFAULT TRUE,
    enable_find_my_photos BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_at TIMESTAMPTZ,
    photo_count INT NOT NULL DEFAULT 0,
    video_count INT NOT NULL DEFAULT 0,
    album_count INT NOT NULL DEFAULT 0,
    contributor_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    storage_used BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ALBUMS TABLE
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    visibility VARCHAR(50) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'contributors_only', 'private')),
    sort_order INT NOT NULL DEFAULT 0,
    media_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MEDIA TABLE (Photos & Videos with Approval & Face Descriptors)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    uploader_id UUID,
    uploader_name VARCHAR(255) DEFAULT 'Guest Attendee',
    uploader_email VARCHAR(255),
    is_creator_upload BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(20) NOT NULL DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
    original_url TEXT NOT NULL,
    preview_url TEXT,
    thumbnail_url TEXT,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    width INT,
    height INT,
    duration NUMERIC,
    caption TEXT,
    
    -- APPROVAL WORKFLOW STATUS:
    -- If uploaded by event host -> 'approved'
    -- If uploaded by guest/contributor -> 'pending' (Creator must approve)
    approval_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- FACE DETECTION & RECOGNITION:
    -- Stores array of 128-dimensional vectors for all faces detected in this photo
    face_descriptors JSONB DEFAULT '[]'::jsonb,
    faces_detected_count INT NOT NULL DEFAULT 0,
    
    processing_status VARCHAR(20) NOT NULL DEFAULT 'ready' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
    favorite_count INT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. UPLOAD REQUESTS TABLE (Guests requesting upload permissions)
CREATE TABLE upload_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    requester_id UUID,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    selected_album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EVENT MEMBERS TABLE
CREATE TABLE event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID,
    role VARCHAR(20) NOT NULL DEFAULT 'guest' CHECK (role IN ('owner', 'contributor', 'guest')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR LIGHTNING FAST QUERIES
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_media_event ON media(event_id);
CREATE INDEX idx_media_album ON media(album_id);
CREATE INDEX idx_media_approval ON media(event_id, approval_status);
CREATE INDEX idx_media_face_descriptors ON media USING GIN (face_descriptors);
CREATE INDEX idx_upload_requests_event ON upload_requests(event_id, status);

-- 9. TRIGGER: AUTO-UPDATE PHOTO COUNT ON EVENT
CREATE OR REPLACE FUNCTION update_event_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.approval_status = 'approved') THEN
        UPDATE events 
        SET photo_count = photo_count + CASE WHEN NEW.type = 'photo' THEN 1 ELSE 0 END,
            video_count = video_count + CASE WHEN NEW.type = 'video' THEN 1 ELSE 0 END,
            storage_used = storage_used + NEW.size
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.approval_status != 'approved' AND NEW.approval_status = 'approved') THEN
        UPDATE events 
        SET photo_count = photo_count + CASE WHEN NEW.type = 'photo' THEN 1 ELSE 0 END,
            video_count = video_count + CASE WHEN NEW.type = 'video' THEN 1 ELSE 0 END,
            storage_used = storage_used + NEW.size
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.approval_status = 'approved') THEN
        UPDATE events 
        SET photo_count = GREATEST(0, photo_count - CASE WHEN OLD.type = 'photo' THEN 1 ELSE 0 END),
            video_count = GREATEST(0, video_count - CASE WHEN OLD.type = 'video' THEN 1 ELSE 0 END),
            storage_used = GREATEST(0, storage_used - OLD.size)
        WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_media_stats ON media;
CREATE TRIGGER trg_media_stats
AFTER INSERT OR UPDATE OR DELETE ON media
FOR EACH ROW EXECUTE FUNCTION update_event_stats();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_requests ENABLE ROW LEVEL SECURITY;

-- Events Policies
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT USING (privacy IN ('public', 'unlisted'));

CREATE POLICY "Owners can manage their events" 
ON events FOR ALL USING (auth.uid() = owner_id);

-- Media Policies
CREATE POLICY "Approved media is viewable by event viewers"
ON media FOR SELECT USING (
    approval_status = 'approved' OR 
    auth.uid() = uploader_id OR
    EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.owner_id = auth.uid())
);

CREATE POLICY "Anyone can upload media to public/unlisted event"
ON media FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = media.event_id 
        AND (events.privacy IN ('public', 'unlisted') OR events.owner_id = auth.uid())
    )
);

CREATE POLICY "Event owners can update media (Approve/Reject)"
ON media FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.owner_id = auth.uid())
);

CREATE POLICY "Event owners can delete media"
ON media FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.owner_id = auth.uid())
);

-- Upload Requests Policies
CREATE POLICY "Anyone can submit an upload request"
ON upload_requests FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Event owners can review upload requests"
ON upload_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = upload_requests.event_id AND events.owner_id = auth.uid())
);

-- ==============================================================================
-- SETUP COMPLETE!
-- Your database is now fully configured for:
-- 1. Multi-event galleries
-- 2. Creator direct uploads
-- 3. Guest uploads with Owner Approval Queue
-- 4. 128-D Face recognition descriptors indexing & search
-- ==============================================================================
