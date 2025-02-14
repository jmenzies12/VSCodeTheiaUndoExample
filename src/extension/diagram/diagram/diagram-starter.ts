import 'reflect-metadata'
import { LogLevel, ServerModule, createAppModule } from '@eclipse-glsp/server/node.js'
import { GlspVscodeConnector, NodeGlspVscodeServer, configureDefaultCommands } from '@eclipse-glsp/vscode-integration/node.js'
import { ContainerModule } from 'inversify'
import * as vscode from 'vscode'
import { configureELKLayoutModule } from '@eclipse-glsp/layout-elk'
import { MREDiagramModule } from '../../../diagram/mre-diagram-module'
import MREEditorProvider from './mre-editor-provider'

export async function startDiagram(context: vscode.ExtensionContext): Promise<void> {
	const diagramServer = new NodeGlspVscodeServer({
		clientId: 'glsp.mre',
		clientName: 'mreDiagramClient',
		serverModules: createServerModules(),
	})

	// Initialize GLSP-VSCode connector with server wrapper
	const glspVscodeConnector = new GlspVscodeConnector({
		server: diagramServer,
		logging: true,
	})

	const mreDiagramEditorProvider = vscode.window.registerCustomEditorProvider(
		'mre.glspDiagram',
		new MREEditorProvider(context, glspVscodeConnector),
		{
			webviewOptions: { retainContextWhenHidden: true },
			supportsMultipleEditorsPerDocument: false,
		},
	)

	context.subscriptions.push(diagramServer, glspVscodeConnector, mreDiagramEditorProvider)
	diagramServer.start()

	configureDefaultCommands({ extensionContext: context, connector: glspVscodeConnector, diagramPrefix: 'mre' })
}

function createServerModules(): ContainerModule[] {
	const appModule = createAppModule({ logLevel: LogLevel.debug, fileLog: false, consoleLog: true })
	const elkLayoutModule = configureELKLayoutModule({ algorithms: ['layered'] })
	const mreDiagramModule = new MREDiagramModule()
	const mainModule = new ServerModule().configureDiagramModule(mreDiagramModule, elkLayoutModule)
	return [appModule, mainModule]
}
