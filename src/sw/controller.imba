import {fs,files,ls} from '../store'

var resolved = null
var resolver = null
var promise = null
var controller = null
var requests = []
var queued = []
var isReady = false
var sentFiles = {}

window.sentFiles = sentFiles

class Service
	get sw
		window.navigator.serviceWorker

	def constructor
		channel = new MessageChannel
		channel.port1.onmessage = do(event)
			console.log 'service.onmessage',event.data
		setup!
		self
	
	def readFile {path}
		self

	def rpc action, params = {}
		new Promise do(resolve,reject)
			const channel = new MessageChannel
			channel.port1.onmessage = do(event)
				console.log 'response from sw??',event
				resolve(event.data)
			sw.controller.postMessage([action,params], [channel.port2])
	
	def setup
		sw.addEventListener('message') do(e)
			console.log 'Service.onmessage',e
			if e.data isa Array
				console.log 'request from worker'
				e.ports[0].postMessage('test': 'Response from client')

	def post
		yes


export def load
	return Promise.resolve(controller) if controller
	
	promise ||= new Promise do(resolve)
		# window.service = new Service
		let t0 = Date.now!
		const sw = window.navigator.serviceWorker

		sw.oncontrollerchange = do(e)
			console.log 'oncontrollerchange'

		let reg = await sw.getRegistration('/')
		# reg = await sw.register('/sw.js')
		if reg
			console.log 'update service worker'
			reg = await reg.update!
		else
			console.log 'register service worker'
			reg = await sw.register('/sw.js')

		await global.fetch('/preflight.css') # just to register this client with the worker
		await fs.connectToWorker(sw)
		console.log 'returning early!'
		# sw.controller.postMessage({type: 'hello'})
		return resolve(sw)

		reg.onupdatefound = do(e)
			console.log 'reg onupdatefound'

		let preloads = {}
		for file in files
			if file.ext != 'md'
				preloads[file.path] = sentFiles[file.path] = {path: file.path, body: file.body}
				
		let initializer = {event: 'preload', files: preloads}

		# await reg.ready

		await global.fetch('/preflight.css') # just to register this client with the worker
		fs.connectToWorker(sw)

		let ctr = sw.controller

		sw.addEventListener('message') do(e)

			if e.data and e.data.event == 'activate'
				console.log 'service worker did activate!!'
				for file in files
					file.sw = sw.controller
				controller = sw.controller
				sw.controller.postMessage(initializer)

			if e.data and e.data.event == 'ready'
				isReady = true
				console.log 'sw is ready?',Date.now! - t0
				for payload in queued
					sw.controller.postMessage(payload)
				queued = []
				resolve(controller = sw.controller)

			if e.data and typeof e.data.ref == 'number'
				# console.log 'got response?!?'
				let req = requests[e.data.ref]
				if req
					req(e.data)
					requests[e.data.ref] = null
		
		sw.controller.postMessage(initializer)
		console.log 'preloads',preloads


export def on event, cb
	window.navigator.serviceWorker.addEventListener('message') do(e)
		if e.data and e.data.event == event
			cb(e.data,e)

export def request payload, cb
	let nr = requests.length
	payload.ref = nr

	new Promise do(resolve)
		if payload.event == 'file'
			sentFiles[payload.path] = payload
		requests.push(resolve)
		if controller and isReady
			controller.postMessage(payload)
		else
			queued.push(payload)
		return true

	# window.navigator.serviceWorker.addEventListener('message') do(e)
	#	if e.data and e.data.event == event
	#		cb(e.data,e)
