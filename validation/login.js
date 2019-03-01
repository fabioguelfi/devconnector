const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateLoginInput(data) {
    let errors = {}

    if (validator.isEmpty(data.email)) {
        errors.email = 'email field is required'
    }

    if (validator.isEmpty(data.password)) {
        errors.password = 'password is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}