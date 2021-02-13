import { getArrow,getBoxToBoxArrow } from "perfect-arrows"

const defaults = {
	bow: 0.1
	stretch: 0.03
	minStretch:0
	maxStretch:400
	padEnd: 8
	padStart: 0
	flip: false
	straights: false
}

tag arrow-debug

	def refresh
		let arrows = document.querySelectorAll('app-arrow')
		for arrow in allArrows
			arrow.render!
		self

	<self[pos:fixed t:200px l:0px zi:200 d:block] @change.silent=refresh>
		<div>
			<input type='range' min=0.0 step=0.01 max=1 bind=defaults.bow>
			<span> defaults.bow
		<div>
			<input type='range' min=0.0 step=0.01 max=1 bind=defaults.stretch>
			<span> defaults.stretch
		<div>
			<input type='range' min=0.0 step=0.01 max=400 bind=defaults.minStretch>
			<span> defaults.minStretch
		<div>
			<input type='range' min=0.0 step=0.01 max=400 bind=defaults.maxStretch>
			<span> defaults.maxStretch
		<div>
			<input type='range' min=0.0 step=0.01 max=30 bind=defaults.padStart>
			<span> defaults.padStart
		<div>
			<input type='range' min=0.0 step=0.01 max=30 bind=defaults.padEnd>
			<span> defaults.padEnd
		<div>
			<input type='checkbox' bind=defaults.flip>
			<span> defaults.flip
		<div>
			<input type='checkbox' bind=defaults.straights>
			<span> defaults.straights

# imba.mount <arrow-debug>

def rotate cx, cy, x, y, rad
	# let radians = (Math.PI / 180) * angle
	let cos = Math.cos(rad)
	let sin = Math.sin(rad)
	let nx = (cos * (x - cx)) + (sin * (y - cy)) + cx
	let ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
	return [nx, ny]

def calculateConnector from,to,o = defaults
	from = from.getBoundingClientRect! if from isa Element
	to = to.getBoundingClientRect! if to isa Element
	let arrow = getBoxToBoxArrow(
		from.left,from.top,from.width,from.height,
		to.left,to.top,to.width,to.height,o
	)
	return arrow

def normalizeConnector arrow
	let [sx,sy,cx,cy,ex,ey,endrad,startrad,midrad] = arrow
	let out = {x: sx, y: sy}
	# offset all points to make x the center
	ex -= sx
	ey -= sy
	cx -= sx
	cy -= sy
	sx = sy = 0

	let angle = Math.atan2(ey,ex)
	[ex,ey] = rotate(0,0,ex,ey,angle)
	[cx,cy] = rotate(0,0,cx,cy,angle)
	
	let w = out.width = Math.round(ex) + 20
	let h = out.height = Math.round(Math.abs(cy) * 2) + 20
	let oy = (h - 20) / 2

	let d = out.path = `M{sx},{sy} Q{cx},{cy} {ex},{ey}`
	out.end = "translate({ex},{ey}) rotate({(endrad - angle) * (180 / Math.PI)})"
	out.start = "translate({sx},{sy}) rotate({(startrad - angle) * (180 / Math.PI)})"
	out.transform = "translate({out.x - 10}px,{out.y}px) translateY(-50%) scale(var(--scale,1))"
	out.angle = angle

	return out

def relativeRect frame, rect
	let l = rect.left - frame.left
	let t = rect.top - frame.top
	return {
		left: l,
		top: t,
		right: l + rect.width,
		bottom: t + rect.height,
		y: t + rect.height * 0.5
		x: l + rect.width * 0.5
		width: rect.width,
		height: rect.height
	}


tag app-arrow
	prop from
	prop to

	css @before test
		d:block
		content: " "
		size:1px
		bg:red4
		rd:full
		# t:-5px
		# l:-5px
		pos:absolute

	def render
		return unless offsetParent and from and to
		
		let rect0 = from.getBoundingClientRect!
		let rect1 = to.getBoundingClientRect!

		if frame
			let offset = frame.getBoundingClientRect!
			rect0 = relativeRect(offset,rect0) 
			rect1 = relativeRect(offset,rect1) 

		let arrow = calculateConnector(rect0,rect1)
		let norm = normalizeConnector(arrow)

		<self[d:block pos:abs t:{norm.y}px l:{norm.x}px rotate:{norm.angle}rad]>
			<svg$straight[pos:abs t:0 l:0 pe:none origin:10px 50%]
				css:transform="scale(var(--scale,1)) rotate(calc((1 - var(--scale,1)) * 20deg)"
				css:top="{norm.height * -0.5}px"
				width=norm.width
				height=norm.height
				>
				<g transform="translate(10,{norm.height / 2})">
					<svg:path$p fill="none" d=norm.path>
					<svg:polygon$end points="0,-3 6,0, 0,3" transform=norm.end>
					<svg:polygon$start points="0,-3 6,0, 0,3" transform=norm.start>

tag Point
	prop x = 0
	prop y = 0

	<self[x:{x}px y:{y}px] @touch.sync(self)>

tag App

	def mount
		render!
		refresh!

	def refresh
		let arrow = calculateConnector($a,$b)
		log arrow

	<self>
		css .point pos:absolute size:10px bg:red4 rd:full
		<Point$a.point[l:100px t:50px]>
		<Point$b.point[l:200px t:80px]>
		<app-arrow from=$a to=$b>


# imba.mount <App>