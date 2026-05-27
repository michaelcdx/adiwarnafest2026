import { useState } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import type { CreateLiveYoutubePayload } from '../services/liveYoutube'

type CreateLiveYoutubeSidebarProps = {
  visible: boolean
  onHide: () => void
  onSubmit: (payload: CreateLiveYoutubePayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const CreateLiveYoutubeSidebar = ({
  visible,
  onHide,
  onSubmit,
  loading,
}: CreateLiveYoutubeSidebarProps) => {
  const [form, setForm] = useState<CreateLiveYoutubePayload>({
    title: '',
    filePath: '',
    status: 'UPCOMING',
  })

  const handleSubmit = async () => {
    await onSubmit(form)
    setForm({ title: '', filePath: '', status: 'UPCOMING' })
  }

  const handleHide = () => {
    setForm({ title: '', filePath: '', status: 'UPCOMING' })
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
      <h2 className="mt-0">Create Live YouTube</h2>
      <div className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Title</label>
          <InputText
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter title"
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">YouTube URL</label>
          <InputText
            value={form.filePath}
            onChange={e => setForm(prev => ({ ...prev, filePath: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Status</label>
          <Dropdown
            value={form.status}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            onChange={e => setForm(prev => ({ ...prev, status: e.value }))}
          />
        </div>

        <Button
          label="Create"
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.filePath}
        />
      </div>
    </Sidebar>
  )
}
