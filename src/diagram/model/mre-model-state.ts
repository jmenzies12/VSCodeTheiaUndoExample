import { DefaultModelState, JsonModelState } from '@eclipse-glsp/server'
import { inject, injectable } from 'inversify'
import { MREDiagram } from './mre-diagram-model'
import { MREModelIndex } from './mre-diagram-model-index'

@injectable()
export class MREModelState extends DefaultModelState implements JsonModelState<MREDiagram> {
	@inject(MREModelIndex)
	override readonly index!: MREModelIndex
	protected _mre!: MREDiagram

	get sourceModel(): MREDiagram {
		return this._mre
	}

	updateSourceModel(mre: MREDiagram): void {
		this._mre = mre
		this.index.indexMRE(mre)
	}
}
