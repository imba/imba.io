import {relativeRect,rectAnchor} from './app-arrow'

const FLAGS = {
	INLINE: 1
	MARGIN: 2
	ABOVE: 4
	BELOW: 8 
}

tag app-popover

	css self
		d:block c:green4 t:0 l:0 pos:abs w:0 h:0
		transform-style: preserve-3d
		transform-origin: 0% 0%

		$base size:4 rd:full bg:green3/15 mt:-2 ml:-2 d:none
		div transform-style: preserve-3d pos:abs t:0 l:0

		$line h:0px w:100px pos:abs t:0 l:0
			transform-origin:0% 50%
			$lend pos:abs l:100% transform-origin:50% 50%
				
		$end pos:abs t:0 l:0
		svg pos:abs t:0 l:0px transform:translate(0%,-50%)
		path fill:none stroke:green4 stroke-width:1px
			stroke-linecap:round
			stroke-dasharray:3px 4px
		$p1 stroke:green6/40
			# stroke-width:3px
			stroke-dashoffset: 4px
		$p2 stroke:green4

		.box rd:lg pos:abs
			t:0 l:0 p:2 d:flex ja:center
			transform: translate3d(-50%,-50%,0px)
			ff:notes fw:400 fs:md/1 ta:center ws:nowrap
			# ts:0px 0px 4px black
			# bg:cooler7/60
			# bg:green4/20 

		&.inline .box
			x:0% y:-50%
		
		&.margin
			.box ws:normal ts:none c:green7 min-width:100px
			$p2 stroke:green5
		&.left
			.box ta:center x:-100% y:-50%

		&.outside
			.box ts:none
			c:green7
			$p2 stroke:green5

		&.off
			visibility:hidden pe:none
			.box visibility:hidden pe:none
	
	def setup
		target = frame.querySelector(data.sel)
		rot = {x: 0, y: 0}
		bow = (Math.random! * 0.8 + 0.2)
		# flags.toggle('outside',data.mask & FLAGS.OUTSIDE)
		# rot = Math.random! * 360

	def serialize
		let r = do Math.round($1)
		"# ~{data.pattern}|{data.mask},{r data.ox},{r data.oy},{r data.oz},{data.w or ''},{r data.ax},{r data.ay}~ {data.text}"


	def relayout e
		# log 'relayout',target,e..type
		if target and data.oy != undefined
			try
				let frame = offsetParent.getBoundingClientRect!
				let rel = relativeRect(frame,target.getBoundingClientRect!)
				let lgutter = frame.left
				let active = yes

				let fax = 0.5
				let fay = 0.5

				let tax = (data.ax / 100)
				let tay = (data.ay / 100)

				let x = data.ox
				let y = data.oy
				let z = data.oz

				if data.mask & FLAGS.MARGIN
					x = x * (Math.min(lgutter,200) / 200) if x < 0
					x -= rel.left
					y -= rel.top
					fax = 0

					if frame.left < 160
						active = no

				if data.mask & FLAGS.INLINE and frame.left >= 160
					active = no

				let xylen = Math.sqrt(x * x + y * y)
				let h = Math.ceil(Math.sqrt(xylen * xylen + z * z))

				let rot = Math.atan2(y,x) * 180 / Math.PI
				let yrot = Math.asin(z / h) * 180 / Math.PI
				let bow = bow
				let boxw = $end.offsetWidth

				if y < 0 or x < 0
					bow = -bow

				let svgh = Math.round(Math.max(30,h * 0.25))
				let hy = Math.round(svgh * 0.5)
				let d = "M10,{hy} Q{h / 2},{hy + bow * hy} {h - 3},{hy}"
				$svg.setAttribute('width',h)
				$svg.setAttribute('height',svgh)
				$p1.setAttribute('d',d)
				$p2.setAttribute('d',d)
				$base.style.width = (rel.width)px

				style.transform = "translate3d({rel.left + rel.width * fax}px,{rel.top + rel.height * fay}px,0px)"

				$line.style.transform = "rotate({rot}deg) rotateY({-yrot}deg)"
				$box.style.transform = "translate({tax * -100}%,{tay * -100}%)"
	
				# $end.style.transform = "translate({ax}%,-50%) translate3d({x}px,{y}px,{z}px)"
				$end.style.transform = "translate3d({x}px,{y}px,{z}px)"

				$line.style.width = h + 'px'

				let margin? = data.mask & FLAGS.MARGIN
				let left? = rel.left + x < 0
				let above? = rel.top + y < 0
				let below? = rel.top + y > frame.height

				# log rel.top,y,frame.height

				if data.w
					$box.style.width = data.w + 'ex'
					$box.style.whiteSpace = 'initial'

				flags.toggle('left',left?)
				flags.toggle('above',y )
				flags.toggle('below',above?)
				flags.toggle('margin',margin?)
				flags.toggle('inline',!(left? or above? or below? or margin?))

				flags.toggle('off',!active)

			catch e
				log 'error in relayout?!?'
		
		if e..type == 'pointerup'
			frame.printAnnotations!
		self

	def mount
		relayout!

	def render
		<self>
			# the ring / base item there 
			<div$base>
			<div$line>
				<svg$svg height=30>
					<path$p1 d="M 10 50 Q 50 10 90 50">
					<path$p2 d="M 10 50 Q 50 10 90 50">
				# <div$lend.box
				# 	@touch.meta.sync(rot)=relayout
				# 	> '' # data.text
			<div$end
				>
					<$box[pe:auto]>
						if window.debug
							<span @touch.round.sync(data,'ox','oy')=relayout> data.text
							<div$debug[pe:auto pos:abs mt:-1lh l:50% fs:9px/1.2 ff:sans fw:400 c:blue5 d:hflex ts:none x:-50% z:10px]>
								css span d:block ws:nowrap bg:blue4/1 @hover:blue3 px:0.5 rd:xs h:1lh
								<span @touch.round.sync(data,'ox2','oz')=relayout> data.oz
								<span @touch.round.sync(data,'ax','ay')=relayout> "a {data.ax},{data.ay}"
								<span @touch.round.sync(data,'w')=relayout> "{data.w}ex"
						else
							<span> data.text

			# add debug box showing details