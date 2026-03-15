import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Admin Login</h1>
        <LoginForm />
      </div>
    </main>
  );
}
