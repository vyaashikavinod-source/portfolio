import { redirect } from "next/navigation";
import { getEditor } from "@/lib/supabase-server";
import { Studio } from "./studio";

export default async function Page() { const editor = await getEditor(); if (!editor) redirect("/studio/login"); return <Studio />; }
