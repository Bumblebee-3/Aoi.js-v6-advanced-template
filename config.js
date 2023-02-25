module.exports = {
  "bot":{
    "token":process.env["token"],//bot token [secret, put it under .env]
    "prefix":["bee ","$getServerVar[prefix]"],//bot prefix
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
    theme:"orange",//panel & dashboard theme
    codetheme:"gruvbox-dark",//code editor theme
    customIndex:"adminLogin"
  },
  "dash":{
    clientId:"1048543886156501022",
    clientSecret:process.env.secret,//available in discord.dev portal
    redirectUri:"https://aoijs-advanced.blurr1447.repl.co/redirect",//needs to be updated on discord dev portal too!
  },
  "music":{
  requestOptions: {
    offsetTimeout: 0,
    soundcloudLikeTrackLimit: 200,
  },
  searchOptions: {
    soundcloudClientId: process.env.scID,
    /*youtubeAuth: "./auth.json",
    youtubegl: "US",*/
  }
}
}