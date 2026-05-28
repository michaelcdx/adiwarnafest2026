import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Checkbox } from 'primereact/checkbox'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { UsersThree, MagnifyingGlass, Key } from '@phosphor-icons/react'
import { useAuth } from '../store/auth'
import { usersService } from '../services/users'
import type { UserSummary, UpdateUserPayload, RoleDescriptor } from '../services/users'

const MaintenanceParticipants = () => {
  const { role } = useAuth()
  const isAdmin = role === 'Admin'
  const isMaintainer = role === 'Maintainer'
  const toast = useRef<Toast>(null)
  const [participants, setParticipants] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    username: '',
    isDisabled: false,
    disabledReason: '',
  })
  const [activeUser, setActiveUser] = useState<UserSummary | null>(null)
  const [search, setSearch] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  const normalizeRole = (role: UserSummary['role']) => {
    if (typeof role === 'string') return role
    const descriptor = role as RoleDescriptor
    return descriptor.value || descriptor.name || 'Player'
  }

  const loadParticipants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersService.listUsers(true)
      const normalized = data
        .map(user => ({
          ...user,
          role: normalizeRole(user.role) as UserSummary['role'],
        }))
        .filter(user => user.role === 'Player')
      setParticipants(normalized)
    } catch (err) {
      setError('Failed to load participants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParticipants()
  }, [loadParticipants])

  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants
    const q = search.toLowerCase()
    return participants.filter(
      p =>
        p.email.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
    )
  }, [participants, search])

  const statusTemplate = (user: UserSummary) => {
    const value = user.isDisabled ? 'Disabled' : 'Active'
    return <Tag value={value} severity={user.isDisabled ? 'danger' : 'success'} />
  }

  const openEdit = (user: UserSummary) => {
    setActiveUser(user)
    setEditForm({
      username: user.username,
      isDisabled: Boolean(user.isDisabled),
      disabledReason: user.disabledReason ?? '',
    })
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!activeUser) return
    setLoading(true)
    setError(null)
    try {
      const payload: UpdateUserPayload = {
        username: editForm.username?.trim() || undefined,
        isDisabled: editForm.isDisabled,
        disabledReason: editForm.isDisabled ? editForm.disabledReason : undefined,
      }
      await usersService.updateUser(activeUser.id, payload)
      setShowEdit(false)
      setActiveUser(null)
      await loadParticipants()
    } catch {
      setError('Failed to update participant')
    } finally {
      setLoading(false)
    }
  }

  const showDeleteConfirm = () => {
    if (!activeUser) return
    confirmDialog({
      message: `Are you sure you want to permanently delete ${activeUser.email}? This will also remove their Lucky Draw entry. This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: handleDelete,
      reject: () => {},
    })
  }

  const handleDelete = async () => {
    if (!activeUser) return
    setLoading(true)
    setError(null)
    try {
      await usersService.deleteUser(activeUser.id)
      setShowEdit(false)
      setActiveUser(null)
      await loadParticipants()
    } catch {
      setError('Failed to delete participant')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!activeUser) return
    if (newPassword.length < 12) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Weak Password',
        detail: 'Password must be at least 12 characters long.',
        life: 3000
      })
      return
    }
    setResettingPassword(true)
    try {
      await usersService.resetPassword(activeUser.id, newPassword)
      toast.current?.show({
        severity: 'success',
        summary: 'Password Reset',
        detail: `Password for ${activeUser.email} has been updated.`,
        life: 3000
      })
      setNewPassword('')
    } catch (err: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Reset Failed',
        detail: err instanceof Error ? err.message : 'Failed to reset password.',
        life: 3000
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const actionTemplate = (user: UserSummary) => (
    isAdmin || isMaintainer ? (
      <Button
        label={isAdmin ? 'Manage' : 'Reset Password'}
        text
        onClick={() => openEdit(user)}
        style={{ color: '#7c3aed' }}
      />
    ) : (
      <span style={{ fontSize: '12px', color: '#9ca3af' }}>View only</span>
    )
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading participants...'
    if (error) return error
    return 'No participants registered yet'
  }, [error, loading])

  return (
    <div className="glass-page" style={{ fontFamily: 'Epilogue, sans-serif' }}>
      <Toast ref={toast} position="bottom-center" />
      <div className="px-4 py-4 mx-auto w-full" style={{ maxWidth: '1280px' }}>
        <header className="mb-4">
          <div className="flex align-items-center gap-3 mb-2">
            <div className="glass-icon" style={{ background: 'rgba(209,223,246,0.12)' }}>
              <UsersThree size={24} weight="bold" color="rgba(209,223,246,0.9)" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold" style={{ color: '#1a1a1a' }}>Participants</h1>
              <p className="m-0 text-600 text-sm">Self-registered participants (Player role).</p>
            </div>
          </div>
        </header>

        {/* Search + Refresh Bar */}
        <div className="flex flex-column md:flex-row gap-3 mb-3 align-items-stretch md:align-items-center">
          <div className="flex-1 flex align-items-center gap-2 glass-card-sm px-3 py-2">
            <MagnifyingGlass size={18} weight="bold" color="#9ca3af" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or username..."
              className="flex-1 border-none p-0 bg-transparent text-sm"
              style={{ outline: 'none', boxShadow: 'none' }}
            />
          </div>
          <button className="glass-btn" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={loadParticipants}>Refresh</button>
        </div>

        <div className="glass-card p-3" style={{ overflowX: 'auto' }}>
          <DataTable
            value={filteredParticipants}
            paginator
            rows={20}
            rowsPerPageOptions={[10, 20, 50, 100]}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '720px' }}
          >
            <Column field="username" header="Username" sortable filter />
            <Column field="email" header="Email" sortable filter />
            <Column header="Status" body={statusTemplate} sortable sortField="isDisabled" />
            <Column field="disabledReason" header="Disabled Reason" />
            <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
          </DataTable>
        </div>

        <Sidebar
          visible={showEdit}
          position="right"
          onHide={() => { setShowEdit(false); setNewPassword(''); }}
          className="p-sidebar-md"
          style={{ width: '420px' }}
        >
          <h2 className="mt-0">Manage Participant</h2>
          {activeUser && (
            <div className="mb-3 p-3 border-round-lg" style={{ backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <p className="m-0 text-xs text-500 mb-1">Email</p>
              <p className="m-0 text-sm font-semibold mb-2">{activeUser.email}</p>
              <p className="m-0 text-xs text-500 mb-1">User ID</p>
              <p className="m-0 text-xs font-mono" style={{ wordBreak: 'break-all' }}>{activeUser.id}</p>
            </div>
          )}
          <div className="flex flex-column gap-3">
            {isAdmin && (
              <>
                <div className="flex flex-column gap-2">
                  <label className="text-sm font-semibold">Username</label>
                  <InputText
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="flex align-items-center gap-2">
                  <Checkbox
                    inputId="disable-participant"
                    checked={Boolean(editForm.isDisabled)}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isDisabled: e.checked }))}
                  />
                  <label htmlFor="disable-participant" className="text-sm font-semibold">Disable participant</label>
                </div>
                {editForm.isDisabled && (
                  <div className="flex flex-column gap-2">
                    <label className="text-sm font-semibold">Disabled reason</label>
                    <InputText
                      value={editForm.disabledReason || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, disabledReason: e.target.value }))}
                    />
                  </div>
                )}
              </>
            )}

            {(isAdmin || isMaintainer) && (
              <div className="border-round-lg p-3 mt-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.15)' }}>
                <div className="flex align-items-center gap-2 mb-2">
                  <Key size={18} weight="bold" color="#dc2626" />
                  <span className="text-sm font-bold" style={{ color: '#dc2626' }}>Admin: Reset Password</span>
                </div>
                <p className="m-0 text-xs text-600 mb-3">
                  Passwords are one-way hashed and cannot be viewed. Set a new password below to override the current one.
                </p>

                <div className="flex flex-column gap-2">
                  <label className="text-xs font-semibold" style={{ color: '#374151' }}>New Password</label>
                  <Password
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    toggleMask
                    feedback={false}
                    placeholder="Min 12 characters"
                    inputStyle={{ width: '100%' }}
                    style={{ width: '100%' }}
                  />
                  <p className="m-0 text-[10px] text-500">Password must be at least 12 characters long.</p>
                  <Button
                    label={resettingPassword ? 'Resetting...' : 'Apply New Password'}
                    icon={<Key size={14} className="mr-2" weight="bold" />}
                    onClick={handleResetPassword}
                    disabled={resettingPassword || newPassword.length < 12}
                    loading={resettingPassword}
                    className="w-full mt-1"
                    size="small"
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  />
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <Button label="Save" onClick={handleEdit} disabled={loading} style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }} />
                <Button
                  label="Delete"
                  severity="danger"
                  text
                  onClick={showDeleteConfirm}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </Sidebar>

        <ConfirmDialog />
      </div>
    </div>
  )
}

export default MaintenanceParticipants
