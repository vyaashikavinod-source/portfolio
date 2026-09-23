import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseServerClient, getEditor } from "@/lib/supabase-server";

const bucket = "portfolio-assets";
const storagePath = "resume/resume.pdf";
const maxResumeSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const editor = await getEditor();
  const supabase = await createSupabaseServerClient();
  if (!editor || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const resume = formData.get("resume");
  if (!(resume instanceof File) || resume.type !== "application/pdf") {
    return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
  }
  if (resume.size > maxResumeSize) {
    return NextResponse.json({ error: "Resume must be 10 MB or smaller." }, { status: 400 });
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, resume, {
      upsert: true,
      contentType: "application/pdf",
    });
  if (uploadError) {
    return NextResponse.json(
      { error: "Unable to upload resume." },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);
  const resumeUrl = publicUrlData.publicUrl;
  if (!resumeUrl) {
    return NextResponse.json(
      { error: "Unable to connect resume." },
      { status: 500 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .update({ resume_url: resumeUrl })
    .eq("id", true)
    .select("id")
    .maybeSingle();
  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Unable to connect resume." },
      { status: 500 },
    );
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, resumeUrl });
}
