"use client"

import React, { useCallback, useRef, useState, useEffect } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import { DragDropContext, Droppable, Draggable, type DropResult, type DraggableProvided, type DraggableStateSnapshot, type DroppableProvided } from "@hello-pangea/dnd"
import "react-image-crop/dist/ReactCrop.css"
import {
  GripVertical,
  ImagePlus,
  Star,
  StarOff,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type PhotoItem = {
  id: string
  dataUrl: string
  croppedDataUrl: string
  isPrimary: boolean
  blurForBasic: boolean
}

type Props = {
  photos: PhotoItem[]
  onChange: (photos: PhotoItem[]) => void
  lang?: "ta" | "en"
  errors?: string | null
}

const MAX_PHOTOS = 5
const MAX_SIZE_MB = 5

const MESSAGES = {
  ta: {
    maxPhotos: `அதிகபட்சம் ${MAX_PHOTOS} படங்கள் மட்டுமே சேர்க்கலாம்`,
    maxSize: `ஒவ்வொரு படமும் ${MAX_SIZE_MB}MB-க்கு உட்பட்டதாக இருக்க வேண்டும்`,
    typeErr: "JPEG அல்லது PNG படங்கள் மட்டுமே அனுமதிக்கப்படும்",
    atLeastOne: "குறைந்தது 1 படம் சேர்க்கவும்",
    blurLabel: "Gold members மட்டுமே காண்பார்கள்",
    primaryLabel: "முதன்மை படம்",
    addPhoto: "படம் சேர்க்கவும்",
    cropTitle: "படத்தை வெட்டவும் (4:3)",
    cropApply: "பயன்படுத்து",
    cropCancel: "ரத்து",
    instruction: `${MAX_PHOTOS} படங்கள் வரை சேர்க்கலாம் · JPEG / PNG · ${MAX_SIZE_MB}MB வரை`,
  },
  en: {
    maxPhotos: `You can upload a maximum of ${MAX_PHOTOS} photos`,
    maxSize: `Each photo must be under ${MAX_SIZE_MB}MB`,
    typeErr: "Only JPEG or PNG files are allowed",
    atLeastOne: "Please add at least 1 photo",
    blurLabel: "Blur for non-Gold users",
    primaryLabel: "Primary photo",
    addPhoto: "Add Photo",
    cropTitle: "Crop photo (4:3)",
    cropApply: "Apply Crop",
    cropCancel: "Cancel",
    instruction: `Upload up to ${MAX_PHOTOS} photos · JPEG / PNG · Max ${MAX_SIZE_MB}MB each`,
  },
}

// ── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height)
}

async function getCroppedDataUrl(
  imgEl: HTMLImageElement,
  pixelCrop: PixelCrop
): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    imgEl,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )
  return canvas.toDataURL("image/jpeg", 0.88)
}

// ── CropModal ────────────────────────────────────────────────────────────────

type CropModalProps = {
  src: string
  onApply: (croppedDataUrl: string) => void
  onCancel: () => void
  lang: "ta" | "en"
}

