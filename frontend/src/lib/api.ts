const BASE_URL = '/api/v1'

export async function post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'An error occurred')
    }

    return data
}