'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  ChevronDown,
  RefreshCcw,
  UserPlus,
  Trash2,
  Edit,
  Info,
  Loader2,
  Filter,
  MoreVertical,
  RotateCw
} from 'lucide-react'
import UserModal from '@/components/dashboard/user-modal'
import ConfirmDialog from '@/components/dashboard/confirm-dialog'
import { useLanguage } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/utils/dictionary'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  syncWithSupabase,
  getCurrentUserId
} from './actions'
import type { User, UserFormData, PaginationOptions, UserFilters } from '@/types/user'
import { ROLE_CONFIGS, STATUS_CONFIGS, getInitials, getRoleColor } from '@/types/user'

export default function UserManagementPage() {
  const { t, language } = useLanguage()
  // State
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: ''
  })
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 5,
    total: 0
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSyncConfirm, setShowSyncConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState('')

  // Fetch users
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchUsers({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      })
      setUsers(result.users)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error: any) {
      showToast(error.message || t('admin.userManagement.msg.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit, t])

  // Load users on mount and filter/page changes
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Fetch current user on mount
  useEffect(() => {
    getCurrentUserId().then((id) => {
      if (id) setCurrentUserId(id)
    })
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }))
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
    }, 500)

    return () => clearTimeout(timer)
  }, [searchDebounce])

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle create user
  const handleCreateUser = async (formData: UserFormData) => {
    setActionLoading(true)
    try {
      const result = await createUser(formData)
      if (result.success) {
        showToast(t('admin.userManagement.msg.createSuccess'), 'success')
        setShowAddModal(false)
        await loadUsers()
      } else {
        showToast(result.error || t('admin.userManagement.msg.createFailed'), 'error')
      }
    } catch (error: any) {
      showToast(error.message || t('admin.userManagement.msg.createFailed'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle update user
  const handleUpdateUser = async (formData: UserFormData) => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const result = await updateUser(selectedUser.id, formData)
      if (result.success) {
        showToast(t('admin.userManagement.msg.updateSuccess'), 'success')
        setShowEditModal(false)
        setSelectedUser(null)
        await loadUsers()
      } else {
        showToast(result.error || t('admin.userManagement.msg.updateFailed'), 'error')
      }
    } catch (error: any) {
      showToast(error.message || t('admin.userManagement.msg.updateFailed'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const result = await deleteUser(selectedUser.id)
      if (result.success) {
        showToast(t('admin.userManagement.msg.deleteSuccess'), 'success')
        await loadUsers()
        setShowDeleteConfirm(false)
        setSelectedUser(null)
      } else {
        showToast(result.error || t('admin.userManagement.msg.deleteFailed'), 'error')
      }
    } catch (error: any) {
      showToast(error.message || t('admin.userManagement.msg.deleteFailed'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle sync with Supabase
  const handleSync = async () => {
    setActionLoading(true)
    try {
      const result = await syncWithSupabase()
      if (result.success) {
        const syncMsg = t('admin.userManagement.msg.syncSuccess')
        const detailedMsg = `${syncMsg}: ${result.synced}/${result.total} pengguna disinkronkan${result.errors && result.errors > 0 ? `, ${result.errors} gagal` : ''}`
        showToast(detailedMsg, 'success')
        await loadUsers()
        setShowSyncConfirm(false)
      } else {
        showToast(t('admin.userManagement.msg.syncFailed'), 'error')
      }
    } catch (error: any) {
      showToast(error.message || t('admin.userManagement.msg.syncFailed'), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle filter changes
  const handleRoleFilterChange = (role: string) => {
    setFilters(prev => ({ ...prev, role }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', role: '', status: '' })
    setSearchDebounce('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Format last login time
  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return t('admin.userManagement.lastLogin.never')

    const now = new Date()
    const login = new Date(lastLogin)
    const diffMs = now.getTime() - login.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('admin.userManagement.lastLogin.justNow')
    if (diffMins < 60) return `${diffMins} ${t('admin.userManagement.lastLogin.minutesAgo')}`
    if (diffHours < 24) return `${diffHours} ${t('admin.userManagement.lastLogin.hoursAgo')}`
    if (diffDays === 1) return t('admin.userManagement.lastLogin.yesterday')
    if (diffDays < 7) return `${diffDays} ${t('admin.userManagement.lastLogin.daysAgo')}`

    return login.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Get display ID - This function is no longer used based on the provided Code Edit, but keeping it for now if it's used elsewhere.
  // If the table structure in the Code Edit is final, this function can be removed.
  const getDisplayId = (user: User) => {
    if (user.nip) return `NIP: ${user.nip}`
    if (user.nisn) return `NISN: ${user.nisn}`
    return `UID: ${user.id.slice(0, 4)}-${user.id.slice(4, 8)}`
  }

  // Pagination calculations
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const fromIndex = (pagination.page - 1) * pagination.limit + 1
  const toIndex = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            } text-white text-sm font-medium animate-in slide-in-from-right duration-300`}>
              {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-text-main text-3xl font-bold tracking-tight">{t('admin.userManagement.title')}</h2>
              <p className="text-slate-500 text-base">{t('admin.userManagement.description')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSyncConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                <RefreshCcw className="w-4 h-4 text-slate-500" />
                {t('admin.userManagement.btn.sync')}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm shadow-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                <UserPlus className="w-4 h-4" />
                {t('admin.userManagement.btn.addUser')}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 h-auto md:h-[72px] items-center">
            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                title={t('admin.userManagement.search.title')}
                placeholder={t('admin.userManagement.search.placeholder')}
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select
                  title={t('admin.userManagement.filter.role.title')}
                  aria-label={t('admin.userManagement.filter.role.title')}
                  value={filters.role}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 cursor-pointer w-full"
                >
                  <option value="">{t('admin.userManagement.filter.role.all')}</option>
                  {ROLE_CONFIGS.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <div className="relative flex-1 md:flex-none">
                <select
                  title={t('admin.userManagement.filter.status.title')}
                  aria-label={t('admin.userManagement.filter.status.title')}
                  value={filters.status}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 cursor-pointer w-full"
                >
                  <option value="">{t('admin.userManagement.filter.status.all')}</option>
                  {STATUS_CONFIGS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="hidden md:flex items-center justify-center px-4 py-2 text-primary font-medium text-sm hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
              >
                {t('admin.userManagement.filter.clear')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">{t('admin.userManagement.table.user')}</th>
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">{t('admin.userManagement.table.email')}</th>
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">{t('admin.userManagement.table.role')}</th>
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">{t('admin.userManagement.table.status')}</th>
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">{t('admin.userManagement.table.lastLogin')}</th>
                    <th className="py-4 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">{t('admin.userManagement.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-sm text-slate-500">{t('admin.userManagement.table.loading')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-slate-500">{t('admin.userManagement.table.empty')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const roleConfig = ROLE_CONFIGS.find(r => r.value === user.role)
                      const statusConfig = STATUS_CONFIGS.find(s => s.value === user.status)
                      const avatarInitials = getInitials(user.full_name)
                      const avatarColorClass = getRoleColor(user.role)

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${avatarColorClass} flex items-center justify-center shrink-0`}>
                                <span className="font-bold text-sm">{avatarInitials}</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-slate-900 font-semibold text-sm truncate">{user.full_name}</span>
                                <span className="text-slate-500 text-xs mt-0.5 whitespace-nowrap">{getDisplayId(user)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-900 truncate">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${roleConfig?.bgColor || ''} ${roleConfig?.color || ''}`}>
                              {roleConfig?.label || user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig?.bgColor || ''} ${statusConfig?.color || ''}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig?.dotColor || ''}`}></span>
                              {statusConfig?.label || user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 whitespace-nowrap">{formatLastLogin(user.last_login ?? null)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                title={t('admin.userManagement.action.edit')}
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowEditModal(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t('admin.userManagement.action.delete')}
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowDeleteConfirm(true)
                                }}
                                disabled={actionLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {pagination.total > 0 ? (
                  <>
                    {t('admin.userManagement.pagination.showing')} <span className="font-semibold text-slate-900">{fromIndex}</span> {t('admin.userManagement.pagination.to')} <span className="font-semibold text-slate-900">{toIndex}</span> {t('admin.userManagement.pagination.of')} <span className="font-semibold text-slate-900">{pagination.total}</span> {t('admin.userManagement.pagination.users')}
                  </>
                ) : (
                  t('admin.userManagement.pagination.empty')
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1 || loading}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.userManagement.pagination.prev')}
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= totalPages || loading}
                  className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.userManagement.pagination.next')}
                </button>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 min-h-[80px]">
            <div className="mt-0.5 shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col gap-1 w-full flex-1">
              <h4 className="text-sm font-semibold text-blue-900">{t('admin.userManagement.banner.authIntegration.title')}</h4>
              <p className="text-xs text-blue-700 leading-relaxed max-w-3xl">
                {t('admin.userManagement.banner.authIntegration.desc')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* User Modals */}
      <UserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateUser}
        mode="create"
      />

      <UserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title={t('admin.userManagement.dialog.delete.title')}
        message={t('admin.userManagement.dialog.delete.message').replace('{name}', selectedUser?.full_name || 'User')}
        confirmText={t('admin.userManagement.dialog.delete.confirm')}
        cancelText={t('admin.userManagement.dialog.delete.cancel')}
        type="danger"
        loading={actionLoading}
      />

      {/* Sync Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSyncConfirm}
        onClose={() => setShowSyncConfirm(false)}
        onConfirm={handleSync}
        title={t('admin.userManagement.dialog.sync.title')}
        message={t('admin.userManagement.dialog.sync.message')}
        confirmText={t('admin.userManagement.dialog.sync.confirm')}
        cancelText={t('admin.userManagement.dialog.sync.cancel')}
        type="info"
        loading={actionLoading}
      />
    </main>
  )
}
