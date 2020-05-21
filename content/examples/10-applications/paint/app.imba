const DPR = window.devicePixelRatio

tag app-paint
	prop size = 1000

	def render
		<self.(l:block clip bg:blue200)>
			<canvas$canvas
				width=(size * DPR)
				height=(size * DPR)
				css:width=size
				css:height=size
				@pointerdown=start
				@pointermove=move
				@pointerup=end
			>

	def start e
		console.log('pointerdown',e.pressure,e.pointerId)
		$canvas.setPointerCapture(e.pointerId)
		$path = Path2D.new

	def move e
		if e.pressure and $path
			$path.lineTo(e.offsetX * DPR,e.offsetY * DPR)
			$canvas.getContext('2d').stroke($path)

	def end e
		console.log('pointerup',e.pressure,e.pointerId)

console.log "Hello world"
console.log [1,2,3,4,{a:1,b:2}]
imba.mount <app-paint>
