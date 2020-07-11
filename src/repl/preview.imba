import { @watch } from '../decorators'
import * as sw from '../sw/controller'

import './console'

tag app-repl-preview
	@watch prop url

	prop w = 2000
	prop scale = 1
	prop size = 'auto-auto'

	def build
		t0 = Date.now!
		$iframe = <iframe[pos:absolute width:100% height:100% min-width:200px]>
		$iframe.src = 'about:blank'

		$iframe.replify = do(win)
			$win = win # $iframe.contentWindow
			$doc = $win.document

			let {log,info} = win.console.log
			if $console
				$console.context = win
				$console.native = win.console
				win.console.log = $console.log.bind($console)
				win.console.info = $console.info.bind($console)

		$iframe.onload = do
			return unless $refreshed
			console.log 'iframe loaded after',Date.now! - t0
			try
				let element = $doc.querySelector('body :not(script)')
				flags.toggle('empty-preview',!element)

		if src
			$iframe.src = src

	def maximize
		flags.add('maximized')
		self

	def minimize
		flags.remove('maximized')

	def maximized?
		flags.contains('maximized')

	def toggle
		maximized? ? minimize! : maximize!
		reflow!
		render!

	def reflow e
		ow = $bounds.offsetWidth
		oh = $bounds.offsetHeight
		# console.log 'reflow',ow,oh,iw,ih
		recalc!
		self

	def recalc
		let [w,h] = size.split('-')

		if w == 'auto' and h == 'auto'
			scale = sx = sy = 1
			iw = ih = '100%'
			return

		ow ||= ($bounds && $bounds.offsetWidth)
		oh ||= ($bounds && $bounds.offsetHeight)

		let gap = 0
		if ow < 240
			gap = 0
			w = 240
			h = 300

		flags.toggle('pip',ow < 240)

		if w == 'auto'
			scale = sx = sy = 1
			iw = ih = '100%'
		else
			w = parseInt(w)
			sx = scale = Math.min(1,(ow - gap) / w)
			iw = Math.floor(w)

		if h == 'auto'
			ih = Math.floor((oh - gap) / scale)
		else
			h = parseInt(h)
			sy = Math.min(1,(oh - gap) / h)
			ih = ((sy < sx) ? Math.floor(h * (sy/sx)) : h)
		self

	def resize e,dir
		$resizing = e
		
		if e.type == 'pointerup'
			flags.remove('resizing')
			$resizing = null
			if e.elapsed < 100
				return size = 'auto-auto'

		let t = e.data ||= {}

		unless t.sx
			flags.add('resizing')
			t.pip = !maximized?
			t.sx = sx
			t.sy = sy
			[t.rw,t.rh] = size.split('-')
			t.iw = $frame.offsetWidth
			t.ih = $frame.offsetHeight
			t.bw = $bounds.offsetWidth
			t.bh = $bounds.offsetHeight
			t.vw = window.innerWidth
			t.vh = window.innerHeight
			t.bounds = $bounds.getBoundingClientRect!

		let b = t.bounds
		let w = t.iw
		let h = t.ih

		let halfw = (b.width / 2)
		let halfh = (b.height / 2)

		let relx = (e.x - (b.left + halfw))
		let rely = (e.y - (b.top + halfh))
		let absx = Math.abs(relx)
		let absy = Math.abs(rely)

		let restw = 1440 - b.width
		let resth = 2000 - b.height

		if dir != 'y'
			t.rw = null
			if absx > halfw
				let gap = relx > 0 ? (t.vw - b.right) : b.left
				w = b.width + Math.min((absx - halfw) / gap,1) * restw
			else
				w = Math.max(absx * 2,260)

		if dir != 'x' and !t.pip
			t.rh = null
			if absy > halfh
				let gap = rely > 0 ? (t.vh - b.bottom) : b.top
				h = b.height + Math.min((absy - halfh) / gap,1) * resth
			else
				h = Math.max(absy * 2,260)

		size = "{t.rw == 'auto' ? t.rw : Math.round(w)}-{t.rh == 'auto' ? t.rh : Math.round(h)}"

	css d:flex fld:column pos:relative min-width:40px

	css $body pos:relative
	css $bounds pos:absolute w:100% h:100% r:0 b:0 min-width:120px
	css $frame
		pos:absolute top:0 l:50% bg:white w:100% h:100% x:-50% y:0
		border:1px solid gray3
		transform-origin:50% 0%

	css $cover pos:absolute inset:0 cursor:zoom-in d:none

	css $controls pos:absolute b:100% r:0 py:1 w:100% d:flex jc:center opacity:0
	css self@hover $controls opacity:1

	css .btn p:1 fw:500 c:gray4 @hover:gray5 .checked:blue5 outline@focus:none pe.checked:none

	css @is-pip @not(.maximized)
		bg:clear
		$bounds max-height:200px
		$frame l:auto t:auto r:20px x:0 b:20px transform-origin:100% 100% y:0
		$cover d:block bg@hover:blue5/20
		$controls d:none

	css &.maximized
		$body pos:fixed zi:350 w:100vw h:100vh t:0 l:0 bg:gray2/85
		$bounds w:auto h:auto inset:14 b:20
		$controls pos:absolute t:auto b:0

	css .resizer
		pos:absolute
		fs:14px
		w:1em .y:100%
		h:1em .x:100%
		b:-1em .x:0
		r:-1em .y:0
		cursor: nwse-resize .x:ew-resize .y:ns-resize
		bg:clear @hover:gray5/10
	
	css $console
		pos:relative

	def entered e
		console.log 'entered',Date.now! - t0
		$entered = yes
		refresh! unless $refreshed

	def intersecting e
		console.log 'intersect',e
		$intersect = e
	
	def addIs e
		console.log 'intersect',e.ratio,e.isIntersecting
		$intersects ||= []
		$intersects.push(e)
	
	def unmount
		$entered = $refreshed = no

	def render
		recalc!
		<self @intersect.silence.in=entered>
			<div$body[flex:1] @click=toggle>
				<div$bounds @resize=reflow>
					<div$frame.frame[scale:{scale} w:{iw}px h:{ih}px] @click.stop>
						$iframe
						<div.resizer.x @touch=resize(e,'x')>
						<div.resizer.y @touch=resize(e,'y')>
						<div.resizer @touch=resize>
						<div.resizer @touch=resize>
						<div$cover @click=toggle>
						<div[pos:absolute transform-origin:100% 100% b:0 r:0 p:2 fs:sm/1 c:gray5 d:none ..resizing:block scale:{1 / scale}]> "{iw - 2} x {ih - 2}"
				<div$controls @click.stop>
					<button.btn bind=size value='auto-auto'> 'auto'
					<button.btn bind=size value='482-auto'> 'xs'
					<button.btn bind=size value='642-auto'> 'sm'
					<button.btn bind=size value='770-auto'> 'md'
					<button.btn bind=size value='1026-auto'> 'lg'
					<button.btn bind=size value='1282-auto'> 'xl'
					# <button%btn bind=size value='768x1024'> 'tablet'
					# <button%btn bind=size value='1280x1024'> 'desktop'
					<button.btn @click=maximize> '⤢'
			<repl-console$console.transient mode='transient'>
		
	set file data
		return unless data
		# console.log
		let t = Date.now! 
		
		sw.request(event: 'file', path: data.path, body: data.body).then do
			console.log 'sent file to service worker',Date.now! - t0
			url = data.path.replace('.imba','.html')

	set dir data
		if $dir = data
			let file = $dir.files[0]
			# console.log 'start with file',file,$dir.replUrl
			url = $dir.replUrl
		self

	def urlDidSet url, prev
		refresh! if $entered

	def refresh
		return unless url
		$refreshed = yes
		let src = `/repl{url}`
		try
			t0 = Date.now!
			$iframe.contentWindow.location.replace(src)
		catch e
			sw.load!.then do $iframe.src = src