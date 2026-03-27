'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebugClassPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndPermissions()
  }, [])

  const checkUserAndPermissions = async () => {
    try {
      const supabase = createClient()

      // Get auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      console.log('Auth User:', authUser)
      console.log('Auth Error:', authError)

      setUserInfo(authUser)

      if (!authUser) {
        setTestResult({ error: 'No authenticated user found' })
        setLoading(false)
        return
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('Profile:', profileData)
      console.log('Profile Error:', profileError)

      setProfile(profileData)

      // Test: Can we read class_levels?
      const { data: classLevels, error: classLevelsError } = await supabase
        .from('class_levels')
        .select('*')
        .limit(1)

      console.log('Class Levels Test:', { classLevels, classLevelsError })

      // Test: Can we read classes?
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .limit(1)

      console.log('Classes Read Test:', { classes, classesError })

      // Test: Try to insert a test class
      const { data: insertResult, error: insertError } = await supabase
        .from('classes')
        .insert({
          name: 'TEST-CLASS',
          code: `TEST-${Date.now()}`,
          capacity: 30,
          current_enrollment: 0,
          is_active: true
        })
        .select()
        .single()

      console.log('Insert Test:', { insertResult, insertError })

      setTestResult({
        classLevelsTest: {
          success: !!classLevels,
          error: classLevelsError?.message
        },
        classesReadTest: {
          success: !!classes,
          error: classesError?.message
        },
        insertTest: {
          success: !!insertResult,
          error: insertError?.message,
          details: insertError,
          insertedData: insertResult
        }
      })
    } catch (err: any) {
      console.error('Exception:', err)
      setTestResult({ exception: err.message })
    } finally {
      setLoading(false)
    }
  }

  const deleteTestClasses = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('classes')
        .delete()
        .ilike('code', 'TEST-%')

      if (error) {
        alert('Error deleting test classes: ' + error.message)
      } else {
        alert('Test classes deleted successfully')
        checkUserAndPermissions()
      }
    } catch (err: any) {
      alert('Exception: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Class Permissions</h1>
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Class Permissions</h1>

      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Auth User</h2>
        <pre className="bg-white p-3 rounded overflow-auto">
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      </div>

      {/* Profile */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Profile (from DB)</h2>
        {profile ? (
          <pre className="bg-white p-3 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <p className="text-red-600">No profile found or error reading profile</p>
        )}
      </div>

      {/* Test Results */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Permission Tests</h2>
        <pre className="bg-white p-3 rounded overflow-auto text-sm">
          {JSON.stringify(testResult, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={checkUserAndPermissions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Re-run Tests
        </button>
        <button
          onClick={deleteTestClasses}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete Test Classes
        </button>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-slate-100 rounded-lg">
        <h3 className="font-bold mb-2">What to check:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Is your <code>role</code> in profiles set to <code>ADMIN_IT</code>?</li>
          <li>Is <code>insertTest.success</code> true? If not, check the error message.</li>
          <li>If you see "new row violates row-level security policy", the RLS policies are blocking the insert.</li>
          <li>Check browser console (F12) and server terminal for detailed logs.</li>
        </ul>
      </div>
    </div>
  )
}
