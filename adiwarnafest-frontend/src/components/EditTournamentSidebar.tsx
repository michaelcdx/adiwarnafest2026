import { useState } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputNumber } from 'primereact/inputnumber'
import { Message } from 'primereact/message'
import type { Tournament, UpdateTournamentPayload, UpdatePlacementPayload } from '../services/tournaments'
import { TournamentTeamList } from './TournamentTeamList'

type EditTournamentSidebarProps = {
  visible: boolean
  tournament: Tournament | null
  onHide: () => void
  onSubmit: (payload: UpdateTournamentPayload) => Promise<void>
  onUpdatePlacement: (payload: UpdatePlacementPayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const EditTournamentSidebar = ({
  visible,
  tournament,
  onHide,
  onSubmit,
  onUpdatePlacement,
  loading,
}: EditTournamentSidebarProps) => {
  const [formName, setFormName] = useState('')
  const [formStatus, setFormStatus] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>('UPCOMING')
  const [formRemark, setFormRemark] = useState<string | null>(null)
  const [formTeamIds, setFormTeamIds] = useState<string[]>([])

  const [savingPlacement, setSavingPlacement] = useState<string | null>(null)

  if (visible && tournament) {
    if (formName !== tournament.name) setFormName(tournament.name)
    if (formStatus !== tournament.tourneyStatus) setFormStatus(tournament.tourneyStatus)
    if (formRemark !== tournament.remark) setFormRemark(tournament.remark)
    const teamIds = tournament.teams.map(t => t.teamId)
    if (JSON.stringify(formTeamIds) !== JSON.stringify(teamIds)) setFormTeamIds(teamIds)
  }

  const isLocked = tournament?.isLocked ?? false

  const handleTeamChange = (teamIds: string[]) => {
    setFormTeamIds(teamIds)
  }

  const handleSubmit = async () => {
    await onSubmit({
      name: formName,
      tourneyStatus: formStatus,
      remark: formRemark,
      teamIds: formTeamIds,
    })
  }

  const handleHide = () => {
    onHide()
  }

  const handlePlacementChange = async (teamId: string, placement: number | null) => {
    setSavingPlacement(teamId)
    try {
      await onUpdatePlacement({ teamId, placement })
    } finally {
      setSavingPlacement(null)
    }
  }

  const placementTemplate = (team: { teamId: string; teamName: string; placement: number | null }) => (
    <InputNumber
      value={team.placement}
      onValueChange={e => {
        const val = e.value
        handlePlacementChange(team.teamId, val === null || val === undefined ? null : val)
      }}
      min={0}
      max={999}
      className="w-full"
      inputClassName="text-center"
      disabled={savingPlacement === team.teamId}
    />
  )

  const teamNameTemplate = (team: { teamId: string; teamName: string; placement: number | null }) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
      {team.teamName}
    </span>
  )

  return (
    <>
      <Sidebar
        visible={visible}
        position="right"
        onHide={handleHide}
        className="p-sidebar-md"
        style={{ width: '60vw' }}
      >
        <h2 className="mt-0">Edit Tournament</h2>

        {isLocked && (
          <Message
            severity="warn"
            text="This tournament is locked. You can only update placements."
            className="mb-3"
          />
        )}

        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Tournament Name</label>
            <InputText
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Enter tournament name"
              disabled={isLocked}
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Game Type</label>
            <InputText
              value={tournament?.gameType ?? ''}
              disabled
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Status</label>
            <Dropdown
              value={formStatus}
              options={STATUS_OPTIONS}
              placeholder="Select status"
              onChange={e => setFormStatus(e.value)}
              disabled={isLocked}
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold">Remark (Optional)</label>
            <InputText
              value={formRemark ?? ''}
              onChange={e => setFormRemark(e.target.value || null)}
              placeholder="Enter remark or leave blank"
              disabled={isLocked}
            />
          </div>

          <div className="flex align-items-center gap-2">
            <InputSwitch
              checked={tournament?.isLocked ?? false}
              disabled
            />
            <label className="text-sm font-semibold">Locked</label>
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold m-0">Teams</label>
            <TournamentTeamList
              selectedTeamIds={formTeamIds}
              onChange={handleTeamChange}
              locked={isLocked}
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-semibold m-0">Team Placements</label>
            {tournament && tournament.teams.length > 0 ? (
              <DataTable
                value={tournament.teams}
                size="small"
                scrollable
                scrollHeight="300px"
                className="p-datatable-sm"
                tableStyle={{ fontSize: '0.875rem' }}
              >
                <Column
                  field="teamName"
                  header="Team Name"
                  body={teamNameTemplate}
                  style={{ width: '70%' }}
                />
                <Column
                  field="placement"
                  header="Placement"
                  body={placementTemplate}
                  style={{ width: '30%' }}
                />
              </DataTable>
            ) : (
              <Message
                severity="info"
                text="No teams in this tournament yet."
              />
            )}
          </div>

          <div className="flex gap-2">
            {!isLocked && (
              <Button
                label="Save Changes"
                onClick={handleSubmit}
                disabled={loading || !formName}
              />
            )}
            <Button
              label="Close"
              onClick={handleHide}
              outlined
              severity="secondary"
            />
          </div>
        </div>
      </Sidebar>
    </>
  )
}