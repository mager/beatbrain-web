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

const Header = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;
  const [isOpen, setIsOpen] = useState(false);
  const colors = [
    "bg-red-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-deep-purple-500",
    "bg-indigo-500",
    "bg-blue-500",
    "bg-light-blue-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-green-500",
    "bg-light-green-500",
    "bg-lime-500",
    "bg-yellow-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-deep-orange-500",
    "bg-brown-500",
    "bg-grey-500",
    "bg-blue-grey-500",
  ];
  const random = Math.floor(Math.random() * colors.length);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const { data: session, status } = useSession();

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
      {session && (
        <div className="ml-4 mb-4">
          {" "}
          <Link href="/posts" legacyBehavior>
            <a
              className="text-black text-lg hover:text-white"
              data-active={isActive("/posts")}
            >
              Posts
            </a>
          </Link>
        </div>
      )}
    </div>
  );

  let right = null;

  if (status === "loading") {
    right = (
      <div className="ml-auto">
        <p>Validating session ...</p>
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
        <UserIcon className="hidden md:block h-6 w-6 mr-2" />
        <p className="hidden md:block text-md font-bold mr-4">
          {session.user.name.toLowerCase()}
        </p>
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
          <a
            onClick={() => signOut()}
            className="block px-4 py-2 text-lg text-black hover:white cursor-pointer"
            role="menuitem"
          >
            Logout
          </a>
        </Dropdown>
      </div>
    );
  }
  return (
    <nav className="bg-cyan-500 flex px-8 pt-4">
      {left}
      {right}
    </nav>
  );
};

export default Header;
