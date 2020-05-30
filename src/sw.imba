const imbac = require 'imba/dist/compiler'
global.imbac = imbac

const mimeTypeMap = {
	'html': 'text/html;charset=utf-8'
	'css': 'text/css;charset=utf-8'
	'js': 'application/javascript;charset=utf-8'
	'imba': 'application/javascript;charset=utf-8'
	'png': 'image/png'
	'jpg': 'image/jpg'
	'jpeg': 'image/jpg'
	'gif': 'image/gif'
	'svg': 'image/svg+xml'
}

const indexTemplate = "
<html>
    <head>
        <meta charset='UTF-8'>
		<title>Playground</title>
		<link href='/preflight.css' rel='stylesheet'>
    </head>
    <body>
		<script type='module' src='/repl/examples/helpers.imba'></script>
        <script type='module' src='index.imba'></script>
    </body>
</html>"

const clientLoadMap = {

}

const accessedPaths = {
}

def compileImba file
	try
		let body = file.body
		# rewrite certain special things
		body = body.replace(/# @(show|log)( .*)?\n(\t*)/g) do(m,typ,text,tabs)
			m + "${typ} '{(text or '').trim!}', "
		body = body.replace(/from 'imdb'/g,'from "/imdb.js"')
		let result = imbac.compile(body,{target: 'web', sourcePath: file.path, imbaPath: null})
		file.js = result.toString!
	catch e
		console.log 'error compiling',e
		return
	return file.js

class Worker

	def constructor
		files = {}

		for ev in ['message','fetch','install','activate']
			global.addEventListener(ev,self["on{ev}"].bind(self))
		self

	def log ...params
		console.log(...params)
		self

	def onmessage e
		if e.data.event == 'compile'
			console.log 'sw compile',e.data.body
			let js = compileImba(e.data)
			return e.source.postMessage({event: 'compiled',ref: e.data.ref, source: e.data.body, js: js})


		if e.data.event == 'file'
			let path = e.data.path
			# console.log 'sw got file',path
			files[path] = e.data
			
			if accessedPaths[path]
				if path.match(/\.imba/) and !compileImba(e.data)
					# there were errors -- return the error?
					return

				let clients = await global.clients.matchAll({})
				let reloads = []
				for client in clients
					let map = clientLoadMap[client.id]
					if map and map[path]
						reloads.push(client.url)
						# log 'CLIENT HAS ACCESSED THIS',client

				if reloads.length
					e.source.postMessage({event: 'reload',urls: reloads})
			# look through the files that are current
		return

	def oninstall e
		log e
		# console.log 'install sw'
		e.waitUntil global.skipWaiting!
	
	def onactivate e
		log e
		# console.log 'activate sw'
		e.waitUntil global.clients.claim!

	def onfetch e
		
		let url = new URL(e.request.url)
		let clientId = e.resultingClientId or e.clientId
	
		if url.pathname.indexOf('/repl/') == -1
			return
			

		let path = url.pathname.replace(/^\/repl/,'') 
		let ext = path.split('.').pop()
		let name = path.split('/').pop()
		let basename = name.replace(/\.\w+$/,'')

		let file = files[path]

		console.log 'onfetch',e.request.url,!!file

		let responder = new Promise do(resolve)
			let loadMap = clientLoadMap[clientId] ||= {}

			loadMap[path] = yes
			accessedPaths[path] = yes

			if !file and ext == 'html'
				# console.log 'returning mocked html page!'
				file = {body: indexTemplate.replace(/index\.imba/g,"{basename}.imba")}

			if file
				let status = 200
				let mime = mimeTypeMap[ext] or mimeTypeMap.html
				let body = file.body

				if ext == 'html'
					body = '<script>try { window.frameElement.replify(this) } catch(e){ } </script>' + body
					yes
				elif ext == 'imba'
					body = file.js or compileImba(file)
					# body = 'import "/repl/examples/helpers.imba";\n' + body
					body = 'import "/imba.js";\n' + body

				let resp = new Response(body,status: status,headers: {'Content-Type': mime})
				resolve(resp)
			else
				resolve(null)
		return e.respondWith(responder)

const worker = new Worker
global.files = worker.files
global.loadMap = clientLoadMap

global.INSPECT = do
	var clients = await global.clients.matchAll({})
	console.log clients

global.SEND = do(msg)
	var clients = await global.clients.matchAll({})
	for client in clients
		client.postMessage("from sw: {msg}")