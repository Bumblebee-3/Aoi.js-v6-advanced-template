const DatabaseOptions = require("../utils/DatabaseOptions") 
const fs = require("fs") 
const DatabaseTable = require("./DatabaseTable")
const { promisify } = require("util") 
const { EventEmitter } = require("events") 
const DatabaseError = require("./DatabaseError")
const Data = require("./Data") 
const read = promisify(fs.readFile)
const write = promisify(fs.writeFile)
const adapters = { encoding: "utf-8" } 
/**
 * The main class for the database instance. 
 * @type {Database} 
 * @param options {DatabaseOptions} the options for the database instance. 
 * @return {Database} the newly connected database instance. 
 */
class Database extends EventEmitter {
    constructor(options = DatabaseOptions) {
        super() 
        
        this._resolve(options) 
        
        this._tables()
        
        /**
         * Whether the database is ready. 
         * @type {boolean} 
         * @property 
         */ 
        this.ready = false 
        
        /**
         * The timestamp when the database became ready state. 
         * @property 
         * @type {?number} 
         */ 
        this.readySince = null 
        
        /**
         * The route manager for all the keys stored in the global database.
         * @type {Map<string, string>} 
         * @property true 
         */
        this.routers = new Map() 
    }
    
    /**
     * Resolves the path to a table file by using the table name and file name
     * @type {function} 
     * @param table {string} the table name. 
     * @param file {string} the file name. 
     * @return {string} the path to the file. 
     */
    _path(table, file) {
        return `${this.path}${table}/${file}${this.extension}`
    }
    
    /**
     * **Deprecated**
     * @type {function} 
     */
    _check(path) {
        return fs.existsSync(path)
    } 
    
    /**
     * Checks for main path to database to make sure it exists, if it doesn't it will create a new folder. 
     * @type {function} 
     */
    _create() {
        if (!this._check(this.path)) {
            fs.mkdirSync(this.path) 
        }
    } 
    
    /**
     * Creates the tables with given table options. 
     * @type {function} 
     */
    _tables() {
        for (const i in this.tables) {
            if (!this.tables[i].name || this.Regexes.TABLES_PATTERN.test(this.tables[i].name)) return;
            
            this.tables[i] = new DatabaseTable(this.tables[i], this)
        }
    }
    
    /**
     * Resolves the database options that were passed to the constructor. 
     * @param options {object} the options that were passed. 
     * @type {function} 
     */
    _resolve(opts) {
        for (const [name, value] of Object.entries(DatabaseOptions)) {
            const val = opts[name] 
            
            if (val === undefined) {
                this[name] = value 
            } else this[name] = val 
        }
        
        if (!this.tables.length) throw new DatabaseError(this.Errors.TABLE_SIZE)
    }
    
    /**
     * Used to send a debug event whenever the database feels like doing so. 
     * **This event requires `debug` option to be set to true.**
     * @type {function} 
     * @param data {...any} the data to send to debug event. 
     */
    _debug(...data) {
        if (this.debug) {
            this.emit(this.Events.DEBUG, data.map(d => {
                return typeof d === "object" ? require("util").inspect(d) : d 
            }).join(" ")) 
        }
    } 
    
    /**
     * Parses a string into a object. 
     * @param readable {string} the string to read and convert from. 
     * @type {function} 
     * @return {object} the parsed object.
     */
    _marshal(data) {
        const start = Date.now() 
        data = JSON.parse(data) 
        this._debug(`Took ${Date.now() - start}ms to parse ${Object.keys(data).length} items.`) 
        
        return data 
    } 
    
    /**
     * Reads from a string and attempts to find a key from given data, should not be used by public as this is meant to be used by the database. 
     * @type {function} 
     * @param data {string} Readable string to check from. 
     * @param key {string} the key you're looking for. 
     * @return {boolean} Whether the key exists in this Readable data. 
     */ 
    _readFrom(data, key) {
        const regex = this._jsonKey(key) 
        
        return regex.test(data)
    }
    
    /**
     * Returns the key stringified. 
     * @type {function} 
     * @param key {string} the key name. 
     * @return {RegExp} the created regexp. 
     */
    _jsonKey(key) {
        return new RegExp(`(,"${key}":{|{"${key}":{)`)
    }
    
    /**
     * Resolves a table by using an option. 
     * @return {?DatabaseTable} the table matching the query. 
     * @type {function} 
     * @param any {any} the option to search the table. 
     */
    _resolveTable(any) {
        return 
        this
        .tables
        .find(table => 
            table.name === any 
        )
    }
    
    /**
     * Stringifies an object and returns it as string. 
     * @param object {object} the object to stringify. 
     * @return {string} the stringified object. 
     */
    _unmarshal(data) {
        const l = Object.keys(data) 
        const start = Date.now() 
        data = JSON.stringify(data) 
        this._debug(`Took around ${Date.now() - start}ms to stringify ${l.length} items.`) 
        
        return data 
    } 
    
    /**
     * Total uptime in ms for the database. 
     * @type {?number} 
     * @property 
     */ 
    get uptime() {
        return Date.now() - this.readySince || null 
    }
    
    /**
     * The regexes for the database. 
     * @property 
     * @type {Regexes} 
     */
    get Regexes() {
        return require("../utils/Regexes")
    } 
    
    /**
     * **Deprecated.**
     * @property true 
     * @type {object} 
     */
    get Timer() {
        let data; 
        return {
            start() {
                data = Date.now() 
                return true 
            }, 
            end() {
                return Date.now() - data || 0 
            }
        } 
    } 
    
