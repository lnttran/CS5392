export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const method = init?.method?.toUpperCase() ?? "GET";

  if (
    !headers.has("Content-Type") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(method)
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (!response.ok) {
      console.error(
        `Fetch failed with status: ${response.status} ${response.statusText}`
      );
    }

    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}
