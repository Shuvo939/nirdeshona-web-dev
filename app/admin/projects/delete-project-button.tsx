"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

type Props = {
  projectId: string;
  projectTitle: string;
  deleteAction: (id: string) => Promise<void>;
};

export default function DeleteProjectButton({
  projectId,
  projectTitle,
  deleteAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;

    try {
      setDeleting(true);
      await deleteAction(projectId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Delete button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      {/* Confirmation modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
          onMouseDown={() => {
            if (!deleting) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-5">
              <h2
                id="delete-project-title"
                className="text-lg font-semibold tracking-tight text-neutral-950"
              >
                Delete project?
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                This moves{" "}
                <span className="font-semibold text-neutral-900">
                  {projectTitle}
                </span>{" "}
                to the bin.
              </p>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs leading-5 text-red-700">
                  You can restore it — with its media and technologies — from
                  the bin for 30 days. After that it is deleted forever.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}