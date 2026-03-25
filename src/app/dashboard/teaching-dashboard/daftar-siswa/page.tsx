'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/utils/dictionary';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';

// Data daftar siswa
const studentsData = [
  { id: 1, name: 'Ahmad Rizky', nisn: '0051234001', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10a', subjectKey: 'teacher.subject.mathematics', email: 'ahmad.r@school.id', phone: '081234567001', status: 'Active' },
  { id: 2, name: 'Siti Nurhaliza', nisn: '0051234002', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10a', subjectKey: 'teacher.subject.mathematics', email: 'siti.n@school.id', phone: '081234567002', status: 'Active' },
  { id: 3, name: 'Budi Santoso', nisn: '0051234003', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10b', subjectKey: 'teacher.subject.mathematics', email: 'budi.s@school.id', phone: '081234567003', status: 'Active' },
  { id: 4, name: 'Dewi Kartini', nisn: '0051234004', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10a', subjectKey: 'teacher.subject.mathematics', email: 'dewi.k@school.id', phone: '081234567004', status: 'Active' },
  { id: 5, name: 'Farhan Maulana', nisn: '0051234005', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.11a', subjectKey: 'teacher.subject.physics', email: 'farhan.m@school.id', phone: '081234567005', status: 'Active' },
  { id: 6, name: 'Gita Puspita', nisn: '0051234006', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.11a', subjectKey: 'teacher.subject.physics', email: 'gita.p@school.id', phone: '081234567006', status: 'Active' },
  { id: 7, name: 'Hendra Wijaya', nisn: '0051234007', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.11b', subjectKey: 'teacher.subject.physics', email: 'hendra.w@school.id', phone: '081234567007', status: 'Active' },
  { id: 8, name: 'Intan Permata', nisn: '0051234008', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10b', subjectKey: 'teacher.subject.mathematics', email: 'intan.p@school.id', phone: '081234567008', status: 'Inactive' },
  { id: 9, name: 'Joko Prasetyo', nisn: '0051234009', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.12a', subjectKey: 'teacher.subject.calculus', email: 'joko.p@school.id', phone: '081234567009', status: 'Active' },
  { id: 10, name: 'Kartika Sari', nisn: '0051234010', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.12a', subjectKey: 'teacher.subject.calculus', email: 'kartika.s@school.id', phone: '081234567010', status: 'Active' },
  { id: 11, name: 'Lukman Hakim', nisn: '0051234011', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.10c', subjectKey: 'teacher.subject.mathematics', email: 'lukman.h@school.id', phone: '081234567011', status: 'Active' },
  { id: 12, name: 'Maya Anggraini', nisn: '0051234012', photo: '/e8e5016df7405cff81034afb951f9b53c109ae19.png', classKey: 'teacher.class.12b', subjectKey: 'teacher.subject.calculus', email: 'maya.a@school.id', phone: '081234567012', status: 'Active' },
];

export default function DaftarSiswaPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">{t('teacher.studentList.title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-[256px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[15px] w-[15px] text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('teacher.studentList.search')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 px-4 py-2 outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
            <Filter className="w-4 h-4" />
            {t('teacher.studentList.filter')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
            <Download className="w-4 h-4" />
            {t('teacher.studentList.export')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Filter Row */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              {t('teacher.studentList.allClasses')}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              {t('teacher.studentList.allSubjects')}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <span className="text-sm text-slate-400 ml-2">{t('teacher.studentList.showing')} {studentsData.length} {t('teacher.studentList.students')}</span>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {studentsData.map((student) => (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 relative border-2 border-primary/10">
                    <Image src={student.photo} alt={student.name} fill className="object-cover" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-text-main truncate">{student.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {t(`teacher.studentList.status.${student.status}` as TranslationKey)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">NISN: {student.nisn}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                        {t(student.classKey as TranslationKey)}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-medium border border-purple-100">
                        {t(student.subjectKey as TranslationKey)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Contact Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {student.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
