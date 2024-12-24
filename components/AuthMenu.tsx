import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Dropdown from "@components/Dropdown";
import { Bars3Icon, UserIcon } from "@heroicons/react/24/solid";

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
          title="Menu"
          onClick={toggleDropdown}
          className={`text-${iconColor}`}
        >
          <Bars3Icon className="h-8 w-8" />
        </button>
      </div>
      <Dropdown isOpen={isOpen}>
        <div className="flex flex-col text-lg text-gray-700 cursor-pointer bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
            <Link href="/settings">Settings</Link>
          </div>
          <div className="p-4 hover:bg-gray-50">
            <a onClick={() => signOut()} role="menuitem">
              Logout
            </a>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default AuthMenu;
