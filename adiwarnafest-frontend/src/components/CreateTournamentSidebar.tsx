import { useState, useEffect } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Message } from 'primereact/message'
import type { CreateTournamentPayload, GameType } from '../services/tournaments'
import { publicService } from '../services/public'
import type { DropdownOption } from '../services/public'
import { teamsService } from '../services/teams'

type CreateTournamentSidebarProps = {
  visible: boolean
  onHide: () => void
  onSubmit: (payload: CreateTournamentPayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

type TeamWithDetails = {
  id: string
  name: string
  gameType: string
}

export const CreateTournamentSidebar = ({
  visible,
  onHide,
  onSubmit,
  loading,
}: CreateTournamentSidebarProps) => {
  const [form, setForm] = useState<CreateTournamentPayload>({
    name: '',
    gameType: 'Basketball5v5',
    tourneyStatus: 'UPCOMING',
    remark: null,
    isLocked: false,
    teamIds: [],
  })

  const [selectedTeams, setSelectedTeams] = useState<TeamWithDetails[]>([])
  const [availableOptions, setAvailableOptions] = useState<DropdownOption[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)

  useEffect(() => {
    if (visible) {
      loadAvailableTeams()
    }
  }, [visible])

  useEffect(() => {
    loadSelectedTeamDetails()
  }, [form.teamIds])

  const loadAvailableTeams = async () => {
    try {
      const response = await publicService.getDropdownOptions('team')
      const options = response?.[0]?.options ?? []
      setAvailableOptions(options.filter(o => !(form.teamIds ?? []).includes(o.id)))
    } catch {
      setAvailableOptions([])
    }
  }

  const normalizeGameType = (gameType: string | { name?: string; value?: string }): string => {
    if (typeof gameType === 'string') return gameType
    return gameType.value || gameType.name || ''
  }

  const loadSelectedTeamDetails = async () => {
    const teamIds = form.teamIds ?? []
    if (teamIds.length === 0) {
      setSelectedTeams([])
      return
    }
    setLoadingTeams(true)
    try {
      const details = await Promise.all(
        teamIds.map(id => teamsService.getTeam(id).catch(() => null))
      )
      setSelectedTeams(
        details
          .filter((t): t is NonNullable<typeof t> => t !== null)
          .map(t => ({ id: t.id, name: t.name, gameType: normalizeGameType(t.gameType) }))
      )
    } catch {
      setSelectedTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleAddTeam = (teamId: string) => {
    setForm(prev => ({ ...prev, teamIds: [...(prev.teamIds ?? []), teamId] }))
    setAvailableOptions(prev => prev.filter(o => o.id !== teamId))
  }

  const handleRemoveTeam = (teamId: string) => {
    setForm(prev => ({ ...prev, teamIds: (prev.teamIds ?? []).filter(id => id !== teamId) }))
    const removed = selectedTeams.find(t => t.id === teamId)
    if (removed) {
      setAvailableOptions(prev => [
        ...prev,
        { id: removed.id, code: removed.gameType, description: removed.name },
      ])
    }
  }

  const handleSubmit = async () => {
    await onSubmit(form)

    setForm({
      name: '',
      gameType: 'Basketball5v5',
      tourneyStatus: 'UPCOMING',
      remark: null,
      isLocked: false,
      teamIds: [],
    })
    setSelectedTeams([])
  }

  const handleHide = () => {
    setForm({
      name: '',
      gameType: 'Basketball5v5',
      tourneyStatus: 'UPCOMING',
      remark: null,
      isLocked: false,
      teamIds: [],
    })
    setSelectedTeams([])
    onHide()
  }

  const removeButtonTemplate = (row: TeamWithDetails) => (
    <Button
      icon="pi pi-times"
      severity="danger"
      size="small"
      onClick={() => handleRemoveTeam(row.id)}
      text
    />
  )

  const nameTemplate = (row: TeamWithDetails) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
      {row.name}
    </span>
  )

  const gameTypeTemplate = (row: TeamWithDetails) => (
    <span className="text-sm" style={{ color: '#6b7280' }}>
      {row.gameType}
    </span>
  )

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={handleHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Create Tournament</h2>
      <div className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Tournament Name</label>
          <InputText
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter tournament name"
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Game Type</label>
          <Dropdown
            value={form.gameType}
            options={[
              { label: 'Basketball 5v5', value: 'Basketball5v5' },
              { label: 'Basketball 3v3', value: 'Basketball3v3' },
              { label: 'Futsal', value: 'Futsal' },
            ]}
            placeholder="Select game type"
            onChange={e => setForm(prev => ({ ...prev, gameType: e.value as GameType }))}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Status</label>
          <Dropdown
            value={form.tourneyStatus}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            onChange={e => setForm(prev => ({ ...prev, tourneyStatus: e.value }))}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Remark (Optional)</label>
          <InputText
            value={form.remark ?? ''}
            onChange={e => setForm(prev => ({ ...prev, remark: e.target.value || null }))}
            placeholder="Enter remark or leave blank"
          />
        </div>

        <div className="flex align-items-center gap-2">
          <InputSwitch
            checked={form.isLocked ?? false}
            onChange={e => setForm(prev => ({ ...prev, isLocked: Boolean(e.value) }))}
          />
          <label className="text-sm font-semibold">Lock Tournament</label>
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold m-0">Teams</label>
          {loadingTeams ? (
            <Message severity="info" text="Loading teams..." />
          ) : selectedTeams.length > 0 ? (
            <DataTable
              value={selectedTeams}
              size="small"
              scrollable
              scrollHeight="200px"
              className="p-datatable-sm"
              tableStyle={{ fontSize: '0.875rem' }}
            >
              <Column
                field="name"
                header="Team Name"
                body={nameTemplate}
                style={{ width: '70%' }}
              />
              <Column
                field="gameType"
                header="Game Type"
                body={gameTypeTemplate}
                style={{ width: '20%' }}
              />
              <Column
                header=""
                body={removeButtonTemplate}
                style={{ width: '10%' }}
              />
            </DataTable>
          ) : (
            <Message severity="info" text="No teams added yet." />
          )}
        </div>

        {availableOptions.length > 0 && (
          <div className="flex align-items-center gap-2">
            <Dropdown
              options={availableOptions}
              optionLabel="description"
              optionValue="id"
              placeholder="Add a team..."
              onChange={e => handleAddTeam(e.value)}
              className="w-full"
            />
          </div>
        )}

        <Button
          label="Create"
          onClick={handleSubmit}
          disabled={loading || !form.name}
        />
      </div>
    </Sidebar>
  )
}