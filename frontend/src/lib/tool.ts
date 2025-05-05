import { JSX, useEffect, useState } from "react";
import { fetchWithAuth } from "./fetch";
import { BadgeProps } from "@/components/ui/badge";

export async function fetchTitleById(titleId: string): Promise<string | null> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles/${titleId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.error("Failed to fetch title:", response.statusText);
      return null;
    }
    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error("Error fetching title:", error);
    return null;
  }
}

export function useSignatureTitles(signatureTemplates: { title_id: string }[]) {
  const [titles, setTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTitles = async () => {
      const entries = await Promise.all(
        signatureTemplates.map(async (sig) => {
          const title = await fetchTitleById(sig.title_id);
          return [sig.title_id, title || ""] as const;
        })
      );
      setTitles(Object.fromEntries(entries));
    };

    if (signatureTemplates.length > 0) {
      fetchTitles();
    }
  }, [signatureTemplates]);

  return titles;
}
