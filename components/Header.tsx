import React from "react";
import Link from "next/link";
import {
  ArrowRightStartOnRectangleIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();

  let left = (
    <div className="flex justify-center items-center">
      <div>
        <Link href="/" legacyBehavior>
          <Image
            src="/images/beatbrain-notes.png"
            width={64}
            height={60}
            alt="Beatbrain"
          />
        </Link>
      </div>
      <div>
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
        <Link href="/drafts" legacyBehavior>
          <a
            className="ml-4 text-black hover:text-gray-500"
            data-active={isActive("/drafts")}
          >
            Drafts
          </a>
        </Link>
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
            Log in
          </a>
        </Link>
      </div>
    );
  }

  if (session) {
    right = (
      <div className="ml-auto flex items-center">
        <UserIcon className="h-6 w-6 mr-2" />
        <p className="text-lg font-bold mr-4">
          {session.user.name.toLowerCase()}
        </p>
        <Link href="/create" legacyBehavior>
          <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            <PlusIcon className="h-6 w-6 text-white" />
          </button>
        </Link>
        <button
          title="Logout"
          onClick={() => signOut()}
          className="ml-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <nav className="flex bg-green-300 p-8 items-center">
      {left}
      {right}
    </nav>
  );
};

export default Header;
