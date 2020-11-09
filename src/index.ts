
export type ObjectPath = string
export type ErrorMessage = string

/**
 * Represents a failure in validating that an object conforms to a type
 */
export interface ValidationError {
    /**
     * The path in an object tree that navigates to the property 
     * for example if we have these interfaces
     * 
     * interface Name {
     *      first: string
     *      last: string
     * }
     * 
     * interface Person {
     *      name: Name
     * }
     * 
     * And the following Person instance
     * {
     *      name: {
     *          first: "Bob",
     *          last: null
     *      }
     * }
     * 
     * A validation error returned from a validator for Person might
     * look like:
     * {
     *      path: "name.last",
     *      error: "Cannot be null"
     * }
     */
    path?: ObjectPath

    /**
     * A string representing the error message
     */
    error: ErrorMessage
}

/**
 * Represents a validator that checks that a value is of a given type, and possibly
 * outputs some ValidationErrors. 
 * 
 * A Validator should perform as an ordinary type guard when
 * invoked with just the 'value' parameter.
 * 
 * ```
 * isString: Validator<string>
 * const x: any = 'hello'
 * // Should return true, type guard that x is a string
 * isString(x)
 * ```
 * 
 * When an error collector and path are provided, it operates as a classic 'validator'
 * by running a check, and appending one or more errors to the errorCollector. 
 * 
 * ```
 * isString: Validator<string>
 * const x: any = 'hello'
 * const errors: ValidationError[] = []
 * isString(x, errors, '')
 * ```
 * This pattern allows the errorCollector to accumulate errors by being passed down
 * through nested validation structures
 * 
 * @param {any} value - The value to validate
 * @param {ValidationError[]} errorCollector - A collection of validation errors
 * @param {ObjectPath} - A string object path of form 'x.y.z'. This path should be set
 *      on any validation errors output by the validator. This allows us to indicate
 *      exactly which fields failed in a nested validation structure
 * @typeparam T - The type the validator should check for
 */
export type Validator<T> = (
    value: any,
    errorCollector?: ValidationError[],
    path?: ObjectPath
) => value is T

/**
 * Represents a validation function checking some condition on a value
 */
export type Check = (value: any) => boolean

/**
 * Represents a function that builds error messages off of a value
 */
export type ErrorMessageBuilder = (value: any) => ErrorMessage

/**
 * A validator that also implements the builder pattern, allowing us
 * to define validators elegantly through chained function calls. 
 * 
 * interface Person {
 *     name: string,
 *     socialSecurityNumber: string,
 *     dateOfBirth: Date
 *     children: Person[]
 * }
 * 
 * validatorFor<Person>()
 *     .withRule(
 *         x => x.children.length < 10,
 *         x => x.children.length + ' is way too many children!'
 *      )
 *     .withSubValidator('socialSecurityNumber', isSocialSecurityNumber)
 * 
 * ValidatorBuilders should only be instantiated via the factory function validatorFor
 */
export interface ValidatorBuilder<T> extends Validator<T> {
    /**
     * Adds a validation rule checking the object
     * 
     * @param {Check} check - the validation function to use
     * @param {ErrorMessageBuilder} - a function for generating an error message if the object is not valid
     */
    withRule(check: Check, errorMessageBuilder: ErrorMessageBuilder): ValidatorBuilder<T>
    /**
     * Adds a sub-validator for a field. 
     * All error messages from a subvalidator will have the field key appended to their paths
     * so that a subvalidator for the field 'dateOfBirth' will have path 'dateOfBirth'
     * as we nest multiple layers of validators, the path will build up (e.g. foo.bar.baz)
     * 
     * @param {K} key - a key of our object, the value of which will be validated using the subvalidator
     * @param {Validator<T[K]>} - the validator to use a subvalidator 
     */
    withSubValidator<K extends keyof T>(key: K, validator: Validator<T[K]>): ValidatorBuilder<T>

    withRuleFor<K extends keyof T & string>(key: K, check: Check, errorMessageBuilder: ErrorMessageBuilder): ValidatorBuilder<T>

    // withCollectionSubvalidator<K extends keyof T, U>(key: K, validator: Validator<U>): ValidatorBuilder<T>
}



function joinObjectPaths(...paths: (string | undefined)[]) {
    return paths.filter(x => x !== undefined).join('.')
}

function addRule<T>(baseValidator: Validator<T>, check: Check, errorMessageBuilder: ErrorMessageBuilder) {
    return (x: any, errorCollector?: ValidationError[], path?: string): x is T => {
        const checkValid = check(x)
        if (errorCollector !== undefined && !checkValid) {
            errorCollector.push({
                path: path || '',
                error: errorMessageBuilder(x)
            })
        }
        const baseValid = baseValidator(x, errorCollector, path)
        return !!(checkValid && baseValid)
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

function addRuleFor<T, K extends keyof T & string>(baseValidator: Validator<T>, key: K, check: Check, errorMessageBuilder: ErrorMessageBuilder) {
    return (x: any, errorCollector?: ValidationError[], path?: string): x is T => {
        const isObject = typeof x === 'object'
        let checkValid = true
        if (isObject) {
            const xAsObj: object = x as object
            if (xAsObj.hasOwnProperty(key)) {
                checkValid = check(x[key])
                if (errorCollector !== undefined && !checkValid) {
                    errorCollector.push({
                        path: joinObjectPaths(path, key),
                        error: errorMessageBuilder(x[key])
                    })
                }
            } else {
                checkValid = false
                if (errorCollector !== undefined) {
                    errorCollector.push({
                        path: path || '',
                        error: `Value ${x} does not have a property ${key}!`
                    })
                }
            }
        }
        const baseValid = baseValidator(x, errorCollector, path)
        return !!(isObject && checkValid && baseValid)
    }
}

function makeValidatorBuilder<T>(x: Validator<T>): ValidatorBuilder<T> {
    const builder = <ValidatorBuilder<T>>x
    builder.withSubValidator = function <K extends keyof T>(key: K, rule: Validator<T[K]>) {
        const newValidator = addSubValidator(x, key, rule)
        return makeValidatorBuilder(newValidator)
    }
    builder.withRule = function (check: Check, errorMessageBuilder: ErrorMessageBuilder) {
        const newValidator = addRule(x, check, errorMessageBuilder)
        return makeValidatorBuilder(newValidator)
    }
    builder.withRuleFor = function <K extends keyof T & string>(key: K, rule: Check, errorMessageBuilder: ErrorMessageBuilder) {
        const newValidator = addRuleFor(x, key, rule, errorMessageBuilder)
        return makeValidatorBuilder(newValidator)
    }

    return builder
}

function addSubValidator<T, K extends keyof T>(baseValidator: Validator<T>, key: K, rule: Validator<T[K]>): Validator<T> {
    return (x: any, errorCollector?: ValidationError[], path?: string): x is T => {

        const subValidatorPath = joinObjectPaths(path, key as string)
        const subValidatorResult = rule(x[key], errorCollector, subValidatorPath)
        const baseValidatorResult = baseValidator(x, errorCollector, path)

        return !!(subValidatorResult && baseValidatorResult)
    }
}

export function validatorFor<T>(check?: Check, errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    let validator: ValidatorBuilder<T>
    if (check !== undefined && errorMessageBuilder !== undefined) {
        validator = <ValidatorBuilder<T>>function (x: any, errorCollector?: ValidationError[], path?: string): x is T {
            const valid = check(x)
            if (errorCollector !== undefined) {
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


export namespace Validators {

}