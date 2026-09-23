import { Code2, ExternalLink } from "lucide-react";
import type { ProjectLinkEntry } from "@/data/content/types";

export function ExternalProjectLinks({ projectName, links }: { projectName: string; links: ProjectLinkEntry }) {
  if (!links.githubUrl && !links.liveDemoUrl) return null;
  return <div className="project-actions">{links.githubUrl && <a className="button" href={links.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${projectName} GitHub repository`}><Code2 size={16} /> GitHub</a>}{links.liveDemoUrl && <a className="button" href={links.liveDemoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${projectName} live demo`}><ExternalLink size={16} /> Live Demo</a>}</div>;
}
