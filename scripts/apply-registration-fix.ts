/**
 * Temporary script to apply the registration fix migration
 * Run this with: npx tsx scripts/apply-registration-fix.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('Applying registration fix migration...')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Drop existing restrictive policy
      DROP POLICY IF EXISTS "Admin IT can insert users in their organization" ON profiles;

      -- Add policy allowing users to insert their own profile
      CREATE POLICY "Users can insert their own profile"
        ON profiles FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid());

      -- Add policy allowing Admin IT to insert other users
      CREATE POLICY "Admin IT can insert users in their organization"
        ON profiles FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN_IT'
            AND organization_id = profiles.organization_id
          )
        );
    `
  })

  if (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }

  console.log('✅ Migration applied successfully!')
  console.log('Registration should now work properly.')
}

applyMigration()
