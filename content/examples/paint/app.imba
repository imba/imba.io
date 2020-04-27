const DPR = window.devicePixelRatio

tag app-paint
	prop width = 200
	prop height = 200
	def render
		<self.block.overflow-hidden.bg-blue-200>
			<canvas$canvas
				width=2000
				height=2000
				css:width=(2000 / DPR)
				css:height=(2000 / DPR)
				@pointerdown=start
				@pointermove=move
				@pointerup=end
			>

	def start e
		console.info('pointer!',e)
		# pointerdrag
		$canvas.setPointerCapture(e.pointerId)
		path = Path2D.new

	def move e
		if e.pressure and path
			path.lineTo(e.offsetX * DPR,e.offsetY * DPR)
			for path,i in paths
				$canvas.getContext('2d').stroke(path)

	def end e
		console.log('ended',e.pressure,e.pointerId)

imba.mount <app-paint>
