import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { Checkbox } from 'primereact/checkbox'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Toast } from 'primereact/toast'
import { Key } from '@phosphor-icons/react'
import { usersService } from '../services/users'
import type { UserSummary, CreateUserPayload, UpdateUserPayload, RoleDescriptor } from '../services/users'
import { publicService } from '../services/public'
import type { DropdownOption } from '../services/public'

const MaintenanceUsers = () => {
  const toast = useRef<Toast>(null)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleOptions, setRoleOptions] = useState<DropdownOption[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    email: '',
    username: '',
    password: '',
    role: 'Maintainer',
  })
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    username: '',
    role: 'Maintainer',
    isDisabled: false,
    disabledReason: '',
  })
  const [activeUser, setActiveUser] = useState<UserSummary | null>(null)

  const normalizeRole = (role: UserSummary['role']) => {
    if (typeof role === 'string') return role
    const descriptor = role as RoleDescriptor
    return descriptor.value || descriptor.name || 'Maintainer'
  }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersService.listUsers(true)
      const normalized = data
        .map(user => ({
          ...user,
          role: normalizeRole(user.role) as UserSummary['role'],
        }))
        .filter(user => user.role === 'Admin' || user.role === 'Maintainer')
      setUsers(normalized)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    let isMounted = true
    const loadRoles = async () => {
      try {
        const response = await publicService.getDropdownOptions('userrole')
        const options = response?.[0]?.options ?? []
        const fallback = [{ id: 'Maintainer', code: 'Maintainer', description: 'Maintainer' }]
        if (isMounted) setRoleOptions(options.length ? options : fallback)
      } catch {
        if (isMounted) setRoleOptions([{ id: 'Maintainer', code: 'Maintainer', description: 'Maintainer' }])
      }
    }

    loadRoles()
    return () => {
      isMounted = false
    }
  }, [])

  const statusTemplate = (user: UserSummary) => {
    const value = user.isDisabled ? 'Disabled' : 'Active'
    return <Tag value={value} severity={user.isDisabled ? 'danger' : 'success'} />
  }

  const roleTemplate = (user: UserSummary) => (
    <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>{normalizeRole(user.role)}</span>
  )

  const openCreate = () => {
    setCreateForm({ email: '', username: '', password: '', role: 'Maintainer' })
    setShowCreate(true)
  }

  const openEdit = (user: UserSummary) => {
    setActiveUser(user)
    setEditForm({
      username: user.username,
      role: normalizeRole(user.role) === 'Admin' ? undefined : 'Maintainer',
      isDisabled: Boolean(user.isDisabled),
      disabledReason: user.disabledReason ?? '',
    })
    setNewPassword('')
    setShowEdit(true)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      await usersService.createUser(createForm)
      setShowCreate(false)
      await loadUsers()
    } catch {
      setError('Failed to create user')
    } finally {
      setLoading(false)
    }
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
      if (normalizeRole(activeUser.role) !== 'Admin') {
        payload.role = 'Maintainer'
      }
      await usersService.updateUser(activeUser.id, payload)
      setShowEdit(false)
      setActiveUser(null)
      await loadUsers()
    } catch {
      setError('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const showDeleteConfirm = () => {
    if (!activeUser) return
    confirmDialog({
      message: `Are you sure you want to permanently delete ${activeUser.email}? This action cannot be undone.`,
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
      await loadUsers()
    } catch {
      setError('Failed to delete user')
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
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Reset Failed',
        detail: err?.message || 'Failed to reset password.',
        life: 3000
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const actionTemplate = (user: UserSummary) => (
    <Button
      label="Edit"
      text
      onClick={() => openEdit(user)}
      style={{ color: '#862C14' }}
    />
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading users...'
    if (error) return error
    return 'No users found'
  }, [error, loading])

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Epilogue, sans-serif', backgroundColor: '#FAF9F6' }}>
      <div className="px-4 py-4 mx-auto w-full" style={{ maxWidth: '1100px' }}>
        <header className="flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="m-0 text-2xl font-bold" style={{ color: '#1a1a1a' }}>Staff Users</h1>
            <p className="m-0 text-600 text-sm">Manage Admin and Maintainer accounts. Participants are managed separately.</p>
          </div>
          <div className="flex gap-2">
            <Button label="New User" onClick={openCreate} />
            <Button label="Refresh" onClick={loadUsers} outlined />
          </div>
        </header>

        <div className="border-round-2xl p-3 shadow-2" style={{ backgroundColor: '#fff', border: '1px solid #eee' }}>
          <DataTable
            value={users}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={emptyMessage}
            tableStyle={{ minWidth: '720px' }}
          >
            <Column field="username" header="Username" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="role" header="Role" body={roleTemplate} sortable />
            <Column header="Status" body={statusTemplate} />
            <Column field="disabledReason" header="Disabled Reason" />
            <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
          </DataTable>
        </div>

        <Sidebar
          visible={showCreate}
          position="right"
          onHide={() => setShowCreate(false)}
          className="p-sidebar-md"
          style={{ width: '420px' }}
        >
          <h2 className="mt-0">Create User</h2>
          <div className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Email</label>
              <InputText
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Username</label>
              <InputText
                value={createForm.username}
                onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Password</label>
              <Password
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                feedback={false}
                toggleMask
              />
            </div>
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Role</label>
              <Dropdown
                value={createForm.role}
                options={roleOptions}
                optionLabel="description"
                optionValue="code"
                placeholder="Select role"
                onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.value }))}
              />
            </div>
            <Button label="Create" onClick={handleCreate} disabled={loading} />
          </div>
        </Sidebar>

        <Sidebar
          visible={showEdit}
          position="right"
          onHide={() => setShowEdit(false)}
          className="p-sidebar-md"
          style={{ width: '420px' }}
        >
          <h2 className="mt-0">Edit User</h2>
          <div className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Username</label>
              <InputText
                value={editForm.username || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Role</label>
              {normalizeRole(activeUser?.role || 'Maintainer') === 'Admin' ? (
                <InputText value="Admin" disabled />
              ) : (
                <Dropdown
                  value={editForm.role || 'Maintainer'}
                  options={roleOptions}
                  optionLabel="description"
                  optionValue="code"
                  placeholder="Select role"
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.value }))}
                />
              )}
              {normalizeRole(activeUser?.role || 'Maintainer') === 'Admin' && (
                <span className="text-500 text-xs">Admin role cannot be changed.</span>
              )}
            </div>
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="disable-user"
                checked={Boolean(editForm.isDisabled)}
                onChange={(e) => setEditForm(prev => ({ ...prev, isDisabled: e.checked }))}
                disabled={normalizeRole(activeUser?.role || 'Maintainer') === 'Admin'}
              />
              <label htmlFor="disable-user" className="text-sm font-semibold">Disable user</label>
            </div>
            {normalizeRole(activeUser?.role || 'Maintainer') === 'Admin' && (
              <span className="text-500 text-xs">Admin users cannot be disabled.</span>
            )}
            {editForm.isDisabled && (
              <div className="flex flex-column gap-2">
                <label className="text-sm font-semibold">Disabled reason</label>
                <InputText
                  value={editForm.disabledReason || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, disabledReason: e.target.value }))}
                />
              </div>
            )}

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

            <div className="flex gap-2 pt-2">
              <Button label="Save" onClick={handleEdit} disabled={loading} />
              <Button
                label="Delete"
                severity="danger"
                text
                onClick={showDeleteConfirm}
                disabled={loading || normalizeRole(activeUser?.role || 'Maintainer') === 'Admin'}
              />
            </div>
          </div>
        </Sidebar>

        <Toast ref={toast} />

        <ConfirmDialog />
      </div>
    </div>
  )
}

export default MaintenanceUsers
