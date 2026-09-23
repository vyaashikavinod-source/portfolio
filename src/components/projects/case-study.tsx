import { ExternalProjectLinks } from "@/components/projects/external-links";
import type { ProjectLinkEntry } from "@/data/content/types";

export function ProjectSection({ eyebrow, title, children, links }: { eyebrow: string; title: string; children: React.ReactNode; links?: ProjectLinkEntry }) { const projectName = title.startsWith("Disciplined") ? "ClauseForge" : title.startsWith("Control boundaries") ? "IncidentPilot" : null; return <section className="case-section wrap"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children}{projectName && links && <ExternalProjectLinks projectName={projectName} links={links} />}</section>; }
export function MetricGrid({ items }: { items: ReadonlyArray<ReadonlyArray<string>> }) { return <div className="case-metrics">{items.map((item) => <div key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong></div>)}</div>; }
export function ArchitectureFlow({ nodes }: { nodes: string[] }) { return <ol className="architecture">{nodes.map((node, index) => <li key={node}><b>{String(index + 1).padStart(2, "0")}</b><span>{node}</span></li>)}</ol>; }
export function EvidencePanel({ children }: { children: React.ReactNode }) { return <aside className="evidence">{children}</aside>; }
