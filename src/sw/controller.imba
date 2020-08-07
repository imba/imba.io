import {fs,files,ls} from '../store'

var resolved = null
var resolver = null
var promise = null
var controller = null
var requests = []
var queued = []
var isReady = false
var sentFiles = {}

export def load
	return Promise.resolve(controller) if controller
	
	promise ||= new Promise do(resolve)
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
