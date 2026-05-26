import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import type { DropdownOption } from '../services/public'
import { publicService } from '../services/public'

type TeamSelectionModalProps = {
  visible: boolean
  onHide: () => void
  selectedTeamIds: string[]
  onSave: (teamIds: string[]) => void
}

export const TeamSelectionModal = ({
  visible,
  onHide,
  selectedTeamIds,
  onSave,
}: TeamSelectionModalProps) => {
  const [teamOptions, setTeamOptions] = useState<DropdownOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const loadTeams = async () => {
    setLoadingTeams(true)
    try {
      const response = await publicService.getDropdownOptions('team')
      const options = response?.[0]?.options ?? []
      setTeamOptions(options)
    } catch {
      setTeamOptions([])
    } finally {
      setLoadingTeams(false)
    }
  }

  if (visible && !initialized) {
    setInitialized(true)
    setSelectedIds(selectedTeamIds)
    loadTeams()
  }

  if (!visible && initialized) {
    setInitialized(false)
  }

  const handleToggle = (teamId: string) => {
    setSelectedIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === teamOptions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(teamOptions.map(t => t.id))
    }
  }

  const handleSave = () => {
    onSave(selectedIds)
    onHide()
  }

  const footer = (
    <div className="flex gap-2 justify-content-end">
      <Button label="Cancel" onClick={onHide} outlined />
      <Button label="Save" onClick={handleSave} />
    </div>
  )

  const isAllSelected = teamOptions.length > 0 && selectedIds.length === teamOptions.length

  return (
    <Dialog
      visible={visible}
      header="Select Teams"
      onHide={onHide}
      modal
      style={{ width: '50vw' }}
      footer={footer}
    >
      <div className="flex flex-column gap-3">
        <div className="flex align-items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
          />
          <span className="text-sm font-semibold">Select All</span>
          <span className="text-500 text-sm ml-auto">
            {selectedIds.length} of {teamOptions.length} selected
          </span>
        </div>

        <div
          className="border-round-1"
          style={{
            border: '1px solid #eee',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {loadingTeams ? (
            <div className="p-3 text-center text-500">Loading teams...</div>
          ) : teamOptions.length === 0 ? (
            <div className="p-3 text-center text-500">No teams available</div>
          ) : (
            teamOptions.map(team => (
              <div
                key={team.id}
                className="flex align-items-center gap-3 p-2"
                style={{
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <Checkbox
                  checked={selectedIds.includes(team.id)}
                  onChange={() => handleToggle(team.id)}
                />
                <div className="flex flex-column">
                  <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
                    {team.description}
                  </span>
                  <span className="text-500 text-xs">{team.code}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  )
}