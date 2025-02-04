import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { MreGeneratedModule, MreGeneratedSharedModule } from './generated/module.js';
import { MreValidator, registerValidationChecks } from './mre-validator.js';
import { MreCodeActionProvider } from './mre-code-actions.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type MreAddedServices = {
    validation: {
        MreValidator: MreValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type MreServices = LangiumServices & MreAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const MreModule: Module<MreServices, PartialLangiumServices & MreAddedServices> = {
    validation: {
        MreValidator: () => new MreValidator()
    },
	lsp: {
		CodeActionProvider: (services) => new MreCodeActionProvider(services),
	},
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createMreServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Mre: MreServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        MreGeneratedSharedModule
    );
    const Mre = inject(
        createDefaultModule({ shared }),
        MreGeneratedModule,
        MreModule
    );
    shared.ServiceRegistry.register(Mre);
    registerValidationChecks(Mre);
    if (!context.connection) {
        // We don't run inside a language server
        // Therefore, initialize the configuration provider instantly
        shared.workspace.ConfigurationProvider.initialized({});
    }
    return { shared, Mre };
}