function CropModal({ src, onApply, onCancel, lang }: CropModalProps) {
  const m = MESSAGES[lang]
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 4 / 3))
  }

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current) return
    const url = await getCroppedDataUrl(imgRef.current, completedCrop)
    onApply(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <h3 className="font-serif text-base font-semibold text-foreground">{m.cropTitle}</h3>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">4:3</span>
        </div>

        {/* Crop Area */}
        <div className="flex justify-center px-6 max-h-[55vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={4 / 3}
            minWidth={60}
            minHeight={45}
            ruleOfThirds
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full object-contain"
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary"
          >
            {m.cropCancel}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {m.cropApply}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PhotoCard ────────────────────────────────────────────────────────────────

type PhotoCardProps = {
  photo: PhotoItem
  index: number
  lang: "ta" | "en"
  onTogglePrimary: (id: string) => void
  onToggleBlur: (id: string) => void
  onRemove: (id: string) => void
}

function PhotoCard({ photo, index, lang, onTogglePrimary, onToggleBlur, onRemove }: PhotoCardProps) {
  const m = MESSAGES[lang]

  return (
    <Draggable draggableId={photo.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all",
            snapshot.isDragging && "shadow-2xl scale-[1.02] border-primary/50 bg-card/95"
          )}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="flex shrink-0 cursor-grab items-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Thumbnail */}
          <div className="relative shrink-0 h-20 w-[107px] overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.croppedDataUrl}
              alt={`Photo ${index + 1}`}
              className={cn("h-full w-full object-cover transition-all", photo.blurForBasic && "blur-xs")}
            />
            {photo.isPrimary && (
              <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                <Star className="h-2.5 w-2.5 fill-white" /> 1st
              </div>
            )}
            {photo.blurForBasic && (
              <div className="absolute bottom-1 right-1 rounded-full bg-black/60 p-1">
                <Crown className="h-3 w-3 text-yellow-400" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-1 flex-col gap-2">
            {/* Primary toggle */}
            <button
              type="button"
              onClick={() => onTogglePrimary(photo.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                photo.isPrimary
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              )}
            >
              {photo.isPrimary ? (
                <Star className="h-3.5 w-3.5 fill-primary" />
              ) : (
                <StarOff className="h-3.5 w-3.5" />
              )}
              {m.primaryLabel}
            </button>

            {/* Blur toggle */}
            <button
              type="button"
              onClick={() => onToggleBlur(photo.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                photo.blurForBasic
                  ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              )}
            >
              {photo.blurForBasic ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {m.blurLabel}
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            aria-label="Remove photo"
            className="ml-1 flex shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition-all hover:border-red-400 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </Draggable>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function PhotoUploadStep({ photos, onChange, lang = "ta", errors }: Props) {
  const m = MESSAGES[lang]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  // Strict mode double-render fix for react-beautiful-dnd
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEnabled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    setLocalError(null)

    if (photos.length >= MAX_PHOTOS) {
      setLocalError(m.maxPhotos)
      return
    }

    const file = files[0]
    if (!file) return

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLocalError(m.typeErr)
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(m.maxSize)
      return
    }

    const reader = new FileReader()
    reader.onload = () => setPendingSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCropApply = (croppedDataUrl: string) => {
    const newPhoto: PhotoItem = {
      id: uid(),
      dataUrl: pendingSrc!,
      croppedDataUrl,
      isPrimary: photos.length === 0, // First uploaded = primary
      blurForBasic: true, // default ON
    }
    onChange([...photos, newPhoto])
    setPendingSrc(null)
  }

  const handleCropCancel = () => setPendingSrc(null)

  const handleTogglePrimary = useCallback(
    (id: string) => {
      onChange(photos.map((p) => ({ ...p, isPrimary: p.id === id })))
    },
    [photos, onChange]
  )

  const handleToggleBlur = useCallback(
    (id: string) => {
      onChange(photos.map((p) => (p.id === id ? { ...p, blurForBasic: !p.blurForBasic } : p)))
    },
    [photos, onChange]
  )

  const handleRemove = useCallback(
    (id: string) => {
      const next = photos.filter((p) => p.id !== id)
      // Ensure there's still a primary
      if (next.length > 0 && !next.some((p) => p.isPrimary)) {
        next[0].isPrimary = true
      }
      onChange(next)
    },
    [photos, onChange]
  )

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(photos)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    onChange(items)
  }

  const displayError = errors ?? localError

  return (
    <div className="space-y-6">
      {/* Header note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
        <Crown className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/70 font-tamil leading-relaxed">{m.instruction}</p>
      </div>

      {/* Error */}
      {displayError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 font-tamil dark:text-red-400">{displayError}</p>
        </div>
      )}

      {/* Photo list (drag & drop) */}
      {enabled && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="photos-list">
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-3"
              >
                {photos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    lang={lang}
                    onTogglePrimary={handleTogglePrimary}
                    onToggleBlur={handleToggleBlur}
                    onRemove={handleRemove}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/20 py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ImagePlus className="h-6 w-6 text-primary" />
          </div>
          <p className="font-tamil text-sm text-muted-foreground">
            {lang === "ta" ? "இன்னும் படங்கள் சேர்க்கவில்லை" : "No photos uploaded yet"}
          </p>
        </div>
      )}

      {/* Add Photo Button */}
      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/10 active:scale-[0.98]"
        >
          <ImagePlus className="h-5 w-5" />
          {m.addPhoto}
          <span className="text-xs font-normal text-muted-foreground">
            ({photos.length}/{MAX_PHOTOS})
          </span>
        </button>
      )}

      {/* Success checkmarks */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-xs text-emerald-600 font-tamil dark:text-emerald-400">
            {lang === "ta"
              ? `${photos.length} படம் சேர்க்கப்பட்டது`
              : `${photos.length} photo${photos.length > 1 ? "s" : ""} added`}
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Crop Modal */}
      {pendingSrc && (
        <CropModal
          src={pendingSrc}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
          lang={lang}
        />
      )}
    </div>
  )
}
