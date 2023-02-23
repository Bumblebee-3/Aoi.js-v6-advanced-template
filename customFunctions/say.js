module.exports = {
  name : '$say',
  params : ['authorid','message'],
  type : 'aoi.js',
  code : `**$userTag[{authorid}]** says: **{message}**`
}
/*
Usage: $say[author id;message to say]
Example: $say[$authorID;$message] || $say[818377414367379487;Hello Noobs]
Returns: **Blurr#1447** says: **Hello Noobs**
*/
