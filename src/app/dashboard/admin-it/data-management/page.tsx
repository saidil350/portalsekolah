'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DownloadCloud, Plus, Search, Edit2, Trash2, Loader2, ChevronDown, Users, Calendar, BookOpen, UserPlus, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToastHelpers } from '@/components/ui/toaster';
import { Button, Input, EmptyTableState } from '@/components/ui';
import {
  fetchRooms, createRoom, updateRoom, deleteRoom,
  fetchSubjects, createSubject, updateSubject, deleteSubject,
  fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  fetchSemesters, createSemester, updateSemester, deleteSemester,
  fetchClassLevels, createClassLevel, updateClassLevel, deleteClassLevel,
  fetchDepartments, createDepartment, updateDepartment, deleteDepartment
} from './actions';
import { fetchClasses } from '@/app/dashboard/admin-it/kelas-dan-roster/actions';
import { getOccupancyBadge } from '@/types/class-roster';
import { getRoomTypeConfig, getSubjectTypeConfig, getStatusConfig, type Room, type Subject, type RoomFormData, type SubjectFormData } from '@/types/data-management';
import type { Class, AcademicYear, Semester, ClassLevel, Department } from '@/types/class-roster';
import { getTeacherRankConfig } from '@/types/data-management';
import RoomModal from '@/components/dashboard/room-modal';
import SubjectModal from '@/components/dashboard/subject-modal';
import SubjectTeachersModal from '@/components/dashboard/subject-teachers-modal';
import AcademicYearModal from '@/components/dashboard/academic-year-modal';
import SemesterModal from '@/components/dashboard/semester-modal';
import ClassLevelModal from '@/components/dashboard/class-level-modal';
import DepartmentModal from '@/components/dashboard/department-modal';

type Tab = 'kelas_dan_roster' | 'ruangan' | 'mata_pelajaran' | 'master_data';
type MasterDataSubTab = 'academic_years' | 'semesters' | 'class_levels' | 'departments';

interface ConfirmDialog {
  isOpen: boolean;
  type: 'room' | 'subject' | 'class' | 'academic_year' | 'semester' | 'class_level' | 'department' | null;
  id: string | null;
  name: string;
}

