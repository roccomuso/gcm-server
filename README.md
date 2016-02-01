# gcm-server
[![npm](https://badge.fury.io/js/gcm-server.svg)](https://www.npmjs.com/package/gcm-server)

gcm-server is a Node.JS library that start a Server to store the [**GCM**](https://developers.google.com/cloud-messaging/) clients Subscription ID. You can also send push notifications (thanks to [node-gcm](https://github.com/ToothlessGear/node-gcm)).

## Installation

<code>npm install gcm-server --save</code>.

## Requirements

This library provides the server-side implementation of GCM.
You need to generate an API key ([Sender ID](https://developers.google.com/cloud-messaging/gcm#senderid)).

GCM notifications can be sent to both [Android](https://developers.google.com/cloud-messaging/android/start) and [iOS](https://developers.google.com/cloud-messaging/ios/start).
If you are new to GCM you should probably look into the [documentation](https://developers.google.com/cloud-messaging/gcm).

## Server usage

Here a basic example of how to start the server and listen for new clients Subscription ID.

```js
var gcm = require('gcm-server');

// set the new server and the entry points before any app.listen.
var GcmServer = new gcm.Server({
  port: 3000
});

GcmServer.setNewTokenEntryPoint('/gcm/token/new');

GcmServer.onNewToken(function(params, save){
  // ... params validation and filtering
  save({token: params.token, name: params.name}); // save into db (async).
});

GcmServer.start();
```

### Available entry points

- newTokenEntryPoint - POST: '/gcm/token/new'
- deleteTokenEntryPoint - GET: '/gcm/token/delete/:token'
- editTokenEntryPoint - POST: '/gcm/token/edit'
- getTokenEntryPoint - GET: '/gcm/token/get'


## GCM send - Example application

According to below **Usage** reference, we could create such application:

```js
var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

var regTokens = ['YOUR_REG_TOKEN_HERE'];

// Set up the sender with you API key
var sender = new gcm.Sender('YOUR_API_KEY_HERE');

// Now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
	if(err) console.error(err);
	else 	console.log(response);
});

// Send to a topic, with no retry this time
sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
	if(err) console.error(err);
	else 	console.log(response);
});
```

## Usage

```js
var gcm = require('node-gcm');

// Create a message
// ... with default values
var message = new gcm.Message();

// ... or some given values
var message = new gcm.Message({
	collapseKey: 'demo',
	priority: 'high',
	contentAvailable: true,
	delayWhileIdle: true,
	timeToLive: 3,
	restrictedPackageName: "somePackageName",
	dryRun: true,
	data: {
		key1: 'message1',
		key2: 'message2'
	},
	notification: {
		title: "Hello, World",
		icon: "ic_launcher",
		body: "This is a notification that will be displayed ASAP."
	}
});

// Change the message data
// ... as key-value
message.addData('key1','message1');
message.addData('key2','message2');

// ... or as a data object (overwrites previous data object)
message.addData({
	key1: 'message1',
	key2: 'message2'
});

// Set up the sender with you API key
var sender = new gcm.Sender('insert Google Server API Key here');

// Add the registration tokens of the devices you want to send to
var registrationTokens = [];
registrationTokens.push('regToken1');
registrationTokens.push('regToken2');

// Send the message
// ... trying only once
sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying
sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});

// ... or retrying a specific number of times (10)
sender.send(message, { registrationTokens: registrationTokens }, 10, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});
```

## More about sending push notifications.

See [node-gcm](https://github.com/ToothlessGear/node-gcm) for more references.

