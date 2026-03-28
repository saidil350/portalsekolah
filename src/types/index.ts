// Export all types from individual modules
export * from './user';
export * from './shared';

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

// Export from data-management (includes Room, Subject)
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
