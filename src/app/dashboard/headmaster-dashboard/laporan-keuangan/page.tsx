'use client';

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

// Data trend arus kas (6 bulan)
const arusKasData = [
  { bulan: 'Jan', nilai: 380 },
  { bulan: 'Feb', nilai: 420 },
  { bulan: 'Mar', nilai: 395 },
  { bulan: 'Apr', nilai: 460 },
  { bulan: 'Mei', nilai: 440 },
  { bulan: 'Jun', nilai: 480 },
];

// Data tunggakan per tingkatan
const tunggakanData = [
  { tingkat: 'Kelas 10', jumlahSiswa: '12 Siswa', nominal: 'Rp 34.500.000', status: 'warning', statusText: 'PERLU TINDAKAN' },
  { tingkat: 'Kelas 11', jumlahSiswa: '18 Siswa', nominal: 'Rp 52.800.000', status: 'danger', statusText: 'KRITIS' },
  { tingkat: 'Kelas 12', jumlahSiswa: '12 Siswa', nominal: 'Rp 38.100.000', status: 'success', statusText: 'TERKENDALI' },
];

function getStatusStyle(status: string) {
  if (status === 'warning') return 'bg-yellow-100 text-yellow-700';
  if (status === 'danger') return 'bg-red-100 text-red-700';
  return 'bg-green-100 text-green-700';
}

export default function LaporanKeuanganPage() {
  const maxArusKas = Math.max(...arusKasData.map((d) => d.nilai));

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-slate-900 text-4xl font-bold tracking-tight">Laporan Keuangan</h2>
              <p className="text-slate-500 text-base">Ikhtisar pendapatan SPP, tunggakan, dan analisis arus kas operasional.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
                <FileText className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 leading-5">Total Revenue<br />(SPP)</p>
                <div className="w-[34px] h-[29px] bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />2.450.000.000</h3>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-2 text-green-600" />
                <span className="text-xs font-medium text-green-600">+8.4% dari target</span>
              </div>
            </div>

            {/* Total Tunggakan */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total Tunggakan</p>
                <div className="w-[32px] h-[34px] bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />125.400.000</h3>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-medium text-red-600">42 Siswa Belum Lunas</span>
              </div>
            </div>

            {/* Rasio Kelunasan */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Rasio Kelunasan</p>
                <div className="w-[33px] h-[33px] bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">96.8%</h3>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-2 text-green-600" />
                <span className="text-xs font-medium text-green-600">+2% dari bulan lalu</span>
              </div>
            </div>

            {/* Dana Operasional */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Dana Operasional</p>
                <div className="w-[33px] h-[33px] bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />842.150.000</h3>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">Update 1 jam yang lalu</span>
              </div>
            </div>
          </div>

          {/* Line Chart - Trend Arus Kas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Trend Arus Kas Masuk (SPP)</h3>
                <p className="text-sm text-slate-500 mt-0.5">Perbandingan realisasi pembayaran SPP dalam 6 bulan terakhir.</p>
              </div>
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-slate-600">Realisasi 2023/24</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[288px]">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between w-10">
                {['500jt', '400jt', '300jt', '200jt', '100jt', '0'].map((label) => (
                  <span key={label} className="text-[10px] text-slate-400">{label}</span>
                ))}
              </div>

              {/* Chart grid + bars */}
              <div className="ml-10 h-[240px] border-l border-b border-slate-200 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full border-t border-slate-100/50" />
                  ))}
                </div>

                {/* SVG line chart */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#137fec" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M${arusKasData.map((d, i) => {
                      const x = (i / (arusKasData.length - 1)) * 600;
                      const y = 240 - (d.nilai / 500) * 240;
                      return `${x},${y}`;
                    }).join(' L')} L600,240 L0,240 Z`}
                    fill="url(#areaGradient)"
                  />
                  <polyline
                    points={arusKasData.map((d, i) => {
                      const x = (i / (arusKasData.length - 1)) * 600;
                      const y = 240 - (d.nilai / 500) * 240;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#137fec"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Dots */}
                  {arusKasData.map((d, i) => {
                    const x = (i / (arusKasData.length - 1)) * 600;
                    const y = 240 - (d.nilai / 500) * 240;
                    return <circle key={i} cx={x} cy={y} r="5" fill="#137fec" stroke="white" strokeWidth="2" />;
                  })}
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="ml-10 flex items-start justify-between mt-2">
                {arusKasData.map((d) => (
                  <span key={d.bulan} className="text-xs font-medium text-slate-500">{d.bulan}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Donut Chart + Tunggakan Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Status Pembayaran Siswa - Donut Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Status Pembayaran Siswa</h3>
                <p className="text-sm text-slate-500 mt-0.5">Distribusi kelunasan SPP semester genap.</p>
              </div>

              <div className="flex items-center justify-center gap-8">
                {/* Donut Chart SVG */}
                <div className="relative w-[176px] h-[176px]">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" />
                    {/* Lunas portion (85%) */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#137fec"
                      strokeWidth="12"
                      strokeDasharray={`${85 * 2.513} ${100 * 2.513}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">85%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lunas</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-slate-600">Lunas</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">1.062 Siswa</span>
                  </div>
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-slate-600 leading-5">Belum<br />Lunas</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-5">188<br />Siswa</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                      Lihat Daftar Tunggakan
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tunggakan per Tingkatan */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Tunggakan per Tingkatan</h3>
                <p className="text-sm text-slate-500 mt-0.5">Analisis piutang berdasarkan kelas.</p>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkatan</th>
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider leading-4">Jumlah<br />Siswa</th>
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider leading-4">Total<br />Nominal</th>
                    <th className="text-right pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tunggakanData.map((item, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="py-4 text-sm font-medium text-slate-900">{item.tingkat}</td>
                      <td className="py-4 text-sm text-slate-600">{item.jumlahSiswa}</td>
                      <td className="py-4 text-sm text-slate-600">{item.nominal}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                          {item.statusText}
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
