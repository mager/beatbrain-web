import React, { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import {
  Cog8ToothIcon,
  PaintBrushIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  NewspaperIcon,
} from "@heroicons/react/24/solid";
import { AppContext } from "../context/AppContext";

import Dropdown from "@components/Dropdown";
import ProfileImage from "./ProfileImage";

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const { state } = context;
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const user = state?.user;
  const username = user?.username;
  let profileImage = <UserIcon className="hidden md:block h-8 w-8 mr-2" />;
  if (username) {
    profileImage = <ProfileImage height={32} width={32} username={username} />;
  }

  let left = (
    <div className="flex justify-center items-center">
      <div className="cursor-pointer mr-4">
        <Link
          href="/"
          className="font-logo text-5xl hover:text-green-500 transition-all duration-200"
        >
          beatbrain
        </Link>
      </div>
      <div className="mx-2">
        <Link href="/feed" legacyBehavior>
          <a
            className="text-black hover:text-green-500 transform hover:scale-150 hover:drop-shadow-lg transition-all duration-200"
            data-active={isActive("/feed")}
          >
            <NewspaperIcon className="h-8 w-8" />
          </a>
        </Link>
      </div>
    </div>
  );

  let right = null;

  if (!user) {
    right = (
      <div className="ml-auto mb-4">
        <Link href="/api/auth/signin" legacyBehavior>
          <a className="text-black hover:text-green-500 transform hover:scale-150 hover:drop-shadow-lg transition-all duration-200">
            <ArrowRightEndOnRectangleIcon className="h-8 w-8" />
          </a>
        </Link>
      </div>
    );
  }

  if (user) {
    right = (
      <div className="ml-auto flex items-center">
        {username && (
          <div className="mx-2 flex items-center">
            <Link href={`/u/${username}`}>{profileImage}</Link>
          </div>
        )}
        <div className="mx-2 flex items-center">
          <Link href="/create" legacyBehavior>
            <a className="text-black hover:text-green-500 transform hover:scale-150 hover:drop-shadow-lg transition-all duration-200">
              <PaintBrushIcon className="h-8 w-8" />
            </a>
          </Link>
        </div>
        <div className="mx-2 flex items-center">
          <button
            title="Menu"
            onClick={toggleDropdown}
            className="text-black hover:text-green-500 transform hover:scale-150 hover:drop-shadow-lg transition-all duration-200"
          >
            <Cog8ToothIcon className="h-8 w-8" />
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
      </div>
    );
  }
  return (
    <nav className="flex items-center py-4 px-8 bg-gray-200">
      {left}
      {right}
    </nav>
  );
};

export default Header;
