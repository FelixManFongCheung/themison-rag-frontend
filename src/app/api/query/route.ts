import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.THEMISON_BACKEND_URL || "http://0.0.0.0:8000/";

  try {
    // Get the query from the request body
    const { message } = await request.json();

    // Forward the request to your backend
    const response = await fetch(`${backendUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    });

    console.log(response);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Backend responded with ${response.status}` }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use StreamingTextResponse from Vercel AI SDK to handle the streaming response
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in query route handler:", error);
    return new Response(JSON.stringify({ error: "Failed to process query" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
