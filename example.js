/*  Examples:
**
** - How to spin a Server to save Subscription ID from clients
** - How to send Push notifications to clients.
**
*/

var gcm = require('./index');

// set the new server and the entry points before any app.listen().
var GcmServer = new gcm.Server({
	port: 3000
});

GcmServer.setNewTokenEntryPoint('/gcm/token/new');

GcmServer.onNewToken(function(params, save){
	// ... params validation and filtering
	save({token: params.token, name: params.name}); // save into db (async).
});

GcmServer.start();


// Use gcm to send a Message.

/*
var message = new gcm.Message();


message.addData('hello', 'world');
message.addNotification('title', 'Hello');
message.addNotification('icon', 'ic_launcher');
message.addNotification('body', 'World');

//Add your mobile device registration tokens here
var regTokens = ['ecG3ps_bNBk:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXl7TDJkW'];
//Replace your developer API key with GCM enabled here
var sender = new gcm.Sender('AIza*******************5O6FM');

sender.send(message, regTokens, function (err, response) {
    if(err) {
      console.error(err);
    } else {
      console.log(response);
    }
});

*/