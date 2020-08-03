import { DiagnosticsAdapter } from './adapter'
import {SemanticTokenTypes,SemanticTokenModifiers} from 'imba/program'

var STOP_WHEN_IDLE_FOR = 2 * 60 * 1000 # 2min

export class WorkerManager

	def constructor path, defaults
		path = path
		defaults = defaults
		worker = null
		idleCheckInterval = setInterval(&,30 * 1000) do checkIfIdle!
		lastUsedTime = 0

	def stopWorker
		if worker
			worker.dispose!
			worker = null
		client = null

	def dispose
		clearInterval(idleCheckInterval)
		stopWorker!

	# should be disabled
	def checkIfIdle
		return unless worker
		var elapsed = Date.now! - lastUsedTime
		if elapsed > STOP_WHEN_IDLE_FOR
			stopWorker!

	def getClient
		# console.log "worker getClient!"
		lastUsedTime = Date.now!

		unless client
			worker = global.monaco.editor.createWebWorker(
				moduleId: path
				label: 'imba'
				createData: { defaults: defaults }
			)
			client = worker.getProxy!

		return client

	def getLanguageServiceWorker ...resources
		let client = await getClient!
		worker.withSyncedResources(resources).then do client

export def setupMode modeId
	var client = new WorkerManager('/worker.imba.js', {})
	var worker = client.getLanguageServiceWorker.bind(client)
	new DiagnosticsAdapter({}, modeId, worker)