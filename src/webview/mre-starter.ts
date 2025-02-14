import 'reflect-metadata'

import { ContainerConfiguration } from '@eclipse-glsp/client'
import { GLSPStarter } from '@eclipse-glsp/vscode-integration-webview'
import '@eclipse-glsp/vscode-integration-webview/css/glsp-vscode.css'
import { Container } from 'inversify'
import { initializeMREDiagramContainer } from '../extension/diagram/diagram/mre-diagram-module'

class MREStarter extends GLSPStarter {
	createContainer(...containerConfiguration: ContainerConfiguration): Container {
		return initializeMREDiagramContainer(new Container(), ...containerConfiguration)
	}
}

export function launchMREDiagram(): void {
	new MREStarter()
}
