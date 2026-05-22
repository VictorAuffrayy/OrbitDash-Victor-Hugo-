import { useState, useEffect } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { WidgetShell } from './WidgetShell'
import { Spinner } from '../ui/Badge'
import styles from './YoutubeWidget.module.css'

function parseYoutubeUrl(url) {
  if (!url) return { type: 'none' }
  const videoPatterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of videoPatterns) {
    const m = url.match(p)
    if (m) return { type: 'video', videoId: m[1] }
  }
  const channelIdMatch = url.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/)
  if (channelIdMatch) return { type: 'channel', channelId: channelIdMatch[1] }
  const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/)
  if (handleMatch) return { type: 'handle', handle: handleMatch[1] }
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(url.trim())) return { type: 'channel', channelId: url.trim() }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return { type: 'video', videoId: url.trim() }
  return { type: 'unknown' }
}

async function fetchChannelFeed(channelId) {
  const feed = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feed)}`
  const res = await fetch(proxy)
  const data = await res.json()
  const parser = new DOMParser()
  const xml = parser.parseFromString(data.contents, 'text/xml')
  const channelName = xml.querySelector('author name')?.textContent || 'Chaine YouTube'
  const entries = [...xml.querySelectorAll('entry')].slice(0, 12)
  return {
    channelName, channelId,
    videos: entries.map(e => ({
      id: e.querySelector('videoId')?.textContent || '',
      title: e.querySelector('title')?.textContent || '',
      published: e.querySelector('published')?.textContent || '',
      thumbnail: e.querySelector('thumbnail')?.getAttribute('url') || '',
    }))
  }
}

async function fetchVideoInfo(videoId) {
  const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
  if (!res.ok) throw new Error('Video introuvable')
  const data = await res.json()
  return {
    videoId,
    title: data.title,
    author: data.author_name,
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  }
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function useYoutubeContent(urlOrId) {
  const [state, setState] = useState({ loading: true, error: null, mode: null, data: null })
  useEffect(() => {
    if (!urlOrId) { setState({ loading: false, error: 'Aucune URL', mode: null, data: null }); return }
    setState(s => ({ ...s, loading: true, error: null }))
    const parsed = parseYoutubeUrl(urlOrId)
    if (parsed.type === 'video') {
      fetchVideoInfo(parsed.videoId)
        .then(data => setState({ loading: false, error: null, mode: 'video', data }))
        .catch(e => setState({ loading: false, error: e.message, mode: null, data: null }))
    } else if (parsed.type === 'channel') {
      fetchChannelFeed(parsed.channelId)
        .then(data => setState({ loading: false, error: null, mode: 'channel', data }))
        .catch(e => setState({ loading: false, error: e.message, mode: null, data: null }))
    } else if (parsed.type === 'handle') {
      setState({ loading: false, error: null, mode: 'handle', data: { handle: parsed.handle, url: urlOrId } })
    } else {
      setState({ loading: false, error: 'URL non reconnue', mode: null, data: null })
    }
  }, [urlOrId])
  return state
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className={styles.ytLogoLg}>▶</span>
      <p className={styles.emptyText}>Configurez une URL YouTube en admin</p>
      <p className={styles.emptyHint}>Lien video, chaine ou Channel ID acceptes</p>
    </div>
  )
}

function VideoRow({ video, active, onClick }) {
  return (
    <div className={[styles.videoRow, active ? styles.videoRowActive : ''].join(' ')} onClick={onClick}>
      <div className={styles.thumbWrap}>
        <img src={video.thumbnail} alt={video.title} className={styles.thumb} />
        <div className={styles.playIcon}><Play size={10} /></div>
      </div>
      <div className={styles.videoMeta}>
        <p className={styles.videoTitle}>{video.title}</p>
        <p className={styles.videoDate}>{formatDate(video.published)}</p>
      </div>
    </div>
  )
}

function YoutubeGrid({ widget }) {
  const { loading, error, mode, data } = useYoutubeContent(widget.config.url || '')
  if (loading) return <div className={styles.center}><Spinner size={24} /></div>
  if (error || !data) return <EmptyState />
  if (mode === 'video') return (
    <div className={styles.gridView}>
      <div className={styles.gridThumb}>
        <img src={data.thumbnail} alt={data.title} className={styles.gridImg} />
        <div className={styles.gridPlayOverlay}><Play size={22} /></div>
      </div>
      <p className={styles.gridTitle}>{data.title}</p>
      <p className={styles.gridSub}>par {data.author}</p>
    </div>
  )
  if (mode === 'channel') return (
    <div className={styles.gridView}>
      <div className={styles.gridChannel}>
        <span className={styles.ytLogo}>▶</span>
        <span className={styles.channelName}>{data.channelName}</span>
      </div>
      {data.videos[0] && (
        <div className={styles.gridThumb}>
          <img src={data.videos[0].thumbnail} alt={data.videos[0].title} className={styles.gridImg} />
          <div className={styles.gridPlayOverlay}><Play size={22} /></div>
        </div>
      )}
      {data.videos[0] && <p className={styles.gridTitle}>{data.videos[0].title}</p>}
      <p className={styles.gridSub}>{data.videos.length} videos recentes</p>
    </div>
  )
  return <EmptyState />
}

function YoutubeFocus({ widget }) {
  const { loading, error, mode, data } = useYoutubeContent(widget.config.url || '')
  const [playing, setPlaying] = useState(null)
  if (loading) return <div className={styles.center}><Spinner size={32} /></div>
  if (error || !data) return <EmptyState />
  if (mode === 'video') return (
    <div className={styles.focusView}>
      <div className={styles.focusHeader}>
        <span className={styles.ytLogo}>▶</span>
        <div className={styles.focusTitleGroup}>
          <p className={styles.focusVideoTitle}>{data.title}</p>
          <p className={styles.focusSub}>par {data.author}</p>
        </div>
        <a href={`https://youtu.be/${data.videoId}`} target="_blank" rel="noreferrer" className={styles.extLink}>
          <ExternalLink size={14} />
        </a>
      </div>
      <div className={styles.focusPlayerWrap}>
        <iframe
          className={styles.focusPlayer}
          src={`https://www.youtube.com/embed/${data.videoId}?autoplay=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube player"
        />
      </div>
    </div>
  )
  if (mode === 'channel') return (
    <div className={styles.focusView}>
      <div className={styles.focusHeader}>
        <span className={styles.ytLogo}>▶</span>
        <div className={styles.focusTitleGroup}>
          <p className={styles.channelName}>{data.channelName}</p>
          <p className={styles.focusSub}>{data.videos.length} dernieres videos</p>
        </div>
        <a href={`https://youtube.com/channel/${data.channelId}`} target="_blank" rel="noreferrer" className={styles.extLink}>
          <ExternalLink size={14} />
        </a>
      </div>
      {playing ? (
        <div className={styles.focusPlayerWrap}>
          <iframe
            className={styles.focusPlayer}
            src={`https://www.youtube.com/embed/${playing}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube player"
          />
          <button className={styles.closeBtn} onClick={() => setPlaying(null)}>X Fermer</button>
        </div>
      ) : (
        <div className={styles.channelFocusLayout}>
          {data.videos[0] && (
            <div className={styles.featuredVideo} onClick={() => setPlaying(data.videos[0].id)}>
              <img src={data.videos[0].thumbnail} alt={data.videos[0].title} className={styles.featuredThumb} />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredPlay}><Play size={28} /></div>
              </div>
              <div className={styles.featuredInfo}>
                <p className={styles.featuredTitle}>{data.videos[0].title}</p>
                <p className={styles.featuredDate}>{formatDate(data.videos[0].published)}</p>
              </div>
            </div>
          )}
          <div className={styles.miniList}>
            {data.videos.slice(1, 5).map(v => (
              <div key={v.id} className={styles.miniRow} onClick={() => setPlaying(v.id)}>
                <div className={styles.miniThumbWrap}>
                  <img src={v.thumbnail} alt={v.title} className={styles.miniThumb} />
                  <div className={styles.miniPlay}><Play size={9} /></div>
                </div>
                <div className={styles.miniInfo}>
                  <p className={styles.miniTitle}>{v.title}</p>
                  <p className={styles.miniDate}>{formatDate(v.published)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
  return (
    <div className={styles.focusView}>
      <div className={styles.focusHeader}>
        <span className={styles.ytLogo}>▶</span>
        <p className={styles.channelName}>@{data.handle}</p>
        <a href={data.url} target="_blank" rel="noreferrer" className={styles.extLink}>
          <ExternalLink size={14} />
        </a>
      </div>
      <div className={styles.handleInfo}>
        <p className={styles.emptyText}>Ouvre la chaine sur YouTube</p>
        <a href={data.url} target="_blank" rel="noreferrer" className={styles.openBtn}>
          Ouvrir @{data.handle}
        </a>
      </div>
    </div>
  )
}

function YoutubeFullscreen({ widget }) {
  const { loading, error, mode, data } = useYoutubeContent(widget.config.url || '')
  const [playing, setPlaying] = useState(null)
  if (loading) return <div className={styles.center}><Spinner size={48} /></div>
  if (error || !data) return <EmptyState />
  if (mode === 'video') return (
    <div className={styles.fullscreenVideo}>
      <div className={styles.fsVideoHeader}>
        <span className={styles.ytLogo}>▶</span>
        <div>
          <p className={styles.focusVideoTitle}>{data.title}</p>
          <p className={styles.focusSub}>par {data.author}</p>
        </div>
        <a href={`https://youtu.be/${data.videoId}`} target="_blank" rel="noreferrer" className={styles.extLink}>
          <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        className={styles.fsEmbed}
        src={`https://www.youtube.com/embed/${data.videoId}?autoplay=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube player"
      />
    </div>
  )
  if (mode === 'channel') return (
    <div className={styles.fullscreenChannel}>
      <div className={styles.fsLeft}>
        {playing ? (
          <>
            <iframe
              className={styles.fsEmbed}
              src={`https://www.youtube.com/embed/${playing}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube player"
            />
            <button className={styles.closeBtn} onClick={() => setPlaying(null)}>X Fermer la video</button>
          </>
        ) : (
          <div className={styles.fsPlaceholder}>
            <span className={styles.ytLogoLg}>▶</span>
            <p className={styles.fsPlaceholderText}>Selectionnez une video</p>
            <p className={styles.channelName}>{data.channelName}</p>
          </div>
        )}
      </div>
      <div className={styles.fsRight}>
        <div className={styles.fsChannelHeader}>
          <span className={styles.ytLogo}>▶</span>
          <span className={styles.channelName}>{data.channelName}</span>
          <a href={`https://youtube.com/channel/${data.channelId}`} target="_blank" rel="noreferrer" className={styles.extLink}>
            <ExternalLink size={13} />
          </a>
        </div>
        <div className={styles.fsVideoList}>
          {data.videos.map(v => (
            <VideoRow key={v.id} video={v} active={playing === v.id} onClick={() => setPlaying(v.id)} />
          ))}
        </div>
      </div>
    </div>
  )
  return null
}

export function YoutubeWidget({ widget, mode, onFullscreen }) {
  return (
    <WidgetShell widget={widget} mode={mode} onFullscreen={onFullscreen}>
      {mode === 'grid'       && <YoutubeGrid widget={widget} />}
      {mode === 'focus'      && <YoutubeFocus widget={widget} />}
      {mode === 'fullscreen' && <YoutubeFullscreen widget={widget} />}
    </WidgetShell>
  )
}