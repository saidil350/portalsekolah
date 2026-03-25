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

export default function PengaturanPage() {
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
        showMessage('success', result.message || 'Profile berhasil diupdate!');
        // Reload profile data
        const data = await getHeadmasterProfile();
        if (data) {
          setProfile(data);
          console.log('🔄 Profile reloaded:', data);
        }
      } else {
        showMessage('error', result.error || 'Gagal mengupdate profile');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Terjadi kesalahan');
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
        showMessage('success', 'Password berhasil diubah!');
        setShowPasswordForm(false);
        e.currentTarget.reset();
      } else {
        showMessage('error', result.error || 'Gagal mengubah password');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Terjadi kesalahan');
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
            <h2 className="text-slate-900 text-[30px] font-bold tracking-tight">Pengaturan & Profil</h2>
            <p className="text-slate-500 text-base">Kelola informasi pribadi dan preferensi akun Anda.</p>
          </div>

          {/* Section 1: Informasi Pribadi */}
          <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
              <p className="text-sm text-slate-500 mt-0.5">Pastikan data Anda tetap terbarui untuk keperluan administrasi resmi.</p>
            </div>
            <div className="p-6">
              <div className="flex gap-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative">
                    <div className="w-[128px] h-[128px] rounded-2xl border-4 border-slate-50 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile ? getInitials(profile.full_name) : 'PB'}
                      </span>
                    </div>
                    <button type="button" title="Ubah Foto Profil" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-dark transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-4">
                    Ukuran maks: 2MB<br />JPG, PNG, WEBP
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="namaLengkap" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      id="namaLengkap"
                      name="fullName"
                      title="Nama Lengkap"
                      placeholder="Masukkan nama lengkap"
                      type="text"
                      defaultValue={profile?.full_name || ''}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nip" className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIP / ID Karyawan</label>
                    <input
                      id="nip"
                      name="nip"
                      title="NIP / ID Karyawan"
                      placeholder="Masukkan NIP"
                      type="text"
                      defaultValue={profile?.nip || ''}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="emailKedinasan" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Kedinasan</label>
                    <input
                      id="emailKedinasan"
                      name="email"
                      title="Email Kedinasan"
                      placeholder="Masukkan email"
                      type="email"
                      defaultValue={profile?.email || ''}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="noWhatsapp" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor WhatsApp</label>
                    <input
                      id="noWhatsapp"
                      name="phone"
                      title="Nomor WhatsApp"
                      placeholder="Masukkan nomor WA"
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
              <h3 className="text-lg font-bold text-slate-900">Tanda Tangan Digital</h3>
              <p className="text-sm text-slate-500 mt-0.5">Digunakan untuk validasi otomatis pada Laporan Akademik (e-Rapor).</p>
            </div>
            <div className="p-6">
              <div className="flex gap-8 items-center">
                {/* Signature Preview */}
                <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-16 flex flex-col items-center justify-center">
                  <div className="w-12 h-11 bg-slate-200 rounded-lg mb-2 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">Pratinjau tanda tangan saat ini</p>
                </div>

                {/* Info + Actions */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex gap-3 items-start">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-5">
                        Pastikan tanda tangan memiliki latar belakang transparan (PNG) untuk hasil cetakan rapor yang optimal.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer text-center">
                      Ganti Spesimen
                    </button>
                    <button type="button" className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Preferensi Notifikasi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Preferensi Notifikasi</h3>
              <p className="text-sm text-slate-500 mt-0.5">Atur kanal informasi mana yang Anda inginkan untuk pembaruan sistem.</p>
            </div>
            <div>
              {/* Toggle 1: Laporan Mingguan */}
              <div className="flex items-center justify-between px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Laporan Mingguan (Email)</p>
                    <p className="text-xs text-slate-500">Dapatkan ringkasan performa sekolah setiap hari Senin.</p>
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
                    <p className="text-sm font-bold text-slate-900">Alert Keuangan (WhatsApp)</p>
                    <p className="text-xs text-slate-500">Notifikasi real-time jika realisasi SPP melampaui target.</p>
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
              <h3 className="text-lg font-bold text-slate-900">Keamanan Akun</h3>
              <p className="text-sm text-slate-500 mt-0.5">Amankan akses ke dasbor intelijen Anda.</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {!showPasswordForm ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-4 text-slate-500" />
                    Ubah Kata Sandi
                  </button>
                  <button className="flex items-center gap-2 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Activity className="w-3.5 h-4 text-slate-500" />
                    Log Aktivitas Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="currentPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Saat Ini</label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="Masukkan password saat ini"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Masukkan password baru"
                        required
                        minLength={6}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Password</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Konfirmasi password baru"
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
                      Simpan Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-5">
                  Intelligence Mode Active:<br />
                  <span className="text-primary">System-wide academic and financial configurations are managed by the IT Administrator and the School Board via central RBAC control.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pb-12">
            <button type="button" className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
              Batalkan Perubahan
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
              Simpan Profil
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
