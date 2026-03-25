'use client';

import { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStudentProfile, updateStudentProfile, changeStudentPassword, updateNotificationPreferences } from './actions';

// Reusable Toggle Component for ARIA compliance
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked ? "true" : "false"}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-slate-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification states
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [tuitionNotif, setTuitionNotif] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getStudentProfile();
        if (data) {
          setProfile(data);
          if (data.notification_preferences) {
            setEmailNotif(data.notification_preferences.email ?? true);
            setTuitionNotif(data.notification_preferences.tuition ?? true);
            setPushNotif(data.notification_preferences.push ?? false);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateStudentProfile(formData);

      if (result.success) {
        showMessage('success', t('student.settings.toast.success.profile'));
        const data = await getStudentProfile();
        if (data) setProfile(data);
      } else {
        showMessage('error', t('student.settings.toast.error.profile'));
      }
    } catch (error: any) {
      showMessage('error', t('student.settings.toast.error.general'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (formData.get('newPassword') !== formData.get('confirmPassword')) {
        showMessage('error', t('student.settings.toast.error.password'));
        setUpdating(false);
        return;
      }

      const result = await changeStudentPassword(formData);

      if (result.success) {
        showMessage('success', t('student.settings.toast.success.password'));
        e.currentTarget.reset();
      } else {
        showMessage('error', t('student.settings.toast.error.password'));
      }
    } catch (error: any) {
      showMessage('error', t('student.settings.toast.error.general'));
    } finally {
      setUpdating(false);
    }
  };

  const updatePrefs = async (email: boolean, tuition: boolean, push: boolean) => {
    try {
      await updateNotificationPreferences(email, tuition, push);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      showMessage('error', t('student.settings.toast.error.general'));
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'AJ';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[896px] mx-auto p-10 flex flex-col gap-8">
          {/* Toast Message */}
          {message && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              message.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            } text-white text-sm font-medium animate-in slide-in-from-right duration-300`}>
              {message.text}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-text-main tracking-tight">{t('student.settings.title')}</h2>
            <p className="text-base text-text-sub">{t('student.settings.subtitle')}</p>
          </div>

          {/* Profile Information */}
          <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-text-main">{t('student.settings.profile.title')}</h3>
              <p className="text-sm text-text-sub">{t('student.settings.profile.desc')}</p>
            </div>

            <div className="p-6 flex flex-col gap-8">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0px_0px_0px_4px_#f1f5f9]">
                    {profile ? getInitials(profile.full_name) : 'AJ'}
                  </div>
                  <button type="button" title={t('student.settings.profile.upload')} className="absolute bottom-0 right-0 w-8 h-8 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-dark transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-medium text-slate-900">{t('student.settings.profile.upload')}</h4>
                  <p className="text-xs text-slate-500">{t('student.settings.profile.maxSize')}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-slate-700">{t('student.settings.profile.fullName')}</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    defaultValue={profile?.full_name || ''}
                    placeholder="e.g. Ahmad Junaidi"
                    required
                    className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="studentId" className="text-sm font-medium text-slate-700">{t('student.settings.profile.studentId')}</label>
                  <input
                    id="studentId"
                    type="text"
                    value={profile?.nis || 'S12345'}
                    disabled
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700">{t('student.settings.profile.phone')}</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ''}
                    placeholder="08123456789"
                    className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">{t('student.settings.profile.email')}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={profile?.email || ''}
                    required
                    placeholder="ahmad.junaidi@student.ac.id"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-slate-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                {t('student.settings.profile.discard')}
              </button>
              <button type="submit" disabled={updating} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('student.settings.profile.save')}
              </button>
            </div>
          </form>

          {/* Security & Notifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Security */}
            <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="px-6 py-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-text-main">{t('student.settings.security.title')}</h3>
                <p className="text-sm text-text-sub">{t('student.settings.security.desc')}</p>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="currPassword" className="text-sm font-medium text-slate-700">{t('student.settings.security.current')}</label>
                  <input
                    id="currPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">{t('student.settings.security.new')}</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confPassword" className="text-sm font-medium text-slate-700">{t('student.settings.security.confirm')}</label>
                  <input
                    id="confPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-base text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
                <button type="submit" disabled={updating} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('student.settings.security.update')}
                </button>
              </div>
            </form>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="px-6 py-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-text-main">{t('student.settings.notif.title')}</h3>
                <p className="text-sm text-text-sub">{t('student.settings.notif.desc')}</p>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-main">{t('student.settings.notif.email.title')}</p>
                    <p className="text-xs text-text-sub">{t('student.settings.notif.email.desc')}</p>
                  </div>
                  <Toggle
                    checked={emailNotif}
                    onChange={(v) => { setEmailNotif(v); updatePrefs(v, tuitionNotif, pushNotif); }}
                    label={t('student.settings.notif.email.title')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-main">{t('student.settings.notif.billing.title')}</p>
                    <p className="text-xs text-text-sub">{t('student.settings.notif.billing.desc')}</p>
                  </div>
                  <Toggle
                    checked={tuitionNotif}
                    onChange={(v) => { setTuitionNotif(v); updatePrefs(emailNotif, v, pushNotif); }}
                    label={t('student.settings.notif.billing.title')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-main">{t('student.settings.notif.push.title')}</p>
                    <p className="text-xs text-text-sub">{t('student.settings.notif.push.desc')}</p>
                  </div>
                  <Toggle
                    checked={pushNotif}
                    onChange={(v) => { setPushNotif(v); updatePrefs(emailNotif, tuitionNotif, v); }}
                    label={t('student.settings.notif.push.title')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <p className="text-sm text-text-sub">{t('student.db.footer')}</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-text-sub hover:text-text-main cursor-pointer">{t('student.db.help')}</Link>
              <Link href="#" className="text-sm text-text-sub hover:text-text-main cursor-pointer">{t('student.db.privacy')}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
