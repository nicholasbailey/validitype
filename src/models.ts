
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

    withRule(rule: Validator<T>): ValidatorBuilder<T>

    withRule(check: Check, errorMessageBuilder: ErrorMessageBuilder): ValidatorBuilder<T>

    withRuleFor<K extends keyof T & string>(key: K, rule: Validator<T[K]>): ValidatorBuilder<T>

    withRuleFor<K extends keyof T & string>(key: K, check: Check, errorMessageBuilder: ErrorMessageBuilder): ValidatorBuilder<T>
}

