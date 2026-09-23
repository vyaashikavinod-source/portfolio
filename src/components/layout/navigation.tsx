"use client";
import { Code2, Menu, Network, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Profile } from "@/types/portfolio";

type NavigationProps = { profile: Pick<Profile, "displayName" | "shortName" | "githubUrl" | "linkedinUrl" | "resumeUrl">; hasExperience: boolean };

export function Navigation({ profile, hasExperience }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const links = ["Work", "About", "Skills", ...(hasExperience ? ["Experience"] : []), "Contact"];
  const brand = profile.shortName ?? profile.displayName ?? "Portfolio";
  return <header className="nav"><nav className="wrap nav-inner" aria-label="Primary"><a className="brand" href="#top">{brand}</a><div className="nav-links">{links.map((link) => <a key={link} href={`#${link.toLowerCase()}`}>{link}</a>)}</div><div className="nav-actions">{profile.resumeUrl && <a className="resume" target="_blank" rel="noopener noreferrer" href={profile.resumeUrl} aria-label="Open resume PDF in a new tab">Resume PDF</a>}<ThemeToggle />{profile.githubUrl && <a className="icon-button" href={profile.githubUrl} aria-label="GitHub"><Code2 size={17} /></a>}{profile.linkedinUrl && <a className="icon-button" href={profile.linkedinUrl} aria-label="LinkedIn"><Network size={17} /></a>}<button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></nav>{open && <div className="mobile-links">{links.map((link) => <a onClick={() => setOpen(false)} key={link} href={`#${link.toLowerCase()}`}>{link}</a>)}</div>}</header>;
}
