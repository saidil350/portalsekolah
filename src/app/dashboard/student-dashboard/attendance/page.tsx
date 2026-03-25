'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Download,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Status types
type AttendanceStatus = 'present' | 'absent' | 'sick' | 'late' | 'today' | 'weekend' | 'future';

interface CalendarDay {
  day: number;
  status: AttendanceStatus;
  label?: string;
}

function getCellStyles(status: AttendanceStatus) {
  switch (status) {
    case 'present': return { bg: 'bg-green-50 border border-slate-100', text: 'text-green-700', labelColor: 'text-green-600/60' };
    case 'absent': return { bg: 'bg-red-50 border border-slate-100 shadow-[0px_0px_0px_2px_rgba(239,68,68,0.2)]', text: 'text-red-700', labelColor: 'text-red-600/60' };
    case 'sick': return { bg: 'bg-blue-50 border border-slate-100', text: 'text-blue-700', labelColor: 'text-blue-600/60' };
    case 'late': return { bg: 'bg-amber-50 border border-slate-100', text: 'text-amber-700', labelColor: 'text-amber-600/60' };
    case 'today': return { bg: 'bg-primary/10 border-2 border-primary shadow-md', text: 'text-primary', labelColor: 'text-primary' };
    case 'weekend': return { bg: 'bg-slate-50', text: 'text-slate-400', labelColor: '' };
    case 'future': return { bg: 'bg-white border border-slate-200', text: 'text-slate-300', labelColor: '' };
    default: return { bg: '', text: '', labelColor: '' };
  }
}


