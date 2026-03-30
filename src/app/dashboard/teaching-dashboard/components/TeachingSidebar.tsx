'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { TranslationKey } from '@/utils/dictionary';
import { logout } from '@/app/login/actions';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import type { User } from '@/types/user';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard/teaching-dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/dashboard/teaching-dashboard/jadwal-mengajar', labelKey: 'nav.jadwalMengajar', icon: Calendar },
  { href: '/dashboard/teaching-dashboard/kehadiran', labelKey: 'nav.kehadiran', icon: ClipboardCheck },
  { href: '/dashboard/teaching-dashboard/penilaian', labelKey: 'nav.penilaian', icon: GraduationCap },
  { href: '/dashboard/teaching-dashboard/daftar-siswa', labelKey: 'nav.daftarSiswa', icon: Users },
  { href: '/dashboard/teaching-dashboard/pengaturan', labelKey: 'nav.pengaturan', icon: Settings },
];

interface TeachingSidebarProps {
  teacher: User | null;
}

export default function TeachingSidebar({ teacher }: TeachingSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/teaching-dashboard') return pathname === '/dashboard/teaching-dashboard';
    return pathname.startsWith(href);
  };

  // Use real teacher data if available, otherwise use fallback
  const displayName = teacher?.full_name || 'Mr. Anderson';
  const roleLabel = teacher?.role === 'GURU' ? t('profile.teacher') : t('profile.teacher');

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-200 h-full
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-[288px]' : 'w-16'}
      `}
    >
      <div className={`p-6 flex flex-col gap-6 ${!isSidebarOpen ? 'items-center' : ''}`}>
        {/* User Profile */}
        {isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-full h-11 w-11 flex items-center justify-center text-white text-sm font-bold border-2 border-primary/20 shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="flex flex-col">
              <h1 className="text-text-main text-sm font-semibold leading-tight">{displayName}</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mt-0.5">{roleLabel}</p>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-full h-11 w-11 flex items-center justify-center text-white text-sm font-bold border-2 border-primary/20 shrink-0">
            {getInitials(displayName)}
          </div>
        )}
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg group transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-[0px_4px_6px_-1px_rgba(19,127,236,0.2),0px_2px_4px_-2px_rgba(19,127,236,0.2)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
              >
                <IconComponent
                  className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {isSidebarOpen && <span className="text-sm font-medium">{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className={`mt-auto border-t border-slate-100 flex flex-col gap-4 ${isSidebarOpen ? 'p-6 pt-6 pb-6' : 'p-3 pt-6 pb-6'}`}>
        {isSidebarOpen && <LanguageSwitcher />}
        <button
          onClick={toggleSidebar}
          className={`flex items-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-3 py-2.5 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          title={isSidebarOpen ? 'Minimize' : 'Expand'}
        >
          <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform duration-200 ${!isSidebarOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">Minimize</span>}
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-3 py-2.5 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          disabled={isLoggingOut}
          title={isSidebarOpen ? undefined : t('auth.logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">{t('auth.logout')}</span>}
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title={t('dialog.logout.title')}
        message={t('dialog.logout.message')}
        confirmText={t('dialog.logout.confirm')}
        cancelText={t('dialog.logout.cancel')}
        type="warning"
        loading={isLoggingOut}
      />
    </aside>
  );
}
