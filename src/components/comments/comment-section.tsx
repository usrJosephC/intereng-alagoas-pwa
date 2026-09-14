"use client";

import { useState } from "react";
import Link from "next/link";
import { inputClass } from "@/lib/ui";

export type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
};

export function CommentSection({
  apiUrl,
  initialComments,
  loggedIn,
  canModerate,
}: {
  apiUrl: string;
  initialComments: CommentData[];
  loggedIn: boolean;
  canModerate: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível comentar.");
      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível comentar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apagar este comentário?")) return;
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="steel-border rounded-sm bg-surface-elevated p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                {comment.author.name}
              </p>
              {canModerate && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-[11px] font-semibold uppercase text-danger hover:opacity-80"
                >
                  Apagar
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground">{comment.content}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted">Ninguém comentou ainda. Seja o primeiro!</p>
        )}
      </ul>

      {loggedIn ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          {error && <p className="text-xs text-danger sm:hidden">{error}</p>}
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] shrink-0 rounded-sm bg-gold px-4 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-50"
          >
            Comentar
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/login" className="font-semibold text-gold hover:text-gold-soft">
            Entre
          </Link>{" "}
          para comentar.
        </p>
      )}
    </div>
  );
}
