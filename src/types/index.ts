// Export all types from individual modules
export * from './user';

// Export from shared - selectively exclude Room and Subject
// (use data-management versions which are complete types)
export type {
  // Academic types
  AcademicYear,
  ClassLevel,
  Department,
  Semester,
  Profile,

  // FormData types
  AcademicYearFormData,
  ClassLevelFormData,
  DepartmentFormData,
  SemesterFormData
} from './shared';

// Export from academic (excluding duplicates with data-management)
export type {
  AcademicFilters,
  AcademicResponse,
  AcademicStatusConfig,
  ACADEMIC_STATUS_CONFIGS,
  getAcademicStatusConfig,
  formatDate,
  formatDateRange
} from './academic';

// Export from data-management (includes complete Room & Subject)
export * from './data-management';

// Re-export from class-roster (excluding duplicates)
export type {
  Class,
  ClassFormData,
  ClassFilters,
  ClassResponse,
  ClassSchedule,
  ClassScheduleFormData,
  ClassScheduleFilters,
  ClassScheduleResponse,
  ClassRosterView,
  Enrollment,
  EnrollmentFormData,
  EnrollmentResponse,
  EnrollmentStatus,
  ViewClassRosterComplete,
  ViewStudentEnrollmentHistory,
  ViewTeachingScheduleComplete,
  DayOfWeek,
  OccupancyBadgeConfig,
  OCCUPANCY_BADGE_CONFIGS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  ROOM_TYPES,
  SUBJECT_TYPES,
  ENROLLMENT_STATUS_OPTS,
  getOccupancyBadge,
  getDayName,
  formatTimeRange,
  calculateOccupancyRate
} from './class-roster';
