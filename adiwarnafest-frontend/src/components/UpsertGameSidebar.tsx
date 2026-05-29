import { useState, useEffect, useRef } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Toast } from 'primereact/toast'
import type { Tournament } from '../services/tournaments'
import { tournamentsService } from '../services/tournaments'
import type { Game, UpsertGamePayload, TeamPlayerStatsInput } from '../services/games'
import { gamesService } from '../services/games'
import { teamsService } from '../services/teams'
import { publicService } from '../services/public'
import type { Player } from '../services/teams'

type UpsertGameSidebarProps = {
  visible: boolean
  tournament: Tournament | null
  game: Game | null
  onHide: () => void
  onSuccess?: () => void
}

type PlayerStatRow = {
  playerId: string
  playerName: string
  playerNumber: number
  teamId: string
  teamName: string
  goals: number
  foul1: number
  foul2: number
}

type TournamentTeamOption = {
  id: string
  name: string
  gameType: string
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const UpsertGameSidebar = ({
  visible,
  tournament,
  game,
  onHide,
  onSuccess,
}: UpsertGameSidebarProps) => {
  const toast = useRef<Toast>(null)
  const [gameType, setGameType] = useState<string | null>(null)
  const [gameTypeOptions, setGameTypeOptions] = useState<{ label: string; value: string }[]>([])
  const [team1Id, setTeam1Id] = useState<string | null>(null)
  const [team2Id, setTeam2Id] = useState<string | null>(null)
  const [team1Stats, setTeam1Stats] = useState<PlayerStatRow[]>([])
  const [team2Stats, setTeam2Stats] = useState<PlayerStatRow[]>([])
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date())
  const [gameStatus, setGameStatus] = useState<string>('UPCOMING')
  const [remark, setRemark] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [settingScore, setSettingScore] = useState(false)
  const [directScore1, setDirectScore1] = useState<number>(0)
  const [directScore2, setDirectScore2] = useState<number>(0)
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeamOption[]>([])

  const isCreateMode = !game

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
      setTeam1Stats([])
      setTeam2Stats([])
      setScheduledAt(new Date())
      setGameStatus('UPCOMING')
      setRemark('')
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
    try {
      const teams = await tournamentsService.getTournamentTeams(tournament.id)
      setTournamentTeams(teams)
    } catch {
      setTournamentTeams([])
    }
  }

  const filteredTeamOptions = tournamentTeams
    .filter(t => !gameType || t.gameType === gameType)
    .map(t => ({ label: t.name, value: t.id }))

  useEffect(() => {
    if (visible && game) {
      const gameTeam1 = tournamentTeams.find(t => t.id === game.team1Id)
      setGameType(gameTeam1?.gameType ?? null)
      setTeam1Id(game.team1Id)
      setTeam2Id(game.team2Id)
      setGameStatus(game.gameStatus)
      setScheduledAt(new Date(game.scheduledAt))
      setRemark(game.remark ?? '')
      setDirectScore1(game.team1Score ?? 0)
      setDirectScore2(game.team2Score ?? 0)

      const stats = game.playerStats
      const u1 = stats[0]?.teamId
      const t1Stats = stats.filter(s => s.teamId === u1).map(s => ({
        playerId: s.playerId,
        playerName: s.playerName,
        playerNumber: s.playerNumber,
        teamId: s.teamId,
        teamName: s.teamName,
        goals: s.goals,
        foul1: s.foul1,
        foul2: s.foul2,
      }))
      const t2Stats = stats.filter(s => s.teamId !== u1).map(s => ({
        playerId: s.playerId,
        playerName: s.playerName,
        playerNumber: s.playerNumber,
        teamId: s.teamId,
        teamName: s.teamName,
        goals: s.goals,
        foul1: s.foul1,
        foul2: s.foul2,
      }))
      setTeam1Stats(t1Stats)
      setTeam2Stats(t2Stats)
    }
  }, [visible, game, tournamentTeams])

  const loadPlayers = async (teamId: string, setFn: (players: Player[]) => void) => {
    try {
      const team = await teamsService.getTeam(teamId)
      setFn(team.players.filter(p => !p.isDeleted))
    } catch {
      setFn([])
    }
  }

  const team1IsTbc = tournamentTeams.find(t => t.id === team1Id)?.name === 'TBC'
  const team2IsTbc = tournamentTeams.find(t => t.id === team2Id)?.name === 'TBC'

  useEffect(() => {
    if (team1Id && (isCreateMode || team1IsTbc)) {
      loadPlayers(team1Id, players => {
        setTeam1Stats(players.map(p => ({
          playerId: p.id,
          playerName: p.name,
          playerNumber: p.playerNumber,
          teamId: p.teamId,
          teamName: '',
          goals: 0,
          foul1: 0,
          foul2: 0,
        })))
      })
    }
  }, [team1Id])

  useEffect(() => {
    if (team2Id && (isCreateMode || team2IsTbc)) {
      loadPlayers(team2Id, players => {
        setTeam2Stats(players.map(p => ({
          playerId: p.id,
          playerName: p.name,
          playerNumber: p.playerNumber,
          teamId: p.teamId,
          teamName: '',
          goals: 0,
          foul1: 0,
          foul2: 0,
        })))
      })
    }
  }, [team2Id])

  const handleHide = () => {
    setGameType(null)
    setTeam1Id(null)
    setTeam2Id(null)
    setTeam1Stats([])
    setTeam2Stats([])
    setScheduledAt(new Date())
    setGameStatus('UPCOMING')
    setRemark('')
    onHide()
  }

  const handleSave = async () => {
    if (!tournament || !team1Id || !team2Id) return
    if (team1Id === team2Id) {
      return
    }

    setSaving(true)
    try {
      const gameId = game?.id ?? crypto.randomUUID()
      const teamStats: TeamPlayerStatsInput[] = [
        { teamId: team1Id, players: team1Stats.map(s => ({ playerId: s.playerId, goals: s.goals, foul1: s.foul1, foul2: s.foul2 })) },
        { teamId: team2Id, players: team2Stats.map(s => ({ playerId: s.playerId, goals: s.goals, foul1: s.foul1, foul2: s.foul2 })) },
      ]

      const payload: UpsertGamePayload = {
        gameStatus: gameStatus as 'UPCOMING' | 'ONGOING' | 'COMPLETED',
        scheduledAt: scheduledAt.toISOString(),
        remark: remark || null,
        team1Id,
        team2Id,
        teamStats,
      }

      await gamesService.upsertGame(tournament.id, gameId, payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: game ? 'Score updated successfully' : 'Game created successfully',
        life: 3000,
      })
      onSuccess?.()
      handleHide()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save game'
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const updateStat = (
    team: 'team1' | 'team2',
    playerId: string,
    field: 'goals' | 'foul1' | 'foul2',
    value: number
  ) => {
    const setter = team === 'team1' ? setTeam1Stats : setTeam2Stats
    setter(prev => prev.map(s => s.playerId === playerId ? { ...s, [field]: value } : s))
  }

  const statColumn = (
    field: 'goals' | 'foul1' | 'foul2',
    header: string,
    team: 'team1' | 'team2'
  ) => (
    <Column
      field={field}
      header={header}
      style={{ width: '80px' }}
      body={(row: PlayerStatRow) => (
        <InputNumber
          value={row[field]}
          onValueChange={e => updateStat(team, row.playerId, field, e.value ?? 0)}
          min={0}
          max={999}
          className="w-full"
          inputClassName="text-center"
        />
      )}
    />
  )

  const handleSetScore = async () => {
    if (!tournament || !game) return
    setSettingScore(true)
    try {
      await gamesService.setScore(tournament.id, game.id, directScore1, directScore2, gameStatus)
      toast.current?.show({ severity: 'success', summary: 'Score updated', life: 3000 })
      onSuccess?.()
    } catch (error: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Failed to set score',
        life: 5000,
      })
    } finally {
      setSettingScore(false)
    }
  }

  const team1Name = tournamentTeams.find(t => t.id === team1Id)?.name ?? ''
  const team2Name = tournamentTeams.find(t => t.id === team2Id)?.name ?? ''

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '80vw' }}
    >
      <Toast ref={toast} />
      <h2 className="mt-0">{game ? 'Update Score' : 'Create Game'}</h2>

      <div className="flex flex-column gap-3">
        {isCreateMode && (
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
        )}

        <div className="grid">
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Team 1</label>
              <Dropdown
                value={team1Id}
                options={filteredTeamOptions.filter(t => t.value !== team2Id)}
                placeholder="Select Team 1"
                onChange={e => setTeam1Id(e.value)}
                disabled={!isCreateMode && tournamentTeams.find(t => t.id === team1Id)?.name !== 'TBC'}
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
                disabled={!isCreateMode && tournamentTeams.find(t => t.id === team2Id)?.name !== 'TBC'}
              />
              <span className="text-xs text-500">{team2Name}</span>
            </div>
          </div>
        </div>

        <Divider />

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

        {/* Direct Score Input (always shown when editing) */}
        {game && (
          <>
            <Divider />
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Score</label>
              <div className="flex align-items-center gap-3">
                <div className="flex flex-column gap-1 align-items-center flex-1">
                  <span className="text-xs text-500">{game.team1Name}</span>
                  <InputNumber
                    value={directScore1}
                    onValueChange={e => setDirectScore1(e.value ?? 0)}
                    min={0} max={999}
                    inputStyle={{ width: '80px', textAlign: 'center', fontSize: '22px', fontWeight: 700 }}
                  />
                </div>
                <span className="text-xl font-bold text-400">-</span>
                <div className="flex flex-column gap-1 align-items-center flex-1">
                  <span className="text-xs text-500">{game.team2Name}</span>
                  <InputNumber
                    value={directScore2}
                    onValueChange={e => setDirectScore2(e.value ?? 0)}
                    min={0} max={999}
                    inputStyle={{ width: '80px', textAlign: 'center', fontSize: '22px', fontWeight: 700 }}
                  />
                </div>
              </div>
              <Button
                label={settingScore ? 'Saving...' : 'Set Score'}
                onClick={handleSetScore}
                disabled={settingScore}
                loading={settingScore}
                style={{ backgroundColor: '#862C14', borderColor: '#862C14' }}
              />
            </div>
          </>
        )}

        {/* {team1Id && (
          <div className="flex flex-column gap-2">
            <Message
              severity="info"
              text={`Players: ${team1Name}`}
            />
            <DataTable
              value={team1Stats}
              size="small"
              scrollable
              scrollHeight="250px"
              className="p-datatable-sm"
            >
              <Column field="playerNumber" header="#" style={{ width: '60px' }} />
              <Column field="playerName" header="Player Name" />
              {statColumn('goals', 'Goals', 'team1')}
              {statColumn('foul1', 'Foul 1', 'team1')}
              {statColumn('foul2', 'Foul 2', 'team1')}
            </DataTable>
          </div>
        )}

        {team2Id && (
          <div className="flex flex-column gap-2">
            <Message
              severity="info"
              text={`Players: ${team2Name}`}
            />
            <DataTable
              value={team2Stats}
              size="small"
              scrollable
              scrollHeight="250px"
              className="p-datatable-sm"
            >
              <Column field="playerNumber" header="#" style={{ width: '60px' }} />
              <Column field="playerName" header="Player Name" />
              {statColumn('goals', 'Goals', 'team2')}
              {statColumn('foul1', 'Foul 1', 'team2')}
              {statColumn('foul2', 'Foul 2', 'team2')}
            </DataTable>
          </div>
        )} */}

        <div className="flex gap-2">
          <Button
            label={game ? 'Update Score' : 'Save Game'}
            onClick={handleSave}
            disabled={saving || !team1Id || !team2Id}
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