export default function DataManagementPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { success, error } = useToastHelpers();
  const [activeTab, setActiveTab] = useState<Tab>('kelas_dan_roster');

  // Class state
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState('');
  const [classesPage, setClassesPage] = useState(1);
  const [classesTotal, setClassesTotal] = useState(0);
  const [classesSearch, setClassesSearch] = useState('');
  const [classesLevelFilter, setClassesLevelFilter] = useState('');
  const [classesDeptFilter, setClassesDeptFilter] = useState('');

  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [roomsSearch, setRoomsSearch] = useState('');
  const [roomsTypeFilter, setRoomsTypeFilter] = useState('');
  const [roomsActiveFilter, setRoomsActiveFilter] = useState<boolean | undefined>(undefined);

  // Subject state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState('');
  const [subjectsPage, setSubjectsPage] = useState(1);
  const [subjectsTotal, setSubjectsTotal] = useState(0);
  const [subjectsSearch, setSubjectsSearch] = useState('');
  const [subjectsTypeFilter, setSubjectsTypeFilter] = useState('');
  const [subjectsDeptFilter, setSubjectsDeptFilter] = useState('');

  // Master Data state - separate loading states
  const [masterDataSubTab, setMasterDataSubTab] = useState<MasterDataSubTab>('academic_years');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [masterDataLoading, setMasterDataLoading] = useState(false);
  const [masterDataError, setMasterDataError] = useState('');

  // Filter metadata - shared across tabs
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal state
  const [roomModal, setRoomModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', room: null as Room | null });
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', subject: null as Subject | null });
  const [subjectTeachersModal, setSubjectTeachersModal] = useState({ isOpen: false, subjectId: '', subjectName: '' });
  const [academicYearModal, setAcademicYearModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', academicYear: null as AcademicYear | null });
  const [semesterModal, setSemesterModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', semester: null as Semester | null });
  const [classLevelModal, setClassLevelModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', classLevel: null as ClassLevel | null });
  const [departmentModal, setDepartmentModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', department: null as Department | null });

  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({ isOpen: false, type: null, id: null, name: '' });

  // Search debounce refs
  const classesSearchRef = useRef<string>('');
  const roomsSearchRef = useRef<string>('');
  const subjectsSearchRef = useRef<string>('');

  // Fetch initial metadata needed for filters (lazy load)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Only fetch metadata when needed
        const needsClassLevels = activeTab === 'kelas_dan_roster' || activeTab === 'mata_pelajaran';
        const needsDepartments = activeTab === 'kelas_dan_roster' || activeTab === 'mata_pelajaran';

        if (needsClassLevels && classLevels.length === 0) {
          const levelsRes = await fetchClassLevels({ page: 1, limit: 100 });
          if (levelsRes.success && levelsRes.data) setClassLevels(levelsRes.data);
        }

        if (needsDepartments && departments.length === 0) {
          const deptsRes = await fetchDepartments({ page: 1, limit: 100 });
          if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
        }
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      }
    };
    fetchMetadata();
  }, [activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'kelas_dan_roster') {
      fetchClassesData();
    } else if (activeTab === 'ruangan') {
      fetchRoomsData();
    } else if (activeTab === 'mata_pelajaran') {
      fetchSubjectsData();
    } else if (activeTab === 'master_data') {
      fetchMasterData();
    }
  }, [activeTab, classesPage, classesLevelFilter, classesDeptFilter, roomsPage, roomsTypeFilter, roomsActiveFilter, subjectsPage, subjectsTypeFilter, subjectsDeptFilter, masterDataSubTab]);

  // Debounced search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (classesSearchRef.current !== classesSearch) {
        classesSearchRef.current = classesSearch;
        setClassesPage(1);
        fetchClassesData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [classesSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (roomsSearchRef.current !== roomsSearch) {
        roomsSearchRef.current = roomsSearch;
        setRoomsPage(1);
        fetchRoomsData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [roomsSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (subjectsSearchRef.current !== subjectsSearch) {
        subjectsSearchRef.current = subjectsSearch;
        setSubjectsPage(1);
        fetchSubjectsData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [subjectsSearch]);

  // Fetch functions
  const fetchClassesData = async () => {
    setClassesLoading(true);
    setClassesError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      let query = supabase
        .from('classes')
        .select(`
          *,
          class_level:class_levels(*),
          department:departments(*),
          academic_year:academic_years(*),
          home_room:rooms(*),
          wali_kelas:profiles!classes_wali_kelas_id_fkey(id, full_name)
        `, { count: 'exact' });

      // Apply filters
      if (classesSearch) {
        query = query.or(`name.ilike.%${classesSearch}%,code.ilike.%${classesSearch}%`);
      }
      if (classesLevelFilter) {
        query = query.eq('class_level_id', classesLevelFilter);
      }
      if (classesDeptFilter) {
        query = query.eq('department_id', classesDeptFilter);
      }

      // Pagination
      const from = (classesPage - 1) * 12;
      const to = from + 12 - 1;

      const { data, error, count } = await query
        .eq('is_active', true)
        .order('class_level(level_order)', { ascending: true })
        .order('name', { ascending: true })
        .range(from, to);

      if (error) throw error;

      setClasses(data || []);
      setClassesTotal(count || 0);
    } catch (err: any) {
      setClassesError(err.message || 'Gagal memuat data kelas');
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchRoomsData = async () => {
    setRoomsLoading(true);
    setRoomsError('');
    try {
      const result = await fetchRooms({
        search: roomsSearch,
        room_type: roomsTypeFilter as any,
        is_active: roomsActiveFilter,
        page: roomsPage,
        limit: 10
      });

      if (result.success && result.data) {
        setRooms(result.data);
        setRoomsTotal(result.total || 0);
      } else {
        setRoomsError(result.error || 'Gagal memuat data ruangan');
      }
    } catch (err: any) {
      setRoomsError(err.message || 'Gagal memuat data ruangan');
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchSubjectsData = async () => {
    setSubjectsLoading(true);
    setSubjectsError('');
    try {
      const result = await fetchSubjects({
        search: subjectsSearch,
        subject_type: subjectsTypeFilter as any,
        department_id: subjectsDeptFilter,
        page: subjectsPage,
        limit: 10
      });

      if (result.success && result.data) {
        // Fetch teachers for each subject
        const { fetchSubjectTeachers } = await import('./actions');
        const subjectsWithTeachers = await Promise.all(
          result.data.map(async (subject) => {
            const teachersResult = await fetchSubjectTeachers(subject.id);
            return {
              ...subject,
              teachers: teachersResult.data || []
            };
          })
        );
        setSubjects(subjectsWithTeachers);
        setSubjectsTotal(result.total || 0);
      } else {
        setSubjectsError(result.error || 'Gagal memuat data mata pelajaran');
      }
    } catch (err: any) {
      setSubjectsError(err.message || 'Gagal memuat data mata pelajaran');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    setMasterDataLoading(true);
    setMasterDataError('');
    try {
      if (masterDataSubTab === 'academic_years') {
        const result = await fetchAcademicYears({ page: 1, limit: 50 });
        if (result.success && result.data) setAcademicYears(result.data);
        else setMasterDataError(result.error || 'Gagal memuat data tahun ajaran');
      } else if (masterDataSubTab === 'semesters') {
        const result = await fetchSemesters({ page: 1, limit: 50 });
        if (result.success && result.data) setSemesters(result.data);
        else setMasterDataError(result.error || 'Gagal memuat data semester');
      } else if (masterDataSubTab === 'class_levels') {
        const result = await fetchClassLevels({ page: 1, limit: 50 });
        if (result.success && result.data) setClassLevels(result.data);
        else setMasterDataError(result.error || 'Gagal memuat data tingkat kelas');
      } else if (masterDataSubTab === 'departments') {
        const result = await fetchDepartments({ page: 1, limit: 50 });
        if (result.success && result.data) setDepartments(result.data);
        else setMasterDataError(result.error || 'Gagal memuat data jurusan');
      }
    } catch (err: any) {
      setMasterDataError(err.message || 'Gagal memuat data');
    } finally {
      setMasterDataLoading(false);
    }
  };

  // CRUD operations for Rooms
  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      const result = await createRoom(data);
      if (result.success) {
        success('Ruangan berhasil ditambahkan');
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal menambahkan ruangan', err.message);
      throw err;
    }
  };

  const handleUpdateRoom = async (data: RoomFormData) => {
    if (!roomModal.room) return;
    try {
      const result = await updateRoom(roomModal.room.id, data);
      if (result.success) {
        success('Ruangan berhasil diupdate');
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal mengupdate ruangan', err.message);
      throw err;
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      const result = await deleteRoom(id);
      if (result.success) {
        success('Ruangan berhasil dihapus');
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal menghapus ruangan', err.message);
    }
  };

  // CRUD operations for Subjects
  const handleCreateSubject = async (data: SubjectFormData) => {
    try {
      const result = await createSubject(data);
      if (result.success) {
        success('Mata pelajaran berhasil ditambahkan');
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal menambahkan mata pelajaran', err.message);
      throw err;
    }
  };

  const handleUpdateSubject = async (data: SubjectFormData) => {
    if (!subjectModal.subject) return;
    try {
      const result = await updateSubject(subjectModal.subject.id, data);
      if (result.success) {
        success('Mata pelajaran berhasil diupdate');
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal mengupdate mata pelajaran', err.message);
      throw err;
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        success('Mata pelajaran berhasil dihapus');
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error('Gagal menghapus mata pelajaran', err.message);
    }
  };

  // Subject Teachers handlers
  const handleAssignTeacher = async (teacherId: string, teacherRankId: string | null) => {
    const { assignTeacherToSubject } = await import('./actions');
    try {
      await assignTeacherToSubject(subjectTeachersModal.subjectId, teacherId, teacherRankId);
      success('Guru berhasil ditugaskan');
      fetchSubjectsData();
    } catch (err: any) {
      error('Gagal menugaskan guru', err.message);
      throw err;
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    const { removeTeacherFromSubject } = await import('./actions');
    try {
      await removeTeacherFromSubject(subjectTeachersModal.subjectId, teacherId);
      success('Guru berhasil dihapus dari mata pelajaran');
      fetchSubjectsData();
    } catch (err: any) {
      error('Gagal menghapus guru', err.message);
      throw err;
    }
  };

  const handleUpdateTeacherRank = async (teacherId: string, teacherRankId: string) => {
    const { updateTeacherRank } = await import('./actions');
    try {
      await updateTeacherRank(subjectTeachersModal.subjectId, teacherId, teacherRankId);
      success('Tingkat guru berhasil diperbarui');
      fetchSubjectsData();
    } catch (err: any) {
      error('Gagal mengupdate tingkat guru', err.message);
      throw err;
    }
  };

  // CRUD operations for Classes
  const handleDeleteClass = async (id: string) => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      success('Kelas berhasil dihapus');
      fetchClassesData();
    } catch (err: any) {
      error('Gagal menghapus kelas', err.message);
    }
  };

  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/admin-it/kelas-dan-roster/${classId}`);
  };

  // CRUD operations for Master Data
  const handleCreateAcademicYear = async (data: any) => {
    try {
      const result = await createAcademicYear(data);
      if (result.success) {
        success('Tahun ajaran berhasil ditambahkan');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menambahkan tahun ajaran', err.message);
      throw err;
    }
  };

  const handleUpdateAcademicYear = async (data: any) => {
    if (!academicYearModal.academicYear) return;
    try {
      const result = await updateAcademicYear(academicYearModal.academicYear.id, data);
      if (result.success) {
        success('Tahun ajaran berhasil diupdate');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal mengupdate tahun ajaran', err.message);
      throw err;
    }
  };

  const handleDeleteAcademicYear = async (id: string) => {
    try {
      const result = await deleteAcademicYear(id);
      if (result.success) {
        success('Tahun ajaran berhasil dihapus');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menghapus tahun ajaran', err.message);
    }
  };

  const handleCreateSemester = async (data: any) => {
    try {
      const result = await createSemester(data);
      if (result.success) {
        success('Semester berhasil ditambahkan');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menambahkan semester', err.message);
      throw err;
    }
  };

  const handleUpdateSemester = async (data: any) => {
    if (!semesterModal.semester) return;
    try {
      const result = await updateSemester(semesterModal.semester.id, data);
      if (result.success) {
        success('Semester berhasil diupdate');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal mengupdate semester', err.message);
      throw err;
    }
  };

  const handleDeleteSemester = async (id: string) => {
    try {
      const result = await deleteSemester(id);
      if (result.success) {
        success('Semester berhasil dihapus');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menghapus semester', err.message);
    }
  };

  const handleCreateClassLevel = async (data: any) => {
    try {
      const result = await createClassLevel(data);
      if (result.success) {
        success('Tingkat kelas berhasil ditambahkan');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menambahkan tingkat kelas', err.message);
      throw err;
    }
  };

  const handleUpdateClassLevel = async (data: any) => {
    if (!classLevelModal.classLevel) return;
    try {
      const result = await updateClassLevel(classLevelModal.classLevel.id, data);
      if (result.success) {
        success('Tingkat kelas berhasil diupdate');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal mengupdate tingkat kelas', err.message);
      throw err;
    }
  };

  const handleDeleteClassLevel = async (id: string) => {
    try {
      const result = await deleteClassLevel(id);
      if (result.success) {
        success('Tingkat kelas berhasil dihapus');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menghapus tingkat kelas', err.message);
    }
  };

  const handleCreateDepartment = async (data: any) => {
    try {
      const result = await createDepartment(data);
      if (result.success) {
        success('Jurusan berhasil ditambahkan');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menambahkan jurusan', err.message);
      throw err;
    }
  };

  const handleUpdateDepartment = async (data: any) => {
    if (!departmentModal.department) return;
    try {
      const result = await updateDepartment(departmentModal.department.id, data);
      if (result.success) {
        success('Jurusan berhasil diupdate');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal mengupdate jurusan', err.message);
      throw err;
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const result = await deleteDepartment(id);
      if (result.success) {
        success('Jurusan berhasil dihapus');
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: any) {
      error('Gagal menghapus jurusan', err.message);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    let csv = '';
    let filename = '';

    if (activeTab === 'kelas_dan_roster') {
      filename = `data-kelas-${new Date().toISOString().split('T')[0]}.csv`;
      csv = 'Nama,Kode,Level,Kapasitas,Terisi,Jurusan,Status\n';
      classes.forEach(cls => {
        csv += `"${cls.name}","${cls.code}","${cls.class_level?.name || '-'}","${cls.capacity}","${cls.current_enrollment}","${cls.department?.name || '-'}","${cls.is_active ? 'Aktif' : 'Nonaktif'}"\n`;
      });
    } else if (activeTab === 'ruangan') {
      filename = `data-ruangan-${new Date().toISOString().split('T')[0]}.csv`;
      csv = 'Nama,Kode,Tipe,Kapasitas,Lantai,Gedung,Status\n';
      rooms.forEach(room => {
        csv += `"${room.name}","${room.code}","${getRoomTypeConfig(room.room_type).label}","${room.capacity}","${room.floor}","${room.building || '-'}","${room.is_active ? 'Aktif' : 'Nonaktif'}"\n`;
      });
    } else if (activeTab === 'mata_pelajaran') {
      filename = `data-mata-pelajaran-${new Date().toISOString().split('T')[0]}.csv`;
      csv = 'Nama,Kode,Tipe,SKS,Status\n';
      subjects.forEach(subject => {
        csv += `"${subject.name}","${subject.code}","${getSubjectTypeConfig(subject.subject_type).label}","${subject.credit_hours}","${subject.is_active ? 'Aktif' : 'Nonaktif'}"\n`;
      });
    }

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    success('Data berhasil diekspor');
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (initials: string) => {
    const colors = [
      'bg-slate-200 text-slate-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative min-w-0 overflow-hidden text-sm">
      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Data</h3>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{confirmDialog.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: null, id: null, name: '' })}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (confirmDialog.id) {
                    if (confirmDialog.type === 'room') await handleDeleteRoom(confirmDialog.id);
                    else if (confirmDialog.type === 'subject') await handleDeleteSubject(confirmDialog.id);
                    else if (confirmDialog.type === 'class') await handleDeleteClass(confirmDialog.id);
                    else if (confirmDialog.type === 'academic_year') await handleDeleteAcademicYear(confirmDialog.id);
                    else if (confirmDialog.type === 'semester') await handleDeleteSemester(confirmDialog.id);
                    else if (confirmDialog.type === 'class_level') await handleDeleteClassLevel(confirmDialog.id);
                    else if (confirmDialog.type === 'department') await handleDeleteDepartment(confirmDialog.id);
                  }
                  setConfirmDialog({ isOpen: false, type: null, id: null, name: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="pt-8 px-8 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 text-[22px] font-bold tracking-tight mb-1">Manajemen Data Master</h2>
            <p className="text-slate-500 text-[13px] font-medium">Kelola data kelas, ruangan, dan mata pelajaran</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.97]"
            >
              <DownloadCloud className="w-4 h-4" />
              Ekspor Data
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'kelas_dan_roster') router.push('/dashboard/admin-it/kelas-dan-roster/create');
                else if (activeTab === 'ruangan') setRoomModal({ isOpen: true, mode: 'create', room: null });
                else if (activeTab === 'mata_pelajaran') setSubjectModal({ isOpen: true, mode: 'create', subject: null });
                else if (activeTab === 'master_data') {
                  if (masterDataSubTab === 'academic_years') setAcademicYearModal({ isOpen: true, mode: 'create', academicYear: null });
                  else if (masterDataSubTab === 'semesters') setSemesterModal({ isOpen: true, mode: 'create', semester: null });
                  else if (masterDataSubTab === 'class_levels') setClassLevelModal({ isOpen: true, mode: 'create', classLevel: null });
                  else if (masterDataSubTab === 'departments') setDepartmentModal({ isOpen: true, mode: 'create', department: null });
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-[0px_2px_4px_rgba(19,127,236,0.2)] hover:bg-primary-dark transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Tambah Baru
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white">
          <button
            onClick={() => setActiveTab('kelas_dan_roster')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'kelas_dan_roster' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Kelas & Roster
          </button>
          <button
            onClick={() => setActiveTab('ruangan')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'ruangan' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Ruangan
          </button>
          <button
            onClick={() => setActiveTab('mata_pelajaran')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'mata_pelajaran' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Mata Pelajaran
          </button>
          <button
            onClick={() => setActiveTab('master_data')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'master_data' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Master Data
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-[1200px] mx-auto w-full">

          {/* Table Container */}
          <div className="bg-white border flex flex-col border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">

            {/* Toolbar */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white gap-3">
              <div className="relative w-full max-w-[320px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Cari data"
                  placeholder="Cari data..."
                  value={activeTab === 'kelas_dan_roster' ? classesSearch : activeTab === 'ruangan' ? roomsSearch : subjectsSearch}
                  onChange={(e) => {
                    if (activeTab === 'kelas_dan_roster') setClassesSearch(e.target.value);
                    else if (activeTab === 'ruangan') setRoomsSearch(e.target.value);
                    else setSubjectsSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                {/* Level/Type Filter */}
                <div className="relative">
                  <select
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 cursor-pointer min-w-[150px]"
                    value={activeTab === 'kelas_dan_roster' ? classesLevelFilter : activeTab === 'ruangan' ? roomsTypeFilter : subjectsTypeFilter}
                    aria-label={activeTab === 'kelas_dan_roster' ? 'Filter Level' : 'Filter Tipe'}
                    onChange={(e) => {
                      if (activeTab === 'kelas_dan_roster') { setClassesLevelFilter(e.target.value); setClassesPage(1); }
                      else if (activeTab === 'ruangan') { setRoomsTypeFilter(e.target.value); setRoomsPage(1); }
                      else { setSubjectsTypeFilter(e.target.value); setSubjectsPage(1); }
                    }}
                  >
                    <option value="">{activeTab === 'kelas_dan_roster' ? 'Semua Level' : activeTab === 'ruangan' ? 'Semua Tipe' : 'Semua Tipe'}</option>
                    {activeTab === 'kelas_dan_roster' && classLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                    {activeTab === 'ruangan' && [
                      { value: 'CLASSROOM', label: 'Ruang Kelas' },
                      { value: 'LAB', label: 'Laboratorium' },
                      { value: 'OFFICE', label: 'Kantor' },
                      { value: 'AUDITORIUM', label: 'Aula' },
                      { value: 'OTHER', label: 'Lainnya' }
                    ].map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                    {activeTab === 'mata_pelajaran' && [
                      { value: 'MANDATORY', label: 'Wajib' },
                      { value: 'ELECTIVE', label: 'Pilihan' },
                      { value: 'EXTRACURRICULAR', label: 'Ekstrakurikuler' }
                    ].map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Department Filter (Only for Classes and Subjects) */}
                {(activeTab === 'kelas_dan_roster' || activeTab === 'mata_pelajaran') && (
                  <div className="relative">
                    <select
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 cursor-pointer min-w-[150px]"
                      value={activeTab === 'kelas_dan_roster' ? classesDeptFilter : subjectsDeptFilter}
                      aria-label="Filter Jurusan"
                      onChange={(e) => {
                        if (activeTab === 'kelas_dan_roster') { setClassesDeptFilter(e.target.value); setClassesPage(1); }
                        else { setSubjectsDeptFilter(e.target.value); setSubjectsPage(1); }
                      }}
                    >
                      <option value="">Semua Jurusan</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="w-full flex-1 flex flex-col overflow-x-auto">
              {/* Loading State */}
              {(activeTab === 'kelas_dan_roster' && classesLoading) || (activeTab === 'ruangan' && roomsLoading) || (activeTab === 'mata_pelajaran' && subjectsLoading) ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-slate-600 font-medium">Memuat data...</span>
                </div>
              ) : (
                <>
                  {/* Error State */}
                  {((activeTab === 'kelas_dan_roster' && classesError) || (activeTab === 'ruangan' && roomsError) || (activeTab === 'mata_pelajaran' && subjectsError)) ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <span className="text-red-600 text-xl">⚠</span>
                      </div>
                      <p className="text-red-600 font-medium">{activeTab === 'kelas_dan_roster' ? classesError : activeTab === 'ruangan' ? roomsError : subjectsError}</p>
                    </div>
                  ) : (
                    <>
                      {/* Classes Grid */}
                      {activeTab === 'kelas_dan_roster' && (
                        <div className="p-6">
                          {classes.length === 0 ? (
                            <EmptyTableState
                              type="classes"
                              hasFilters={!!classesSearch || !!classesLevelFilter || !!classesDeptFilter}
                              hasSearch={!!classesSearch}
                              onAdd={() => router.push('/dashboard/admin-it/kelas-dan-roster/create')}
                              onClearFilters={() => {
                                setClassesSearch('');
                                setClassesLevelFilter('');
                                setClassesDeptFilter('');
                                setClassesPage(1);
                              }}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {classes.map((cls) => {
                                const badge = getOccupancyBadge(cls.current_enrollment, cls.capacity);
                                return (
                                  <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls.id)}
                                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                  >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{cls.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono">{cls.code}</p>
                                      </div>
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${badge.bgColor} ${badge.color}`}>
                                        {badge.icon} {badge.label}
                                      </span>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-4">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Level</span>
                                        <span className="font-medium text-slate-900">{cls.class_level?.name || '-'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Jurusan</span>
                                        <span className="font-medium text-slate-900">{cls.department?.name || '-'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Siswa</span>
                                        <span className="font-medium text-slate-900">{cls.current_enrollment} / {cls.capacity}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Wali Kelas</span>
                                        <span className="font-medium text-slate-900">{cls.wali_kelas?.full_name || '-'}</span>
                                      </div>
                                    </div>

                                    {/* Footer with action buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cls.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span className={`text-xs font-bold ${cls.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                          {cls.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDialog({ isOpen: true, type: 'class', id: cls.id, name: cls.name });
                                          }}
                                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rooms Table */}
                      {activeTab === 'ruangan' && (
                        rooms.length === 0 ? (
                          <EmptyTableState
                            type="rooms"
                            hasFilters={!!roomsSearch || !!roomsTypeFilter || roomsActiveFilter !== undefined}
                            hasSearch={!!roomsSearch}
                            onAdd={() => setRoomModal({ isOpen: true, mode: 'create', room: null })}
                            onClearFilters={() => {
                              setRoomsSearch('');
                              setRoomsTypeFilter('');
                              setRoomsActiveFilter(undefined);
                              setRoomsPage(1);
                            }}
                            addLabel="Tambah Ruangan"
                          />
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA & KODE</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">TIPE</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">KAPASITAS & LANTAI</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">GEDUNG</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">STATUS</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {rooms.map((room) => {
                                const typeConfig = getRoomTypeConfig(room.room_type);
                                const statusConfig = getStatusConfig(room.is_active);
                                return (
                                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-sm tracking-tight">{room.name}</span>
                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 ${typeConfig.bgColor} ${typeConfig.color}`}>
                                          {room.code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                        <span>{typeConfig.icon}</span>
                                        {typeConfig.label}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-slate-600 text-sm">{room.capacity} orang</span>
                                        <span className="text-slate-500 text-xs">Lantai {room.floor}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-slate-600 text-sm">{room.building || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-[6px] h-[6px] rounded-full ${statusConfig.dotColor}`} />
                                        <span className={`text-xs font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setRoomModal({ isOpen: true, mode: 'edit', room })}
                                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmDialog({ isOpen: true, type: 'room', id: room.id, name: room.name })}
                                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                        </table>
                        )
                      )}

                      {/* Subjects Table */}
                      {activeTab === 'mata_pelajaran' && (
                        subjects.length === 0 ? (
                          <EmptyTableState
                            type="subjects"
                            hasFilters={!!subjectsSearch || !!subjectsTypeFilter || !!subjectsDeptFilter}
                            hasSearch={!!subjectsSearch}
                            onAdd={() => setSubjectModal({ isOpen: true, mode: 'create', subject: null })}
                            onClearFilters={() => {
                              setSubjectsSearch('');
                              setSubjectsTypeFilter('');
                              setSubjectsDeptFilter('');
                              setSubjectsPage(1);
                            }}
                            addLabel="Tambah Mata Pelajaran"
                          />
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA & KODE</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">TIPE</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">GURU PENGAJAR</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">SKS</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">STATUS</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {subjects.map((subject) => {
                                const typeConfig = getSubjectTypeConfig(subject.subject_type);
                                const statusConfig = getStatusConfig(subject.is_active);
                                const teachers = subject.teachers || [];
                                const primaryTeacher = teachers.find(t => t.is_primary);

                                return (
                                  <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-sm tracking-tight">{subject.name}</span>
                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-slate-100 text-slate-700`}>
                                          {subject.code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                        {typeConfig.label}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col gap-1">
                                        {teachers.length === 0 ? (
                                          <span className="text-slate-400 text-xs italic">Belum ada guru</span>
                                        ) : (
                                          <>
                                            {teachers.slice(0, 2).map((subjectTeacher) => {
                                              const rankConfig = getTeacherRankConfig(subjectTeacher.teacher_rank?.code)

                                              return (
                                                <div key={subjectTeacher.id} className="flex items-center gap-1.5">
                                                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                    {subjectTeacher.teacher?.full_name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .join('')
                                                      .slice(0, 2)
                                                      .toUpperCase()}
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-xs font-semibold text-slate-900">{subjectTeacher.teacher?.full_name}</span>
                                                      {rankConfig && (
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${rankConfig.bgColor} ${rankConfig.color}`}>
                                                          {rankConfig.icon}
                                                        </span>
                                                      )}
                                                    </div>
                                                    {rankConfig && (
                                                      <span className={`text-[9px] font-medium ${rankConfig.color}`}>
                                                        {rankConfig.label}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            {teachers.length > 2 && (
                                              <span className="text-[10px] text-slate-500">
                                                +{teachers.length - 2} guru lainnya
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-slate-600 text-sm font-medium">{subject.credit_hours} SKS</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-[6px] h-[6px] rounded-full ${statusConfig.dotColor}`} />
                                        <span className={`text-xs font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setSubjectTeachersModal({ isOpen: true, subjectId: subject.id, subjectName: subject.name })}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                          title="Distribusi Guru"
                                        >
                                          <UserPlus className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setSubjectModal({ isOpen: true, mode: 'edit', subject })}
                                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmDialog({ isOpen: true, type: 'subject', id: subject.id, name: subject.name })}
                                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                        </table>
                        )
                      )}

                      {/* Master Data */}
                      {activeTab === 'master_data' && (
                        <div className="w-full">
                          {/* Sub-tabs */}
                          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                            <button
                              onClick={() => setMasterDataSubTab('academic_years')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'academic_years'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                              Tahun Ajaran
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('semesters')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'semesters'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                              Semester
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('class_levels')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'class_levels'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Users className="w-3.5 h-3.5 inline mr-1.5" />
                              Tingkat Kelas
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('departments')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'departments'
                                  ? 'bg-orange-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                              Jurusan
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-6 min-h-[500px] flex flex-col">
                            {masterDataLoading ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mt-3 text-slate-600 font-medium">Memuat data...</span>
                              </div>
                            ) : masterDataError ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                  <span className="text-red-600 text-xl">⚠</span>
                                </div>
                                <p className="text-red-600 font-medium">{masterDataError}</p>
                              </div>
                            ) : (
                              <>
                                {/* Academic Years Table */}
                                {masterDataSubTab === 'academic_years' && (
                                  academicYears.length === 0 ? (
                                    <EmptyTableState
                                      type="generic"
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setAcademicYearModal({ isOpen: true, mode: 'create', academicYear: null })}
                                      addLabel="Tambah Tahun Ajaran"
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">PERIODE</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">STATUS</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {academicYears.map((ay) => (
                                          <tr key={ay.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <span className="text-slate-900 font-bold text-sm tracking-tight">{ay.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col text-sm">
                                                <span className="text-slate-600">{ay.start_date}</span>
                                                <span className="text-slate-500">s.d. {ay.end_date}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${ay.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${ay.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                  {ay.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setAcademicYearModal({ isOpen: true, mode: 'edit', academicYear: ay })}
                                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                  title="Edit"
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'academic_year', id: ay.id, name: ay.name })}
                                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title="Hapus"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                  </table>
                                  )
                                )}

                                {/* Semesters Table */}
                                {masterDataSubTab === 'semesters' && (
                                  semesters.length === 0 ? (
                                    <EmptyTableState
                                      type="generic"
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setSemesterModal({ isOpen: true, mode: 'create', semester: null })}
                                      addLabel="Tambah Semester"
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">TAHUN AJARAN</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">PERIODE</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {semesters.map((sem) => (
                                          <tr key={sem.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-sm tracking-tight">{sem.name}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Semester {sem.semester_number}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="text-slate-600 text-sm">{academicYears.find(ay => ay.id === sem.academic_year_id)?.name || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col text-sm">
                                                <span className="text-slate-600">{sem.start_date}</span>
                                                <span className="text-slate-500">s.d. {sem.end_date}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setSemesterModal({ isOpen: true, mode: 'edit', semester: sem })}
                                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                  title="Edit"
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'semester', id: sem.id, name: sem.name })}
                                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title="Hapus"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )
                                )}

                                {/* Class Levels Table */}
                                {masterDataSubTab === 'class_levels' && (
                                  classLevels.length === 0 ? (
                                    <EmptyTableState
                                      type="generic"
                                      title="Belum ada tingkat kelas"
                                      description="Tambahkan tingkat kelas seperti X, XI, atau XII untuk organisasi data."
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setClassLevelModal({ isOpen: true, mode: 'create', classLevel: null })}
                                      addLabel="Tambah Tingkat"
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA & KODE</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">LEVEL</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">STATUS</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {classLevels.map((cl) => (
                                          <tr key={cl.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-sm tracking-tight">{cl.name}</span>
                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-emerald-100 text-emerald-700">
                                                  {cl.code}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="text-slate-600 text-sm font-bold">{cl.level_order}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${cl.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${cl.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                  {cl.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setClassLevelModal({ isOpen: true, mode: 'edit', classLevel: cl })}
                                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                  title="Edit"
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'class_level', id: cl.id, name: cl.name })}
                                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title="Hapus"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  )
                                )}

                                {/* Departments Table */}
                                {masterDataSubTab === 'departments' && (
                                  departments.length === 0 ? (
                                    <EmptyTableState
                                      type="generic"
                                      title="Belum ada data jurusan"
                                      description="Tambahkan jurusan atau kompetensi keahlian yang ada di sekolah."
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setDepartmentModal({ isOpen: true, mode: 'create', department: null })}
                                      addLabel="Tambah Jurusan"
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">NAMA & KODE</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500">STATUS</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-slate-500 text-center">AKSI</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {departments.map((dept) => (
                                          <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-sm tracking-tight">{dept.name}</span>
                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-orange-100 text-orange-700">
                                                  {dept.code}
                                                </span>
                                                {dept.description && (
                                                  <span className="text-xs text-slate-500 mt-1 line-clamp-1">{dept.description}</span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${dept.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${dept.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                  {dept.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setDepartmentModal({ isOpen: true, mode: 'edit', department: dept })}
                                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                  title="Edit"
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'department', id: dept.id, name: dept.name })}
                                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title="Hapus"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Pagination footer */}
            <div className="mt-auto border-t border-slate-100 p-4 px-6 flex items-center justify-between bg-white text-sm">
              <span className="text-slate-500 font-medium text-[13px]">
                Menampilkan {activeTab === 'kelas_dan_roster' ? ((classesPage - 1) * 12 + 1) : activeTab === 'ruangan' ? ((roomsPage - 1) * 10 + 1) : ((subjectsPage - 1) * 10 + 1)}
                -{activeTab === 'kelas_dan_roster' ? Math.min(classesPage * 12, classesTotal) : activeTab === 'ruangan' ? Math.min(roomsPage * 10, roomsTotal) : Math.min(subjectsPage * 10, subjectsTotal)}
                dari {activeTab === 'kelas_dan_roster' ? classesTotal : activeTab === 'ruangan' ? roomsTotal : subjectsTotal} data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'kelas_dan_roster' && classesPage > 1) setClassesPage(classesPage - 1);
                    else if (activeTab === 'ruangan' && roomsPage > 1) setRoomsPage(roomsPage - 1);
                    else if (activeTab === 'mata_pelajaran' && subjectsPage > 1) setSubjectsPage(subjectsPage - 1);
                  }}
                  disabled={(activeTab === 'kelas_dan_roster' && classesPage <= 1) || (activeTab === 'ruangan' && roomsPage <= 1) || (activeTab === 'mata_pelajaran' && subjectsPage <= 1)}
                  className="px-4 py-1.5 border border-slate-200 rounded-md text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => {
                    const maxPage = activeTab === 'kelas_dan_roster' ? Math.ceil(classesTotal / 12) : activeTab === 'ruangan' ? Math.ceil(roomsTotal / 10) : Math.ceil(subjectsTotal / 10);
                    if (activeTab === 'kelas_dan_roster' && classesPage < maxPage) setClassesPage(classesPage + 1);
                    else if (activeTab === 'ruangan' && roomsPage < maxPage) setRoomsPage(roomsPage + 1);
                    else if (activeTab === 'mata_pelajaran' && subjectsPage < maxPage) setSubjectsPage(subjectsPage + 1);
                  }}
                  disabled={(activeTab === 'kelas_dan_roster' && classesPage >= Math.ceil(classesTotal / 12)) || (activeTab === 'ruangan' && roomsPage >= Math.ceil(roomsTotal / 10)) || (activeTab === 'mata_pelajaran' && subjectsPage >= Math.ceil(subjectsTotal / 10))}
                  className="px-4 py-1.5 border border-slate-200 rounded-md text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      <RoomModal
        isOpen={roomModal.isOpen}
        onClose={() => setRoomModal({ isOpen: false, mode: 'create', room: null })}
        onSubmit={roomModal.mode === 'create' ? handleCreateRoom : handleUpdateRoom}
        room={roomModal.room}
        mode={roomModal.mode}
      />

      <SubjectModal
        isOpen={subjectModal.isOpen}
        onClose={() => setSubjectModal({ isOpen: false, mode: 'create', subject: null })}
        onSubmit={subjectModal.mode === 'create' ? handleCreateSubject : handleUpdateSubject}
        subject={subjectModal.subject}
        mode={subjectModal.mode}
      />

      <SubjectTeachersModal
        isOpen={subjectTeachersModal.isOpen}
        onClose={() => setSubjectTeachersModal({ isOpen: false, subjectId: '', subjectName: '' })}
        subjectId={subjectTeachersModal.subjectId}
        subjectName={subjectTeachersModal.subjectName}
        onAssign={handleAssignTeacher}
        onRemove={handleRemoveTeacher}
        onUpdateRank={handleUpdateTeacherRank}
      />

      <AcademicYearModal
        isOpen={academicYearModal.isOpen}
        onClose={() => setAcademicYearModal({ isOpen: false, mode: 'create', academicYear: null })}
        onSubmit={academicYearModal.mode === 'create' ? handleCreateAcademicYear : handleUpdateAcademicYear}
        academicYear={academicYearModal.academicYear}
        mode={academicYearModal.mode}
      />

      <SemesterModal
        isOpen={semesterModal.isOpen}
        onClose={() => setSemesterModal({ isOpen: false, mode: 'create', semester: null })}
        onSubmit={semesterModal.mode === 'create' ? handleCreateSemester : handleUpdateSemester}
        semester={semesterModal.semester}
        mode={semesterModal.mode}
        academicYears={academicYears}
      />

      <ClassLevelModal
        isOpen={classLevelModal.isOpen}
        onClose={() => setClassLevelModal({ isOpen: false, mode: 'create', classLevel: null })}
        onSubmit={classLevelModal.mode === 'create' ? handleCreateClassLevel : handleUpdateClassLevel}
        classLevel={classLevelModal.classLevel}
        mode={classLevelModal.mode}
      />

      <DepartmentModal
        isOpen={departmentModal.isOpen}
        onClose={() => setDepartmentModal({ isOpen: false, mode: 'create', department: null })}
        onSubmit={departmentModal.mode === 'create' ? handleCreateDepartment : handleUpdateDepartment}
        department={departmentModal.department}
        mode={departmentModal.mode}
      />
    </main>
  );
}
