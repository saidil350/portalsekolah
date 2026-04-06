'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MoreVertical, ArrowUpRight, TrendingUp, Users, UserCheck, School, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, MetricSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import RoleGreetingCard from '@/components/dashboard/RoleGreetingCard';
import { getCurrentAdmin } from './actions';
import { type User } from '@/types/user';


interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
}

interface StudentStats {
  active: number;
  graduated: number;
  transferred: number;
  dropout: number;
  inactive: number;
  total: number;
}

interface FinancialStats {
  unpaidCount: number;
  recentInvoices: any[];
}

interface AttendanceStats {
  trend: { month: string; percentage: number }[];
  overall: number;
  lastSemesterComparison: string;
}

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
  });
  const [studentStats, setStudentStats] = useState<StudentStats>({
    active: 0,
    graduated: 0,
    transferred: 0,
    dropout: 0,
    inactive: 0,
    total: 0,
  });
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    unpaidCount: 0,
    recentInvoices: [],
  });
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    trend: [],
    overall: 0,
    lastSemesterComparison: '0%',
  });
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  useEffect(() => {
    async function fetchAllStats() {
      setLoading(true);
      try {
        const [statsRes, studentRes, financialRes, attendanceRes, profileData] = await Promise.all([
          fetch('/api/admin/stats').then(res => res.json()),
          fetch('/api/admin/student-stats').then(res => res.json()),
          fetch('/api/admin/financial-stats').then(res => res.json()),
          fetch('/api/admin/attendance-stats').then(res => res.json()),
          getCurrentAdmin()
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (studentRes.success) setStudentStats(studentRes.data);
        if (financialRes.success) setFinancialStats(financialRes.data);
        if (attendanceRes.success) setAttendanceStats(attendanceRes.data);
        if (profileData) setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Helper to render the custom animated chart
  const renderAttendanceChart = () => {
    if (loading || attendanceStats.trend.length === 0) {
      return <div className="h-48 w-full bg-slate-50 animate-pulse rounded-lg" />;
    }

    const data = attendanceStats.trend;
    const width = 600;
    const height = 200;
    const padding = 40;
    
    // Points calculation
    const points = data.map((d, i) => ({
      x: (i * (width - padding * 2)) / (data.length - 1) + padding,
      y: (height - padding) - (d.percentage / 100) * (height - padding * 2)
    }));

    const pathData = `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    const fillPathData = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="relative w-full h-full pt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(p => (
            <line 
              key={p} 
              x1={padding} 
              y1={(height - padding) - (p / 100) * (height - padding * 2)} 
              x2={width - padding} 
              y2={(height - padding) - (p / 100) * (height - padding * 2)} 
              stroke="#e2e8f0" 
              strokeDasharray="4 4" 
            />
          ))}
          
          {/* Gradient area */}
          <motion.path
            d={fillPathData}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
          />
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Main line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ r: 6, strokeWidth: 3 }}
            />
          ))}
        </svg>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 px-6">
          {data.map((d, i) => (
            <span key={i} className="text-xs font-medium text-text-sub">{d.month}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Header Section */}
          {/* Header Section with RoleGreetingCard */}
          {loading ? (
            <div className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl mb-8" />
          ) : (
            <RoleGreetingCard 
              userName={userProfile?.full_name || "Administrator"} 
              role={userProfile?.role || "ADMIN_IT"} 
              schoolName={userProfile?.organization_name || "Nama Sekolah / Instansi"}
            />
          )}


          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 - Total Students */}
            <motion.div variants={itemVariants} className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-primary/30 transition-colors">
              {loading ? (
                <MetricSkeleton hasTrend={false} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full gap-1">
                      <TrendingUp className="w-3 h-3" /> +5%
                    </span>
                  </div>
                  <div>
                    <p className="text-text-sub text-sm font-medium">{t('admin.db.totalStudents')}</p>
                    <h3 className="text-text-main text-3xl font-bold mt-1">
                      {stats.totalStudents.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Card 2 - Total Teachers */}
            <motion.div variants={itemVariants} className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-primary/30 transition-colors">
              {loading ? (
                <MetricSkeleton hasTrend={false} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full gap-1">
                      <TrendingUp className="w-3 h-3" /> +2%
                    </span>
                  </div>
                  <div>
                    <p className="text-text-sub text-sm font-medium">{t('admin.db.totalTeachers')}</p>
                    <h3 className="text-text-main text-3xl font-bold mt-1">
                      {stats.totalTeachers.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Card 3 - Active Classes */}
            <motion.div variants={itemVariants} className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-primary/30 transition-colors">
              {loading ? (
                <MetricSkeleton hasTrend={false} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <School className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full gap-1">
                      0%
                    </span>
                  </div>
                  <div>
                    <p className="text-text-sub text-sm font-medium">{t('admin.db.activeClasses')}</p>
                    <h3 className="text-text-main text-3xl font-bold mt-1">
                      {stats.activeClasses.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Card 4 - Unpaid Bills */}
            <motion.div variants={itemVariants} className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-primary/30 transition-colors">
              {loading ? (
                <MetricSkeleton hasTrend={false} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.floor(financialStats.unpaidCount / 10)}
                    </span>
                  </div>
                  <div>
                    <p className="text-text-sub text-sm font-medium">{t('admin.db.unpaidBills')}</p>
                    <h3 className="text-text-main text-3xl font-bold mt-1">
                      {financialStats.unpaidCount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Chart & Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-text-main text-lg font-bold">{t('admin.db.attendanceTrend')}</h3>
                    <p className="text-text-sub text-sm">{t('admin.db.attendanceDesc')}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-text-main">
                      {loading ? '...' : `${attendanceStats.overall}%`}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {attendanceStats.lastSemesterComparison} {t('admin.db.comparedToLastSem')}
                    </span>
                  </div>
                </div>
                
                {/* Custom Interactive Chart */}
                <div className="h-64 w-full">
                  {renderAttendanceChart()}
                </div>
              </div>
            </motion.div>

            {/* Student Status Widget */}
            <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-text-main text-lg font-bold">{t('admin.db.studentStatus')}</h3>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="text" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.active')}</span>
                        <span className="font-medium">{studentStats.active.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${studentStats.total > 0 ? (studentStats.active / studentStats.total) * 100 : 0}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                    {/* Graduated */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.graduated')}</span>
                        <span className="font-medium">{studentStats.graduated.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-purple-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${studentStats.total > 0 ? (studentStats.graduated / studentStats.total) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                    </div>
                    {/* Transferred */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.transferred')}</span>
                        <span className="font-medium">{studentStats.transferred.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-orange-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${studentStats.total > 0 ? (studentStats.transferred / studentStats.total) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                    {/* Dropout */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.dropout')}</span>
                        <span className="font-medium">{studentStats.dropout.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-red-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${studentStats.total > 0 ? (studentStats.dropout / studentStats.total) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                    {/* Inactive */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.inactive')}</span>
                        <span className="font-medium">{studentStats.inactive.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-gray-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${studentStats.total > 0 ? (studentStats.inactive / studentStats.total) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Outstanding Fees Table Section */}
          <motion.div variants={itemVariants} className="bg-surface-light rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-text-main text-lg font-bold">{t('admin.db.outstandingFeesTitle')}</h3>
                <p className="text-text-sub text-sm">{t('admin.db.outstandingFeesDesc')}</p>
              </div>
              <a className="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="#/financials">
                {t('admin.db.viewAll')}
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton rows={3} columns={6} />
              ) : financialStats.recentInvoices.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <p className="text-text-sub font-medium">Tidak ada tunggakan biaya saat ini.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-text-sub text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                      <th className="px-6 py-4">{t('admin.db.table.studentName')}</th>
                      <th className="px-6 py-4">{t('admin.db.table.class')}</th>
                      <th className="px-6 py-4">{t('admin.db.table.month')}</th>
                      <th className="px-6 py-4">{t('admin.db.table.amount')}</th>
                      <th className="px-6 py-4">{t('admin.db.table.status')}</th>
                      <th className="px-6 py-4 text-right">{t('admin.db.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {financialStats.recentInvoices.map((inv, index) => (
                        <motion.tr 
                          key={inv.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                index % 3 === 0 ? 'bg-purple-100 text-purple-600' : 
                                index % 3 === 1 ? 'bg-blue-100 text-blue-600' : 
                                'bg-orange-100 text-orange-600'
                              }`}>
                                {inv.studentName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-text-main text-sm">{inv.studentName}</p>
                                <p className="text-text-sub text-xs">NISN: {inv.nisn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-sub">{inv.className}</td>
                          <td className="px-6 py-4 text-sm text-text-sub">{inv.month}</td>
                          <td className="px-6 py-4 font-medium text-text-main text-sm">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inv.status === 'ARREARS' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inv.status === 'ARREARS' ? t('admin.db.status.arrears') : t('admin.db.status.pending')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1" aria-label="More options">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>            
        </motion.div>
      </div>
    </main>
  );
}
