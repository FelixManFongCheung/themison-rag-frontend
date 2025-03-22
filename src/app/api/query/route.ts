import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.THEMISON_BACKEND_URL || 'http://0.0.0.0:8000/';
  
  try {
    // Get the query from the request body
    const { query } = await request.json();
    
    // Forward the request to your backend
    const response = await fetch(`${backendUrl}query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Backend responded with ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create a TransformStream to forward the response
    const { readable, writable } = new TransformStream();
    
    // Pipe the response body to our transform stream
    if (response.body) {
      const reader = response.body.getReader();
      const writer = writable.getWriter();
      
      // Process the stream
      const pump = async () => {
        try {
        //   const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // For FastAPI StreamingResponse, we need to ensure proper encoding
            // and may need to handle specific formats like SSE
            const chunk = value;
            
            // If you need to inspect or modify the chunk content:
            // const textChunk = decoder.decode(value, { stream: true });
            // console.log("Received chunk:", textChunk);
            
            await writer.write(chunk);
          }
        } catch (e) {
          console.error("Error pumping stream:", e);
        } finally {
          writer.close();
        }
      };
      
      // Start pumping but don't await (we want to return the stream immediately)
      pump();
    }
    
    // Return the readable side of the transform stream with appropriate headers
    return new Response(readable, {
      headers: {
        // Match the content type from your FastAPI backend
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in query route handler:', error);
    return new Response(JSON.stringify({ error: 'Failed to process query' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
