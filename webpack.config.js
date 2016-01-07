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
	entry: {client: "./src/client.imba", sandbox: "./src/sandbox.imba"},
	output: { filename: "./www/[name].js" },
	plugins: plugins
}