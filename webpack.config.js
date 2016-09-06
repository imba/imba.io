module.exports = [{
	entry: "./src/sandbox.imba",
	output: { filename: "./www/sandbox.js" },
},{
	entry: "./src/client.imba",
	output: { filename: "./www/client.js" },
},{
	entry: "./scrimbla/src/webworker",
	output: { filename: "./www/js/scrimbla.worker.js" },
	target: "webworker"
}]