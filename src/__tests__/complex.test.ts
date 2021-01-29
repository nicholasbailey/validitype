import {
    Validator,
    ValidatorBuilder,
    validatorFor,
    Rules
} from '../index'

type PhoneNumber = string
type StateAbbreviation = string
type Email = string
type ZipCode = string
type SKU = string
type USD = number

interface ContactInfo {
    primaryPhoneNumber: PhoneNumber,
    primaryEmail: Email,
    alternatePhoneNumbers: PhoneNumber[],
    alternateEmails: Email[]
}

interface Address {
    streetAddress: string,
    streetAddressTwo: string | null,
    city: string,
    state: StateAbbreviation,
    zipCode: ZipCode
}

interface OrderItem {
    sku: SKU,
    quantity: number,
    price: USD
}

interface Order {
    orderDate: Date,
    shippingAddress: Address,
    billingAddress: Address,
    items: OrderItem[]
    shippingCost: USD,
    totalCost: USD
}

interface Customer {
    firstName: string,
    lastName: string,
    middleName: string | null,
    dateOfBirth: Date
    contactInfo: ContactInfo,
    addresses: Address[],
    orders: Order[]
}

const stateAbbreviations = ['AL', 'AK', 'AZ', 'AR']

const {
    isString,
    hasLengthBetween,
    isArrayOf,
    matchesRegex,
    isOneOf,
    isNumber,
    hasPrecision,
    hasPrecision,
    isGreaterThan,
    isGreaterThanOrEqualTo,
} = Rules

describe('Complex idiomatic validation scenarios', () => {
    let isZipCode: ValidatorBuilder<ZipCode>
    let isUSD: ValidatorBuilder<USD>
    let isSku: ValidatorBuilder<SKU>
    let isStateAbbreviation: ValidatorBuilder<StateAbbreviation>
    let isPhoneNumber: ValidatorBuilder<PhoneNumber>
    let isEmail: ValidatorBuilder<Email>

    let isCustomer: ValidatorBuilder<Customer>
    let isContactInfo: ValidatorBuilder<ContactInfo>
    let isAddress: ValidatorBuilder<Address>
    let isOrder: ValidatorBuilder<Order>
    let isOrderItem: ValidatorBuilder<OrderItem>

    beforeEach(() => {
        isUSD = validatorFor<USD>()
            .withRule(isNumber().andAlso(hasPrecision(2)))

        isZipCode = validatorFor<ZipCode>()
            .withRule(matchesRegex(/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/))

        isStateAbbreviation = validatorFor<StateAbbreviation>()
            .withRule(isOneOf(stateAbbreviations))

        validatorFor<Address>().withRules(

        )

        isAddress = validatorFor<Address>()
            .withRuleFor('streetAddress', isString().andAlso(hasLengthBetween(1, 200)))
            .withRuleFor('streetAddressTwo', isString())
            .withRuleFor('city', isString().andAlso(hasLengthBetween(1, 50)))
            .withRuleFor('state', isStateAbbreviation)
            .withRuleFor('zipCode', isZipCode)

        isCustomer = validatorFor<Customer>()
            .withRuleFor('firstName', isString().andAlso(hasLengthBetween(1, 50)))
            .withRuleFor('lastName', isString().andAlso(hasLengthBetween(1, 50)))
            .withRuleFor('middleName', isString().andAlso(hasLengthBetween(1, 50)).isOptional())
            .withRuleFor('contactInfo', isContactInfo)
            .withRuleFor('addresses', isArrayOf<Address>(isAddress))
            .withRuleFor('orders', isArrayOf<Order>(isOrder))

        isOrder = validatorFor<Order>()
            .withRuleFor('items', isArrayOf<OrderItem>(isOrderItem))
            .withRuleFor('shippingAddress', isAddress)
            .withRuleFor('billingAddress', isAddress)
            .withRuleFor('shippingCost', isUSD.andAlso(isGreaterThanOrEqualTo(0)))
            .withRuleFor('totalCost', isUSD.andAlso(isGreaterThanOrEqualTo(0)))

        isOrderItem = validatorFor<OrderItem>()
            .withRuleFor('sku', isSku)
            .withRuleFor('quantity', isNumber())
            .withRuleFor('quantity', isGreaterThan(0))
            .withRuleFor('quantity', hasPrecision(0))
            .withRuleFor('price', isUSD)
    })
})