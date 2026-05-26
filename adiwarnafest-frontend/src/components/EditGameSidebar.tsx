import { useState, useEffect } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import type { Game, UpdateGamePayload } from '../services/games'

type EditGameSidebarProps = {
  visible: boolean
  game: Game | null
  onHide: () => void
  onSubmit: (payload: UpdateGamePayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const EditGameSidebar = ({
  visible,
  game,
  onHide,
  onSubmit,
  loading,
}: EditGameSidebarProps) => {
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date())
  const [gameStatus, setGameStatus] = useState<string>('UPCOMING')
  const [remark, setRemark] = useState<string>('')

  useEffect(() => {
    if (visible && game) {
      setScheduledAt(new Date(game.scheduledAt))
      setGameStatus(game.gameStatus)
      setRemark(game.remark ?? '')
    }
  }, [visible, game])

  const handleHide = () => {
    setScheduledAt(new Date())
    setGameStatus('UPCOMING')
    setRemark('')
    onHide()
  }

  const handleSubmit = async () => {
    await onSubmit({
      gameStatus: gameStatus as 'UPCOMING' | 'ONGOING' | 'COMPLETED',
      scheduledAt: scheduledAt.toISOString(),
      remark: remark || null,
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