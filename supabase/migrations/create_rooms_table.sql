-- =====================================================
-- ROOMS TABLE
-- Migration script for Data Management - Rooms
-- =====================================================

-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('CLASSROOM', 'LAB', 'OFFICE', 'AUDITORIUM', 'OTHER')),
    capacity INTEGER DEFAULT 30 CHECK (capacity > 0),
    floor INTEGER DEFAULT 1 CHECK (floor > 0),
    building VARCHAR(50),
    facilities TEXT[], -- Array of facility strings
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_rooms_updated_at_trigger ON rooms;

-- Create trigger
CREATE TRIGGER update_rooms_updated_at_trigger
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_rooms_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin IT full access to rooms" ON rooms;
DROP POLICY IF EXISTS "All authenticated users can view active rooms" ON rooms;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to rooms"
    ON rooms FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Other roles can only read active rooms
CREATE POLICY "All authenticated users can view active rooms"
    ON rooms FOR SELECT
    USING (
        is_active = true
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample rooms
INSERT INTO rooms (name, code, room_type, capacity, floor, building, facilities, description, is_active) VALUES
('Ruang Kelas 10A', 'RK-10A', 'CLASSROOM', 30, 1, 'Gedung A', ARRAY['AC', 'Proyektor', 'Whiteboard'], 'Ruang kelas reguler', true),
('Ruang Kelas 10B', 'RK-10B', 'CLASSROOM', 30, 1, 'Gedung A', ARRAY['AC', 'Proyektor', 'Whiteboard'], 'Ruang kelas reguler', true),
('Laboratorium Komputer', 'LAB-KOM', 'LAB', 25, 2, 'Gedung B', ARRAY['AC', 'Komputer', 'Proyektor', 'Internet'], 'Laboratorium komputer dasar', true),
('Laboratorium Fisika', 'LAB-FIS', 'LAB', 20, 2, 'Gedung B', ARRAY['AC', 'Peralatan Fisika', 'Proyektor'], 'Laboratorium fisika', true),
('Laboratorium Bahasa', 'LAB-BHS', 'LAB', 25, 3, 'Gedung B', ARRAY['AC', 'Audio System', 'Proyektor'], 'Laboratorium bahasa', true),
('Kantor Admin', 'KA-01', 'OFFICE', 10, 1, 'Gedung C', ARRAY['AC', 'Meja Kerja', 'Filing Cabinet'], 'Kantor administrasi', true),
('Koran Kepala Sekolah', 'KA-02', 'OFFICE', 5, 2, 'Gedung C', ARRAY['AC', 'Meja Kerja', 'Sofa'], 'Kantor kepala sekolah', true),
('Aula Utama', 'AULA-01', 'AUDITORIUM', 200, 1, 'Gedung D', ARRAY['AC', 'Panggung', 'Sound System', 'Proyektor'], 'Aula utama untuk acara besar', true),
('Ruang Guru', 'RG-01', 'OFFICE', 40, 1, 'Gedung A', ARRAY['AC', 'Meja Kerja', 'Locker'], 'Ruang tunggu guru', true),
('Perpustakaan', 'PERPUS', 'OTHER', 50, 1, 'Gedung E', ARRAY['AC', 'Rak Buku', 'Bacaan'], 'Perpustakaan sekolah', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table was created
SELECT
    'rooms' as table_name,
    COUNT(*) as row_count
FROM rooms;
