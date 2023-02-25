const DiscordOauth2 = require("discord-oauth2");


class Dash {
  constructor(args) {
    this.args = args;

    if (!args.redirectUri) {
      console.log("\x1b[31m%s\x1b[0m", "redirectUri not provided! Exiting Code!");
      process.exit(0);
    }
    if (!args.clientId) {
      console.log("\x1b[31m%s\x1b[0m", " clientId not provided! Exiting Code!");
      process.exit(0);
    }
    if (!args.clientSecret) {
      console.log("\x1b[31m%s\x1b[0m", " clientSecret not provided! Exiting Code! [Note: You can get it from discord's dev portal!]");
      process.exit(0);
    }
    if (!args.bot) {
      console.log("\x1b[31m%s\x1b[0m", " bot object [aoi client] not provided! Exiting Code!");
      process.exit(0);
    }



    const oauth = new DiscordOauth2({
      clientId: args.clientId,
      clientSecret: args.clientSecret,
      redirectUri: args.redirectUri,
    });

    this.oauth = oauth;


  }

  generateUrl() {
    let oauth = this.oauth;
    const url = oauth.generateAuthUrl({
      scope: ["identify", "guilds"],
      state: require('crypto').randomBytes(16).toString("hex")
    });
    return url;
  }

  async getAccessToken(code) {
    let oauth = this.oauth;
    let data = await oauth.tokenRequest({
      code,
      scope: "identify guilds",
      grantType: "authorization_code"
    })
    return data.access_token;
  }
  async getUser(access_token) {
    let a = access_token;
    let oauth = this.oauth;
    let v = oauth.getUser(a);
    return v;
  }
  async getGuilds(access_token) {
    let a = access_token;
    let oauth = this.oauth;
    let v = await oauth.getUserGuilds(a);
    return v;
  }
  async getCommonAdminGuilds(access_token) {
    let a = access_token;
    let oauth = this.oauth;
    let data = await oauth.getUserGuilds(a);
    var ag = [];
    var bb = [];
    let bot = this.args.bot;
    for (let i = 0; i < bot.guilds.cache.size; i++) {
      bb.push(bot.guilds.cache.map(z => z)[i].id)
    }
    for (let [i, guild] of Object.entries(data)) {
      if ((guild.permissions & 0x8) != 0 && bb.includes(guild.id)) {
        ag.push(guild.id)
      }
    }
    return ag;
  }
  async getAdminGuilds(access_token) {
    let a = access_token;
    let oauth = this.oauth;
    let data = await oauth.getUserGuilds(a);
    var aa = [];
    for (let [i, guild] of Object.entries(data)) {
      if ((guild.permissions & 0x8) != 0) {
        aa.push(guild.id)
      }
    };
    return aa;
  }
}

module.exports = {
  Dash
}