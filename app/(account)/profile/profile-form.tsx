"use client";

import { compressImage } from "@/lib/image-compress";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Loader2, Trash2 } from "lucide-react";

import AvatarCropper from "@/app/components/avatar-cropper";
import { updateProfile } from "@/app/account-actions";
import type { FormState } from "@/app/(account)/client/actions";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

export default function ProfileForm({
  initial,
  between,
}: {
  between?: React.ReactNode;
  initial: { fullName: string; email: string; phone: string; company: string; bio: string; avatarUrl: string | null };
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const [avatar, setAvatar] = useState(initial.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [bioLength, setBioLength] = useState(initial.bio.length);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
  }, [cropSrc]);

  async function pick(original: File) {
    setAvatarError(null);
    if (!original.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      // Shrink huge photos first so the editor stays smooth on phones.
      const file = await compressImage(original, { maxEdge: 2000, targetBytes: 1.5 * 1024 * 1024 });
      setCropSrc(URL.createObjectURL(file));
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Couldn't open that image.");
    } finally {
      setUploading(false);
    }
  }
  const errors = state.fieldErrors ?? {};

  async function upload(file: File) {
    setAvatarError(null);
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/account/avatar", { method: "POST", body: data });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      throw new Error(json.error ?? "Upload failed. Please try again.");
    }
    setAvatar(json.url);
    setCropSrc(null);
    router.refresh();
  }

  async function removeAvatar() {
    setUploading(true);
    await fetch("/api/account/avatar", { method: "DELETE" });
    setUploading(false);
    setAvatar(null);
    router.refresh();
  }

  const initials = (initial.fullName || initial.email).slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
          className="group relative rounded-full"
        >
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-3xl font-semibold text-neutral-600 ring-4 ring-white shadow">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Your profile photo" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral-950 text-white shadow transition group-hover:scale-110">
              <Camera className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
        <div>
          <p className="text-sm font-semibold text-neutral-950">Profile photo</p>
          <p className="mt-1 text-xs text-neutral-500">JPG, PNG or WebP — any size. Crop, zoom, rotate and flip before saving.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-neutral-950 px-4 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              <Camera className="h-3.5 w-3.5" /> {avatar ? "Change photo" : "Upload photo"}
            </button>
            {avatar && (
              <button
                type="button"
                disabled={uploading}
                onClick={removeAvatar}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          {avatarError && <p className="mt-2 text-xs text-red-600">{avatarError}</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pick(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {cropSrc && <AvatarCropper src={cropSrc} onCancel={() => setCropSrc(null)} onSave={upload} />}

      {between}

      <form action={action} className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName}>
            <input name="fullName" defaultValue={initial.fullName} required maxLength={100} className={`${inputClass} h-11`} />
          </Field>
          <Field label="Email" hint="Change it in Settings">
            <input value={initial.email} disabled className={`${inputClass} h-11 bg-neutral-50 text-neutral-500`} />
          </Field>
          <Field label="Phone" error={errors.phone} hint="Only visible to our team">
            <input name="phone" type="tel" defaultValue={initial.phone} maxLength={30} placeholder="+880…" className={`${inputClass} h-11`} />
          </Field>
          <Field label="Organisation" error={errors.company}>
            <input name="company" defaultValue={initial.company} maxLength={120} className={`${inputClass} h-11`} />
          </Field>
        </div>
        <Field label="About you" error={errors.bio} hint={`${bioLength}/500`}>
          <textarea
            name="bio"
            rows={4}
            maxLength={500}
            defaultValue={initial.bio}
            onChange={(e) => setBioLength(e.target.value.length)}
            className={`${inputClass} py-3 leading-6`}
          />
        </Field>
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          {state.ok && !pending && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Profile saved
            </p>
          )}
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-neutral-800">
          {label}
          {hint && <span className="text-xs font-normal text-neutral-400">{hint}</span>}
        </span>
        {children}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
