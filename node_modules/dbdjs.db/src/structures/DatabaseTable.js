const TableOptions = require("../utils/TableOptions") 
const DatabaseError = require("./DatabaseError")
const Data = require("./Data")
const QueueManager = require("../utils/QueueManager") 
const fs = require("fs") 
/**
 * The tables used for the database. 
 * @type {DatabaseTable} 
 */
module.exports = class DatabaseTable {
    constructor(options = TableOptions, db) {
        /**
         * The database this table belongs to. 
         * @type {Database} 
         * @property 
         */
        this.db = db 
        
        this._resolve(options) 
        
        /**
         * The files this table is currently managing. 
         * @type {Map<string, number>} 
         * @property 
         */
        this.files = new Map() 
        
        /**
         * The cache manager of this table. 
         * @type {Map<string, string>} 
         * @property 
         */
        this.cache = new Map() 
        
        /**
         * The queue manager for this table, see `QueueManager` for more information. 
         * @type {object} 
         * @property 
         */
        this.queue = {...QueueManager} 
    }
    
    /**
     * Resolves the options that were passed to this table. 
     * @type {function} 
     * @param options {object} the options to assign to this table. 
     * @return {?DatabaseError} The error that occurred while setting options, if any. 
     */ 
    _resolve(opts) {
        for (const [name, value] of Object.entries(TableOptions)) {
            this[name] = opts[name] 
            
            if (!this[name]) this[name] = value 
        }
        
        if (!this.name) throw new DatabaseError(this.db.Errors.TABLE_NAME)
    }
    
    /**
     * Resolves a path to a table file by using the file name. 
     * @type {function} 
     * @param file {string} the name of the file to resolve 
     * @return {string} the full path to this file. 
     */ 
    _path(file) {
        return this.db._path(this.name, file.includes(this.db.path) ? file.slice(this.dir.length).split(".")[0] : file.split(".")[0]) 
    }
    
    /**
     * Returns a list of files that are currently available to the table to write in. 
     * @property 
     * @return {array<string>} the file names 
     */ 
    get _availableFiles() {
        const files = [] 
        
        for (const file of [...this.files.entries()]) {
            if (file[1] < this.db.maxFileData) {
                files.push(file[0])
            }
        }
        
        if (!files.length) {
            const path = this._assert()
            files.push(path) 
        }
        
        return files 
    } 
    
    /**
     * Caches all the files and their respective size, will also cache routes if `cacheRouters` is set to true. 
     * @type {function} 
     */ 
    _cacheFiles() {
        let anyAvailable = false 
        const start = Date.now() 
        
        this.db._debug("Starting to cache files for table", this.name, "...")
        
        for (const file of fs.readdirSync(this.dir)) {
            this.db._debug(`Loading file ${file} for table ${this.name}...`)
            
            const start = Date.now() 
            
            const fileData = this.db._marshal(fs.readFileSync(this._path(file), this.db.Adapters)) 
            
            if (this.db.cacheRouters) {
                for (const key of Object.keys(fileData)) {
                    this.db.routers.set(`${this.name}/${key}`, this._path(file))
                }
            }
            
            const length = Object.keys(fileData).length 
            
            if (length < this.db.maxFileData) {
                this.anyAvailable = true 
            }
            
            this.files.set(file, length)
            
            this.db._debug(`Finished file ${file} for table ${this.name} in ${Date.now() - start}ms.`)
        }
        
        if (!this.anyAvailable) {
           this._assert() 
        }
        
        this.db._debug(`Finished loading table ${this.name} in ${Date.now() - start}ms.`)
    } 
    
    /**
     * Returns the current directory path for this table. 
     * @return {string} the path to the table. 
     * @property 
     * @type {function} 
     */ 
    get dir() {
        return `${this.db.path}${this.name}/`
    } 
    
    /**
     * Checks whether this table has a unique folder. 
     * @type {function} 
     */ 
    _create() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir) 
        }
    } 
    
    /**
     * Creates a new file in this table. 
     * @type {function} 
     */ 
    _assert() {
        const next = this.files.size + 1 
        
        const path = this._path(this.schemeName(next)) 
        
        fs.writeFileSync(path, "{}", this.db.Adapters)
        
        this.files.set(this.schemeName(next), 0)
        
        this.db._debug(`Created file to path ${path}`)
        
        return this.schemeName(next) 
    } 
    
    /**
     * Returns the next file name for this table. 
     * @type {function} 
     * @return {string} the name for the next file in this table. 
     */
    schemeName(l) {
        return `${this.name}_scheme_${l}`
    } 
    
    /**
     * Connects the table to the database. 
     * Will emit a table ready event upon successful connection. 
     * @type {function} 
     */ 
    _start() {
        this.db._debug(`Starting table ${this.name}...`) 
        
        this._create() 
        
        this._cacheFiles() 
        
        this.db._debug(`Table ${this.name} ready`)
        
        this.db.emit(this.db.Events.TABLE_READY, this)
    }
    
    /**
     * Sends a request to save data into the table database. 
     * @type {function} 
     * @param data {<Data|object>} body for the data to save, this requires a resolve parameter that will be called upon successful data. 
     * @return {Promise<boolean>} Whether the data was successfully saved. 
     */ 
    async _set(data) {
        if (data) {
            data.resolve(true)
            this.queue.set.push(data)
            this._update(data.toJSON())
        } 
        
        if (this.queue.status.set) return undefined 
        else this.queue.status.set = true 
        
        await new Promise(e => setTimeout(e, this.db.saveTime)) 
        
        const start = Date.now() 
        
        const items = this.queue.set.length 
        
        this.db._debug(`Starting to save ${items} items into database to table ${this.name}...`)
        
        const fileCache = new Map() 
        const fileReaderCache = new Map() 
        
        let availableFiles = this._availableFiles
        
        for (const _ of this.queue.set) {
            const d = this.queue.set.shift()

            //for router cache 
            if (this.db.cacheRouters) {
                const route = `${this.name}/${d.key}`
                
                if (this.db.routers.has(route)) {
                    const path = this.db.routers.get(route) 
                    
                    const file = fileCache.get(path) || this.db._marshal(fs.readFileSync(path, this.db.Adapters))
                    
                    if (!fileCache.has(path)) fileCache.set(path, file) 
                    
                    fileCache.get(path)[d.key] = d.toJSON()
                    
                    if (this.db.forceSave) {
                        d.resolve(true) 
                    }
                } else {
                    let val = this.files.get(availableFiles[0])
                    
                    const file = fileCache.get(availableFiles[0]) || this.db._marshal(fs.readFileSync(this._path(availableFiles[0]), this.db.Adapters)) 
                    
                    if (!fileCache.has(availableFiles[0])) fileCache.set(availableFiles[0], file) 
                    
                    if (typeof val !== "number") throw new DatabaseError(`Fatal error: ${val} did not match ${availableFiles[0]}.`)
                    
                    fileCache.get(availableFiles[0])[d.key] = d.toJSON()
                    
                    val++
                    
                    this.db.routers.set(`${this.name}/${d.key}`, this._path(availableFiles[0]))
                    
                    this.files.set(availableFiles[0], val) 
                    if (val >= this.db.maxFileData) {
                        availableFiles.shift()
                        if (!availableFiles.length) {
                            availableFiles = this._availableFiles
                        }
                    }
                }
            } else {
                //routers not cached 
                let pass = false 
                
                for (const fileName of fs.readdirSync(this.dir)) {
                    const reader = fileReaderCache.get(fileName) || fs.readFileSync(this._path(fileName), this.db.Adapters) 
                    
                    if (!fileReaderCache.has(fileName)) fileReaderCache.set(fileName, reader) 
                    
                    if (this.db._readFrom(reader, d.key)) {
                        const json = fileCache. get(fileName) || this.db._marshal(reader) 
                        
                        if (!fileCache.has(fileName)) fileCache.set(fileName, json) 
                        
                        json[d.key] = d.toJSON()
                        
                        fileCache.set(fileName, json) 
                        
                        pass = true 
                        
                        break 
                    } else {
                        continue 
                    }
                }
                
                //could not find key in any file. 
                
                if (pass) continue 
                
                if (!pass) {
                    const fileName = availableFiles[0] 
                    
                    const json = fileCache.get(fileName) || this.db._marshal(fs.readFileSync(this._path(fileName), this.db.Adapters)) 
                    
                    if (!fileCache.has(fileName)) fileCache.set(fileName, json) 
                    
                    json[d.key] = d.toJSON()
                    
                    let val = this.files.get(fileName) 
                    
                    val++ 
                    
                    this.files.set(fileName, val) 
                    
                    if (val >= this.db.maxFileData) {
                        availableFiles.shift()
                        if (!availableFiles.length) {
                            availableFiles = this._availableFiles
                        }
                    }
                }
            }
        }
        
        for (const [file, data] of [...fileCache.entries()]) {
            fs.writeFileSync(this._path(file), this.db._unmarshal(data))
        }
        
        this.db._debug(`Saved ${items} items in ${Date.now() - start}ms to table ${this.name}.`)
        
        this.db._debug(`There are now ${this.queue.set.length} items to set into table ${this.name}.`)
        
        this.queue.status.set = false 
        if (this.queue.set.length) return this._set()
        
    }
   
    /**
     * Requests the table to retrieve information on given key. 
     * @type {function} 
     * @param data {object} the object body to get the data from, this requires a valid key and a resolve parameter that'll be called upon data retrieved. 
     * @return {Promise<?Data>} the data that was found in the database, if any. 
     */ 
    async _get(data) {
        if (data && this.db.cacheRouters) {
            if (!this.db.routers.has(`${this.name}/${data.key}`)) {
                return data.resolve(undefined) 
            }
        }
        if (data && this.cache.has(data.key)) {
            const d = this.cache.get(data.key)
            d.resolve = data.resolve 
            return this._send(d) 
        } else {
            if (data) {
                this.queue.get.push(data) 
            }
        }
        
        if (this.queue.status.get) return undefined 
        else this.queue.status.get = true 
        
        await new Promise(e => setTimeout(e, this.db.getTime))
        
        const start = Date.now() 
        
        const items = this.queue.get.length 
        
        this.db._debug(`Getting ${items} items from table ${this.name}...`)
       
        const fileCache = new Map() 
        const fileReaderCache = new Map() 
        
        for (const _ of this.queue.get) {
            const d = this.queue.get.shift()
            
            if (this.db.cacheRouters) {
                const route = this.db.routers.get(`${this.name}/${d.key}`)
                if (!route) {
                    d.resolve(undefined) 
                    continue 
                }
                
                const file = fileCache.get(route) || this.db._marshal(fs.readFileSync(this._path(route), this.db.Adapters))
                
                if (!fileCache.has(route)) fileCache.set(route, file) 
                
                const raw = file[d.key]
                
                if (!raw) {
                    d.resolve(undefined) 
                    continue 
                }
                
                this._update(raw, "set") 
                
                raw.resolve = d.resolve 
                
                this._send(raw)
            } else {
                //uncached routers 
                //loop over all files 
                let found = false 
                
                for (const fileName of fs.readdirSync(this.dir)) {
                    const file = fileReaderCache.get(fileName) || fs.readFileSync(this._path(fileName), this.db.Adapters) 
                    
                    if (!fileReaderCache.has(fileName)) fileReaderCache.set(fileName, file) 
                    
                    if (!this.db._readFrom(file, d.key)) {
                        continue 
                    } else {
                        found = true 
                        const json = fileCache.get(fileName) || this.db._marshal(file) 
                        if (!fileCache.has(fileName)) fileCache.set(fileName, json) 
                        const data = json[d.key]
                        if (!data) {
                            d.resolve(undefined)
                            break 
                        }
                        
                        data.resolve = d.resolve 
                        
                        this._update(data) 
                        this._send(data) 
                        break 
                    }
                }
                
                if (!found) {
                    d.resolve(undefined) 
                    continue 
                }
            }
        }
        
        this.db._debug(`Finished getting ${items} items in ${Date.now() - start}ms.`)
        
        this.queue.status.get = false
        
        if (this.queue.get.length) this._get()
    } 
    
    /**
     * Sends the request back to the client with the requested key. 
     * @type {function} 
     * @param data {object} the data for this key. 
     * @param onlyCheck {?boolean} Whether the client should just check if the data is ready to expire. 
     * @return {<boolean|?Data>} The requested data, if any. 
     */
    _send(data, onlyCheck = false) {
        if (onlyCheck) {
            return data.ttl && data.ttl - Date.now() < 1 
        }
        
        const d = new Data(data, this.db, "get") 
        if (d.ttl !== undefined && d.ttl - Date.now() < 1) {
            new Promise((resolve, reject) => {
                this._delete({
                    key: d.key, 
                    resolve, 
                    reject 
                })
            })
            return data.resolve(undefined)
        }
        
        data.resolve(d)
    }
    
    /**
     * Requests the table to pull all the data from this table, will also cache results if `cacheRouters` is set to true. 
     * @type {function} 
     * @param data {object} the data body for this request, it can optionally include a filter. 
     * @return {Promise<array<Data>>} all the data of this table. 
     */
    async _all(data) {
        if (data) {
            if (!data.filter) data.filter = () => true 
            this.queue.all.push(data)
        }
        
        if (this.queue.status.all) return 
        else this.queue.status.all = true 
        
        await new Promise(e => setTimeout(e, this.db.allTime))
        
        let all = {} 
        
        for (const path of [...this.files.keys()]) {
            const raw = this.db._marshal(fs.readFileSync(this._path(path), this.db.Adapters))
            
            all = {...all, ...raw}
        }
        
        all = Object.entries(all).map(array => {
            const [key, data] = array 
            
            if (this._send(data, true)) {
                new Promise((resolve, reject) => {
                    this._delete({
                        resolve, 
                        reject, 
                        key 
                    })
                }) 
                return undefined 
            } else {
                this._update(data, "set")
                return {
                    key, 
                    data
                }
            }
        }).filter(a => a)
        
        for (const _ of this.queue.all) {
            const d = this.queue.all.shift()
            
            if (typeof d.options.filter === "function") {
                all = all.filter(d.options.filter) 
            }
            
            d.resolve(all) 
        }
        
        this.queue.status.all = false 
        if (this.queue.all.length) this._all()
    } 
    
    /**
     * Request the table to elete a key from the table database. 
     * @param data {object} object body for the delete call. 
     * @type {function} 
     * @return {Promise<boolean>} Whether the key was successfully deleted. 
     */
    async _delete(data) {
        if (data) {
            if (this.db.cacheRouters && !this.db.routers.has(`${this.name}/${data.key}`)) {
                data.resolve(false)
                return 
            } else if (this.db.cacheRouters) {
                this._update(data.key, "delete")
                if (!this.db.force) data.resolve(true) 
                data.route = this.db.routers.get(`${this.name}/${data.key}`)
                data.route = data.route.split("/")
                data.route = data.route[data.route.length - 1]
                this.db.routers.delete(`${this.name}/${data.key}`)
                this.queue.delete.push(data) 
            } else if (!this.db.cacheRouters) {
                this._update(data.key, "delete")
                this.queue.delete.push(data) 
                if (!this.db.force) data.resolve(true) 
            } else throw new Error("Unknown") 
        }
        
        if (this.queue.status.delete) return 
        else this.queue.status.delete = true 
        
        await new Promise(e => setTimeout(e, this.db.deleteTime))
        
        const start = Date.now() 
        
        const items = this.queue.delete.length 
        
        this.db._debug(`Starting to delete ${items} items from the table ${this.name}...`)
        
        const fileCache = new Map() 
        const fileReaderCache = new Map() 
        
        for (const _ of this.queue.delete) {
            const d = this.queue.delete.shift()
            
            if (this.db.cacheRouters) {
                if (!d.route) {
                    continue 
                }
                
                this.db._debug(d.route) 
                
                const file = fileCache.get(d.route) || this.db._marshal(fs.readFileSync(this._path(d.route), this.db.Adapters))
                
                let val = this.files.get(d.route) 
                
                val--
                
                this.files.set(d.route, val) 
                
                if (!fileCache.has(d.route)) fileCache.set(d.route, file) 
                
                delete file[d.key]
                
                if (this.db.force) {
                    d.resolve(true) 
                }
                
                fileCache.set(d.route, file) 
            } else {
                //uncached routers 
                let pass = false 
                
                for (const fileName of fs.readdirSync(this.dir)) {
                    const file = fileReaderCache.get(fileName) || fs.readFileSync(this._path(fileName), this.db.Adapters)
                    
                    if (!fileReaderCache.has(fileName)) fileReaderCache.set(fileName, file) 
                    
                    if (this.db._readFrom(file, d.key)) {
                        const json = fileCache.get(fileName) || this.db._marshal(file) 
                        
                        if (!fileCache.has(fileName)) fileCache.set(fileName, json) 
                        
                        delete json[d.key]
                        
                        if (this.db.force) {
                            d.resolve(true) 
                        }
                        
                        let val = this.files.get(fileName) 
                        
                        val--
                        
                        this.files.set(fileName, val) 
                        
                        fileCache.set(fileName, json) 
                        
                        pass = true 
                        break 
                    } else {
                        continue 
                    }
                }
                
                if (!pass && this.db.force) {
                    d.resolve(false) 
                }
            }
        }
        
        if (fileCache.size) {
            for (const [path, data] of [...fileCache.entries()]) {
                fs.writeFileSync(this._path(path), this.db._unmarshal(data))
            }
        } 
        
        this.db._debug(`Finished deleting ${items} items from table ${this.name} in ${Date.now() - start}ms`)
        
        this.queue.status.delete = false 
        if (this.queue.delete.length) this._delete() 
    } 
    
    /**
     * Controls cache updates in this table. 
     * @type {function} 
     * @param data {<Data|object>} the data to update or add to cache. 
     * @param method {?string} the method calling this function. 
     */ 
    _update(data, method = "set") {
        this.cache[method](data.key || data, data)
        
        if (this.cache.size >= this.db.cacheMaxSize) {
            this.cache.delete(this.cache.values().next().value.key)
        }
    }
}
