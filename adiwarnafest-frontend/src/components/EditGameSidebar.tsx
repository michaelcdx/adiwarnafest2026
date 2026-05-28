import { useState, useEffect } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import type { Game, UpdateGamePayload } from '../services/games'
import type { Tournament } from '../services/tournaments'
import { tournamentsService } from '../services/tournaments'

type EditGameSidebarProps = {
  visible: boolean
  game: Game | null
  tournament: Tournament | null
  onHide: () => void
  onSubmit: (payload: UpdateGamePayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

const TBC = 'TBC'
const TBC_OPTION = { label: 'TBC (To Be Confirmed)', value: TBC }

export const EditGameSidebar = ({
  visible,
  game,
  tournament,
  onHide,
  onSubmit,
  loading,
}: EditGameSidebarProps) => {
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date())
  const [gameStatus, setGameStatus] = useState<string>('UPCOMING')
  const [remark, setRemark] = useState<string>('')
  const [team1Id, setTeam1Id] = useState<string>(TBC)
  const [team2Id, setTeam2Id] = useState<string>(TBC)
  const [teamOptions, setTeamOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    if (visible && game) {
      setScheduledAt(new Date(game.scheduledAt))
      setGameStatus(game.gameStatus)
      setRemark(game.remark ?? '')
      setTeam1Id(game.team1Id ?? TBC)
      setTeam2Id(game.team2Id ?? TBC)
    }
  }, [visible, game])

  useEffect(() => {
    if (visible && tournament) {
      tournamentsService
        .getTournamentTeams(tournament.id)
        .then(teams => setTeamOptions(teams.map(t => ({ label: t.name, value: t.id }))))
        .catch(() => setTeamOptions([]))
    }
  }, [visible, tournament])

  const team1Options = [TBC_OPTION, ...teamOptions.filter(t => t.value === TBC || t.value !== team2Id)]
  const team2Options = [TBC_OPTION, ...teamOptions.filter(t => t.value === TBC || t.value !== team1Id)]

  const handleHide = () => {
    setScheduledAt(new Date())
    setGameStatus('UPCOMING')
    setRemark('')
    setTeam1Id(TBC)
    setTeam2Id(TBC)
    onHide()
  }

  const handleSubmit = async () => {
    await onSubmit({
      gameStatus: gameStatus as 'UPCOMING' | 'ONGOING' | 'COMPLETED',
      scheduledAt: scheduledAt.toISOString(),
      remark: remark || null,
      setTeams: true,
      team1Id: team1Id === TBC ? null : team1Id,
      team2Id: team2Id === TBC ? null : team2Id,
    })
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Edit Game</h2>

      <div className="flex flex-column gap-3">
        <div className="grid">
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Team 1</label>
              <Dropdown
                value={team1Id}
                options={team1Options}
                placeholder="Select Team 1"
                onChange={e => setTeam1Id(e.value)}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Team 2</label>
              <Dropdown
                value={team2Id}
                options={team2Options}
                placeholder="Select Team 2"
                onChange={e => setTeam2Id(e.value)}
              />
            </div>
          </div>
        </div>

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

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Status</label>
          <Dropdown
            value={gameStatus}
            options={STATUS_OPTIONS}
            onChange={e => setGameStatus(e.value)}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Remark (Optional)</label>
          <InputText
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="Enter remark or leave blank"
          />
        </div>

        <div className="flex gap-2">
          <Button
            label="Save Changes"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
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