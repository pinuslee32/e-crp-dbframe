"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/propellers", label: "프로펠러 관리" },
  { href: "/analyses", label: "성능해석" },
  { href: "/comparisons", label: "데이터 분석" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#navbar"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link href="/" className="navbar-brand">
            E-CRP DB Frame
          </Link>
        </div>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="nav navbar-nav">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href} className={isActive ? "active" : ""}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
