'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, Loader2, ChevronDown, Users, Calendar, BookOpen, UserPlus, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/utils/dictionary';
import { useToastHelpers } from '@/components/ui/toaster';
import { EmptyTableState } from '@/components/ui';
import {
  fetchRooms, createRoom, updateRoom, deleteRoom,
  fetchSubjects, createSubject, updateSubject, deleteSubject,
  fetchSemesters, createSemester, updateSemester, deleteSemester,
} from './actions';
import {
  fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  fetchClassLevels, createClassLevel, updateClassLevel, deleteClassLevel,
  fetchDepartments, createDepartment, updateDepartment, deleteDepartment
} from '@/app/dashboard/admin-it/data-akademik/actions';
import { fetchClasses } from '@/app/dashboard/admin-it/kelas-dan-roster/actions';
import { getOccupancyBadge } from '@/types/class-roster';
import { getRoomTypeConfig, getSubjectTypeConfig, getStatusConfig, type Room, type Subject, type RoomFormData, type SubjectFormData, type RoomType, type SubjectType } from '@/types/data-management';
import type { Class, AcademicYear, Semester, ClassLevel, Department } from '@/types/class-roster';
import type { AcademicYearFormData, ClassLevelFormData, DepartmentFormData, SemesterFormData } from '@/types';
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

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

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
    } catch (err: unknown) {
      setClassesError(getErrorMessage(err, t('admin.dataManagement.error.loadClasses')));
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
        room_type: roomsTypeFilter ? (roomsTypeFilter as RoomType) : undefined,
        is_active: roomsActiveFilter,
        page: roomsPage,
        limit: 10
      });

      if (result.success && result.data) {
        setRooms(result.data);
        setRoomsTotal(result.total || 0);
      } else {
        setRoomsError(result.error || t('admin.dataManagement.error.loadRooms'));
      }
    } catch (err: unknown) {
      setRoomsError(getErrorMessage(err, t('admin.dataManagement.error.loadRooms')));
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
        subject_type: subjectsTypeFilter ? (subjectsTypeFilter as SubjectType) : undefined,
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
        setSubjectsError(result.error || t('admin.dataManagement.error.loadSubjects'));
      }
    } catch (err: unknown) {
      setSubjectsError(getErrorMessage(err, t('admin.dataManagement.error.loadSubjects')));
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    setMasterDataLoading(true);
    setMasterDataError('');
    try {
      if (masterDataSubTab === 'academic_years') {
        const [result, semResult] = await Promise.all([
          fetchAcademicYears({ page: 1, limit: 50 }),
          fetchSemesters({ page: 1, limit: 50 })
        ]);
        if (result.success && result.data) setAcademicYears(result.data);
        else setMasterDataError(result.error || t('admin.dataManagement.error.loadAcademicYears'));
        if (semResult.success && semResult.data) setSemesters(semResult.data);
      } else if (masterDataSubTab === 'semesters') {
        // Fetch semesters AND academic years in parallel (academicYears needed for modal dropdown & table display)
        const [semResult, ayResult] = await Promise.all([
          fetchSemesters({ page: 1, limit: 50 }),
          academicYears.length === 0 ? fetchAcademicYears({ page: 1, limit: 100 }) : Promise.resolve({ success: true as const, data: academicYears })
        ]);
        if (semResult.success && semResult.data) setSemesters(semResult.data);
        else setMasterDataError(semResult.error || t('admin.dataManagement.error.loadSemesters'));
        if (ayResult.success && ayResult.data) setAcademicYears(ayResult.data);
      } else if (masterDataSubTab === 'class_levels') {
        const result = await fetchClassLevels({ page: 1, limit: 50 });
        if (result.success && result.data) setClassLevels(result.data);
        else setMasterDataError(result.error || t('admin.dataManagement.error.loadClassLevels'));
      } else if (masterDataSubTab === 'departments') {
        const result = await fetchDepartments({ page: 1, limit: 50 });
        if (result.success && result.data) setDepartments(result.data);
        else setMasterDataError(result.error || t('admin.dataManagement.error.loadDepartments'));
      }
    } catch (err: unknown) {
      setMasterDataError(getErrorMessage(err, t('admin.dataManagement.error.loadData')));
    } finally {
      setMasterDataLoading(false);
    }
  };

  // CRUD operations for Rooms
  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      const result = await createRoom(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.roomCreated'));
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createRoom'), getErrorMessage(err, t('admin.dataManagement.error.createRoom')));
      throw err;
    }
  };

  const handleUpdateRoom = async (data: RoomFormData) => {
    if (!roomModal.room) return;
    try {
      const result = await updateRoom(roomModal.room.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.roomUpdated'));
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateRoom'), getErrorMessage(err, t('admin.dataManagement.error.updateRoom')));
      throw err;
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      const result = await deleteRoom(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.roomDeleted'));
        fetchRoomsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteRoom'), getErrorMessage(err, t('admin.dataManagement.error.deleteRoom')));
    }
  };

  // CRUD operations for Subjects
  const handleCreateSubject = async (data: SubjectFormData) => {
    try {
      const result = await createSubject(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.subjectCreated'));
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createSubject'), getErrorMessage(err, t('admin.dataManagement.error.createSubject')));
      throw err;
    }
  };

  const handleUpdateSubject = async (data: SubjectFormData) => {
    if (!subjectModal.subject) return;
    try {
      const result = await updateSubject(subjectModal.subject.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.subjectUpdated'));
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateSubject'), getErrorMessage(err, t('admin.dataManagement.error.updateSubject')));
      throw err;
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.subjectDeleted'));
        fetchSubjectsData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteSubject'), getErrorMessage(err, t('admin.dataManagement.error.deleteSubject')));
    }
  };

  // Subject Teachers handlers
  const handleAssignTeacher = async (teacherId: string, teacherRankId: string | null) => {
    const { assignTeacherToSubject } = await import('./actions');
    try {
      await assignTeacherToSubject(subjectTeachersModal.subjectId, teacherId, teacherRankId);
      success(t('admin.dataManagement.toast.teacherAssigned'));
      fetchSubjectsData();
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.assignTeacher'), getErrorMessage(err, t('admin.dataManagement.error.assignTeacher')));
      throw err;
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    const { removeTeacherFromSubject } = await import('./actions');
    try {
      await removeTeacherFromSubject(subjectTeachersModal.subjectId, teacherId);
      success(t('admin.dataManagement.toast.teacherRemoved'));
      fetchSubjectsData();
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.removeTeacher'), getErrorMessage(err, t('admin.dataManagement.error.removeTeacher')));
      throw err;
    }
  };

  const handleUpdateTeacherRank = async (teacherId: string, teacherRankId: string) => {
    const { updateTeacherRank } = await import('./actions');
    try {
      await updateTeacherRank(subjectTeachersModal.subjectId, teacherId, teacherRankId);
      success(t('admin.dataManagement.toast.teacherRankUpdated'));
      fetchSubjectsData();
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateTeacherRank'), getErrorMessage(err, t('admin.dataManagement.error.updateTeacherRank')));
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

      success(t('admin.dataManagement.toast.classDeleted'));
      fetchClassesData();
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteClass'), getErrorMessage(err, t('admin.dataManagement.error.deleteClass')));
    }
  };

  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/admin-it/kelas-dan-roster/${classId}`);
  };

  // CRUD operations for Master Data
  const handleCreateAcademicYear = async (data: AcademicYearFormData) => {
    try {
      const result = await createAcademicYear(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.academicYearCreated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createAcademicYear'), getErrorMessage(err, t('admin.dataManagement.error.createAcademicYear')));
      throw err;
    }
  };

  const handleUpdateAcademicYear = async (data: AcademicYearFormData) => {
    if (!academicYearModal.academicYear) return;
    try {
      const result = await updateAcademicYear(academicYearModal.academicYear.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.academicYearUpdated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateAcademicYear'), getErrorMessage(err, t('admin.dataManagement.error.updateAcademicYear')));
      throw err;
    }
  };

  const handleDeleteAcademicYear = async (id: string) => {
    try {
      const result = await deleteAcademicYear(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.academicYearDeleted'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteAcademicYear'), getErrorMessage(err, t('admin.dataManagement.error.deleteAcademicYear')));
    }
  };

  const handleCreateSemester = async (data: SemesterFormData) => {
    try {
      const result = await createSemester(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.semesterCreated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createSemester'), getErrorMessage(err, t('admin.dataManagement.error.createSemester')));
      throw err;
    }
  };

  const handleUpdateSemester = async (data: SemesterFormData) => {
    if (!semesterModal.semester) return;
    try {
      const result = await updateSemester(semesterModal.semester.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.semesterUpdated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateSemester'), getErrorMessage(err, t('admin.dataManagement.error.updateSemester')));
      throw err;
    }
  };

  const handleDeleteSemester = async (id: string) => {
    try {
      const result = await deleteSemester(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.semesterDeleted'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteSemester'), getErrorMessage(err, t('admin.dataManagement.error.deleteSemester')));
    }
  };

  const handleCreateClassLevel = async (data: ClassLevelFormData) => {
    try {
      const result = await createClassLevel(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.classLevelCreated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createClassLevel'), getErrorMessage(err, t('admin.dataManagement.error.createClassLevel')));
      throw err;
    }
  };

  const handleUpdateClassLevel = async (data: ClassLevelFormData) => {
    if (!classLevelModal.classLevel) return;
    try {
      const result = await updateClassLevel(classLevelModal.classLevel.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.classLevelUpdated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateClassLevel'), getErrorMessage(err, t('admin.dataManagement.error.updateClassLevel')));
      throw err;
    }
  };

  const handleDeleteClassLevel = async (id: string) => {
    try {
      const result = await deleteClassLevel(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.classLevelDeleted'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteClassLevel'), getErrorMessage(err, t('admin.dataManagement.error.deleteClassLevel')));
    }
  };

  const handleCreateDepartment = async (data: DepartmentFormData) => {
    try {
      const result = await createDepartment(data);
      if (result.success) {
        success(t('admin.dataManagement.toast.departmentCreated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.createDepartment'), getErrorMessage(err, t('admin.dataManagement.error.createDepartment')));
      throw err;
    }
  };

  const handleUpdateDepartment = async (data: DepartmentFormData) => {
    if (!departmentModal.department) return;
    try {
      const result = await updateDepartment(departmentModal.department.id, data);
      if (result.success) {
        success(t('admin.dataManagement.toast.departmentUpdated'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.updateDepartment'), getErrorMessage(err, t('admin.dataManagement.error.updateDepartment')));
      throw err;
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const result = await deleteDepartment(id);
      if (result.success) {
        success(t('admin.dataManagement.toast.departmentDeleted'));
        fetchMasterData();
      } else throw new Error(result.error);
    } catch (err: unknown) {
      error(t('admin.dataManagement.error.deleteDepartment'), getErrorMessage(err, t('admin.dataManagement.error.deleteDepartment')));
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    let csv = '';
    let filename = '';

    if (activeTab === 'kelas_dan_roster') {
      filename = `data-kelas-${new Date().toISOString().split('T')[0]}.csv`;
      csv = `${t('admin.dataManagement.csv.classesHeader')}\n`;
      classes.forEach(cls => {
        csv += `"${cls.name}","${cls.code}","${cls.class_level?.name || '-'}","${cls.capacity}","${cls.current_enrollment}","${cls.department?.name || '-'}","${getActiveLabel(cls.is_active)}"\n`;
      });
    } else if (activeTab === 'ruangan') {
      filename = `data-ruangan-${new Date().toISOString().split('T')[0]}.csv`;
      csv = `${t('admin.dataManagement.csv.roomsHeader')}\n`;
      rooms.forEach(room => {
        csv += `"${room.name}","${room.code}","${getRoomTypeLabel(room.room_type)}","${room.capacity}","${room.floor}","${room.building || '-'}","${getActiveLabel(room.is_active)}"\n`;
      });
    } else if (activeTab === 'mata_pelajaran') {
      filename = `data-mata-pelajaran-${new Date().toISOString().split('T')[0]}.csv`;
      csv = `${t('admin.dataManagement.csv.subjectsHeader')}\n`;
      subjects.forEach(subject => {
        csv += `"${subject.name}","${subject.code}","${getSubjectTypeLabel(subject.subject_type)}","${getActiveLabel(subject.is_active)}"\n`;
      });
    }

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    success(t('admin.dataManagement.toast.exportSuccess'));
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
      'bg-slate-200 text-foreground',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getActiveLabel = (isActive: boolean) => (
    isActive ? t('common.state.active') : t('common.state.inactive')
  );

  const getRoomTypeLabel = (roomType: string) => {
    const labels: Record<string, TranslationKey> = {
      CLASSROOM: 'admin.dataManagement.roomType.classroom',
      LAB: 'admin.dataManagement.roomType.lab',
      OFFICE: 'admin.dataManagement.roomType.office',
      AUDITORIUM: 'admin.dataManagement.roomType.auditorium',
      OTHER: 'admin.dataManagement.roomType.other',
    };
    return t(labels[roomType] || 'admin.dataManagement.roomType.other');
  };

  const getSubjectTypeLabel = (subjectType: string) => {
    const labels: Record<string, TranslationKey> = {
      MANDATORY: 'admin.dataManagement.subjectType.mandatory',
      ELECTIVE: 'admin.dataManagement.subjectType.elective',
      EXTRACURRICULAR: 'admin.dataManagement.subjectType.extracurricular',
    };
    return t(labels[subjectType] || 'admin.dataManagement.subjectType.mandatory');
  };

  const getOccupancyLabel = (label: string) => {
    const labels: Record<string, TranslationKey> = {
      'Hampir Penuh': 'admin.dataManagement.occupancy.nearlyFull',
      'Tersedia': 'admin.dataManagement.occupancy.available',
      'Kurang Siswa': 'admin.dataManagement.occupancy.lowStudents',
    };
    return labels[label] ? t(labels[label]) : label;
  };

  const activeAcademicYear = academicYears.find((year) => year.is_active);
  const activeSemester = semesters.find((semester) => semester.is_active);
  const showAcademicPeriodWarning = activeTab === 'master_data'
    && (masterDataSubTab === 'academic_years' || masterDataSubTab === 'semesters')
    && (!activeAcademicYear || !activeSemester);

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative min-w-0 overflow-hidden text-sm [&_th]:!px-4 [&_th]:!py-3 [&_td]:!px-4 [&_td]:!py-3">
      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-5">
            <h3 className="text-lg font-bold text-foreground mb-2">{t('admin.dataManagement.dialog.delete.title')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('admin.dataManagement.dialog.delete.message')
                .replace('{name}', confirmDialog.name)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: null, id: null, name: '' })}
                className="flex-1 h-8 px-3 border border-border text-foreground rounded-md hover:bg-accent transition-all font-medium text-xs"
              >
                {t('common.action.cancel')}
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
                className="flex-1 h-8 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all font-medium text-xs"
              >
                {t('common.action.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="pt-6 px-6 pb-0 bg-card border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-foreground text-[22px] font-bold tracking-tight mb-1">{t('admin.dataManagement.title')}</h2>
            <p className="text-muted-foreground text-[13px] font-medium">{t('admin.dataManagement.subtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white">
          <button
            onClick={() => setActiveTab('kelas_dan_roster')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'kelas_dan_roster' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-700'
            }`}
          >
            {t('admin.dataManagement.tab.classes')}
          </button>
          <button
            onClick={() => setActiveTab('ruangan')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'ruangan' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-700'
            }`}
          >
            {t('admin.dataManagement.tab.rooms')}
          </button>
          <button
            onClick={() => setActiveTab('mata_pelajaran')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'mata_pelajaran' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-700'
            }`}
          >
            {t('admin.dataManagement.tab.subjects')}
          </button>
          <button
            onClick={() => setActiveTab('master_data')}
            className={`pb-3 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'master_data' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-700'
            }`}
          >
            {t('admin.dataManagement.tab.masterData')}
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        <div className="max-w-[1200px] mx-auto w-full">

          {/* Table Container */}
          <div className="bg-card border flex flex-col border-border rounded-xl shadow-sm overflow-hidden min-h-0">

            {/* Toolbar */}
            <div className="p-3 flex items-center justify-between border-b border-border/60 bg-card gap-2.5">
              <div className="relative w-full max-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label={t('admin.dataManagement.search.label')}
                  placeholder={t('admin.dataManagement.search.placeholder')}
                  value={activeTab === 'kelas_dan_roster' ? classesSearch : activeTab === 'ruangan' ? roomsSearch : subjectsSearch}
                  onChange={(e) => {
                    if (activeTab === 'kelas_dan_roster') setClassesSearch(e.target.value);
                    else if (activeTab === 'ruangan') setRoomsSearch(e.target.value);
                    else setSubjectsSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                {/* Level/Type Filter */}
                <div className="relative">
                  <select
                    className="appearance-none bg-muted/50 border border-border rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground cursor-pointer min-w-[140px]"
                    value={activeTab === 'kelas_dan_roster' ? classesLevelFilter : activeTab === 'ruangan' ? roomsTypeFilter : subjectsTypeFilter}
                    aria-label={activeTab === 'kelas_dan_roster' ? t('admin.dataManagement.filter.level') : t('admin.dataManagement.filter.type')}
                    onChange={(e) => {
                      if (activeTab === 'kelas_dan_roster') { setClassesLevelFilter(e.target.value); setClassesPage(1); }
                      else if (activeTab === 'ruangan') { setRoomsTypeFilter(e.target.value); setRoomsPage(1); }
                      else { setSubjectsTypeFilter(e.target.value); setSubjectsPage(1); }
                    }}
                  >
                    <option value="">{activeTab === 'kelas_dan_roster' ? t('admin.dataManagement.filter.allLevels') : t('admin.dataManagement.filter.allTypes')}</option>
                    {activeTab === 'kelas_dan_roster' && classLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                    {activeTab === 'ruangan' && [
                      { value: 'CLASSROOM', label: getRoomTypeLabel('CLASSROOM') },
                      { value: 'LAB', label: getRoomTypeLabel('LAB') },
                      { value: 'OFFICE', label: getRoomTypeLabel('OFFICE') },
                      { value: 'AUDITORIUM', label: getRoomTypeLabel('AUDITORIUM') },
                      { value: 'OTHER', label: getRoomTypeLabel('OTHER') }
                    ].map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                    {activeTab === 'mata_pelajaran' && [
                      { value: 'MANDATORY', label: getSubjectTypeLabel('MANDATORY') },
                      { value: 'ELECTIVE', label: getSubjectTypeLabel('ELECTIVE') },
                      { value: 'EXTRACURRICULAR', label: getSubjectTypeLabel('EXTRACURRICULAR') }
                    ].map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Department Filter (Only for Classes and Subjects) */}
                {(activeTab === 'kelas_dan_roster' || activeTab === 'mata_pelajaran') && (
                  <div className="relative">
                    <select
                      className="appearance-none bg-muted/50 border border-border rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground cursor-pointer min-w-[140px]"
                      value={activeTab === 'kelas_dan_roster' ? classesDeptFilter : subjectsDeptFilter}
                      aria-label={t('admin.dataManagement.filter.department')}
                      onChange={(e) => {
                        if (activeTab === 'kelas_dan_roster') { setClassesDeptFilter(e.target.value); setClassesPage(1); }
                        else { setSubjectsDeptFilter(e.target.value); setSubjectsPage(1); }
                      }}
                    >
                      <option value="">{t('admin.dataManagement.filter.allDepartments')}</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

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
                  className="flex h-8 items-center justify-center gap-1.5 px-3 bg-primary text-white rounded-md text-xs font-semibold shadow-[0px_2px_4px_rgba(19,127,236,0.1)] hover:bg-primary/90 transition-all active:scale-[0.97] whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  {t('common.action.addNew')}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full flex-1 flex flex-col overflow-x-auto">
              {/* Loading State */}
              {(activeTab === 'kelas_dan_roster' && classesLoading) || (activeTab === 'ruangan' && roomsLoading) || (activeTab === 'mata_pelajaran' && subjectsLoading) ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground font-medium">{t('common.state.loadingData')}</span>
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
                        <div className="p-3">
                          {classes.length === 0 ? (
                            <EmptyTableState
                              compact
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
                                    className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                  >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h3 className="text-lg font-bold text-foreground mb-1">{cls.name}</h3>
                                        <p className="text-xs text-muted-foreground font-mono">{cls.code}</p>
                                      </div>
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${badge.bgColor} ${badge.color}`}>
                                        {badge.icon} {getOccupancyLabel(badge.label)}
                                      </span>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-4">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('common.label.level')}</span>
                                        <span className="font-medium text-foreground">{cls.class_level?.name || '-'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('common.label.department')}</span>
                                        <span className="font-medium text-foreground">{cls.department?.name || '-'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('common.label.students')}</span>
                                        <span className="font-medium text-foreground">{cls.current_enrollment} / {cls.capacity}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('common.label.homeroomTeacher')}</span>
                                        <span className="font-medium text-foreground">{cls.wali_kelas?.full_name || '-'}</span>
                                      </div>
                                    </div>

                                    {/* Footer with action buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cls.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span className={`text-xs font-bold ${cls.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                          {getActiveLabel(cls.is_active)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDialog({ isOpen: true, type: 'class', id: cls.id, name: cls.name });
                                          }}
                                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title={t('common.action.delete')}
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
                            compact
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
                            addLabel={t('admin.dataManagement.add.room')}
                          />
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.nameCode')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.type')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.capacity')} & {t('admin.dataManagement.table.floor')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.building')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
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
                                        <span className="text-foreground font-bold text-sm tracking-tight">{room.name}</span>
                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 ${typeConfig.bgColor} ${typeConfig.color}`}>
                                          {room.code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                        <span>{typeConfig.icon}</span>
                                        {getRoomTypeLabel(room.room_type)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">{room.capacity} {t('common.label.people')}</span>
                                        <span className="text-muted-foreground text-xs">{t('admin.dataManagement.table.floor')} {room.floor}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-muted-foreground text-sm">{room.building || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-[6px] h-[6px] rounded-full ${statusConfig.dotColor}`} />
                                        <span className={`text-xs font-bold ${statusConfig.color}`}>{getActiveLabel(room.is_active)}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setRoomModal({ isOpen: true, mode: 'edit', room })}
                                          className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                          title={t('common.action.edit')}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmDialog({ isOpen: true, type: 'room', id: room.id, name: room.name })}
                                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title={t('common.action.delete')}
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
                            compact
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
                            addLabel={t('admin.dataManagement.add.subject')}
                          />
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.nameCode')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.type')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.assignedTeachers')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
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
                                        <span className="text-foreground font-bold text-sm tracking-tight">{subject.name}</span>
                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-muted text-foreground`}>
                                          {subject.code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                        {getSubjectTypeLabel(subject.subject_type)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col gap-1">
                                        {teachers.length === 0 ? (
                                          <span className="text-muted-foreground text-xs italic">{t('admin.dataManagement.empty.noTeachers')}</span>
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
                                                      <span className="text-xs font-semibold text-foreground">{subjectTeacher.teacher?.full_name}</span>
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
                                              <span className="text-[10px] text-muted-foreground">
                                                {t('admin.dataManagement.moreTeachers').replace('{count}', String(teachers.length - 2))}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </td>

                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-[6px] h-[6px] rounded-full ${statusConfig.dotColor}`} />
                                        <span className={`text-xs font-bold ${statusConfig.color}`}>{getActiveLabel(subject.is_active)}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setSubjectTeachersModal({ isOpen: true, subjectId: subject.id, subjectName: subject.name })}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                          title={t('admin.dataManagement.table.assignedTeachers')}
                                        >
                                          <UserPlus className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setSubjectModal({ isOpen: true, mode: 'edit', subject })}
                                          className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                          title={t('common.action.edit')}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmDialog({ isOpen: true, type: 'subject', id: subject.id, name: subject.name })}
                                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title={t('common.action.delete')}
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
                          <div className="flex items-center gap-1 p-2 bg-muted/50 border-b border-border">
                            <button
                              onClick={() => setMasterDataSubTab('academic_years')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'academic_years'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:bg-slate-200'
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                              {t('admin.dataManagement.master.academicYears')}
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('semesters')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'semesters'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:bg-slate-200'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                              {t('admin.dataManagement.master.semesters')}
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('class_levels')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'class_levels'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:bg-slate-200'
                              }`}
                            >
                              <Users className="w-3.5 h-3.5 inline mr-1.5" />
                              {t('admin.dataManagement.master.classLevels')}
                            </button>
                            <button
                              onClick={() => setMasterDataSubTab('departments')}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                masterDataSubTab === 'departments'
                                  ? 'bg-orange-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:bg-slate-200'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                              {t('admin.dataManagement.master.departments')}
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-5 min-h-[460px] flex flex-col">
                            {showAcademicPeriodWarning && (
                              <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold">Periode akademik aktif belum lengkap</p>
                                  <p className="text-xs mt-0.5">
                                    Pastikan ada satu tahun ajaran aktif dan satu semester aktif agar kelas, jadwal, presensi, nilai, dan SPP memakai periode yang sama.
                                  </p>
                                </div>
                              </div>
                            )}
                            {masterDataLoading ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mt-3 text-muted-foreground font-medium">{t('common.state.loadingData')}</span>
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
                                      compact
                                      type="generic"
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setAcademicYearModal({ isOpen: true, mode: 'create', academicYear: null })}
                                      addLabel={t('admin.dataManagement.add.academicYear')}
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-border">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.name')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.period')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {academicYears.map((ay) => (
                                          <tr key={ay.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <span className="text-foreground font-bold text-sm tracking-tight">{ay.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col text-sm">
                                                <span className="text-muted-foreground">{ay.start_date}</span>
                                                <span className="text-muted-foreground">{t('common.label.until')} {ay.end_date}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${ay.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${ay.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                  {getActiveLabel(ay.is_active)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setAcademicYearModal({ isOpen: true, mode: 'edit', academicYear: ay })}
                                                  className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                                  title={t('common.action.edit')}
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'academic_year', id: ay.id, name: ay.name })}
                                                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title={t('common.action.delete')}
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
                                      compact
                                      type="generic"
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setSemesterModal({ isOpen: true, mode: 'create', semester: null })}
                                      addLabel={t('admin.dataManagement.add.semester')}
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-border">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.name')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.academicYear')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.period')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {semesters.map((sem) => (
                                          <tr key={sem.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-foreground font-bold text-sm tracking-tight">{sem.name}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">{t('common.label.semester')} {sem.semester_number}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="text-muted-foreground text-sm">{academicYears.find(ay => ay.id === sem.academic_year_id)?.name || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col text-sm">
                                                <span className="text-muted-foreground">{sem.start_date}</span>
                                                <span className="text-muted-foreground">{t('common.label.until')} {sem.end_date}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${sem.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${sem.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                  {getActiveLabel(sem.is_active)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setSemesterModal({ isOpen: true, mode: 'edit', semester: sem })}
                                                  className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                                  title={t('common.action.edit')}
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'semester', id: sem.id, name: sem.name })}
                                                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title={t('common.action.delete')}
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
                                      compact
                                      type="generic"
                                      title={t('admin.dataManagement.empty.noClassLevels.title')}
                                      description={t('admin.dataManagement.empty.noClassLevels.desc')}
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setClassLevelModal({ isOpen: true, mode: 'create', classLevel: null })}
                                      addLabel={t('admin.dataManagement.add.classLevel')}
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-border">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.nameCode')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.level')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {classLevels.map((cl) => (
                                          <tr key={cl.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-foreground font-bold text-sm tracking-tight">{cl.name}</span>
                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-emerald-100 text-emerald-700">
                                                  {cl.code}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="text-muted-foreground text-sm font-bold">{cl.level_order}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${cl.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${cl.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                  {getActiveLabel(cl.is_active)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setClassLevelModal({ isOpen: true, mode: 'edit', classLevel: cl })}
                                                  className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                                  title={t('common.action.edit')}
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'class_level', id: cl.id, name: cl.name })}
                                                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title={t('common.action.delete')}
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
                                      compact
                                      type="generic"
                                      title={t('admin.dataManagement.empty.noDepartments.title')}
                                      description={t('admin.dataManagement.empty.noDepartments.desc')}
                                      hasSearch={false}
                                      hasFilters={false}
                                      onAdd={() => setDepartmentModal({ isOpen: true, mode: 'create', department: null })}
                                      addLabel={t('admin.dataManagement.add.department')}
                                    />
                                  ) : (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/50 border-b border-border">
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('admin.dataManagement.table.nameCode')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground">{t('common.label.status')}</th>
                                          <th className="px-6 py-4 text-[10px] uppercase tracking-[1.2px] font-bold text-muted-foreground text-center">{t('common.label.actions')}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {departments.map((dept) => (
                                          <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                              <div className="flex flex-col">
                                                <span className="text-foreground font-bold text-sm tracking-tight">{dept.name}</span>
                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 bg-orange-100 text-orange-700">
                                                  {dept.code}
                                                </span>
                                                {dept.description && (
                                                  <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{dept.description}</span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-[6px] h-[6px] rounded-full ${dept.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                <span className={`text-xs font-bold ${dept.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                  {getActiveLabel(dept.is_active)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => setDepartmentModal({ isOpen: true, mode: 'edit', department: dept })}
                                                  className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-accent rounded-md transition-colors"
                                                  title={t('common.action.edit')}
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmDialog({ isOpen: true, type: 'department', id: dept.id, name: dept.name })}
                                                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                  title={t('common.action.delete')}
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
            <div className="mt-auto border-t border-border/60 p-4 px-6 flex items-center justify-between bg-card text-sm">
              <span className="text-muted-foreground font-medium text-[13px]">
                {t('admin.dataManagement.pagination.showing')
                  .replace('{start}', String(activeTab === 'kelas_dan_roster' ? ((classesPage - 1) * 12 + 1) : activeTab === 'ruangan' ? ((roomsPage - 1) * 10 + 1) : ((subjectsPage - 1) * 10 + 1)))
                  .replace('{end}', String(activeTab === 'kelas_dan_roster' ? Math.min(classesPage * 12, classesTotal) : activeTab === 'ruangan' ? Math.min(roomsPage * 10, roomsTotal) : Math.min(subjectsPage * 10, subjectsTotal)))
                  .replace('{total}', String(activeTab === 'kelas_dan_roster' ? classesTotal : activeTab === 'ruangan' ? roomsTotal : subjectsTotal))}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'kelas_dan_roster' && classesPage > 1) setClassesPage(classesPage - 1);
                    else if (activeTab === 'ruangan' && roomsPage > 1) setRoomsPage(roomsPage - 1);
                    else if (activeTab === 'mata_pelajaran' && subjectsPage > 1) setSubjectsPage(subjectsPage - 1);
                  }}
                  disabled={(activeTab === 'kelas_dan_roster' && classesPage <= 1) || (activeTab === 'ruangan' && roomsPage <= 1) || (activeTab === 'mata_pelajaran' && subjectsPage <= 1)}
                  className="px-4 py-1.5 border border-border rounded-md text-muted-foreground font-semibold text-[13px] hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.action.previous')}
                </button>
                <button
                  onClick={() => {
                    const maxPage = activeTab === 'kelas_dan_roster' ? Math.ceil(classesTotal / 12) : activeTab === 'ruangan' ? Math.ceil(roomsTotal / 10) : Math.ceil(subjectsTotal / 10);
                    if (activeTab === 'kelas_dan_roster' && classesPage < maxPage) setClassesPage(classesPage + 1);
                    else if (activeTab === 'ruangan' && roomsPage < maxPage) setRoomsPage(roomsPage + 1);
                    else if (activeTab === 'mata_pelajaran' && subjectsPage < maxPage) setSubjectsPage(subjectsPage + 1);
                  }}
                  disabled={(activeTab === 'kelas_dan_roster' && classesPage >= Math.ceil(classesTotal / 12)) || (activeTab === 'ruangan' && roomsPage >= Math.ceil(roomsTotal / 10)) || (activeTab === 'mata_pelajaran' && subjectsPage >= Math.ceil(subjectsTotal / 10))}
                  className="px-4 py-1.5 border border-border rounded-md text-muted-foreground font-semibold text-[13px] hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.action.next')}
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
