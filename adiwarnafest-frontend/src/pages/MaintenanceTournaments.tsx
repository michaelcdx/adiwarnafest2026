import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { InputSwitch } from 'primereact/inputswitch'
import { tournamentsService } from '../services/tournaments'
import type { Tournament, CreateTournamentPayload, UpdateTournamentPayload, UpdatePlacementPayload } from '../services/tournaments'
import { ApiError } from '../services/http'
import { CreateTournamentSidebar } from '../components/CreateTournamentSidebar'
import { EditTournamentSidebar } from '../components/EditTournamentSidebar'

const MaintenanceTournaments = () => {
  const toast = useRef<Toast>(null)

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null)

  const loadTournaments = useCallback(async (include: boolean) => {
    setLoading(true)
    try {
      const data = await tournamentsService.listTournaments(include)
      setTournaments(data)
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load tournaments',
        life: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = () => {
    loadTournaments(includeDeleted)
  }

  const handleToggleLock = async (tournament: Tournament) => {
    try {
      await tournamentsService.toggleLock(tournament.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Tournament ${tournament.isLocked ? 'unlocked' : 'locked'} successfully`,
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

  const statusTemplate = (tournament: Tournament) => {
    const statusMap: Record<string, { severity: 'info' | 'success' | 'warning' | 'secondary'; label: string }> = {
      UPCOMING: { severity: 'info', label: 'Upcoming' },
      ONGOING: { severity: 'success', label: 'Ongoing' },
      COMPLETED: { severity: 'warning', label: 'Completed' },
    }
    const { severity, label } = statusMap[tournament.tourneyStatus] ?? { severity: 'secondary', label: tournament.tourneyStatus }
    return <Tag value={tournament.isDeleted ? 'Deleted' : label} severity={tournament.isDeleted ? 'danger' : severity} />
  }



  const teamsTemplate = (tournament: Tournament) => (
    <span className="text-sm" style={{ color: '#374151' }}>
      {tournament.teams.length} teams
    </span>
  )

  const lockedTemplate = (tournament: Tournament) => (
    <Button
      icon={tournament.isLocked ? 'pi pi-lock' : 'pi pi-lock-open'}
      onClick={() => handleToggleLock(tournament)}
      severity={tournament.isLocked ? 'warning' : 'success'}
      text
    />
  )

  const openCreate = () => {
    setShowCreate(true)
  }

  const openEdit = (tournament: Tournament) => {
    setActiveTournament(tournament)
    setShowEdit(true)
  }

  const handleCreate = async (payload: CreateTournamentPayload) => {
    try {
      await tournamentsService.createTournament(payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Tournament created successfully',
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
          detail: 'Failed to create tournament',
          life: 5000,
        })
      }
    }
  }

  const handleEdit = async (payload: UpdateTournamentPayload) => {
    if (!activeTournament) return

    try {
      await tournamentsService.updateTournament(activeTournament.id, payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Tournament updated successfully',
        life: 3000,
      })
      setShowEdit(false)
      refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.status
        if (status === 403) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Cannot update a locked tournament',
            life: 5000,
          })
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: String(error.data),
            life: 5000,
          })
        }
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update tournament',
          life: 5000,
        })
      }
    }
  }

  const handleUpdatePlacement = async (payload: UpdatePlacementPayload) => {
    if (!activeTournament) return

    try {
      await tournamentsService.updatePlacement(activeTournament.id, payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Placement updated successfully',
        life: 3000,
      })
      refresh()
      const updated = await tournamentsService.getTournament(activeTournament.id)
      setActiveTournament(updated)
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

  const handleDelete = async (tournament: Tournament) => {
    try {
      await tournamentsService.deleteTournament(tournament.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Tournament deleted successfully',
        life: 3000,
      })
      refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.status
        if (status === 403) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Cannot delete a locked tournament',
            life: 5000,
          })
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: String(error.data),
            life: 5000,
          })
        }
      }
    }
  }

  const handleIncludeDeletedChange = (checked: boolean) => {
    setIncludeDeleted(checked)
    loadTournaments(checked)
  }

  useEffect(() => {
    loadTournaments(false)
  }, [loadTournaments])

  const actionTemplate = (tournament: Tournament) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        text
        onClick={() => openEdit(tournament)}
        style={{ color: '#862C14' }}
      />
      <Button
        label="Delete"
        text
        severity="danger"
        onClick={() => handleDelete(tournament)}
      />
    </div>
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading tournaments...'
    return 'No tournaments found'
  }, [loading])

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'Epilogue, sans-serif',
        backgroundColor: '#FAF9F6',
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
              Tournaments
            </h1>
            <p className="m-0 text-600 text-sm">Manage tournaments and team placements.</p>
          </div>
          <div className="flex flex-wrap align-items-center gap-3">
            <div className="flex align-items-center gap-2">
              <InputSwitch
                checked={includeDeleted}
                onChange={e => handleIncludeDeletedChange(Boolean(e.value))}
              />
              <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                Include deleted
              </span>
            </div>
            <Button label="New Tournament" onClick={openCreate} />
            <Button label="Refresh" onClick={refresh} outlined />
          </div>
        </header>

        <div
          className="border-round-2xl p-3 shadow-2"
          style={{ backgroundColor: '#fff', border: '1px solid #eee', overflowX: 'auto' }}
        >
          <DataTable
            value={tournaments}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '700px' }}
          >
            <Column field="name" header="Name" sortable />
            <Column header="Teams" body={teamsTemplate} sortable />
            <Column header="Locked" body={lockedTemplate} sortable />
            <Column header="Status" body={statusTemplate} sortable />
            <Column
              header="Actions"
              body={actionTemplate}
              style={{ width: '180px' }}
            />
          </DataTable>
        </div>

        <CreateTournamentSidebar
          visible={showCreate}
          onHide={() => setShowCreate(false)}
          onSubmit={handleCreate}
          loading={loading}
        />

        <EditTournamentSidebar
          visible={showEdit}
          tournament={activeTournament}
          onHide={() => setShowEdit(false)}
          onSubmit={handleEdit}
          onUpdatePlacement={handleUpdatePlacement}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default MaintenanceTournaments