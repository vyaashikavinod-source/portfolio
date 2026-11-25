import { ArrowUpRight } from "lucide-react";
import { ExternalProjectLinks } from "@/components/projects/external-links";
import { projectCaseStudyLinks } from "@/data/projects/links";
import type { ProjectLinkEntry } from "@/data/content/types";
import type { Project } from "@/types/portfolio";

export function ProjectCard({ project, links }: { project: Project; links: ProjectLinkEntry }) {
  const caseStudyUrl = projectCaseStudyLinks[project.title];
  const externalLinks = links;
  const workflows: Record<string, { steps: string[]; labels: string[] }> = { "ClauseForge": { steps: ["Contract input", "Clause taxonomy", "QLoRA candidate", "Controlled evaluation"], labels: ["CUAD", "Qwen2.5", "Evaluation"] }, "IncidentPilot": { steps: ["Incident intake", "Evidence gathering", "Proposed action", "Human approval"], labels: ["Context", "Policy", "Approval"] }, "MedScout": { steps: ["Public research question", "Keyword safety gate", "Live PubMed retrieval", "MiniLM vector ranking", "Optional cited Gemini summary"], labels: ["PubMed", "ONNX", "Safety Gate", "Citation checks"] }, "Intelligent Network Fraud Detection System": { steps: ["Network traffic", "Flow analysis", "Risk scoring", "ML detection", "Alerts / dashboard"], labels: ["PyShark", "Random Forest", "Isolation Forest", "CICIDS2017"] } };
  const workflow = workflows[project.title] ?? { steps: [project.category], labels: [] };
  return <article className="project"><div className="project-visual"><span>{project.number}</span><div className="visual-lines" /><div className="visual-flow"><ol>{workflow.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="visual-labels">{workflow.labels.map((label) => <i key={label}>{label}</i>)}</div></div></div><div className="project-content"><div className="project-top"><p className="eyebrow">{project.category}</p><span className="status">{project.status}</span></div><h3>{project.title}</h3><p>{project.description}</p>{project.metrics.length > 0 && <div className="metrics">{project.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>}<div className="tags" aria-label={`${project.title} technologies`}>{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>{caseStudyUrl && <div className="project-actions"><a className="button" href={caseStudyUrl}>Case study <ArrowUpRight size={16} /></a></div>}<ExternalProjectLinks projectName={project.title} links={externalLinks} /></div></article>;
}
