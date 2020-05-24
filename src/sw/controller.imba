import {fs,files,ls} from '../store'

var resolved = null
var resolver = null
var promise = null
var controller = null

export def load
	return Promise.resolve(controller) if controller

	promise ||= Promise.new do(resolve)
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

		for file in files
			file.sw = sw.controller
			file.sendToWorker!

		resolve(controller = sw.controller)

export def on event, cb
	window.navigator.serviceWorker.addEventListener('message') do(e)
		if e.data and e.data.event == event
			cb(e.data,e)

