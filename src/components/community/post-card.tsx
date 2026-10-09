"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { CommentSection, type CommentData } from "@/components/comments/comment-section";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FeedbackMessage } from "@/components/ui/feedback-message";

export type PostData = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  likeCount: number;
  likedByMe: boolean;
  comments: CommentData[];
};

export function PostCard({
  post,
  loggedIn,
  canModerate,
  currentUserId,
  onDeleted,
}: {
  post: PostData;
  loggedIn: boolean;
  canModerate: boolean;
  currentUserId: string | null;
  onDeleted: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function toggleLike() {
    if (!loggedIn) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.count);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Não foi possível excluir o post.");
      onDeleted(post.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Não foi possível excluir o post.");
      setDeleting(false);
    }
  }

  return (
    <article className="steel-border rounded-sm bg-surface p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/atletas/${post.author.id}`}
          className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-gold hover:text-gold-soft"
        >
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} className="h-7 w-7" />
          {post.author.name}
        </Link>
        {(canModerate || post.author.id === currentUserId) && (
          <button
            onClick={() => setConfirmingDelete(true)}
            disabled={deleting}
            className="text-[11px] font-semibold uppercase text-danger hover:opacity-80"
          >
            {deleting ? "Excluindo..." : "Apagar"}
          </button>
        )}
      </div>
      {confirmingDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-foreground">
          <span>Excluir este post?</span>
          <button type="button" onClick={handleDelete} disabled={deleting} className="font-semibold text-danger disabled:opacity-50">
            {deleting ? "Excluindo..." : "Confirmar exclusão"}
          </button>
          <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting} className="text-muted underline disabled:opacity-50">
            Cancelar
          </button>
        </div>
      )}
      {deleting && <FeedbackMessage tone="loading">Excluindo post...</FeedbackMessage>}
      {deleteError && <FeedbackMessage tone="error">{deleteError}</FeedbackMessage>}

      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{post.content}</p>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mt-3 max-h-96 w-full rounded-sm border border-border object-cover"
        />
      )}

      <div className="mt-3 flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-muted">
        <button
          onClick={toggleLike}
          disabled={!loggedIn}
          className={clsx(
            "flex items-center gap-1 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50",
            liked && "text-gold"
          )}
        >
          {liked ? "★ Curtido" : "☆ Curtir"} · {likeCount}
        </button>
        <button onClick={() => setShowComments((s) => !s)} className="hover:text-gold">
          Comentários · {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-border pt-3">
          <CommentSection
            apiUrl={`/api/posts/${post.id}/comments`}
            initialComments={post.comments}
            loggedIn={loggedIn}
            canModerate={canModerate}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </article>
  );
}
