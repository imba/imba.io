tag draggable-item
	css p:4 m:6 pos:relative d:block
	css @touch scale:1.05 rotate:2deg zi:2

	def build
		x = y = dx = dy = 0

	def drag e
		if e.type == 'pointerup'
			x += dx
			y += dy
			dx = dy = 0
		else
			dx = e.dx
			dy = e.dy

	def render
		<self[x:{x+dx} y:{y+dy}] @touch=drag> 'drag me'

imba.mount do <div>
	<draggable-item[bg:blue3]>
	<draggable-item[bg:teal3]>
	<draggable-item[bg:orange3]>