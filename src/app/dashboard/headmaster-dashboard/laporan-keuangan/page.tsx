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
import { useLanguage } from '@/contexts/LanguageContext';

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
  { tingkat: '10', jumlahSiswa: 12, nominal: 'Rp 34.500.000', status: 'warning' },
  { tingkat: '11', jumlahSiswa: 18, nominal: 'Rp 52.800.000', status: 'danger' },
  { tingkat: '12', jumlahSiswa: 12, nominal: 'Rp 38.100.000', status: 'success' },
];

export default function LaporanKeuanganPage() {
  const { t } = useLanguage();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'warning': return t('headmaster.financialReport.status.action');
      case 'danger': return t('headmaster.financialReport.status.critical');
      case 'success': return t('headmaster.financialReport.status.controlled');
      default: return '';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'warning') return 'bg-yellow-100 text-yellow-700';
    if (status === 'danger') return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-slate-900 text-4xl font-bold tracking-tight">
                {t('headmaster.financialReport.title')}
              </h2>
              <p className="text-slate-500 text-base">
                {t('headmaster.financialReport.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
                <FileText className="w-3.5 h-3.5" />
                {t('headmaster.financialReport.export.pdf')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                {t('headmaster.financialReport.export.excel')}
              </button>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 leading-5">
                  {t('headmaster.financialReport.kpi.revenue')}
                </p>
                <div className="w-[34px] h-[29px] bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />2.450.000.000</h3>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-2 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {t('headmaster.financialReport.kpi.revenue.target').replace('{value}', '+8.4%')}
                </span>
              </div>
            </div>

            {/* Total Tunggakan */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {t('headmaster.financialReport.kpi.arrears')}
                </p>
                <div className="w-[32px] h-[34px] bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />125.400.000</h3>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-medium text-red-600">
                  {t('headmaster.financialReport.kpi.arrears.desc').replace('{value}', '42')}
                </span>
              </div>
            </div>

            {/* Rasio Kelunasan */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {t('headmaster.financialReport.kpi.ratio')}
                </p>
                <div className="w-[33px] h-[33px] bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">96.8%</h3>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-2 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {t('headmaster.financialReport.kpi.ratio.desc').replace('{value}', '+2%')}
                </span>
              </div>
            </div>

            {/* Dana Operasional */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {t('headmaster.financialReport.kpi.ops')}
                </p>
                <div className="w-[33px] h-[33px] bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-8">Rp<br />842.150.000</h3>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">
                  {t('headmaster.financialReport.kpi.ops.update').replace('{value}', '1 jam')}
                </span>
              </div>
            </div>
          </div>

          {/* Line Chart - Trend Arus Kas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-6 min-w-[600px]">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t('headmaster.financialReport.chart.cashflow.title')}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t('headmaster.financialReport.chart.cashflow.subtitle')}
                </p>
              </div>
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-slate-600">
                  {t('headmaster.financialReport.chart.cashflow.legend').replace('{value}', '2023/24')}
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[288px] min-w-[600px]">
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
                <h3 className="text-lg font-bold text-slate-900">
                  {t('headmaster.financialReport.chart.status.title')}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t('headmaster.financialReport.chart.status.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
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
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('headmaster.financialReport.chart.status.paid')}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-slate-600">
                        {t('headmaster.financialReport.chart.status.paid')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {t('headmaster.financialReport.chart.status.count').replace('{value}', '1.062')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-slate-600 leading-5">
                        {t('headmaster.financialReport.chart.status.unpaid')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-5 text-right">
                      {t('headmaster.financialReport.chart.status.count').replace('{value}', '188')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                      {t('headmaster.financialReport.chart.status.link')}
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tunggakan per Tingkatan */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
              <div className="mb-6 min-w-[400px]">
                <h3 className="text-lg font-bold text-slate-900">
                   {t('headmaster.financialReport.table.arrears.title')}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t('headmaster.financialReport.table.arrears.subtitle')}
                </p>
              </div>

              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('headmaster.financialReport.table.arrears.level')}
                    </th>
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider leading-4">
                      {t('headmaster.financialReport.table.arrears.count')}
                    </th>
                    <th className="text-left pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider leading-4">
                      {t('headmaster.financialReport.table.arrears.amount')}
                    </th>
                    <th className="text-right pb-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('headmaster.financialReport.table.arrears.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tunggakanData.map((item, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="py-4 text-sm font-medium text-slate-900">
                        {t('headmaster.academicReport.table.class').replace('{value}', item.tingkat)}
                      </td>
                      <td className="py-4 text-sm text-slate-600">
                        {t('headmaster.financialReport.chart.status.count').replace('{value}', item.jumlahSiswa.toString())}
                      </td>
                      <td className="py-4 text-sm text-slate-600">{item.nominal}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                          {getStatusText(item.status)}
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
