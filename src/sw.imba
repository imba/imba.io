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

const clientLoadMap = {}
const accessedPaths = {}
const fileCache = {}

const services = {}

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
			console.log 'resolvePath',path,result
			cacheFile(path,result)
			return resolve(result)

	def cacheFile path, file
		files[path] = file

	def onmessage e
		if e.data isa Array
			console.log 'sw message from service',e.data

	def rpc action, ...params
		new Promise do(resolve,reject)
			const channel = new MessageChannel
			channel.port1.onmessage = do(event) resolve(event.data)
			owner.postMessage([action,params], [channel.port2])

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



class Worker

	def constructor
		files = {}

		for ev in ['message','fetch','install','activate']
			global.addEventListener(ev,self["on{ev}"].bind(self))
		self

	def getClient id
		let clients = await global.clients.matchAll(includeUncontrolled: true)
		if id
			return clients.find do $1.id == id
		else
			return clients.find do $1.frameType == 'top-level'

	def getService id
		let client = await getClient(id)
		return Service.forClient(client)

	def log ...params
		console.log(...params)
		self

	def onmessage e
		let res = {status: 0}
		let cli = Service.forClient(e.source)
		if cli
			cli.onmessage(e)

		if e.data isa Array
			console.log 'array to port?!',e.data
			e.ports[0].postMessage('test': 'Response from sw')
			setTimeout(&,200) do e.ports[0].postMessage('test': 'Response from sw again')
			cli.rpc('readFilez',{path: 'tata'})
			return

		console.log 'sw onmessage',e,cli

		if e.data.event == 'compile'
			# console.log 'sw compile',e.data.body
			let js = compileImba(e.data)
			return e.source.postMessage({event: 'compiled',ref: e.data.ref, source: e.data.body, js: js})

		if e.data.event == 'preload'
			console.log 'preload',rnd
			for own path,file of e.data.files
				files[path] = file
			e.source.postMessage(event: 'ready')

		if e.data.event == 'file'
			let path = e.data.path
			files[path] = e.data

			if typeof e.data.ref == 'number'
				# console.log 'posting message back to source',e.data.ref
				e.source.postMessage(ref: e.data.ref, status: 0)

			if accessedPaths[path]
				if path.match(/\.imba/) and !compileImba(e.data)
					# there were errors -- return the error?
					false
				else
					let clients = await global.clients.matchAll({})
					let reloads = []
					for client in clients
						let map = clientLoadMap[client.id]
						if map and map[path]
							reloads.push(client.url)
							# log 'CLIENT HAS ACCESSED THIS',client

					if reloads.length
						e.source.postMessage({event: 'reload',urls: reloads})
		return

	def oninstall e
		log e
		console.log 'install sw',Object.keys(files).length,rnd
		e.waitUntil global.skipWaiting!
		# e.waitUntil
	
	def onactivate e
		log e
		console.log 'activate sw',Object.keys(files).length,rnd
		e.waitUntil global.clients.claim!
		var clients = await global.clients.matchAll({})
		for client in clients
			client.postMessage(event: 'activate')
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
			let service = null
			# let service = await getService!
			console.log 'onfetch!',e.request.url,!!file,ext,e.resultingClientId,e.clientId

			let loadMap = clientLoadMap[clientId] ||= {}

			#  find closest visible top-levle window
			if e.resultingClientId
				let clients = await global.clients.matchAll(includeUncontrolled: true)
				let source = clients.find do $1.frameType == 'top-level' and $1.visibilityState == 'visible'
				console.log 'found source',source
				loadMap.service = Service.forClient(source)

			unless loadMap.service
				console.log 'could not find serviceworker!!'
			else
				service = loadMap.service

			if name.match(/\.imba\.html/)
				let js = 'try { window.frameElement.replify(this) } catch(e){ }'
				let body = "<script>window.ServiceSessionID = '{clientId}'; {js}</script>" + indexTemplate.replace(/index\.imba/g,basename)
				let resp = new Response(body,status: 200,headers: {'Content-Type': 'text/html'})
				# console.log 'respond',url.pathname,body
				return resolve(resp)
			
			loadMap[path] = yes
			accessedPaths[path] = yes

			let file = await service.readFile(path)

			if file
				let ext = file.name.split('.').pop!
				loadMap[file.path] = accessedPaths[file.path] = yes

				let status = 200
				let mime = mimeTypeMap[ext] or mimeTypeMap.html
				let body = file.body

				if ext == 'html'
					let js = 'try { window.frameElement.replify(this) } catch(e){ }'
					body = "<script>window.ServiceSessionID = '{clientId}'; {js}</script>" + body
				elif ext == 'imba'
					body = file.js or compileImba(file)
					body = 'import "/imba.js";\n' + body

				let resp = new Response(body,status: status,headers: {'Content-Type': mime})
				console.log 'responding',Date.now! - t0
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