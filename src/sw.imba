const imbac = require 'imba/dist/compiler'
global.imbac = imbac

const rnd = Math.random!
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

const clientServiceMap = {}
const services = {}

def compileImba file
	try
		let body = file.body
		# rewrite certain special things
		body = body.replace(/# @(show|log)( .*)?\n(\t*)/g) do(m,typ,text,tabs)
			m + "${typ} '{(text or '').trim!}', "
		body = body.replace(/from 'imdb'/g,'from "/imdb.js"')
		body = body.replace(/(import [^\n]*')(\w[^']*)(?=')/g) do(m,start,path)
			# console.log 'rewrite',path,'to',"/repl/examples/{path}"
			start + "/repl/examples/{path}"

		let result = imbac.compile(body,{target: 'web', sourcePath: file.path, imbaPath: null})
		file.js = result.toString!
	catch e
		console.log 'error compiling',e
		return
	return file.js

class File
	def constructor service, data
		service = service
		name = data.name
		path = data.path
		body = data.body

	get ext
		$ext ||= name.split('.').pop!


class Service
	static def forClient client
		services[client.id] ||= new self(client)

	def constructor client, options = {}
		client._container = self
		owner = client
		options = options
		counter = 1
		promises = {}
		requests = {}
		files = {}
	
	def readFile path
		if files[path]
			return files[path]
		
		promises[path] ||= new Promise do(resolve)
			let result = await rpc('resolvePath',path)
			# console.log 'resolvePath',path,result
			cacheFile(path,result)
			return resolve(result)

	def cacheFile path, file
		files[path] = file

	def updateFile entry
		# console.log 'update file',path,body
		let file = files[entry.path]
		unless file
			file = files[entry.path] = entry
		else
			file.body = entry.body

		# compare with previous version etc
		if (/\.imba$/).test(entry.path)
			let js = compileImba(file)
			return js
		return

	def compileFile path, body, options = {}
		self

	def onmessage e
		if e.data isa Array
			# console.log 'sw message from service',e.data
			let [action,params] = e.data
			let result = null
			if self[action]
				result = await self[action](...params)
				e.ports[0].postMessage(result)

	def rpc action, ...params
		new Promise do(resolve,reject)
			const channel = new MessageChannel
			channel.port1.onmessage = do(event) resolve(event.data)
			owner.postMessage([action,params], [channel.port2])


class Worker

	def constructor
		for ev in ['message','fetch','install','activate']
			global.addEventListener(ev,self["on{ev}"].bind(self))
		self

	def log ...params
		console.log(...params)
		self

	def onmessage e
		let res = {status: 0}
		let cli = Service.forClient(e.source)
		if cli
			cli.onmessage(e)

		if e.data isa Array
			return

		# console.log 'sw onmessage',e,cli

		if e.data.event == 'compile'
			# console.log 'sw compile',e.data.body
			let js = compileImba(e.data)
			return e.source.postMessage({event: 'compiled',ref: e.data.ref, source: e.data.body, js: js})

		return

	def oninstall e
		log e
		# console.log 'install sw',Object.keys(files).length,rnd
		global.skipWaiting!
		return
	
	def onactivate e
		log e
		# console.log 'activate sw',Object.keys(files).length,rnd
		e.waitUntil global.clients.claim!
		self

	def onfetch e
		
		let url = new URL(e.request.url)
		let clientId = e.resultingClientId or e.clientId
	
		if url.pathname.indexOf('/repl/') == -1
			return

		let path = url.pathname.replace(/^\/repl/,'') 
		let name = path.split('/').pop!
		let basename = name.replace(/\.\w+$/,'')
		let ext = name.slice(basename.length + 1)

		let responder = new Promise do(resolve)
			let t0 = Date.now!
			let service = clientServiceMap[clientId]

			# console.log 'onfetch!',e.request.url,!!file,ext,e.resultingClientId,e.clientId,e.replacesClientId,e

			#  find closest visible top-level window
			if e.resultingClientId
				let clients = await global.clients.matchAll(includeUncontrolled: true)
				let source = clients.find do $1.frameType == 'top-level' and $1.visibilityState == 'visible'
				service = clientServiceMap[clientId] = Service.forClient(source)

			if name.match(/\.imba\.html/)
				let js = 'try { window.frameElement.replify(this) } catch(e){ }'
				let body = "<script>window.ServiceSessionID = '{clientId}'; window.ImbaFiles = \{\}; {js}</script>" + indexTemplate.replace(/index\.imba/g,basename)
				let resp = new Response(body,status: 200,headers: {'Content-Type': 'text/html'})
				return resolve(resp)

			let file = await service.readFile(path)

			if file
				let ext = file.name.split('.').pop!

				let status = 200
				let mime = mimeTypeMap[ext] or mimeTypeMap.html
				let body = file.body

				if ext == 'html'
					let js = 'try { window.frameElement.replify(this) } catch(e){ }'
					body = "<script>window.ServiceSessionID = '{clientId}'; window.ImbaFiles = \{\}; {js}</script>" + body
				elif ext == 'imba'
					body = file.js or compileImba(file)
					body = "import '/imba.js';\nImbaFiles['{file.path}']=1;\n" + body

				let resp = new Response(body,status: status,headers: {'Content-Type': mime})
				# console.log 'responding',Date.now! - t0
				resolve(resp)
			else
				resolve(null)
		return e.respondWith(responder)

const worker = new Worker

global.INSPECT = do
	var clients = await global.clients.matchAll({})
	console.log clients

global.SEND = do(msg)
	var clients = await global.clients.matchAll({})
	for client in clients
		client.postMessage("from sw: {msg}")