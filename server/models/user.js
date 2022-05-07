const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    fname:  {
        type: String,
        required: true,
        validate: (value) => {
            return value.length >= 1
        }
    },
    lname:  {
        type: String,
        required: true,
        validate: value => value.length >= 1
    },
    email:  {
        type: String,
        required: true,
        unique: true,
        validate: value => validator.isEmail(value)
    },
    password: {
        type: String,
        required: true,
        validate: value => value.length >= 8
    }
})

module.exports = new mongoose.model('Users', userSchema);