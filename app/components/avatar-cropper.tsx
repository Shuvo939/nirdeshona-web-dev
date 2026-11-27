"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { FlipHorizontal2, Loader2, RotateCcw, RotateCw, Undo2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

const OUTPUT_SIZE = 640;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = src;
  });
}

/** Draws the rotated/flipped image, then cuts out the selected square. */
async function cropToBlob(src: string, area: Area, rotation: number, flip: boolean): Promise<Blob> {
  const img = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boxW = img.width * cos + img.height * sin;
  const boxH = img.width * sin + img.height * cos;

  const stage = document.createElement("canvas");
  stage.width = Math.round(boxW);
  stage.height = Math.round(boxH);
  const sctx = stage.getContext("2d");
  if (!sctx) throw new Error("Your browser can't edit images.");
  sctx.translate(boxW / 2, boxH / 2);
  sctx.rotate(rad);
  sctx.scale(flip ? -1 : 1, 1);
  sctx.drawImage(img, -img.width / 2, -img.height / 2);

  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Your browser can't edit images.");
  octx.fillStyle = "#ffffff";
  octx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  octx.imageSmoothingQuality = "high";
  octx.drawImage(stage, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return new Promise((resolve, reject) =>
    out.toBlob(
      (blob) => (blob ? resolve(blob) : out.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't save the image."))), "image/jpeg", 0.92)),
      "image/webp",
      0.92,
    ),
  );
}

const CROP_ERRORS_BN: Record<string, string> = {
  "Couldn't read that image.": "ছবিটি পড়া যায়নি।",
  "Your browser can't edit images.": "আপনার ব্রাউজারে ছবি এডিট করা যায় না।",
  "Couldn't save the image.": "ছবিটি সেভ করা যায়নি।",
};

export default function AvatarCropper({
  src,
  onCancel,
  onSave,
}: {
  src: string;
  onCancel: () => void;
  onSave: (file: File) => Promise<void> | void;
}) {
  const { L, num, bn } = useI18n();
  const tmLocal = (m: string) => (bn ? CROP_ERRORS_BN[m] ?? m : m);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onCancel();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel, saving]);

  const turn = (deg: number) => setRotation((r) => {
    const next = (((r + deg) % 360) + 540) % 360 - 180; // keep in -180..180
    return next;
  });

  function reset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip(false);
  }

  async function save() {
    if (!area) return;
    setSaving(true);
    setError(null);
    try {
      const blob = await cropToBlob(src, area, rotation, flip);
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      await onSave(new File([blob], `avatar.${ext}`, { type: blob.type }));
    } catch (e) {
      setError(e instanceof Error ? tmLocal(e.message) : L("Couldn't save the image.", "ছবিটি সেভ করা যায়নি।"));
      setSaving(false);
    }
  }

  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-scrim/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 id="crop-title" className="text-base font-semibold text-neutral-950">
            {L("Edit profile photo", "প্রোফাইল ছবি এডিট করুন")}
          </h2>
          <button type="button" onClick={onCancel} disabled={saving} aria-label={L("Close", "বন্ধ করুন")} className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[min(60vh,380px)] w-full shrink-0 bg-neutral-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid
            minZoom={1}
            maxZoom={4}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flip ? -1 : 1})`}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <button type="button" aria-label={L("Zoom out", "ছোট করুন")} onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))} className="text-neutral-500 hover:text-neutral-950">
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label={L("Zoom", "জুম")}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-neutral-950"
            />
            <button type="button" aria-label={L("Zoom in", "বড় করুন")} onClick={() => setZoom((z) => Math.min(4, +(z + 0.2).toFixed(2)))} className="text-neutral-500 hover:text-neutral-950">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium text-neutral-500">{L("Straighten", "সোজা করুন")}</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              aria-label={L("Rotation angle", "ঘোরানোর কোণ")}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-neutral-950"
            />
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-neutral-600">{num(rotation)}°</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => turn(-90)} aria-label={L("Rotate left", "বাঁয়ে ঘোরান")} title={L("Rotate left", "বাঁয়ে ঘোরান")} className={iconBtn}>
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => turn(90)} aria-label={L("Rotate right", "ডানে ঘোরান")} title={L("Rotate right", "ডানে ঘোরান")} className={iconBtn}>
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlip((f) => !f)}
              aria-label={L("Flip horizontally", "আড়াআড়ি উল্টান")}
              aria-pressed={flip}
              title={L("Flip", "উল্টান")}
              className={`${iconBtn} ${flip ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : ""}`}
            >
              <FlipHorizontal2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={reset} aria-label={L("Reset", "রিসেট")} title={L("Reset", "রিসেট")} className={iconBtn}>
              <Undo2 className="h-4 w-4" />
            </button>
          </div>

          <p className="text-center text-xs text-neutral-400">{L("Drag to reposition · pinch or scroll to zoom", "সরাতে টানুন · জুম করতে পিঞ্চ বা স্ক্রল করুন")}</p>
          {error && <p className="text-center text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-11 flex-1 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            {L("Cancel", "বাতিল")}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !area}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? L("Saving…", "সেভ হচ্ছে…") : L("Save photo", "ছবি সেভ করুন")}
          </button>
        </div>
      </div>
    </div>
  );
}
