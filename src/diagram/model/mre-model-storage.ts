import { AbstractJsonModelStorage, ActionDispatcher, MaybePromise } from '@eclipse-glsp/server/node.js'
import { inject } from 'inversify'
import {generateModelFromAST } from './mre-diagram-model.js'
import { getLanguageClient } from '../../extension/main.js'
import { MREModelState } from './mre-model-state.js'
import { DocumentChange } from '../../language/main.js'

export class MREModelStorage extends AbstractJsonModelStorage {
	@inject(MREModelState)
	protected override modelState!: MREModelState

	@inject(ActionDispatcher)
	protected actionDispatcher!: ActionDispatcher

	constructor() {
		super()
	}

	loadSourceModel(): MaybePromise<void> {
		const languageClient = getLanguageClient()
		if (this.modelState.sourceUri) {
			// Otherwise nothing to load...
			return new Promise((resolve, reject) => {
				languageClient.sendRequest('modelRequest', { uri: this.modelState.sourceUri })
				languageClient.onNotification('node/DocumentChangeOnRequestToMREDiagram', async (documentChange: DocumentChange) => {
					for (const uri of documentChange.uri) {
						const index = documentChange.uri.indexOf(uri)
						if (uri === this.modelState.sourceUri) {
							const content = documentChange.content[index]
							if (content != null) {
								const mre = JSON.parse(content)
									this.modelState.updateSourceModel(generateModelFromAST(mre, this.modelState.sourceModel))
									resolve()
									return
							}
						}
					}
					reject(new Error('Cannot resolve diagram document'))
				})
			})
		}
	}

	saveSourceModel(): MaybePromise<void> {}
}
