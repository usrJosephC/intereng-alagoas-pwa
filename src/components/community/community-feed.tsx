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

      {posts.length === 0 ? (
        <p className="steel-border rounded-sm bg-surface p-4 text-sm text-muted">
          Nenhum post ainda. Comece a conversa!
        </p>
      ) : (
        // Masonry via CSS columns: cada card entra na coluna mais curta e não
        // se quebra ao meio, então funciona bem com posts de altura variável
        // (com/sem imagem, comentários abertos) sem precisar medir nada em JS.
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {posts.map((post) => (
            <div key={post.id} className="mb-4 break-inside-avoid">
              <PostCard
                post={post}
                loggedIn={loggedIn}
                canModerate={canModerate}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
