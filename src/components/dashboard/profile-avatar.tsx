'use client'

import * as React from 'react'
import { GraduationCap, School, ShieldCheck, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/user'

interface ProfileAvatarProps {
  name: string
  role?: UserRole | 'SYSTEM'
  imageUrl?: string | null
  className?: string
  fallbackClassName?: string
  showRoleIcon?: boolean
}

const roleIcons: Record<NonNullable<ProfileAvatarProps['role']>, React.ElementType> = {
  ADMIN_IT: ShieldCheck,
  KEPALA_SEKOLAH: School,
  GURU: GraduationCap,
  SISWA: UserRound,
  SYSTEM: School,
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileAvatar({
  name,
  role = 'SYSTEM',
  imageUrl,
  className,
  fallbackClassName,
  showRoleIcon = true,
}: ProfileAvatarProps) {
  const RoleIcon = roleIcons[role] ?? UserRound
  const initials = getInitials(name) || 'U'

  return (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn('size-10 border bg-background shadow-xs ring-1 ring-border', className)}>
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback
          className={cn(
            'bg-primary/10 text-sm font-semibold text-primary',
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showRoleIcon && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border bg-card text-primary shadow-xs">
          <RoleIcon className="size-2.5" />
        </span>
      )}
    </div>
  )
}
