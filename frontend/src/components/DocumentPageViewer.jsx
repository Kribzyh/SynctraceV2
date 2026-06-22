import { useEffect } from 'react'
import './ComponentTraceModal.css'

export default function DocumentPageViewer({ pages, index, onClose, onChange }) {
  const current = pages[index]

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onChange(index - 1)
      if (event.key === 'ArrowRight' && index < pages.length - 1) onChange(index + 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, pages.length, onChange, onClose])

  if (!current) return null

  return (
    <div className="trace-image-viewer" onClick={onClose} role="presentation">
      <p className="trace-image-viewer__page">
        {current.type === 'code'
          ? current.filePath
          : `Page ${current.page} of ${current.totalPages}`}
      </p>
      <button type="button" className="trace-image-viewer__close" onClick={onClose} aria-label="Close document viewer">
        ×
      </button>
      {index > 0 ? (
        <button
          type="button"
          className="trace-image-viewer__nav trace-image-viewer__nav--prev"
          onClick={(event) => { event.stopPropagation(); onChange(index - 1) }}
          aria-label="Previous page"
        >
          ‹
        </button>
      ) : null}
      <div className="trace-image-viewer__frame" onClick={(event) => event.stopPropagation()}>
        <p className="trace-image-viewer__file">{current.fileLabel}</p>
        <div className="trace-image-viewer__page-wrap">
          {current.type === 'code' ? (
            <pre className="trace-image-viewer__code"><code>{current.content}</code></pre>
          ) : (
            <img src={current.src} alt={`${current.imageLabel} — ${current.ref}`} />
          )}
        </div>
        <p className="trace-image-viewer__caption">
          {current.imageLabel} — {current.ref}
        </p>
      </div>
      {index < pages.length - 1 ? (
        <button
          type="button"
          className="trace-image-viewer__nav trace-image-viewer__nav--next"
          onClick={(event) => { event.stopPropagation(); onChange(index + 1) }}
          aria-label="Next page"
        >
          ›
        </button>
      ) : null}
    </div>
  )
}
