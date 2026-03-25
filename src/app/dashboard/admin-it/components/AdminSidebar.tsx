'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
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
  { href: '/dashboard/admin-it/peran-dan-izin', labelKey: 'admin.nav.rolesPermissions', iconSrc: '/35c5014baf8a4dbdd4e2e22a6dc38be72dc2cbad.svg', iconW: '14.6px', iconH: '18.3px' },
  { href: '/dashboard/admin-it/data-akademik', labelKey: 'admin.nav.academicData', iconSrc: '/4d11301ba0e518812f9197dcc18f1eb16b37d766.svg', iconW: '20.1px', iconH: '16.5px' },
  { href: '/dashboard/admin-it/keuangan', labelKey: 'admin.nav.finance', iconSrc: '/7d7433302d2473cb297414941d2c9fba21779e91.svg', iconW: '20.1px', iconH: '14.6px' },
  { href: '/dashboard/admin-it/pengaturan-sistem', labelKey: 'admin.nav.systemSettings', iconSrc: '/f2c53fa4859da524365e8bda2fd717f3946f2e8a.svg', iconW: '18.4px', iconH: '18.3px' },
];

interface AdminSidebarProps {
  admin: User | null;
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
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
    if (href === '/dashboard/admin-it') return pathname === '/dashboard/admin-it';
    return pathname.startsWith(href);
  };

  // Use real admin data if available, otherwise use fallback
  const displayName = admin?.full_name || 'Admin IT';
  const roleLabel = admin?.role === 'ADMIN_IT' ? t('admin.superAdmin') : t('admin.administrator');

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
    <aside className="w-[288px] shrink-0 flex flex-col bg-white border-r border-slate-200 h-full">
      <div className="p-6 flex flex-col gap-6">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-primary/20">
            {getInitials(displayName)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-main text-sm font-semibold leading-tight">{displayName}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mt-0.5">{roleLabel}</p>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-[0px_4px_6px_-1px_rgba(19,127,236,0.2),0px_2px_4px_-2px_rgba(19,127,236,0.2)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div
                  className="flex items-center justify-center shrink-0 relative"
                  style={{ width: item.iconW, height: item.iconH } as React.CSSProperties}
                >
                  <Image
                    src={item.iconSrc}
                    alt=""
                    fill
                    className={`object-contain pointer-events-none ${active ? 'brightness-0 invert' : ''}`}
                  />
                </div>
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Language & Logout */}
      <div className="mt-auto p-6 pt-6 pb-6 border-t border-slate-100 flex flex-col gap-4">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer w-full text-left"
          disabled={isLoggingOut}
        >
          <div className="w-[16.5px] h-[16.5px] flex items-center justify-center shrink-0 relative">
            <Image src="/d37cd33084d326886dd872d5fdcb919c7d930cdd.svg" alt="" fill className="object-contain pointer-events-none" />
          </div>
          <span className="text-sm font-medium">{t('admin.auth.logout')}</span>
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
