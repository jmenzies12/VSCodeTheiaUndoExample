import {
	ActionHandlerConstructor,
	BindingTarget,
	CompoundOperationHandler,
	DiagramConfiguration,
	DiagramModule,
	GModelFactory,
	GModelIndex,
	InstanceMultiBinding,
	ModelState,
	OperationHandlerConstructor,
} from '@eclipse-glsp/server/node.js'
import { injectable } from 'inversify'
import { MREDiagramConfiguration } from './mre-diagram-configuration.js'
import { MREModelState } from './model/mre-model-state.js'
import { MREModelStorage } from './model/mre-model-storage.js'
import { MREGModelFactory } from './model/mre-gmodel-factory.js'
import { MREModelIndex } from './model/mre-diagram-model-index.js'
@injectable()
export class MREDiagramModule extends DiagramModule {
	readonly diagramType = 'mre-diagram'

	protected bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
		return MREDiagramConfiguration
	}

	protected bindSourceModelStorage(): BindingTarget<MREModelStorage> {
		return MREModelStorage
	}

	protected bindModelState(): BindingTarget<ModelState> {
		return { service: MREModelState }
	}

	protected bindGModelFactory(): BindingTarget<GModelFactory> {
		return MREGModelFactory
	}

	protected override configureActionHandlers(binding: InstanceMultiBinding<ActionHandlerConstructor>): void {
		super.configureActionHandlers(binding)
	}

	protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
		binding.add(CompoundOperationHandler)
	}

	protected override bindGModelIndex(): BindingTarget<GModelIndex> {
		this.context.bind(MREModelIndex).toSelf().inSingletonScope()
		return { service: MREModelIndex }
	}
}
