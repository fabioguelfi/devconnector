const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateRegisterInput(data) {
    let errors = {}
    if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 characters'
    }
    if (validator.isEmpty(data.name)) {
        errors.name = 'name field is required'
    }

    if (validator.isEmpty(data.email)) {
        errors.email = 'email field is required'
    }

    if (validator.isEmpty(data.password)) {
        errors.password = 'password is required'
    }

    if (!validator.isEmail(data.password, { min: 6, max: 30 })) {
        errors.password = 'password must be at least 6 characters'
    }

    if (validator.isEmpty(data.password2)) {
        errors.password2 = 'password2 is required'
    }

    if (validator.equals(data.password, data.password2)) {
        errors.password2 = 'password must match'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}