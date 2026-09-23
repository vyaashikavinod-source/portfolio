import { Navigation } from "@/components/layout/navigation";
import { Background } from "@/components/sections/background";
import { About, Contact, Footer, Hero, Skills, Work } from "@/components/sections/sections";
import { getPortfolioContent } from "@/lib/portfolio-data";
import type { Profile } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPortfolioContent();
  const username = content.profile.githubUsername || "ruwactrl";
  const profile: Profile = { heroEyebrow: "AI · Data · Software Engineering", heroDescription: "I build evaluated AI systems, retrieval and agent workflows, data-driven applications, and full-stack software with an emphasis on reliability, testing, and useful real-world outcomes.", ...content.profile, githubUsername: username, githubUrl: `https://github.com/${username}` };
  return <><Navigation profile={profile} hasExperience={content.experience.length > 0} /><main><Hero profile={profile} /><Work projectLinks={content.projectLinks} /><About /><Skills /><Background experience={content.experience} education={content.education} /><Contact profile={profile} /></main><Footer profile={profile} /></>;
}
