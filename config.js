module.exports = {
  "bot":{
    "token":process.env["token"],
    "prefix":"bee ",
    "intents":["MessageContent", "Guilds", "GuildMessages"],
    "events":["onMessage", "onInteractionCreate"],
    "mobilePlatform":true
  },
  "panel":{
    username: process.env["username"],
    password: process.env["password"],
    secret: require('crypto').randomBytes(16).toString("hex"),
    port: 3000,
    mainFile: "index.js",
    commands: "./commands/message commands/",
    interaction:"./commands/slash commands/",
    theme:"orange",
    codetheme:"gruvbox-dark"
  }
}