const fs = require('fs');
function handle_status(client) {
  let files = fs.readdirSync('./status').filter(file => file.endsWith('js'))
  files.forEach( x => {
    client.status({
      text:require(`../status/${x}`).text, // This sets the message status
      type:require(`../status/${x}`).type,
      time:require(`../status/${x}`).time
    });

  });

}

module.exports={
  handle_status
}
