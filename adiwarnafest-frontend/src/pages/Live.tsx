import { useState, useEffect, useCallback } from 'react'
import { Eye, ArrowRight } from '@phosphor-icons/react'
import { liveYoutubeService, extractYouTubeId } from '../services/liveYoutube'
import type { LiveYoutube } from '../services/liveYoutube'

const Live = () => {
  const [liveEntries, setLiveEntries] = useState<LiveYoutube[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiveEntries = useCallback(() => {
    liveYoutubeService
      .listLiveYoutubes()
      .then(data => {
        const ongoing = data.filter(entry => entry.status === 'ONGOING' && !entry.isDeleted)
        setLiveEntries(ongoing)
      })
      .catch(() => setLiveEntries([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchLiveEntries()
    const interval = setInterval(fetchLiveEntries, 30000)
    return () => clearInterval(interval)
  }, [fetchLiveEntries])

  if (loading) {
    return (
      <div className="glass-page min-h-screen flex align-items-center justify-content-center" style={{ fontFamily: 'Epilogue, sans-serif' }}>
        <div className="text-lg" style={{ color: 'var(--text-muted)' }}>Loading live streams...</div>
      </div>
    )
  }

  if (liveEntries.length === 0) {
    return (
      <div className="glass-page min-h-screen flex align-items-center justify-content-center" style={{ fontFamily: 'Epilogue, sans-serif' }}>
        <div className="text-center">
          <Eye size={64} weight="thin" color="#9CA3AF" />
          <div className="text-xl mt-3" style={{ color: 'var(--text-secondary)' }}>No live streams currently</div>
          <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Check back later for live coverage</div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-page min-h-screen" style={{ fontFamily: 'Epilogue, sans-serif' }}>
      <div className="px-4 py-4 mx-auto w-full" style={{ maxWidth: '1200px' }}>
        <header className="mb-4">
          <div className="flex align-items-center gap-3 mb-2">
            <div className="glass-icon" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,0,0,0.12)' }}>
              <Eye size={24} weight="fill" color="#FF0000" />
            </div>
            <div>
              <h1 className="m-0 text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Live Streams</h1>
              <p className="m-0 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Watch live coverage on YouTube</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4">
          {liveEntries.map(entry => {
            const videoId = extractYouTubeId(entry.filePath)
            return (
              <div key={entry.id} className="col-12 md:col-6">
                <div className="overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(161,64,0,0.12)", borderRadius: "24px", boxShadow: "0 8px 24px rgba(161,64,0,0.06)" }}>
                  {videoId ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={entry.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Unable to embed video</div>
                    </div>
                  )}

                  <div className="p-3 flex flex-column gap-2">
                    <h3 className="m-0 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{entry.title}</h3>
                    <a
                      href={entry.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex align-items-center gap-2 text-sm font-semibold"
                      style={{ color: '#FF0000', textDecoration: 'none' }}
                    >
                      Watch on YouTube
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Live
