import { PostCard } from "./PostCard";
import { Badge } from "@/components/ui/badge";

export const PostsGallery = ({ posts, title = "Previously Generated Posts" }) => {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 px-4 animate-fade-in">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <Badge variant="outline" className="border-primary/20 text-primary">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};
