import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { liveYoutubeService } from '../services/liveYoutube'
import type { LiveYoutube, CreateLiveYoutubePayload, UpdateLiveYoutubePayload } from '../services/liveYoutube'
import { ApiError } from '../services/http'
import { CreateLiveYoutubeSidebar } from '../components/CreateLiveYoutubeSidebar'
import { EditLiveYoutubeSidebar } from '../components/EditLiveYoutubeSidebar'

const MaintenanceLiveYoutube = () => {
  const toast = useRef<Toast>(null)

  const [entries, setEntries] = useState<LiveYoutube[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [activeEntry, setActiveEntry] = useState<LiveYoutube | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await liveYoutubeService.listLiveYoutubes()
      setEntries(data)
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load live YouTube entries',
        life: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = () => {
    loadEntries()
  }

  const statusTemplate = (entry: LiveYoutube) => {
    const statusMap: Record<string, { severity: 'info' | 'success' | 'warning' | 'secondary'; label: string }> = {
      UPCOMING: { severity: 'info', label: 'Upcoming' },
      ONGOING: { severity: 'success', label: 'Ongoing' },
      COMPLETED: { severity: 'warning', label: 'Completed' },
    }
    const { severity, label } = statusMap[entry.status] ?? { severity: 'secondary', label: entry.status }
    return <Tag value={entry.isDeleted ? 'Deleted' : label} severity={entry.isDeleted ? 'danger' : severity} />
  }

  const filePathTemplate = (entry: LiveYoutube) => (
    <span className="text-sm" style={{ color: '#374151', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
      {entry.filePath}
    </span>
  )

  const openCreate = () => {
    setShowCreate(true)
  }

  const openEdit = (entry: LiveYoutube) => {
    setActiveEntry(entry)
    setShowEdit(true)
  }

  const handleCreate = async (payload: CreateLiveYoutubePayload) => {
    try {
      await liveYoutubeService.createLiveYoutube(payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Live YouTube entry created successfully',
        life: 3000,
      })
      setShowCreate(false)
      refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create live YouTube entry',
          life: 5000,
        })
      }
    }
  }

  const handleEdit = async (payload: UpdateLiveYoutubePayload) => {
    if (!activeEntry) return

    try {
      await liveYoutubeService.updateLiveYoutube(activeEntry.id, payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Live YouTube entry updated successfully',
        life: 3000,
      })
      setShowEdit(false)
      refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update live YouTube entry',
          life: 5000,
        })
      }
    }
  }

  const handleDelete = async (entry: LiveYoutube) => {
    try {
      await liveYoutubeService.deleteLiveYoutube(entry.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Live YouTube entry deleted successfully',
        life: 3000,
      })
      refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      }
    }
  }

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const actionTemplate = (entry: LiveYoutube) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        text
        onClick={() => openEdit(entry)}
        style={{ color: '#862C14' }}
      />
      <Button
        label="Delete"
        text
        severity="danger"
        onClick={() => handleDelete(entry)}
      />
    </div>
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading entries...'
    return 'No live YouTube entries found'
  }, [loading])

  return (
    <div
      className="glass-page"
      style={{
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      <Toast ref={toast} />

      <div
        className="px-4 py-4 mx-auto w-full"
        style={{ maxWidth: '1100px' }}
      >
        <header className="flex flex-column gap-3 mb-4">
          <div>
            <h1 className="m-0 text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              Live YouTube
            </h1>
            <p className="m-0 text-600 text-sm">Manage live YouTube stream links.</p>
          </div>
          <div className="flex flex-wrap align-items-center gap-3" style={{ fontSize: '13px' }}>
            <div className="button-wrap">
              <button className="premium-btn" onClick={openCreate}><span>New Entry</span></button>
              <div className="button-shadow" />
            </div>
            <button className="glass-btn" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={refresh}>Refresh</button>
          </div>
        </header>

        <div className="glass-card p-3" style={{ overflowX: 'auto' }}>
          <DataTable
            value={entries}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '700px' }}
          >
            <Column field="title" header="Title" sortable />
            <Column header="YouTube URL" body={filePathTemplate} sortable />
            <Column header="Status" body={statusTemplate} sortable />
            <Column
              header="Actions"
              body={actionTemplate}
              style={{ width: '180px' }}
            />
          </DataTable>
        </div>

        <CreateLiveYoutubeSidebar
          visible={showCreate}
          onHide={() => setShowCreate(false)}
          onSubmit={handleCreate}
          loading={loading}
        />

        <EditLiveYoutubeSidebar
          visible={showEdit}
          entry={activeEntry}
          onHide={() => setShowEdit(false)}
          onSubmit={handleEdit}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default MaintenanceLiveYoutube
