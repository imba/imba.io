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

const clientLoadMap = {

}

const accessedPaths = {

}

def compileImba file
	let result = imbac.compile(file.body,{target: 'web', sourcePath: file.path, imbaPath: null})
	file.js = result.toString!
	return file.js


class Worker

	def constructor
		files = {}

		for ev in ['message','fetch','install','activate']
			global.addEventListener(ev,self["on{ev}"].bind(self))
		self

	def log ...params
		console.log(...params)

	def onmessage e
		log 'sw inbound message',e
		if e.data.event == 'file'
			let path = '/playground' + e.data.path
			files[path] = e.data
			if accessedPaths[path]
				log 'accessed this already...',path
				let clients = await global.clients.matchAll({})
				for client in clients
					let map = clientLoadMap[client.id]
					if map and map[path]
						log 'CLIENT HAS ACCESSED THIS',client
						client.navigate(client.url)
			# look through the files that are current
		return

	def oninstall e
		log e
		e.waitUntil(global.skipWaiting!)
	
	def onactivate e
		log e
		e.waitUntil(global.clients.claim!)

	def onfetch e
		
		let url = URL.new(e.request.url)
		let ext = url.pathname.split('.').pop!
		let file = files[url.pathname]
		let clientId = e.resultingClientId or e.clientId
		log 'fetch',e,url.pathname,file

		if url.pathname.indexOf('/playground') == -1
			return

		let responder = Promise.new do(resolve)
			let loadMap = clientLoadMap[clientId] ||= {}

			loadMap[url.pathname] = yes
			accessedPaths[url.pathname] = yes

			if file
				ext = file.path.split('.').pop!
				let status = 200
				let mime = mimeTypeMap[ext] or mimeTypeMap.html
				let body = file.body

				if ext == 'html'
					# add the imba 
					yes
				elif ext == 'imba'
					body = compileImba(file)
					body = 'import "/imba.js";\n' + body

				let resp = Response.new(body,status: status,headers: {'Content-Type': mime})
				resolve(resp)
			else
				resolve(null)
		return e.respondWith(responder)

const worker = Worker.new
global.files = worker.files
global.loadMap = clientLoadMap

global.INSPECT = do
	var clients = await global.clients.matchAll({})
	console.log clients

global.SEND = do(msg)
	var clients = await global.clients.matchAll({})
	for client in clients
		client.postMessage("from sw: {msg}")