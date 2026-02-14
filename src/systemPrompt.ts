export type SystemPromptOptions = {
	allowedTypes: string[];
	allowedScopes: string[];
	maxSubjectLength: number;
	promptHints: string[];
};

function formatAllowedList(items: string[]): string {
	return items.map((t) => `- ${t}`).join('\n');
}

const SYSTEM_PROMPT_PREAMBLE_LINES = [
	'You MUST output a valid Conventional Commit message.',
	'Output only the commit message text. No code fences, no extra commentary.',
] as const;

const SYSTEM_PROMPT_ALLOWED_TYPES_TITLE = 'You MUST choose a type ONLY from this allowed list:' as const;
const SYSTEM_PROMPT_ALLOWED_SCOPES_TITLE = 'You MUST choose a scope ONLY from this allowed list:' as const;

function buildSystemPromptConstraintsLines(maxSubjectLength: number): string[] {
	return [
		'Scope is REQUIRED. Header MUST be: type(scope): subject',
		`Subject MUST be imperative mood, concise, and <= ${maxSubjectLength} characters.`,
	];
}

const SYSTEM_PROMPT_STYLE_LINES = [
	'Body should use third-person singular present tense ("adds", not "add") and may be omitted for trivial changes.',
	'Do NOT include Markdown formatting, and do NOT manually wrap paragraphs with line breaks.',
	'Use the "style" type for changes that do not affect the meaning of the code (whitespace, formatting, comment styling, etc).',
	'Use the "docs" type for documentation changes, and scope it to the documentation area (readme, changelog, etc.).',
	'Use the "workspace" scope for changes to development environment configuration, tools, or other non-code changes.',
	'Use the "agents" scope for changes to agent configuration, instructions, or other agent-related changes.',
	'Use "chore(deps)" for changes to dependencies, package managers, or other dependency-related changes.'
] as const;

/**
 * Builds the system prompt that enforces Conventional Commits + project-specific rules.
 * Keep the rules here so they're easy to audit and modify in one place.
 */
export function buildSystemPrompt(opts: SystemPromptOptions): string {
	const typeList = formatAllowedList(opts.allowedTypes);
	const scopeList = formatAllowedList(opts.allowedScopes);

	const rulesLines: string[] = [
		...SYSTEM_PROMPT_PREAMBLE_LINES,
		'',
		SYSTEM_PROMPT_ALLOWED_TYPES_TITLE,
		typeList,
		'',
		SYSTEM_PROMPT_ALLOWED_SCOPES_TITLE,
		scopeList,
		'',
		...buildSystemPromptConstraintsLines(opts.maxSubjectLength),
		...SYSTEM_PROMPT_STYLE_LINES,
	];

	if (opts.promptHints.length > 0) {
		rulesLines.push('', 'Additional project-specific rules:');
		for (const hint of opts.promptHints) {
			rulesLines.push(`- ${hint}`);
		}
	}

	return rulesLines.join('\n');
}
