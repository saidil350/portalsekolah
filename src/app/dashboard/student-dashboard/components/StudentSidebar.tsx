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
import { ProfileAvatar } from '@/components/dashboard/profile-avatar';

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

export default function StudentSidebar() {
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
        flex flex-col bg-card border-r border-border h-full
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-[256px]' : 'w-16'}
      `}
    >
      {/* Logo */}
      <div className={`px-5 py-4 ${!isSidebarOpen ? 'px-3' : ''}`}>
        <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <ProfileAvatar
            name="SIAKAD"
            role="SISWA"
            className="size-10 rounded-xl"
            fallbackClassName="rounded-xl text-base"
          />
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-foreground text-base font-semibold leading-6">SIAKAD</h1>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">{t('student.portal')}</p>
            </div>
          )}
        </div>
      </div>


      {/* Navigation */}
      <div className={`pb-4 pt-2 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
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
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                } ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center w-9 h-9 mx-auto'}`.trim()}
                title={!isSidebarOpen ? t(item.labelKey) : undefined}
              >
                <IconComponent
                  className={`size-5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
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
        <div className="px-4 pt-3 pb-3 border-t border-border/60">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">{t('student.nav.system')}</p>
          {systemItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg group transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <IconComponent
                  className={`size-5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
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
      <div className={`border-t border-border flex flex-col gap-2.5 ${isSidebarOpen ? 'px-4 pt-3 pb-3' : 'pt-3 pb-3 px-2'}`}>
        {isSidebarOpen && <LanguageSwitcher />}
        <button
          onClick={toggleSidebar}
          className={`flex items-center rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-3 py-2 w-full text-left' : 'justify-center w-9 h-9 mx-auto'}`.trim()}
          title={isSidebarOpen ? t('common.action.minimize') : t('common.action.expand')}
        >
          <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform duration-200 ${!isSidebarOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">{t('common.action.minimize')}</span>}
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-3 py-2 w-full text-left' : 'justify-center w-9 h-9 mx-auto'}`.trim()}
          disabled={isLoggingOut}
          title={isSidebarOpen ? undefined : t('student.auth.logout')}
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.8} />
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
