import { useState, useEffect } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import type { Tournament } from '../services/tournaments'
import { tournamentsService } from '../services/tournaments'
import { gamesService } from '../services/games'
import { publicService } from '../services/public'
import { ApiError } from '../services/http'

type CreateGameSidebarProps = {
  visible: boolean
  tournament: Tournament | null
  onHide: () => void
  onSuccess: () => void
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

type TournamentTeamOption = {
  id: string
  name: string
  gameType: string
}

export const CreateGameSidebar = ({
  visible,
  tournament,
  onHide,
  onSuccess,
}: CreateGameSidebarProps) => {
  const [gameType, setGameType] = useState<string | null>(null)
  const [gameTypeOptions, setGameTypeOptions] = useState<{ label: string; value: string }[]>([])
  const [team1Id, setTeam1Id] = useState<string | null>(null)
  const [team2Id, setTeam2Id] = useState<string | null>(null)
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date())
  const [gameStatus, setGameStatus] = useState<string>('UPCOMING')
  const [remark, setRemark] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeamOption[]>([])

  useEffect(() => {
    if (visible && tournament) {
      loadGameTypes()
      loadTournamentTeams()
    }
  }, [visible, tournament])

  useEffect(() => {
    if (!visible) {
      setGameType(null)
      setTeam1Id(null)
      setTeam2Id(null)
      setScheduledAt(new Date())
      setGameStatus('UPCOMING')
      setRemark('')
      setError(null)
    }
  }, [visible])

  const loadGameTypes = async () => {
    try {
      const data = await publicService.getDropdownOptions('gametype')
      const options = data.find(d => d.type.toLowerCase() === 'gametype')?.options ?? []
      setGameTypeOptions(options.map(o => ({ label: o.code, value: o.code })))
    } catch {
      setGameTypeOptions([])
    }
  }

  const loadTournamentTeams = async () => {
    if (!tournament) return
    setLoadingTeams(true)
    try {
      const teams = await tournamentsService.getTournamentTeams(tournament.id)
      setTournamentTeams(teams)
    } catch {
      setTournamentTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const filteredTeamOptions = tournamentTeams
    .filter(t => !gameType || t.gameType === gameType)
    .map(t => ({ label: t.name, value: t.id }))

  const team1Name = tournamentTeams.find(t => t.id === team1Id)?.name ?? ''
  const team2Name = tournamentTeams.find(t => t.id === team2Id)?.name ?? ''

  const handleHide = () => {
    setGameType(null)
    setTeam1Id(null)
    setTeam2Id(null)
    setScheduledAt(new Date())
    setGameStatus('UPCOMING')
    setRemark('')
    setError(null)
    onHide()
  }

  const handleSave = async () => {
    if (!tournament || !team1Id || !team2Id) return
    if (team1Id === team2Id) {
      setError('A game cannot have the same team for both sides.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await gamesService.createGame(tournament.id, {
        team1Id,
        team2Id,
        gameStatus: gameStatus as 'UPCOMING' | 'ONGOING' | 'COMPLETED',
        scheduledAt: scheduledAt.toISOString(),
        remark: remark || null,
      })
      onSuccess()
      handleHide()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(String(err.data))
      } else {
        setError('Failed to create game')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Create Game</h2>

      <div className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Game Type</label>
          <Dropdown
            value={gameType}
            options={gameTypeOptions}
            placeholder="Select game type"
            onChange={e => {
              setGameType(e.value)
              setTeam1Id(null)
              setTeam2Id(null)
            }}
          />
        </div>

        <div className="grid">
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Team 1</label>
              <Dropdown
                value={team1Id}
                options={filteredTeamOptions.filter(t => t.value !== team2Id)}
                placeholder="Select Team 1"
                onChange={e => setTeam1Id(e.value)}
                disabled={loadingTeams || !gameType}
              />
              <span className="text-xs text-500">{team1Name}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Team 2</label>
              <Dropdown
                value={team2Id}
                options={filteredTeamOptions.filter(t => t.value !== team1Id)}
                placeholder="Select Team 2"
                onChange={e => setTeam2Id(e.value)}
                disabled={loadingTeams || !gameType}
              />
              <span className="text-xs text-500">{team2Name}</span>
            </div>
          </div>
        </div>

        {!gameType && (
          <Message severity="info" text="Select a game type to see available teams." />
        )}

        {gameType && filteredTeamOptions.length === 0 && (
          <Message severity="warn" text={`No teams found with game type '${gameType}'.`} />
        )}

        <div className="grid">
          <div className="col-4">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Scheduled At</label>
              <Calendar
                value={scheduledAt}
                onChange={e => setScheduledAt(e.value as Date)}
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
          <div className="col-4">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Status</label>
              <Dropdown
                value={gameStatus}
                options={STATUS_OPTIONS}
                onChange={e => setGameStatus(e.value)}
              />
            </div>
          </div>
          <div className="col-4">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Remark (Optional)</label>
              <InputText
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="Enter remark"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm" style={{ color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            label="Create Game"
            onClick={handleSave}
            disabled={saving || !gameType || !team1Id || !team2Id}
            loading={saving}
          />
          <Button
            label="Close"
            onClick={handleHide}
            outlined
            severity="secondary"
          />
        </div>
      </div>
    </Sidebar>
  )
}