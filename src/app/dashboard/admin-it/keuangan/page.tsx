'use client';

import { useState } from 'react';
import { Plus, TrendingUp, HandCoins, AlertCircle, CalendarClock, Landmark, Banknote, QrCode, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || (checked ? 'Aktif' : 'Nonaktif')}
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'right-[2px] left-auto' : 'left-[2px] right-auto'} ${!checked ? 'border border-slate-300' : ''}`} />
    </button>
  );
}

export default function KeuanganPage() {
  const { t } = useLanguage();
  // Payment method toggles
  const [virtualAccount, setVirtualAccount] = useState(true);
  const [cashManual, setCashManual] = useState(true);
  const [qrisPayment, setQrisPayment] = useState(false);

  // Billing cycle state
  const [invoiceDay, setInvoiceDay] = useState('1st of every month');
  const [dueDate, setDueDate] = useState('15th of every month');
  const [latePenalty, setLatePenalty] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState('25.000');

  // Tuition rates
  const [rates, setRates] = useState({ grade10: '450.000', grade11: '475.000', grade12: '500.000' });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Incomplete profiles pagination
  const [incompletePage, setIncompletePage] = useState(1);
  const incompleteLimit = 5;
  const incompleteTotal = 12; // Sample total

  // Sample incomplete students data
  const incompleteStudents = [
    { name: 'Samuel Kevin', nisn: '0045678901', grade: t('admin.finance.sample.gradeXA'), status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Linda Wijaya', nisn: '0056789012', grade: t('admin.finance.sample.gradeXIIB'), status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'Aug 2026' },
    { name: 'Ahmad Rizky', nisn: '0067890123', grade: 'Kelas XI-A', status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Siti Aminah', nisn: '0078901234', grade: 'Kelas X-B', status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'Jul 2026' },
    { name: 'Budi Santoso', nisn: '0089012345', grade: 'Kelas XII-A', status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Dewi Lestari', nisn: '0090123456', grade: 'Kelas X-C', status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'Jun 2026' },
    { name: 'Eko Prasetyo', nisn: '0101234567', grade: 'Kelas XI-C', status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Fitri Handayani', nisn: '0112345678', grade: 'Kelas XII-B', status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'May 2026' },
    { name: 'Gunawan Widodo', nisn: '0123456789', grade: 'Kelas XI-B', status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Hartono Yudi', nisn: '0134567890', grade: 'Kelas X-A', status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'Apr 2026' },
    { name: 'Indah Sari', nisn: '0145678901', grade: 'Kelas XII-C', status: t('admin.finance.incomplete.status.noRate'), lastPayment: t('admin.finance.incomplete.status.none') },
    { name: 'Joko Susilo', nisn: '0156789012', grade: 'Kelas XI-A', status: t('admin.finance.incomplete.status.noRate'), lastPayment: 'Mar 2026' },
  ];

  const handleSaveRates = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1500);
  };

  return (
      <main className="flex-1 flex flex-col h-full bg-background-light relative min-w-0">
        <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-slate-900 text-[20px] font-bold">{t('admin.finance.title')}</h2>
            <p className="text-slate-500 text-sm">{t('admin.finance.description')}</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 active:scale-[0.97] transition-all shadow-sm">
              <CalendarClock className="w-4 h-4" />
              {t('admin.finance.btn.billingHistory')}
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark active:scale-[0.97] transition-all shadow-sm">
              <Banknote className="w-4 h-4" />
              {t('admin.finance.btn.generateBills')}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1280px] flex flex-col gap-8 mx-auto w-full">
            
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-sm font-medium">{t('admin.finance.card.revenue.title')}</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-slate-900 text-2xl font-bold mb-2">Rp 562.400.000</h3>
                <p className="text-emerald-600 text-xs font-medium">{t('admin.finance.card.revenue.desc')}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-sm font-medium">{t('admin.finance.card.outstanding.title')}</span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-slate-900 text-2xl font-bold mb-2">Rp 124.500.000</h3>
                <p className="text-red-600 text-xs font-medium">{t('admin.finance.card.outstanding.desc')}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-sm font-medium">{t('admin.finance.card.nextCycle.title')}</span>
                  <CalendarClock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-slate-900 text-2xl font-bold mb-2">Nov 1, 2023</h3>
                <p className="text-slate-500 text-xs font-medium">{t('admin.finance.card.nextCycle.desc')}</p>
              </div>
            </div>

            {/* Configuration Forms Layout */}
            <div className="flex flex-col lg:flex-row gap-8 w-full">
              
              {/* Left Column: Tuition Rates */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
                  <div className="border-b border-slate-100 p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-slate-900 text-lg font-bold">{t('admin.finance.rates.title')}</h3>
                      <p className="text-slate-500 text-sm">{t('admin.finance.rates.description')}</p>
                    </div>
                    <button type="button" className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-dark transition-colors active:scale-[0.97]">
                      <Plus className="w-4 h-4" />
                      {t('admin.finance.rates.btn.addSpecial')}
                    </button>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    {/* Grade 10 */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center w-full hover:border-slate-200 transition-colors">
                      <div className="bg-slate-100 rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                        <span className="text-slate-700 text-lg font-bold">10</span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-slate-900 text-base font-semibold">{t('admin.finance.rates.gradeX')}</span>
                        <span className="text-slate-500 text-sm">{t('admin.finance.rates.streams.scienceSocial')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">Rp</span>
                          </div>
                          <input type="text" value={rates.grade10} onChange={(e) => setRates(p => ({ ...p, grade10: e.target.value }))} title="Tuition Rate Grade X" placeholder="450.000" aria-label="Tuition Rate Grade X" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block w-[160px] pl-10 pr-4 py-2 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Grade 11 */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center w-full hover:border-slate-200 transition-colors">
                      <div className="bg-slate-100 rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                        <span className="text-slate-700 text-lg font-bold">11</span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-slate-900 text-base font-semibold">{t('admin.finance.rates.gradeXI')}</span>
                        <span className="text-slate-500 text-sm">{t('admin.finance.rates.streams.scienceSocial')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">Rp</span>
                          </div>
                          <input type="text" value={rates.grade11} onChange={(e) => setRates(p => ({ ...p, grade11: e.target.value }))} title="Tuition Rate Grade XI" placeholder="475.000" aria-label="Tuition Rate Grade XI" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block w-[160px] pl-10 pr-4 py-2 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Grade 12 */}
                    <div className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center w-full hover:border-slate-200 transition-colors">
                      <div className="bg-slate-100 rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                        <span className="text-slate-700 text-lg font-bold">12</span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-slate-900 text-base font-semibold">{t('admin.finance.rates.gradeXII')}</span>
                        <span className="text-slate-500 text-sm">{t('admin.finance.rates.streams.all')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">Rp</span>
                          </div>
                          <input type="text" value={rates.grade12} onChange={(e) => setRates(p => ({ ...p, grade12: e.target.value }))} title="Tuition Rate Grade XII" placeholder="500.000" aria-label="Tuition Rate Grade XII" className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block w-[160px] pl-10 pr-4 py-2 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] flex items-center gap-2 ${
                          saveState === 'saved' ? 'bg-emerald-500 text-white' : saveState === 'saving' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        onClick={handleSaveRates}
                        disabled={saveState !== 'idle'}
                      >
                        {saveState === 'saving' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                            {t('admin.finance.rates.btn.saving')}
                          </>
                        ) : saveState === 'saved' ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t('admin.finance.rates.btn.saved')}
                          </>
                        ) : (
                          t('admin.finance.rates.btn.save')
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Payment Methods & Billing */}
              <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
                {/* Payment Methods */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 w-full flex flex-col gap-4">
                  <h3 className="text-slate-900 text-lg font-bold">{t('admin.finance.payment.title')}</h3>
                  <div className="flex flex-col gap-4">
                    
                    {/* Method 1 - Virtual Account */}
                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${virtualAccount ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                          <Landmark className={`w-5 h-5 transition-colors ${virtualAccount ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm font-semibold">{t('admin.finance.payment.method.va')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${virtualAccount ? 'text-emerald-600' : 'text-slate-500'}`}>{virtualAccount ? t('admin.finance.payment.method.va.desc.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={virtualAccount} onChange={() => setVirtualAccount(!virtualAccount)} label={t('admin.finance.payment.method.va')} />
                    </div>

                    {/* Method 2 - Cash */}
                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${cashManual ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                          <HandCoins className={`w-5 h-5 transition-colors ${cashManual ? 'text-slate-700' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm font-semibold">{t('admin.finance.payment.method.cash')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${cashManual ? 'text-amber-600' : 'text-slate-500'}`}>{cashManual ? t('admin.finance.payment.method.cash.desc.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={cashManual} onChange={() => setCashManual(!cashManual)} label={t('admin.finance.payment.method.cash')} />
                    </div>

                    {/* Method 3 - QRIS */}
                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${qrisPayment ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                          <QrCode className={`w-5 h-5 transition-colors ${qrisPayment ? 'text-purple-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm font-semibold">{t('admin.finance.payment.method.qris')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${qrisPayment ? 'text-emerald-600' : 'text-slate-500'}`}>{qrisPayment ? t('admin.finance.payment.method.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={qrisPayment} onChange={() => setQrisPayment(!qrisPayment)} label={t('admin.finance.payment.method.qris')} />
                    </div>

                  </div>
                </div>

                {/* Billing Cycle */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 w-full flex flex-col gap-5">
                  <h3 className="text-slate-900 text-lg font-bold">{t('admin.finance.cycle.title')}</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="invoiceDay" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{t('admin.finance.cycle.invoiceDay')}</label>
                    <select id="invoiceDay" value={invoiceDay} onChange={(e) => setInvoiceDay(e.target.value)} aria-label={t('admin.finance.cycle.invoiceDay')} title={t('admin.finance.cycle.invoiceDay')} className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer">
                      <option value="1st">{t('admin.finance.cycle.option.1st')}</option>
                      <option value="5th">{t('admin.finance.cycle.option.5th')}</option>
                      <option value="10th">{t('admin.finance.cycle.option.10th')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="dueDate" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{t('admin.finance.cycle.dueDate')}</label>
                    <select id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label={t('admin.finance.cycle.dueDate')} title={t('admin.finance.cycle.dueDate')} className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer">
                      <option value="15th">{t('admin.finance.cycle.option.15th')}</option>
                      <option value="20th">{t('admin.finance.cycle.option.20th')}</option>
                      <option value="end">{t('admin.finance.cycle.option.end')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                     <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setLatePenalty(!latePenalty)}>
                        <div className={`w-5 h-5 border rounded flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${latePenalty ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                            {latePenalty && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors">{t('admin.finance.cycle.penalty.label')}</span>
                          <span className="text-slate-900 text-sm leading-tight">{t('admin.finance.cycle.penalty.sublabel')}</span>
                        </div>
                     </label>

                     <div className={`relative mt-1 transition-all duration-200 ${latePenalty ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 text-sm">Rp</span>
                        </div>
                        <input type="text" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} title="Late Payment Penalty" placeholder="25.000" aria-label="Late Payment Penalty" className="bg-slate-100 border-none text-slate-900 text-sm font-medium rounded-lg block w-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                     </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Bottom Table: Incomplete Student Profiles */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full mb-8">
              <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-slate-900 text-lg font-bold">{t('admin.finance.incomplete.title')}</h3>
                  <p className="text-slate-500 text-sm">{t('admin.finance.incomplete.description')}</p>
                </div>
                <button type="button" className="flex items-center justify-center px-4 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 active:scale-[0.97] transition-all whitespace-nowrap">
                  {t('admin.finance.incomplete.btn.bulk')}
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="w-full">
                  <div className="bg-slate-50/50 grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] border-b border-slate-100">
                    {[
                      t('admin.finance.incomplete.table.student'),
                      t('admin.finance.incomplete.table.grade'),
                      t('admin.finance.incomplete.table.status'),
                      t('admin.finance.incomplete.table.lastPayment'),
                      t('admin.finance.incomplete.table.action')
                    ].map((h, i) => (
                      <div key={h} className={`px-4 py-3 ${i === 4 ? 'text-right' : ''}`}>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</span>
                      </div>
                    ))}
                  </div>

                  {incompleteStudents
                    .slice((incompletePage - 1) * incompleteLimit, incompletePage * incompleteLimit)
                    .map((student, index) => (
                    <div key={index} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] border-b border-slate-50 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="px-4 py-3 flex flex-col">
                         <span className="text-slate-900 text-sm font-medium">{student.name}</span>
                         <span className="text-slate-500 text-xs whitespace-nowrap">NISN: {student.nisn}</span>
                      </div>
                      <div className="px-4 py-3"><span className="text-slate-500 text-sm whitespace-nowrap">{student.grade}</span></div>
                      <div className="px-4 py-3">
                        <span className="inline-flex bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">{student.status}</span>
                      </div>
                      <div className="px-4 py-3"><span className="text-slate-500 text-sm whitespace-nowrap">{student.lastPayment}</span></div>
                      <div className="px-4 py-3 flex justify-end">
                        <button type="button" className="text-primary text-sm font-medium hover:text-primary-dark active:scale-[0.95] transition-all whitespace-nowrap">{t('admin.finance.incomplete.action.assign')}</button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* Pagination Footer */}
              <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {t('admin.finance.incomplete.pagination.showing')} <span className="font-semibold text-slate-900">{Math.min((incompletePage - 1) * incompleteLimit + 1, incompleteTotal)}</span> {t('admin.finance.incomplete.pagination.to')} <span className="font-semibold text-slate-900">{Math.min(incompletePage * incompleteLimit, incompleteTotal)}</span> {t('admin.finance.incomplete.pagination.of')} <span className="font-semibold text-slate-900">{incompleteTotal}</span> {t('admin.finance.incomplete.pagination.students')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIncompletePage(prev => Math.max(1, prev - 1))}
                    disabled={incompletePage <= 1}
                    className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('admin.finance.incomplete.pagination.prev')}
                  </button>
                  <button
                    onClick={() => setIncompletePage(prev => Math.min(Math.ceil(incompleteTotal / incompleteLimit), prev + 1))}
                    disabled={incompletePage >= Math.ceil(incompleteTotal / incompleteLimit)}
                    className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('admin.finance.incomplete.pagination.next')}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
  );
}
