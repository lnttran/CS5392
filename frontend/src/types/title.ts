import { fetchWithAuth } from "@/lib/fetch";

export interface Title {
  title_id: string;
  title: string;
}

export async function getTitleById(titleId: string): Promise<string | null> {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles/${titleId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      console.warn("Failed to fetch title", titleId);
      return null;
    }

    const data = await res.json();
    return data.title || null;
  } catch (error) {
    console.error("Error fetching title:", error);
    return null;
  }
}
