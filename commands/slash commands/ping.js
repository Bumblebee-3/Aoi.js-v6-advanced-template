module.exports = {
  name: "ping",
  prototype : "slash",
  type: "interaction",
  code: `$interactionEdit[;{newEmbed:{title:Pong! 🏓}{description:Ping : \`$ping\`ms}};;;everyone;yes]
  $wait[1s]
  $interactionReply[;{newEmbed:{title:Pong! 🏓}{description:Please wait.}};;;everyone;yes]
`
}