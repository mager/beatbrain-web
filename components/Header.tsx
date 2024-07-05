import React, { useState } from "react";
import Link from "next/link";
import {
  Cog8ToothIcon,
  PaintBrushIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import Dropdown from "./Dropdown";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const { data: session, status } = useSession();

  let left = (
    <div className="flex justify-center items-center">
      <div className="cursor-pointer">
        <Link href="/" legacyBehavior>
          <Image
            src="/images/beatbrain-notes-head.png"
            width={64}
            height={60}
            alt="Beatbrain"
          />
        </Link>
      </div>
      <div className="pb-4">
        <Link href="/feed" legacyBehavior>
          <a
            className="ml-4 text-black hover:text-gray-500"
            data-active={isActive("/feed")}
          >
            Feed
          </a>
        </Link>
      </div>
      {session && (
        <div className="pb-4">
          {" "}
          <Link href="/drafts" legacyBehavior>
            <a
              className="ml-4 text-black hover:text-gray-500"
              data-active={isActive("/drafts")}
            >
              Drafts
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
      <div className="ml-auto">
        <Link href="/api/auth/signin" legacyBehavior>
          <a className="border border-black px-4 py-2 rounded-md text-black hover:bg-gray-100">
            Login
          </a>
        </Link>
      </div>
    );
  }

  if (session) {
    right = (
      <div className="ml-auto flex items-center relative pb-4">
        <UserIcon className="h-6 w-6 mr-2" />
        <p className="text-lg font-bold mr-4">
          {session.user.name.toLowerCase()}
        </p>
        <Link href="/create" legacyBehavior>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            <PaintBrushIcon className="h-6 w-6 text-white" />
          </button>
        </Link>
        <button
          title="Menu"
          onClick={toggleDropdown}
          className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <Cog8ToothIcon className="h-6 w-6 text-white" />
        </button>
        <Dropdown isOpen={isOpen}>
          <a
            onClick={() => signOut()}
            className="block px-4 py-2 text-sm text-black hover:text-gray-500 cursor-pointer"
            role="menuitem"
          >
            Logout
          </a>
        </Dropdown>
      </div>
    );
  }

  return (
    <nav className="flex bg-indigo-400 px-8 pt-4 mb-4 items-center">
      {left}
      {right}
    </nav>
  );
};

export default Header;
