var depth = 0

tag draggable-item

	def render
		<self.block.relative.select-none.p-4
			:pointerdown.start
			:pointermove.move
			:pointerup.end
		> <div> <slot>

	def start e
		style.zIndex = ++depth
		setPointerCapture(e.pointerId)
		pointer = {
			id: e.pointerId
			x: e.x - parseInt(style.left or '0')
			y: e.y - parseInt(style.top or '0')
		}

	def move e
		if e.pressure and pointer and pointer.id == e.pointerId
			let dx = e.x - pointer.x
			let dy = e.y - pointer.y
			style.left = dx + 'px'
			style.top = dy + 'px'

	def end e
		console.log('ended',e.pressure,e.pointerId)

imba.mount do
	<div>
		<draggable-item.bg-blue-400> "First"
		<draggable-item.bg-blue-300> "Second"
