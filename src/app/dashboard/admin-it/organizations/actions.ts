'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import type {
  Organization,
  OrganizationFormData,
  OrganizationSettings,
  OrganizationResponse,
  CreateOrganizationResponse,
  UpdateOrganizationResponse
} from '@/types/organization'

/**
 * Get current user's organization
 */
export async function getCurrentOrganization(): Promise<{
  success: boolean
  data?: Organization & { settings?: OrganizationSettings }
  error?: string
}> {
  try {
    const auth = await authorizeAction(['ADMIN_IT', 'KEPALA_SEKOLAH', 'GURU', 'SISWA'])
    if (!auth.success) {
      return { success: false, error: auth.error }
    }

    const supabase = await createClient()

    // Get organization with settings
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        settings:organization_settings(*)
      `)
      .eq('id', auth.user.organization_id)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organization not found' }
    }

    return {
      success: true,
      data: org as unknown as Organization & { settings?: OrganizationSettings }
    }
  } catch (error: any) {
    console.error('Error fetching organization:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch organization'
    }
  }
}

/**
 * Register new organization (Super Admin only or first-time setup)
 */
export async function registerOrganization(
  formData: OrganizationFormData
): Promise<CreateOrganizationResponse> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user already has an organization
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (currentProfile?.organization_id) {
      return { success: false, error: 'You already belong to an organization' }
    }

    // Validate organization code uniqueness
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('code', formData.code.toUpperCase())
      .single()

    if (existingOrg) {
      return { success: false, error: 'Organization code already exists' }
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: formData.name.trim(),
        code: formData.code.toUpperCase(),
        domain: formData.domain?.trim() || null,
        address: formData.address?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        school_level: formData.school_level,
        npsn: formData.npsn?.trim() || null,
        plan: 'PRO',
        max_users: 100,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single()

    if (orgError || !org) {
      return { success: false, error: orgError?.message || 'Failed to create organization' }
    }

    // Update user's organization_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ organization_id: org.id })
      .eq('id', user.id)

    if (updateError) {
      // Rollback organization creation if profile update fails
      await adminSupabase.from('organizations').delete().eq('id', org.id)
      return { success: false, error: 'Failed to assign user to organization' }
    }

    // Create default organization settings
    await supabase
      .from('organization_settings')
      .insert({
        organization_id: org.id,
        enable_teaching_dashboard: true,
        enable_student_dashboard: true,
        enable_headmaster_dashboard: true,
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        notification_enabled: true
      })

    revalidatePath('/dashboard/admin-it')
    revalidatePath('/onboarding')

    return {
      success: true,
      data: org as unknown as Organization
    }
  } catch (error: any) {
    console.error('Error registering organization:', error)
    return {
      success: false,
      error: error.message || 'Failed to register organization'
    }
  }
}

/**
 * Update organization details (Admin IT only)
 */
export async function updateOrganization(
  id: string,
  formData: Partial<OrganizationFormData>
): Promise<UpdateOrganizationResponse> {
  try {
    const auth = await authorizeAction(['ADMIN_IT'])
    if (!auth.success) {
      return { success: false, error: auth.error }
    }

    const supabase = await createClient()

    // Verify user belongs to this organization
    if (auth.user.organization_id !== id) {
      return { success: false, error: 'You can only update your own organization' }
    }

    // Check if code is being changed and if it conflicts
    if (formData.code) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('code', formData.code.toUpperCase())
        .neq('id', id)
        .single()

      if (existingOrg) {
        return { success: false, error: 'Organization code already exists' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.toUpperCase()
    if (formData.domain !== undefined) updateData.domain = formData.domain?.trim() || null
    if (formData.address !== undefined) updateData.address = formData.address?.trim() || null
    if (formData.phone !== undefined) updateData.phone = formData.phone?.trim() || null
    if (formData.email !== undefined) updateData.email = formData.email?.trim() || null
    if (formData.school_level !== undefined) updateData.school_level = formData.school_level
    if (formData.npsn !== undefined) updateData.npsn = formData.npsn?.trim() || null

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/organizations')
    revalidatePath('/dashboard/admin-it/settings')

    return {
      success: true,
      data: data as unknown as Organization
    }
  } catch (error: any) {
    console.error('Error updating organization:', error)
    return {
      success: false,
      error: error.message || 'Failed to update organization'
    }
  }
}

/**
 * Update organization settings (Admin IT only)
 */
export async function updateOrganizationSettings(
  settings: Partial<OrganizationSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await authorizeAction(['ADMIN_IT'])
    if (!auth.success) {
      return { success: false, error: auth.error }
    }

    const supabase = await createClient()

    const updateData: any = {}
    if (settings.enable_teaching_dashboard !== undefined) {
      updateData.enable_teaching_dashboard = settings.enable_teaching_dashboard
    }
    if (settings.enable_student_dashboard !== undefined) {
      updateData.enable_student_dashboard = settings.enable_student_dashboard
    }
    if (settings.enable_headmaster_dashboard !== undefined) {
      updateData.enable_headmaster_dashboard = settings.enable_headmaster_dashboard
    }
    if (settings.primary_color) updateData.primary_color = settings.primary_color
    if (settings.secondary_color) updateData.secondary_color = settings.secondary_color
    if (settings.logo_url !== undefined) updateData.logo_url = settings.logo_url || null
    if (settings.current_academic_year_id !== undefined) {
      updateData.current_academic_year_id = settings.current_academic_year_id || null
    }
    if (settings.current_semester_id !== undefined) {
      updateData.current_semester_id = settings.current_semester_id || null
    }
    if (settings.notification_email !== undefined) {
      updateData.notification_email = settings.notification_email || null
    }
    if (settings.notification_enabled !== undefined) {
      updateData.notification_enabled = settings.notification_enabled
    }

    const { error } = await supabase
      .from('organization_settings')
      .update(updateData)
      .eq('organization_id', auth.user.organization_id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/organizations')
    revalidatePath('/dashboard/admin-it/settings')

    return { success: true }
  } catch (error: any) {
    console.error('Error updating organization settings:', error)
    return {
      success: false,
      error: error.message || 'Failed to update organization settings'
    }
  }
}

/**
 * Get organization statistics (Admin IT only)
 */
export async function getOrganizationStats(): Promise<{
  success: boolean
  data?: {
    total_users: number
    total_students: number
    total_teachers: number
    total_classes: number
    total_subjects: number
  }
  error?: string
}> {
  try {
    const auth = await authorizeAction(['ADMIN_IT'])
    if (!auth.success) {
      return { success: false, error: auth.error }
    }

    const supabase = await createClient()

    // Get counts from various tables
    const [
      { count: totalUsers },
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalClasses },
      { count: totalSubjects }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', auth.user.organization_id),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', auth.user.organization_id).eq('role', 'SISWA'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', auth.user.organization_id).eq('role', 'GURU'),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('organization_id', auth.user.organization_id),
      supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('organization_id', auth.user.organization_id)
    ])

    return {
      success: true,
      data: {
        total_users: totalUsers || 0,
        total_students: totalStudents || 0,
        total_teachers: totalTeachers || 0,
        total_classes: totalClasses || 0,
        total_subjects: totalSubjects || 0
      }
    }
  } catch (error: any) {
    console.error('Error fetching organization stats:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch organization statistics'
    }
  }
}

/**
 * Upload organization logo (Admin IT only)
 */
export async function uploadOrganizationLogo(
  file: File
): Promise<{ success: boolean; logo_url?: string; error?: string }> {
  try {
    const auth = await authorizeAction(['ADMIN_IT'])
    if (!auth.success) {
      return { success: false, error: auth.error }
    }

    const supabase = await createClient()

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' }
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 2MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${auth.user.organization_id}/${Date.now()}.${fileExt}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(fileName, file)

    if (uploadError) {
      // If folder doesn't exist, create it first
      if (uploadError.message.includes('folder')) {
        const { error: createFolderError } = await supabase.storage
          .from('organization-logos')
          .upload(`${auth.user.organization_id}/.keep`, new Blob(['']))

        if (createFolderError) {
          return { success: false, error: 'Failed to create storage folder' }
        }

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('organization-logos')
          .upload(fileName, file)

        if (retryError) throw retryError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('organization-logos')
          .getPublicUrl(retryData.path)

        // Update organization settings
        await supabase
          .from('organization_settings')
          .update({ logo_url: urlData.publicUrl })
          .eq('organization_id', auth.user.organization_id)

        return { success: true, logo_url: urlData.publicUrl }
      }

      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(uploadData.path)

    // Update organization settings
    await supabase
      .from('organization_settings')
      .update({ logo_url: urlData.publicUrl })
      .eq('organization_id', auth.user.organization_id)

    revalidatePath('/dashboard/admin-it/organizations')

    return { success: true, logo_url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading logo:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload logo'
    }
  }
}
