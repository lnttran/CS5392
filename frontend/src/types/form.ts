import { fetchWithAuth } from "@/lib/fetch";

export async function generateUniqueApplicationId(
  formtypeid: string
): Promise<string> {
  const datePart = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  let attempt = 0;
  let applicationId: string;
  let exists = true;

  while (exists && attempt < 5) {
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    applicationId = `${formtypeid}-${datePart}-${randomPart}`;

    // Call backend to check existence
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/exists/${applicationId}`,
      { method: "GET", credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to check application ID existence");

    const idExists = await res.json();
    exists = idExists === true;
    attempt++;
  }

  if (exists)
    throw new Error(
      "Unable to generate a unique Application ID after 5 attempts"
    );
  return applicationId!;
}
