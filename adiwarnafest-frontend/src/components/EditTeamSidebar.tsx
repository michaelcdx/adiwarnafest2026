import { useEffect, useState } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import type { Team, UpdateTeamPayload } from '../services/teams'
import type { DropdownOption } from '../services/public'
import { teamsService } from '../services/teams'

type EditTeamSidebarProps = {
  visible: boolean
  team: Team | null
  onHide: () => void
  onSubmit: (payload: UpdateTeamPayload) => Promise<void>
  gameTypeOptions: DropdownOption[]
  loading: boolean
  toastRef: React.RefObject<Toast | null>
}

type EditPlayer = {
  id?: string | null
  name: string
  playerNumber: number
  _tempId?: string
}

let playerCounter = 0

const generateTempId = (): string => {
  return `player_${Date.now()}_${++playerCounter}`
}

export const EditTeamSidebar = ({
  visible,
  team,
  onHide,
  onSubmit,
  gameTypeOptions,
  loading,
  toastRef,
}: EditTeamSidebarProps) => {
  const [editForm, setEditForm] = useState<UpdateTeamPayload>({})
  const [editPlayers, setEditPlayers] = useState<EditPlayer[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)

  useEffect(() => {
    if (visible && team) {
      const loadTeam = async () => {
        setFetchLoading(true)
        try {
          const fullTeam = await teamsService.getTeam(team.id)
          setEditForm({
            name: fullTeam.name,
            gameType: normalizeGameType(fullTeam.gameType),
          })
          setEditPlayers(
            fullTeam.players.map(p => ({
              id: p.id,
              name: p.name,
              playerNumber: p.playerNumber,
            }))
          )
        } catch {
          toastRef.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load team details',
            life: 5000,
          })
        } finally {
          setFetchLoading(false)
        }
      }

      loadTeam()
    }
  }, [visible, team, toastRef])

  const normalizeGameType = (gameType: Team['gameType']) => {
    if (typeof gameType === 'string') return gameType
    const descriptor = gameType as { name?: string; value?: string }
    return descriptor.value || descriptor.name || ''
  }

  const getPreviewUrl = (path: string | null | undefined) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
    const trimmed = baseUrl?.trim()
    const prefix = trimmed ? trimmed.replace(/\/$/, '') : ''
    return `${prefix}${path.startsWith('/') ? '' : '/'}${path}`
  }

  const addPlayer = () => {
    setEditPlayers(prev => [
      ...prev,
      { id: null, _tempId: generateTempId(), name: '', playerNumber: 0 },
    ])
  }

  const updatePlayer = (index: number, field: 'name' | 'playerNumber', value: string | number) => {
    setEditPlayers(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const removePlayer = (index: number) => {
    setEditPlayers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!team) return

    const payload: UpdateTeamPayload = {
      name: editForm.name?.trim() || null,
      gameType: editForm.gameType?.trim() || null,
      players: editPlayers.map(p => ({
        id: p.id ?? null,
        name: p.name,
        playerNumber: p.playerNumber,
      })),
    }

    await onSubmit(payload)

    setEditForm({})
    setEditPlayers([])
  }

  const handleHide = () => {
    setEditForm({})
    setEditPlayers([])
    setFetchLoading(false)
    onHide()
  }

  const isLocked = team?.isLocked ?? false

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Edit Team</h2>

      {fetchLoading && (
        <Message
          severity="info"
          text="Loading team data..."
          className="mb-3"
        />
      )}

      {isLocked && !fetchLoading && (
        <Message
          severity="warn"
          text="This team is locked. Unlock to make changes."
          className="mb-3"
        />
      )}

      {!fetchLoading && (
        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Team Name</label>
            <InputText
              value={editForm.name || ''}
              onChange={e =>
                setEditForm(prev => ({ ...prev, name: e.target.value }))
              }
              disabled={isLocked}
            />
          </div>
          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Game Type</label>
            <Dropdown
              value={editForm.gameType || ''}
              options={gameTypeOptions}
              optionLabel="description"
              optionValue="code"
              placeholder="Select game type"
              onChange={e =>
                setEditForm(prev => ({ ...prev, gameType: e.value }))
              }
              disabled={isLocked}
            />
          </div>


          <div className="flex flex-column gap-2 mt-3">
            <label className="text-sm font-semibold">Current Logo</label>
            {team?.logoPath ? (
              <img
                src={getPreviewUrl(team.logoPath) || ''}
                alt="Team logo"
                style={{
                  width: '72px',
                  height: '72px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
            ) : (
              <span className="text-500 text-sm">No logo uploaded</span>
            )}
          </div>

          <div className="flex flex-column gap-2 mt-3">
            <div className="flex align-items-center justify-content-between">
              <label className="text-sm font-semibold m-0">Players</label>
              <Button
                label="+ Add Player"
                size="small"
                onClick={addPlayer}
                outlined
                disabled={isLocked}
              />
            </div>

            {editPlayers.length > 0 ? (
              <DataTable
                value={editPlayers}
                dataKey={data => data.id ?? data._tempId}
                size="small"
                scrollable
                scrollHeight="250px"
                className="p-datatable-sm"
                tableStyle={{ fontSize: '0.875rem' }}
              >
                <Column
                  header="#"
                  body={(_, { rowIndex }) => rowIndex + 1}
                  style={{ width: '50px' }}
                />
                <Column
                  field="name"
                  header="Player Name"
                  body={(data, { rowIndex }) => (
                    <InputText
                      value={data.name}
                      onChange={e =>
                        updatePlayer(rowIndex, 'name', e.target.value)
                      }
                      className="w-full"
                      placeholder="Enter name"
                      disabled={isLocked}
                    />
                  )}
                  style={{ width: '60%' }}
                />
                <Column
                  field="playerNumber"
                  header="Player Number"
                  body={(data, { rowIndex }) => (
                    <InputNumber
                      value={data.playerNumber}
                      onValueChange={e => {
                        const num = e.value
                        if (num !== null && num !== undefined) {
                          updatePlayer(rowIndex, 'playerNumber', num)
                        }
                      }}
                      min={0}
                      max={99}
                      className="w-full"
                      inputClassName="text-center"
                      disabled={isLocked}
                    />
                  )}
                  style={{ width: '40px' }}
                />
                <Column
                  header="Actions"
                  body={(_, { rowIndex }) => (
                    <Button
                      label="Delete"
                      severity="danger"
                      size="small"
                      onClick={() => removePlayer(rowIndex)}
                      text
                      disabled={isLocked}
                    />
                  )}
                  style={{ width: '60px' }}
                />
              </DataTable>
            ) : (
              <Message
                severity="info"
                text="No players added yet. Click '+ Add Player' to add players."
              />
            )}
          </div>

          <Button
            label="Save Changes"
            onClick={handleSubmit}
            disabled={loading || isLocked}
          />
        </div>
      )}
    </Sidebar>
  )
}
