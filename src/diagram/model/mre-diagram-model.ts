import { AnyObject, Dimension, hasArrayProp, hasObjectProp, hasStringProp, Point } from '@eclipse-glsp/server'
import { MD5 } from 'object-hash'
import { Entry, Model } from '../../language/generated/ast.js'

export interface MREDiagram {
	id: string
	nodes: EntryNode[]
}

export function isMREDiagram(object: object | undefined): object is MREDiagram {
	return AnyObject.is(object) && hasStringProp(object, 'id') && hasArrayProp(object, 'nodes')
}

export interface EntryNode {
	id: string
	sourceNode?: Entry
	position: Point
	sourceNodeName?: number
	size?: Dimension
}

export function isEntryNode(object: object | undefined): object is EntryNode {
	return AnyObject.is(object) && hasStringProp(object, 'id') && hasObjectProp(object, 'position')
}

export function generateModelFromAST(model: Model, existingDiagram: MREDiagram): MREDiagram {
	const nodes = model.entries.flatMap((entry) => createDiagramNodes(entry, existingDiagram))
	return {
		id: 'mre', //this needs to change in order to load the persistence? or maybe it doesn't
		nodes: [...nodes],
	}
}

function createDiagramNodes(rootNode: Entry, existingDiagram: MREDiagram): EntryNode [] {
	const diagramNode = createDiagramNode(rootNode, existingDiagram)

	let nodes: EntryNode[] = [diagramNode]

	return nodes
}

function createDiagramNode(rootNode: Entry, existingDiagram: MREDiagram): EntryNode {
	const rootNodeHash = MD5(rootNode)
		let existingNode: EntryNode | undefined

		if (existingDiagram) {
			existingDiagram.nodes.forEach((node) => {
				if (node.sourceNodeName == rootNode.id || node.sourceNode?.id == rootNode.id) {
					existingNode = node
				}
			})
		}

		if (existingNode) {
			return {
				id: rootNodeHash,
				sourceNode: rootNode,
				position: existingNode.position,
				size: existingNode.size,
			}
		}
	

	return {
		id: rootNodeHash,
		sourceNode: rootNode,
		position: {
			x: 300,
			y: 50,
		},
	}
}
