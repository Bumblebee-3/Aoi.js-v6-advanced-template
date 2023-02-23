/**
 * Main class that holds data for each key. 
 * @type {Data} 
 * @param data {object} the data for this key. 
 * @param db {Database} the database that this key belongs to. 
 * @param method {?string} the method that's being used to call this class. 
 * @return {Data} the data that was assigned to this class. 
 */
module.exports = class Data {
    constructor(data, db, method) {
        /**
         * The database this data comes from. 
         * @type {Database} 
         * @property 
         */
        this.db = db 
        
        this._resolve(data, method)
    }
    
    /**
     * Resolves given data. 
     * @param data {object} the data for the key. 
     * @param method {?string} the method that's calling this constructor. 
     * @type {function} 
     */ 
    _resolve(data = {}, method) {
        /**
         * The key this value belongs to
         * @property 
         * @type {string} 
         */
        this.key = data.key 
        
        /**
         * The value for this key 
         * @property 
         * @type {any} 
         */
        this.value = data.value
        
        /**
         * Whether this key has ttl. 
         * @property 
         * @type {number|undefined}
         */
        this.ttl = data.ttl 
        
        if (this.db.timestamp) {
            /**
             * The time which this data was created at. 
             * Will only be present if `timestamp` option is set to true. 
             * @property 
             * @type {?number} 
             */
            this.createdAt = data.createdAt || Date.now() 
            
            /**
             * The time which this data was last updated at. 
             * Will only be present if `timestamp` option is set to true. 
             * @property 
             * @type {?number} 
             */
            this.updatedAt = method === "set" ? Date.now() : this.updatedAt || Date.now() 
        }
    }
    
    /**
     * Converts class into readable json. 
     * @type {function} 
     * @return {?object} the object for this data, if any. 
     */
    toJSON() {
        const obj = {
            key: this.key,
            value: this.value, 
            ttl: this.ttl 
        } 
        
        if (this.db.timestamp) {
            obj.createdAt = this.createdAt, 
            obj.updatedAt = this.updatedAt 
        }
        
        return obj 
    }
    
    /**
     * Whether to save this data into the database if it was modified. 
     * @type {function} 
     * @return {boolean} Whether the data was successfully updated. 
     */
    update() {
        return new Promise((resolve, reject) => {
            this.db.set({
                key: this.key,
                value: this.value,
                ttl: this.ttl, 
                resolve, 
                reject 
            })
        })
    }
}