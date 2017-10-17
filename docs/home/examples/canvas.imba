let dpr = window:devicePixelRatio or 1

tag sketchpad < canvas

	# receive the touch / click
	# create two paths for each touch
	def ontouchstart t
		t.capture
		t.data = [Path2D.new, Path2D.new]

	# triggered when a touch moves
	# loop through the paths and draw them
	def ontouchupdate t
		t.data.forEach do |path,i|
			let x = t.tx + i + i * Math.random * 3
			let y = t.ty + i + i * Math.random * 3
			path.lineTo(x * dpr,y * dpr)
			context('2d').stroke(path)

	def render
		<self width=270 height=270>