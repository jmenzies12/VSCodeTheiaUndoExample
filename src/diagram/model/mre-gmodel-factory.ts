import { GGraph, GLabel, GModelFactory, GNode } from '@eclipse-glsp/server'
import { inject, injectable } from 'inversify'
import {  EntryNode } from './mre-diagram-model.js'
import { MREModelState } from './mre-model-state.js'

@injectable()
export class MREGModelFactory implements GModelFactory {
	@inject(MREModelState)
	protected modelState!: MREModelState

	createModel(): void {
		const mre = this.modelState.sourceModel
		this.modelState.index.indexMRE(mre)
		const graphNodes = [...mre.nodes.flatMap((entry) => this.generateNode(entry))]
		const newRoot = GGraph.builder() //
			.id('arg')
			.addChildren(graphNodes)
			.build()
		this.modelState.updateRoot(newRoot)
	}

	protected generateNode(entry: EntryNode): GNode {
		const sourceNode = entry.sourceNode

		const builder = GNode.builder().type('entry').id(entry.id).addCssClass('entry-node').layout('vbox').position(entry.position)

		let nodeSize = entry.size

		if (!nodeSize) {
			nodeSize = {
				width:  100,
				height: 100,
			}
		}

		builder.size(nodeSize)
		builder.addLayoutOptions({ prefWidth: nodeSize.width, prefHeight: nodeSize.height, hAlign: 'center', vAlign: 'center' })


		builder
			.add(
				GLabel.builder()
					.text(sourceNode?.id.toString() ?? '')
					.id(`${entry.id}_label`)
					.build(),
			)

		return builder.build()
	}
}
