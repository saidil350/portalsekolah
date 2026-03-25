'use client';

import React from 'react';
import {
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

// Data kehadiran per kelas
const kelasData = [
  { kelas: 'X-A', persen: 96.5, isWarning: false },
  { kelas: 'X-B', persen: 92.1, isWarning: false },
  { kelas: 'XI-IPA1', persen: 95.0, isWarning: false },
  { kelas: 'XI-IPA2', persen: 78.4, isWarning: true },
  { kelas: 'XI-IPS1', persen: 90.2, isWarning: false },
  { kelas: 'XII-IPA1', persen: 94.8, isWarning: false },
  { kelas: 'XII-IPA2', persen: 97.2, isWarning: false },
  { kelas: 'XII-IPS1', persen: 89.9, isWarning: false },
];

// Data siswa ketidakhadiran kronis
const siswaKronis = [
  { nama: 'Adi Saputra', inisial: 'AS', kelas: 'XI-IPA2', sakit: '4 Hari', izin: '2 Hari', alpha: '8 Hari', kehadiran: 72.5, color: 'red' },
  { nama: 'Maya Rosita', inisial: 'MR', kelas: 'XI-IPA2', sakit: '1 Hari', izin: '0 Hari', alpha: '12 Hari', kehadiran: 75.0, color: 'red' },
  { nama: 'Budi Jatmiko', inisial: 'BJ', kelas: 'X-B', sakit: '6 Hari', izin: '4 Hari', alpha: '5 Hari', kehadiran: 78.2, color: 'orange' },
  { nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII-IPS1', sakit: '2 Hari', izin: '3 Hari', alpha: '6 Hari', kehadiran: 79.8, color: 'orange' },
];

// Tinggi bar berdasarkan persentase (max = 240px = 100%)
function getBarHeight(persen: number) {
  return Math.round((persen / 100) * 240);
}

function getKehadiranColor(persen: number) {
  if (persen < 75) return { text: 'text-red-600', bar: 'bg-red-500' };
  if (persen < 80) return { text: 'text-orange-600', bar: 'bg-orange-500' };
  return { text: 'text-red-600', bar: 'bg-red-500' };
}

export default function LaporanPresensiPage() {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-slate-900 text-4xl font-bold tracking-tight">Laporan Presensi Siswa</h2>
              <p className="text-slate-500 text-base leading-6">
                Monitoring kehadiran siswa secara berkala untuk deteksi dini ketidakhadiran<br />kronis.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-start">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Waktu</label>
                  <div className="relative">
                    <select title="Pilih Rentang Waktu" className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer min-w-[140px]">
                      <option>Semester Ini</option>
                      <option>Bulan Ini</option>
                      <option>Minggu Ini</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Kelas</label>
                  <div className="relative">
                    <select title="Pilih Tingkat Kelas" className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer min-w-[120px]">
                      <option>Semua</option>
                      <option>Kelas 10</option>
                      <option>Kelas 11</option>
                      <option>Kelas 12</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rata-rata Kehadiran Per Kelas</h3>
                <p className="text-sm text-slate-500 mt-0.5">Perbandingan persentase kehadiran antar kelas pada semester ini.</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-slate-500">Hadir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-xs font-medium text-slate-500">Ketidakhadiran</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative">
              {/* Y-axis grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-12">
                {['100%', '80%', '60%', '40%', '0%'].map((label, i) => (
                  <div key={label} className="flex items-center">
                    <span className="text-[10px] font-medium text-slate-400 w-8 text-right mr-2">{label}</span>
                    <div className="flex-1 border-b border-slate-100" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex items-end justify-between px-10 pb-8 h-[288px]">
                {kelasData.map((item) => {
                  const height = getBarHeight(item.persen);
                  return (
                    <div key={item.kelas} className="flex flex-col items-center flex-1 group cursor-pointer">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded mb-1">
                        {item.persen}%
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-10 rounded-t transition-all ${
                          item.isWarning
                            ? 'bg-orange-400 shadow-[0px_-2px_8px_-2px_rgba(251,146,60,0.4)]'
                            : 'bg-primary'
                        }`}
                        style={{ height: `${height}px` } as React.CSSProperties}
                      />
                      {/* Label */}
                      <span className={`text-[10px] font-bold uppercase mt-3 ${
                        item.isWarning ? 'text-orange-600 font-black' : 'text-slate-500'
                      }`}>
                        {item.kelas}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabel Deteksi Ketidakhadiran Kronis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-[22px] h-[19px] text-red-500" />
                  <h3 className="text-lg font-bold text-slate-900">Deteksi Ketidakhadiran Kronis</h3>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">Siswa dengan persentase kehadiran di bawah ambang batas (80%).</p>
              </div>
              <div className="bg-red-50 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-red-600">Ditemukan 4 Siswa</span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sakit</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Izin</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Alpha</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {siswaKronis.map((siswa, i) => {
                  const style = getKehadiranColor(siswa.kehadiran);
                  return (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-slate-600">{siswa.inisial}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{siswa.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-600">{siswa.kelas}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">{siswa.sakit}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">{siswa.izin}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-bold text-red-500">{siswa.alpha}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-sm font-bold ${
                            siswa.color === 'red' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {siswa.kehadiran}%
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                siswa.color === 'red' ? 'bg-red-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${siswa.kehadiran}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-4">
              <p className="text-xs text-slate-500 text-center">
                Data ini diperbarui secara otomatis dari sistem presensi harian guru. Silakan hubungi Wali Kelas untuk tindak lanjut.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
