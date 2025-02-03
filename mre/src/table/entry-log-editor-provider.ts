import * as vscode from 'vscode'
import {
	LanguageClient,
} from 'vscode-languageclient/node.js'
import { TableChange } from '../language/main'

export class EntryLogEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext, client: LanguageClient): vscode.Disposable {
		const provider = new EntryLogEditorProvider(context, client)
		return vscode.window.registerCustomEditorProvider(EntryLogEditorProvider.viewType, provider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		})
	}

	private static readonly viewType = 'mre.entryLog'

	private webviewPanels: { webviewPanel: vscode.WebviewPanel; uri: string }[] = []
	constructor(
		private readonly context: vscode.ExtensionContext,
		private readonly client: LanguageClient,
	) {
		context.subscriptions.push(this.documentChangeListener)
	}
    
    resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Thenable<void> | void {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		}

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview)

		this.webviewPanels.push({ webviewPanel: webviewPanel, uri: document.uri.toString(true) })

		webviewPanel.onDidDispose(() => {
			this.webviewPanels = this.webviewPanels.filter((panel) => panel.webviewPanel !== webviewPanel)
		})

        webviewPanel.webview.onDidReceiveMessage((message) => {
			if (message.command === 'modelRequest') {
				this.updateWebview(document.uri.toString(true))
			} 
        })
    }

    private updateWebview(uri: string): void {
		this.client.sendRequest('modelRequest', { uri: uri })
	}

    private documentChangeListener = this.client.onNotification('entryTableChange', (documentChange: TableChange) => {
		this.webviewPanels
			.filter((webviewPanel) => webviewPanel.uri === documentChange.uri)
			.forEach((panel) => {
				panel.webviewPanel.webview.postMessage(documentChange)
			})
	})

	private getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'out', 'table', 'entry-log-app.mjs'),
		)
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Panel Title Goes Here</title>
			</head>
			<body>
				<div id="root"></div>
				<script type="module" src="${scriptUri}"></script>
			</body>
			</html>`
	}
}