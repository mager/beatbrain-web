import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  PaintBrushIcon,
  ArrowRightEndOnRectangleIcon,
  NewspaperIcon,
} from "@heroicons/react/24/solid";
import AuthMenu from "@components/AuthMenu";
import UsernameLink from "@components/UsernameLink";
import IconLink from "@components/IconLink";

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const { state } = context;
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const user = state?.user;
  const username = user?.username;

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
        <IconLink
          href="/feed"
          icon={<NewspaperIcon className="h-8 w-8" />}
          active={isActive("/feed")}
        />
      </div>
    </div>
  );

  let right = null;

  if (!user) {
    right = (
      <div className="ml-auto flex items-center">
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
      <div className="hidden ml-auto md:flex items-center">
        {username && <UsernameLink username={username} />}
        <AuthMenu iconColor="black" />
        <div className="mx-2 flex items-center">
          <IconLink
            href="/create"
            icon={<PaintBrushIcon className="h-8 w-8" />}
            active={isActive("/create")}
          />
        </div>
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
