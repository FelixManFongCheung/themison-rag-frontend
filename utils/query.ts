"use server"

export async function query(query: string) {
    const backendUrl = process.env.THEMISON_BACKEND_URL || 'http://0.0.0.0:8000/';

    const response = await fetch(`${backendUrl}`, {
        method: 'POST',
        body: JSON.stringify({query: query})
    })

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error('Failed to query');
    }
}