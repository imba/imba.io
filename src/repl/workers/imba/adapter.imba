
export class Adapter
	
	prop worker
	prop selector

	def constructor defaults, selector, worker
		defaults = defaults
		selector = selector
		worker = worker
		disposables = []
		listener = Object.create(null)
		self

	def dispose
		for item in disposables
			item.dispose!

		for own key,val of listener
			val.dispose!

		disposables = []
		listener = Object.create(null)
		self

	get editor
		global.monaco.editor

export class DiagnosticsAdapter < Adapter
	
	def constructor defaults, selector, worker
		super

		var onModelAdd = do |model|
			if model.getModeId! != selector
				return

			addModel(model)

		var onModelRemoved = do |model|
			removeModel(model)

		disposables.push editor.onDidCreateModel(onModelAdd)
		disposables.push editor.onWillDisposeModel(onModelRemoved)

		disposables.push editor.onDidChangeModelLanguage do(event)
			onModelRemoved(event.model)
			onModelAdd(event.model)

		editor.getModels!.forEach(onModelAdd)

	def addModel model
		# console.log "Diagnostics.addModel",model
		var uri = model.uri.toString!

		if listener[uri]
			return

		var handle

		model.IMBA_ADAPTER = self

		var sub = model.onDidChangeContent do(e)
			prevalidate(uri)
			clearTimeout(handle)
			handle = setTimeout(&,200) do validate(uri)

		listener[uri] =
			dispose: do
				clearTimeout(handle)
				sub.dispose!

		validate(uri)

	def removeModel model
		var key = model.uri.toString
		# console.log "removeModel",model,key
		if listener[key]
			listener[key].dispose!
			delete listener[key]

	def locToRange model, loc
		var a = model.getPositionAt(loc[0])
		var b = model.getPositionAt(loc[1])
		return global.monaco.Range.new(a.lineNumber,a.column,b.lineNumber,b.column)

	def varToDecoration model,item,loc
		if item isa Array
			loc = [item[0],item[0] + item[1]]
			item = {type: 'variable'}

		return {
			range: locToRange(model,loc)
			options: { inlineClassName: 'variable' }
		}

	def warningToMarker model, original
		var item = locToRange(model, original.loc)
		item.severity = 3
		item.message = original.message
		return item

	def warningToDecoration model, orig
		var range = locToRange(model, orig.loc)
		return {
			range: range
			options: {
				name: 'error'
				linesDecorationsClassName: 'error'
			}
		}

	def prevalidate uri
		var model = editor.getModel(uri)
		var meta = model.imbaEntities or {}
		if meta.warnings
			# remove error markers immediately
			editor.setModelMarkers(model,selector,[])

		self

	def updateSemanticTokens model, ranges
		let markers = ranges.map do varToDecoration(model,$1)
		model.varDecorations = model.deltaDecorations(model.varDecorations ||= [],markers)

	def validate uri
		var model = editor.getModel(uri)
		var worker = await worker(uri)
		var semantics = await worker.getSemanticTokens(uri)
		updateSemanticTokens(model,semantics)
		var meta = await worker.getDiagnostics(uri)
		# console.log "returned from worker?",meta,semantics
		var decorations = []
		var markers = []

		model.imbaEntities = meta

		for warn in meta.warnings
			# var loc = locToRange(model, warn:loc)
			decorations.push(warningToDecoration(model,warn))
			markers.push(warningToMarker(model, warn))

		editor.setModelMarkers(model,selector,markers)
		return []