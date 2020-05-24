var path = require('path');
var fs = require('fs');

var server = function(app, server) {
	return;
	var bodyParser = require('body-parser');    
    app.use(bodyParser.json());
	app.post('/save', bodyParser.json(), function(req, res) {
		let payload = req.body;
		console.log('returned from post save',req.body);
		if(payload.path && payload.body){
			fs.writeFileSync(payload.path,payload.body);
		}
		res.json({ custom: 'response' });
	});
}

module.exports = [{
	entry: {
		index: "./src/index.imba"
	},
	plugins: [
	],
	resolve: {
		extensions: [".imba",".mjs",".js",".json"],
		alias: {
			imba: path.resolve(__dirname,'node_modules','imba')
		}
	},

	module: {
		rules: [{
			test: /\.imba$/,
			loader: 'imba/loader'
		}]
	},

	devServer: {
		contentBase: path.resolve(__dirname, 'public'),
		watchContentBase: true,
		setup: server,
		historyApiFallback: {
			index: '/index.html',
			rewrites: [
				{ from: /^\/(guides|examples)/, to: '/index.html' }
			]
		},
		compress: true,
		port: 9000,
		https: true
	},

	output: {
		path: path.resolve(__dirname, 'public'),
		filename: '[name].js'
	}
},{
	entry: "./src/sw.imba",
	target: 'webworker',
	module: {
		rules: [{
			test: /\.imba$/,
			loader: 'imba/loader'
		}]
	},
	resolve: {
		extensions: [".imba",".js",".json"]
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'sw.js'
	}
},{
	entry: "./src/repl/workers/imba/worker.imba",
	target: 'webworker',
	module: {
		rules: [{
			test: /\.imba$/,
			loader: 'imba/loader'
		}]
	},
	resolve: {
		extensions: [".imba",".js",".json"]
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'worker.imba.js',
		libraryTarget: "amd"
	}
}]