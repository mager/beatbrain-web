import React, { useState } from "react";
import { authClient } from "../lib/auth-client";
import Dropdown from "@components/Dropdown";
import { Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/solid";

type Props = {
  iconColor?: string;
};

const AuthMenu = ({ iconColor = "white" }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="mx-2 flex items-center">
        <button
          onClick={toggleDropdown}
          className="text-phosphor-dim hover:text-phosphor bg-transparent border-none p-0 m-0 focus:outline-none transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      <Dropdown isOpen={isOpen}>
        <div className="flex flex-col min-w-[140px] bg-terminal-surface border border-terminal-border rounded shadow-lg overflow-hidden">
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-phosphor font-mono text-xs bg-transparent border-none text-left hover:bg-terminal-bg focus:bg-terminal-bg transition-colors"
            onClick={() => {
              window.location.href = "/settings";
              setIsOpen(false);
            }}
          >
            <Cog6ToothIcon className="h-3.5 w-3.5 text-phosphor-dim" />
            Settings
          </button>
          <div className="border-t border-terminal-border" />
          <button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              })
            }
            className="px-4 py-2.5 text-phosphor font-mono text-xs bg-transparent border-none text-left hover:bg-terminal-bg focus:bg-terminal-bg transition-colors"
          >
            Logout
          </button>
        </div>
      </Dropdown>
    </>
  );
};

export default AuthMenu;
