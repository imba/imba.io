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
				:pointerdown.start
				:pointermove.move
				:pointerup.end				
			>

	def start e
		console.info('pointer!',e)
		# pointerdrag
		$canvas.setPointerCapture(e.pointerId)
		paths = [Path2D.new, Path2D.new]

	def move e
		if e.pressure
			for path,i in paths
				let dpr = window.devicePixelRatio
				let x = e.offsetX + i + i * Math.random! * 3
				let y = e.offsetY + i + i * Math.random! * 3
				path.lineTo(x * dpr,y * dpr)
				$canvas.getContext('2d').stroke(path)

	def end e
		console.log('ended',e.pressure,e.pointerId)

imba.mount <app-paint>
