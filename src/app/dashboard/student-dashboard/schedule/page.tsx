'use client';

import React from 'react';
import {
  Search,
  Bell,
  ChevronRight,
  Download,
  Quote,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';


export default function SchedulePage() {
  const { t } = useLanguage();
  const maxGPA = 4.0;

  // Data GPA trend per bulan
  const trendData = [
    { bulan: t('month.sep'), gpa: 3.0, classAvg: 2.4 },
    { bulan: t('month.oct'), gpa: 3.2, classAvg: 2.6 }, 
    { bulan: t('month.nov'), gpa: 3.4, classAvg: 2.8 },
    { bulan: t('month.dec'), gpa: 3.1, classAvg: 2.88 },
    { bulan: t('month.jan'), gpa: 3.8, classAvg: 3.0 },
  ];

  // Data course grades
  const courseGrades = [
    { subject: t('student.performance.sub.math'), code: 'MAT-201 • Prof. Smith', credits: '3.0', midterm: 88, final: 92, total: 90, grade: 'A', gradeColor: 'text-green-700', gradeBg: 'bg-green-100', iconBg: 'bg-orange-100', iconEmoji: '📐' },
    { subject: t('student.performance.sub.physics'), code: 'PHY-102 • Dr. Einstein', credits: '4.0', midterm: 85, final: 82, total: 83.5, grade: 'B+', gradeColor: 'text-blue-700', gradeBg: 'bg-blue-100', iconBg: 'bg-blue-100', iconEmoji: '⚛️' },
    { subject: t('student.performance.sub.history'), code: 'HIS-101 • Mrs. Davis', credits: '3.0', midterm: 95, final: 98, total: 96.5, grade: 'A+', gradeColor: 'text-green-700', gradeBg: 'bg-green-100', iconBg: 'bg-purple-100', iconEmoji: '📖' },
    { subject: t('student.performance.sub.cs'), code: 'CSC-110 • Mr. Turing', credits: '4.0', midterm: 78, final: 85, total: 81.5, grade: 'B-', gradeColor: 'text-blue-700', gradeBg: 'bg-blue-100', iconBg: 'bg-pink-100', iconEmoji: '💻' },
  ];

  // Data teacher comments
  const teacherComments = [
    {
      subject: t('student.performance.sub.math'),
      subjectBg: 'bg-orange-100',
      comment: t('student.performance.comment.math'),
      teacher: '- Prof. Smith',
      initials: 'PS',
    },
    {
      subject: t('student.performance.sub.physics'),
      subjectBg: 'bg-blue-100',
      comment: t('student.performance.comment.physics'),
      teacher: '- Dr. Einstein',
      initials: 'DE',
    },
  ];


  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      {/* Top Header Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500">{t('student.performance.breadcrumb.academics')}</span>
            <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-sm font-medium text-slate-900">{t('student.performance.breadcrumb.grades')}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('student.performance.title')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('student.performance.search.placeholder')}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-700 w-64 outline-none focus:border-primary transition-colors"
            />
          </div>
          <button title="Notifications" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-4 h-5 text-slate-500" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] p-6 flex flex-col gap-6">

          {/* Top Section: Filters + Chart */}
          <div className="flex gap-6">
            {/* Left: Academic Period + Stats */}
            <div className="w-[310px] shrink-0 flex flex-col gap-6">
              {/* Academic Period Filter */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{t('student.performance.period.title')}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">{t('student.performance.period.year')}</label>
                    <select title="Academic Year" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-900 outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                      <option>2023 - 2024</option>
                      <option>2022 - 2023</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">{t('student.performance.period.semester')}</label>
                    <select title="Semester" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-900 outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                      <option>Semester 2 (Spring)</option>
                      <option>Semester 1 (Fall)</option>
                    </select>
                  </div>
                  <button className="bg-primary text-white py-2.5 rounded-lg text-base font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors cursor-pointer mt-2">
                    <Download className="w-3.5 h-2.5" />
                    {t('student.performance.period.apply')}
                  </button>
                </div>
              </div>

              {/* Mini KPI Cards */}
              <div className="flex gap-4">
                {/* GPA Card */}
                <div className="flex-1 rounded-xl p-5 bg-linear-to-br from-blue-500 to-blue-600 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-white overflow-hidden relative">
                  <p className="text-sm font-medium text-blue-100 mb-1">{t('student.performance.kpi.gpa')}</p>
                  <p className="text-4xl font-bold">3.85</p>
                  <div className="bg-white/20 rounded px-2 py-1 mt-2 inline-block">
                    <p className="text-xs font-medium text-white leading-4">{t('student.performance.kpi.gpaTrend').replace('{value}', '+0.12')}</p>
                  </div>
                </div>

                {/* Credits Card */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                  <p className="text-sm font-medium text-slate-500 mb-1">{t('student.performance.kpi.credits')}</p>
                  <p className="text-3xl font-bold text-slate-900">18</p>
                  <p className="text-xs font-medium text-green-600 mt-1 leading-4">{t('student.performance.kpi.creditsTrend')}</p>
                </div>
              </div>
            </div>

            {/* Right: Grade Trend Chart */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">{t('student.performance.chart.title')}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-slate-500">{t('student.performance.chart.gpa')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-sm text-slate-500">{t('student.performance.chart.avg')}</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="relative h-[280px] border-b border-slate-200">
                {/* Y-axis labels + grid */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between">
                  {['4.0', '3.0', '2.0', '1.0', '0.0'].map((label) => (
                    <span key={label} className="text-xs text-slate-400">{label}</span>
                  ))}
                </div>

                {/* Grid lines */}
                <div className="ml-10 mr-4 h-[240px] relative">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * 25}%` } as React.CSSProperties} />
                  ))}

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {trendData.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        <div className="flex items-end gap-1 h-[200px]">
                          {/* Class Avg bar */}
                          <div
                            className="w-2 bg-slate-200 rounded-t"
                            style={{ height: `${(d.classAvg / maxGPA) * 200}px` } as React.CSSProperties}
                          />
                          {/* GPA bar */}
                          <div
                            className="w-2 bg-primary rounded-t shadow-[0px_0px_15px_0px_rgba(19,127,236,0.3)]"
                            style={{ height: `${(d.gpa / maxGPA) * 200}px` } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="ml-10 mr-4 flex justify-between mt-2">
                  {trendData.map((d) => (
                    <span key={d.bulan} className="text-xs font-medium text-slate-500 flex-1 text-center">{d.bulan}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Grades Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{t('student.performance.table.title')}</h3>
              <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer">
                <Download className="w-3 h-3" />
                {t('student.performance.table.download')}
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left pl-6 pr-4 py-4 text-sm font-medium text-slate-500 w-[334px]">{t('student.performance.table.subject')}</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-500 w-[128px]">{t('student.performance.table.credits')}</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-500 w-[128px]">{t('student.performance.table.midterm')}</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-500 w-[128px]">{t('student.performance.table.final')}</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-500 w-[128px]">{t('student.performance.table.total')}</th>
                  <th className="text-right pr-6 pl-4 py-4 text-sm font-medium text-slate-500 w-[128px]">{t('student.performance.table.grade')}</th>
                </tr>
              </thead>
              <tbody>
                {courseGrades.map((item, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="pl-6 pr-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                          <span className="text-lg">{item.iconEmoji}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.subject}</p>
                          <p className="text-xs text-slate-500">{item.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.credits}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-700">{item.midterm}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-700">{item.final}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-900">{item.total}</td>
                    <td className="pr-6 pl-4 py-5 text-right">
                      <span className={`inline-flex items-center justify-center w-8 py-1.5 rounded-full text-sm font-bold ${item.gradeBg} ${item.gradeColor}`}>
                        {item.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teacher Comments Section */}
          <div className="grid grid-cols-2 gap-6 pb-8">
            {teacherComments.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full ${item.subjectBg} flex items-center justify-center`}>
                    <Quote className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.subject}</h4>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 relative">
                  <div className="absolute left-5 top-6">
                    <Quote className="w-5 h-4 text-slate-300 rotate-180" />
                  </div>
                  <p className="text-sm text-slate-600 leading-5 pl-8 mb-4">
                    {item.comment}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">{item.initials}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{item.teacher}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
