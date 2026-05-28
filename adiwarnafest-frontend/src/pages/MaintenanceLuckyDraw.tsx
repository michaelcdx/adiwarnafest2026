import { useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { Download, Sparkle } from '@phosphor-icons/react'
import { useAuth } from '../store/auth'
import { luckyDrawService, type LuckyDrawEntryDto } from '../services/luckyDraw'
import { ApiError } from '../services/http'

const MaintenanceLuckyDraw = () => {
  const { accessToken } = useAuth()
  const toast = useRef<Toast>(null)
  const [entries, setEntries] = useState<LuckyDrawEntryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await luckyDrawService.getEntries()
      setEntries(data || [])
      setLoaded(true)
      toast.current?.show({
        severity: 'success',
        summary: 'Entries Loaded',
        detail: `Found ${data?.length || 0} entries.`,
        life: 2500,
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? 'Failed to load entries.'
          : 'Failed to load entries. Check that the backend is running.'
      setEntries([])
      toast.current?.show({
        severity: 'error',
        summary: 'Load Failed',
        detail: message,
        life: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || ''
      const response = await fetch(`${baseUrl}/api/lucky-draw/export-entries`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken || ''}` },
      })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `lucky-draw-entries-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Download Failed',
        detail: 'CSV download failed.',
        life: 4000,
      })
    }
  }

  return (
    <div className="glass-page" style={{ fontFamily: 'Epilogue, sans-serif' }}>
      <Toast ref={toast} position="bottom-center" />
      <div className="px-4 py-4 mx-auto w-full" style={{ maxWidth: '1280px' }}>
        <header className="mb-4">
          <div className="flex align-items-center gap-3 mb-2">
            <div className="glass-icon" style={{ background: 'rgba(209,223,246,0.12)' }}>
              <Sparkle size={24} weight="bold" color="rgba(209,223,246,0.9)" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold" style={{ color: '#1a1a1a' }}>Lucky Draw</h1>
              <p className="m-0 text-600 text-sm">View and export participant lucky draw entries.</p>
            </div>
          </div>
        </header>

        <div className="flex gap-3 mb-4" style={{ fontSize: '13px' }}>
          <div className="button-wrap">
            <button className="premium-btn" onClick={loadEntries} disabled={loading}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="pi pi-refresh" style={{ fontSize: '13px' }} />
                {loading ? 'Loading...' : loaded ? 'Refresh' : 'Load Entries'}
              </span>
            </button>
            <div className="button-shadow" />
          </div>
          {loaded && (
            <div className="button-wrap">
              <button className="premium-btn" onClick={handleDownloadCSV}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} weight="bold" /> Download CSV
                </span>
              </button>
              <div className="button-shadow" />
            </div>
          )}
        </div>

        <div className="glass-card p-3" style={{ overflowX: 'auto' }}>
          <DataTable
            value={entries}
            paginator
            rows={20}
            rowsPerPageOptions={[10, 20, 50, 100]}
            loading={loading}
            emptyMessage={loaded ? 'No entries found.' : 'Click "Load Entries" to fetch data.'}
            tableStyle={{ minWidth: '600px' }}
          >
            <Column field="fullName" header="Full Name" sortable filter />
            <Column field="phoneNumber" header="Phone Number" sortable filter />
            <Column field="instagramHandle" header="Instagram Handle" sortable filter />
            <Column
              field="submittedAt"
              header="Submitted At"
              sortable
              body={(row) => new Date(row.submittedAt).toLocaleString()}
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceLuckyDraw
