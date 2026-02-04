import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Box from "@components/Box";

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  const { state } = context;
  const user = state?.user;
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await fetch("/api/user/edit", {
        method: "PUT",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <Box className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-phosphor-dim text-sm">please log in to continue</p>
        </div>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen">
      <div className="relative max-w-2xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 border-b border-terminal-border pb-4">
          <h1 className="font-display text-2xl md:text-3xl text-phosphor tracking-tight mb-2">
            settings
          </h1>
          <p className="font-mono text-xs text-phosphor-dim">
            account configuration
          </p>
        </div>

        {/* Profile Card */}
        <div className="terminal-window mb-6">
          <div className="terminal-titlebar">profile</div>
          <div className="p-6 font-mono">
            {/* User info */}
            <div className="space-y-2 mb-6 text-xs">
              <div className="flex gap-4">
                <span className="text-phosphor-dim w-24">name</span>
                <span className="text-phosphor">{user.name || '—'}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor-dim w-24">email</span>
                <span className="text-phosphor">{user.email || '—'}</span>
              </div>
              {user.spotifyId && (
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-24">spotify</span>
                  <span className="text-accent flex items-center gap-2">
                    connected
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block" />
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-terminal-border my-4" />

            {/* Username field */}
            <div>
              <div className="data-label mb-3">username</div>
              
              {!isEditing ? (
                <div className="flex items-center gap-3">
                  <span className="text-cool">{username || '—'}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-[10px] border border-terminal-border text-phosphor-dim hover:border-accent/50 hover:text-accent transition-all duration-300 rounded"
                  >
                    edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full max-w-xs bg-terminal-bg border border-terminal-border text-phosphor px-3 py-1.5 font-mono text-xs outline-none focus:border-accent transition-all rounded"
                    placeholder="username"
                    maxLength={30}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 text-[10px] border border-accent/50 text-accent hover:bg-accent/5 disabled:opacity-50 transition-all duration-300 rounded"
                    >
                      {isSaving ? 'saving...' : 'save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setUsername(user?.username || ""); }}
                      className="px-4 py-1.5 text-[10px] border border-terminal-border text-phosphor-dim hover:text-phosphor transition-all duration-300 rounded"
                    >
                      cancel
                    </button>
                  </div>
                </form>
              )}

              {saved && (
                <p className="mt-3 text-[11px] text-accent">
                  saved ✓
                </p>
              )}

              <p className="mt-4 text-[10px] text-phosphor-dim">
                lowercase, numbers, dashes, underscores
              </p>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Settings;
