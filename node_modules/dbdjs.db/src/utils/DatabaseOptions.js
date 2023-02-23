/**
 * Options for the database 
 * @type {object} 
 * @object 
 * @name DatabaseOptions 
 */
module.exports = {
  /**
   * Path to main database folder 
   * @property 
   * @type {string} 
   * @default ./database/
   */
  path: "./database/",

  /**
   * The tables for the database 
   * @property 
   * @type {array<object<DatabaseTable>>}
   */
  tables: [], 

  /**
   * The max data that a scheme can store. 
   * @type {number} 
   * @property 
   * @default 50000 
   */
  maxFileData: 50000,

  /**
   * Whether the database should send debug log events 
   * @property 
   * @type {boolean} 
   * @default false 
   */
  debug: false,

  /**
   * The extension for each scheme file in the database 
   * @property 
   * @type {string} 
   * @default .sql 
   */
  extension: ".sql",
  
  /**
   * Whether to force the database to save or delete data before returning the boolean. 
   * **Note that setting this to `true` may cause lag.**
   * @type {boolean} 
   * @default false 
   * @property 
   */
  force: false, 
  
  /**
   * How many data can the database store in cache. 
   * @property 
   * @type {number} 
   * @default 3000 
   */
   cacheMaxSize: 3000, 
   
   /**
    * Whether the database should save timestamps for each data. 
    * @property 
    * @type {boolean} 
    * @default false 
    */
   timestamp: false, 
   
   /**
    * How long until the database can save the data into it (ms) 
    * @property 
    * @type {number} 
    * @default 100
    */
   saveTime: 100,
   
   /**
    * Time in ms to wait before processing all data requests. 
    * @type {number} 
    * @property 
    * @default 100 
    */
   allTime: 100, 
   
   /**
    * Minimum time for the database to pull data from database (ms)
    * @property 
    * @type {number}
    * @default 1
    */
    getTime: 1,
    
    /**
     * How long until the database can delete data from the database. 
     * @property 
     * @type {number} 
     * @default 100 
     */
     deleteTime: 100, 
     
    /**
     * Whether the database should cache routers on startup. 
     * @property 
     * @type {boolean} 
     * @default true 
     */
    cacheRouters: true 
}