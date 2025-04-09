export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { telegramId } = body;


        const url = process.env.API_URL
        const token = process.env.API_TOKEN

        const res = await fetch(`https://${url}/api/users/tg/${telegramId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.error(`Error API: ${res.status} ${res.statusText}`);
            return new Response(
                JSON.stringify({ error: 'Error while fetching data from the remote API' }),
                { status: res.status }
            );
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Server error.' }), { status: 500 });
    }
}
