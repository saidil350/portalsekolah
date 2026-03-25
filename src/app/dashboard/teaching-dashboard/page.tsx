'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Megaphone,
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Clock,
  MapPin,
  GraduationCap,
  MoreHorizontal,
  CalendarPlus,
  FlaskConical,
  Calculator,
  ExternalLink,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStudentsForGrading, getTeachingStats } from './actions';
import type { User } from '@/types/user';

export default function TeachingDashboardPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, pendingReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, statsData] = await Promise.all([
          getStudentsForGrading(3),
          getTeachingStats()
        ]);
        setStudents(studentsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data jadwal hari ini
  const todaysSchedule = [
    {
      id: 1,
      subject: t('teacher.course.math101'),
      status: t('schedule.status.now'),
      statusColor: 'bg-emerald-100 text-emerald-700',
      time: '08:00 AM - 09:30 AM',
      room: t('teacher.room.302'),
      students: 32,
      iconBg: 'bg-blue-50',
      icon: <Calculator className="w-5 h-5 text-blue-500" />,
      accentColor: 'bg-primary',
      isActive: true,
      actionLabel: t('schedule.startAttendance'),
      actionStyle: 'bg-primary text-white shadow-sm',
    },
    {
      id: 2,
      subject: t('teacher.course.physicsLab2A'),
      status: t('schedule.status.upcoming'),
      statusColor: 'bg-slate-100 text-slate-600',
      time: '10:00 AM - 11:30 AM',
      room: t('teacher.room.lab4b'),
      students: 28,
      iconBg: 'bg-purple-50',
      icon: <FlaskConical className="w-5 h-5 text-purple-500" />,
      accentColor: 'bg-slate-300',
      isActive: false,
      actionLabel: t('schedule.viewDetails'),
      actionStyle: 'bg-white border border-slate-200 text-text-main',
    },
    {
      id: 3,
      subject: t('teacher.course.algebra2'),
      status: null,
      statusColor: '',
      time: '01:00 PM - 02:30 PM',
      room: t('teacher.room.305'),
      students: 30,
      iconBg: 'bg-orange-50',
      icon: <BookOpen className="w-5 h-5 text-orange-500" />,
      accentColor: 'bg-slate-300',
      isActive: false,
      actionLabel: t('schedule.viewDetails'),
      actionStyle: 'bg-white border border-slate-200 text-text-main',
    },
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate grading data with real students or fallback to dummy
  const recentGrading = students.length > 0
    ? students.slice(0, 3).map((student, index) => ({
        id: student.id,
        name: student.full_name,
        photo: `/default-avatar.png`,
        submitted: index === 0
          ? `${t('grading.submitted')} 2 ${t('grading.hoursAgo')}`
          : index === 1
            ? `${t('grading.submitted')} 5 ${t('grading.hoursAgo')}`
            : `${t('grading.submitted')} ${t('grading.yesterday')}`,
        grade: index === 1 ? 'A (92)' : null,
        needsGrade: index !== 1,
      }))
    : [
        // Fallback to dummy data if no students found
        {
          id: 1,
          name: 'Sarah Jenkins',
          photo: '/21131116fde84bd622c26408367f63b3da20e249.png',
          submitted: `${t('grading.submitted')} 2 ${t('grading.hoursAgo')}`,
          grade: null,
          needsGrade: true,
        },
        {
          id: 2,
          name: 'Michael Chen',
          photo: '/e491f49ef247499f76e9d44ac65925d4c45e4ebc.png',
          submitted: `${t('grading.submitted')} 5 ${t('grading.hoursAgo')}`,
          grade: 'A (92)',
          needsGrade: false,
        },
        {
          id: 3,
          name: 'Jessica Davis',
          photo: '/6bfe93370759cb6fb21945caedc193fe9ddff980.png',
          submitted: `${t('grading.submitted')} ${t('grading.yesterday')}`,
          grade: null,
          needsGrade: true,
        },
      ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-text-main text-3xl font-bold tracking-tight">{t('db.title')}</h2>
              <p className="text-text-sub mt-1">{t('db.subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-text-main hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
                <FileText className="w-3.5 h-3.5" />
                {t('db.newAssignment')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-[0px_4px_6px_-1px_rgba(19,127,236,0.2),0px_2px_4px_-2px_rgba(19,127,236,0.2)] transition-all cursor-pointer">
                <Megaphone className="w-4 h-4" />
                {t('db.makeAnnouncement')}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-sub">{t('stat.totalStudents')}</p>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-text-main">{loading ? '...' : stats.totalStudents}</h3>
                <span className="text-xs font-medium text-emerald-600">+2 {t('stat.new')}</span>
              </div>
            </div>
            {/* Classes Today */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-sub">{t('stat.classesToday')}</p>
                <BookOpen className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-text-main">4</h3>
                <span className="text-xs font-medium text-text-sub">2 {t('stat.remaining')}</span>
              </div>
            </div>
            {/* Pending Reviews */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-sub">{t('stat.pendingReviews')}</p>
                <ClipboardCheck className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-text-main">{loading ? '...' : stats.pendingReviews}</h3>
                <span className="text-xs font-medium text-orange-600">{t('stat.highPriority')}</span>
              </div>
            </div>
            {/* Avg. Attendance */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-sub">{t('stat.avgAttendance')}</p>
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-text-main">94%</h3>
                <span className="text-xs font-medium text-emerald-600">+1.2%</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-8 items-start">
            {/* Left Column: Today's Schedule */}
            <div className="flex-2 flex flex-col gap-6 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-main">{t('schedule.title')}</h3>
                <Link
                  href="/dashboard/teaching-dashboard/jadwal-mengajar"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  {t('schedule.viewFull')}
                </Link>
              </div>

              {/* Class Cards */}
              {todaysSchedule.map((cls) => (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl shadow-[0px_0px_0px_1px_#e7edf3,0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden relative ${
                    !cls.isActive ? 'opacity-80' : ''
                  }`}
                >
                  {/* Accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cls.accentColor}`} />

                  <div className="flex items-center gap-4 p-5 pl-7">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${cls.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                      {cls.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {cls.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${cls.statusColor}`}>
                            {cls.status}
                          </span>
                        )}
                        <h4 className="text-lg font-semibold text-text-main">{cls.subject}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1.5 text-sm text-text-sub">
                          <Clock className="w-3.5 h-3.5" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-text-sub">
                          <MapPin className="w-3.5 h-3.5" />
                          {cls.room}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-text-sub">
                          <Users className="w-3.5 h-3.5" />
                          {cls.students} {t('schedule.students')}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer shrink-0 ${cls.actionStyle}`}>
                      {cls.isActive && <ClipboardCheck className="w-4 h-4" />}
                      {cls.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Recent Grading + Notice */}
            <div className="w-[320px] shrink-0 flex flex-col gap-6">
              {/* Recent Grading */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-main">{t('grading.title')}</h3>
                <button title="More Options" className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-[0px_0px_0px_1px_#e7edf3,0px_1px_2px_0px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4">
                {/* Header with grade progress */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-base font-semibold text-text-main">{t('teacher.exam.midtermCalc')}</p>
                    <p className="text-xs text-text-sub">{t('grading.due')} {t('teacher.date.oct20_2023')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">18/32</p>
                    <p className="text-xs text-text-sub">{t('grading.graded')}</p>
                  </div>
                </div>

                {/* Student list */}
                <div className="flex flex-col gap-4">
                  {recentGrading.map((student) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(student.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-main">{student.name}</p>
                        <p className="text-xs text-text-sub">{student.submitted}</p>
                      </div>
                      {student.needsGrade ? (
                        <button className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                          {t('grading.gradeAction')}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-emerald-600">{student.grade}</span>
                          <button title="Edit Grade" className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* View All button */}
                <button className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-text-main hover:bg-slate-50 transition-all cursor-pointer">
                  {t('grading.viewAll')}
                </button>
              </div>

              {/* Staff Meeting Notice */}
              <div className="rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] bg-linear-to-br from-[#4F46E5] to-[#7E22CE]">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-5 h-5 text-white" />
                  <h4 className="text-lg font-semibold text-white">{t('notice.title')}</h4>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed mb-3">
                  {t('notice.desc')}
                </p>
                <button className="flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all cursor-pointer">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  {t('notice.addToCalendar')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
