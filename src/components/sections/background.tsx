import type { EducationEntry, ExperienceEntry } from "@/data/content/types";

function DateRange({ startDate, endDate }: { startDate: string; endDate: string }) {
  const dates = [startDate, endDate].filter(Boolean);
  return dates.length > 0 ? <p>{dates.join(" – ")}</p> : null;
}

function Tags({ value }: { value: string }) {
  const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
  return tags.length > 0 ? <div className="tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null;
}

export function Background({ experience, education }: { experience: ExperienceEntry[]; education: EducationEntry[] }) {
  return <>{experience.length > 0 && <section id="experience" className="section wrap"><header className="section-head"><p className="eyebrow">Experience</p><h2>Professional experience.</h2></header><div className="timeline">{experience.map((entry, index) => <div key={`${entry.role}-${entry.organization}-${index}`}><span aria-hidden="true" /><article>{entry.role && <h3>{entry.role}</h3>}{[entry.organization, entry.employmentType].filter(Boolean).length > 0 && <p>{[entry.organization, entry.employmentType].filter(Boolean).join(" · ")}</p>}<DateRange startDate={entry.startDate} endDate={entry.endDate} />{entry.location && <p>{entry.location}</p>}{entry.summary && <p>{entry.summary}</p>}{entry.highlights && <><h4>Selected achievements</h4><p>{entry.highlights}</p></>}<Tags value={entry.technologies} /></article></div>)}</div></section>}{education.length > 0 && <section id="education" className="section wrap"><header className="section-head"><p className="eyebrow">Education</p><h2>Education and training.</h2></header><div className="timeline">{education.map((entry, index) => <div key={`${entry.institution}-${entry.degree}-${index}`}><span aria-hidden="true" /><article>{entry.degree && <h3>{entry.degree}</h3>}{entry.institution && <p>{entry.institution}</p>}{entry.field && <p>{entry.field}</p>}<DateRange startDate={entry.startDate} endDate={entry.endDate} />{entry.location && <p>{entry.location}</p>}{entry.status && <p>{entry.status}</p>}{entry.highlights && <p>{entry.highlights}</p>}</article></div>)}</div></section>}</>;
}
