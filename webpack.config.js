var path = require('path');

var webpack = require('webpack');
var plugins = [
	new webpack.DefinePlugin({
		"Imba.SERVER": false,
		"Imba.CLIENT": true
	})
]

var mod = {
	loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]
}

module.exports = [{
	module: mod,
	resolveLoader: { root: path.join(__dirname, "node_modules") },
	resolve: {extensions: ['', '.imba', '.js']},
	entry: {client: "./src/client.imba", sandbox: "./src/sandbox.imba"},
	output: { filename: "./www/[name].js" },
	plugins: plugins
},{
	entry: "./scrimbla/src/webworker",
	output: {
		filename: "./www/imbac.worker.js"
	},
	module: mod,
	resolve: {extensions: ['', '.imba', '.js']},
	plugins: plugins

}]