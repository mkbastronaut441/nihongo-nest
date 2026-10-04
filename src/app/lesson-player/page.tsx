import { LessonPlayer } from "@/components/lesson-player";

export const dynamic = "force-dynamic";

export default async function LessonPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { lesson } = await searchParams;
  return <LessonPlayer lessonId={lesson} />;
}
