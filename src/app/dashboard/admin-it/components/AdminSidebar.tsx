'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { TranslationKey } from '@/utils/dictionary';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { logout } from '@/app/login/actions';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import type { User } from '@/types/user';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  iconSrc: string;
  iconW: string;
  iconH: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard/admin-it', labelKey: 'admin.nav.dashboard', iconSrc: '/f89c311fb2446e3aad6f4c04d8d9ad03e5b4f19a.svg', iconW: '16.5px', iconH: '16.5px' },
  { href: '/dashboard/admin-it/manajemen-pengguna', labelKey: 'admin.nav.userManagement', iconSrc: '/29535fe9c9821195057bdb4adf25e17d6eb94c95.svg', iconW: '20px', iconH: '14.6px' },
  { href: '/dashboard/admin-it/data-management', labelKey: 'admin.nav.rolesPermissions', iconSrc: '/35c5014baf8a4dbdd4e2e22a6dc38be72dc2cbad.svg', iconW: '14.6px', iconH: '18.3px' },
  { href: '/dashboard/admin-it/monitoring-data', labelKey: 'admin.nav.monitoringData', iconSrc: '/4d11301ba0e518812f9197dcc18f1eb16b37d766.svg', iconW: '20.1px', iconH: '16.5px' },
  { href: '/dashboard/admin-it/keuangan', labelKey: 'admin.nav.finance', iconSrc: '/7d7433302d2473cb297414941d2c9fba21779e91.svg', iconW: '20.1px', iconH: '14.6px' },
  { href: '/dashboard/admin-it/pengaturan-sistem', labelKey: 'admin.nav.systemSettings', iconSrc: '/f2c53fa4859da524365e8bda2fd717f3946f2e8a.svg', iconW: '18.4px', iconH: '18.3px' },
];

interface AdminSidebarProps {
  admin: User | null;
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
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
    if (href === '/dashboard/admin-it') return pathname === '/dashboard/admin-it';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const displayName = admin?.full_name || 'Admin IT';
  const roleLabel = admin?.role === 'ADMIN_IT' ? t('admin.superAdmin') : t('admin.administrator');

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
        flex flex-col bg-white border-r border-slate-100 h-full overflow-hidden
        transition-[width] duration-300 ease-in-out
        ${isSidebarOpen ? 'w-[280px]' : 'w-[64px]'}
      `}
    >
      {/* ── Header / Profile ── */}
      <div
        className={`
          flex flex-col
          ${isSidebarOpen ? 'px-4 pt-6 pb-4 gap-5' : 'px-2 pt-5 pb-4 gap-4 items-center'}
        `}
      >
        {isSidebarOpen ? (
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-primary/20 shrink-0 select-none">
              {getInitials(displayName)}
            </div>
            {/* Name + role */}
            <div className="flex flex-col min-w-0">
              <span className="text-slate-800 text-sm font-semibold leading-tight truncate">
                {displayName}
              </span>
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mt-0.5 truncate">
                {roleLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-primary/20 shrink-0 select-none">
            {getInitials(displayName)}
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isSidebarOpen ? t(item.labelKey) : undefined}
                className={`
                  flex items-center rounded-lg transition-all duration-150 cursor-pointer relative overflow-hidden
                  ${active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }
                  ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto'}
                `}
              >
                {/* Active bar */}
                {active && (
                  <span className="absolute left-0 inset-y-0 w-[3px] bg-white/60 rounded-r-full" />
                )}

                {/* Icon */}
                <div className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
                  <Image
                    src={item.iconSrc}
                    alt=""
                    width={parseFloat(item.iconW)}
                    height={parseFloat(item.iconH)}
                    className={`object-contain pointer-events-none ${active ? 'brightness-0 invert' : ''}`}
                  />
                </div>

                {/* Label – whitespace-nowrap prevents wrapping */}
                {isSidebarOpen && (
                  <span className="text-sm font-medium whitespace-nowrap leading-none">
                    {t(item.labelKey)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div
        className={`
          mt-auto border-t border-slate-100
          ${isSidebarOpen ? 'px-4 py-4 flex flex-col gap-1' : 'px-2 py-4 flex flex-col gap-1 items-center'}
        `}
      >
        {isSidebarOpen && (
          <div className="mb-2">
            <LanguageSwitcher />
          </div>
        )}

        {/* Minimize / Expand */}
        <button
          onClick={toggleSidebar}
          className={`
            flex items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700
            transition-colors duration-150 cursor-pointer
            ${isSidebarOpen ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center w-10 h-10 mx-auto'}
          `}
          title={isSidebarOpen ? 'Minimize' : 'Expand'}
        >
          <ChevronLeft
            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
          {isSidebarOpen && (
            <span className="text-sm font-medium whitespace-nowrap">Minimize</span>
          )}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className={`
            flex items-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500
            transition-colors duration-150 cursor-pointer
            ${isSidebarOpen ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center w-10 h-10 mx-auto'}
          `}
          disabled={isLoggingOut}
          title={isSidebarOpen ? undefined : t('admin.auth.logout')}
        >
          <div className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
            <Image
              src="/d37cd33084d326886dd872d5fdcb919c7d930cdd.svg"
              alt=""
              width={20}
              height={18}
              className="object-contain pointer-events-none"
            />
          </div>
          {isSidebarOpen && (
            <span className="text-sm font-medium whitespace-nowrap">{t('admin.auth.logout')}</span>
          )}
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
