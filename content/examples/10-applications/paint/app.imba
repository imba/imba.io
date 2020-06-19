const DPR = window.devicePixelRatio

tag app-paint
	prop size = 1000

	def draw e
		$path = new Path2D if e.type == 'pointerdown'
		$path.lineTo(e.offsetX * DPR,e.offsetY * DPR)
		$canvas.getContext('2d').stroke($path)
	
	<self[d:block of:hidden bg:blue1]>
		<canvas$canvas[size:1000px]
			width=2000 height=2000 @touch.lock=draw>

imba.mount <app-paint>
