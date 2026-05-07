'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  FileBarChart2,
  CalendarCheck,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { logout } from '@/app/login/actions';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { ProfileAvatar } from '@/components/dashboard/profile-avatar';
import type { User } from '@/types/user';
import { TranslationKey } from '@/utils/dictionary';

const navSections = [
  {
    labelKey: null,
    items: [
      { href: '/dashboard/headmaster-dashboard', labelKey: 'headmaster.nav.dashboard' as TranslationKey, icon: LayoutDashboard },
    ],
  },
  {
    labelKey: 'headmaster.nav.sectionReport' as TranslationKey,
    items: [
      { href: '/dashboard/headmaster-dashboard/laporan-akademik', labelKey: 'headmaster.nav.reportAcademic' as TranslationKey, icon: FileBarChart2 },
      { href: '/dashboard/headmaster-dashboard/laporan-presensi', labelKey: 'headmaster.nav.reportAttendance' as TranslationKey, icon: CalendarCheck },
      { href: '/dashboard/headmaster-dashboard/laporan-keuangan', labelKey: 'headmaster.nav.reportFinance' as TranslationKey, icon: Wallet },
    ],
  },
  {
    labelKey: 'headmaster.nav.sectionSystem' as TranslationKey,
    items: [
      { href: '/dashboard/headmaster-dashboard/pengaturan', labelKey: 'headmaster.nav.settings' as TranslationKey, icon: Settings },
    ],
  },
];

interface HeadmasterSidebarProps {
  headmaster: User | null;
}

export default function HeadmasterSidebar({ headmaster }: HeadmasterSidebarProps) {
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
    if (href === '/dashboard/headmaster-dashboard') return pathname === '/dashboard/headmaster-dashboard';
    return pathname.startsWith(href);
  };

  // Use real headmaster data if available, otherwise use fallback
  const displayName = headmaster?.full_name || 'Pak Budi';
  const roleLabel = headmaster?.role === 'KEPALA_SEKOLAH' ? t('headmaster.role') : t('headmaster.role');

  return (
    <aside
      className={`
        flex flex-col bg-card border-r border-border h-full
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-[288px]' : 'w-16'}
      `}
    >
      {/* Profile Header */}
      <div className={`pt-6 pb-5 border-b border-border/60 ${isSidebarOpen ? 'px-6' : 'px-2'}`}>
        <div className={`flex items-center gap-4 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <ProfileAvatar name={displayName} role="KEPALA_SEKOLAH" className="size-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-background" />
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-foreground text-base font-bold leading-tight">{displayName}</h1>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto py-6 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        <nav className="flex flex-col gap-1">
          {navSections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              {section.labelKey && isSidebarOpen && (
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {t(section.labelKey)}
                  </p>
                </div>
              )}
              {section.items.map((item) => {
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
                    } ${isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
                    title={!isSidebarOpen ? t(item.labelKey) : undefined}
                  >
                    <IconComponent
                      className={`size-5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    {isSidebarOpen && <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Language & Logout */}
      <div className={`border-t border-border/60 flex flex-col gap-4 ${isSidebarOpen ? 'px-4 py-4' : 'py-4 px-2'}`}>
        {isSidebarOpen && <LanguageSwitcher />}
        <button
          onClick={toggleSidebar}
          className={`flex items-center rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-4 py-3 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          title={isSidebarOpen ? t('common.action.minimize') : t('common.action.expand')}
        >
          <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform duration-200 ${!isSidebarOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">{t('common.action.minimize')}</span>}
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer ${isSidebarOpen ? 'gap-3 px-4 py-3 w-full text-left' : 'justify-center w-10 h-10 mx-auto'}`.trim()}
          disabled={isLoggingOut}
          title={isSidebarOpen ? undefined : t('headmaster.auth.logout')}
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.8} />
          {isSidebarOpen && <span className="text-sm font-medium">{t('headmaster.auth.logout')}</span>}
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
