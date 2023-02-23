[![dbd.js](https://cdn.discordapp.com/attachments/817018613046312990/846181270840279050/dbdjs.png)](https://discord.com/invite/HMUfMXDQsV)

# dbdjs.db

[![Discord Server](https://img.shields.io/discord/773352845738115102?color=5865F2&logo=discord&logoColor=white)](https://discord.com/invite/HMUfMXDQsV)
[![NPM Downloads](https://img.shields.io/npm/dt/dbdjs.db.svg?maxAge=3600)](https://www.npmjs.com/package/dbdjs.db)
[![NPM Version](https://img.shields.io/npm/v/dbdjs.db.svg?maxAge=3600)](https://www.npmjs.com/package/dbdjs.db)

## Table Of Contents
- [About](#about)
- [Examples](#examples)
  - [Setup](#setup)
  - [Set](#set)
  - [Get](#get)
  - [Get All](#get-all)
  - [Delete](#delete)
- [API](#api)
  - [Database](#database)
- [Interfaces](#interfaces)
  - [Database Options](#database-options)
  - [Table](#table)
  - [Data](#data)
  - [All Options](#all-options)
  - [All Data](#all-data)
- [Links](#links)

## About
dbdjs.db is a JSON Database meant for quick and easy saving data values.

## Setup
```js
const DBDJSDB = require("dbdjs.db");
const db = new DBDJSDB.Database({
  path: "database",
  tables: {{
    name: "test",
  }},
});

db.once("ready", () => {
  console.log("Database ready!");
});

db.connect();
```

### Set
```js
await db.set("test", "apple", "turtle.");
await db.set("test", "leref", "dbdjs.db owner");
```

### Get
```js
const apple = await db.get("test", "apple");
const leref = await db.get("test", "leref");
```

### Get All
```js
const lerefAndApple = await db.all("test", {
  filter: ({ data }) => data.key.includes("w"),
});
```

### Delete
```js
await db.delete("test", "apple");
await db.delete("test", "leref");
```

## API
### #Database
| Params | Description |
| :--- | ---: |
| options: [DatabaseOptions](#database-options) | The database constructor to make a new database instance. |

- #set()
  | Params | Return | Description |
  | :--- | :---: | ---: |
  | table: string, key: string, value: any | Promise\<boolean> | Set method for the database. |
- #get()
  | Params | Return | Description |
  | :--- | :---: | ---: |
  | table: string, key: string | Promise\<[Data](#data)> | Get method for the database. |
- #all()
  | Params | Return | Description |
  | :--- | :---: | ---: |
  | table: string, options: [AllOptions](#all-options) | Promise\<[AllData](#all-data)\[]> | GetAll method for the database. |
- #delete()
  | Params | Return | Description |
  | :--- | :---: | ---: |
  | table: string, key: string | Promise\<boolean> | Delete method for the database. |

## Interfaces
### Database Options
| Property | Value | Default | Description |
| :--- | :---: | :---: | ---: |
| tables | [Table](#tables)\[] | | The reserved tables for the database. |
| path? | string | "database" | Path to main database folder. |
| maxFileData? | number | 50000 | The max data that a file can store. |
| debug? | boolean | false | Whether the database should send debug log events. |
| extension? | string | ".sql" | The extension for each file in the database. |
| force? | boolean | false | Whether to force the database to save or delete data on the file. |
| cache? | number | 3000 | How many data can the database store in memory cache. |
| timestamp? | boolean | false | Whether the database should save timestamp for each data. |
| saveTime? | number | 100 | How long until the database can save the data into file (ms). |
| getTime? | number | 1 | How long until the database pull a data from file (ms). |
| allTime? | number | 100 | How long until the database pull some data from file (ms). |
| deleteTime? | number | 100 | How long until the database delete a data from file (ms). |
| cacheRouters? | boolean | true | Whether the database should cache data routers on startup. |

### Table
| Property | Value | Description |
| :--- | :---: | ---: |
| name | string | Name for the table, this will also define the path to this table file. |

### Data
| Property | Value | Description |
| :--- | :---: | ---:
| key | string | The key of the data. |
| value | any | The value of the data. |
| ttl? | number | The ttl for the data. |
| createdAt? | number | The time which this data was created. |
| updatedAt? | number | The time which this data was last updated. |

### All Options
| Property | Value | Description |
| :--- | :---: | ---: |
| filter | (allData: [AllData](#all-data)) => boolean | The function to filters data. |

### All Data
| Property | Value | Description |
| :--- | :---: | ---: |
| key | string | The key of the data. |
| data | [Data](#data) | The data object of the data. |

## Links
dbdjs.db was created for [dbd.js](https://www.npmjs.com/package/dbd.js) now available for anyone to learn and use.
- [Website](https://dbd.js.org)
- [Discord Server](https://discord.com/invite/HMUfMXDQsV)
