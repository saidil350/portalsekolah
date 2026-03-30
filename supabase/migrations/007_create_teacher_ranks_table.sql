-- =====================================================
-- CREATE TEACHER_RANKS TABLE
-- =====================================================
-- Mendefinisikan hierarki/tingkat guru sesuai standar Indonesia
-- Referensi: PP 19/2017, NUPTK, dan standar pendidikan Indonesia

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS teacher_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level_order INTEGER NOT NULL, -- Untuk sorting (1 = terendah, 6 = tertinggi)
    badge_color VARCHAR(50) DEFAULT 'slate',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_level_order CHECK (level_order >= 1 AND level_order <= 10)
  );

  -- Add comment
  COMMENT ON TABLE teacher_ranks IS 'Hierarki jabatan guru sesuai standar Indonesia (Guru Magang s.d. Guru Ahli)';

  RAISE NOTICE 'Table teacher_ranks created successfully';
END $$;

-- =====================================================
-- INSERT STANDARD TEACHER RANKS - INDONESIA
-- =====================================================

-- 1. GURU MAGANG (Guru Pemerantah)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('MAGANG', 'Guru Magang', 'Guru yang sedang menjalani masa pemerantahan/pemagangan', 1, 'gray', '🌱');

-- 2. GURU PERTAMA (Grade 1 - Golongan III/a)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('PERTAMA', 'Guru Pertama', 'Guru dengan kualifikasi pendidikan S1/D-IV dan pengalaman minimal 0-4 tahun', 2, 'blue', '📚');

-- 3. GURU MUDA (Grade 2 - Golongan III/b - III/d)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('MUDA', 'Guru Muda', 'Guru dengan pengalaman 4-8 tahun dan sertifikasi pendidik', 3, 'green', '🎓');

-- 4. GURU MADYA (Grade 3 - Golongan IV/a - IV/c)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('MADYA', 'Guru Madya', 'Guru dengan pengalaman 8-12 tahun dan kinerka baik', 4, 'purple', '🎯');

-- 5. GURU UTAMA (Grade 4 - Golongan IV/d - IV/e)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('UTAMA', 'Guru Utama', 'Guru senior dengan pengalaman >12 tahun dan prestasi luar biasa', 5, 'amber', '⭐');

-- 6. GURU AHLI (Expert/Specialist)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('AHLI', 'Guru Ahli', 'Guru dengan keahlian spesifik/konsultan di bidang tertentu', 6, 'red', '🏆');

-- 7. GURU HONORER (Non-PNS)
INSERT INTO teacher_ranks (code, name, description, level_order, badge_color, icon) VALUES
('HONORER', 'Guru Honorer', 'Guru non-PNS/guru tetap yayasan', 0, 'orange', '📝');

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_teacher_ranks_code ON teacher_ranks(code);
CREATE INDEX IF NOT EXISTS idx_teacher_ranks_level_order ON teacher_ranks(level_order);
CREATE INDEX IF NOT EXISTS idx_teacher_ranks_active ON teacher_ranks(is_active);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE teacher_ranks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Everyone can view active teacher ranks
CREATE POLICY "Authenticated can view teacher_ranks"
  ON teacher_ranks FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin IT can manage teacher ranks
CREATE POLICY "Admin IT can manage teacher_ranks"
  ON teacher_ranks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_IT'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_IT'
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
  rank_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rank_count FROM teacher_ranks;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEACHER_RANKS TABLE CREATED';
  RAISE NOTICE 'Total teacher ranks: %', rank_count;
  RAISE NOTICE 'Hierarchy:';
  RAISE NOTICE '  1. Guru Magang (Pemerantah)';
  RAISE NOTICE '  2. Guru Pertama (III/a)';
  RAISE NOTICE '  3. Guru Muda (III/b-d)';
  RAISE NOTICE '  4. Guru Madya (IV/a-c)';
  RAISE NOTICE '  5. Guru Utama (IV/d-e) ⭐';
  RAISE NOTICE '  6. Guru Ahli (Expert) 🏆';
  RAISE NOTICE '  0. Guru Honorer (Non-PNS)';
  RAISE NOTICE '========================================';
END $$;
