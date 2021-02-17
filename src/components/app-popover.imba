import {relativeRect,rectAnchor} from './app-arrow'

const FLAGS = {
	OUTSIDE: 1

}

tag app-popover

	css self
		d:block c:green4 t:0 l:0 pos:abs w:0 h:0
		transform-style: preserve-3d
		transform-origin: 0% 0%
		div transform-style: preserve-3d pos:abs t:0 l:0
		$line h:0px w:100px pos:abs t:0 l:0
			transform-origin:0% 50%
			$lend pos:abs l:100% transform-origin:50% 50%
				
		$end pos:abs t:0 l:0
		svg pos:abs t:0 l:0px transform:translate(0%,-50%)
		path fill:none stroke:green4 stroke-width:1px
			stroke-linecap:round
			stroke-dasharray:3px 4px

		.box rd:lg pos:abs
			t:0 l:0 p:2 d:flex ja:center
			transform: translate3d(-50%,-50%,0px)
			ff:notes fw:400 fs:sm/0.9 ta:center ws:nowrap
			ts:0px 0px 4px black
			# bg:cooler7/60
			# bg:green4/20 

		&.outside
			.box ts:none
			c:green6
	
	def setup
		target = frame.querySelector(data.sel)
		rot = {x: 0, y: 0}
		bow = (Math.random! * 0.8 + 0.2)
		flags.toggle('outside',data.mask & FLAGS.OUTSIDE)
		# rot = Math.random! * 360

	def serialize
		"# ~{data.pattern}|{data.mask},{data.ox.toFixed(1)},{data.oy.toFixed(1)},{data.oz.toFixed(1)}~ {data.text}"


	def relayout e
		# log 'relayout',target,e..type
		if target and data.oy != undefined
			try
				let frame = offsetParent.getBoundingClientRect!
				let rel = relativeRect(frame,target.getBoundingClientRect!)
				let x = data.ox
				let y = data.oy
				let z = data.oz
				let xylen = Math.sqrt(x * x + y * y)
				let h = Math.ceil(Math.sqrt(xylen * xylen + z * z))

				let rot = Math.atan2(y,x) * 180 / Math.PI
				let yrot = Math.asin(z / h) * 180 / Math.PI
				let bow = bow

				if y < 0 or x < 0
					bow = -bow
				let svgh = Math.round(Math.max(30,h * 0.25))
				let hy = Math.round(svgh * 0.5)
				let d = "M10,{hy} Q{h / 2},{hy + bow * hy} {h - 3},{hy}"
				$svg.setAttribute('width',h)
				$svg.setAttribute('height',svgh)
				$path.setAttribute('d',d)
				
				style.transform = "translate3d({rel.x}px,{rel.y}px,0px)"

				$line.style.transform = "rotate({rot}deg) rotateY({-yrot}deg)"
				# $lend.style.transform = "translate(0%,-50%) rotate({-rot}deg) rotateY({angle}deg)"
				let ax = x > 0 ? 0 : -100
				$end.style.transform = "translate({ax}%,-50%) translate3d({x}px,{y}px,{z}px)"
				$line.style.width = h + 'px'
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
				<svg$svg height=30> <path$path d="M 10 50 Q 50 10 90 50">
				# <div$lend.box
				# 	@touch.meta.sync(rot)=relayout
				# 	> '' # data.text
			<div$end.box
				@touch.sync(data,'ox','oy')=relayout
				> data.text