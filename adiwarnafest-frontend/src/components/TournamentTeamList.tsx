import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Message } from 'primereact/message'
import type { DropdownOption } from '../services/public'
import { publicService } from '../services/public'
import type { Team } from '../services/teams'
import { teamsService } from '../services/teams'

type TournamentTeamListProps = {
  selectedTeamIds: string[]
  onChange: (teamIds: string[]) => void
  locked?: boolean
}

type TeamWithDetails = {
  id: string
  name: string
  gameType: string
}

export const TournamentTeamList = ({
  selectedTeamIds,
  onChange,
  locked = false,
}: TournamentTeamListProps) => {
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [availableOptions, setAvailableOptions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const normalizeGameType = (gameType: string | { name?: string; value?: string }): string => {
    if (typeof gameType === 'string') return gameType
    return gameType.value || gameType.name || ''
  }

  const loadTeams = async () => {
    setLoading(true)
    try {
      const details = await Promise.all(
        selectedTeamIds.map(id => teamsService.getTeam(id).catch(() => null))
      )
      setTeams(
        details
          .filter((t): t is Team => t !== null)
          .map(t => ({ id: t.id, name: t.name, gameType: normalizeGameType(t.gameType) }))
      )
    } catch {
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTeams = async () => {
    try {
      const response = await publicService.getDropdownOptions('team')
      const options = response?.[0]?.options ?? []
      setAvailableOptions(options.filter(o => !selectedTeamIds.includes(o.id)))
    } catch {
      setAvailableOptions([])
    }
  }

  useEffect(() => {
    if (initialized) {
      loadTeams()
      loadAvailableTeams()
    }
  }, [initialized, selectedTeamIds])

  if (!initialized) {
    setInitialized(true)
    loadTeams()
    loadAvailableTeams()
  }

  const handleRemove = (teamId: string) => {
    onChange(selectedTeamIds.filter(id => id !== teamId))
  }

  const handleAdd = (teamId: string) => {
    onChange([...selectedTeamIds, teamId])
    setAvailableOptions(prev => prev.filter(o => o.id !== teamId))
  }

  const removeButtonTemplate = (row: TeamWithDetails) => (
    <Button
      icon="pi pi-times"
      severity="danger"
      size="small"
      onClick={() => handleRemove(row.id)}
      text
      disabled={locked}
    />
  )

  const gameTypeTemplate = (row: TeamWithDetails) => (
    <span className="text-sm" style={{ color: '#6b7280' }}>
      {row.gameType}
    </span>
  )

  const nameTemplate = (row: TeamWithDetails) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
      {row.name}
    </span>
  )

  const addTeamTemplate = () => {
    if (locked) return null
    return (
      <div className="flex align-items-center gap-2">
        <Dropdown
          options={availableOptions}
          optionLabel="description"
          optionValue="id"
          placeholder="Add team..."
          onChange={e => handleAdd(e.value)}
          className="w-full"
        />
      </div>
    )
  }

  if (loading) {
    return <Message severity="info" text="Loading teams..." />
  }

  if (selectedTeamIds.length === 0) {
    return (
      <Message
        severity="info"
        text={locked ? "No teams assigned to this tournament." : "No teams assigned yet. Select a team from the dropdown to add."}
      />
    )
  }

  return (
    <div className="flex flex-column gap-2">
      <DataTable
        value={teams}
        size="small"
        scrollable
        scrollHeight="250px"
        className="p-datatable-sm"
        tableStyle={{ fontSize: '0.875rem' }}
        emptyMessage={<Message severity="info" text="No teams to display" />}
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
      {!locked && availableOptions.length > 0 && (
        <div className="mt-2">{addTeamTemplate()}</div>
      )}
    </div>
  )
}