export default function AttendancePage() {
  const { t } = useLanguage();

  // Calendar data May 2024
  const calendarWeeks: CalendarDay[][] = [
    [
      { day: 0, status: 'weekend' },
      { day: 0, status: 'weekend' },
      { day: 0, status: 'weekend' },
      { day: 1, status: 'present', label: t('student.attendance.label.present') },
      { day: 2, status: 'present', label: t('student.attendance.label.present') },
      { day: 3, status: 'present', label: t('student.attendance.label.present') },
      { day: 4, status: 'weekend' },
    ],
    [
      { day: 5, status: 'weekend' },
      { day: 6, status: 'present', label: t('student.attendance.label.present') },
      { day: 7, status: 'late', label: t('student.attendance.label.late') },
      { day: 8, status: 'sick', label: t('student.attendance.label.sick') },
      { day: 9, status: 'present', label: t('student.attendance.label.present') },
      { day: 10, status: 'present', label: t('student.attendance.label.present') },
      { day: 11, status: 'weekend' },
    ],
    [
      { day: 12, status: 'weekend' },
      { day: 13, status: 'present', label: t('student.attendance.label.present') },
      { day: 14, status: 'present', label: t('student.attendance.label.present') },
      { day: 15, status: 'absent', label: t('student.attendance.label.absent') },
      { day: 16, status: 'present', label: t('student.attendance.label.present') },
      { day: 17, status: 'present', label: t('student.attendance.label.present') },
      { day: 18, status: 'weekend' },
    ],
    [
      { day: 19, status: 'weekend' },
      { day: 20, status: 'today', label: t('student.attendance.label.today') },
      { day: 21, status: 'future' },
      { day: 22, status: 'future' },
      { day: 23, status: 'future' },
      { day: 24, status: 'future' },
      { day: 25, status: 'weekend' },
    ],
  ];

  // Log data
  const logData = [
    { date: t('month.may' as any) + ' 17, 2024', subject: t('student.performance.sub.math'), status: t('student.attendance.legend.present'), statusBg: 'bg-green-100', statusColor: 'text-green-700', time: '10:02 AM', note: '-' },
    { date: t('month.may' as any) + ' 15, 2024', subject: t('student.performance.sub.physics'), status: t('student.attendance.legend.absent'), statusBg: 'bg-red-100', statusColor: 'text-red-700', time: '-', note: 'Medical emergency' },
    { date: t('month.may' as any) + ' 08, 2024', subject: t('student.performance.sub.history'), status: t('student.attendance.legend.sick'), statusBg: 'bg-blue-100', statusColor: 'text-blue-700', time: '-', note: 'Flu permission' },
    { date: t('month.may' as any) + ' 07, 2024', subject: t('student.performance.sub.cs'), status: t('student.attendance.legend.late'), statusBg: 'bg-amber-100', statusColor: 'text-amber-700', time: '08:15 AM', note: 'Traffic delay' },
  ];
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] p-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard/student-dashboard" className="text-sm font-medium text-primary hover:underline cursor-pointer">{t('student.nav.dashboard')}</Link>
                <ChevronRight className="w-2.5 h-2 text-slate-400" />
                <span className="text-sm font-medium text-text-sub">{t('student.nav.attendance')}</span>
              </div>
              <h2 className="text-3xl font-bold text-text-main tracking-tight">{t('student.attendance.title')}</h2>
              <p className="text-base text-text-sub">{t('student.attendance.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-text-main hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                <Download className="w-3 h-3" />
                {t('student.attendance.export')}
              </button>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-[0px_0px_0px_2px_white,0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                AX
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Left: Calendar + Detailed Log */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Calendar */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-text-main">{t('month.may')} 2024</h3>
                    <div className="flex items-center gap-1">
                      <button title="Previous Month" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                        <ChevronLeft className="w-3 h-3 text-slate-500" />
                      </button>
                      <button title="Next Month" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { color: 'bg-green-500', label: t('student.attendance.legend.present') },
                      { color: 'bg-red-500', label: t('student.attendance.legend.absent') },
                      { color: 'bg-blue-400', label: t('student.attendance.legend.sick') },
                      { color: 'bg-amber-400', label: t('student.attendance.legend.late') },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-xs font-medium text-text-sub">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {[t('day.sun' as any), t('day.mon' as any), t('day.tue' as any), t('day.wed' as any), t('day.thu' as any), t('day.fri' as any), t('day.sat' as any)].map((d) => (
                      <div key={d} className="text-center py-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarWeeks.flat().map((cell, i) => {
                      if (cell.day === 0) {
                        return <div key={i} className="aspect-square rounded-xl" />;
                      }
                      const styles = getCellStyles(cell.status);
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center ${styles.bg} transition-all duration-200 hover:scale-[1.02]`}
                        >
                          <span className={`text-lg font-semibold ${styles.text}`}>{cell.day}</span>
                          {cell.label && (
                            <span className={`text-[10px] font-bold uppercase ${styles.labelColor}`}>{cell.label}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Log */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-text-main">{t('student.attendance.log.title')}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left pl-6 pr-4 py-4 text-xs font-semibold text-slate-400 uppercase">{t('student.attendance.table.date')}</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-400 uppercase">{t('student.attendance.table.subject')}</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-400 uppercase">{t('student.attendance.table.status')}</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-400 uppercase">{t('student.attendance.table.time')}</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-400 uppercase">{t('student.attendance.table.note')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.map((item, i) => (
                      <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="pl-6 pr-4 py-4 text-sm font-medium text-text-main">{item.date}</td>
                        <td className="px-4 py-4 text-sm font-medium text-text-main">{item.subject}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${item.statusBg} ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-sub">{item.time}</td>
                        <td className="px-4 py-4 text-sm text-text-sub">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="w-[218px] shrink-0 flex flex-col gap-6">
              {/* Semester Average */}
              <div className="bg-primary rounded-xl p-6 shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)] text-white">
                <p className="text-sm font-medium text-blue-100 mb-1">{t('student.attendance.stats.average')}</p>
                <p className="text-4xl font-bold mb-3">92%</p>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-white rounded-full w-[92%]" />
                </div>
                <p className="text-sm text-blue-100">
                  {t('student.attendance.stats.standing')}
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-text-main mb-4">{t('student.attendance.stats.thisMonth')}</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: t('student.attendance.legend.present'), count: 14, color: 'bg-green-500' },
                    { label: t('student.attendance.legend.late'), count: 1, color: 'bg-amber-400' },
                    { label: t('student.attendance.legend.sick'), count: 1, color: 'bg-blue-400' },
                    { label: t('student.attendance.legend.absent'), count: 1, color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-text-sub">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-text-main">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-text-main mb-4">{t('student.attendance.stats.streakTitle')}</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                    <Clock className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">{t('student.attendance.stats.currentStreak')}</p>
                      <p className="text-sm font-bold text-green-700">{t('student.attendance.stats.days').replace('{value}', '5')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">{t('student.attendance.stats.absencesLeft')}</p>
                      <p className="text-sm font-bold text-amber-700">{t('student.attendance.stats.remaining').replace('{value}', '2')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
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
