import {fs,files,ls} from '../store'

var resolved = null
var resolver = null
var promise = null
var controller = null
var requests = []
var queued = []

export def load
	return Promise.resolve(controller) if controller

	promise ||= new Promise do(resolve)
		const sw = window.navigator.serviceWorker
		var reg = await sw.getRegistration('/')

		if reg
			console.log 'update service worker'
			await reg.update!
		else
			console.log 'register service worker'
			reg = await sw.register('/sw.js')

		global.fetch('/preflight.css') # just to register this client with the worker
		console.log 'loaded service worker'

		controller = sw.controller

		for file in files
			file.sw = sw.controller
			file.sendToWorker!

		sw.addEventListener('message') do(e)
			if e.data and typeof e.data.ref == 'number'
				console.log 'got response?!?'
				let req = requests[e.data.ref]
				if req
					req(e.data)
					requests[e.data.ref] = null
		
		
		for payload in queued
			console.log 'flushing payloads',payload
			sw.controller.postMessage(payload)
		queued = []

		setTimeout(&,200) do
			resolve(controller = sw.controller)

export def on event, cb
	window.navigator.serviceWorker.addEventListener('message') do(e)
		if e.data and e.data.event == event
			cb(e.data,e)

export def request payload, cb
	let nr = requests.length
	payload.ref = nr

	new Promise do(resolve)
		requests.push(resolve)
		if controller
			controller.postMessage(payload)
		else
			console.log 'queue payload!'
			queued.push(payload)
		return true

	# window.navigator.serviceWorker.addEventListener('message') do(e)
	#	if e.data and e.data.event == event
	#		cb(e.data,e)
