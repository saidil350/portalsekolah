'use client';

import React, { useState } from 'react';
import {
  Download,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  MoreHorizontal,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Data siswa berprestasi per kelas
const classData = [
  {
    kelas: 'X-IPA-1',
    tingkat: '10',
    rataRata: 88.5,
    siswaBerprestasi: 'Amanda Sari',
    avatarUrl: '/64a3407aa4cd8e91132e471e4c31039cfe134cae.png',
    tingkatKelulusan: 100,
    kelulusanColor: 'green',
  },
  {
    kelas: 'XI-IPS-2',
    tingkat: '11',
    rataRata: 79.2,
    siswaBerprestasi: 'Rizky Ramadhan',
    avatarUrl: '/402fb15628cf3c13053cf3c22511ebea1ab883a9.png',
    tingkatKelulusan: 92.4,
    kelulusanColor: 'yellow',
  },
  {
    kelas: 'XII-IPA-1',
    tingkat: '12',
    rataRata: 91.7,
    siswaBerprestasi: 'Aditya Pratama',
    avatarUrl: '/41db25f06335cfba60001cff816b5ab7525c9fdb.png',
    tingkatKelulusan: 100,
    kelulusanColor: 'green',
  },
  {
    kelas: 'XII-IPS-1',
    tingkat: '12',
    rataRata: 84.0,
    siswaBerprestasi: 'Nia Kurnia',
    avatarUrl: '/640d9f4c0f6bcfbe60465effaf621c474dc8bbd1.png',
    tingkatKelulusan: 98.5,
    kelulusanColor: 'green',
  },
  {
    kelas: 'XI-IPA-3',
    tingkat: '11',
    rataRata: 74.8,
    siswaBerprestasi: 'Budi Santoso',
    avatarUrl: '/5e98565876db13cee4dd9db2070defc9de35af23.png',
    tingkatKelulusan: 85.0,
    kelulusanColor: 'red',
  },
];

// Data sebaran nilai
const sebaranNilai = [
  { range: '< 60', count: 45, height: 'h-[26px]', color: 'bg-slate-200' },
  { range: '60-70', count: 78, height: 'h-[45px]', color: 'bg-slate-200' },
  { range: '70-80', count: 142, height: 'h-[83px]', color: 'bg-primary/40' },
  { range: '80-90', count: 210, height: 'h-[120px]', color: 'bg-primary' },
  { range: '90-100', count: 92, height: 'h-[58px]', color: 'bg-primary/60' },
];

// Fungsi helper warna progress bar
function getKelulusanStyle(color: string, persen: number) {
  if (color === 'green') return { barColor: 'bg-green-500', textColor: 'text-green-600', width: `${persen}%` };
  if (color === 'yellow') return { barColor: 'bg-yellow-400', textColor: 'text-yellow-600', width: `${persen}%` };
  return { barColor: 'bg-red-500', textColor: 'text-red-600', width: `${persen}%` };
}

export default function LaporanAkademikPage() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">

          {/* Header Section */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-slate-900 text-3xl font-bold tracking-tight">{t('headmaster.academicReport.title')}</h2>
              <p className="text-slate-500 text-base leading-6">
                {t('headmaster.academicReport.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2">
                {/* Dropdown Tahun Ajaran */}
                <div className="relative">
                  <select title={t('headmaster.academicReport.selectYear')} className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm font-medium text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>{t('headmaster.academicReport.year').replace('{value}', '2023/2024')}</option>
                    <option>{t('headmaster.academicReport.year').replace('{value}', '2022/2023')}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Dropdown Semester */}
                <div className="relative">
                  <select title={t('headmaster.academicReport.selectSemester')} className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm font-medium text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option>{t('headmaster.academicReport.semester.even')}</option>
                    <option>{t('headmaster.academicReport.semester.odd')}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Export Button */}
              <div className="flex items-center border-l border-slate-200 pl-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all cursor-pointer">
                  <Download className="w-3 h-3" />
                  {t('headmaster.academicReport.export')}
                </button>
              </div>
            </div>
          </div>

          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rata-rata Sekolah */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.kpi.avg')}</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">82.4</h3>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">1.2</span>
                </div>
              </div>
            </div>

            {/* Tingkat Kelulusan */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.kpi.graduation')}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">96.8%</h3>
                <span className="text-xs font-medium text-slate-500">{t('headmaster.academicReport.kpi.target').replace('{value}', '95%')}</span>
              </div>
            </div>

            {/* Peringkat Tertinggi */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.kpi.topStudent')}</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-xl font-bold text-slate-900">Aditya Pratama</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded">XII-IPA-1</span>
              </div>
            </div>
          </div>

          {/* Tabel Performa Agregat per Kelas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('headmaster.academicReport.table.title')}</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('headmaster.academicReport.table.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 bg-slate-50 border-0 rounded-lg text-sm text-slate-700 placeholder:text-gray-400 focus:ring-1 focus:ring-primary outline-none w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.class')}</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.level')}</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.avg')}</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.topStudent')}</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.graduation')}</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.academicReport.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {classData
                    .filter((cls) =>
                      cls.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      cls.siswaBerprestasi.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((cls, i) => {
                      const style = getKelulusanStyle(cls.kelulusanColor, cls.tingkatKelulusan);
                      return (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <span className="text-base font-bold text-slate-900">{cls.kelas}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">
                              {t('headmaster.academicReport.level').replace('{value}', cls.tingkat)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-base font-semibold text-slate-900">{cls.rataRata}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <img
                                src={cls.avatarUrl}
                                alt={cls.siswaBerprestasi}
                                className="w-6 h-6 rounded-full bg-slate-200 shrink-0 object-cover"
                              />
                              <span className="text-sm font-medium text-slate-700">{cls.siswaBerprestasi}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-bold ${style.textColor}`}>{cls.tingkatKelulusan}%</span>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${style.barColor} rounded-full transition-all duration-500`}
                                  style={{ width: style.width } as React.CSSProperties}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title={t('headmaster.academicReport.table.details')}>
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {t('headmaster.academicReport.pagination.info')
                  .replace('{start}', '5')
                  .replace('{total}', '32')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 rounded opacity-30 cursor-pointer"
                  disabled
                  title={t('headmaster.academicReport.pagination.prev')}
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="p-2 rounded hover:bg-slate-100 cursor-pointer"
                  title={t('headmaster.academicReport.pagination.next')}
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Chart + Validasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 pb-8">
            {/* Sebaran Nilai Siswa */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="text-base font-bold text-slate-900 mb-4">{t('headmaster.academicReport.chart.title')}</h4>
              <div className="flex items-end justify-center gap-2 px-2 h-[120px]">
                {sebaranNilai.map((item) => (
                  <div
                    key={item.range}
                    className="flex-1 flex flex-col items-center group cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <span className="text-[10px] font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {item.count}
                    </span>
                    <div className={`w-full ${item.height} ${item.color} rounded-t transition-all group-hover:opacity-80`} />
                  </div>
                ))}
              </div>
              {/* X-axis labels */}
              <div className="flex items-start justify-between px-2 mt-1">
                {sebaranNilai.map((item) => (
                  <span key={item.range} className="text-[10px] font-bold text-slate-400 flex-1 text-center">
                    {item.range}
                  </span>
                ))}
              </div>
            </div>

            {/* Validasi Kurikulum */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center">
              <div className="flex items-center gap-4">
                <div className="w-[53px] h-[52px] shrink-0 bg-green-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-slate-900">{t('headmaster.academicReport.validation.title')}</h4>
                  <p className="text-sm text-slate-500 leading-5 mt-0.5">
                    {t('headmaster.academicReport.validation.desc')}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-green-600">{t('headmaster.academicReport.validation.sync')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
