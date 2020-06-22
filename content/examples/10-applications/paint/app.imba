const DPR = window.devicePixelRatio

tag app-paint
	def draw e
		$path = new Path2D if e.type == 'pointerdown'
		$path.lineTo(e.offsetX * DPR,e.offsetY * DPR)
		$canvas.getContext('2d').stroke($path)

	def render
		<self[d:block overflow:hidden bg:blue1]>
			<canvas$canvas[size:1000px]
				width=2000 height=2000 @touch=draw>

imba.mount <app-paint>
