'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  Check,
  HandCoins,
  Landmark,
  Loader2,
  Plus,
  QrCode,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  generateMonthlyBills,
  getFinanceDashboardData,
  saveFinanceSettings,
  type DueDateOption,
  type FinanceDashboardData,
  type FinanceSettings,
  type GradeRateKey,
  type InvoiceDay,
} from './actions'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

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
      <div className={`absolute top-[2px] w-5 h-5 bg-card rounded-full shadow-sm transition-all duration-200 ${checked ? 'right-[2px] left-auto' : 'left-[2px] right-auto'} ${!checked ? 'border border-slate-300' : ''}`} />
    </button>
  )
}

const emptyFinanceData: FinanceDashboardData = {
  settings: {
    tuitionRates: {
      grade10: null,
      grade11: null,
      grade12: null,
    },
    billingCycle: {
      invoiceDay: '1st',
      dueDate: '15th',
      latePenaltyEnabled: false,
      latePenaltyAmount: null,
    },
    paymentMethods: {
      virtualAccount: false,
      cashManual: false,
      qris: false,
    },
  },
  summary: {
    revenueThisMonth: 0,
    paidInvoiceCountThisMonth: 0,
    outstandingAmount: 0,
    outstandingInvoiceCount: 0,
    nextCycleDate: new Date().toISOString(),
  },
  incompleteStudents: [],
  activeAcademicYearId: null,
  activeAcademicYearName: null,
}

function formatAmountInput(value: number | null) {
  if (!value) return ''
  return new Intl.NumberFormat('id-ID').format(value)
}

