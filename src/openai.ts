import * as https from 'node:https';

export class OpenAIError extends Error {
	public readonly statusCode?: number;
	public readonly responseBody?: string;

	public constructor(message: string, options?: { statusCode?: number; responseBody?: string }) {
		super(message);
		this.name = 'OpenAIError';
		this.statusCode = options?.statusCode;
		this.responseBody = options?.responseBody;
	}
}

export type OpenAIGenerateOptions = {
	apiKey: string;
	model: string;
	system: string;
	userText: string;
	maxTokens: number;
	temperature: number;
};

type OpenAIResponseOutputText = {
	type: 'output_text';
	text: string;
};

type OpenAIResponseMessage = {
	type: 'message';
	content?: unknown;
};

type OpenAIResponsesCreateResponse = {
	output_text?: unknown;
	output?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object';
}

function extractOutputTextFromOutputItems(output: unknown): string {
	if (!Array.isArray(output)) {
		return '';
	}

	const chunks: string[] = [];
	for (const item of output) {
		if (!isRecord(item)) {
			continue;
		}

		// Common shape: { type: "message", content: [{ type: "output_text", text: "..." }, ...] }
		if (item['type'] === 'message') {
			const msg = item as OpenAIResponseMessage;
			const contentAny = msg.content;
			if (!Array.isArray(contentAny)) {
				continue;
			}
			for (const c of contentAny) {
				if (!isRecord(c)) {
					continue;
				}
				if (c['type'] === 'output_text' && typeof c['text'] === 'string') {
					chunks.push((c as OpenAIResponseOutputText).text);
				}
			}
			continue;
		}

		// Fallback: scan any nested arrays for { type: "output_text", text } objects.
		for (const v of Object.values(item)) {
			if (!Array.isArray(v)) {
				continue;
			}
			for (const nested of v) {
				if (!isRecord(nested)) {
					continue;
				}
				if (nested['type'] === 'output_text' && typeof nested['text'] === 'string') {
					chunks.push(String(nested['text']));
				}
			}
		}
	}

	return chunks.join('').trim();
}

export async function openaiGenerateText(opts: OpenAIGenerateOptions): Promise<string> {
	const body = JSON.stringify({
		model: opts.model,
		input: [
			{
				role: 'system',
				content: [{ type: 'input_text', text: opts.system }],
			},
			{
				role: 'user',
				content: [{ type: 'input_text', text: opts.userText }],
			},
		],
		max_output_tokens: opts.maxTokens,
		temperature: opts.temperature,
	});

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		'content-length': String(Buffer.byteLength(body, 'utf8')),
		authorization: `Bearer ${opts.apiKey}`,
	};

	const responseText = await new Promise<string>((resolve, reject) => {
		const req = https.request(
			{
				method: 'POST',
				hostname: 'api.openai.com',
				path: '/v1/responses',
				headers,
			},
			(res) => {
				const chunks: Buffer[] = [];
				res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c))));
				res.on('end', () => {
					const text = Buffer.concat(chunks).toString('utf8');
					const statusCode = res.statusCode ?? 0;
					if (statusCode < 200 || statusCode >= 300) {
						reject(new OpenAIError(`OpenAI API request failed (${statusCode}).`, { statusCode, responseBody: text }));
						return;
					}
					resolve(text);
				});
			},
		);

		req.on('error', (err) => reject(new OpenAIError(`OpenAI API request failed: ${String(err)}`)));
		req.write(body);
		req.end();
	});

	let parsed: OpenAIResponsesCreateResponse;
	try {
		parsed = JSON.parse(responseText) as OpenAIResponsesCreateResponse;
	} catch {
		throw new OpenAIError('OpenAI API returned non-JSON response.', { responseBody: responseText });
	}

	if (typeof parsed.output_text === 'string' && parsed.output_text.trim()) {
		return parsed.output_text.trim();
	}

	const extracted = extractOutputTextFromOutputItems(parsed.output);
	if (extracted) {
		return extracted;
	}

	throw new OpenAIError('OpenAI API returned empty content.', { responseBody: responseText });
}

