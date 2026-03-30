'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToastHelpers } from '@/components/ui/toaster';
import { Button } from '@/components/ui';
import {
  MapPin,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { t } = useLanguage();
  const { success, error } = useToastHelpers();
  const [loading, setLoading] = React.useState(false);

  // Data schedule hari ini
  const scheduleData = [
    {
      subject: t('student.course.historyOfArt'),
      time: `08:00 AM - 09:30 AM • ${t('student.room.101')}`,
      status: 'completed',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
    {
      subject: t('student.course.advMath'),
      time: `10:00 AM - 11:30 AM • ${t('student.room.302')}`,
      status: 'upnext',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      subject: t('student.course.physicsLab'),
      time: `01:00 PM - 03:00 PM • ${t('student.room.lab4')}`,
      status: 'upcoming',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-500',
    },
  ];

  // Data nilai terbaru
  const gradesData = [
    { subject: t('student.course.compSci'), type: t('student.exam.midterm'), grade: 'A', score: 95, gradeColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
    { subject: t('student.course.engLit'), type: t('student.exam.essay2'), grade: 'B+', score: 88, gradeColor: 'text-primary', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { subject: t('student.course.physics'), type: t('student.exam.labReport'), grade: 'A-', score: 91, gradeColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
    { subject: t('student.course.stats'), type: t('student.exam.quiz4'), grade: 'B', score: 84, gradeColor: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-100' },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto">
        <div className="p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-text-main text-[30px] font-bold tracking-tight">{t('student.db.welcome')}</h2>
              <p className="text-text-sub mt-1">{t('student.db.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 rounded-full shadow-sm px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-text-sub">{t('student.db.activeStatus')}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-[0px_0px_0px_2px_white,0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="w-full h-full bg-linear-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                  AX
                </div>
              </div>
            </div>
          </div>

          {/* 3 KPI Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* GPA Card */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-start justify-between mb-10">
                <div className="w-[46px] h-[42px] bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div className="bg-green-100 rounded-full px-2 py-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-2 text-green-700" />
                  <span className="text-xs font-medium text-green-700">+0.2</span>
                </div>
              </div>
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.db.gpa')}</p>
              <p className="text-[30px] font-bold text-text-main leading-9">3.85</p>
              <p className="text-xs text-slate-400 mt-2">{t('student.db.scale')}</p>
            </div>

            {/* Attendance Card */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-start justify-between mb-10">
                <div className="w-[44px] h-[44px] bg-purple-50 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <div className="bg-slate-100 rounded-full px-2 py-1">
                  <span className="text-xs font-medium text-slate-600">{t('student.db.overall')}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.db.attendanceRate')}</p>
              <div className="flex items-end gap-2">
                <p className="text-[30px] font-bold text-text-main leading-9">92%</p>
                <p className="text-sm font-medium text-green-600 pb-1">{t('student.db.good')}</p>
              </div>
              <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[92%]" />
              </div>
            </div>

            {/* Credits Card */}
            <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(231,237,243,0.5),0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <div className="flex items-start mb-10">
                <div className="w-10 h-[45px] bg-amber-50 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
              </div>
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.db.creditsLabel')}</p>
              <p className="text-[30px] font-bold text-text-main leading-9">84</p>
              <p className="text-xs text-slate-400 mt-2">{t('student.db.creditsThisSem')}</p>
            </div>
          </div>

          {/* Main Split: Left + Right */}
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6 flex-2">
              {/* Next Class Alert */}
              <div className="bg-linear-to-r from-primary to-blue-600 rounded-xl p-6 relative overflow-hidden shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)]">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-lg" />

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-lg font-medium">{t('student.db.nextClass')}</span>
                      <span className="text-sm text-blue-100">{t('student.db.startsIn')}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mt-1">{t('student.course.advMath')}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-blue-200" />
                      <span className="text-sm text-blue-100">{t('student.room.buildingA302')} • 10:00 AM - 11:30 AM</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        success('Joined class successfully', 'You have joined Advanced Mathematics class');
                      } catch (err) {
                        error('Failed to join class', 'Please try again later');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    rightIcon={<ChevronRight className="w-4 h-3" />}
                  >
                    {t('student.db.joinRoom')}
                  </Button>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-main">{t('student.db.todaySchedule')}</h3>
                  <Link href="/dashboard/student-dashboard/schedule" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer">
                    {t('student.db.viewFullSchedule')}
                  </Link>
                </div>

                {/* Timeline */}
                <div className="relative pl-5 border-l-2 border-slate-100">
                  <div className="flex flex-col gap-8">
                    {scheduleData.map((item, i) => {
                      let badge = { label: '', className: '' };
                      if (item.status === 'completed') badge = { label: t('student.db.status.completed'), className: 'bg-green-100 text-green-700' };
                      else if (item.status === 'upnext') badge = { label: t('student.db.status.upnext'), className: 'bg-blue-100 text-blue-700' };
                      else badge = { label: t('student.db.status.upcoming'), className: 'bg-slate-100 text-slate-500' };
                      
                      const isUpNext = item.status === 'upnext';
                      return (
                        <div key={i} className="relative">
                          {/* Timeline dot */}
                          {isUpNext ? (
                            <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-white border-4 border-primary rounded-full shadow-[0px_0px_0px_4px_rgba(59,130,246,0.1)]" />
                          ) : (
                            <div className="absolute -left-[25px] top-1 w-3 h-3 bg-white border-2 border-slate-300 rounded-full" />
                          )}

                          <div className={`flex items-center justify-between p-4 rounded-xl ${
                            isUpNext ? 'bg-blue-50/50 border border-blue-100' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                                <span className="text-lg">📖</span>
                              </div>
                              <div>
                                <h4 className="text-base font-semibold text-text-main">{item.subject}</h4>
                                <p className="text-sm text-text-sub">{item.time}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 w-[300px] shrink-0">
              {/* Recent Grades */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-main">{t('student.db.recentGrades')}</h3>
                  <button title="More Options" className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <MoreHorizontal className="w-4 h-1 text-slate-400" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {gradesData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${item.bgColor} border ${item.borderColor} flex items-center justify-center`}>
                          <span className={`text-base font-bold ${item.gradeColor}`}>{item.grade}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-main">{item.subject}</p>
                          <p className="text-xs text-text-sub">{item.type}</p>
                        </div>
                      </div>
                      <span className="text-base font-semibold text-text-main">{item.score}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-4 pt-4">
                  <Link href="/dashboard/student-dashboard/grades" className="block text-sm font-medium text-text-sub text-center hover:text-primary cursor-pointer">
                    {t('student.db.viewAllGrades')}
                  </Link>
                </div>
              </div>

              {/* Tuition Status */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-text-main mb-4">{t('student.db.tuitionStatus')}</h3>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">{t('student.db.fullyPaid')}</p>
                    <p className="text-xs text-green-600">{t('student.db.noPending')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-text-sub">{t('student.db.footer')}</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-text-sub hover:text-text-main cursor-pointer">{t('student.db.help')}</Link>
              <Link href="#" className="text-sm text-text-sub hover:text-text-main cursor-pointer">{t('student.db.privacy')}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
