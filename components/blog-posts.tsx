import { PostsView } from "@/components/posts-view";
import { Pagination } from "@/components/pagination";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import "@/models/Category";
import { IPost, ICategory } from "@/types";

const POSTS_PER_PAGE = 6;

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { publishedAt: -1 },
  oldest: { publishedAt: 1 },
  popular: { views: -1 },
};

async function getPosts(
  page: number,
  category: string,
  sort: string,
  search: string
) {
  await connectDB();
  const skip = (page - 1) * POSTS_PER_PAGE;
  const sortOrder = SORT_MAP[sort] ?? SORT_MAP.newest;

  const filter: Record<string, unknown> = { status: "published" };

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) filter.category = (cat as { _id: unknown })._id;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort(sortOrder)
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

interface BlogPostsProps {
  page: number;
  category: string;
  sort: string;
  search: string;
  view: "grid" | "list";
}

export async function BlogPosts({
  page,
  category,
  sort,
  search,
  view,
}: BlogPostsProps) {
  const { posts, total } = await getPosts(page, category, sort, search);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (search) params.set("search", search);
    if (view !== "grid") params.set("view", view);
    return `/blog?${params.toString()}`;
  };

  return (
    <>
      {posts.length === 0 ? (
        <p className="text-muted-foreground col-span-2">No posts found.</p>
      ) : (
        <PostsView posts={posts} />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={buildPageHref}
      />
    </>
  );
}
