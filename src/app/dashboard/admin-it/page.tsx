'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch general stats
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }

        // Fetch student stats
        const studentResponse = await fetch('/api/admin/student-stats');
        const studentResult = await studentResponse.json();

        if (studentResult.success) {
          setStudentStats(studentResult.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-text-main text-3xl font-bold tracking-tight">{t('admin.db.title')}</h2>
                <p className="text-text-sub mt-1">{t('admin.db.subtitle')}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
                  <div className="w-[18.33px] h-[13.25px] flex items-center justify-center shrink-0 relative"><Image src="/1970539152c8180625f4a72f568ae51eeec70b7c.svg" alt="" fill className="object-contain pointer-events-none" /></div>
                  {t('admin.db.exportReport')}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm shadow-primary/30 transition-all cursor-pointer">
                  <div className="w-[11.6px] h-[11.6px] flex items-center justify-center shrink-0 relative"><Image src="/995b6a2f4aca9f4d80693e4dca226b851d6fca51.svg" alt="" fill className="object-contain pointer-events-none" /></div>
                  {t('admin.db.newAnnouncement')}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-[38px] h-[34px] relative shrink-0"><Image src="/d32572d68ab64ad7b6f07891b1d780934c7b715b.svg" alt="" fill className="object-contain" /></div>
                  <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 pl-[8px] pr-[8px] py-[4px] rounded-full gap-1">
                    <div className="w-[15.6px] h-[7px] relative shrink-0"><Image src="/f93d432540a1ad7a9f84b150eca379bf108dbcf4.svg" alt="" fill className="object-contain" /></div> +5%
                  </span>
                </div>
                <div>
                  <p className="text-text-sub text-sm font-medium">{t('admin.db.totalStudents')}</p>
                  <h3 className="text-text-main text-3xl font-bold mt-1">
                    {loading ? '...' : stats.totalStudents.toLocaleString('id-ID')}
                  </h3>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-[32px] h-[32px] relative shrink-0"><Image src="/dbb984409e768d210175b26d825d1ae8d9ae80b2.svg" alt="" fill className="object-contain" /></div>
                  <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 pl-[8px] pr-[8px] py-[4px] rounded-full gap-1">
                    <div className="w-[15.6px] h-[7px] relative shrink-0"><Image src="/69c940ad962291caede3dffa0124d09ce979bc8b.svg" alt="" fill className="object-contain" /></div> +2%
                  </span>
                </div>
                <div>
                  <p className="text-text-sub text-sm font-medium">{t('admin.db.totalTeachers')}</p>
                  <h3 className="text-text-main text-3xl font-bold mt-1">
                    {loading ? '...' : stats.totalTeachers.toLocaleString('id-ID')}
                  </h3>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-[34px] h-[34px] relative shrink-0"><Image src="/f54583cb146cc04a1122debc4a0b3016eb9cfc00.svg" alt="" fill className="object-contain" /></div>
                  <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-100 pl-[8px] pr-[8px] py-[4px] rounded-full gap-1">
                    <div className="w-[12.1px] h-[1.1px] relative shrink-0"><Image src="/6bfab2e4139260a55a51c6029ff1c602b1928005.svg" alt="" fill className="object-contain" /></div> 0%
                  </span>
                </div>
                <div>
                  <p className="text-text-sub text-sm font-medium">{t('admin.db.activeClasses')}</p>
                  <h3 className="text-text-main text-3xl font-bold mt-1">
                    {loading ? '...' : stats.activeClasses.toLocaleString('id-ID')}
                  </h3>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface-light rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-[34px] h-[35px] relative shrink-0"><Image src="/dbb984409e768d210175b26d825d1ae8d9ae80b2.svg" alt="" fill className="object-contain" /></div>
                  <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 pl-[8px] pr-[8px] py-[4px] rounded-full gap-1">
                    <div className="w-[15.6px] h-[7px] relative shrink-0"><Image src="/f93d432540a1ad7a9f84b150eca379bf108dbcf4.svg" alt="" fill className="object-contain" /></div> +8
                  </span>
                </div>
                <div>
                  <p className="text-text-sub text-sm font-medium">{t('admin.db.unpaidBills')}</p>
                  <h3 className="text-text-main text-3xl font-bold mt-1">156</h3>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-text-main text-lg font-bold">{t('admin.db.attendanceTrend')}</h3>
                      <p className="text-text-sub text-sm">{t('admin.db.attendanceDesc')}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-text-main">92%</span>
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <div className="w-[9.3px] h-[9.3px] relative shrink-0 flex items-center justify-center"><Image src="/69c940ad962291caede3dffa0124d09ce979bc8b.svg" alt="" fill className="object-contain" /></div>
                        2.4% {t('admin.db.comparedToLastSem')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-64 relative flex flex-col justify-end pb-6 overflow-hidden">
                    <div className="absolute inset-0">
                      <div className="absolute inset-[16.67%_0_0_0]">
                        <Image alt="" className="object-fill" fill src="/20b3315e06ffb96395579d2228ac54cd3c5bac42.svg" />
                      </div>
                      <div className="absolute inset-[16.67%_0]">
                        <div className="absolute inset-[-0.68%_-0.21%]">
                          <Image alt="" className="object-fill" fill src="/9b489b12e8e33984adef788343e4e9eed316cc9e.svg" loading="eager" />
                        </div>
                      </div>
                    </div>
                    {/* Labels */}
                    <div className="flex justify-between mt-2 px-2">
                      <span className="text-xs font-medium text-text-sub">{t('month.jan')}</span>
                      <span className="text-xs font-medium text-text-sub">{t('month.feb')}</span>
                      <span className="text-xs font-medium text-text-sub">{t('month.mar')}</span>
                      <span className="text-xs font-medium text-text-sub">{t('month.apr')}</span>
                      <span className="text-xs font-medium text-text-sub">{t('month.may')}</span>
                      <span className="text-xs font-medium text-text-sub">{t('month.jun')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Mini Widget */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-main text-lg font-bold">{t('admin.db.studentStatus')}</h3>
                    <div className="w-[20px] h-[20px] relative shrink-0"><Image src="/d32572d68ab64ad7b6f07891b1d780934c7b715b.svg" alt="" fill className="object-contain" /></div>
                  </div>
                  <div className="space-y-4">
                    {/* Active Students */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.active')}</span>
                        <span className="font-medium">{loading ? '...' : studentStats.active.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: loading ? '0%' : `${studentStats.total > 0 ? (studentStats.active / studentStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Graduated Students */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.graduated')}</span>
                        <span className="font-medium">{loading ? '...' : studentStats.graduated.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: loading ? '0%' : `${studentStats.total > 0 ? (studentStats.graduated / studentStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Transferred Students */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.transferred')}</span>
                        <span className="font-medium">{loading ? '...' : studentStats.transferred.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: loading ? '0%' : `${studentStats.total > 0 ? (studentStats.transferred / studentStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Dropout Students */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.dropout')}</span>
                        <span className="font-medium">{loading ? '...' : studentStats.dropout.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: loading ? '0%' : `${studentStats.total > 0 ? (studentStats.dropout / studentStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Inactive Students */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-sub">{t('admin.db.status.inactive')}</span>
                        <span className="font-medium">{loading ? '...' : studentStats.inactive.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full"
                          style={{ width: loading ? '0%' : `${studentStats.total > 0 ? (studentStats.inactive / studentStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Fees Table Section */}
            <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-text-main text-lg font-bold">{t('admin.db.outstandingFeesTitle')}</h3>
                  <p className="text-text-sub text-sm">{t('admin.db.outstandingFeesDesc')}</p>
                </div>
                <a className="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="#">
                  {t('admin.db.viewAll')}
                  <div className="w-[10.6px] h-[10.6px] relative shrink-0"><Image src="/ff37da3219cd99683eac5123c2b2031eeb522923.svg" alt="" fill className="object-contain" /></div>
                </a>
              </div>
              <div className="overflow-x-auto">
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
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                            AS
                          </div>
                          <div>
                            <p className="font-medium text-text-main text-sm">{t('admin.name.ahmad')}</p>
                            <p className="text-text-sub text-xs">NISN: 0045678901</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.class.xa')}</td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.month.feb2026')}</td>
                      <td className="px-6 py-4 font-medium text-text-main text-sm">Rp 450.000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('admin.db.status.arrears')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1" aria-label="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            SP
                          </div>
                          <div>
                            <p className="font-medium text-text-main text-sm">{t('admin.name.siti')}</p>
                            <p className="text-text-sub text-xs">NISN: 0056789012</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.class.xib')}</td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.month.mar2026')}</td>
                      <td className="px-6 py-4 font-medium text-text-main text-sm">Rp 450.000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {t('admin.db.status.pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1" aria-label="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                            BR
                          </div>
                          <div>
                            <p className="font-medium text-text-main text-sm">{t('admin.name.budi')}</p>
                            <p className="text-text-sub text-xs">NISN: 0067890123</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.class.xiic')}</td>
                      <td className="px-6 py-4 text-sm text-text-sub">{t('admin.month.jan2026')}</td>
                      <td className="px-6 py-4 font-medium text-text-main text-sm">Rp 500.000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('admin.db.status.arrears')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1" aria-label="More options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>            
          </div>
        </div>
      </main>
  );
}
