import { GModelIndex } from '@eclipse-glsp/server'
import { injectable } from 'inversify'
import { EntryNode, MREDiagram } from './mre-diagram-model'

@injectable()
export class MREModelIndex extends GModelIndex {
	protected idToEntryNodeElements = new Map<string, EntryNode>()

	indexMRE(mre: MREDiagram | undefined): void {
		this.idToEntryNodeElements.clear()
		for (const element of mre?.nodes ?? []) {
			this.idToEntryNodeElements.set(element.id, element)
		}
	}

	findEntryNode(id: string): EntryNode | undefined {
		return this.idToEntryNodeElements.get(id)
	}
}
