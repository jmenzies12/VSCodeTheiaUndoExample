import { ApplyLabelEditOperation } from '@eclipse-glsp/protocol'
import { Command, GLSPServerError, JsonOperationHandler, MaybePromise } from '@eclipse-glsp/server/node.js'
import { inject, injectable } from 'inversify'
import { MREModelState } from '../model/mre-model-state.js'
import { getLanguageClient } from '../../extension/main.js'
import { createAndSendCodeAction, createCodeActionParams } from './mre-code-action-utils.js'

@injectable()
export class MREApplyLabelEditHandler extends JsonOperationHandler {
	readonly operationType = ApplyLabelEditOperation.KIND

	@inject(MREModelState)
	protected override readonly modelState!: MREModelState

	override createCommand(operation: ApplyLabelEditOperation): MaybePromise<Command | undefined> {
		const languageClient = getLanguageClient()
		return this.commandOf(() => {
			const index = this.modelState.index
			// Retrieve the parent node of the label that should be edited
			const labelElement = index.get(operation.labelId)
			const entryGNode = labelElement.parent
			if (entryGNode && this.modelState.sourceUri) {
				const entryNode = index.findEntryNode(entryGNode.id)
				if (!entryNode) {
					throw new GLSPServerError(`Could not retrieve the parent node for the label with id ${operation.labelId}`)
				}

				const codeActionParams = createCodeActionParams('editDescription', this.modelState.sourceUri, {
					objectIdentifier: entryNode.sourceNode?.id,
					newValue: `'${operation.text}'`,
				})

				return createAndSendCodeAction(languageClient, codeActionParams)
			}
		})
	}
}
