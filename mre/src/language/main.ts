import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures, NotificationType } from 'vscode-languageserver/node.js';
import { createMreServices } from './mre-module.js';
import { DocumentState, URI } from 'langium'
import { isModel } from './generated/ast.js';

export type TableChange = { type: string; uri: string; content: string }

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared, Mre } = createMreServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);

connection.onRequest('modelRequest', async (params) => {
	const uri = URI.parse(params.uri)
	let entryDocument = shared.workspace.LangiumDocuments.getDocument(uri)
	if (!entryDocument) {
		await shared.workspace.DocumentBuilder.update([uri], [])
		entryDocument = shared.workspace.LangiumDocuments.getDocument(uri)
	}
	if (entryDocument) {
		const model = entryDocument.parseResult.value
		const jsonSerializer = Mre.serializer.JsonSerializer
		const entryTableChangeNotification = new NotificationType<TableChange>('entryTableChange')
		connection.sendNotification(entryTableChangeNotification, {
			type: 'model',
			uri: entryDocument.uri.toString(true),
			content: jsonSerializer.serialize(model),
		})
	}
})


// Send a notification with the serialized AST after every document change
const entryTableChangeNotification = new NotificationType<TableChange>('entryTableChange')
const requirementsSerializer = Mre.serializer.JsonSerializer
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, (documents) => {
	for (const document of documents) {
		const model = document.parseResult.value
		if (isModel(model)) {
			connection.sendNotification(entryTableChangeNotification, {
				type: 'model',
				uri: document.uri.toString(true),
				content: requirementsSerializer.serialize(model),
			})
		}
	}
})