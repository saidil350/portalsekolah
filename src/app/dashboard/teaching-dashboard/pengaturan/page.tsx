'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  User,
  Shield,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Save,
  Smartphone,
  Loader2,
} from 'lucide-react';
import {
  getTeacherProfile,
  updateTeacherProfile,
  changeTeacherPassword,
  updateNotificationPreferences
} from './actions';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/utils/dictionary';

export default function PengaturanPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');

  // Notification states
  const [emailNotif, setEmailNotif] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getTeacherProfile();
        if (data) {
          setProfile(data);
          // Set notification preferences from data
          if (data.notification_preferences) {
            setEmailNotif(data.notification_preferences.email ?? true);
            setScheduleReminders(data.notification_preferences.schedule_reminders ?? true);
            setAssignmentSubmissions(data.notification_preferences.assignment_submissions ?? true);
            setAttendanceAlerts(data.notification_preferences.attendance_alerts ?? false);
            setSystemUpdates(data.notification_preferences.system_updates ?? false);
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
      formData.append('emailNotifications', emailNotif ? 'on' : 'off');
      formData.append('scheduleReminders', scheduleReminders ? 'on' : 'off');
      formData.append('assignmentSubmissions', assignmentSubmissions ? 'on' : 'off');
      formData.append('attendanceAlerts', attendanceAlerts ? 'on' : 'off');
      formData.append('systemUpdates', systemUpdates ? 'on' : 'off');

      const result = await updateTeacherProfile(formData);

      if (result.success) {
        showMessage('success', result.message || t('teacher.settings.msg.profileUpdated'));
        // Reload profile data
        const data = await getTeacherProfile();
        if (data) {
          setProfile(data);
          console.log('🔄 Profile reloaded:', data);
        }
      } else {
        showMessage('error', result.error || t('teacher.settings.msg.profileFailed'));
      }
    } catch (error: any) {
      showMessage('error', error.message || t('teacher.settings.msg.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await changeTeacherPassword(formData);

      if (result.success) {
        showMessage('success', t('teacher.settings.msg.passwordUpdated'));
        e.currentTarget.reset();
      } else {
        showMessage('error', result.error || t('teacher.settings.msg.passwordFailed'));
      }
    } catch (error: any) {
      showMessage('error', error.message || t('teacher.settings.msg.error'));
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

      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">{t('teacher.settings.title')}</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 flex items-center h-[56px]">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'personal'
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                {t('teacher.settings.tabs.personal')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'security'
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                {t('teacher.settings.tabs.security')}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                <Bell className="w-4 h-4" />
                {t('teacher.settings.tabs.notifications')}
              </button>
            </div>
          </div>

          {activeTab === 'personal' && (
            <>
              {/* Personal Information Section */}
              <form onSubmit={handleProfileUpdate} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-text-main">{t('teacher.settings.personal.photoTitle')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.personal.photoDesc')}</p>
                </div>
                <div className="px-6 py-6 flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-primary/10">
                      {profile ? getInitials(profile.full_name) : 'AJ'}
                    </div>
                    <button type="button" title="Upload Picture" className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main">{profile?.full_name || t('teacher.settings.personal.teacherNameFallback')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.personal.photoFormat')}</p>
                  </div>
                </div>

                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-text-main">{t('teacher.settings.personal.detailsTitle')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.personal.detailsDesc')}</p>
                </div>
                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-text-main">{t('teacher.settings.personal.fullName')}</label>
                    <input
                      id="fullName"
                      name="fullName"
                      title="Full Name"
                      type="text"
                      defaultValue={profile?.full_name || ''}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-colors"
                    />
                  </div>
                  {/* NIP */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nip" className="text-sm font-medium text-text-main">NIP</label>
                    <input
                      id="nip"
                      name="nip"
                      title="NIP"
                      type="text"
                      defaultValue={profile?.nip || ''}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-text-main">{t('teacher.settings.personal.email')}</label>
                    <input
                      id="email"
                      name="email"
                      title="Email"
                      type="email"
                      defaultValue={profile?.email || ''}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-text-main">{t('teacher.settings.personal.phone')}</label>
                    <input
                      id="phone"
                      name="phone"
                      title="Phone Number"
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-colors"
                    />
                  </div>
                  {/* Join Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="joinDate" className="text-sm font-medium text-text-main">{t('teacher.settings.personal.joinDate')}</label>
                    <input
                      id="joinDate"
                      name="joinDate"
                      title="Join Date"
                      type="text"
                      defaultValue={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  {/* Address field temporarily hidden - column doesn't exist in database yet */}
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm shadow-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    {t('teacher.settings.personal.save')}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'security' && (
            <>
              {/* Security Section */}
              <form onSubmit={handlePasswordChange} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-text-main">{t('teacher.settings.security.changePassword')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.security.changePasswordDesc')}</p>
                </div>
                <div className="px-6 py-6 flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="currentPassword" className="text-sm font-medium text-text-main">{t('teacher.settings.security.currentPassword')}</label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        title="Current Password"
                        type="password"
                        placeholder={t('teacher.settings.security.currentPasswordPlaceholder')}
                        required
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="newPassword" className="text-sm font-medium text-text-main">{t('teacher.settings.security.newPassword')}</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        title="New Password"
                        type="password"
                        placeholder={t('teacher.settings.security.newPasswordPlaceholder')}
                        required
                        minLength={6}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-text-main">{t('teacher.settings.security.confirmPassword')}</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        title="Confirm New Password"
                        type="password"
                        placeholder={t('teacher.settings.security.confirmPasswordPlaceholder')}
                        required
                        minLength={6}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  {/* 2FA */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-main">{t('teacher.settings.security.twoFactor')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.security.twoFactorDesc')}</p>
                      </div>
                    </div>
                    <button type="button" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
                      {t('teacher.settings.security.comingSoon')}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('teacher.settings.security.updatePassword')}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              {/* Notifications Section */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-text-main">{t('teacher.settings.notifications.preferences')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('teacher.settings.notifications.preferencesDesc')}</p>
                </div>
                <div className="px-6 py-4 divide-y divide-slate-100">
                  {[
                    {
                      key: 'email',
                      labelKey: 'teacher.settings.notifications.emailLabel',
                      descKey: 'teacher.settings.notifications.emailDesc',
                      checked: emailNotif,
                      setter: setEmailNotif
                    },
                    {
                      key: 'schedule',
                      labelKey: 'teacher.settings.notifications.scheduleLabel',
                      descKey: 'teacher.settings.notifications.scheduleDesc',
                      checked: scheduleReminders,
                      setter: setScheduleReminders
                    },
                    {
                      key: 'assignments',
                      labelKey: 'teacher.settings.notifications.assignmentsLabel',
                      descKey: 'teacher.settings.notifications.assignmentsDesc',
                      checked: assignmentSubmissions,
                      setter: setAssignmentSubmissions
                    },
                    {
                      key: 'attendance',
                      labelKey: 'teacher.settings.notifications.attendanceLabel',
                      descKey: 'teacher.settings.notifications.attendanceDesc',
                      checked: attendanceAlerts,
                      setter: setAttendanceAlerts
                    },
                    {
                      key: 'system',
                      labelKey: 'teacher.settings.notifications.systemLabel',
                      descKey: 'teacher.settings.notifications.systemDesc',
                      checked: systemUpdates,
                      setter: setSystemUpdates
                    },
                  ].map((notif) => (
                    <div key={notif.key} className="flex items-center justify-between py-4 first:pt-2 last:pb-2">
                      <div>
                        <p className="text-sm font-medium text-text-main">{t(notif.labelKey as TranslationKey)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t(notif.descKey as TranslationKey)}</p>
                      </div>
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        title={t(notif.labelKey as TranslationKey)}
                        aria-label={t(notif.labelKey as TranslationKey)}
                        onClick={() => {
                          const newValue = !notif.checked;
                          notif.setter(newValue);
                          updateNotificationPreferences(
                            emailNotif,
                            scheduleReminders,
                            assignmentSubmissions,
                            attendanceAlerts,
                            systemUpdates
                          );
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${notif.checked ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notif.checked ? 'left-[22px] border border-white' : 'left-0.5 border border-gray-300'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
