"use server"

export async function sendQuery(query: string) {
    const backendUrl = process.env.THEMISON_BACKEND_URL || 'http://0.0.0.0:8000/';    

    const response = await fetch(`${backendUrl}query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({query: query})
    })

    if (response.ok) {
        const data = await response.json();
        return {success: true, data: data};
    } else {
        throw new Error('Failed to query');
    }
}