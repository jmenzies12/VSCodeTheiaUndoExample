import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures, NotificationType } from 'vscode-languageserver/node.js';
import { createMreServices } from './mre-module.js';
import { DocumentState, URI } from 'langium'

export type DocumentChange = { uri: string[]; content: string[]; type?: string }

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
		const jsonSerializer = Mre.serializer.JsonSerializer
		connection.sendNotification(new NotificationType<DocumentChange>('node/DocumentChangeOnRequestToMREDiagram'), {
			uri: [entryDocument.uri.toString(true)],
			content: [jsonSerializer.serialize(entryDocument.parseResult.value)],
		})
	}
})


// Send a notification with the serialized AST after every document change

const mreSerializer = Mre.serializer.JsonSerializer
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, (documents) => {
	const mreDocuments = shared.workspace.LangiumDocuments.all.filter((doc) => doc.uri.toString().endsWith('.mre'))
	const mreUris = mreDocuments.map((doc) => doc.uri.toString(true)).toArray()
	const mreContent = mreDocuments.map((doc) => mreSerializer.serialize(doc.parseResult.value)).toArray()
	connection.sendNotification(new NotificationType<DocumentChange>('node/DocumentChangeToMREDiagram'), {
		uri: mreUris,
		content: mreContent,
	})
})