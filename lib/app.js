var express = require('express');
var Datastore = require('nedb');
var bodyParser = require('body-parser')


var _handleEntryPoint = {
	newTokenEntryPointHandler: function(req, res, next){
		var data = req.body;
	    
		if (req.method !== 'POST')
			return res.status(500).json({status: 'error', err: 'POST method expected'});

		if (Object.keys(data).length === 0) return res.status(500).json({status: 'error', err: 'No data passed'});

		data.date = Math.floor(Date.now() / 1000);
	    this.incomingToken(data);
		res.status(200).json({status: 'ok', data_inserted: data});
	},
	deleteTokenEntryPointHandler: function(req, res, next){ // delete by token parameter
		console.log(req.params.token, '######## BODY', req.body);

		if (req.params.token === 'undefined') return res.status(500).json({status: 'error', err: 'token param required'});

		if (req.method !== 'GET')
			return res.status(500).json({status: 'error', err: 'GET method expected'});

	    this.db.remove({ token: req.params.token }, { multi: true }, function (err, numRemoved) {
			if (err) return res.status(500).json({status: 'error', err: err});
			res.status(200).json({status: 'ok', records_removed: numRemoved});
		});
		
	},
	editTokenEntryPointHandler: function(req, res, next){ // find by token
		// TODO: da testare
		var data = req.body;
	    
		if (req.method !== 'POST')
			return res.status(500).json({status: 'error', err: 'POST method expected'});

		if (Object.keys(data).length === 0) return res.status(500).json({status: 'error', err: 'No data passed'});

		if (typeof data.token === 'undefined') return res.status(500).json({status: 'error', err: 'token parameter required'});

		this.db.update({ token: data.token }, { $set: data }, { multi: true }, function (err, numReplaced) {
			if (err) return res.status(500).json({status: 'error', err: err});
		 	res.status(200).json({status: 'ok', records_updated: numReplaced});
		});
		
	},
	getTokenEntryPointHandler: function(req, res, next){
		if (req.method !== 'GET')
			return res.status(500).json({status: 'error', err: 'GET method expected'});

		this.db.find({}, function(err, docs){
			if (err) return res.status(500).json({status: 'error', err: err});
		 	res.status(200).json({status: 'ok', records: docs});
		});
	}
}

function _startServer() {
    var self = this;

    this.app.use( bodyParser.json() );       // to support JSON-encoded bodies
	this.app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	})); 

    for (entryPoint in this.entryPoints)
	    this.app.use(this.entryPoints[entryPoint], _handleEntryPoint[entryPoint+'Handler'].bind(this));

    this.app.listen(this.options.port, function() {
        console.log('Server listening on port', self.options.port);
    });

}

function Server(raw) { // Constructor
    if (!(this instanceof Server)) {
        return new Server(raw);
    }

    this.app = express();

    this.options = {
        port: raw.port || 3000,
        db: raw.db || './TokenDB.db',
        dbCompactInterval: raw.dbCompactInterval * 1000 || 60 * 1000 * 60, // default db compacting every hour.
    };

    this.entryPoints = {
    	newTokenEntryPoint: '/gcm/token/new', // POST
        deleteTokenEntryPoint: '/gcm/token/delete/:token', // GET
        editTokenEntryPoint: '/gcm/token/edit', // POST
        getTokenEntryPoint: '/gcm/token/get' // GET
    };

    this.db = new Datastore({
        filename: this.options.db,
        autoload: true
    });
    this.db.persistence.setAutocompactionInterval(this.options.dbCompactInterval);

    this.saveFunction = function(obj){
    	// let's save obj in DB
    	console.log('OBJECT: ', obj);
    	this.db.insert(obj, function(err){
    		if (err) console.error(err);
    	});
    }.bind(this);

    this.incomingToken = function(params){
    	// Default behaviour, save it to DB without validation
    	this.saveFunction(params);
    }.bind(this);

}

Server.prototype.start = function(){
	_startServer.bind(this)();
};

Server.prototype.onNewToken = function(func){
	var self = this;
	this.incomingToken = function(params){
		func(params, self.saveFunction);
	};
};

Server.prototype.setNewTokenEntryPoint = function(url){
	this.entryPoints.newTokenEntryPoint = url;
};

Server.prototype.deleteTokenEntryPoint = function(url){
	this.entryPoints.deleteTokenEntryPoint = url;
};

Server.prototype.editTokenEntryPoint = function(url){
	this.entryPoints.editTokenEntryPoint = url;
};

Server.prototype.getTokenEntryPoint = function(url){
	this.entryPoints.getTokenEntryPoint = url;
};

Server.prototype.getPort = function() {
    return this.options.port;
};

module.exports = Server;