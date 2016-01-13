var path = require('path');

var webpack = require('webpack');
var plugins = [
	new webpack.DefinePlugin({
		"Imba.SERVER": false,
		"Imba.CLIENT": true
	})
]

module.exports = {
	module: {
		loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]
	},
	resolveLoader: { root: path.join(__dirname, "node_modules") },
	resolve: {extensions: ['', '.imba', '.js']},
	entry: {client: "./src/client.imba", sandbox: "./src/sandbox.imba"},
	output: { filename: "./www/[name].js" },
	plugins: plugins
}