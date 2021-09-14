export class State
	history = []
	history_position = 0
	circles = []	
	selection = null
	selection_scale = 0
	editing = no

	def writeHistory type
		console.log('wrote ', type)
		# Overwrite redo history if such exist
		if history_position != history.length - 1
			history.length = history_position + 1

		history.push {type, circle: selection, index: circles.indexOf(selection), scale: selection.r}
		console.log("wrote {type} to {selection.r} at length {history.length}}")
		history_position = history.length - 1

	def handleClick e
		return editing = no if editing
		# We need to calculate the svg offset from the top of page
		# to calculate click relative to the svg position
		let boundung-rect = e.target.getBoundingClientRect()
		let svg-top = boundung-rect.y
		let svg-right = boundung-rect.x

		circles.push
			cx: e.x - svg-right
			cy: e.y - svg-top
			r: 20
		selection = circles[-1]
		selection_scale = selection.r
		writeHistory "add"

	def handleScale
		writeHistory "scale"

	def setSelection i, startEditing = no
		editing = startEditing
		selection = circles[i]
		selection_scale = selection.r

	def undoAction
		# console.log(JSON.stringify({ history, history_position }))
		editing = no
		return if !history.length or history_position < 0

		let event = history[history_position]
		if event.type == "add"
			circles.splice(event.index, 1)
		elif event.type == "scale"
			console.log({ from: circles[event.index].r, to: event.scale })
			circles[event.index].r = event.scale

		history_position-- if history_position > -1
		
	def redoAction
		# console.log(JSON.stringify({ history, history_position }))
		editing = no
		return if !history.length or history_position == history.length

		let event = history[history_position + 1]
		if event..type == "add"
			circles.push(event.circle)
		elif event..type == "scale"
			console.log({ from: circles[event.index].r, to: event.scale })
			circles[event.index].r = event.scale

		history_position++ if history_position < history.length - 1
