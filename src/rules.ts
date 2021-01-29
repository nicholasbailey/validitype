import {
    ErrorMessageBuilder,
    ValidatorBuilder
} from './models';
import {
    validatorFor
} from './validatorfor'


export function isString<T extends string>(errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type string, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'string'
    return validatorFor<T>(check, emb)
}

export function isObject<T extends object>(errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type object, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'object'
    return validatorFor<T>(check, emb)
}

export function isBoolean<T extends boolean>(errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type boolean, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'boolean'
    return validatorFor<T>(check, emb)
}

export function isFunction<T extends Function>(errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type function, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'function'
    return validatorFor<T>(check, emb)
}

export function isNumber<T extends number>(errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type number, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'number'
    return validatorFor<T>(check, emb)
}

export function is<T>(expected: T, errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected ${expected} but got ${x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => x === expected
    return validatorFor<T>(check, emb)
}

export function isOneOf<T>(expected: T[], errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {

    const defaultEmb: ErrorMessageBuilder = (x) => `Expected one of ${expected.map(x => String(x)).join(',')} but got ${x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => {
        for (const elem of expected) {
            if (x === elem) {
                return true
            }
        }
        return false
    }

    return validatorFor<T>(check, emb)
}

export function hasLengthBetween(min: number, max: number, errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<any> {

    const defaultEmb: ErrorMessageBuilder = (x: any) => {
        if (x === undefined || x === null || x.length === undefined) {
            return 'Value has no property length'
        } else {
            return `Expected a length between ${min} and ${max} but got a length of ${length}`
        }
    }
    const emb = errorMessageBuilder || defaultEmb
    const check = (x: any) => {
        if (x === undefined || x === null || x.length === undefined) {
            return false
        } else {
            return x.length >= min && x.length < max
        }
    }

    return validatorFor<any>(check, emb)
}

export function matchesRegex<T extends string>(regex: RegExp, errorMessageBuilder?: ErrorMessageBuilder): ValidatorBuilder<T> {

}
