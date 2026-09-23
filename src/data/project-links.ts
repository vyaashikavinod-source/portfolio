import content from "@/data/content/site-content.json";
import type { ProjectLinkEntry } from "@/data/content/types";

export const projectLinks: Record<string, ProjectLinkEntry> = content.projectLinks;

export function getProjectLinks(title: string): ProjectLinkEntry {
  return projectLinks[title] ?? {};
}
