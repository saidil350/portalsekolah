'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  FileBarChart2,
  UserCheck,
  Wallet,
  Settings,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/utils/dictionary';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { logout } from '@/app/login/actions';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard/student-dashboard', labelKey: 'student.nav.dashboard', icon: LayoutDashboard },
  { href: '/dashboard/student-dashboard/schedule', labelKey: 'student.nav.schedule', icon: CalendarDays },
  { href: '/dashboard/student-dashboard/grades', labelKey: 'student.nav.grades', icon: FileBarChart2 },
  { href: '/dashboard/student-dashboard/attendance', labelKey: 'student.nav.attendance', icon: UserCheck },
  { href: '/dashboard/student-dashboard/tuition', labelKey: 'student.nav.tuition', icon: Wallet },
];

const systemItems: NavItem[] = [
  { href: '/dashboard/student-dashboard/settings', labelKey: 'student.nav.settings', icon: Settings },
];

interface StudentSidebarProps {
}

export default function StudentSidebar({ }: StudentSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
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
    if (href === '/dashboard/student-dashboard') return pathname === '/dashboard/student-dashboard';
    return pathname.startsWith(href);
  };


  return (
    <aside className="w-[256px] shrink-0 flex flex-col bg-white border-r border-slate-200 h-full">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)] bg-linear-to-br from-primary to-blue-400">
            S
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-main text-lg font-semibold leading-7">SIAKAD</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{t('student.portal')}</p>
          </div>
        </div>
      </div>


      {/* Navigation */}
      <div className="px-4 pb-6 pt-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent
                  className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Section */}
      <div className="px-4 pt-4 pb-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">{t('student.nav.system')}</p>
        {systemItems.map((item) => {
          const active = isActive(item.href);
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <IconComponent
                className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language & Logout */}
      <div className="px-4 pt-4 pb-4 border-t border-slate-200 flex flex-col gap-4">
        <LanguageSwitcher />
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          disabled={isLoggingOut}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="text-sm font-medium">{t('student.auth.logout')}</span>
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
