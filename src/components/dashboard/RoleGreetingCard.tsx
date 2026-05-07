'use client';

import React, { useEffect, useState } from 'react';
import { BadgeCheck, Moon, School, Sparkles, Sun, SunDim, Sunset } from 'lucide-react';
import { motion } from 'framer-motion';

import { UserRole } from '@/types/user';
import { useLanguage } from '@/contexts/LanguageContext';
interface RoleGreetingCardProps {
  userName: string;
  role: UserRole;
  schoolName: string;
  className?: string;
}

const RoleGreetingCard: React.FC<RoleGreetingCardProps> = ({
  userName,
  role,
  schoolName,
  className,
}) => {
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('');
  const [Icon, setIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting(t('common.greeting.morning'));
        setIcon(Sun);
      } else if (hour >= 12 && hour < 15) {
        setGreeting(t('common.greeting.noon'));
        setIcon(SunDim);
      } else if (hour >= 15 && hour < 18) {
        setGreeting(t('common.greeting.afternoon'));
        setIcon(Sunset);
      } else {
        setGreeting(t('common.greeting.evening'));
        setIcon(Moon);
      }
    };

    updateGreeting();
  }, [t]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN_IT': return t('common.role.adminIt');
      case 'KEPALA_SEKOLAH': return t('common.role.headmaster');
      case 'GURU': return t('common.role.teacher');
      case 'SISWA': return t('common.role.student');
      default: return t('common.role.user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-3"
    >
      {/* Dynamic Greeting Label */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 text-primary/70" />
        <span className="text-xs font-medium uppercase tracking-wider">{greeting}</span>
      </div>
      
      {/* Name and Identity Details */}
      <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3 mt-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
          {userName} <span className="inline-block animate-bounce-slow">👋</span>
        </h1>
        
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs md:border-l md:border-slate-200 md:pl-3 md:mb-1.5">
          <div className="flex items-center gap-1.5 py-1 px-2.5 bg-muted/50 rounded-lg border border-border/60">
            <School className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{schoolName}</span>
          </div>
          
          <span className="inline-flex items-center gap-1 rounded bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-primary">
            <BadgeCheck className="size-3" />
            {getRoleLabel(role)}
          </span>

          {className && (
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Sparkles className="size-3 text-primary/60" />
              {className}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoleGreetingCard;
