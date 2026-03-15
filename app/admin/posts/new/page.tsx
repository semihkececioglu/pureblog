import { PostForm } from "../post-form";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        New Post
      </h1>
      <PostForm />
    </div>
  );
}
