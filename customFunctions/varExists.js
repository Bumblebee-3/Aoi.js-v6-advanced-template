module.exports = {
  name: "$authorPing",//pings the author of the message [ A TOTAL USELESS FUNCTION ]
  type: "djs",
  code: async d => {
        
  const data = d.util.aoiFunc(d);
  data.result="<@!"+d.message.author.id+">";
    
  return {
    code: d.util.setCode(data)
  }}
}