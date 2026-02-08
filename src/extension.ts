import * as vscode from 'vscode';
import { runGenerateCommitMessageCommand, UserFacingError } from './core';

export function activate(context: vscode.ExtensionContext) {
	const generate = vscode.commands.registerCommand('commit-gen.generateCommitMessage', async () => {
		try {
			await runGenerateCommitMessageCommand();
		} catch (err) {
			if (err instanceof UserFacingError) {
				await vscode.window.showErrorMessage(err.message);
				return;
			}
			const msg = err instanceof Error ? err.message : String(err);
			await vscode.window.showErrorMessage(`Commit Gen failed: ${msg}`);
		}
	});

	context.subscriptions.push(generate);
}

export function deactivate() {}
