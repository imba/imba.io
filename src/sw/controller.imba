import {fs} from '../store'

var promise = null
var resolved = null

export const id = String(Math.random!)

export def load
	return Promise.resolve(resolved) if resolved
	
	promise ||= new Promise do(resolve)
		# console.log 'serviceWorker',this,globalThis
		const sw = window.navigator.serviceWorker

		try
			let reg = await sw.getRegistration('/')
			
			if reg
				reg = await reg.update!
				console.log 'update service worker'
			else
				# console.log 'register service worker'
				reg = await sw.register('/sw.js')

			# just to register this client with the worker
			await global.fetch("/repl/register/?swid={id}")
			# await global.fetch("/repl/register/?swid={id}")
			await fs.connectToWorker(sw)
			return resolve(resolved = sw)
		catch e
			console.warn 'error setting up service worker',e
