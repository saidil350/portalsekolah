'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/utils/dictionary';
import {
  Search,
  ChevronDown,
  Download,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
} from 'lucide-react';

const studentsData = [
  { id: 1, name: 'Ahmad Rizky', nisn: '0051234001', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 2, name: 'Siti Nurhaliza', nisn: '0051234002', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 3, name: 'Budi Santoso', nisn: '0051234003', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Late', notesKey: 'teacher.attendance.notes.late15' },
  { id: 4, name: 'Dewi Kartini', nisn: '0051234004', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 5, name: 'Farhan Maulana', nisn: '0051234005', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Sick', notesKey: 'teacher.attendance.notes.sickFlu' },
  { id: 6, name: 'Gita Puspita', nisn: '0051234006', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 7, name: 'Hendra Wijaya', nisn: '0051234007', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 8, name: 'Intan Permata', nisn: '0051234008', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Absent', notesKey: 'teacher.attendance.notes.noInfo' },
  { id: 9, name: 'Joko Prasetyo', nisn: '0051234009', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 10, name: 'Kartika Sari', nisn: '0051234010', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Present', notesKey: 'teacher.attendance.notes.none' },
  { id: 11, name: 'Lukman Hakim', nisn: '0051234011', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Late', notesKey: 'teacher.attendance.notes.traffic' },
  { id: 12, name: 'Maya Anggraini', nisn: '0051234012', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', status: 'Absent', notesKey: 'teacher.attendance.notes.family' },
];

const statusStyles: Record<string, string> = {
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Late: 'bg-amber-50 text-amber-700 border-amber-200',
  Sick: 'bg-blue-50 text-blue-700 border-blue-200',
  Absent: 'bg-red-50 text-red-700 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  Present: <UserCheck className="w-3.5 h-3.5" />,
  Late: <Clock className="w-3.5 h-3.5" />,
  Sick: <AlertCircle className="w-3.5 h-3.5" />,
  Absent: <UserX className="w-3.5 h-3.5" />,
};

export default function KehadiranPage() {
  const { t } = useLanguage();

  const presentCount = studentsData.filter(s => s.status === 'Present').length;
  const lateCount = studentsData.filter(s => s.status === 'Late').length;
  const sickCount = studentsData.filter(s => s.status === 'Sick').length;
  const absentCount = studentsData.filter(s => s.status === 'Absent').length;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">{t('teacher.attendance.title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-[256px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[15px] w-[15px] text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('teacher.attendance.search')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 px-4 py-2 outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
            <Download className="w-4 h-4" />
            {t('teacher.attendance.export')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Class Selector */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              {t('teacher.attendance.classMath10a')}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <span className="text-sm text-slate-500">{t('teacher.attendance.dateMath10a')}</span>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{t('teacher.attendance.totalStudents')}</p>
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-main mt-2">{studentsData.length}</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{t('teacher.attendance.markedPresent')}</p>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">{presentCount}</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{t('teacher.attendance.lateSick')}</p>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-600 mt-2">{lateCount + sickCount}</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{t('teacher.attendance.absent')}</p>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-red-500 mt-2">{absentCount}</h3>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-[50px]">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.attendance.table.student')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.attendance.table.nisn')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.attendance.table.status')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('teacher.attendance.table.notes')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-[80px]">{t('teacher.attendance.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 relative">
                            <Image src={student.photo} alt={student.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm font-medium text-text-main">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.nisn}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[student.status]}`}>
                          {statusIcons[student.status]}
                          {t(`teacher.attendance.status.${student.status}` as TranslationKey)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{t(student.notesKey as TranslationKey)}</td>
                      <td className="px-6 py-4">
                        <button title="Options" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="16" r="2"/></svg>
                        </button>
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
