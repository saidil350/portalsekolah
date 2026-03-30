const columnCache: Record<string, boolean> = {}

const isMissingColumnError = (error: any, columnName: string) => {
  const message = (error?.message || '').toLowerCase()
  return message.includes('does not exist') && message.includes(columnName.toLowerCase())
}

export const detectProfilesHasColumn = async (supabase: any, columnName: string): Promise<boolean> => {
  if (columnCache[columnName] !== undefined) return columnCache[columnName]

  const { error } = await supabase
    .from('profiles')
    .select(columnName, { head: true })
    .limit(1)

  if (!error) {
    columnCache[columnName] = true
    return true
  }

  if (isMissingColumnError(error, columnName)) {
    columnCache[columnName] = false
    return false
  }

  // Unknown error (e.g. RLS). Be safe and avoid using the column.
  return false
}

export const detectProfilesHasIsActive = async (supabase: any): Promise<boolean> => {
  return detectProfilesHasColumn(supabase, 'is_active')
}
