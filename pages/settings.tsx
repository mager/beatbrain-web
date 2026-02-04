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
          <p className="text-phosphor-dim text-sm">ACCESS_DENIED</p>
          <p className="text-phosphor-dim text-xs mt-2">{'>'} please authenticate to continue</p>
        </div>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen">
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none grid-overlay opacity-30" />
      
      <div className="relative max-w-2xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Terminal Header */}
        <div className="mb-10 border-b border-terminal-border pb-4">
          <div className="font-mono text-[10px] text-phosphor-dim mb-2">
            root@beatbrain:~$ nano /etc/beatbrain/config.yml
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-matrix text-glow-green tracking-wider mb-2">
            CONFIG
          </h1>
          <p className="font-mono text-xs text-phosphor-dim">
            // user configuration — modify with caution
          </p>
        </div>

        {/* Profile Terminal Card */}
        <div className="terminal-window mb-6">
          <div className="terminal-titlebar">user_profile.conf</div>
          <div className="p-6 font-mono">
            {/* User info readout */}
            <div className="space-y-2 mb-6 text-xs">
              <div className="flex gap-4">
                <span className="text-phosphor-dim w-24">NAME:</span>
                <span className="text-phosphor">{user.name || 'N/A'}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-phosphor-dim w-24">EMAIL:</span>
                <span className="text-phosphor">{user.email || 'N/A'}</span>
              </div>
              {user.spotifyId && (
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-24">SPOTIFY:</span>
                  <span className="text-matrix flex items-center gap-2">
                    CONNECTED
                    <span className="w-1.5 h-1.5 rounded-full bg-matrix animate-pulse inline-block" />
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-terminal-border my-4" />

            {/* Username field */}
            <div>
              <div className="text-[10px] text-phosphor-dim mb-3 uppercase tracking-wider">
                # Username Configuration
              </div>
              
              {!isEditing ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center">
                    <span className="text-phosphor-dim mr-2">username =</span>
                    <span className="text-cyber">&quot;{username || 'null'}&quot;</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-[10px] border border-terminal-border text-phosphor-dim hover:border-matrix hover:text-matrix transition-all duration-300"
                  >
                    EDIT
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-phosphor-dim text-xs">username = &quot;</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="flex-1 bg-terminal-bg border border-matrix/50 text-matrix px-3 py-1.5 font-mono text-xs outline-none focus:border-matrix focus:shadow-glow-green transition-all"
                      placeholder="enter_username"
                      maxLength={30}
                      autoFocus
                    />
                    <span className="text-phosphor-dim text-xs">&quot;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 text-[10px] border border-matrix text-matrix hover:bg-matrix/10 disabled:opacity-50 transition-all duration-300"
                    >
                      {isSaving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setUsername(user?.username || ""); }}
                      className="px-4 py-1.5 text-[10px] border border-terminal-border text-phosphor-dim hover:text-phosphor transition-all duration-300"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {saved && (
                <p className="mt-3 text-[11px] text-matrix flex items-center gap-2">
                  <span>[OK]</span>
                  <span>Configuration saved successfully</span>
                </p>
              )}

              <p className="mt-4 text-[10px] text-phosphor-dim">
                # allowed: lowercase, numbers, dashes, underscores
              </p>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Settings;
