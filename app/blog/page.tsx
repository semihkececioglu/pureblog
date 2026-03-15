export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-muted-foreground">All posts, sorted by date.</p>
      </section>

      <div className="flex flex-col gap-8">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    </div>
  );
}
