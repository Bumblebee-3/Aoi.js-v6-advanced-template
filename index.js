const { AoiClient, LoadCommands } = require("aoi.js");
const { AoiVoice } = require("@akarui/aoi.music");
const { Panel } = require("@akarui/aoi.panel");
const { Dash } = require("./dashboard/dash.js");
const config = require("./config.js");
const status = require("./handler/status.js");
const dash = require("./dashboard/index.js");

const bot = new AoiClient(config.bot);//Your Bot Client
config.panel.bot = bot;
config.dash.bot = bot;

/* HANDLERS */

//Commands
const loader = new LoadCommands(bot);
loader.load(bot.cmd, "./commands/");
//Variables
bot.variables(require("./variables.js"));
//status
status.handle_status(bot);
const fs = require('fs');

function handle_custom_funcs(client, folder) {
  console.log("\nLoading Custom Functions");
  console.log("|------------------------------------------|\n\n");

  let files = fs.readdirSync(`./${folder}`).filter(file => file.endsWith('js'));
  if (files.length == 0) {
    console.log("NO CUSTOM FUNCTION TO LOAD!");
    console.log("\n\n|------------------------------------------|\n");
    console.log("Finished Loading Custom Functions\n");
    return;
  }
  files.forEach(x => {
    bot.functionManager.createFunction({
      name: require(`./${folder}/${x}`).name,
      params: require(`./${folder}/${x}`).params,
      type: require(`./${folder}/${x}`).type,
      code: require(`./${folder}/${x}`).code
    })
    console.log("\nWalking in: " + process.cwd() + `/${folder}/${x}`);
    console.log("Loaded custom function: " + require(`./${folder}/${x}`).name);
  });
  console.log("\n\n|------------------------------------------|\n");
  console.log("Finished Loading Custom Functions\n");

}

handle_custom_funcs(bot, "customFunctions");//bot is aoi.client and folder here is name of folder for eg:


/* HANDLERS */

/* INITIALIZING PANEL */

const panel = new Panel(config.panel)
panel.loadPanel()
panel.onError()

/* INTITALIZING PANEL */

const voice = new AoiVoice(bot, {
  searchOptions: {
    //soundcloudClientId: "Sound Cloud Id",
    youtubegl: "US",
  },
  requestOptions: {
    offsetTimeout: 0,
    soundcloudLikeTrackLimit: 200,
  },
});

/* dashboard config */
var dashClass = new Dash(config.dash)
dash.loadDash(bot, panel, dashClass)

async function ImportantFunction(){
  let servers = bot.guilds.cache.map(z => z)
  for (let i = 0; i < servers.length; i++) {
    var orig = await bot.db.get("main","prefix",servers[i].id)
    if(!orig||!orig.value){
      orig = {}
      orig.value=config.bot.prefix[0]
    }
    await bot.db.set("main","prefix",servers[i].id,orig.value)
  }
}

setInterval(ImportantFunction,1000);