interface AnkiResponse<T> {
	result: T,
	error: string
}

export async function findCards(url = "http://localhost:8765", deck: string): Promise<[string]> {
	console.debug(`Finding cards ${url} - ${deck}`)
	const options = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json;charset=UTF-8",
		},
		body: JSON.stringify({
			action: "findCards",
			version: 6,
			params: {
				query: `deck:${deck}`
			}
		}),
	};

	const response = await fetch(url, options);
	const data = await response.json();
	return (data as AnkiResponse<[string]>).result;
}
