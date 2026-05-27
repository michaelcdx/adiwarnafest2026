import { useState, useEffect } from 'react'
import { Sidebar } from 'primereact/sidebar'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import type { LiveYoutube, UpdateLiveYoutubePayload } from '../services/liveYoutube'

type EditLiveYoutubeSidebarProps = {
  visible: boolean
  entry: LiveYoutube | null
  onHide: () => void
  onSubmit: (payload: UpdateLiveYoutubePayload) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export const EditLiveYoutubeSidebar = ({
  visible,
  entry,
  onHide,
  onSubmit,
  loading,
}: EditLiveYoutubeSidebarProps) => {
  const [form, setForm] = useState<UpdateLiveYoutubePayload>({
    title: '',
    filePath: '',
    status: 'UPCOMING',
  })

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title,
        filePath: entry.filePath,
        status: entry.status,
      })
    }
  }, [entry])

  const handleSubmit = async () => {
    await onSubmit(form)
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      className="p-sidebar-md"
      style={{ width: '50vw' }}
    >
      <h2 className="mt-0">Edit Live YouTube</h2>
      <div className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">Title</label>
          <InputText
            value={form.title ?? ''}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter title"
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-semibold">YouTube URL</label>
          <InputText
            value={form.filePath ?? ''}
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
          label="Save"
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </Sidebar>
  )
}
