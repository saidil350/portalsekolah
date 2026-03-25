'use client';

import React, { useState } from 'react';
import { History, Save, PlusCircle, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type RoleId = 'admin' | 'teacher' | 'treasurer' | 'student';

interface PermRow {
  label: string;
  desc: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface RoleData {
  title: string;
  description: string;
  users: string;
  badge?: string;
  sections: { name: string; color: string; rows: PermRow[] }[];
}

const initialRoles: Record<RoleId, RoleData> = {
  admin: {
    title: 'Administrator',
    description: 'Full system access, manage all users and data.',
    users: '8 Users',
    badge: 'Super',
    sections: [
      {
        name: 'Academic Management', color: 'text-primary',
        rows: [
          { label: 'Student Records', desc: 'Manage biodata and enrollment', create: true, read: true, update: true, delete: true },
          { label: 'Curriculum & Classes', desc: 'Subjects and class schedules', create: true, read: true, update: true, delete: true },
        ]
      },
      {
        name: 'Financial Management', color: 'text-orange-600',
        rows: [
          { label: 'Tuition Fees (SPP)', desc: 'Invoicing and payment records', create: true, read: true, update: true, delete: true },
        ]
      },
      {
        name: 'Attendance & Discipline', color: 'text-emerald-600',
        rows: [
          { label: 'Daily Attendance', desc: 'Staff and student attendance logs', create: true, read: true, update: true, delete: true },
        ]
      },
      {
        name: 'System Administration', color: 'text-red-600',
        rows: [
          { label: 'Role Management', desc: 'Edit roles and assign permissions', create: true, read: true, update: true, delete: true },
        ]
      },
    ],
  },
  teacher: {
    title: 'Teacher',
    description: 'Manage grades, materials, and attendance.',
    users: '124 Users',
    sections: [
      {
        name: 'Academic Management', color: 'text-primary',
        rows: [
          { label: 'Student Records', desc: 'Manage biodata and enrollment', create: false, read: true, update: true, delete: false },
          { label: 'Curriculum & Classes', desc: 'Subjects and class schedules', create: true, read: true, update: true, delete: false },
        ]
      },
      {
        name: 'Financial Management', color: 'text-orange-600',
        rows: [
          { label: 'Tuition Fees (SPP)', desc: 'Invoicing and payment records', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'Attendance & Discipline', color: 'text-emerald-600',
        rows: [
          { label: 'Daily Attendance', desc: 'Staff and student attendance logs', create: true, read: true, update: true, delete: false },
        ]
      },
      {
        name: 'System Administration', color: 'text-red-600',
        rows: [
          { label: 'Role Management', desc: 'Edit roles and assign permissions', create: false, read: false, update: false, delete: false },
        ]
      },
    ],
  },
  treasurer: {
    title: 'Treasurer',
    description: 'Manage tuition (SPP) and school expenses.',
    users: '3 Users',
    sections: [
      {
        name: 'Academic Management', color: 'text-primary',
        rows: [
          { label: 'Student Records', desc: 'Manage biodata and enrollment', create: false, read: true, update: false, delete: false },
          { label: 'Curriculum & Classes', desc: 'Subjects and class schedules', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'Financial Management', color: 'text-orange-600',
        rows: [
          { label: 'Tuition Fees (SPP)', desc: 'Invoicing and payment records', create: true, read: true, update: true, delete: true },
        ]
      },
      {
        name: 'Attendance & Discipline', color: 'text-emerald-600',
        rows: [
          { label: 'Daily Attendance', desc: 'Staff and student attendance logs', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'System Administration', color: 'text-red-600',
        rows: [
          { label: 'Role Management', desc: 'Edit roles and assign permissions', create: false, read: false, update: false, delete: false },
        ]
      },
    ],
  },
  student: {
    title: 'Student',
    description: 'Access learning materials and see results.',
    users: '1,820 Users',
    sections: [
      {
        name: 'Academic Management', color: 'text-primary',
        rows: [
          { label: 'Student Records', desc: 'Manage biodata and enrollment', create: false, read: true, update: false, delete: false },
          { label: 'Curriculum & Classes', desc: 'Subjects and class schedules', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'Financial Management', color: 'text-orange-600',
        rows: [
          { label: 'Tuition Fees (SPP)', desc: 'Invoicing and payment records', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'Attendance & Discipline', color: 'text-emerald-600',
        rows: [
          { label: 'Daily Attendance', desc: 'Staff and student attendance logs', create: false, read: true, update: false, delete: false },
        ]
      },
      {
        name: 'System Administration', color: 'text-red-600',
        rows: [
          { label: 'Role Management', desc: 'Edit roles and assign permissions', create: false, read: false, update: false, delete: false },
        ]
      },
    ],
  },
};

const sectionKeys: Record<string, string> = {
  'Academic Management': 'admin.roles.section.academic',
  'Financial Management': 'admin.roles.section.financial',
  'Attendance & Discipline': 'admin.roles.section.attendance',
  'System Administration': 'admin.roles.section.system',
};

const rowKeys: Record<string, { label: string; desc: string }> = {
  'Student Records': { label: 'admin.roles.row.studentRecords.label', desc: 'admin.roles.row.studentRecords.desc' },
  'Curriculum & Classes': { label: 'admin.roles.row.curriculum.label', desc: 'admin.roles.row.curriculum.desc' },
  'Tuition Fees (SPP)': { label: 'admin.roles.row.tuition.label', desc: 'admin.roles.row.tuition.desc' },
  'Daily Attendance': { label: 'admin.roles.row.attendance.label', desc: 'admin.roles.row.attendance.desc' },
  'Role Management': { label: 'admin.roles.row.roleManagement.label', desc: 'admin.roles.row.roleManagement.desc' },
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15)] transition-all duration-200 ${checked ? 'left-[18px]' : 'left-[2px]'}`} />
    </button>
  );
}

export default function PeranDanIzinPage() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<RoleId>('admin');
  const [roles, setRoles] = useState(initialRoles);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectAll, setSelectAll] = useState(false);

  const currentRole = roles[selectedRole];
  const roleIds: RoleId[] = ['admin', 'teacher', 'treasurer', 'student'];

  const togglePerm = (sIdx: number, rIdx: number, perm: 'create' | 'read' | 'update' | 'delete') => {
    setRoles(prev => {
      const updated = { ...prev };
      const role = { ...updated[selectedRole] };
      const sections = role.sections.map((s, si) => {
        if (si !== sIdx) return s;
        return {
          ...s,
          rows: s.rows.map((r, ri) => {
            if (ri !== rIdx) return r;
            return { ...r, [perm]: !r[perm] };
          }),
        };
      });
      role.sections = sections;
      updated[selectedRole] = role;
      return updated;
    });
  };

  const handleSelectAll = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    setRoles(prev => {
      const updated = { ...prev };
      const role = { ...updated[selectedRole] };
      role.sections = role.sections.map(s => ({
        ...s,
        rows: s.rows.map(r => ({ ...r, create: newVal, read: newVal, update: newVal, delete: newVal })),
      }));
      updated[selectedRole] = role;
      return updated;
    });
  };

  const handleSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1500);
  };

  return (
      <main className="flex-1 flex flex-col h-full bg-background-light relative min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-slate-900 text-lg font-bold">{t('admin.roles.title')}</h2>
            <p className="text-slate-500 text-xs font-medium">{t('admin.roles.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition-all">
              <History className="w-4 h-4" />
              {t('admin.roles.btn.auditLog')}
            </button>
            <button
              type="button"
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-[0px_1px_2px_0px_rgba(19,127,236,0.3)] transition-all active:scale-[0.97] ${
                saveState === 'saved' ? 'bg-emerald-500 text-white' : saveState === 'saving' ? 'bg-primary/80 text-white' : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              onClick={handleSave}
              disabled={saveState !== 'idle'}
            >
              {saveState === 'saving' ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  {t('admin.roles.btn.saving')}
                </>
              ) : saveState === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('admin.roles.btn.saved')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 fill-current stroke-2" />
                  {t('admin.roles.btn.save')}
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex min-h-0 w-full relative">
          
          {/* Roles List Sidebar */}
          <div className="w-[320px] bg-white/50 border-r border-slate-200 flex flex-col pt-6 pb-6 pl-6 pr-[25px] overflow-y-auto shrink-0 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[1.2px]">{t('admin.roles.sidebar.title')}</h3>
              <button type="button" className="text-primary hover:text-primary-dark rounded-full hover:bg-primary/10 p-1 transition-all active:scale-90" title={t('admin.roles.sidebar.add')} aria-label={t('admin.roles.sidebar.add')}>
                <PlusCircle className="w-[17px] h-[17px]" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {roleIds.map((rid) => {
                const role = roles[rid];
                const isActive = selectedRole === rid;
                const usersCount = role.users.split(' ')[0];
                return (
                  <button
                    type="button"
                    key={rid}
                    onClick={() => { setSelectedRole(rid); setSelectAll(false); }}
                    aria-pressed={isActive ? 'true' : 'false'}
                    className={`text-left rounded-xl p-[18px] flex flex-col gap-1 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/5 border-2 border-primary scale-[1.01] shadow-sm'
                        : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-900'}`}>{t(`admin.roles.role.${rid}.title` as any)}</h4>
                      <div className={`w-[15px] h-[15px] rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive ? 'bg-primary scale-110' : 'border border-slate-300'
                      }`}>
                        {isActive && <Check className="w-[10px] h-[10px] text-white stroke-[3px]" />}
                      </div>
                    </div>
                    <p className={`text-[11px] font-medium leading-normal transition-colors ${isActive ? 'text-primary/70' : 'text-slate-500'}`}>{t(`admin.roles.role.${rid}.desc` as any)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>{t('admin.roles.role.users_count').replace('{count}', usersCount)}</span>
                      {role.badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>{t(`admin.roles.role.badge.${role.badge.toLowerCase()}` as any)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Matrix Table */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-[1024px] flex flex-col gap-6 mx-auto">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 text-base font-bold">
                    {t('admin.roles.matrix.title').replace('{role}', t(`admin.roles.role.${selectedRole}.title` as any))}
                  </h3>
                  <p className="text-slate-500 text-sm">{t('admin.roles.matrix.subtitle')}</p>
                </div>
                <label className="flex items-center gap-2 px-[17px] py-[9px] bg-white border border-slate-200 rounded-lg shrink-0 cursor-pointer hover:bg-slate-50 transition-colors active:scale-[0.97]">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    title={t('admin.roles.matrix.selectAll')}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary transition-all"
                  />
                  <span className="text-slate-600 text-xs font-bold">{t('admin.roles.matrix.selectAll')}</span>
                </label>
              </div>

              {/* Permissions Table Block */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="min-w-max w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] bg-slate-50 border-b border-slate-200">
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[1.1px]">{t('admin.roles.table.header.scope')}</span>
                    </div>
                    {['create', 'read', 'update', 'delete'].map(h => (
                      <div key={h} className="p-4 flex items-center justify-center">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[1.1px]">{t(`admin.roles.table.header.${h}` as any)}</span>
                      </div>
                    ))}
                  </div>

                  {currentRole.sections.map((section, sIdx) => {
                    const sectionLabel = t((sectionKeys[section.name] || section.name) as any);
                    return (
                    <React.Fragment key={section.name}>
                      {/* Section Header */}
                      <div className="bg-slate-50/50 px-6 py-2 border-b border-slate-100">
                        <span className={`${section.color} text-[10px] font-bold uppercase tracking-[0.5px]`}>{sectionLabel}</span>
                      </div>
                      {/* Rows */}
                      {section.rows.map((row, rIdx) => {
                        const rowTranslation = rowKeys[row.label] || { label: row.label, desc: row.desc };
                        const rowLabel = t(rowTranslation.label as any);
                        const roleTitle = t(`admin.roles.role.${selectedRole}.title` as any);
                        return (
                        <div key={row.label} className={`grid grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                          sIdx === currentRole.sections.length - 1 && rIdx === section.rows.length - 1 ? 'border-b-0' : ''
                        }`}>
                          <div className="py-4 px-6 flex flex-col justify-center">
                            <span className="text-slate-900 text-sm font-semibold">{rowLabel}</span>
                            <span className="text-slate-500 text-[11px]">{t(rowTranslation.desc as any)}</span>
                          </div>
                          {(['create', 'read', 'update', 'delete'] as const).map(perm => (
                            <div key={perm} className="flex items-center justify-center p-4">
                              <Toggle 
                                checked={row[perm]} 
                                label={`${t(`admin.roles.table.header.${perm}` as any)} ${rowLabel} ${t('admin.roles.matrix.title').replace('{role}', roleTitle)}`}
                                onChange={() => togglePerm(sIdx, rIdx, perm)} 
                              />
                            </div>
                          ))}
                        </div>
                      )})}
                    </React.Fragment>
                  )})}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
  );
}
