class State
	history = []
	history_position = 0
	circles = []	
	selection = null
	context = false

	def handleClick e
		return context = false if context
		# We need to calculate the svg offset from the top of page
		# to calculate click relative to the svg position
		let boundung-rect = e.target.getBoundingClientRect()
		let svg-top = boundung-rect.y
		let svg-right = boundung-rect.x

		circles.push({
			cx: e.x - svg-right,
			cy: e.y - svg-top,
			r: 20 })
		selection = circles[-1]
		
		# Overwrite redo history if such exist
		if history_position != history.length - 1
			history.length = history_position + 1

		# I use type for the case if we need also redo/undo resizing
		history.push {type: "new circle", circle: circles[-1]}
		history_position = history.length - 1

	def setSelection i, showContext = false
		context = showContext
		selection = circles[i]

	def undoAction
		context = false
		return if !history.length or history_position < 0

		let event = history[history_position]
		if event.type == 'new circle'
			let index_of_circle_to_remove = circles.indexOf(event.circle)
			circles.splice(index_of_circle_to_remove, 1)

		history_position-- if history_position > -1
		
	def redoAction
		context = false
		return if !history.length or history_position == history.length

		let event = history[history_position + 1]
		if event..type == 'new circle'
			circles.push(event.circle)

		history_position++ if history_position < history.length - 1
		

let state = new State

extend tag element
	get state
		return state