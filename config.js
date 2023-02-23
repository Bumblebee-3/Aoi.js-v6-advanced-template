module.exports = {
  "bot":{
    "token":process.env["token"],//bot token [secret, put it under .env]
    "prefix":"bee ",//bot prefix
    "intents":["MessageContent", "Guilds", "GuildMessages"],//intents for discord bot
    "events":["onMessage", "onInteractionCreate"],//events
    "mobilePlatform":true//mobile presence
  },
  "panel":{
    username: process.env["username"],//panel login username
    password: process.env["password"],//panel login password
    secret: require('crypto').randomBytes(16).toString("hex"),
    port: 3000,//panel port
    mainFile: "index.js",//code mainfile name
    commands: "./commands/message commands/",//message commands folder
    interaction:"./commands/slash commands/",//slash commands folder
    theme:"orange",//panel theme
    codetheme:"gruvbox-dark"//code editor theme
  }
}