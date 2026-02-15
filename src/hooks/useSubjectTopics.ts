import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PaginatedQuestions } from "@/types/lecturer";

export function useSubjectTopics() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        // Fetch a large batch to extract distinct values
        const data = await api.get<PaginatedQuestions>(
          "/questions?limit=200&sortBy=createdAt:desc",
        );
        const subjectSet = new Set<string>();
        const topicSet = new Set<string>();
        for (const q of data.questions) {
          if (q.subject) subjectSet.add(q.subject);
          if (q.topic) topicSet.add(q.topic);
        }
        setSubjects(Array.from(subjectSet).sort());
        setTopics(Array.from(topicSet).sort());
      } catch {
        // Keep empty
      }
    }
    fetch();
  }, []);

  return { subjects, topics };
}
