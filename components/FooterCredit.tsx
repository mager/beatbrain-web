import Link from "next/link";

export default function FooterCredit() {
  return (
    <p>
      Built with love in Chicago by{" "}
      <a href="https://mager.co" target="_blank" rel="noreferrer">
        mager
      </a>{" "}
      with agents. <Link href="/about">About</Link>
    </p>
  );
}
