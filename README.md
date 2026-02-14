# Scoped Commits

AI-powered Conventional Commit message generator for VS Code and Cursor with the ability to enforce predetermined scopes either globally or per workspace.

Available from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=dannystewart.scoped-commits).

## Features

- **AI-Generated Commit Messages**: Uses Claude to analyze your staged or working changes and generate detailed, structured commit messages
- **Conventional Commits**: Enforces the Conventional Commits format with customizable types and scopes
- **Flexible Configuration**: Customize commit types, scopes, subject length, and add project-specific prompt hints
- **Smart Validation**: Validates generated messages and automatically retries if they don't meet your project's standards

## Usage

Run the **Scoped Commits: Generate Commit Message** command from either the Command Palette or the sparkle icon in the Source Control view. It will analyze your staged changes (or working tree if nothing is staged), generate a message, and insert it into the commit message box.

Note that you must supply an API key via `scopedCommits.apiKey` (Anthropic or OpenAI) or an environment variable (`SCOPED_COMMITS_API_KEY`, `ANTHROPIC_API_KEY`, or `OPENAI_API_KEY`).

## Configuration

Configure Scoped Commits through VS Code/Cursor settings or your workspace's `.vscode/settings.json`.

- `scopedCommits.types` - Allowed commit types
  - Defaults: feat, fix, chore, docs, refactor, perf, test, build, ci, revert, style
- `scopedCommits.scopes` - Allowed scope/area names
  - Default: auth, config, data, integrations, nav, network, persistence, platform, security, state, sync, ui
- `scopedCommits.maxSubjectLength` - Maximum commit subject length (default: 80, range: 40-120)
- `scopedCommits.apiKey` - API key used to generate commit messages (either Anthropic or OpenAI)
  - Anthropic keys typically start with `sk-ant-`
  - OpenAI keys typically start with `sk-` (including `sk-proj-`)
- `scopedCommits.openaiModel` - OpenAI model ID to use (default: `gpt-5-mini`)
- `scopedCommits.anthropicModel` - Anthropic model ID to use (default: `claude-sonnet-4-5`)

### Project-Specific Rules

- `scopedCommits.promptHints` - Array of additional prompt rules for your workspace (e.g., style preferences, definitions, conventions)

### Example Configuration

```json
{
  "scopedCommits.types": ["feat", "fix", "docs", "refactor"],
  "scopedCommits.scopes": ["api", "ui", "db", "auth"],
  "scopedCommits.maxSubjectLength": 72,
  "scopedCommits.promptHints": [
    "Use past tense for database migrations",
    "Reference ticket numbers when available"
  ]
}
```

## License

This extension is open source under the [MIT License](LICENSE.md).
