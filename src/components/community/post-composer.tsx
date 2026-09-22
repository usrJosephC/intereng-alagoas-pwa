"use client";

import { useState } from "react";
import { inputClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import type { PostData } from "./post-card";

export function PostComposer({ onCreated }: { onCreated: (post: PostData) => void }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/posts/photo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar a foto.");
      setImageUrl(data.imageUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }

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
      {imageUrl && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="max-h-48 w-full rounded-sm border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="absolute right-2 top-2 rounded-sm bg-surface/90 px-2 py-1 text-xs font-semibold text-danger"
          >
            Remover
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        disabled={uploadingPhoto}
        className={inputClass}
      />
      {uploadingPhoto && <p className="text-xs text-muted">Enviando foto...</p>}
      {photoError && <p className="text-xs text-danger">{photoError}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
