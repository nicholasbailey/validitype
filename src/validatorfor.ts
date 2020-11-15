
import {
    Validator,
    ValidationError,
    ValidatorBuilder,
    Check,
    ErrorMessageBuilder
} from './models'


function joinObjectPaths(...paths: (string | undefined)[]) {
    return paths.filter(x => x !== undefined).join('.')
}

function addRule<T>(baseValidator: Validator<T>, rule: Validator<T>) {
    return (value: any, errorCollector?: ValidationError[], path?: string): value is T => {
        const ruleResult = rule(value, errorCollector, path || "")
        const baseValidatorResult = baseValidator(value, errorCollector, path || "")

        return !!(ruleResult && baseValidatorResult)
    }
}

export function optionValidator<T>(baseValidator: Validator<T>): Validator<T | null> {
    return (x: any, errorCollector?: ValidationError[], path?: string): x is T | null => {
        if (x === null) {
            return true
        }
        else {
            return baseValidator(x, errorCollector, path)
        }
    }
}

function addSubValidator<T, K extends keyof T>(baseValidator: Validator<T>, key: K, subValidator: Validator<T[K]>): Validator<T> {
    return (x: any, errorCollector?: ValidationError[], path?: string): x is T => {

        const subValidatorPath = joinObjectPaths(path, key as string)
        let subValidatorResult: boolean
        if (x.hasOwnProperty && x.hasOwnProperty(key)) {
            subValidatorResult = subValidator(x[key], errorCollector, subValidatorPath)
        } else {
            subValidatorResult = false
        }
        const baseValidatorResult = baseValidator(x, errorCollector, path)

        return !!(subValidatorResult && baseValidatorResult)
    }
}

function makeValidatorBuilder<T>(baseValidator: Validator<T>): ValidatorBuilder<T> {
    const builder = <ValidatorBuilder<T>>baseValidator
    builder.withRule = function (rule: Validator<T> | Check, errorMessageBuilder?: ErrorMessageBuilder) {
        let actualRule: Validator<T>
        if (errorMessageBuilder) {
            actualRule = validatorFor<T>(rule, errorMessageBuilder)
        } else {
            actualRule = rule as Validator<T>
        }
        const newValidator = addRule(baseValidator, actualRule)
        return makeValidatorBuilder(newValidator)
    }

    // TODO - this is super un-type checked and makes me very jittery, and there's got to be a better way to get the effect we want
    builder.withRuleFor = function <K extends keyof T & string>(key: K, rule: Validator<T[K]> | Check, errorMessageBuilder?: ErrorMessageBuilder) {
        let propertyValidator: Validator<T[K]>
        if (errorMessageBuilder) {
            propertyValidator = validatorFor<T[K]>(rule, errorMessageBuilder)
        } else {
            propertyValidator = rule as Validator<T[K]>
        }
        const newValidator = addSubValidator(baseValidator, key, propertyValidator)
        return makeValidatorBuilder(newValidator)
    }

    return builder
}

export function validatorFor<T>(check?: Check, errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    let validator: ValidatorBuilder<T>
    if (check !== undefined && errorMessageBuilder !== undefined) {
        validator = <ValidatorBuilder<T>>function (x: any, errorCollector?: ValidationError[], path?: string): x is T {
            const valid = check(x)
            if (errorCollector !== undefined && !valid) {
                errorCollector.push({
                    path: path,
                    error: errorMessageBuilder(x)
                })
            }
            return valid
        }
    } else {
        validator = <ValidatorBuilder<T>>function (x: any, errorCollector?: ValidationError[], path?: string): x is T {
            return true
        }
    }
    return makeValidatorBuilder(validator)
}
