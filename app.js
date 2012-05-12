var irc = require('irc');
var rest = require('restler');
var config = require('./config')
function isDigit(val) {
  return String(+val).charAt(0) == val;
}
var client = new irc.Client(config.server, config.nick, {
	channels: [config.channel],
	debug:true,
	showErrors:true
});

client.addListener('message', function (from, to, message) {
	var url = 'http://api.trakt.tv/user/profile.json/'+config.apikey+'/'+from;
	if(message == "!tv") {
		var result = rest.get(url).on('complete', function(res){
			var username = res.username;
			var watching = res.watching;
			var watched = res.watched;
			if(watching !== "") {
				//console.log(watched[1]);
				var entry = watched[1];
				var thing = entry.type;
				var item = entry[thing];
				if(thing == "episode") {
					if(isDigit(item.season)) {
						var season = "S0"+item.season;
					} else {
						var season = "S"+item.season;
					}
					if(isDigit(item.number)) {
						var episode = "E0"+item.number;
					} else {
						var episode = "E"+item.number;
					}
					client.say(to,'trakt.tv » '+item.title+' - '+entry.show.title+' ('+season+episode+') ('+item.url+')');
				} else {
					client.say(to,'trakt.tv »'+item.title);
				}
				console.log(from+' asked for recently played and got a '+thing)
				
			}
		})
	} else if(message == "!tvu") {
		var result = rest.get(url).on('complete', function(res){
			var watched = "";
			for(var i in res.watched){
				//console.log(attributename+": "+res.watched[attributename].type);
				var type = res.watched[i].type;
				var title = res.watched[i][type].title
				if(type == 'episode') {
					var out = title+' - '+res.watched[i]['show'].title+' ('+type+'), ';
				} else {
					var out = title+' ('+type+'), ';
				}
				
				watched = watched+out;
			}
			client.say(to,'trakt.tv » User: '+res.username+' » Location: '+res.location+' » Age: '+res.age+' » Gender: '+res.gender);
			client.say(to,'trakt.tv » Episodes watched/in collection: » '+res.stats.episodes.watched+'/'+res.stats.episodes.collection+' » Movies watched/in connection: » '+res.stats.movies.watched+'/'+res.stats.movies.collection)
			client.say(to,'trakt.tv » Last 5 things watched: '+watched)
			//console.log(from+' asked for recently played and got a '+thing)		
		});
	}
});