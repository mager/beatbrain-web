import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
  Cog8ToothIcon,
  PaintBrushIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

import Dropdown from "@components/Dropdown";
import ProfileImage from "./ProfileImage";

type Props = {
  color: string;
};

const Header: React.FC<Props> = ({ color }) => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const { data: session, status } = useSession();

  const username = session?.user.name.toLowerCase();
  let profileImage = <UserIcon className="hidden md:block h-6 w-6 mr-2" />;
  if (username) {
    profileImage = <ProfileImage height={32} width={32} username={username} />;
  }

  let left = (
    <div className="flex justify-center items-center">
      <div className="cursor-pointer mr-4">
        <Link href="/" legacyBehavior>
          <Image
            src="/images/beatbrain-notes-head.png"
            width={64}
            height={60}
            alt="Beatbrain"
          />
        </Link>
      </div>
      <div className="ml-4 mb-4">
        <Link href="/feed" legacyBehavior>
          <a
            className=" text-black text-lg hover:text-white"
            data-active={isActive("/feed")}
          >
            Feed
          </a>
        </Link>
      </div>
    </div>
  );

  let right = null;

  if (status === "loading") {
    right = (
      <div className="ml-auto">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    right = (
      <div className="ml-auto mb-4">
        <Link href="/api/auth/signin" legacyBehavior>
          <button
            title="Login"
            className="hover:bg-gray-300 font-bold p-2 rounded focus:outline-none focus:shadow-outline"
          >
            <ArrowRightEndOnRectangleIcon className="h-6 w-6 text-black" />
          </button>
        </Link>
      </div>
    );
  }

  if (session) {
    right = (
      <div className="ml-auto mb-4 flex items-center relative">
        {username && (
          <div className="mx-2">
            <Link href={`/u/${username}`}>{profileImage}</Link>
          </div>
        )}
        <Link href="/create" legacyBehavior>
          <button className="hover:bg-gray-600 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
            <PaintBrushIcon className="h-6 w-6 text-white" />
          </button>
        </Link>
        <button
          title="Menu"
          onClick={toggleDropdown}
          className="hover:bg-gray-600 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
        >
          <Cog8ToothIcon className="h-6 w-6 text-white" />
        </button>
        <Dropdown isOpen={isOpen}>
          <div className="flex flex-col text-lg text-black hover:white cursor-pointer">
            <div className="p-4 border-b border-gray-200">
              <Link href="/settings">Settings</Link>
            </div>
            <div className="p-4">
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
    <nav className={`${color} flex px-8 pt-4`}>
      {left}
      {right}
    </nav>
  );
};

export default Header;
