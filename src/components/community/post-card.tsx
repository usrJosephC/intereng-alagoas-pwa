"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { CommentSection, type CommentData } from "@/components/comments/comment-section";

export type PostData = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string };
  likeCount: number;
  likedByMe: boolean;
  comments: CommentData[];
};

export function PostCard({
  post,
  loggedIn,
  canModerate,
  onDeleted,
}: {
  post: PostData;
  loggedIn: boolean;
  canModerate: boolean;
  onDeleted: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);

  async function toggleLike() {
    if (!loggedIn) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.count);
  }

  async function handleDelete() {
    if (!confirm("Apagar este post?")) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(post.id);
  }

  return (
    <article className="steel-border rounded-sm bg-surface p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/atletas/${post.author.id}`}
          className="font-heading text-sm font-semibold uppercase tracking-wide text-gold hover:text-gold-soft"
        >
          {post.author.name}
        </Link>
        {canModerate && (
          <button
            onClick={handleDelete}
            className="text-[11px] font-semibold uppercase text-danger hover:opacity-80"
          >
            Apagar
          </button>
        )}
      </div>

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
          />
        </div>
      )}
    </article>
  );
}
