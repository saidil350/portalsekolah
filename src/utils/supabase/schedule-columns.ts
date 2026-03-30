type ScheduleColumnMode = 'modern' | 'legacy'

export type ScheduleColumns = {
  start: 'start_time' | 'jam_mulai'
  end: 'end_time' | 'jam_selesai'
}

let cachedMode: ScheduleColumnMode | null = null

const isMissingColumnError = (error: any, columnName: string) => {
  const message = (error?.message || '').toLowerCase()
  return message.includes('does not exist') && message.includes(columnName.toLowerCase())
}

export const detectScheduleColumnMode = async (supabase: any): Promise<ScheduleColumnMode> => {
  if (cachedMode) return cachedMode

  const { error } = await supabase
    .from('class_schedules')
    .select('start_time', { head: true })
    .limit(1)

  if (!error) {
    cachedMode = 'modern'
    return cachedMode
  }

  if (isMissingColumnError(error, 'start_time')) {
    cachedMode = 'legacy'
    return cachedMode
  }

  // Unknown error (e.g. RLS); default to modern to avoid breaking.
  cachedMode = 'modern'
  return cachedMode
}

export const getScheduleColumns = (mode: ScheduleColumnMode): ScheduleColumns => {
  if (mode === 'legacy') {
    return { start: 'jam_mulai', end: 'jam_selesai' }
  }
  return { start: 'start_time', end: 'end_time' }
}

export const getScheduleSelect = (mode: ScheduleColumnMode, baseSelect: string) => {
  const suffix = baseSelect?.trim() ? `, ${baseSelect.trim()}` : ''
  if (mode === 'legacy') {
    return `*, start_time:jam_mulai, end_time:jam_selesai${suffix}`
  }
  return `*${suffix}`
}
