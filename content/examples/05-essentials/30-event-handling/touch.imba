import '../styling/globals.imba'

tag drag-me
	css @hover bg:gray1
	css @touch scale:1.05 rotate:2deg bg:blue2 zi:2

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
		<self.box[x:{x+dx} y:{y+dy}] @touch=drag> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>