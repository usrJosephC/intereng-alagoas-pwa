"use client";

import { useState } from "react";
import { PostComposer } from "./post-composer";
import { PostCard, type PostData } from "./post-card";

export function CommunityFeed({
  initialPosts,
  loggedIn,
  canModerate,
}: {
  initialPosts: PostData[];
  loggedIn: boolean;
  canModerate: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <div className="space-y-4">
      {loggedIn ? (
        <PostComposer
          onCreated={(post) =>
            setPosts((prev) => [{ ...post, likeCount: 0, likedByMe: false, comments: [] }, ...prev])
          }
        />
      ) : (
        <p className="steel-border rounded-sm bg-surface p-4 text-sm text-muted">
          Entre para publicar, curtir e comentar no mural da torcida.
        </p>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            loggedIn={loggedIn}
            canModerate={canModerate}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))}
        {posts.length === 0 && (
          <p className="steel-border rounded-sm bg-surface p-4 text-sm text-muted">
            Nenhum post ainda. Comece a conversa!
          </p>
        )}
      </div>
    </div>
  );
}
