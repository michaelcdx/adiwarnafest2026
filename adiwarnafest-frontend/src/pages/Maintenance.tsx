import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ShieldCheck, UsersThree, Trophy, CalendarBlank, Download, GameController, YoutubeLogo } from '@phosphor-icons/react'
import { useAuth } from '../store/auth'
import { useRef, useState } from 'react'
import { Toast } from 'primereact/toast'
import { luckyDrawService, type LuckyDrawEntryDto } from '../services/luckyDraw'
import { ApiError } from '../services/http'

const Maintenance = () => {
  const navigate = useNavigate()
  const { role, username, signOut, accessToken } = useAuth()
  const isAdmin = role === 'Admin'
  const isMaintainer = role === 'Maintainer'
  const canExport = isAdmin || isMaintainer
  const toast = useRef<Toast>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false)
  const [entries, setEntries] = useState<LuckyDrawEntryDto[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)

  const loadEntries = async () => {
    try {
      setIsLoadingEntries(true)
      const data = await luckyDrawService.getEntries()
      setEntries(data || [])
      toast.current?.show({
        severity: 'success',
        summary: 'Entries Loaded',
        detail: `Found ${data?.length || 0} entries.`,
        life: 2500
      })
    } catch (error) {
      const message = error instanceof ApiError
        ? 'Failed to load entries.'
        : 'Failed to load entries. Check that the backend is running.'
      setEntries([])
      toast.current?.show({
        severity: 'error',
        summary: 'Load Failed',
        detail: message,
        life: 4000
      })
    } finally {
      setIsLoadingEntries(false)
    }
  }

  const handleExportLuckyDraw = async () => {
    try {
      setIsExporting(true)
      setIsEntriesModalOpen(true)
      await loadEntries()
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || ''
      const response = await fetch(`${baseUrl}/api/lucky-draw/export-entries`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken || ''}`
        }
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `lucky-draw-entries-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? 'CSV download failed.' : 'CSV download failed.'
      toast.current?.show({
        severity: 'error',
        summary: 'Download Failed',
        detail: message,
        life: 4000
      })
    }
  }

  const cards = [
    {
      icon: <UsersThree size={28} weight="bold" color="#fff" />,
      title: 'Staff Users',
      description: 'Manage Admin and Maintainer accounts.',
      label: isAdmin ? 'Open Staff' : 'Admin only',
      disabled: !isAdmin,
      onClick: () => navigate('/maintenance/users'),
      bgGradient: 'linear-gradient(135deg, #862C14 0%, #a83d1a 100%)',
      color: '#862C14'
    },
    {
      icon: <UsersThree size={28} weight="bold" color="#fff" />,
      title: 'Participants',
      description: 'Manage registered participants (Players).',
      label: 'Open Participants',
      disabled: false,
      onClick: () => navigate('/maintenance/participants'),
      bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      color: '#7c3aed'
    },
    {
      icon: <Trophy size={28} weight="bold" color="#fff" />,
      title: 'Teams',
      description: 'Manage teams and standings.',
      label: 'Open Teams',
      disabled: false,
      onClick: () => navigate('/maintenance/teams'),
      bgGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      color: '#1e40af'
    },
    {
      icon: <CalendarBlank size={28} weight="bold" color="#fff" />,
      title: 'Tournaments',
      description: 'Manage tournaments and placements.',
      label: 'Open Tournaments',
      disabled: false,
      onClick: () => navigate('/maintenance/tournaments'),
      bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: '#059669'
    },
    {
      icon: <GameController size={28} weight="bold" color="#fff" />,
      title: 'Games',
      description: 'Manage games and score updates within tournaments.',
      label: 'Open Games',
      disabled: false,
      onClick: () => navigate('/maintenance/games'),
      bgGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
      color: '#0891b2'
    },
    {
      icon: <YoutubeLogo size={28} weight="bold" color="#fff" />,
      title: 'Live YouTube',
      description: 'Manage live YouTube stream links.',
      label: 'Open Live YouTube',
      disabled: false,
      onClick: () => navigate('/maintenance/live-youtube'),
      bgGradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
      color: '#FF0000'
    },
    {
      icon: <Download size={28} weight="bold" color="#fff" />,
      title: 'Lucky Draw',
      description: 'Export participant entries.',
      label: canExport ? (isExporting ? 'Loading...' : 'View Entries') : 'Admin/Maintainer only',
      disabled: !canExport || isExporting,
      onClick: handleExportLuckyDraw,
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      color: '#ec4899'
    }
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Epilogue, sans-serif', backgroundColor: '#fafaf9' }}>
      <Toast ref={toast} position="bottom-center" />
      <div className="px-4 py-6 md:py-8 mx-auto w-full" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex align-items-center gap-3 mb-3">
            <div className="border-round-xl p-3" style={{ background: 'linear-gradient(135deg, #862C14 0%, #a83d1a 100%)' }}>
              <ShieldCheck size={24} weight="bold" color="#fff" />
            </div>
            <div>
              <h1 className="m-0 text-3xl font-black" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                Maintenance Dashboard
              </h1>
              <p className="m-0 text-600 text-sm mt-1">Welcome, {username || 'User'} · <span style={{ fontWeight: '600', color: '#862C14' }}>{role || 'Unknown'}</span></p>
            </div>
          </div>
        </header>

        {/* Cards Grid */}
        <section className="grid gap-4 md:gap-6 mb-8">
          {cards.map((card, idx) => (
            <div key={idx} className="col-12 md:col-6 lg:col-6 xl:col-3">
              <div
                className="h-full border-round-2xl p-5 shadow-3 flex flex-column gap-4 transition-all duration-300 hover:shadow-6 hover:transform-y-2 cursor-pointer border-1"
                style={{
                  backgroundColor: '#fff',
                  borderColor: 'rgba(0,0,0,0.06)',
                }}
              >
                {/* Icon Container */}
                <div
                  className="border-round-xl p-4 w-fit"
                  style={{ background: card.bgGradient }}
                >
                  {card.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="m-0 text-xl font-bold mb-1" style={{ color: '#1a1a1a' }}>
                    {card.title}
                  </h2>
                  <p className="m-0 text-600 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Button */}
                <Button
                  label={card.label}
                  disabled={card.disabled}
                  onClick={card.onClick}
                  loading={card.title === 'Lucky Draw' && isExporting}
                  className="w-full font-bold uppercase text-sm"
                  style={{
                    backgroundColor: card.color,
                    borderColor: card.color,
                    color: '#fff',
                    padding: '10px 16px'
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Sign Out Button */}
        <div className="flex gap-2">
          <Button
            label="Sign Out"
            severity="secondary"
            outlined
            onClick={() => signOut().then(() => navigate('/'))}
            className="font-bold"
          />
        </div>
      </div>

      {/* Lucky Draw Entries Modal */}
      <Dialog
        visible={isEntriesModalOpen}
        onHide={() => setIsEntriesModalOpen(false)}
        header="Lucky Draw Entries"
        modal
        style={{ width: '90vw', maxWidth: '1200px' }}
        contentStyle={{ padding: '20px' }}
      >
        <div className="flex gap-3 mb-4 justify-content-between">
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            onClick={loadEntries}
            loading={isLoadingEntries}
            severity="info"
          />
          <Button
            label="Download CSV"
            icon={<Download size={20} className="mr-2" />}
            onClick={handleDownloadCSV}
            severity="success"
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
        <DataTable
          value={entries}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          tableStyle={{ minWidth: '50rem' }}
          loading={isLoadingEntries}
        >
          <Column field="fullName" header="Full Name" sortable filter />
          <Column field="phoneNumber" header="Phone Number" sortable filter />
          <Column field="instagramHandle" header="Instagram Handle" sortable filter />
          <Column
            field="submittedAt"
            header="Submitted At"
            sortable
            body={(rowData) => new Date(rowData.submittedAt).toLocaleString()}
          />
        </DataTable>
        </div>
      </Dialog>
    </div>
  )
}

export default Maintenance
