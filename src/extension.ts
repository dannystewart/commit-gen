import * as vscode from 'vscode';
import {
	runCommitAllAmendAndForcePushCommand,
	runCommitStagedAmendCommand,
	runGenerateCommitMessageCommand,
	showCommitGenOutput,
} from './core';

export function activate(context: vscode.ExtensionContext) {
	const generate = vscode.commands.registerCommand('commit-gen.generateCommitMessage', async () => {
		await runGenerateCommitMessageCommand();
	});

	const commitStagedAmend = vscode.commands.registerCommand('commit-gen.commitStagedAmend', async () => {
		await runCommitStagedAmendCommand();
	});

	const commitAllAmendAndForcePush = vscode.commands.registerCommand('commit-gen.commitAllAmendAndForcePush', async () => {
		await runCommitAllAmendAndForcePushCommand();
	});

	const openOutput = vscode.commands.registerCommand('commit-gen.openOutput', () => {
		showCommitGenOutput();
	});

	context.subscriptions.push(generate, commitStagedAmend, commitAllAmendAndForcePush, openOutput);
}

export function deactivate() {}
