"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { deletePost } from "./actions";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  published_at: string | null;
};

type Filter = "all" | "published" | "draft" | "archived";

export default function PostsTable({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostRow | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return posts.filter((post) => {
      const status = post.status.toLowerCase();
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && status === "published") ||
        (filter === "draft" && status === "draft") ||
        (filter === "archived" && status === "archived");

      if (!matchesFilter) return false;
      if (!q) return true;

      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, query, filter]);

  function openDeleteDialog(post: PostRow) {
    if (deletingId) return;
    setDeleteError("");
    setPostToDelete(post);
  }

  function closeDeleteDialog() {
    if (deletingId) return;
    setPostToDelete(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!postToDelete || deletingId) return;

    try {
      setDeleteError("");
      setDeletingId(postToDelete.id);
      await deletePost(postToDelete.id);
      setPostToDelete(null);
      setDeletingId(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the post."
      );
      setDeletingId(null);
    }
  }

  return (
    <>
      <div>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-neutral-200 bg-neutral-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              aria-label="Search posts"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            />
          </div>

          <div className="flex overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              ["all", "All"],
              ["published", "Published"],
              ["draft", "Drafts"],
              ["archived", "Archived"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value as Filter)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === value
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <p className="text-xs text-neutral-400">
            Showing{" "}
            <span className="font-semibold text-neutral-700">
              {filteredPosts.length}
            </span>{" "}
            {filteredPosts.length === 1 ? "post" : "posts"}
          </p>

          {(query || filter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Empty */}
        {filteredPosts.length === 0 ? (
          <div className="border-t border-neutral-200 px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-neutral-950">
              No posts found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-500">
              {query
                ? "Try a different search term or clear the search."
                : "There are no posts matching this filter."}
            </p>

            {!query && filter === "all" && (
              <Link
                href="/admin/posts/new"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                Create your first post
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-t border-neutral-200 bg-neutral-50/60 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    <th className="px-5 py-3.5">Post</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Views</th>
                    <th className="px-4 py-3.5">Published</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="group border-t border-neutral-100 transition hover:bg-neutral-50/70"
                    >
                      <td className="max-w-[380px] px-5 py-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {post.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-neutral-400">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={post.status} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Eye className="h-4 w-4 text-neutral-400" />
                          {Number(post.views_count || 0).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-500">
                        {formatDate(post.published_at)}
                      </td>

                      <td className="px-5 py-4">
                        <PostActions
                          post={post}
                          deletingId={deletingId}
                          onDelete={openDeleteDialog}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-neutral-100 border-t border-neutral-200 md:hidden">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="p-4 transition hover:bg-neutral-50/70 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-neutral-950">
                            {post.title}
                          </h3>
                          <p className="mt-1 truncate text-xs text-neutral-400">
                            /{post.slug}
                          </p>
                        </div>

                        <StatusBadge status={post.status} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-700">
                        {Number(post.views_count || 0).toLocaleString()}
                      </span>
                      views
                    </span>

                    <span>
                      {post.published_at
                        ? formatDate(post.published_at)
                        : "Not published"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <PostActions
                      post={post}
                      deletingId={deletingId}
                      onDelete={openDeleteDialog}
                      mobile
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {postToDelete && (
        <DeleteConfirmationDialog
          post={postToDelete}
          deleting={deletingId === postToDelete.id}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const value = status.toLowerCase();

  const config =
    value === "published"
      ? {
          label: "Published",
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        }
      : value === "draft"
        ? {
            label: "Draft",
            className: "border-amber-200 bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
          }
        : value === "archived"
          ? {
              label: "Archived",
              className: "border-neutral-200 bg-neutral-100 text-neutral-600",
              dot: "bg-neutral-400",
            }
          : {
              label: status,
              className: "border-neutral-200 bg-neutral-50 text-neutral-600",
              dot: "bg-neutral-400",
            };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function PostActions({
  post,
  deletingId,
  onDelete,
  mobile = false,
}: {
  post: PostRow;
  deletingId: string | null;
  onDelete: (post: PostRow) => void;
  mobile?: boolean;
}) {
  const isDeleting = deletingId === post.id;
  const isPublished = post.status.toLowerCase() === "published";

  return (
    <div className="flex items-center justify-end gap-2">
      {isPublished && (
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 ${
            mobile ? "h-9 px-3 text-xs" : "px-2.5 py-1.5 text-xs"
          }`}
          title="View post"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      )}

      <Link
        href={`/admin/posts/${post.id}/edit`}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 ${
          mobile ? "h-9 px-3 text-xs" : "px-2.5 py-1.5 text-xs"
        }`}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Link>

      <button
        type="button"
        disabled={isDeleting}
        onClick={() => onDelete(post)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-red-100 font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 ${
          mobile ? "h-9 px-3 text-xs" : "px-2.5 py-1.5 text-xs"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

function DeleteConfirmationDialog({
  post,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  post: PostRow;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-post-title"
      aria-describedby="delete-post-description"
    >
      <button
        type="button"
        aria-label="Close confirmation dialog"
        onClick={onCancel}
        disabled={deleting}
        className="absolute inset-0 cursor-default bg-scrim/40 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="delete-post-title"
                className="text-base font-semibold text-neutral-950"
              >
                Delete post?
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                You can restore it from the bin for 30 days.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p
            id="delete-post-description"
            className="text-sm leading-6 text-neutral-600"
          >
            Move{" "}
            <span className="font-semibold text-neutral-950">
              “{post.title}”
            </span>{" "}
            and its comments to the bin?
          </p>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3">
            <p className="truncate text-xs font-medium text-neutral-700">
              /{post.slug}
            </p>

            <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-400">
              <span>
                {Number(post.views_count || 0).toLocaleString()} views
              </span>
              <span>•</span>
              <StatusBadge status={post.status} />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 bg-neutral-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}