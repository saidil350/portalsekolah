"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, LogIn, Activity, Database, Trash2, DownloadCloud, Plus, Check, AlertTriangle, Loader2 } from 'lucide-react';
import {
  getSystemSettings,
  updateSchoolIdentity,
  toggleMaintenanceMode,
  createBackup,
  exportAuditLogs,
  getOwnProfile,
  updateOwnProfile
} from './actions';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PengaturanSistemPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [backupCreating, setBackupCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSystemSettings();
        if (data) {
          setSettings(data);
          setMaintenanceMode(data.maintenance_mode || false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadProfile = async () => {
      try {
        const data = await getOwnProfile();
        if (data) setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadSettings();
    loadProfile();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateOwnProfile(formData);
      if (result.success) {
        setProfileSaved(true);
        showMessage('success', t('admin.settings.profile.success'));
        setTimeout(() => setProfileSaved(false), 2500);
        const data = await getOwnProfile();
        if (data) setProfile(data);
      } else {
        showMessage('error', t('admin.settings.profile.error'));
      }
    } catch (error: any) {
      showMessage('error', t('admin.settings.common.error'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateSchoolIdentity(formData);

      if (result.success) {
        setIdentitySaved(true);
        showMessage('success', t('admin.settings.identity.success'));
        setTimeout(() => setIdentitySaved(false), 2500);

        // Reload settings
        const data = await getSystemSettings();
        if (data) setSettings(data);
      } else {
        showMessage('error', t('admin.settings.identity.error'));
      }
    } catch (error: any) {
      showMessage('error', t('admin.settings.common.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackupCreating(true);

    try {
      const result = await createBackup();

      if (result.success) {
        showMessage('success', t('admin.settings.backup.success'));
      } else {
        showMessage('error', t('admin.settings.backup.error'));
      }
    } catch (error: any) {
      showMessage('error', t('admin.settings.common.error'));
    } finally {
      setBackupCreating(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !maintenanceMode;

    try {
      const result = await toggleMaintenanceMode(newValue);

      if (result.success) {
        setMaintenanceMode(newValue);
        showMessage('success', newValue ? t('admin.settings.common.maintenanceActive') : t('admin.settings.common.maintenanceInactive'));
      } else {
        showMessage('error', t('admin.settings.common.error'));
      }
    } catch (error: any) {
      showMessage('error', t('admin.settings.common.error'));
    }
  };

  const handleExportLogs = async () => {
    try {
      const result = await exportAuditLogs();

      if (result.success && result.logs) {
        // Create CSV content
        const headers = 'Timestamp,Event,Details\\n';
        const rows = result.logs.map((log: any) =>
          `${log.timestamp},${log.action},${log.user || 'System'}`
        ).join('\\n');
        const csvContent = headers + rows;

        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showMessage('success', t('admin.settings.audit.exportSuccess'));
      } else {
        showMessage('error', t('admin.settings.audit.exportError'));
      }
    } catch (error: any) {
      showMessage('error', t('admin.settings.common.error'));
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex flex-col h-full bg-background-light relative min-w-0">
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
      <main className="flex-1 flex flex-col h-full bg-background-light relative min-w-0">
        {/* Toast Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          } text-white text-sm font-medium animate-in slide-in-from-right duration-300`}>
            {message.text}
          </div>
        )}

        {/* Header content */}
        <header className="h-auto min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 py-3 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-slate-900 text-[20px] font-bold">{t('admin.settings.title')}</h2>
            <p className="text-slate-500 text-sm">{t('admin.settings.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`${maintenanceMode ? 'bg-orange-100 border-orange-300' : 'bg-orange-50 border-orange-100'} border flex items-center gap-3 px-4 py-2 rounded-lg transition-colors`}>
                <span className="text-orange-700 text-xs font-semibold uppercase tracking-wide">{t('admin.settings.maintenance.label')}</span>
                {maintenanceMode ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked="true"
                    aria-label={t('admin.settings.maintenance.toggleOff')}
                    title={t('admin.settings.maintenance.toggleOff')}
                    onClick={handleToggleMaintenance}
                    disabled={updating}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 bg-orange-500 disabled:opacity-50"
                  >
                    <span className="inline-block h-5 w-5 transform rounded-full bg-white border border-orange-300 shadow-sm transition-transform translate-x-[22px]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked="false"
                    aria-label={t('admin.settings.maintenance.toggleOn')}
                    title={t('admin.settings.maintenance.toggleOn')}
                    onClick={handleToggleMaintenance}
                    disabled={updating}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 bg-slate-200 disabled:opacity-50"
                  >
                    <span className="inline-block h-5 w-5 transform rounded-full bg-white border border-slate-300 shadow-sm transition-transform translate-x-[2px]" />
                  </button>
                )}
             </div>
          </div>
        </header>

        {/* Maintenance Mode Banner */}
        {maintenanceMode && (
          <div className="bg-orange-500 text-white px-8 py-3 flex items-center gap-3 shrink-0 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{t('admin.settings.maintenance.active')}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1152px] flex flex-col lg:flex-row gap-8 mx-auto w-full">

            {/* Left Column: Settings Cards */}
            <div className="flex-1 flex flex-col gap-8 w-full min-w-0">

               {/* Admin Profile Card */}
               <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
                  <div className="border-b border-slate-100 p-6 flex flex-col gap-1">
                    <h3 className="text-slate-900 text-lg font-bold">{t('admin.settings.profile.title')}</h3>
                    <p className="text-slate-500 text-sm">{t('admin.settings.profile.subtitle')}</p>
                  </div>
                  <div className="p-6 flex flex-col gap-6">

                     {/* Text Inputs Row */}
                     <div className="flex flex-col sm:flex-row gap-6 w-full">
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="fullName" className="text-slate-700 text-sm font-semibold">{t('admin.settings.profile.fullName')}</label>
                           <input
                             id="fullName"
                             name="fullName"
                             type="text"
                             required
                             defaultValue={profile?.full_name || ''}
                             placeholder={t('admin.settings.profile.fullNamePlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="profile-email" className="text-slate-700 text-sm font-semibold">{t('admin.settings.profile.email')}</label>
                           <input
                             id="profile-email"
                             name="email"
                             type="email"
                             required
                             defaultValue={profile?.email || ''}
                             placeholder={t('admin.settings.profile.emailPlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-6 w-full">
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="profile-nip" className="text-slate-700 text-sm font-semibold">{t('admin.settings.profile.nip')}</label>
                           <input
                             id="profile-nip"
                             name="nip"
                             type="text"
                             defaultValue={profile?.nip || ''}
                             placeholder={t('admin.settings.profile.nipPlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="profile-password" className="text-slate-700 text-sm font-semibold">{t('admin.settings.profile.password')}</label>
                           <input
                             id="profile-password"
                             name="password"
                             type="password"
                             minLength={6}
                             placeholder={t('admin.settings.profile.passwordPlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                     </div>

                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                     <button
                       type="submit"
                       disabled={profileSaving}
                       className={`px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${profileSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'} disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                        {profileSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('admin.settings.profile.saving')}
                          </>
                        ) : profileSaved ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t('admin.settings.profile.saved')}
                          </>
                        ) : (
                          <>
                            {t('admin.settings.profile.save')}
                          </>
                        )}
                     </button>
                  </div>
               </form>

               {/* School Identity Card */}
               <form onSubmit={handleSaveIdentity} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
                  <div className="border-b border-slate-100 p-6 flex flex-col gap-1">
                    <h3 className="text-slate-900 text-lg font-bold">{t('admin.settings.identity.title')}</h3>
                    <p className="text-slate-500 text-sm">{t('admin.settings.identity.subtitle')}</p>
                  </div>
                  <div className="p-6 flex flex-col gap-6">

                     {/* Text Inputs Row */}
                     <div className="flex flex-col sm:flex-row gap-6 w-full">
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="school-name" className="text-slate-700 text-sm font-semibold">{t('admin.settings.identity.schoolName')}</label>
                           <input
                             id="school-name"
                             name="schoolName"
                             type="text"
                             defaultValue={settings?.school_name || ''}
                             placeholder={t('admin.settings.identity.schoolNamePlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="school-code" className="text-slate-700 text-sm font-semibold">{t('admin.settings.identity.schoolCode')}</label>
                           <input
                             id="school-code"
                             name="schoolCode"
                             type="text"
                             defaultValue={settings?.school_code || ''}
                             placeholder={t('admin.settings.identity.schoolCodePlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                     </div>

                     {/* Address */}
                     <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="school-address" className="text-slate-700 text-sm font-semibold">{t('admin.settings.identity.address')}</label>
                        <textarea
                           id="school-address"
                           name="schoolAddress"
                           rows={3}
                           defaultValue={settings?.school_address || ''}
                           placeholder={t('admin.settings.identity.addressPlaceholder')}
                           className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-colors"
                        />
                     </div>

                     {/* Contact Info */}
                     <div className="flex flex-col sm:flex-row gap-6 w-full">
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="school-phone" className="text-slate-700 text-sm font-semibold">{t('admin.settings.identity.phone')}</label>
                           <input
                             id="school-phone"
                             name="schoolPhone"
                             type="tel"
                             defaultValue={settings?.school_phone || ''}
                             placeholder={t('admin.settings.identity.phonePlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                           <label htmlFor="school-email" className="text-slate-700 text-sm font-semibold">{t('admin.settings.identity.email')}</label>
                           <input
                             id="school-email"
                             name="schoolEmail"
                             type="email"
                             defaultValue={settings?.school_email || ''}
                             placeholder={t('admin.settings.identity.emailPlaceholder')}
                             className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg block w-full p-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                           />
                        </div>
                     </div>

                     {/* Logo Upload */}
                     <div className="flex items-center gap-6 w-full">
                        <div
                          className="w-24 h-24 bg-slate-50 border-2 border-slate-200 border-dashed rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden group hover:border-primary transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-lg">
                             <span className="text-white text-sm font-bold">LOGO</span>
                           </div>
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-medium">Edit</span>
                           </div>
                        </div>
                        <div className="flex flex-col justify-center">
                           <span className="text-slate-700 text-sm font-semibold mb-1">{t('admin.settings.identity.logo')}</span>
                           <span className="text-slate-500 text-xs mb-2">{t('admin.settings.identity.logoDesc')}</span>
                           <button
                             type="button"
                             className="text-primary text-sm font-medium hover:text-primary-dark transition-colors self-start"
                             onClick={() => fileInputRef.current?.click()}
                           >
                             {t('admin.settings.identity.logoChange')}
                           </button>
                           <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml" className="hidden" aria-label={t('admin.settings.identity.logo')} title={t('admin.settings.identity.logo')} />
                        </div>
                     </div>

                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                     <button
                       type="submit"
                       disabled={updating}
                       className={`px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${identitySaved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'} disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                        {updating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('admin.settings.profile.saving')}
                          </>
                        ) : identitySaved ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t('admin.settings.profile.saved')}
                          </>
                        ) : (
                          <>
                            {t('admin.settings.identity.save')}
                          </>
                        )}
                     </button>
                  </div>
               </form>

               {/* Backup & Restore Card */}
               <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
                  <div className="border-b border-slate-100 p-6 flex flex-col gap-1">
                    <h3 className="text-slate-900 text-lg font-bold">{t('admin.settings.backup.title')}</h3>
                    <p className="text-slate-500 text-sm">{t('admin.settings.backup.subtitle')}</p>
                  </div>
                  <div className="p-6 flex flex-col gap-6">

                     {/* Summary Statuses */}
                     <div className="flex flex-col sm:flex-row gap-4 w-full">

                        {/* Auto Backup Widget */}
                        <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <DownloadCloud className="w-5 h-5 text-blue-700" />
                              <span className="text-blue-700 text-sm font-semibold">{t('admin.settings.backup.auto.title')}</span>
                           </div>
                           <p className="text-slate-600 text-xs line-clamp-2">{t('admin.settings.backup.auto.desc')}</p>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-slate-500 text-xs">{t('admin.settings.backup.auto.last').replace('{time}', '2 jam lalu')}</span>
                              <button type="button" className="text-primary text-xs font-bold hover:underline">{t('admin.settings.backup.auto.config')}</button>
                           </div>
                        </div>

                        {/* Integrity Widget */}
                        <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <ShieldAlert className="w-5 h-5 text-emerald-700" />
                              <span className="text-emerald-700 text-sm font-semibold">{t('admin.settings.backup.integrity.title')}</span>
                           </div>
                           <p className="text-slate-600 text-xs line-clamp-2">{t('admin.settings.backup.integrity.desc')}</p>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-slate-500 text-xs">{t('admin.settings.backup.integrity.status')}</span>
                              <button type="button" className="text-emerald-700 text-xs font-bold hover:underline">{t('admin.settings.backup.integrity.check')}</button>
                           </div>
                        </div>

                     </div>

                     {/* Recent Backups Table */}
                     <div className="flex flex-col gap-3">
                        <span className="text-slate-700 text-sm font-semibold">{t('admin.settings.backup.manual')}</span>
                        <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                           <div className="p-4 text-center text-slate-400 text-sm">
                             {t('admin.settings.backup.empty')}
                           </div>
                        </div>
                     </div>

                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                     <span className="text-slate-500 text-xs">{t('admin.settings.backup.storage').replace('{used}', '840 MB').replace('{total}', '5 GB').replace('{percent}', '16.8')}</span>
                     <button
                       type="button"
                       className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all shadow-sm ${backupCreating ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                       onClick={handleCreateBackup}
                       disabled={backupCreating}
                     >
                        {backupCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('admin.settings.backup.creating')}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-slate-500" />
                            {t('admin.settings.backup.create')}
                          </>
                        )}
                     </button>
                  </div>
               </div>

            </div>

            {/* Right Column: System Audit Logs */}
            <div className="w-full lg:w-[288px] shrink-0">
               <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col lg:h-[750px] w-full">
                  <div className="border-b border-slate-100 p-6 flex items-center justify-between shrink-0">
                    <h3 className="text-slate-900 text-lg font-bold">{t('admin.settings.audit.title')}</h3>
                    <button type="button" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">{t('admin.settings.audit.viewAll')}</button>
                  </div>
                  <div className="flex-1 overflow-y-auto w-full relative">
                     <div className="flex flex-col w-full">

                        {/* Placeholder for logs */}
                        <div className="p-4 text-center text-slate-400 text-sm">
                          {t('admin.settings.audit.empty')}
                        </div>

                     </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                     <button
                       type="button"
                       onClick={handleExportLogs}
                       className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                     >
                        <DownloadCloud className="w-4 h-4 text-slate-500" />
                        {t('admin.settings.audit.export')}
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
  );
}
