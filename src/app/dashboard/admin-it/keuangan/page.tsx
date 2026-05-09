import { getFinanceDashboardData } from './actions'
import KeuanganClient from './keuangan-client'

export default async function KeuanganPage() {
  const result = await getFinanceDashboardData()

  return (
    <KeuanganClient
      initialData={result.success ? result.data : undefined}
      initialError={result.success ? undefined : result.error}
    />
  )
}
