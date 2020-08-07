import {fs} from '../store'

var promise = null
var resolved = null

export def load
	return Promise.resolve(resolved) if resolved
	
	promise ||= new Promise do(resolve)
		const sw = window.navigator.serviceWorker

		let reg = await sw.getRegistration('/')

		if reg
			# console.log 'update service worker'
			reg = await reg.update!
		else
			# console.log 'register service worker'
			reg = await sw.register('/sw.js')

		# just to register this client with the worker
		await global.fetch('/preflight.css')
		await fs.connectToWorker(sw)
		return resolve(resolved = sw)
