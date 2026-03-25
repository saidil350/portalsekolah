'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/utils/dictionary';
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  FileText,
  BarChart3,
  Calculator,
  Send,
} from 'lucide-react';

// Data tugas/assignments
const assignmentsData = [
  { id: 1, titleKey: 'teacher.grading.data.midTermAlgebra', subjectKey: 'teacher.subject.mathematics', classKey: 'teacher.class.10a', dueDateKey: 'teacher.date.jan25_2025', status: 'ACTIVE', submitted: 28, total: 32, avgScore: 78 },
  { id: 2, titleKey: 'teacher.grading.data.quiz3Trig', subjectKey: 'teacher.subject.mathematics', classKey: 'teacher.class.10b', dueDateKey: 'teacher.date.jan22_2025', status: 'CLOSED', submitted: 30, total: 30, avgScore: 82 },
  { id: 3, titleKey: 'teacher.grading.data.labReportMechanics', subjectKey: 'teacher.subject.physics', classKey: 'teacher.class.11a', dueDateKey: 'teacher.date.jan28_2025', status: 'ACTIVE', submitted: 15, total: 32, avgScore: 0 },
  { id: 4, titleKey: 'teacher.grading.data.hw5Derivatives', subjectKey: 'teacher.subject.calculus', classKey: 'teacher.class.12a', dueDateKey: 'teacher.date.feb1_2025', status: 'DRAFT', submitted: 0, total: 28, avgScore: 0 },
  { id: 5, titleKey: 'teacher.grading.data.finalExamKinematics', subjectKey: 'teacher.subject.physics', classKey: 'teacher.class.11b', dueDateKey: 'teacher.date.jan18_2025', status: 'CLOSED', submitted: 31, total: 31, avgScore: 75 },
];

// Data grade book per siswa
const gradeBook = [
  { id: 1, name: 'Ahmad Rizky', assignment1: 85, assignment2: 78, assignment3: 90, midTerm: 82, average: 83.75 },
  { id: 2, name: 'Siti Nurhaliza', assignment1: 92, assignment2: 88, assignment3: 95, midTerm: 90, average: 91.25 },
  { id: 3, name: 'Budi Santoso', assignment1: 70, assignment2: 65, assignment3: 72, midTerm: 68, average: 68.75 },
  { id: 4, name: 'Dewi Kartini', assignment1: 88, assignment2: 90, assignment3: 87, midTerm: 85, average: 87.50 },
  { id: 5, name: 'Farhan Maulana', assignment1: 75, assignment2: 80, assignment3: 78, midTerm: 76, average: 77.25 },
  { id: 6, name: 'Gita Puspita', assignment1: 95, assignment2: 92, assignment3: 98, midTerm: 94, average: 94.75 },
  { id: 7, name: 'Hendra Wijaya', assignment1: 60, assignment2: 58, assignment3: 65, midTerm: 62, average: 61.25 },
  { id: 8, name: 'Intan Permata', assignment1: 82, assignment2: 85, assignment3: 80, midTerm: 83, average: 82.50 },
];

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getScoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}

export default function PenilaianPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">{t('teacher.grading.title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-[256px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[15px] w-[15px] text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('teacher.grading.search')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 px-4 py-2 outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm shadow-primary/30 transition-all cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {t('teacher.grading.newAssignment')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 flex items-center h-[56px]">
              <button className="px-4 h-full flex items-center gap-2 text-sm font-semibold text-primary border-b-2 border-primary transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                {t('teacher.grading.tab.assignments')}
              </button>
              <button className="px-4 h-full flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                <BarChart3 className="w-4 h-4" />
                {t('teacher.grading.tab.gradeBook')}
              </button>
              <button className="px-4 h-full flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                <BarChart3 className="w-4 h-4" />
                {t('teacher.grading.tab.analytics')}
              </button>
            </div>

            {/* Assignments List */}
            <div className="divide-y divide-slate-50">
              {assignmentsData.map((assignment) => (
                <div key={assignment.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-text-main truncate">{t(assignment.titleKey as TranslationKey)}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge[assignment.status]}`}>
                        {t(`teacher.grading.status.${assignment.status}` as TranslationKey)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-slate-500">{t(assignment.subjectKey as TranslationKey)}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{t(assignment.classKey as TranslationKey)}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{t('teacher.grading.duePrefix')} {t(assignment.dueDateKey as TranslationKey)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{t('teacher.grading.submitted')}</p>
                      <p className="text-sm font-semibold text-text-main">{assignment.submitted}/{assignment.total}</p>
                    </div>
                    {assignment.avgScore > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{t('teacher.grading.avgScore')}</p>
                        <p className={`text-sm font-semibold ${getScoreColor(assignment.avgScore)}`}>{assignment.avgScore}</p>
                      </div>
                    )}
                    {/* Progress bar */}
                    <div className="w-[100px]">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${assignment.total > 0 ? (assignment.submitted / assignment.total) * 100 : 0}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                    <button title="Options" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="16" r="2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Book Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-text-main">{t('teacher.grading.tab.gradeBook')}</h3>
                <span className="text-xs text-slate-400">{t('teacher.subject.mathematics')} - {t('teacher.class.10a')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-all cursor-pointer">
                  <Calculator className="w-3.5 h-3.5" />
                  {t('teacher.grading.autoCalculate')}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-all cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                  {t('teacher.grading.publishGrades')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.student')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.assignment1')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.assignment2')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.assignment3')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.midTerm')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.grading.table.average')}</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeBook.map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-3 text-sm font-medium text-text-main">{student.name}</td>
                      <td className={`px-6 py-3 text-sm font-semibold text-center ${getScoreColor(student.assignment1)}`}>{student.assignment1}</td>
                      <td className={`px-6 py-3 text-sm font-semibold text-center ${getScoreColor(student.assignment2)}`}>{student.assignment2}</td>
                      <td className={`px-6 py-3 text-sm font-semibold text-center ${getScoreColor(student.assignment3)}`}>{student.assignment3}</td>
                      <td className={`px-6 py-3 text-sm font-semibold text-center ${getScoreColor(student.midTerm)}`}>{student.midTerm}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(student.average)} bg-slate-50`}>
                          {student.average.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
