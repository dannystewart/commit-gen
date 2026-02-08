import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
	parseCommitHeader,
	parseUntrackedFilesFromPorcelainV1,
	validateCommitMessage,
} from '../core';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('parseCommitHeader: parses scoped and unscoped headers', () => {
		const scoped = parseCommitHeader('feat(ui)!: add button');
		assert.ok(scoped);
		assert.strictEqual(scoped?.type, 'feat');
		assert.strictEqual(scoped?.scope, 'ui');
		assert.strictEqual(scoped?.bang, true);
		assert.strictEqual(scoped?.subject, 'add button');

		const unscoped = parseCommitHeader('chore: update deps');
		assert.ok(unscoped);
		assert.strictEqual(unscoped?.type, 'chore');
		assert.strictEqual(unscoped?.scope, undefined);
		assert.strictEqual(unscoped?.bang, false);
		assert.strictEqual(unscoped?.subject, 'update deps');
	});

	test('validateCommitMessage: enforces allowed type and scope', () => {
		const ok = validateCommitMessage({
			message: 'feat(core): add config loader',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core', 'ui'],
			maxSubjectLength: 80,
		});
		assert.deepStrictEqual(ok, { ok: true });

		const badScope = validateCommitMessage({
			message: 'feat(api): add endpoint',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core', 'ui'],
			maxSubjectLength: 80,
		});
		assert.strictEqual(badScope.ok, false);
	});

	test('validateCommitMessage: rejects disallowed type', () => {
		const res = validateCommitMessage({
			message: 'feature(core): add thing',
			allowedTypes: ['feat', 'fix'],
			allowedScopes: ['core'],
			maxSubjectLength: 80,
		});
		assert.strictEqual(res.ok, false);
	});

	test('parseUntrackedFilesFromPorcelainV1: extracts ?? paths (including spaces)', () => {
		const status = [
			' M src/core.ts',
			'?? new-file.ts',
			'?? folder with spaces/file name.txt',
			'?? dir/',
		].join('\n');

		assert.deepStrictEqual(parseUntrackedFilesFromPorcelainV1(status), [
			'new-file.ts',
			'folder with spaces/file name.txt',
			'dir/',
		]);
	});
});
