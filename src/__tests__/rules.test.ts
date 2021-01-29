import * as Rules from '../rules'

describe('Built-in validation rules', () => {
    describe('isString', () => {
        it('should check if a value is a string', () => {
            expect(Rules.isString()('hello')).toBe(true)
            expect(Rules.isString()(undefined)).toBe(false)
            expect(Rules.isString()(0)).toBe(false)
        })
    })

    describe('isObject', () => {
        it('should check if a value is an object', () => {
            expect(Rules.isObject()('hello')).toBe(false)
            expect(Rules.isObject()({})).toBe(true)
        })
    })


    describe('isBoolean', () => {
        it('should check if a value is an boolean', () => {
            expect(Rules.isBoolean()(true)).toBe(true)
            expect(Rules.isBoolean()('true')).toBe(false)
        })
    })

    describe('isFunction', () => {
        it('should check if a value is a function', () => {
            expect(Rules.isFunction()(() => 1)).toBe(true)
            expect(Rules.isBoolean()({})).toBe(false)
        })
    })

    describe('isNumber', () => {
        it('should check if a value is a number', () => {
            expect(Rules.isNumber()(1)).toBe(true)
            expect(Rules.isBoolean()('1')).toBe(false)
        })
    })

    describe('is', () => {
        it('should check if a value is another value', () => {
            expect(Rules.is(1)(1)).toBe(true)
            expect(Rules.is(1)('1')).toBe(false)
        })
    })

    describe('isOneOf', () => {
        it('should check if a value is one of several values', () => {
            expect(Rules.isOneOf([1, 2, 3])(1)).toBe(true)
            expect(Rules.isOneOf([1, 2, 3])(2)).toBe(true)
            expect(Rules.isOneOf([1, 2, 3])(3)).toBe(true)
            expect(Rules.isOneOf([1, 2, 3])(4)).toBe(false)
            expect(Rules.isOneOf([1, 2, 3])('1')).toBe(false)
        })
    })
})