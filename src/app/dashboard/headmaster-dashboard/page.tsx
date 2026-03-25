'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Users,
  GraduationCap,
  Wallet,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react';

export default function HeadmasterDashboardPage() {
  const { t } = useLanguage();

  // Data KPI
  const kpiCards = [
    {
      label: t('headmaster.db.totalStudents'),
      value: '1,250',
      trend: t('headmaster.db.trend.students'),
      trendColor: 'text-green-600',
      trendIcon: TrendingUp,
      iconBg: 'bg-blue-50',
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      label: t('headmaster.db.totalTeachers'),
      value: '85',
      trend: t('headmaster.db.trend.teachers'),
      trendColor: 'text-slate-500',
      trendIcon: Minus,
      iconBg: 'bg-purple-50',
      icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    },
    {
      label: t('headmaster.db.tuitionThisMonth'),
      value: 'Rp 450M',
      trend: t('headmaster.db.trend.tuition'),
      trendColor: 'text-green-600',
      trendIcon: TrendingUp,
      iconBg: 'bg-emerald-50',
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: t('headmaster.db.avgAttendance'),
      value: '94%',
      trend: t('headmaster.db.trend.attendance'),
      trendColor: 'text-red-600',
      trendIcon: TrendingDown,
      iconBg: 'bg-amber-50',
      icon: <UserCheck className="w-5 h-5 text-amber-500" />,
    },
  ];

  // Data bar chart
  const barChartData = [
    { month: t('month.jan'), value: 320, height: '62%', opacity: 'bg-primary/30' },
    { month: t('month.feb'), value: 390, height: '76%', opacity: 'bg-primary/60' },
    { month: t('month.mar'), value: 350, height: '68%', opacity: 'bg-primary/40' },
    { month: t('month.apr'), value: 370, height: '72%', opacity: 'bg-primary/50' },
    { month: t('month.may'), value: 420, height: '82%', opacity: 'bg-primary/90' },
    { month: t('month.jun'), value: 450, height: '100%', opacity: 'bg-primary', active: true },
  ];

  // Data radar chart (simplified as horizontal bar vis)
  const radarData = [
    { label: t('headmaster.major.ipa'), value: 88, color: 'bg-primary' },
    { label: t('headmaster.major.ips'), value: 82, color: 'bg-primary/70' },
    { label: t('headmaster.major.bahasa'), value: 75, color: 'bg-primary/50' },
    { label: t('headmaster.major.vokasi'), value: 80, color: 'bg-primary/60' },
  ];

  // Data donut (attendance)
  const attendanceData = [
    { label: t('headmaster.db.status.present'), value: 1175, color: 'bg-primary', percentage: 94 },
    { label: t('headmaster.db.status.sick'), value: 45, color: 'bg-blue-300', percentage: 3.6 },
    { label: t('headmaster.db.status.leave'), value: 20, color: 'bg-yellow-400', percentage: 1.6 },
    { label: t('headmaster.db.status.absent'), value: 10, color: 'bg-red-500', percentage: 0.8 },
  ];

  return (

  // Removing previous data variable definitions that we moved up
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-slate-900 text-4xl font-bold tracking-tight">{t('headmaster.db.title')}</h2>
              <p className="text-slate-500 text-base mt-2">
                {t('headmaster.db.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">{t('headmaster.db.semesterLabel')}</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => {
              const TrendIcon = kpi.trendIcon;
              return (
                <div
                  key={kpi.label}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                    <div className={`w-9 h-8 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                      {kpi.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 leading-tight">{kpi.value}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendIcon className={`w-3.5 h-3.5 ${kpi.trendColor}`} />
                    <span className={`text-xs font-medium ${kpi.trendColor}`}>{kpi.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Flow Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('headmaster.db.cashflowTitle')}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.db.cashflowDesc')}</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {t('headmaster.db.last6Months')}
              </span>
            </div>

            {/* Bar Chart */}
            <div className="relative h-64">
              {/* Y-axis grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-8">
                {['500M', '400M', '300M', '200M', '0'].map((label, i) => (
                  <div key={i} className="flex items-center w-full">
                    <span className="text-xs text-slate-400 w-10 text-right mr-3 shrink-0">{label}</span>
                    <div className="flex-1 border-b border-slate-100" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-around pl-14 pb-8 gap-2">
                {barChartData.map((bar) => (
                  <div key={bar.month} className="flex flex-col items-center flex-1 max-w-[64px]">
                    <div className="w-full flex items-end justify-center h-[200px]">
                      <div
                        className={`w-12 rounded-t-sm transition-all duration-700 ease-out relative group cursor-pointer ${bar.opacity} ${
                          bar.active ? 'shadow-[0px_4px_20px_-4px_rgba(19,127,236,0.5)]' : ''
                        }`}
                        style={{ height: bar.height } as React.CSSProperties}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Rp {bar.value}M
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs mt-2 ${bar.active ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Radar Chart + Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Rata-rata Nilai per Jurusan */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t('headmaster.db.avgGradesTitle')}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.db.avgGradesDesc')}</p>
              </div>
              {/* Simplified radar as horizontal bars */}
              <div className="flex flex-col gap-5 mt-4">
                {radarData.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                      <span className="text-sm font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${item.value}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                <span className="text-sm text-slate-500">{t('headmaster.db.averageScore')}</span>
              </div>
            </div>

            {/* Persentase Kehadiran Donut */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('headmaster.db.attendanceTitle')}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.db.attendanceDesc')}</p>
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer">
                  {t('headmaster.db.viewDetail')}
                </button>
              </div>

              <div className="flex items-center justify-center gap-8">
                {/* Donut Chart (CSS-based) */}
                <div className="relative w-48 h-48 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    {/* Hadir - 94% */}
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke="#137fec" strokeWidth="4"
                      strokeDasharray="83.2 88" strokeDashoffset="0"
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    {/* Sakit - 3.6% */}
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke="#93c5fd" strokeWidth="4"
                      strokeDasharray="3.2 88" strokeDashoffset="-83.2"
                      strokeLinecap="round"
                    />
                    {/* Izin - 1.6% */}
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke="#facc15" strokeWidth="4"
                      strokeDasharray="1.4 88" strokeDashoffset="-86.4"
                      strokeLinecap="round"
                    />
                    {/* Alpha - 0.8% */}
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke="#ef4444" strokeWidth="4"
                      strokeDasharray="0.7 88" strokeDashoffset="-87.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">94%</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('headmaster.db.status.present')}</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                  {attendanceData.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-600 w-12">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
