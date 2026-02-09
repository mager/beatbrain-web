import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const SignIn: React.FC = () => {
  const router = useRouter();
  const callbackUrl = (router.query.callbackUrl as string) || "/";
  const errorParam = router.query.error as string | undefined;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(errorParam || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(mode === "signup" ? "Account created but login failed. Try signing in." : "Invalid email or password");
      if (mode === "signup") setMode("signin");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl">
            <span className="text-accent text-glow-accent">beat</span>
            <span className="text-white">brain</span>
            <span className="text-warm animate-blink font-mono ml-0.5">_</span>
          </h1>
        </div>

        {/* Card */}
        <div className="border border-terminal-border bg-terminal-surface rounded p-6">
          {/* Toggle */}
          <div className="flex gap-4 mb-6 font-mono text-xs border-b border-terminal-border pb-3">
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`transition-colors duration-200 ${mode === "signin" ? "text-accent" : "text-phosphor-dim hover:text-phosphor"}`}
            >
              sign in
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`transition-colors duration-200 ${mode === "signup" ? "text-accent" : "text-phosphor-dim hover:text-phosphor"}`}
            >
              create account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 border border-warm/30 bg-warm/5 rounded font-mono text-[11px] text-warm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block font-mono text-[10px] text-phosphor-dim uppercase tracking-wider mb-1.5">
                  name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2.5 font-mono text-sm text-phosphor placeholder-phosphor-dim/40 focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="your name"
                />
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] text-phosphor-dim uppercase tracking-wider mb-1.5">
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2.5 font-mono text-sm text-phosphor placeholder-phosphor-dim/40 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-phosphor-dim uppercase tracking-wider mb-1.5">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2.5 font-mono text-sm text-phosphor placeholder-phosphor-dim/40 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder={mode === "signup" ? "min 8 characters" : "your password"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 border border-accent bg-accent/10 hover:bg-accent/20 text-accent font-mono text-xs rounded transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "..." : mode === "signin" ? "sign in" : "create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-terminal-border" />
            <span className="font-mono text-[10px] text-phosphor-dim">or</span>
            <div className="flex-1 border-t border-terminal-border" />
          </div>

          {/* Spotify */}
          <button
            onClick={() => signIn("spotify", { callbackUrl })}
            className="w-full py-2.5 border border-terminal-border hover:border-terminal-border-bright text-phosphor hover:text-white font-mono text-xs rounded transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#1DB954]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            continue with spotify
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
