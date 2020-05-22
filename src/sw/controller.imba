var resolved = null
var resolver = null

export const promised = Promise.new do
	resolver = $1

export def setup
	return resolved if resolved
	const sw = window.navigator.serviceWorker
	var reg = await sw.getRegistration('/')

	if reg
		# console.log 'update service worker'
		await reg.update!
	else
		reg = await sw.register('/sw.js')

	global.fetch('/style.css') # just to register this client with the worker

	resolver(resolved = sw.controller)

	# sw.addEventListener('message') do(e)
	# 	console.log 'received message from worker',e

	return resolved

export def on event, cb
	window.navigator.serviceWorker.addEventListener('message') do(e)
		if e.data and e.data.event == event
			cb(e.data,e)

