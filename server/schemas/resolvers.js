const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        // queries the logged in user's info for the saved books page
        me: async (parent, args, context) => {
            // if user is logged in (logged in context has to exist)
            if (context.user) {
                // call findOne method on the logged in user's id, and populate
                // the savedBooks array attached to user
                return User.findOne({ _id: context.user._id }).populate('savedBooks')
            }
            throw new AuthenticationError('You need to be logged in')
        }
    },
    Mutation: {
        // mutation to add user, require username, email, and password to be
        // passed in
        addUser: async (parent, { username, email, password }) => {
            // call create method with the given input (from the forms)
            const user = await User.create({ username, email, password })
            // create a token, attach to the new user
            const token = signToken(user)
            // return the new user and the token
            return { token, user }
        },
        // login mutation with the given email and password (from form)
        login: async (parent, { email, password }) => {
            // call findOne method using the given email
            const user = await User.findOne({ email })

            // If the user doesn't exist, throw the error
            if (!user) {
                throw new AuthenticationError('Invalid credentials')
            }

            // call isCorrectPassword method from User model to compare 
            // db pw and form input pw
            const correctPw = await user.isCorrectPassword(password)

            // if pw's don't match, throw error
            if (!correctPw) {
                throw new AuthenticationError('Invalid credentials')
            }

            // create a token and attach to the signed in user
            const token = signToken(user)

            // returns the user and the token
            return { token, user }
        },
        // save book mutation
        saveBook: async (parent, { input }, context) => {
            // if the user is logged in
            if (context.user) {
                // call findOneAndUpdate method, find by id, and push the new 
                // book to the user's savedBooks array
                const userSaveBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: input } },
                    // update the db 
                    { new: true }
                )
                return userSaveBook
            }
            // if not logged in, throw this error
            throw new AuthenticationError('Must be logged in, in order to save books!')
        },
        // remove book mutation
        removeBook: async (parent, { bookId }, context) => {
            // if user is logged in
            if (context.user) {
                // call findOneAndUpdate method, find by logged in user's id,
                // and pull the given bookId from the user's savedBooks array
                const userDeleteBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )
                return userDeleteBook
            }
            // throw error if not logged in
            throw new AuthenticationError('Must be logged in to remove saved books!')
        }
    }
}

module.exports = resolvers