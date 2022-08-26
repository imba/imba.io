import * as esml from 'es-module-lexer'

const ResolveMap = {
	'imba': 'https://unpkg.com/imba@2.0.0-alpha.215/dist/imba.mjs'
	'imdb': '/imdb.js'
}

export def rewriteImports body, map = ResolveMap
	const [imports, exports] = esml.parse(body)
	for imp in imports.reverse!
		if let remap = map[imp.n]
			console.log 'replacing path',imp.n,remap
			body = body.slice(0,imp.s) + String(remap) + body.slice(imp.e)
	return body