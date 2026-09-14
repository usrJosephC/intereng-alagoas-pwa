"use client";

import { useState } from "react";
import { inputClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import type { PostData } from "./post-card";

export function PostComposer({ onCreated }: { onCreated: (post: PostData) => void }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível publicar.");
      onCreated(data.post);
      setContent("");
      setImageUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Compartilhe algo com a torcida do InterEng..."
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Link de uma foto (opcional)"
        className={inputClass}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
