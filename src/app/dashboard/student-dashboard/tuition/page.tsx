'use client';

import React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ArrowRight,
  Clock,
  Download,
  Filter,
  Landmark,
  Wallet,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function getMethodIcon(type: 'card' | 'bank' | 'wallet') {
  switch (type) {
    case 'card': return <CreditCard className="w-3.5 h-3 text-muted-foreground" />;
    case 'bank': return <Landmark className="w-3.5 h-3.5 text-muted-foreground" />;
    case 'wallet': return <Wallet className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

export default function TuitionPage() {
  const { t } = useLanguage();

  // Current Bills data
  const currentBills = [
    {
      period: t('month.oct') + ' 2024',
      title: t('student.tuition.fee.tuition'),
      amount: '$450.00',
      dueLabel: t('student.tuition.bills.dueDate'),
      dueValue: t('month.oct') + ' 10, 2024',
      dueColor: 'text-red-500',
      status: t('student.tuition.bills.status.unpaid'),
      statusBg: 'bg-red-100',
      statusColor: 'text-red-600',
      borderClass: 'border-2 border-primary/20',
      buttonType: 'pay' as const,
    },
    {
      period: t('month.nov') + ' 2024',
      title: t('student.tuition.fee.tuition'),
      amount: '$450.00',
      dueLabel: t('student.tuition.bills.dueDate'),
      dueValue: t('month.nov') + ' 10, 2024',
      dueColor: 'text-foreground',
      status: t('student.tuition.bills.status.pending'),
      statusBg: 'bg-amber-100',
      statusColor: 'text-amber-600',
      borderClass: 'border border-border',
      buttonType: 'soon' as const,
    },
    {
      period: t('student.performance.period.semester') + ' 2',
      title: t('student.tuition.fee.lab'),
      amount: '$350.00',
      dueLabel: t('admin.db.table.status'),
      dueValue: t('student.tuition.bills.settledOn').replace('{date}', t('month.sep') + ' 05'),
      dueColor: 'text-green-600',
      status: t('student.tuition.bills.status.paid'),
      statusBg: 'bg-green-100',
      statusColor: 'text-green-600',
      borderClass: 'border border-border opacity-75',
      buttonType: 'receipt' as const,
    },
  ];

  // Payment history data
  const paymentHistory = [
    {
      id: '#TRX-882910',
      date: t('month.sep') + ' 05, 2024',
      description: t('student.tuition.history.desc.tuition').replace('{month}', t('month.sep')),
      amount: '$450.00',
      method: t('month.sep') === 'September' ? 'Visa **** 4242' : 'Visa **** 4242', // Identity
      methodIcon: 'card' as const,
    },
    {
      id: '#TRX-882104',
      date: t('month.aug') + ' 12, 2024',
      description: t('student.tuition.fee.lab'),
      amount: '$350.00',
      method: t('student.tuition.method.transfer'),
      methodIcon: 'bank' as const,
    },
    {
      id: '#TRX-881955',
      date: t('month.aug') + ' 05, 2024',
      description: t('student.tuition.history.desc.tuition').replace('{month}', t('month.aug')),
      amount: '$450.00',
      method: t('student.tuition.method.wallet'),
      methodIcon: 'wallet' as const,
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('student.tuition.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('student.tuition.subtitle')}</p>
            </div>
          </div>

          {/* Current Bills Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">{t('student.tuition.bills.title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('student.tuition.bills.year').replace('{value}', '2024/2025')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentBills.map((bill, i) => (
                <div
                  key={i}
                  className={`bg-card ${bill.borderClass} rounded-xl shadow-sm p-4 flex flex-col gap-3 relative overflow-hidden`}
                >
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`${bill.statusBg} ${bill.statusColor} text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-lg font-bold`}>
                      {bill.status}
                    </span>
                  </div>

                  {/* Bill Info */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{bill.period}</p>
                    <h4 className="text-lg font-semibold text-foreground">{bill.title}</h4>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 pb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('student.tuition.bills.amount')}</span>
                      <span className="text-sm font-semibold text-foreground">{bill.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{bill.dueLabel}</span>
                      <span className={`text-sm font-medium ${bill.dueColor}`}>{bill.dueValue}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {bill.buttonType === 'pay' && (
                    <button className="bg-primary text-white rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                      {t('student.tuition.bills.payNow')}
                      <ArrowRight className="w-4 h-3" />
                    </button>
                  )}
                  {bill.buttonType === 'soon' && (
                    <button className="border border-border text-muted-foreground rounded-lg py-2 text-sm font-medium cursor-not-allowed">
                      {t('student.tuition.bills.soon')}
                    </button>
                  )}
                  {bill.buttonType === 'receipt' && (
                    <button className="bg-muted text-muted-foreground rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      {t('student.tuition.bills.receipt')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">{t('student.tuition.history.title')}</h3>
              </div>
              <button className="flex items-center gap-1 text-primary text-sm font-medium hover:underline cursor-pointer">
                <Filter className="w-3 h-2" />
                {t('student.tuition.history.filter')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left pl-5 pr-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.id')}</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.date')}</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.desc')}</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.amount')}</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.method')}</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('student.tuition.history.table.receipt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((tx, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="pl-5 pr-3 py-3.5 text-sm font-medium text-foreground">{tx.id}</td>
                      <td className="px-3 py-3.5 text-sm text-muted-foreground">{tx.date}</td>
                      <td className="px-3 py-3.5 text-sm font-medium text-foreground">{tx.description}</td>
                      <td className="px-3 py-3.5 text-sm font-semibold text-foreground">{tx.amount}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          {getMethodIcon(tx.methodIcon)}
                          <span className="text-sm text-muted-foreground">{tx.method}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button title={t('student.tuition.bills.receipt')} className="p-1 rounded-full hover:bg-accent transition-colors cursor-pointer">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border/60 bg-slate-50/30 py-3 flex items-center justify-center">
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {t('student.tuition.history.showAll')}
              </button>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-blue-600 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)]">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 hidden sm:flex">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">{t('student.tuition.cta.title')}</h4>
                <p className="text-sm text-blue-100">{t('student.tuition.cta.desc')}</p>
              </div>
            </div>
            <button className="bg-card text-blue-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer shrink-0 w-full sm:w-auto">
              {t('student.tuition.cta.button')}
            </button>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{t('student.db.footer')}</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{t('student.db.help')}</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{t('student.db.privacy')}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