function parseAmountInput(value: string) {
  const parsed = Number(value.replace(/[^\d]/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function settingsToForm(data: FinanceDashboardData) {
  return {
    rates: {
      grade10: formatAmountInput(data.settings.tuitionRates.grade10),
      grade11: formatAmountInput(data.settings.tuitionRates.grade11),
      grade12: formatAmountInput(data.settings.tuitionRates.grade12),
    },
    invoiceDay: data.settings.billingCycle.invoiceDay,
    dueDate: data.settings.billingCycle.dueDate,
    latePenalty: data.settings.billingCycle.latePenaltyEnabled,
    penaltyAmount: formatAmountInput(data.settings.billingCycle.latePenaltyAmount),
    virtualAccount: data.settings.paymentMethods.virtualAccount,
    cashManual: data.settings.paymentMethods.cashManual,
    qrisPayment: data.settings.paymentMethods.qris,
  }
}

function buildFinanceSettings(form: ReturnType<typeof settingsToForm>): FinanceSettings {
  return {
    tuitionRates: {
      grade10: parseAmountInput(form.rates.grade10),
      grade11: parseAmountInput(form.rates.grade11),
      grade12: parseAmountInput(form.rates.grade12),
    },
    billingCycle: {
      invoiceDay: form.invoiceDay,
      dueDate: form.dueDate,
      latePenaltyEnabled: form.latePenalty,
      latePenaltyAmount: parseAmountInput(form.penaltyAmount),
    },
    paymentMethods: {
      virtualAccount: form.virtualAccount,
      cashManual: form.cashManual,
      qris: form.qrisPayment,
    },
  }
}

interface KeuanganClientProps {
  initialData?: FinanceDashboardData
  initialError?: string
}

export default function KeuanganClient({ initialData, initialError }: KeuanganClientProps) {
  const { t, language } = useLanguage()
  const [data, setData] = useState<FinanceDashboardData>(initialData || emptyFinanceData)
  const [form, setForm] = useState(() => settingsToForm(initialData || emptyFinanceData))
  const [incompletePage, setIncompletePage] = useState(1)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [message, setMessage] = useState(initialError || '')
  const [isGenerating, startGenerateTransition] = useTransition()
  const incompleteLimit = 5

  const visibleIncompleteStudents = useMemo(() => {
    const start = (incompletePage - 1) * incompleteLimit
    return data.incompleteStudents.slice(start, start + incompleteLimit)
  }, [data.incompleteStudents, incompletePage])

  const incompleteTotal = data.incompleteStudents.length
  const totalPages = Math.max(1, Math.ceil(incompleteTotal / incompleteLimit))

  const updateRate = (key: GradeRateKey, value: string) => {
    setForm((current) => ({
      ...current,
      rates: {
        ...current.rates,
        [key]: value,
      },
    }))
  }

  const refreshDashboardData = async () => {
    const result = await getFinanceDashboardData()
    if (result.success && result.data) {
      setData(result.data)
      setForm(settingsToForm(result.data))
      setIncompletePage(1)
      return
    }

    setMessage(result.error || t('admin.finance.message.loadError'))
  }

  const handleSaveSettings = async () => {
    setSaveState('saving')
    setMessage('')

    const result = await saveFinanceSettings(buildFinanceSettings(form))
    if (!result.success) {
      setSaveState('error')
      setMessage(result.error || t('admin.finance.message.saveError'))
      window.setTimeout(() => setSaveState('idle'), 2000)
      return
    }

    setSaveState('saved')
    setMessage(t('admin.finance.message.saveSuccess'))
    await refreshDashboardData()
    window.setTimeout(() => setSaveState('idle'), 2000)
  }

  const handleGenerateBills = () => {
    setMessage('')
    startGenerateTransition(async () => {
      const result = await generateMonthlyBills()
      if (!result.success) {
        setMessage(result.error || t('admin.finance.message.generateError'))
        return
      }

      setMessage(t('admin.finance.message.generateSuccess', { count: result.created || 0 }))
      await refreshDashboardData()
    })
  }

  return (
      <main className="flex-1 flex flex-col h-full bg-background relative min-w-0">
        <header className="min-h-16 bg-card border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-foreground text-[20px] font-bold">{t('admin.finance.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('admin.finance.description')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" className="flex h-8 items-center justify-center gap-2 px-3 bg-card border border-border text-foreground rounded-md text-xs font-medium hover:bg-accent active:scale-[0.97] transition-all shadow-sm">
              <CalendarClock className="w-4 h-4" />
              {t('admin.finance.btn.billingHistory')}
            </button>
            <button
              type="button"
              onClick={handleGenerateBills}
              disabled={isGenerating}
              className="flex h-8 items-center justify-center gap-2 px-3 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
              {t('admin.finance.btn.generateBills')}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-[1280px] flex flex-col gap-6 mx-auto w-full">
            {message && (
              <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="bg-card border border-border rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">{t('admin.finance.card.revenue.title')}</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-foreground text-2xl font-bold mb-2">{formatCurrency(data.summary.revenueThisMonth, language)}</h3>
                <p className="text-emerald-600 text-xs font-medium">{t('admin.finance.card.revenue.desc', { count: data.summary.paidInvoiceCountThisMonth })}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">{t('admin.finance.card.outstanding.title')}</span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-foreground text-2xl font-bold mb-2">{formatCurrency(data.summary.outstandingAmount, language)}</h3>
                <p className="text-red-600 text-xs font-medium">{t('admin.finance.card.outstanding.desc', { count: data.summary.outstandingInvoiceCount })}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm font-medium">{t('admin.finance.card.nextCycle.title')}</span>
                  <CalendarClock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-foreground text-2xl font-bold mb-2">{formatDate(data.summary.nextCycleDate, language)}</h3>
                <p className="text-muted-foreground text-xs font-medium">
                  {data.activeAcademicYearName
                    ? t('admin.finance.card.nextCycle.descWithYear', { year: data.activeAcademicYearName })
                    : t('admin.finance.card.nextCycle.desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <div className="flex-1 flex flex-col gap-5">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
                  <div className="border-b border-border/60 p-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-foreground text-lg font-bold">{t('admin.finance.rates.title')}</h3>
                      <p className="text-muted-foreground text-sm">{t('admin.finance.rates.description')}</p>
                    </div>
                    <button type="button" disabled className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium opacity-60 cursor-not-allowed">
                      <Plus className="w-4 h-4" />
                      {t('admin.finance.rates.btn.addSpecial')}
                    </button>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {([
                      ['grade10', '10', t('admin.finance.rates.gradeX'), t('admin.finance.rates.streams.scienceSocial'), t('admin.finance.rates.input.gradeX')],
                      ['grade11', '11', t('admin.finance.rates.gradeXI'), t('admin.finance.rates.streams.scienceSocial'), t('admin.finance.rates.input.gradeXI')],
                      ['grade12', '12', t('admin.finance.rates.gradeXII'), t('admin.finance.rates.streams.all'), t('admin.finance.rates.input.gradeXII')],
                    ] as const).map(([key, label, title, subtitle, inputLabel]) => (
                      <div key={key} className="border border-border/60 rounded-xl p-3.5 flex flex-col sm:flex-row gap-3 sm:items-center w-full hover:border-slate-200 transition-colors">
                        <div className="bg-muted rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                          <span className="text-foreground text-lg font-bold">{label}</span>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <span className="text-foreground text-base font-semibold">{title}</span>
                          <span className="text-muted-foreground text-sm">{subtitle}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-muted-foreground text-sm">Rp</span>
                            </div>
                            <input
                              type="text"
                              value={form.rates[key]}
                              onChange={(event) => updateRate(key, event.target.value)}
                              title={inputLabel}
                              placeholder="0"
                              aria-label={inputLabel}
                              className="bg-muted/50 border border-border text-foreground text-sm font-semibold rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block w-[160px] pl-10 pr-4 py-2 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className={`h-8 px-4 rounded-md text-xs font-medium transition-all active:scale-[0.97] flex items-center gap-2 ${
                          saveState === 'saved' ? 'bg-emerald-500 text-white' : saveState === 'saving' ? 'bg-slate-700 text-white' : saveState === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        onClick={handleSaveSettings}
                        disabled={saveState === 'saving'}
                      >
                        {saveState === 'saving' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
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

              <div className="w-full lg:w-[320px] flex flex-col gap-5 shrink-0">
                <div className="bg-card border border-border rounded-xl shadow-sm p-5 w-full flex flex-col gap-3.5">
                  <h3 className="text-foreground text-lg font-bold">{t('admin.finance.payment.title')}</h3>
                  <div className="flex flex-col gap-3">
                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${form.virtualAccount ? 'bg-muted/50 border-border/60' : 'bg-card border-border opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                          <Landmark className={`w-5 h-5 transition-colors ${form.virtualAccount ? 'text-blue-600' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-semibold">{t('admin.finance.payment.method.va')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${form.virtualAccount ? 'text-emerald-600' : 'text-muted-foreground'}`}>{form.virtualAccount ? t('admin.finance.payment.method.va.desc.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={form.virtualAccount} onChange={() => setForm((current) => ({ ...current, virtualAccount: !current.virtualAccount }))} label={t('admin.finance.payment.method.va')} />
                    </div>

                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${form.cashManual ? 'bg-muted/50 border-border/60' : 'bg-card border-border opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                          <HandCoins className={`w-5 h-5 transition-colors ${form.cashManual ? 'text-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-semibold">{t('admin.finance.payment.method.cash')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${form.cashManual ? 'text-amber-600' : 'text-muted-foreground'}`}>{form.cashManual ? t('admin.finance.payment.method.cash.desc.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={form.cashManual} onChange={() => setForm((current) => ({ ...current, cashManual: !current.cashManual }))} label={t('admin.finance.payment.method.cash')} />
                    </div>

                    <div className={`border rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${form.qrisPayment ? 'bg-muted/50 border-border/60' : 'bg-card border-border opacity-60'}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-card border border-border rounded flex items-center justify-center shrink-0">
                          <QrCode className={`w-5 h-5 transition-colors ${form.qrisPayment ? 'text-purple-600' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-semibold">{t('admin.finance.payment.method.qris')}</span>
                          <span className={`text-[10px] font-medium uppercase mt-0.5 transition-colors ${form.qrisPayment ? 'text-emerald-600' : 'text-muted-foreground'}`}>{form.qrisPayment ? t('admin.finance.payment.method.active') : t('admin.finance.payment.method.disabled')}</span>
                        </div>
                      </div>
                      <Toggle checked={form.qrisPayment} onChange={() => setForm((current) => ({ ...current, qrisPayment: !current.qrisPayment }))} label={t('admin.finance.payment.method.qris')} />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm p-5 w-full flex flex-col gap-4">
                  <h3 className="text-foreground text-lg font-bold">{t('admin.finance.cycle.title')}</h3>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="invoiceDay" className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{t('admin.finance.cycle.invoiceDay')}</label>
                    <select
                      id="invoiceDay"
                      value={form.invoiceDay}
                      onChange={(event) => setForm((current) => ({ ...current, invoiceDay: event.target.value as InvoiceDay }))}
                      aria-label={t('admin.finance.cycle.invoiceDay')}
                      title={t('admin.finance.cycle.invoiceDay')}
                      className="bg-muted/50 border border-border text-foreground text-sm rounded-lg block w-full p-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="1st">{t('admin.finance.cycle.option.1st')}</option>
                      <option value="5th">{t('admin.finance.cycle.option.5th')}</option>
                      <option value="10th">{t('admin.finance.cycle.option.10th')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="dueDate" className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{t('admin.finance.cycle.dueDate')}</label>
                    <select
                      id="dueDate"
                      value={form.dueDate}
                      onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value as DueDateOption }))}
                      aria-label={t('admin.finance.cycle.dueDate')}
                      title={t('admin.finance.cycle.dueDate')}
                      className="bg-muted/50 border border-border text-foreground text-sm rounded-lg block w-full p-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="15th">{t('admin.finance.cycle.option.15th')}</option>
                      <option value="20th">{t('admin.finance.cycle.option.20th')}</option>
                      <option value="end">{t('admin.finance.cycle.option.end')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setForm((current) => ({ ...current, latePenalty: !current.latePenalty }))}>
                      <div className={`w-5 h-5 border rounded flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${form.latePenalty ? 'bg-primary border-primary' : 'bg-card border-slate-300'}`}>
                        {form.latePenalty && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{t('admin.finance.cycle.penalty.label')}</span>
                        <span className="text-foreground text-sm leading-tight">{t('admin.finance.cycle.penalty.sublabel')}</span>
                      </div>
                    </label>

                    <div className={`relative mt-1 transition-all duration-200 ${form.latePenalty ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground text-sm">Rp</span>
                      </div>
                      <input
                        type="text"
                        value={form.penaltyAmount}
                        onChange={(event) => setForm((current) => ({ ...current, penaltyAmount: event.target.value }))}
                        title={t('admin.finance.cycle.penalty.input')}
                        placeholder="0"
                        aria-label={t('admin.finance.cycle.penalty.input')}
                        className="bg-muted border-none text-foreground text-sm font-medium rounded-lg block w-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col w-full mb-8">
              <div className="border-b border-border/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-foreground text-lg font-bold">{t('admin.finance.incomplete.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('admin.finance.incomplete.description')}</p>
                </div>
                <button type="button" disabled className="flex h-8 items-center justify-center px-3 bg-primary/5 border border-primary/20 text-primary rounded-md text-xs font-medium opacity-60 cursor-not-allowed whitespace-nowrap">
                  {t('admin.finance.incomplete.btn.bulk')}
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="w-full">
                  <div className="bg-slate-50/50 grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] border-b border-border/60">
                    {[
                      t('admin.finance.incomplete.table.student'),
                      t('admin.finance.incomplete.table.grade'),
                      t('admin.finance.incomplete.table.status'),
                      t('admin.finance.incomplete.table.lastPayment'),
                      t('admin.finance.incomplete.table.action'),
                    ].map((header, index) => (
                      <div key={header} className={`px-4 py-3 ${index === 4 ? 'text-right' : ''}`}>
                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider whitespace-nowrap">{header}</span>
                      </div>
                    ))}
                  </div>

                  {visibleIncompleteStudents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {t('admin.finance.incomplete.empty')}
                    </div>
                  ) : (
                    visibleIncompleteStudents.map((student) => (
                      <div key={student.id} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] border-b border-slate-50 items-center hover:bg-slate-50/50 transition-colors">
                        <div className="px-4 py-3 flex flex-col">
                          <span className="text-foreground text-sm font-medium">{student.name}</span>
                          <span className="text-muted-foreground text-xs whitespace-nowrap">NISN: {student.nisn || '-'}</span>
                        </div>
                        <div className="px-4 py-3"><span className="text-muted-foreground text-sm whitespace-nowrap">{student.grade}</span></div>
                        <div className="px-4 py-3">
                          <span className="inline-flex bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">{t('admin.finance.incomplete.status.noRate')}</span>
                        </div>
                        <div className="px-4 py-3"><span className="text-muted-foreground text-sm whitespace-nowrap">{student.lastPayment || t('admin.finance.incomplete.status.none')}</span></div>
                        <div className="px-4 py-3 flex justify-end">
                          <button type="button" disabled className="text-muted-foreground text-sm font-medium cursor-not-allowed whitespace-nowrap">{t('admin.finance.incomplete.action.assign')}</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-50/50 border-t border-border/60 px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {t('admin.finance.incomplete.pagination.showing')} <span className="font-semibold text-foreground">{incompleteTotal === 0 ? 0 : Math.min((incompletePage - 1) * incompleteLimit + 1, incompleteTotal)}</span> {t('admin.finance.incomplete.pagination.to')} <span className="font-semibold text-foreground">{Math.min(incompletePage * incompleteLimit, incompleteTotal)}</span> {t('admin.finance.incomplete.pagination.of')} <span className="font-semibold text-foreground">{incompleteTotal}</span> {t('admin.finance.incomplete.pagination.students')}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIncompletePage((prev) => Math.max(1, prev - 1))}
                    disabled={incompletePage <= 1}
                    className="px-3 py-1.5 border border-border bg-card text-muted-foreground text-xs font-medium rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('admin.finance.incomplete.pagination.prev')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncompletePage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={incompletePage >= totalPages}
                    className="px-3 py-1.5 border border-border bg-card hover:bg-accent text-muted-foreground text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('admin.finance.incomplete.pagination.next')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
