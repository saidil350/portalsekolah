-- =====================================================
-- UPDATE TEACHER_RANKS - REMOVE ICONS EXCEPT FOR GURU UTAMA
-- =====================================================
-- Hapus icon dari semua tingkat guru kecuali Guru Utama

DO $$
BEGIN
  -- Hapus icon dari semua tingkat kecuali UTAMA
  UPDATE teacher_ranks
  SET icon = NULL
  WHERE code != 'UTAMA';

  -- Pastikan Guru Utama punya icon bintang
  UPDATE teacher_ranks
  SET icon = '⭐'
  WHERE code = 'UTAMA';

  RAISE NOTICE 'Icons updated - only Guru Utama has star icon';
END $$;

-- Verifikasi hasil
DO $$
DECLARE
  rank_record RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEACHER RANKS ICON UPDATE VERIFICATION';
  RAISE NOTICE '========================================';

  FOR rank_record IN SELECT code, name, icon FROM teacher_ranks ORDER BY level_order
  LOOP
    IF rank_record.icon IS NOT NULL THEN
      RAISE NOTICE '% | % | Icon: %', rank_record.code, rank_record.name, rank_record.icon;
    ELSE
      RAISE NOTICE '% | % | (no icon)', rank_record.code, rank_record.name;
    END IF;
  END LOOP;

  RAISE NOTICE '========================================';
END $$;
