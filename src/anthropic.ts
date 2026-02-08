import * as https from 'node:https';

export class AnthropicError extends Error {
	public readonly statusCode?: number;
	public readonly responseBody?: string;

	public constructor(message: string, options?: { statusCode?: number; responseBody?: string }) {
		super(message);
		this.name = 'AnthropicError';
		this.statusCode = options?.statusCode;
		this.responseBody = options?.responseBody;
	}
}

export type AnthropicGenerateOptions = {
	apiKey: string;
	model: string;
	system: string;
	userText: string;
	maxTokens: number;
	temperature: number;
};

type AnthropicTextBlock = { type: 'text'; text: string };

type AnthropicMessagesResponse = {
	id: string;
	type: 'message';
	role: 'assistant';
	content: AnthropicTextBlock[];
	model: string;
	stop_reason: string | null;
	stop_sequence: string | null;
	usage?: { input_tokens: number; output_tokens: number };
};

export async function anthropicGenerateText(opts: AnthropicGenerateOptions): Promise<string> {
	const body = JSON.stringify({
		model: opts.model,
		max_tokens: opts.maxTokens,
		temperature: opts.temperature,
		system: opts.system,
		messages: [{ role: 'user', content: opts.userText }],
	});

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		'content-length': String(Buffer.byteLength(body, 'utf8')),
		'x-api-key': opts.apiKey,
		'anthropic-version': '2023-06-01',
	};

	const responseText = await new Promise<string>((resolve, reject) => {
		const req = https.request(
			{
				method: 'POST',
				hostname: 'api.anthropic.com',
				path: '/v1/messages',
				headers,
			},
			(res) => {
				const chunks: Buffer[] = [];
				res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c))));
				res.on('end', () => {
					const text = Buffer.concat(chunks).toString('utf8');
					const statusCode = res.statusCode ?? 0;
					if (statusCode < 200 || statusCode >= 300) {
						reject(new AnthropicError(`Anthropic API request failed (${statusCode}).`, { statusCode, responseBody: text }));
						return;
					}
					resolve(text);
				});
			},
		);

		req.on('error', (err) => reject(new AnthropicError(`Anthropic API request failed: ${String(err)}`)));
		req.write(body);
		req.end();
	});

	let parsed: AnthropicMessagesResponse;
	try {
		parsed = JSON.parse(responseText) as AnthropicMessagesResponse;
	} catch {
		throw new AnthropicError('Anthropic API returned non-JSON response.', { responseBody: responseText });
	}

	const text = parsed.content
		.filter((b) => b.type === 'text')
		.map((b) => b.text)
		.join('')
		.trim();

	if (!text) {
		throw new AnthropicError('Anthropic API returned empty content.', { responseBody: responseText });
	}

	return text;
}
