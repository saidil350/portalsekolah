'use client';

import { ChevronLeft, Download, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';


export default function GradesPage() {
  const { t } = useLanguage();

  // Data chart bar
  const chartData = [
    { label: t('student.grades.chart.cs'), score: 95, color: 'bg-primary' },
    { label: t('student.grades.chart.math'), score: 88, color: 'bg-primary' },
    { label: t('student.grades.chart.phys'), score: 91, color: 'bg-primary' },
    { label: t('student.grades.chart.stats'), score: 84, color: 'bg-primary' },
    { label: t('student.grades.chart.lit'), score: 92, color: 'bg-primary' },
    { label: t('student.grades.chart.art'), score: 78, color: 'bg-primary' },
  ];

  // Data tabel
  const subjectData = [
    { name: t('student.grades.sub.cs2'), code: 'CS-201 • Prof. Alan Turing', credits: 3, midterm: 95, final: 96, grade: 'A', gradeColor: 'text-green-700', gradeBg: 'bg-green-100', point: '4.00' },
    { name: t('student.performance.sub.math'), code: 'MATH-302 • Prof. Isaac Newton', credits: 4, midterm: 85, final: 90, grade: 'B+', gradeColor: 'text-blue-700', gradeBg: 'bg-blue-100', point: '3.50' },
    { name: t('student.performance.sub.physics'), code: 'PHYS-105 • Prof. Marie Curie', credits: 2, midterm: 91, final: 91, grade: 'A-', gradeColor: 'text-green-700', gradeBg: 'bg-green-100', point: '3.75' },
    { name: t('student.grades.sub.stats'), code: 'STAT-204 • Dr. Gauss', credits: 3, midterm: 82, final: 86, grade: 'B', gradeColor: 'text-blue-700', gradeBg: 'bg-blue-100', point: '3.00' },
    { name: t('student.grades.sub.lit'), code: 'ENG-112 • Prof. Shakespeare', credits: 3, midterm: 92, final: 92, grade: 'A', gradeColor: 'text-green-700', gradeBg: 'bg-green-100', point: '4.00' },
    { name: t('student.performance.sub.history'), code: 'ART-101 • Dr. Da Vinci', credits: 3, midterm: 75, final: 81, grade: 'B-', gradeColor: 'text-amber-700', gradeBg: 'bg-yellow-100', point: '2.75' },
  ];
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] p-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <Link href="/dashboard/student-dashboard" className="flex items-center gap-2 text-primary text-sm font-medium hover:underline cursor-pointer mb-1">
                <ChevronLeft className="w-2.5 h-2.5" />
                {t('student.grades.back')}
              </Link>
              <h2 className="text-3xl font-bold text-text-main tracking-tight">{t('student.grades.title')}</h2>
              <p className="text-base text-text-sub">{t('student.grades.subtitle')}</p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-2.5 flex items-center gap-3">
              <div className="px-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{t('student.grades.period.year')}</span>
                <span className="text-sm font-medium text-text-main">2023/2024</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="px-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{t('student.grades.period.semester')}</span>
                <span className="text-sm font-medium text-text-main">{t('student.grades.period.even')}</span>
              </div>
              <button title="Download" className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer ml-2">
                <Download className="w-4 h-3" />
              </button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-text-main">{t('student.grades.overview.title')}</h3>
                <p className="text-sm text-text-sub">{t('student.grades.overview.subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-text-sub">{t('student.grades.overview.score')}</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[256px] flex items-end justify-between px-4 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-2 pointer-events-none">
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="border-b border-slate-50 w-full" />
                ))}
              </div>

              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <div className="flex items-end h-[200px]">
                    <div
                      className="w-10 bg-linear-to-t from-primary to-blue-400 rounded-t-xl shadow-[0px_0px_15px_0px_rgba(19,127,236,0.2)] transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(d.score / 100) * 200}px` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-text-main">{t('student.grades.table.title')}</h3>
              <button className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                {t('student.grades.table.export')}
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left pl-6 pr-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.subject')}</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.credits')}</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.midterm')}</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.final')}</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.grade')}</th>
                  <th className="text-right pr-6 pl-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.table.point')}</th>
                </tr>
              </thead>
              <tbody>
                {subjectData.map((item, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="pl-6 pr-4 py-6">
                      <p className="text-sm font-semibold text-text-main">{item.name}</p>
                      <p className="text-xs text-text-sub">{item.code}</p>
                    </td>
                    <td className="text-center px-4 py-6 text-sm font-medium text-text-main">{item.credits}</td>
                    <td className="text-center px-4 py-6 text-sm font-medium text-text-main">{item.midterm}</td>
                    <td className="text-center px-4 py-6 text-sm font-medium text-text-main">{item.final}</td>
                    <td className="text-center px-4 py-5">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${item.gradeBg} ${item.gradeColor}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="text-right pr-6 pl-4 py-6 text-sm font-semibold text-text-main">{item.point}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80">
                  <td className="pl-6 pr-4 py-9 text-sm font-semibold text-text-main">{t('student.grades.summary.total')}</td>
                  <td className="text-center px-4 py-9 text-sm font-semibold text-text-main">18</td>
                  <td colSpan={3}></td>
                  <td className="text-right pr-6 pl-4 py-4">
                    <p className="text-2xl font-bold text-primary">3.58</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t('student.grades.summary.gpa')}</p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            {/* Cumulative GPA */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.grades.summary.cumulative')}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-text-main">3.85</span>
                <span className="bg-green-100 rounded-full px-2 py-1 text-xs font-medium text-green-700">
                  {t('student.grades.summary.cumulativeTrend').replace('{value}', '+0.2')}
                </span>
              </div>
            </div>

            {/* Total Credits */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.grades.summary.credits')}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-text-main">84 / 144</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[58%]" />
                </div>
              </div>
            </div>

            {/* Rank */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-medium text-text-sub mb-1">{t('student.grades.summary.rank')}</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-text-main">#12 </span>
                <span className="text-lg text-slate-400">{t('student.grades.summary.rankOf').replace('{total}', '120')}</span>
                <TrendingUp className="w-2.5 h-5 text-green-500 ml-3" />
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
