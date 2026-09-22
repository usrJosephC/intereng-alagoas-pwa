import { prisma } from "@/lib/prisma";
import { CommunityFeed } from "@/components/community/community-feed";

export const metadata = { title: "Moderação da comunidade" };

export default async function AdminComunidadePage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      likes: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  const postsData = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likeCount: post.likes.length,
    likedByMe: false,
    comments: post.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Moderação da comunidade
      </h1>
      <p className="mt-1 text-sm text-muted">
        Apague posts e comentários que violem as regras do evento.
      </p>
      <div className="mt-6">
        <CommunityFeed initialPosts={postsData} loggedIn={false} canModerate />
      </div>
    </div>
  );
}
