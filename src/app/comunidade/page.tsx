import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CommunityFeed } from "@/components/community/community-feed";

export const metadata = { title: "Comunidade" };

export default async function ComunidadePage() {
  const session = await getSession();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true } },
      likes: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
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
    likedByMe: session ? post.likes.some((like) => like.userId === session.sub) : false,
    comments: post.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Comunidade
      </h1>
      <p className="mt-1 text-sm text-muted">Mural da torcida do InterEng Alagoas.</p>

      <div className="mt-6">
        <CommunityFeed
          initialPosts={postsData}
          loggedIn={!!session}
          canModerate={session?.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
