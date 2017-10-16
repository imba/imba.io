require 'imba/src/imba/imba'

extern postMessage

var compiler = require 'imba/src/compiler/compiler'

import ImbaParseError from 'imba/src/compiler/errors'
var api = {}

def normalizeError e, o
	if e:lexer and !(e isa ImbaParseError)
		e = ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
	# else
	#	console.log 'error has no lexer but is parse-error',e:toJSON
	#	e = {message: e:message}
	
	if e:toJSON # isa ImbaParseError
		# console.log 'converting error to json'
		e = e.toJSON
	
	if e isa Error
		e = {message: e:message}

	return e

def api.compile code, o = {}
	try
		var res = compiler.compile(code,o)
		var ret = {sourcemap: res:sourcemap, js: {body: res.toString}}
		return ret
	catch e
		return {error: normalizeError(e,o)}

def api.bundle bundle, o = {}
	var output = {FILES: {}}

	for own name,file of bundle.FILES
		if name.match(/\.imba$/)
			var jsname = name.replace(/\.imba$/,'.js')
			var out = output.FILES[jsname] = {
				id: file:id
				name: jsname
			}

			try

				o:filename = name
				o:sourcePath = name
				o:targetPath = jsname

				var res = compiler.compile(file:body,o)
				out:sourcemap = res:sourcemap
				out:body = res.toString
			catch e
				out:error = normalizeError(e,o)
	return output

def api.analyze code, o = {}
	var meta
	try
		var ast = compiler.parse(code,o)
		meta = ast.analyze(loglevel: 0)
	catch e
		# console.log "something wrong {e:message}",o.@tokens,e:toJSON
		e = normalizeError(e,o)
		meta = {warnings: [e]}
	return {meta: meta}

global def onmessage e
	# console.log 'message to webworker',e:data
	var params = e:data
	var id = params:id
	var start = Date.new

	if api[params[0]] isa Function
		let fn = api[params[0]]
		var result = fn.apply(api,params.slice(1))

		result:worker = {
			ref: id
			action: params[0]
			elapsed: Date.new - start
		}

		postMessage(result)
