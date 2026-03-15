export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to PureBlog
        </h1>
        <p className="text-muted-foreground text-lg">
          Thoughts on technology, design, and everything in between.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-8">Recent Posts</h2>
        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground">No posts yet.</p>
        </div>
      </section>
    </div>
  );
}
