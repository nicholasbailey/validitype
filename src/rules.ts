import {
    ErrorMessageBuilder,
    Validator,
} from './models';
import {
    validatorFor
} from './validatorfor'

export function isString<T extends string>(errorMessageBuilder?: ErrorMessageBuilder): Validator<T> {
    const defaultEmb: ErrorMessageBuilder = (x) => `Expected value of type string, but got type ${typeof x}`
    const emb: ErrorMessageBuilder = errorMessageBuilder || defaultEmb
    const check = (x: any) => typeof x === 'string'
    return validatorFor<T>(check, emb)
}

