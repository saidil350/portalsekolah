'use client'

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Info,
  Mail,
  MessageSquare,
  Lock,
  Activity,
  Loader2,
} from 'lucide-react';
import {
  getHeadmasterProfile,
  updateHeadmasterProfile,
  uploadSignature,
  changeHeadmasterPassword,
  updateNotificationPreferences
} from './actions';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PengaturanPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Notification states
  const [laporanMingguan, setLaporanMingguan] = useState(true);
  const [alertKeuangan, setAlertKeuangan] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getHeadmasterProfile();
        if (data) {
          setProfile(data);
          // Set notification preferences from data
          if (data.notification_preferences) {
            setLaporanMingguan(data.notification_preferences.email ?? true);
            setAlertKeuangan(data.notification_preferences.reports ?? false);
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
      formData.append('emailNotifications', laporanMingguan ? 'on' : 'off');
      formData.append('reportNotifications', alertKeuangan ? 'on' : 'off');

      const result = await updateHeadmasterProfile(formData);

      if (result.success) {
        showMessage('success', t('headmaster.settings.msg.profileUpdated'));
        // Reload profile data
        const data = await getHeadmasterProfile();
        if (data) {
          setProfile(data);
          console.log('🔄 Profile reloaded:', data);
        }
      } else {
        showMessage('error', t('headmaster.settings.msg.profileUpdateFailed'));
      }
    } catch (error: any) {
      showMessage('error', t('headmaster.settings.msg.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await changeHeadmasterPassword(formData);

      if (result.success) {
        showMessage('success', t('headmaster.settings.msg.passwordChanged'));
        setShowPasswordForm(false);
        e.currentTarget.reset();
      } else {
        showMessage('error', t('headmaster.settings.msg.passwordChangeFailed'));
      }
    } catch (error: any) {
      showMessage('error', t('headmaster.settings.msg.error'));
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (name: string) => {
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
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        } text-white text-sm font-medium animate-in slide-in-from-right duration-300`}>
          {message.text}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[896px] flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-slate-900 text-[30px] font-bold tracking-tight">{t('headmaster.settings.title')}</h2>
            <p className="text-slate-500 text-base">{t('headmaster.settings.subtitle')}</p>
          </div>

          {/* Section 1: Informasi Pribadi */}
          <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('headmaster.settings.section.personal')}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.settings.section.personal.desc')}</p>
            </div>
            <div className="p-6">
              <div className="flex gap-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative">
                    <div className="w-[128px] h-[128px] rounded-2xl border-4 border-slate-50 overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile ? getInitials(profile.full_name) : 'PB'}
                      </span>
                    </div>
                    <button type="button" title={t('headmaster.settings.changePhoto')} className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-dark transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-4">
                    {t('headmaster.settings.maxSize')}<br />JPG, PNG, WEBP
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="namaLengkap" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.fullName')}</label>
                    <input
                      id="namaLengkap"
                      name="fullName"
                      title={t('headmaster.settings.fullName')}
                      placeholder={t('headmaster.settings.fullName.placeholder')}
                      type="text"
                      defaultValue={profile?.full_name || ''}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nip" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.nip')}</label>
                    <input
                      id="nip"
                      name="nip"
                      title={t('headmaster.settings.nip')}
                      placeholder={t('headmaster.settings.nip.placeholder')}
                      type="text"
                      defaultValue={profile?.nip || ''}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="emailKedinasan" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.officialEmail')}</label>
                    <input
                      id="emailKedinasan"
                      name="email"
                      title={t('headmaster.settings.officialEmail')}
                      placeholder={t('headmaster.settings.officialEmail.placeholder')}
                      type="email"
                      defaultValue={profile?.email || ''}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="noWhatsapp" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.whatsapp')}</label>
                    <input
                      id="noWhatsapp"
                      name="phone"
                      title={t('headmaster.settings.whatsapp')}
                      placeholder={t('headmaster.settings.whatsapp.placeholder')}
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Section 2: Tanda Tangan Digital */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('headmaster.settings.section.signature')}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.settings.section.signature.desc')}</p>
            </div>
            <div className="p-6">
              <div className="flex gap-8 items-center">
                {/* Signature Preview */}
                <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-16 flex flex-col items-center justify-center">
                  <div className="w-12 h-11 bg-slate-200 rounded-lg mb-2 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">{t('headmaster.settings.signature.preview')}</p>
                </div>

                {/* Info + Actions */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex gap-3 items-start">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-5">
                        {t('headmaster.settings.signature.info')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer text-center">
                      {t('headmaster.settings.changeSpecimen')}
                    </button>
                    <button type="button" className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                      {t('headmaster.settings.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Preferensi Notifikasi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('headmaster.settings.section.notifications')}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.settings.section.notifications.desc')}</p>
            </div>
            <div>
              {/* Toggle 1: Laporan Mingguan */}
              <div className="flex items-center justify-between px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t('headmaster.settings.notif.weeklyReport')}</p>
                    <p className="text-xs text-slate-500">{t('headmaster.settings.notif.weeklyReport.desc')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  title="Toggle Laporan Mingguan"
                  onClick={() => {
                    const newValue = !laporanMingguan;
                    setLaporanMingguan(newValue);
                    updateNotificationPreferences(newValue, alertKeuangan);
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    laporanMingguan ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${
                      laporanMingguan ? 'left-[22px] border-white' : 'left-[2px] border-slate-300'
                    } border`}
                  />
                </button>
              </div>

              {/* Toggle 2: Alert Keuangan */}
              <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t('headmaster.settings.notif.financialAlert')}</p>
                    <p className="text-xs text-slate-500">{t('headmaster.settings.notif.financialAlert.desc')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  title="Toggle Alert Keuangan"
                  onClick={() => {
                    const newValue = !alertKeuangan;
                    setAlertKeuangan(newValue);
                    updateNotificationPreferences(laporanMingguan, newValue);
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    alertKeuangan ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${
                      alertKeuangan ? 'left-[22px] border-white' : 'left-[2px] border-slate-300'
                    } border`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Keamanan Akun */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('headmaster.settings.section.security')}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t('headmaster.settings.section.security.desc')}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {!showPasswordForm ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-4 text-slate-500" />
                    {t('headmaster.settings.changePassword')}
                  </button>
                  <button className="flex items-center gap-2 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Activity className="w-3.5 h-4 text-slate-500" />
                    {t('headmaster.settings.loginActivity')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="currentPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.currentPassword')}</label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder={t('headmaster.settings.currentPassword.placeholder')}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.newPassword')}</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder={t('headmaster.settings.newPassword.placeholder')}
                        required
                        minLength={6}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('headmaster.settings.confirmPassword')}</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={t('headmaster.settings.confirmPassword.placeholder')}
                        required
                        minLength={6}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t('headmaster.settings.savePassword')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {t('headmaster.settings.cancel')}
                    </button>
                  </div>
                </form>
              )}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-5">
                  {t('headmaster.settings.intelligenceMode')}<br />
                  <span className="text-primary">{t('headmaster.settings.intelligenceMode.desc')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pb-12">
            <button type="button" className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
              {t('headmaster.settings.cancelChanges')}
            </button>
            <button
              onClick={(e) => {
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              disabled={updating}
              className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-[0px_10px_15px_-3px_rgba(19,127,236,0.2),0px_4px_6px_-4px_rgba(19,127,236,0.2)] hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('headmaster.settings.saveProfile')}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
