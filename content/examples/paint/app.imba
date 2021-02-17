global css body rd:lg of:hidden
# ---
tag Paint < canvas
	dpr = window.devicePixelRatio

	def draw e
		let path = e.#path ||= new Path2D
		path.lineTo(e.x * dpr,e.y * dpr)
		getContext('2d').stroke(path)

	def refresh
		width = offsetWidth * dpr
		height = offsetHeight * dpr

	<self @resize=refresh @touch=draw>

imba.mount <Paint[pos:abs w:100% h:100% bg:pink3 rd:lg]>
# ~resize|2,-21,246,50,14,88,48~ custom resize event for elements
# ~tag|2,-7,71,28,18,93,58~ extend and override native tag types
# ~canvas|1,36,-21,50,,50,50~ extend native elements
# ~refresh|0,215,-8,50,25,18,58~ update canvas size when element is resized
# ~touch|0,111,-28,50,23,23,53~ pointer-events abstraction