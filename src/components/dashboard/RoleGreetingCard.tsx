'use client';

import React, { useEffect, useState } from 'react';
import { Sun, SunDim, Sunset, Moon, School } from 'lucide-react';
import { motion } from 'framer-motion';

import { UserRole } from '@/types/user';
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
  const [greeting, setGreeting] = useState('');
  const [Icon, setIcon] = useState<any>(Sun);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Selamat Pagi');
        setIcon(Sun);
      } else if (hour >= 12 && hour < 15) {
        setGreeting('Semangat Siang');
        setIcon(SunDim);
      } else if (hour >= 15 && hour < 18) {
        setGreeting('Selamat Sore');
        setIcon(Sunset);
      } else {
        setGreeting('Selamat Malam');
        setIcon(Moon);
      }
    };

    updateGreeting();
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN_IT': return 'Admin IT';
      case 'KEPALA_SEKOLAH': return 'Kepala Sekolah';
      case 'GURU': return 'Guru';
      case 'SISWA': return 'Siswa';
      default: return 'Pengguna';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Dynamic Greeting Label */}
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon className="w-4 h-4 text-primary/70" />
        <span className="text-sm font-medium uppercase tracking-wider">{greeting}</span>
      </div>
      
      {/* Name and Identity Details */}
      <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mt-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {userName} <span className="inline-block animate-bounce-slow">👋</span>
        </h1>
        
        <div className="flex flex-wrap items-center gap-2 text-slate-500 text-sm md:border-l md:border-slate-200 md:pl-4 md:mb-2 lg:mb-3">
          <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <School className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{schoolName}</span>
          </div>
          
          <span className="bg-primary/5 px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-tighter">
            {getRoleLabel(role)}
          </span>

          {className && (
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              {className}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoleGreetingCard;
