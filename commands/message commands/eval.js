module.exports = [{
  name:"eval",
  aliases:["ev"],
  code:`$title[Evaluated!]
  $description[Evaluated Code]
  $addField[**Input:**;\`$message\`]
  $eval[$message]
  $onlyForIds[$botOwnerID[;];818377414367379487;:x: You are not authorized to use this command!]
  `
}]