'use client'

import React, { useState, useMemo } from 'react'
import { Search, UserCheck, FileText, Download, Filter, FileCheck, AlertCircle, Eye, Loader2, Users, GraduationCap, ArrowLeft, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/utils/dictionary'
import { format } from 'date-fns'
import { enUS, id } from 'date-fns/locale'

type TabType = 'student-data' | 'teacher-data'
type DocStatus = 'verified' | 'pending' | 'missing'
type CalendarStatus = 'none' | 'H' | 'A' | 'S' | 'I' | 'today'

const MOCK_REFERENCE_DATE = new Date(2024, 4, 20)

type DocItem = {
  type: string;
  status: DocStatus;
}

type Person = {
  id: number;
  type: 'student' | 'teacher';
  name: string;
  idNumber: string; // NISN or NIP
  subInfo: string; // Class or Subject
  status: string; // Latest attendance
  attendancePercentage: number;
  docs: DocItem[];
}

const dayLabelKeys: TranslationKey[] = [
  'admin.monitoring.calendar.day.sun',
  'admin.monitoring.calendar.day.mon',
  'admin.monitoring.calendar.day.tue',
  'admin.monitoring.calendar.day.wed',
  'admin.monitoring.calendar.day.thu',
  'admin.monitoring.calendar.day.fri',
  'admin.monitoring.calendar.day.sat',
]

const subInfoTranslationMap: Record<string, TranslationKey> = {
  'X A (MIPA)': 'admin.class.xa',
  'XI B (IPS)': 'admin.class.xib',
  'XII C (Kejuruan)': 'admin.class.xiic',
  'Matematika': 'admin.monitoring.subject.math',
  'Bahasa Indonesia': 'admin.monitoring.subject.indonesian',
  'Fisika': 'admin.monitoring.subject.physics',
}

const docTranslationMap: Record<string, TranslationKey> = {
  'Kartu Keluarga (KK)': 'admin.monitoring.doc.familyCard',
  'Akte Kelahiran': 'admin.monitoring.doc.birthCertificate',
  'Ijazah SMP': 'admin.monitoring.doc.middleSchoolDiploma',
  'Ijazah Lulus': 'admin.monitoring.doc.graduationDiploma',
  'KTP': 'admin.monitoring.doc.idCard',
  'Ijazah S1': 'admin.monitoring.doc.bachelorDiploma',
  'Ijazah S2': 'admin.monitoring.doc.masterDiploma',
  'Sertifikasi Guru': 'admin.monitoring.doc.teacherCertification',
}

// Pseudo-random generator for stable mock data
const generateMonthData = (year: number, month: number, personId: number, baseAttendance: number) => {
  const seed = (year * 10000) + (month * 100) + personId;
  const hash = (n: number) => {
    const h = Math.sin(n) * 10000;
    return h - Math.floor(h);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const days = [];
  
  // Padding for starting days
  for (let i = 0; i < startingDay; i++) {
    days.push({ empty: true, date: 0, status: 'none' as CalendarStatus });
  }

  const summary = { H: 0, A: 0, S: 0, I: 0 }
  
  for (let i = 1; i <= daysInMonth; i++) {
     let status: CalendarStatus = 'none';
     
     const isMockReferenceDate = (
       i === MOCK_REFERENCE_DATE.getDate() &&
       month === MOCK_REFERENCE_DATE.getMonth() &&
       year === MOCK_REFERENCE_DATE.getFullYear()
     );
     const isPast = new Date(year, month, i) <= MOCK_REFERENCE_DATE;

     // Only assign real status to Past Weekdays
     if (new Date(year, month, i).getDay() !== 0 && new Date(year, month, i).getDay() !== 6 && isPast) {
       const rand = hash(seed + i);
       const probH = baseAttendance / 100;
       
       if (rand < probH) { status = 'H'; }
       else if (rand < probH + 0.05) { status = 'S'; }
       else if (rand < probH + 0.10) { status = 'I'; }
       else { status = 'A'; }
     }

     if (isMockReferenceDate) status = 'today'; 

     // Summaries
     if (status === 'H') summary.H++;
     else if (status === 'A') summary.A++;
     else if (status === 'I') summary.I++;
     else if (status === 'S') summary.S++;
     else if (status === 'today') summary.H++; // count current mock date as present for simplicity
     
     days.push({ date: i, empty: false, status });
  }
  
  return { days, summary };
}

// Mock Data without the static calendar directly embedded
const MOCK_STUDENTS: Person[] = [
  { 
    id: 1, type: 'student', name: 'Ahmad Santoso', idNumber: '0051234567', subInfo: 'X A (MIPA)', status: 'Hadir', attendancePercentage: 95,
    docs: [
      { type: 'Kartu Keluarga (KK)', status: 'verified' },
      { type: 'Akte Kelahiran', status: 'verified' },
      { type: 'Ijazah SMP', status: 'pending' }
    ]
  },
  { 
    id: 2, type: 'student', name: 'Siti Putri', idNumber: '0051234568', subInfo: 'X A (MIPA)', status: 'Sakit', attendancePercentage: 80,
    docs: [
      { type: 'Kartu Keluarga (KK)', status: 'verified' },
      { type: 'Akte Kelahiran', status: 'missing' },
      { type: 'Ijazah SMP', status: 'verified' }
    ]
  },
  {
    id: 3, type: 'student', name: 'Budi Raharjo', idNumber: '0051234569', subInfo: 'XI B (IPS)', status: 'Izin', attendancePercentage: 85,
    docs: [
      { type: 'Kartu Keluarga (KK)', status: 'verified' },
      { type: 'Akte Kelahiran', status: 'verified' },
      { type: 'Ijazah SMP', status: 'verified' }
    ]
  },
  {
    id: 4, type: 'student', name: 'Andi Wijaya', idNumber: '0051234570', subInfo: 'XII C (Kejuruan)', status: 'Alpha', attendancePercentage: 60,
    docs: [
      { type: 'Kartu Keluarga (KK)', status: 'pending' },
      { type: 'Akte Kelahiran', status: 'pending' },
      { type: 'Ijazah Lulus', status: 'missing' }
    ]
  },
  { 
    id: 5, type: 'student', name: 'Rina Melati', idNumber: '0051234571', subInfo: 'X A (MIPA)', status: 'Hadir', attendancePercentage: 100,
    docs: [
      { type: 'Kartu Keluarga (KK)', status: 'verified' },
      { type: 'Akte Kelahiran', status: 'verified' },
      { type: 'Ijazah Lulus', status: 'verified' }
    ]
  }
]

const MOCK_TEACHERS: Person[] = [
  { 
    id: 11, type: 'teacher', name: 'Drs. Supriyanto, M.Pd.', idNumber: '197001011995121001', subInfo: 'Matematika', status: 'Hadir', attendancePercentage: 98,
    docs: [
      { type: 'KTP', status: 'verified' },
      { type: 'Ijazah S1', status: 'verified' },
      { type: 'Ijazah S2', status: 'verified' },
      { type: 'Sertifikasi Guru', status: 'pending' }
    ]
  },
  { 
    id: 12, type: 'teacher', name: 'Dra. Endang Lestari', idNumber: '197203041998012002', subInfo: 'Bahasa Indonesia', status: 'Hadir', attendancePercentage: 100,
    docs: [
      { type: 'KTP', status: 'verified' },
      { type: 'Ijazah S1', status: 'verified' },
      { type: 'Sertifikasi Guru', status: 'verified' }
    ]
  },
  { 
    id: 13, type: 'teacher', name: 'Budi Gunawan, S.Pd.', idNumber: '198505122010011003', subInfo: 'Fisika', status: 'Izin', attendancePercentage: 88,
    docs: [
      { type: 'KTP', status: 'verified' },
      { type: 'Ijazah S1', status: 'missing' },
      { type: 'Sertifikasi Guru', status: 'pending' }
    ]
  },
]

export default function MonitoringDataPage() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('student-data')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubInfo, setFilterSubInfo] = useState<string>('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  // Calendar state starts from the same month as the stable mock reference date.
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1))

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const currentData = activeTab === 'student-data' ? MOCK_STUDENTS : MOCK_TEACHERS
  const uniqueSubInfos = Array.from(new Set(currentData.map(item => item.subInfo)))
  const dateLocale = language === 'id' ? id : enUS

  const getSubInfoLabel = (subInfo: string) => {
    const key = subInfoTranslationMap[subInfo]
    return key ? t(key) : subInfo
  }

  const getDocTypeLabel = (type: string) => {
    const key = docTranslationMap[type]
    return key ? t(key) : type
  }

  const getPersonTypeLabel = (type: Person['type']) => {
    return type === 'student' ? t('admin.monitoring.person.student') : t('admin.monitoring.person.teacher')
  }

  const getAttendanceStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return t('admin.monitoring.attendance.present')
      case 'sakit': return t('admin.monitoring.attendance.sick')
      case 'izin': return t('admin.monitoring.attendance.leave')
      case 'alpha': return t('admin.monitoring.attendance.absent')
      default: return status
    }
  }

  const [newDocPrompt, setNewDocPrompt] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  const handleApproveDoc = (docIndex: number) => {
    if (!selectedPerson) return;
    const newDocs = [...selectedPerson.docs];
    newDocs[docIndex].status = 'verified';
    setSelectedPerson({ ...selectedPerson, docs: newDocs });
    
    // Mutate source so it persists during tab switches 
    const currentList = selectedPerson.type === 'student' ? MOCK_STUDENTS : MOCK_TEACHERS;
    const personRef = currentList.find(p => p.id === selectedPerson.id);
    if (personRef) {
       personRef.docs = newDocs;
    }
  }

  const handleAddRequest = () => {
    if (!selectedPerson || !newDocName.trim()) return;
    const newDocs = [...selectedPerson.docs, { type: newDocName.trim(), status: 'missing' as const }];
    setSelectedPerson({ ...selectedPerson, docs: newDocs });
    
    const currentList = selectedPerson.type === 'student' ? MOCK_STUDENTS : MOCK_TEACHERS;
    const personRef = currentList.find(p => p.id === selectedPerson.id);
    if (personRef) {
       personRef.docs = newDocs;
    }
    
    setNewDocName('');
    setNewDocPrompt(false);
  }

  const filteredData = currentData.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filterSubInfo === '' || item.subInfo === filterSubInfo
    return matchSearch && matchFilter
  })

  // Dynamic calendar resolution
  const calendarData = useMemo(() => {
    if (!selectedPerson) return null;
    return generateMonthData(currentDate.getFullYear(), currentDate.getMonth(), selectedPerson.id, selectedPerson.attendancePercentage);
  }, [selectedPerson, currentDate])

  const renderAttendanceStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return <span className="px-2.5 py-1 bg-[#f1fcf5] text-[#22c55e] text-xs font-bold rounded-full">{getAttendanceStatusLabel(status)}</span>
      case 'sakit': return <span className="px-2.5 py-1 bg-[#f2f8ff] text-[#3b82f6] text-xs font-bold rounded-full">{getAttendanceStatusLabel(status)}</span>
      case 'izin': return <span className="px-2.5 py-1 bg-[#fffbf0] text-[#eab308] text-xs font-bold rounded-full">{getAttendanceStatusLabel(status)}</span>
      case 'alpha': return <span className="px-2.5 py-1 bg-[#fef4f4] text-[#ef4444] text-xs font-bold rounded-full border border-red-200">{getAttendanceStatusLabel(status)}</span>
      default: return <span className="px-2.5 py-1 bg-muted/50 text-foreground text-xs font-bold rounded-full">{status}</span>
    }
  }

  const renderDocStatus = (status: DocStatus) => {
    switch (status) {
      case 'verified':
        return <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold tracking-wide"><FileCheck className="w-3.5 h-3.5" /> {t('admin.monitoring.docStatus.verified')}</span>
      case 'pending':
        return <span className="flex items-center gap-1.5 text-amber-600 text-[11px] font-bold tracking-wide"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('admin.monitoring.docStatus.pending')}</span>
      case 'missing':
        return <span className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold tracking-wide"><AlertCircle className="w-3.5 h-3.5" /> {t('admin.monitoring.docStatus.missing')}</span>
      default:
        return <span>{status}</span>
    }
  }

  // --- FULL PAGE DETAIL VIEW ---
  if (selectedPerson && calendarData) {
    const { days, summary } = calendarData;
    
    return (
      <main className="flex-1 flex flex-col h-full bg-[#f8fafc] relative min-w-0 animate-in fade-in duration-200">
        <header className="h-16 bg-card border-b border-border flex items-center px-6 shrink-0 shadow-sm z-10 gap-3">
          <button 
            onClick={() => setSelectedPerson(null)}
            className="p-2 -ml-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center"
            title={t('admin.monitoring.detail.back')}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h2 className="text-foreground text-lg font-bold">
              {selectedPerson.type === 'student' ? t('admin.monitoring.detail.title.student') : t('admin.monitoring.detail.title.teacher')}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">{t('admin.monitoring.detail.subtitle')}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative scrollbar-none">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            
            {/* Left Column - Profile & Real Calendar */}
            <div className="flex flex-col gap-6">
              
              {/* Profile Card */}
              <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm flex items-center gap-5">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shrink-0 ${selectedPerson.type === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {selectedPerson.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-black text-foreground tracking-tight">{selectedPerson.name}</h2>
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200/50">
                      {getPersonTypeLabel(selectedPerson.type)}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
                    <span className="font-bold text-foreground">{selectedPerson.type === 'student' ? 'NISN:' : 'NIP:'}</span> {selectedPerson.idNumber}
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
                    <span className="bg-muted/50 px-2.5 py-1 rounded-md font-bold text-foreground border border-border/60">{getSubInfoLabel(selectedPerson.subInfo)}</span>
                  </p>
                </div>
              </div>

              {/* Exact Calendar Request Implementation */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                 
                 {/* Calendar Header */}
                 <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[22px] font-extrabold text-foreground whitespace-nowrap">
                          {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
                       </h3>
                       <div className="flex gap-1">
                         <button onClick={prevMonth} className="text-muted-foreground hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-accent" title={t('admin.monitoring.calendar.prev')}>
                           <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                         </button>
                         <button onClick={nextMonth} className="text-muted-foreground hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-accent" title={t('admin.monitoring.calendar.next')}>
                           <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                         </button>
                       </div>
                    </div>
                    
                    {/* Header Legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-semibold text-muted-foreground">
                       <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> {t('admin.monitoring.attendance.present')}</span>
                       <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> {t('admin.monitoring.attendance.absent')}</span>
                       <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> {t('admin.monitoring.attendance.sick')}</span>
                       <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> {t('admin.monitoring.attendance.lateLeave')}</span>
                    </div>
                 </div>

                 {/* Grid Design */}
                 <div className="grid grid-cols-7 gap-y-3 gap-x-2 sm:gap-x-4 sm:gap-y-4 max-w-[850px] mx-auto w-full">
                    {/* Days Row */}
                    {dayLabelKeys.map(dayKey => (
                      <div key={dayKey} className="text-center text-[11px] font-extrabold text-muted-foreground tracking-[0.15em] mb-1">{t(dayKey)}</div>
                    ))}

                    {/* Matrix rendering */}
                    {days.map((item, idx) => {
                      if (item.empty) {
                        return <div key={idx} className="h-[80px] sm:h-[92px] bg-slate-50/50 rounded-2xl border border-dashed border-border" />
                      }

                      // Neutral Clean Aesthetic
                      let boxStyle = "bg-card border border-border text-foreground shadow-sm"
                      let badge = null;

                      if (item.status === 'H') {
                        badge = <span className="mt-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold tracking-widest">HD</span>
                      } else if (item.status === 'A') {
                        badge = <span className="mt-1.5 bg-red-100 border border-red-200 text-red-700 px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold tracking-widest">AL</span>
                      } else if (item.status === 'S') {
                        badge = <span className="mt-1.5 bg-blue-100 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold tracking-widest">SK</span>
                      } else if (item.status === 'I') {
                        badge = <span className="mt-1.5 bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold tracking-widest">IZ</span>
                      } else if (item.status === 'today') {
                        boxStyle = "bg-primary text-white shadow-md border border-primary/80"
                        badge = <span className="mt-1.5 bg-white/20 text-white px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold tracking-widest">{t('admin.monitoring.calendar.today')}</span>
                      } else {
                        // Future days
                        boxStyle = "bg-muted/50 border border-border/60 text-muted-foreground"
                      }

                      return (
                        <div key={idx} className={`h-[80px] sm:h-[92px] rounded-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${boxStyle}`}>
                          <span className={`text-[20px] sm:text-[24px] font-black leading-none ${item.status === 'today' ? 'text-white' : (item.status === 'none' ? 'text-muted-foreground' : 'text-foreground')}`}>{item.date}</span>
                          {badge}
                        </div>
                      )
                    })}
                 </div>

                 {/* Summary Row */}
                 <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
                    <div className="bg-card rounded-[14px] p-4 flex flex-col items-center border border-border shadow-sm transition-all hover:border-emerald-300">
                       <span className="text-2xl font-black text-emerald-600">{summary.H}</span>
                       <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mt-1">{t('admin.monitoring.attendance.present')} (HD)</span>
                    </div>
                    <div className="bg-card rounded-[14px] p-4 flex flex-col items-center border border-border shadow-sm transition-all hover:border-red-300">
                       <span className="text-2xl font-black text-red-600">{summary.A}</span>
                       <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mt-1">{t('admin.monitoring.attendance.absent')} (AL)</span>
                    </div>
                    <div className="bg-card rounded-[14px] p-4 flex flex-col items-center border border-border shadow-sm transition-all hover:border-blue-300">
                       <span className="text-2xl font-black text-blue-600">{summary.S}</span>
                       <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mt-1">{t('admin.monitoring.attendance.sick')} (SK)</span>
                    </div>
                    <div className="bg-card rounded-[14px] p-4 flex flex-col items-center border border-border shadow-sm transition-all hover:border-amber-300">
                       <span className="text-2xl font-black text-amber-500">{summary.I}</span>
                       <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mt-1">{t('admin.monitoring.attendance.leave')} (IZ)</span>
                    </div>
                 </div>

              </div>
            </div>
            
            {/* Right Column - Documents Box */}
            <div className="flex flex-col">
               <div className="bg-card rounded-[20px] p-5 border border-border shadow-sm sticky top-[20px]">
                  <div className="flex justify-between items-center gap-3 mb-4 pb-3 border-b border-border/60">
                    <h4 className="font-black text-foreground text-base flex items-center gap-2.5">
                      <div className="p-1.5 bg-purple-50 rounded-lg"><FileText className="w-4 h-4 text-purple-600" /></div>
                      {t('admin.monitoring.documents.title')}
                    </h4>
                    <button onClick={() => setNewDocPrompt(true)} className="h-7 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-2.5 rounded-md flex items-center gap-1 transition-colors">
                      <Plus className="w-3.5 h-3.5"/> {t('admin.monitoring.documents.add')}
                    </button>
                  </div>

                  {newDocPrompt && (
                    <div className="mb-4 bg-muted/50 border border-border p-3 rounded-xl flex gap-2 items-center shadow-inner">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder={t('admin.monitoring.documents.placeholder')} 
                        className="flex-1 text-sm font-semibold px-3 py-1.5 bg-card border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRequest()}
                      />
                      <button onClick={handleAddRequest} className="h-8 bg-primary text-white px-3 rounded-md text-[11px] font-extrabold tracking-wide hover:bg-primary/90 shadow-sm">{t('admin.monitoring.documents.send')}</button>
                      <button onClick={() => {setNewDocPrompt(false); setNewDocName('');}} className="text-muted-foreground hover:bg-slate-200 hover:text-slate-600 p-1.5 rounded-md transition-colors" title={t('admin.monitoring.documents.cancelAdd')}><X className="w-4 h-4"/></button>
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
                    {selectedPerson.docs.map((doc, idx) => (
                       <div key={idx} className="flex flex-col gap-2 bg-card p-3 rounded-xl border border-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-primary/30 hover:shadow-md transition-all">
                         <div className="flex items-start gap-3">
                           <div className={`p-2 rounded-lg shrink-0 ${doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                              <FileText className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
                             <span className="text-sm font-bold leading-snug text-foreground truncate">{getDocTypeLabel(doc.type)}</span>
                             <div>{renderDocStatus(doc.status)}</div>
                           </div>
                         </div>
                         {doc.status !== 'missing' && (
                           <div className={`grid ${doc.status === 'pending' ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 mt-1.5 pt-2 border-t border-border/60`}>
                             {doc.status === 'pending' && (
                               <button onClick={() => handleApproveDoc(idx)} className="h-7 bg-emerald-50 hover:bg-emerald-500 hover:border-emerald-600 hover:text-white border border-emerald-200 text-emerald-600 text-[10px] font-extrabold tracking-wide px-2 rounded-md flex items-center justify-center gap-1 transition-colors">
                                  {t('admin.monitoring.documents.approve')}
                               </button>
                             )}
                             <button className="h-7 bg-muted/40 hover:bg-primary hover:text-white hover:border-primary border border-border text-foreground text-[10px] font-extrabold tracking-wide px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors">
                                <Eye className="w-3 h-3"/> {t('admin.monitoring.documents.view')}
                             </button>
                             <button className="h-7 bg-muted/40 hover:bg-primary hover:text-white hover:border-primary border border-border text-foreground text-[10px] font-extrabold tracking-wide px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors">
                                <Download className="w-3 h-3"/> {t('admin.monitoring.documents.download')}
                             </button>
                           </div>
                         )}
                         {doc.status === 'missing' && (
                           <div className="mt-1.5 pt-2 border-t border-border/60 grid grid-cols-1">
                             <button className="h-7 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 text-[10px] font-extrabold tracking-wide px-2 rounded-md transition-colors">
                                {t('admin.monitoring.documents.remind')}
                             </button>
                           </div>
                         )}
                       </div>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    )
  }

  // --- MAIN TABLE VIEW ---
  return (
    <div className="flex w-full h-full relative overflow-hidden bg-background">
      <main className="flex-1 flex flex-col h-full relative transition-all duration-300 ease-in-out">
        
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black">{t('admin.monitoring.title')}</h2>
              <p className="text-muted-foreground text-xs hidden sm:block">{t('admin.monitoring.subtitle')}</p>
            </div>
          </div>
        </header>

        <div className="px-6 pt-4 pb-0 bg-card border-b border-border shrink-0">
          <div className="flex gap-6">
            <button
              onClick={() => { setActiveTab('student-data'); setFilterSubInfo(''); }}
              className={`pb-3 px-2 text-sm font-semibold relative transition-colors ${
                activeTab === 'student-data' ? 'text-primary' : 'text-muted-foreground hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {t('admin.monitoring.tab.studentData')}</span>
              {activeTab === 'student-data' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(19,127,236,0.5)]" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('teacher-data'); setFilterSubInfo(''); }}
              className={`pb-3 px-2 text-sm font-semibold relative transition-colors ${
                activeTab === 'teacher-data' ? 'text-primary' : 'text-muted-foreground hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {t('admin.monitoring.tab.teacherData')}</span>
              {activeTab === 'teacher-data' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(19,127,236,0.5)]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative scrollbar-none">
          <div className="max-w-[1200px] flex flex-col gap-5 mx-auto w-full pb-6">
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4">
                <div>
                  <h3 className="text-foreground text-lg font-bold leading-7">
                    {activeTab === 'student-data' ? t('admin.monitoring.listTitle.student') : t('admin.monitoring.listTitle.teacher')}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t('admin.monitoring.listSubtitle')}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative w-full sm:w-auto min-w-[180px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-[15px] w-[15px] text-muted-foreground" />
                    </div>
                    <select
                      value={filterSubInfo}
                      onChange={(e) => setFilterSubInfo(e.target.value)}
                      aria-label={activeTab === 'student-data' ? t('admin.monitoring.filter.class') : t('admin.monitoring.filter.subject')}
                      title={activeTab === 'student-data' ? t('admin.monitoring.filter.class') : t('admin.monitoring.filter.subject')}
                      className="w-full appearance-none bg-card border border-border text-foreground font-semibold text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary block pl-10 pr-8 py-2 outline-none transition-all shadow-sm"
                    >
                      <option value="">{activeTab === 'student-data' ? t('admin.monitoring.filter.allClasses') : t('admin.monitoring.filter.allSubjects')}</option>
                      {uniqueSubInfos.map(info => (
                        <option key={info} value={info}>{getSubInfoLabel(info)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative w-full sm:w-[280px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-[15px] w-[15px] text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('admin.monitoring.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-card text-foreground font-medium placeholder-slate-400 border border-border text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary block pl-10 px-4 py-2 outline-none transition-all shadow-sm"
                    />
                  </div>

                </div>
            </div>

            <div className="w-full border border-border rounded-[14px] overflow-hidden shadow-sm bg-card">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-muted/50 text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground border-b border-border">
                      <th className="px-4 py-3">{t('admin.monitoring.table.fullName')}</th>
                      <th className="px-4 py-3">{activeTab === 'student-data' ? 'NISN' : 'NIP'}</th>
                      <th className="px-4 py-3">{activeTab === 'student-data' ? t('admin.monitoring.table.class') : t('admin.monitoring.table.subject')}</th>
                      <th className="px-4 py-3">{t('admin.monitoring.table.attendanceStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map(person => (
                      <tr 
                        key={person.id} 
                        onClick={() => setSelectedPerson(person)}
                        className="transition-colors cursor-pointer group hover:bg-slate-50/80 border-l-4 border-l-transparent hover:border-l-primary"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-bold text-sm ring-1 ring-offset-1 group-hover:ring-offset-2 transition-all ${activeTab === 'student-data' ? 'bg-blue-50 text-blue-600 ring-blue-200' : 'bg-indigo-50 text-indigo-600 ring-indigo-200'}`}>
                              {person.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{person.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-semibold">{person.idNumber}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground"><span className="bg-muted border border-slate-200/60 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wide font-bold text-foreground">{getSubInfoLabel(person.subInfo)}</span></td>
                        <td className="px-4 py-3">{renderAttendanceStatus(person.status)}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                       <tr>
                          <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                             <div className="flex flex-col items-center gap-3">
                               <div className="p-4 bg-muted/50 rounded-full border border-border/60">
                                 <Users className="w-8 h-8 text-slate-300" />
                               </div>
                               <span className="font-semibold text-sm">{t('admin.monitoring.empty')}</span>
                             </div>
                          </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
