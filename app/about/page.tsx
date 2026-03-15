export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold tracking-tight mb-8">
        About
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          Welcome to PureBlog. This is a minimal blog focused on clean writing
          and clear thinking.
        </p>
        <p>
          Feel free to reach out via the <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
