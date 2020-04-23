var imbac = require 'imba/dist/compiler'
import {ImbaDocument} from 'imba-document'

# this should talk to the languageservice
export class ImbaWorker

	prop ctx

	def constructor ctx, options
		ctx = ctx
		options = options
		models = {}
		documents = {}

	def getModel uri
		for item in ctx.getMirrorModels!
			if item.uri.toString! === uri
				return item
		return null

	def getDocument uri
		let model = getModel(uri)
		let body = model.getValue!
		let doc = documents[uri] ||= ImbaDocument.new(uri,'imba',0,body)
		doc.overwrite(body) unless doc.content == body
		return doc

	def getSemanticTokens uri
		let doc = getDocument(uri)
		let tokens = doc.getSemanticTokens!
		# console.log 'get semantic tokens',uri,doc,getModel(uri),tokens
		let results = tokens.map do [$1.offset,$1.value.length]
		return results

	def getDiagnostics uri
		return Promise.resolve({})

		var model = getModel(uri)
		var code = model.getValue!
		
		if (/\S/).test(code)
			var meta = imbac.analyze(code,{entities: yes})
			model.meta = meta
			return Promise.resolve(meta)
		else
			return Promise.resolve({})

	def getCompiledCode uri
		var model = getModel(uri)
		var code = model.getValue
		
		if (/\S/).test(code)
			var out = imbac.compile(code,{})
			return Promise.resolve(String(out))
		else
			return Promise.resolve({})

export def create ctx, data
	console.log 'creating worker!'
	return ImbaWorker.new(ctx, data)
