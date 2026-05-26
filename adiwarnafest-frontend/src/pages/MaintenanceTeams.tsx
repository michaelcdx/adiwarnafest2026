import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { InputSwitch } from 'primereact/inputswitch'
import { teamsService } from '../services/teams'
import type { CreateTeamPayload, Team, UpdateTeamPayload, GameTypeDescriptor } from '../services/teams'
import { publicService } from '../services/public'
import type { DropdownOption } from '../services/public'
import { ApiError } from '../services/http'
import { CreateTeamSidebar } from '../components/CreateTeamSidebar'
import { EditTeamSidebar } from '../components/EditTeamSidebar'

const MaintenanceTeams = () => {
  const toast = useRef<Toast>(null)

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [gameTypeOptions, setGameTypeOptions] = useState<DropdownOption[]>([])
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showLogoUpload, setShowLogoUpload] = useState(false)
  const [activeTeam, setActiveTeam] = useState<Team | null>(null)
  const [logoUploadFile, setLogoUploadFile] = useState<File | null>(null)

  const normalizeGameType = (gameType: Team['gameType']) => {
    if (typeof gameType === 'string') return gameType
    const descriptor = gameType as GameTypeDescriptor
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

  const validateImage = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    const allowedExt = ['.png', '.jpg', '.jpeg', '.webp']
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!allowedTypes.includes(file.type) || !allowedExt.includes(extension)) {
      return 'Only .png, .jpg, .jpeg, or .webp files are allowed.'
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File exceeds 5MB limit.'
    }
    return null
  }

  const loadTeams = useCallback(
    async (include = includeDeleted) => {
      setLoading(true)
      try {
        const data = await teamsService.listTeams(include)
        const normalized = data.map(team => ({
          ...team,
          gameType: normalizeGameType(team.gameType),
        }))
        setTeams(normalized)
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teams',
          life: 5000,
        })
      } finally {
        setLoading(false)
      }
    },
    [includeDeleted]
  )

  useEffect(() => {
    loadTeams(includeDeleted)
  }, [includeDeleted, loadTeams])

  useEffect(() => {
    let isMounted = true
    const loadGameTypes = async () => {
      try {
        const response = await publicService.getDropdownOptions('gametype')
        const options = response?.[0]?.options ?? []
        if (isMounted) setGameTypeOptions(options)
      } catch {
        if (isMounted) setGameTypeOptions([])
      }
    }

    loadGameTypes()
    return () => {
      isMounted = false
    }
  }, [])

  const statusTemplate = (team: Team) => (
    <Tag
      value={team.isDeleted ? 'Deleted' : 'Active'}
      severity={team.isDeleted ? 'danger' : 'success'}
    />
  )

  const handleToggleLock = async (team: Team) => {
    try {
      await teamsService.toggleLock(team.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Team ${team.isLocked ? 'unlocked' : 'locked'} successfully`,
        life: 3000,
      })
      await loadTeams()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      }
    }
  }

  const lockedTemplate = (team: Team) => (
    <Button
      icon={team.isLocked ? 'pi pi-lock' : 'pi pi-lock-open'}
      onClick={() => handleToggleLock(team)}
      severity={team.isLocked ? 'warning' : 'success'}
      text
    />
  )

  const gameTypeTemplate = (team: Team) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
      {normalizeGameType(team.gameType)}
    </span>
  )

  const logoTemplate = (team: Team) => {
    const previewUrl = getPreviewUrl(team.logoPath)
    if (!previewUrl) return <span className="text-xs text-500">No logo</span>
    return (
      <img
        src={previewUrl}
        alt={`${team.name} logo`}
        style={{
          width: '40px',
          height: '40px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
    )
  }

  const openCreate = () => {
    setShowCreate(true)
  }

  const openEdit = (team: Team) => {
    setActiveTeam(team)
    setShowEdit(true)
  }

  const openLogoUpload = (team: Team) => {
    setActiveTeam(team)
    setLogoUploadFile(null)
    setShowLogoUpload(true)
  }

  const handleCreate = async (payload: CreateTeamPayload) => {
    try {
      await teamsService.createTeam(payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Team created successfully',
        life: 3000,
      })
      setShowCreate(false)
      await loadTeams()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create team',
          life: 5000,
        })
      }
    }
  }

  const handleEdit = async (payload: UpdateTeamPayload) => {
    if (!activeTeam) return

    try {
      await teamsService.updateTeam(activeTeam.id, payload)

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Team updated successfully',
        life: 3000,
      })

      setShowEdit(false)
      await loadTeams()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update team',
          life: 5000,
        })
      }
    }
  }

  const handleDelete = async (team: Team) => {
    try {
      await teamsService.deleteTeam(team.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Team deleted successfully',
        life: 3000,
      })
      await loadTeams()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete team',
          life: 5000,
        })
      }
    }
  }

  const handleLogoUpload = async () => {
    if (!activeTeam || !logoUploadFile) return

    const validationError = validateImage(logoUploadFile)
    if (validationError) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: validationError,
        life: 5000,
      })
      return
    }

    try {
      await teamsService.uploadLogo(activeTeam.id, logoUploadFile)
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Logo uploaded successfully',
        life: 3000,
      })
      setShowLogoUpload(false)
      await loadTeams()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: String(error.data),
          life: 5000,
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload logo',
          life: 5000,
        })
      }
    }
  }

  const actionTemplate = (team: Team) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        text
        onClick={() => openEdit(team)}
        style={{ color: '#862C14' }}
      />
      <Button
        label="Upload"
        text
        onClick={() => openLogoUpload(team)}
        style={{ color: '#862C14' }}
      />
      <Button
        label="Delete"
        text
        severity="danger"
        onClick={() => handleDelete(team)}
      />
    </div>
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading teams...'
    return 'No teams found'
  }, [loading])

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'Epilogue, sans-serif',
        backgroundColor: '#FAF9F6',
      }}
    >
      <Toast ref={toast} />

      <div
        className="px-4 py-4 mx-auto w-full"
        style={{ maxWidth: '1100px' }}
      >
        <header className="flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="m-0 text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              Teams
            </h1>
            <p className="m-0 text-600 text-sm">Manage teams and standings.</p>
          </div>
          <div className="flex align-items-center gap-3">
            <div className="flex align-items-center gap-2">
              <InputSwitch
                checked={includeDeleted}
                onChange={e => setIncludeDeleted(Boolean(e.value))}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: '#374151' }}
              >
                Include deleted
              </span>
            </div>
            <div className="flex gap-2">
              <Button label="New Team" onClick={openCreate} />
              <Button
                label="Refresh"
                onClick={() => loadTeams(includeDeleted)}
                outlined
              />
            </div>
          </div>
        </header>

        <div
          className="border-round-2xl p-3 shadow-2"
          style={{ backgroundColor: '#fff', border: '1px solid #eee' }}
        >
          <DataTable
            value={teams}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '900px' }}
          >
            <Column field="name" header="Name" sortable />
            <Column
              field="gameType"
              header="Game Type"
              body={gameTypeTemplate}
              sortable
            />
            <Column field="wins" header="W" sortable />
            <Column field="losses" header="L" sortable />
            <Column header="Locked" body={lockedTemplate} sortable />
            <Column header="Status" body={statusTemplate} sortable />
            <Column header="Logo" body={logoTemplate} />
            <Column
              header="Actions"
              body={actionTemplate}
              style={{ width: '220px' }}
            />
          </DataTable>
        </div>

        <CreateTeamSidebar
          visible={showCreate}
          onHide={() => setShowCreate(false)}
          onSubmit={handleCreate}
          gameTypeOptions={gameTypeOptions}
          loading={loading}
        />

        <EditTeamSidebar
          visible={showEdit}
          team={activeTeam}
          onHide={() => setShowEdit(false)}
          onSubmit={handleEdit}
          gameTypeOptions={gameTypeOptions}
          loading={loading}
          toastRef={toast}
        />

        <Dialog
          visible={showLogoUpload}
          header="Upload Team Logo"
          onHide={() => setShowLogoUpload(false)}
          modal
          style={{ width: '50vw' }}
        >
          <div className="flex flex-column gap-3">
            {activeTeam?.logoPath && (
              <div className="flex flex-column gap-2">
                <label className="text-sm font-semibold">Current Logo</label>
                <img
                  src={getPreviewUrl(activeTeam.logoPath) || ''}
                  alt="Current logo"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                />
              </div>
            )}

            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Select New Logo</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => setLogoUploadFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-500 text-xs">
                Max 5MB. PNG, JPG, JPEG, or WEBP.
              </span>
              {logoUploadFile && (
                <span className="text-700 text-xs">
                  Selected: {logoUploadFile.name}
                </span>
              )}
            </div>

            <div className="flex gap-2 justify-content-end">
              <Button
                label="Cancel"
                onClick={() => setShowLogoUpload(false)}
                outlined
              />
              <Button
                label="Upload"
                onClick={handleLogoUpload}
                disabled={!logoUploadFile}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default MaintenanceTeams
