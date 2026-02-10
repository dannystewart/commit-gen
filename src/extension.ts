import * as vscode from 'vscode';
import { runGenerateCommitMessageCommand } from './core';

export function activate(context: vscode.ExtensionContext) {
	const generate = vscode.commands.registerCommand('scoped-commits.generateCommitMessage', async () => {
		await runGenerateCommitMessageCommand();
	});

	context.subscriptions.push(generate);
}

export function deactivate() {}
