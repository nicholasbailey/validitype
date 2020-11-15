import * as Rules from '../rules'

describe('Built-in validation rules', () => {
    describe('isString', () => {
        it('should check if a value is a string', () => {

            expect(Rules.isString()('hello')).toBe(true)
        })
    })
})