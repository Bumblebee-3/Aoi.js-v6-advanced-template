/**
 * Object holding statuses for the table queues. 
 * @type {object} 
 * @name QueueStatusManager 
 */
module.exports = {
	/**
	 * Whether the table is currently saving data.
	 * @sub status
	 * @type {boolean}
	 * @property
	 */
	set: false,
	/**
	 * Whether the database is currently pulling all the data from the database table.
	 * @type {array} 
	 * @property 
	 */
	all: false, 
	/**
	 * Whether the database is currently processing requests to get data from the database.
	 * @type {boolean}
	 * @sub status
	 * @property
	 */
	get: false,
	/**
	 * Whether the database is currently deleting supplied keys from the database.
	 * @sub status
	 * @type {boolean}
	 * @property
	 */

	delete: false
};
