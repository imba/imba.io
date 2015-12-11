var path = require('path');

var webpack = require('webpack');
var plugins = [
	new webpack.DefinePlugin({
		ENV_SERVER: 0,
		ENV_CLIENT: 1,
		"Imba.SERVER": false,
		"typeof window": JSON.stringify("object")
	})
]

module.exports = {
	module: {
		loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]
	},
	resolveLoader: { root: path.join(__dirname, "node_modules") },
	resolve: {extensions: ['', '.js', '.imba']},
	entry: "./src/client.imba",
	output: { filename: "./www/client.js" },
	plugins: plugins
}