import { useState, useEffect, useCallback } from 'react'
import { YoutubeLogo, ArrowSquareOut } from '@phosphor-icons/react'
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
      <div
        className="min-h-screen flex align-items-center justify-content-center"
        style={{ fontFamily: 'Epilogue, sans-serif', backgroundColor: '#FAF9F6' }}
      >
        <div className="text-600 text-lg">Loading live streams...</div>
      </div>
    )
  }

  if (liveEntries.length === 0) {
    return (
      <div
        className="min-h-screen flex align-items-center justify-content-center"
        style={{ fontFamily: 'Epilogue, sans-serif', backgroundColor: '#FAF9F6' }}
      >
        <div className="text-center">
          <YoutubeLogo size={64} weight="thin" color="#9CA3AF" />
          <div className="text-600 text-xl mt-3">No live streams currently</div>
          <div className="text-500 text-sm mt-2">Check back later for live coverage</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: 'Epilogue, sans-serif', backgroundColor: '#FAF9F6' }}
    >
      <div className="px-4 py-4 mx-auto w-full" style={{ maxWidth: '1200px' }}>
        <header className="mb-4">
          <div className="flex align-items-center gap-3 mb-2">
            <div
              className="border-round-xl p-3"
              style={{ background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)' }}
            >
              <YoutubeLogo size={24} weight="bold" color="#fff" />
            </div>
            <div>
              <h1 className="m-0 text-3xl font-black" style={{ color: '#1a1a1a' }}>
                Live Streams
              </h1>
              <p className="m-0 text-600 text-sm mt-1">Watch live coverage on YouTube</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4">
          {liveEntries.map(entry => {
            const videoId = extractYouTubeId(entry.filePath)
            return (
              <div key={entry.id} className="col-12 md:col-6">
                <div
                  className="border-round-2xl overflow-hidden shadow-3 border-1"
                  style={{ backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.06)' }}
                >
                  {videoId ? (
                    <div className="aspect-ratio-16-9" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
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
                    <div
                      className="flex align-items-center justify-content-center"
                      style={{ height: '200px', backgroundColor: '#f3f4f6' }}
                    >
                      <div className="text-500 text-sm">Unable to embed video</div>
                    </div>
                  )}

                  <div className="p-3 flex flex-column gap-2">
                    <h3 className="m-0 text-lg font-bold" style={{ color: '#1a1a1a' }}>
                      {entry.title}
                    </h3>
                    <a
                      href={entry.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex align-items-center gap-2 text-sm font-semibold"
                      style={{ color: '#FF0000', textDecoration: 'none' }}
                    >
                      Watch on YouTube
                      <ArrowSquareOut size={16} />
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
