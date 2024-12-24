import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Dropdown from "@components/Dropdown";
import { Bars3Icon } from "@heroicons/react/24/solid";
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
        <IconLink
          href="#"
          icon={<Bars3Icon className="h-8 w-8" />}
          onClick={toggleDropdown}
          className={`text-${iconColor}`}
        />
      </div>
      <Dropdown isOpen={isOpen}>
        <div className="flex flex-col text-lg text-gray-700 cursor-pointer bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
            <IconLink
              href="/settings"
              icon={<span>Settings</span>}
              active={false}
            />
          </div>
          <div className="p-4 hover:bg-gray-50">
            <a
              onClick={() => signOut()}
              role="menuitem"
              className="text-black hover:text-green-500 transform hover:scale-150 hover:drop-shadow-lg transition-all duration-200"
            >
              <span>Logout</span>
            </a>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default AuthMenu;
