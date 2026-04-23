"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2 } from "lucide-react"

export type SlideshowPhoto = {
  url: string
  is_primary?: boolean
  label?: string
}

type Props = {
  photos: SlideshowPhoto[]
  autoPlayMs?: number
  showThumbnails?: boolean
  showFullscreen?: boolean
  aspectRatio?: "4/3" | "3/4" | "1/1" | "16/9"
  className?: string
}

export function PhotoSlideshow({
  photos,
  autoPlayMs = 3500,
  showThumbnails = true,
  showFullscreen = true,
  aspectRatio = "4/3",
  className = "",
}: Props) {
  const [curr, setCurr] = useState(0)
  const [visible, setVisible] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressKey = useRef(0)

  // Animated slide change — fade out → swap → fade in
  const goTo = useCallback((idx: number) => {
    if (idx === curr) return
    setVisible(false)
    setTimeout(() => {
      setCurr(idx)
      progressKey.current += 1
      setVisible(true)
    }, 220)
  }, [curr])

  const prev = useCallback(() => goTo((curr - 1 + photos.length) % photos.length), [curr, photos.length, goTo])
  const next = useCallback(() => goTo((curr + 1) % photos.length), [curr, photos.length, goTo])

  // Auto-play timer
  useEffect(() => {
    if (!playing || photos.length <= 1) return
    timerRef.current = setTimeout(next, autoPlayMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, curr, autoPlayMs, next, photos.length])

  // Keyboard: arrows to navigate, Space to play/pause, Escape to exit fullscreen
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev() }
      if (e.key === "ArrowRight") { e.preventDefault(); next() }
      if (e.key === " ")          { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === "Escape")     setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev, next])

  // Touch swipe
  const touchStartX = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  if (photos.length === 0) return null

  const photo = photos[curr]
  const aspectClass: Record<string, string> = {
    "4/3": "aspect-[4/3]", "3/4": "aspect-[3/4]", "1/1": "aspect-square", "16/9": "aspect-video",
  }

  // Shared slide content (used in both embedded and fullscreen)
  function SlideImage({ cover = false }: { cover?: boolean }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.url}
        alt={photo.label ?? `Photo ${curr + 1}`}
        className={`h-full w-full transition-opacity duration-[220ms] ${visible ? "opacity-100" : "opacity-0"} ${cover ? "object-cover" : "object-contain"}`}
      />
    )
  }

  function Controls({ dark = false }: { dark?: boolean }) {
    const btn = dark
      ? "bg-white/10 text-white hover:bg-white/20"
      : "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60"
    return (
      <>
        {/* Prev */}
        {photos.length > 1 && (
          <button onClick={prev}
            className={`absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition ${btn}`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {/* Next */}
        {photos.length > 1 && (
          <button onClick={next}
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition ${btn}`}>
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </>
    )
  }

  function TopBar({ dark = false }: { dark?: boolean }) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dark ? "bg-white/20 text-white" : "bg-black/50 backdrop-blur-sm text-white"}`}>
          {curr + 1} / {photos.length}
        </span>
        {photos.length > 1 && (
          <button onClick={() => setPlaying(p => !p)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${dark ? "bg-white/20 text-white hover:bg-white/30" : "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"}`}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
          </button>
        )}
        {showFullscreen && !dark && (
          <button onClick={() => setFullscreen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}
        {dark && (
          <button onClick={() => setFullscreen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg leading-none">
            ✕
          </button>
        )}
      </div>
    )
  }

  function Dots() {
    return (
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {photos.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === curr ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    )
  }

  function ProgressBar() {
    if (!playing || photos.length <= 1) return null
    return (
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-10">
        <div
          key={`${curr}-${progressKey.current}`}
          className="h-full bg-white/80 rounded-full"
          style={{ animation: `slideshow-progress ${autoPlayMs}ms linear` }}
        />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes slideshow-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>

      <div className={`flex flex-col gap-3 ${className}`}>
        {/* ── Main stage ── */}
        <div
          className={`group relative w-full ${aspectClass[aspectRatio]} overflow-hidden rounded-2xl bg-black shadow-lg`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <SlideImage cover />

          {/* Top-left badge */}
          {photo.is_primary && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold text-white pointer-events-none">
              Primary
            </span>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-[1]" />

          <TopBar />
          <Controls />
          {photos.length > 1 && <Dots />}
          <ProgressBar />
        </div>

        {/* ── Thumbnail strip ── */}
        {showThumbnails && photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {photos.map((ph, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`relative shrink-0 h-[52px] w-[52px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === curr
                    ? "border-primary shadow-md scale-105"
                    : "border-transparent opacity-55 hover:opacity-90 hover:border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.url} alt="" className="h-full w-full object-cover" />
                {ph.is_primary && (
                  <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-[7px] font-bold text-white text-center py-px leading-none">★</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen lightbox ── */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <div
            className={`group relative max-w-[92vw] max-h-[92vh] w-full flex flex-col items-center gap-4`}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Image */}
            <div className="relative w-full max-h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.label ?? `Photo ${curr + 1}`}
                className={`max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl transition-opacity duration-[220ms] ${visible ? "opacity-100" : "opacity-0"}`}
              />

              {/* Overlay controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">{curr + 1} / {photos.length}</span>
                {photos.length > 1 && (
                  <button onClick={() => setPlaying(p => !p)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition">
                    {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
                  </button>
                )}
                <button onClick={() => setFullscreen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition text-base leading-none">
                  ✕
                </button>
              </div>

              {photo.is_primary && (
                <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold text-white">Primary</span>
              )}

              {photos.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Progress bar */}
              {playing && photos.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 rounded-full overflow-hidden">
                  <div key={`fs-${curr}-${progressKey.current}`} className="h-full bg-white/70"
                    style={{ animation: `slideshow-progress ${autoPlayMs}ms linear` }} />
                </div>
              )}
            </div>

            {/* Thumbnail strip in fullscreen */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
                {photos.map((ph, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`relative shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                      i === curr ? "border-white scale-110 shadow-lg" : "border-white/25 opacity-55 hover:opacity-90"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.url} alt="" className="h-full w-full object-cover" />
                    {ph.is_primary && (
                      <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-[7px] font-bold text-white text-center py-px">★</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
