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
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
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
    if (href === '/dashboard/student-dashboard') return pathname === '/dashboard/student-dashboard';
    return pathname.startsWith(href);
  };


  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-200 h-full
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-[256px]' : 'w-16'}
      `}
    >
      {/* Logo */}
      <div className={`px-6 py-6 ${!isSidebarOpen ? 'px-3' : ''}`}>
        <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)] bg-linear-to-br from-blue-500 to-blue-400 shrink-0">
            S
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-text-main text-lg font-semibold leading-7">SIAKAD</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{t('student.portal')}</p>
            </div>
          )}
        </div>
      </div>


      {/* Navigation */}
      <div className={`pb-6 pt-4 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
                title={!isSidebarOpen ? t(item.labelKey) : undefined}
              >
                <IconComponent
                  className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {isSidebarOpen && <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Section */}
      {isSidebarOpen && (
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
                  className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language & Logout */}
      <div className={`border-t border-slate-200 flex flex-col gap-4 ${isSidebarOpen ? 'px-4 pt-4 pb-4' : 'pt-4 pb-4 px-2'}`}>
        {isSidebarOpen && <LanguageSwitcher />}
        <button
          onClick={toggleSidebar}
          className={`flex items-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-4 py-3 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          title={isSidebarOpen ? 'Minimize' : 'Expand'}
        >
          <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform duration-200 ${!isSidebarOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">Minimize</span>}
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-4 py-3 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          disabled={isLoggingOut}
          title={isSidebarOpen ? undefined : t('student.auth.logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">{t('student.auth.logout')}</span>}
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
