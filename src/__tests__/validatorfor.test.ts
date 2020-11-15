import {
    Validator,
    ValidationError,
    validatorFor
} from '../index'

import 'jest-extended'

// It is important to use cool test examples, like spaceships
// rather than lame test examples, like customers

interface BigObject {
    massInTons: number,
    lengthInMeters: number
}

interface SpaceshipEngine {
    type: string,
    maxAcceleration: number,
    safeInAtmosphere: boolean
}

interface Spaceship extends BigObject {
    name: string,
    crewCount: number,
    engines: SpaceshipEngine
}

const spaceShipValidator = validatorFor<Spaceship>()



function aValidSpaceShip(): Spaceship {
    return {
        name: 'Spaceship McAwesome',
        crewCount: 470,
        massInTons: 1000000,
        lengthInMeters: 324,
        engines: {
            type: 'Fusion Rocket',
            maxAcceleration: 90000,
            safeInAtmosphere: false
        }
    }
}

describe('The fluent validator builder API', () => {

    describe('Empty validators', () => {
        it('should function as type guards', () => {
            const spaceShipValidator: Validator<Spaceship> = validatorFor<Spaceship>();
            const exampleSpaceShip: Spaceship = aValidSpaceShip()
            const isValid: boolean = spaceShipValidator(exampleSpaceShip)
            expect(isValid).toBe(true)
        })

        it('should allow you to pass an array to collect error messages', () => {
            const spaceShipValidator: Validator<Spaceship> = validatorFor<Spaceship>();
            const exampleSpaceShip: Spaceship = aValidSpaceShip()
            const errorCollector: ValidationError[] = []
            const isValid: boolean = spaceShipValidator(exampleSpaceShip, errorCollector)
            expect(isValid).toBe(true)
            expect(errorCollector).toEqual([])
        })

        it('should allow you to pass an object path for error reporting in nested objects', () => {
            const spaceShipValidator: Validator<Spaceship> = validatorFor<Spaceship>();
            const exampleSpaceShip: Spaceship = aValidSpaceShip()
            const errorCollector: ValidationError[] = []
            const isValid: boolean = spaceShipValidator(exampleSpaceShip, errorCollector, 'spaceship')
            expect(isValid).toBe(true)
            expect(errorCollector).toEqual([])
        })


        it('should treat any input as a valid', () => {
            const spaceShipValidator: Validator<Spaceship> = validatorFor<Spaceship>();
            const notASpaceShip = 127
            const isValid: boolean = spaceShipValidator(notASpaceShip)
            expect(isValid).toBe(true)
        })
    })

    describe('withRule', () => {
        it('should allow us to create a validation rule based on a boolean check', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.crewCount > 0, (ship) => 'Spaceships need a crew!')

            const validSpaceship = aValidSpaceShip()
            const invalidSpaceship = { name: 'A big rock', crew: 0 }

            expect(validator(validSpaceship)).toBe(true)
            expect(validator(invalidSpaceship)).toBe(false)
        })

        it('should allow us to create any number of boolean rules', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.crewCount > 0, (ship) => 'Spaceships need a crew!')
                .withRule((ship) => ship.name && ship.name.length > 0, (ship) => 'Spaceships need cool names!')

            expect(validator(aValidSpaceShip())).toBe(true)
            expect(validator({ name: 'A big rock', crew: 0 })).toBe(false)
            expect(validator({ crewCount: 137 })).toBe(false)
        })

        it('should accumulate errors in an error collector if one is passed in', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.crewCount > 0, (ship) => 'Spaceships need a crew!')
                .withRule((ship) => ship.name && ship.name.length > 0, (ship) => 'Spaceships need cool names!')
            const errorCollector: ValidationError[] = []

            validator({}, errorCollector)

            expect(errorCollector).toEqual([
                { error: 'Spaceships need cool names!', path: "" },
                { error: 'Spaceships need a crew!', path: "" }
            ])
        })

        it('should only accumulate errors for errors that occur', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.crewCount > 0, (ship) => 'Spaceships need a crew!')
                .withRule((ship) => ship.name && ship.name.length > 0, (ship) => 'Spaceships need cool names!')
            const errorCollector: ValidationError[] = []

            validator({ crewCount: 137 }, errorCollector)

            expect(errorCollector).toEqual([
                { error: 'Spaceships need cool names!', path: "" }
            ])
        })

        it('should extend errors with the path passed in if there is one', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.crewCount > 0, (ship) => 'Spaceships need a crew!')
                .withRule((ship) => ship.name && ship.name.length > 0, (ship) => 'Spaceships need cool names!')
            const errorCollector: ValidationError[] = []

            validator({}, errorCollector, "spaceship")

            expect(errorCollector).toEqual([
                { error: 'Spaceships need cool names!', path: "spaceship" },
                { error: 'Spaceships need a crew!', path: "spaceship" }
            ])
        })
    })

    describe('withRuleFor', () => {
        it('should allow us to set rules for sub-properties', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const isValid = validator(aValidSpaceShip())

            expect(isValid).toBe(true)
        })

        it('should check rules for those subproperties', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const isValid = validator({ crewCount: 0, name: '???' })

            expect(isValid).toBe(false)
        })

        it('should implicitly check for the presence of the field', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const isValid = validator({})

            expect(isValid).toBe(false)
        })

        it('should support any number of rules for a field', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('name', (name) => name.length < 50, (name) => `${name} is too darn long`)

            const isValid = validator({
                name: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
            })

            expect(isValid).toBe(false)
        })

        it('should output error messages for rules based on they value associated with the key, with an appropriate path', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('name', (name) => name.length < 50, (name) => `${name} is too darn long`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const errorCollector: ValidationError[] = []
            const isValid = validator({
                name: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
                crewCount: 0
            }, errorCollector)

            expect(errorCollector).toIncludeSameMembers([
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is not alphanumeric', path: 'name' },
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is too darn long', path: 'name' },
                { error: 'Spaceships need a crew!', path: 'crewCount' }
            ])
        })

        it('should join the field paths to any path passed in as a context', () => {
            const validator = validatorFor<Spaceship>()
                .withRuleFor('name', validatorFor<string>((name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`))
                .withRuleFor('name', (name) => name.length < 50, (name) => `${name} is too darn long`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const errorCollector: ValidationError[] = []
            const isValid = validator({
                name: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
                crewCount: 0
            }, errorCollector, 'spaceship')

            // Note: this is a Set to remind us that there are no guarentees about error ordering
            expect(errorCollector).toIncludeSameMembers([
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is not alphanumeric', path: 'spaceship.name' },
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is too darn long', path: 'spaceship.name' },
                { error: 'Spaceships need a crew!', path: 'spaceship.crewCount' }
            ])
        })

        it('should be combineable with normal rules', () => {
            const validator = validatorFor<Spaceship>()
                .withRule((ship) => ship.engines !== undefined, (ship) => 'Spaceships need engines!')
                .withRuleFor('name', (name) => name.match(/^[a-zA-Z0-9 ]+/), (name) => `${name} is not alphanumeric`)
                .withRuleFor('name', (name) => name.length < 50, (name) => `${name} is too darn long`)
                .withRuleFor('crewCount', (count) => count > 0, (crewCount) => 'Spaceships need a crew!')

            const errorCollector: ValidationError[] = []
            const isValid = validator({
                name: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
                crewCount: 0
            }, errorCollector, 'spaceship')

            // Again, Set to remind us that we don't guarentee order.
            expect(errorCollector).toIncludeSameMembers([
                { error: 'Spaceships need engines!', path: 'spaceship' },
                { error: 'Spaceships need a crew!', path: 'spaceship.crewCount' },
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is not alphanumeric', path: 'spaceship.name' },
                { error: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! is too darn long', path: 'spaceship.name' },
            ])
        })
    })

    describe('withRuleFor assigning subvalidators', () => {
        let spaceshipValidator: Validator<Spaceship>

        beforeAll(() => {
            const engineValidator = validatorFor<SpaceshipEngine>()
                .withRuleFor('type',
                    (engineType) => engineType === 'Fusion Rocket' || engineType === 'Chemical Rocket',
                    (engineType) => `${engineType} is not a valid engine type`
                ).withRule(
                    (engines) => engines.safeInAtmosphere === false || engines.type === 'Chemical Rocket',
                    (engines) => 'Only chemical rockets are possibly safe in the atmosphere'
                )

            spaceshipValidator = validatorFor<Spaceship>()

                .withRuleFor('name',
                    (name) => name && name.length > 0,
                    (name) => 'Spaceships need cool names'
                ).withRuleFor(
                    'engines',
                    engineValidator
                )
        })

        it('should allow us to validate object properties of an of an object', () => {
            expect(spaceshipValidator(aValidSpaceShip())).toBe(true)
            expect(spaceshipValidator({
                name: 'Awesome McCoolship',
                engines: {
                    type: 'Reactionless'
                }
            })).toBe(false)
        })

        it('should emit error messages for sub properties with appropriate paths', () => {
            const errorAccumulator: ValidationError[] = []
            const ship = {
                name: '',
                engines: {
                    type: 'Reactionless',
                    maxAcceleration: 10000000000,
                    safeInAtmosphere: true
                }
            }
            const isValid = spaceshipValidator(ship, errorAccumulator)

            expect(errorAccumulator).toIncludeSameMembers([
                { error: 'Spaceships need cool names', path: 'name' },
                { error: 'Reactionless is not a valid engine type', path: 'engines.type' },
                { error: 'Only chemical rockets are possibly safe in the atmosphere', path: 'engines' }
            ])
        })
    })
})