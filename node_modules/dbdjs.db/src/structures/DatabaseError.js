/**
 * The class for throwing database errors 
 * @param {string} the error to throw. 
 * @type {DatabaseError} 
 * @return {DatabaseError} The error thrown 
 */
module.exports = class DatabaseError extends Error {
    constructor(error) {
        super(error)
    }
}