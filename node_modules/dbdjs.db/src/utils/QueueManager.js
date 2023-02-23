const QueueStatusManager = require("./QueueStatusManager") 

/**
 * Manages the queue list for each table method. 
 * @type {object} 
 * @name QueueManager 
 */
module.exports = {
    /**
     * Data that's ready to be stored into the table database. 
     * @type {array} 
     * @property 
     */
    set: [], 
    /**
     * Requests requiring full database data will be encountered here. 
     * @type {array} 
     * @property 
     */ 
    all: [], 
    /**
     * Keys that are ready to get their info from the table database. 
     * @type {array} 
     * @property 
     */
    get: [], 
    /**
     * Keys that are ready to be deleted from the table database. 
     * @type {array} 
     * @property 
     */ 
    delete: [], 
    /**
     * Holds the statuses of each table method, view `QueueStatusManager` for more information. 
     * @type {object} 
     * @property 
     */ 
    status: {...QueueStatusManager} 
}
