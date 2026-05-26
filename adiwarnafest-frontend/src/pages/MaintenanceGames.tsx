import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { tournamentsService } from '../services/tournaments'
import { gamesService } from '../services/games'
import type { Tournament } from '../services/tournaments'
import type { Game, UpdateGamePayload } from '../services/games'
import { ApiError } from '../services/http'
import { UpsertGameSidebar } from '../components/UpsertGameSidebar'
import { CreateGameSidebar } from '../components/CreateGameSidebar'
import { EditGameSidebar } from '../components/EditGameSidebar'

const MaintenanceGames = () => {
  const toast = useRef<Toast>(null)

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showUpsert, setShowUpsert] = useState(false)
  const [upsertGame, setUpsertGame] = useState<Game | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [editing, setEditing] = useState(false)

  const selectedTournament = useMemo(
    () => tournaments.find(t => t.id === selectedTournamentId) ?? null,
    [tournaments, selectedTournamentId]
  )

  const loadTournaments = useCallback(async () => {
    try {
      const data = await tournamentsService.listTournaments(false)
      setTournaments(data)
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load tournaments',
        life: 5000,
      })
    }
  }, [])

  const loadGames = useCallback(async (tournamentId: string) => {
    setLoading(true)
    try {
      const data = await gamesService.listGames(tournamentId)
      setGames(data)
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load games',
        life: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = () => {
    if (selectedTournamentId) {
      loadGames(selectedTournamentId)
    }
  }

  const handleTournamentChange = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId)
    loadGames(tournamentId)
  }

  const handleToggleLock = async (game: Game) => {
    if (!selectedTournamentId) return
    try {
      await gamesService.toggleLock(selectedTournamentId, game.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Game ${game.isLocked ? 'unlocked' : 'locked'} successfully`,
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

  const statusTemplate = (game: Game) => {
    const statusMap: Record<string, { severity: 'info' | 'success' | 'warning' | 'secondary'; label: string }> = {
      UPCOMING: { severity: 'info', label: 'Upcoming' },
      ONGOING: { severity: 'success', label: 'Ongoing' },
      COMPLETED: { severity: 'warning', label: 'Completed' },
    }
    const { severity, label } = statusMap[game.gameStatus] ?? { severity: 'secondary', label: game.gameStatus }
    return <Tag value={game.isDeleted ? 'Deleted' : label} severity={game.isDeleted ? 'danger' : severity} />
  }

  const scheduledTemplate = (game: Game) => {
    const date = new Date(game.scheduledAt)
    return (
      <span className="text-sm" style={{ color: '#374151' }}>
        {date.toLocaleDateString('en-MY')} {date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
      </span>
    )
  }

  const teamsTemplate = (game: Game) => (
      <div className="flex gap-3 text-sm">
        <span style={{ color: '#1f2937', fontWeight: 600 }}>{game.team1Name || 'TBD'}</span>
        <span style={{ color: '#9ca3af' }}>vs</span>
        <span style={{ color: '#1f2937', fontWeight: 600 }}>{game.team2Name || 'TBD'}</span>
      </div>
    )

  const scoresTemplate = (game: Game) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
      {game.team1Score} - {game.team2Score}
    </span>
  )

  const lockedTemplate = (game: Game) => (
    <Button
      icon={game.isLocked ? 'pi pi-lock' : 'pi pi-lock-open'}
      onClick={() => handleToggleLock(game)}
      severity={game.isLocked ? 'warning' : 'success'}
      text
    />
  )

  const openCreate = () => {
    setShowCreate(true)
  }

  const openUpsert = (game: Game) => {
    setUpsertGame(game)
    setShowUpsert(true)
  }

  const openEdit = (game: Game) => {
    setActiveGame(game)
    setShowEdit(true)
  }

  const handleEdit = async (payload: UpdateGamePayload) => {
    if (!selectedTournamentId || !activeGame) return
    setEditing(true)
    try {
      await gamesService.updateGame(selectedTournamentId, activeGame.id, payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Game updated successfully',
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
      }
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = async (game: Game) => {
    if (!selectedTournamentId) return
    try {
      await gamesService.deleteGame(selectedTournamentId, game.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Game deleted successfully',
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

  const handleIncludeDeletedChange = (checked: boolean) => {
    setIncludeDeleted(checked)
  }

  useEffect(() => {
    loadTournaments()
  }, [loadTournaments])

  const actionTemplate = (game: Game) => (
    <div className="flex gap-2">
      <Button
        label="Score"
        text
        onClick={() => openUpsert(game)}
        style={{ color: '#862C14' }}
      />
      <Button
        label="Edit"
        text
        onClick={() => openEdit(game)}
      />
      <Button
        label="Delete"
        text
        severity="danger"
        onClick={() => handleDelete(game)}
      />
    </div>
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading games...'
    if (!selectedTournamentId) return 'Select a tournament to view games'
    return 'No games found'
  }, [loading, selectedTournamentId])

  const tournamentOptions = useMemo(
    () => tournaments.map(t => ({ label: t.name, value: t.id })),
    [tournaments]
  )

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
              Games
            </h1>
            <p className="m-0 text-600 text-sm">Manage games within tournaments.</p>
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
            <Button
              label="New Game"
              onClick={openCreate}
              disabled={!selectedTournamentId}
            />
            <Button
              label="Refresh"
              onClick={refresh}
              outlined
              disabled={!selectedTournamentId}
            />
          </div>
        </header>

        <div className="flex flex-column gap-3 mb-4">
          <div className="flex flex-column gap-2" style={{ maxWidth: '300px' }}>
            <label className="text-sm font-semibold" style={{ color: '#374151' }}>
              Tournament
            </label>
            <Dropdown
              value={selectedTournamentId}
              options={tournamentOptions}
              placeholder="Select a tournament"
              onChange={e => handleTournamentChange(e.value)}
              showClear
              className="w-full"
            />
          </div>
        </div>

        <div
          className="border-round-2xl p-3 shadow-2"
          style={{ backgroundColor: '#fff', border: '1px solid #eee', overflowX: 'auto' }}
        >
          <DataTable
            value={games}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '700px' }}
          >
            <Column field="scheduledAt" header="Scheduled" body={scheduledTemplate} sortable />
            <Column header="Teams" body={teamsTemplate} />
            <Column header="Score" body={scoresTemplate} />
            <Column header="Status" body={statusTemplate} />
            <Column header="Locked" body={lockedTemplate} sortable />
            <Column
              header="Actions"
              body={actionTemplate}
              style={{ width: '260px' }}
            />
          </DataTable>
        </div>

        {selectedTournament && (
          <CreateGameSidebar
            visible={showCreate}
            tournament={selectedTournament}
            onHide={() => setShowCreate(false)}
            onSuccess={refresh}
          />
        )}

        {selectedTournament && (
          <UpsertGameSidebar
            visible={showUpsert}
            tournament={selectedTournament}
            game={upsertGame}
            onHide={() => setShowUpsert(false)}
            onSuccess={refresh}
          />
        )}

        <EditGameSidebar
          visible={showEdit}
          game={activeGame}
          onHide={() => setShowEdit(false)}
          onSubmit={handleEdit}
          loading={editing}
        />
      </div>
    </div>
  )
}

export default MaintenanceGames