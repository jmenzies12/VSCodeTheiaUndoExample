import type { ValidationChecks } from 'langium';
import type { MreAstType } from './generated/ast.js';
import type { MreServices } from './mre-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MreServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MreValidator;
    const checks: ValidationChecks<MreAstType> = {
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MreValidator {

}
