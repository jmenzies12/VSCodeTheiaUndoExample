import {
	ConsoleLogger,
	ContainerConfiguration,
	LogLevel,
	TYPES,
	configureActionHandler,
	configureDefaultModelElements,
	initializeDiagramContainer,
} from '@eclipse-glsp/client'
import {
	SetModelAction,
	UpdateModelAction,
} from '@eclipse-glsp/sprotty'
import 'balloon-css/balloon.min.css'
import { Container, ContainerModule } from 'inversify'
import { ReloadModelActionHandler } from './actions/reload-model-action-handler.js'
import { ReloadModelAction } from './actions/reload-model-action.js'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const mreDiagramModule = new ContainerModule((bind: any, unbind: any, isBound: any, rebind: any) => {
	rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
	rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn)
	const context = { bind, unbind, isBound, rebind }
	configureDefaultModelElements(context)

	bind(ReloadModelActionHandler).toSelf().inSingletonScope()
	configureActionHandler(context, ReloadModelAction.KIND, ReloadModelActionHandler)
	configureActionHandler(context, SetModelAction.KIND, ReloadModelActionHandler)
	configureActionHandler(context, UpdateModelAction.KIND, ReloadModelActionHandler)
})

export function initializeMREDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
	return initializeDiagramContainer(container, mreDiagramModule, ...containerConfiguration)
}
