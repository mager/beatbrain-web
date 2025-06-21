import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Dropdown from "@components/Dropdown";
import { Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import IconLink from "@components/IconLink";

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
          className={`text-${iconColor} bg-transparent border-none p-0 m-0 focus:outline-none`}
        >
          <Bars3Icon className="h-8 w-8" />
        </button>
      </div>
      <Dropdown isOpen={isOpen}>
        <div className="flex flex-col min-w-[120px] bg-white text-sm">
          <button
            className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-transparent border-none text-left hover:bg-gray-100 focus:bg-gray-100"
            style={{fontWeight: 400}}
            onClick={() => {
              window.location.href = "/settings";
              setIsOpen(false);
            }}
          >
            <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
            Settings
          </button>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 text-gray-700 bg-transparent border-none text-left hover:bg-gray-100 focus:bg-gray-100"
            style={{fontWeight: 400}}
          >
            Logout
          </button>
        </div>
      </Dropdown>
    </>
  );
};

export default AuthMenu;