    /**
     * The adapters for the database. 
     * @type {object} 
     * @property true 
     */
    get Adapters() {
        return adapters
    }
    
    /**
     * The events that the database can emit at any time. 
     * @type {object} 
     * @property true 
     */
    get Events() {
        return {
            /**
             * Contains debug data, note the database will only receive bug chunks if `debug` is set to true. 
             * @type {event} 
             * @param info {string} the debug information. 
             * @event 
             */
            DEBUG: "debug", 
            /**
             * Emitted once the database becomes ready. 
             * @event 
             * @type {event} 
             */ 
            READY: "ready", 
            /**
             * Fired whenever a table becomes ready. 
             * @type {event} 
             * @event 
             * @param table {DatabaseTable} the table that became ready. 
             */
            TABLE_READY: "tableReady" 
        }
    }
    
    /**
     * The errors that this database can throw. 
     * @type {object} 
     * @property true 
     */
    get Errors() {
        return {
            TABLE_NAME: "The table must have a name.",
            TABLE_SIZE: "No tables were provided for the database."
        }
    }
    
    /**
     * Stores a key in the database. 
     * @type {function} 
     * @param table {string} the name of the table to assign the key to. 
     * @param key {string} the name of the key to store. 
     * @param value {any} the value for this key
     * @param ttl {?number} the time in milliseconds which this key will expire at. 
     * @return {Promise<boolean>} Whether the data was successfully saved into the database. 
     */
    set(table, key, value, ttl) {
        if (!this.tables.find(a => a.name === table)) throw new DatabaseError(`Invalid table name ${table}`)
        
        if (typeof ttl === "number" && ttl > 0) {
            ttl = Date.now() + ttl 
        } else ttl = undefined 
        
        const data = new Data({
            key, 
            value, 
            ttl 
        }, this, "set")
        
        return new Promise((resolve, reject) => {
            data.resolve = resolve 
            data.reject = reject 
            
            this.tables.find(a => a.name === table)._set(data) 
        })
    }
    
    /**
     * Gets key data from given table. 
     * @type {function} 
     * @param table {string} the name of the table to get the key from. 
     * @param key {string} the name of the key holding data. 
     * @return {Promise<?Data>} The data for this key, if it's got one. 
     */ 
    get(table, key) {
        if (!this.tables.find(a => a.name === table)) throw new DatabaseError(`Invalid table name ${table}`)
        
        return new Promise((resolve, reject) => {
            this.tables.find(t => t.name === table)._get({
                key, 
                resolve, 
                reject 
            })
        })
    } 
    
    /**
     * Deletes a key from the database. 
     * @type {function} 
     * @param table {string} the name of the table holding the key. 
     * @param key {string} the key name to delete. 
     * @return {Promise<boolean>} Whether the key was successfully deleted. 
     */ 
    delete(table, key) {
        if (!this.tables.find(a => a.name === table)) throw new DatabaseError(`Invalid table name ${table}`)
        
        return new Promise((resolve, reject) => {
            this.tables.find(t => t.name === table)
            ._delete(
                {
                    resolve, 
                    reject, 
                    key 
                }
            )
        }) 
    } 
    
    /**
     * Gets all the keys & values from the database table, this will fire ttl events if any data queried is expired. 
     * @type {function} 
     * @param table {string} the name of the table. 
     * @param options {QueryOptions} options to pass to the all data request. 
     * @return {Promise<array<object>>} all the data of this table database. 
     * @example \n
     * //request all data from "users" table. \n
     * db.all("users") \n 
     * .then(console.log) //Array of objects. (next) 
     * //request all data from "users" table with a filter. \n 
     * db.all("users", { \n
     *    filter: (d) => d.data.value < 10 \n 
     *}) \n 
     *.then(console.log) //Array of objects matching filter. 
     */ 
    all(table, options = {}) {
        if (!this.tables.find(a => a.name === table)) throw new DatabaseError(`Invalid table name ${table}`)
        
        return new Promise((resolve, reject) => {
            this.tables.find(t => t.name === table)
            ._all(
                {
                    resolve, 
                    reject, 
                    options 
                }
            )
        })
    } 
    
    /**
     * Clears a specific table data. 
     * @type {function} 
     * @param table {string} the name of the table to reset. 
     * @returns {Promise<boolean>} Whether the task was executed correctly and the table got reset. 
     */ 
    clearTable(table) {} 
    
    /**
     * Clears all the tables data. 
     * @type {function} 
     * @returns {Promise<boolean>} Whether the database got a successful call on deleting all the data. 
     */ 
    async clearDatabase() {
        this.cache = new Map() 
        this.routers = new Map() 
        for (const table of this.tables) {
            fs.rmdirSync(table.dir, {
                recursive: true 
            })
            table.cache = new Map() 
            table.files = new Map() 
            table._create() 
            table._availableFiles
            table._cacheFiles()
        }
        return true 
    } 
    
    /**
     * Connects the database and fires the ready event on successful connection. 
     * @type {function} 
     */
    connect() {
        this._create(this.path) 
        
        const start = Date.now() 
        
        this._debug("Starting database with options:", this)
        
        for (const table of this.tables) {
            table._start() 
        }
        
        this._debug(`Started database in ${Date.now() - start}ms`)
        
        this.ready = true 
        this.readySince = Date.now() 
        
        this.emit(this.Events.READY)
    }
}

module.exports = Database