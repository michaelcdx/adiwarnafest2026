import { useState } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Message } from 'primereact/message'
import type { CreateTeamPayload } from '../services/teams'
import type { DropdownOption } from '../services/public'

type CreateTeamSidebarProps = {
  visible: boolean
  onHide: () => void
  onSubmit: (payload: CreateTeamPayload) => Promise<void>
  gameTypeOptions: DropdownOption[]
  loading: boolean
}

let playerCounter = 0

const generateTempId = (): string => {
  return `player_${Date.now()}_${++playerCounter}`
}

type CreatePlayer = {
  _tempId: string
  name: string
  playerNumber: number
}

export const CreateTeamSidebar = ({
  visible,
  onHide,
  onSubmit,
  gameTypeOptions,
  loading,
}: CreateTeamSidebarProps) => {
  const [createForm, setCreateForm] = useState<CreateTeamPayload>({
    name: '',
    gameType: '',
    isLocked: false,
    players: [],
  })

  const [createPlayers, setCreatePlayers] = useState<CreatePlayer[]>([])

  const addPlayer = () => {
    setCreatePlayers(prev => [
      ...prev,
      { _tempId: generateTempId(), name: '', playerNumber: 0 },
    ])
  }

  const updatePlayer = (index: number, field: 'name' | 'playerNumber', value: string | number) => {
    setCreatePlayers(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const removePlayer = (index: number) => {
    setCreatePlayers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const payload: CreateTeamPayload = {
      name: createForm.name,
      gameType: createForm.gameType,
      isLocked: createForm.isLocked,
      players: createPlayers.map(p => ({
        name: p.name,
        playerNumber: p.playerNumber,
      })),
    }

    await onSubmit(payload)

    setCreateForm({
      name: '',
      gameType: '',
      isLocked: false,
      players: [],
    })
    setCreatePlayers([])
  }

  const handleHide = () => {
    setCreateForm({
      name: '',
      gameType: '',
      isLocked: false,
      players: [],
    })
    setCreatePlayers([])
    onHide()
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Create Team</h2>
      <div className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Team Name</label>
          <InputText
            value={createForm.name}
            onChange={e =>
              setCreateForm(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter team name"
          />
        </div>
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Game Type</label>
          <Dropdown
            value={createForm.gameType}
            options={gameTypeOptions}
            optionLabel="description"
            optionValue="code"
            placeholder="Select game type"
            onChange={e =>
              setCreateForm(prev => ({ ...prev, gameType: e.value }))
            }
          />
        </div>
        <div className="flex align-items-center gap-2">
          <InputSwitch
            checked={createForm.isLocked ?? false}
            onChange={e =>
              setCreateForm(prev => ({ ...prev, isLocked: Boolean(e.value) }))
            }
          />
          <label className="text-sm font-semibold">Lock Team</label>
        </div>

        <div className="flex flex-column gap-2 mt-3">
          <div className="flex align-items-center justify-content-between">
            <label className="text-sm font-semibold m-0">Players</label>
            <Button
              label="+ Add Player"
              size="small"
              onClick={addPlayer}
              outlined
            />
          </div>

          {createPlayers.length > 0 ? (
            <DataTable
              value={createPlayers}
              dataKey="_tempId"
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
                  />
                )}
                style={{ width: '40px' }}
              />
              <Column
                header="Actions"
                body={(_, { rowIndex }) => (
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    onClick={() => removePlayer(rowIndex)}
                    text
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

        <Button label="Create" onClick={handleSubmit} disabled={loading} />
      </div>
    </Sidebar>
  )
}
