import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
	parseCommitGenConfigText,
	parseCommitHeader,
	validateCommitMessage,
	type CommitGenRules,
} from '../core';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('parseCommitGenConfigText: accepts valid config', () => {
		const cfg = parseCommitGenConfigText(
			JSON.stringify({
				scopes: ['ui', 'core'],
				types: ['feat', 'fix'],
				rules: { maxSubjectLength: 50, requireScope: true, allowBreakingChange: false },
				promptHints: 'No emojis.',
			}),
			'/repo/.commit-gen.json',
		);

		assert.deepStrictEqual(cfg.scopes, ['ui', 'core']);
		assert.deepStrictEqual(cfg.types, ['feat', 'fix']);
		assert.strictEqual(cfg.promptHints, 'No emojis.');
	});

	test('parseCommitHeader: parses scoped and unscoped headers', () => {
		const scoped = parseCommitHeader('feat(ui)!: add button');
		assert.ok(scoped);
		assert.strictEqual(scoped?.type, 'feat');
		assert.strictEqual(scoped?.scope, 'ui');
		assert.strictEqual(scoped?.breaking, true);
		assert.strictEqual(scoped?.subject, 'add button');

		const unscoped = parseCommitHeader('chore: update deps');
		assert.ok(unscoped);
		assert.strictEqual(unscoped?.type, 'chore');
		assert.strictEqual(unscoped?.scope, undefined);
		assert.strictEqual(unscoped?.breaking, false);
		assert.strictEqual(unscoped?.subject, 'update deps');
	});

	test('validateCommitMessage: enforces allowed type and scope', () => {
		const rules: CommitGenRules = { maxSubjectLength: 72, requireScope: true, allowBreakingChange: true, subjectCase: 'any' };
		const ok = validateCommitMessage({
			message: 'feat(core): add config loader',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core', 'ui'],
			rules,
		});
		assert.deepStrictEqual(ok, { ok: true });

		const badScope = validateCommitMessage({
			message: 'feat(api): add endpoint',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core', 'ui'],
			rules,
		});
		assert.strictEqual(badScope.ok, false);
	});

	test('validateCommitMessage: rejects disallowed type', () => {
		const rules: CommitGenRules = { maxSubjectLength: 72, requireScope: true, allowBreakingChange: true, subjectCase: 'any' };
		const res = validateCommitMessage({
			message: 'feature(core): add thing',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core'],
			rules,
		});
		assert.strictEqual(res.ok, false);
	});
});
