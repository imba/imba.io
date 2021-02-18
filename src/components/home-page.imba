const usps = [
	`Compiles to Javascript`
	`Works with Javascript`
	`Smart, Minimal Syntax`
	`Built-in Tags & Styles`
	`Amazing Performance`
]



import {ls,fs,File,Dir} from '../store'

import './app-carousel'

css app-code-block
	>>> divs o:1

css .gradient
	bg: linear-gradient(to right,indigo7,blue6,pink6)
	-webkit-background-clip:text
	-webkit-text-fill-color:transparent

css app-code-block rd@force:lg
	>>> main
		$tabbar bg:clear px:2 pt:2 d.collapsed:none

css .windowed-demo w:1cw
	1dw:100% @660:40vw @940:420px

	>>> $editor rd:lg
		$code h@force:calc($mainLines * 1lh) p@force:2lh
		&.tabbed
			$tabbar px:2 bg:clear pt:2
			$code pt@force:0.5lh

	>>> $preview
		pos:abs l:auto r:0 m:0
		h:1dw w:1dw
		t:calc(50% - 0.5dw)
		max-width:420px
		max-height:420px
		rd:xl
		$frame bxs:xxl bd:none
	
	&.left-aligned @800 >>>
		$preview r:auto l:-1gw
		$pre pl@force:calc(1dw - 1gw)

	&.inlined >>>
		1dw:300px
		$preview pos:abs w:1dw l:auto r:30px m:0
		$pre pr@force:calc(1dw)

	>>> .preview-md
		1dw:100% @660:40vw @940:320px
		@800 $editor w:640px mx:auto
		@1000 $editor w:700px
		@1200 $editor w:780px
		@1380 $editor w:840px mx:0

	@!800
		1cw:100%
		>>> $editor rd:0
			$code pb@force:14
		>>> .preview-md
			$preview
				pos:rel r:auto l:auto t:0 y:0% mt:-10 mx:auto
				# if we are in landscape we should be much smaller
				w:calc(100vw - 40px) h:calc(100vw - 40px)
				$frame bxs:xl

css .full-width-demo w:100%
	>>> $tabbar j:center py:4
	>>> $editor rd:0px
		$code @force
			pb:6 pt:0
			@700 pb:12 pt:4
			@940 pb:20 pt:10
			
		$pre @force w:1cw d:block mx:auto

	>>> $preview
		pos:abs w:0.5cw l:auto r:10% m:0
		t:50% y:-50%
		h:1dw w:1dw
	
	&.clock
		1dw:100% @660:40vw @940:420px
		>>> $preview
			r:0px @660:4vw @940:10%
			@!660 pos:rel y:0 t:0


css .card-demo w:100% rd:xl
	>>> main d:hflex bg:$bg p:0
		# $code p@force:3
	>>> $editor
		fl:1
	>>> $preview @force
		pos:abs w:0.5cw l:auto r:0 m:0 h:100% w:260px
		$frame bd:none rd:0px bdl:1px dashed white/30 bg:black/15
	

css figure.card
	p:4 w:800px fl:0
	.demo rd:xl
	.demo >>> $editor
		p@force:3

global css home-section app-code-block
	rd@force:lg
	main
		$tabbar bg:clear px:2 pt:2 d.collapsed:none
	$preview z:10px
		$address d@force:none

global css .centered-snippetz
	width:780px my:4 mb:30 mx:auto
	max-width:calc(100vw - 100px)
	p fs:lg ta:center
	app-code-block mb:4

tag home-section
	def intersecting e
		# log 'intersecting',e.isIntersecting,e.ratio
		if #visible =? e.isIntersecting
			relayout!

	def resizing
		#top = offsetTop
		#height = offsetHeight
		#middle = #top + #height * 0.5
		#rect = getBoundingClientRect!

	def relayout
		return unless #visible
		let page = parentNode
		let scrollY = page.#cache.scrollY
		let vh = window.innerHeight
		# distance from top of screen
		let top = #top - scrollY
		#smy = #middle - scrollY - vh * 0.5
		for el in querySelectorAll('.perspective')
			let r = el.pageRect # getBoundingClientRect!
			let y = (r.top + r.height * 0.5) - scrollY
			let x = (r.left + r.width * 0.5) - scrollY
			let poy = y - vh * 0.5
			el.#poy = -poy
			let ptrx = page.#ptrx
			let ptry = page.#ptry
			el.style.perspectiveOrigin = "{ptrx}% calc({-poy}px + {ptry}% * 0.8)"
		yes

	<self.p3d @intersect.silent=intersecting @resize.silent=resizing>
		# css $smy:{#smy}
		# css .mark pos:abs size:4 bg:yellow4 l:10px
		# <div$totop.mark> #smy
		<slot>

tag rotating-shapes
	prop size = 300
	def setup
		<self.p3d>
			css d:block pos:abs z:-10px w:100vw h:300px
				tween:styles 1s ease-in-out
				@hover transform:rotateY(160deg)
			css div bg:yellow2 w:620px h:300px m:2 pos:abs origin:50% 50% 0px t:50% l:50%
				backface-visibility:hidden
				-webkit-backface-visibility:hidden
			for item,i in [1,2,3,4,5,6,7,8,9]
				<div css:transform="translate(-50%,-50%) rotateY({i / -9}turn) translateZ(-900px)">


import {aliases} from 'imba/src/compiler/styler'

tag styles-bg
	def setup
		<self> for own k,v of aliases
			<div> k

tag bench-graph
	def setup
		results = [
			name: 'Vue'
			score: 7915
			-
			name: 'React'
			score: 8811
			-
			name: 'Imba'
			score: 237462
		]

		def entered
			flags.add('entered')

		<self.p3d @intersect.in.once=entered>
			css z:-2px $pxpi:0.0022px # pixels per iteration / score
			css .bar bg:gray2
			css &.entered
				.bar bg:gray4
				.Imba .bar bg:blue6
			<.p3d.items[d:hflex c:gray5]> for item in results
				<.p3d.item[fl:1 $score:{item.score} w:100px] .{item.name}>
					css pos:rel d:vflex ja:center
					css &.Imba c:blue6
					<.name> item.name
					<.bar.p3d>
						css pos:abs b:30px h:calc($score * $pxpi) w:6px rd:md x:0 z:1
						<.score[ff:notes  l:50% t:-30px pos:abs x:-50%]> item.score

const examples = {
	paint: '/examples/paint/app.imba?preview=md&dir=1'
	game: '/examples/tic-tac-toe?preview=md&titlebar=1'
	server: '/examples/express/app.imba?dir=1&preview=md&titlebar=1'
}

tag home-page
	#cache = {scrollY: 0}

	css 1cw:90vw @lg:940px @1100:980px # custom container-width unit
		1dw:420px # custom demo-width unit
		1gw:3vw @lg:5vw @xl:8vw # custom gutter-width unit
		1yp:1px @md:3px @lg:4px
		d:vflex a:center
		transform-style:preserve-3d
		perspective:1000px
		perspective-origin:50% 200px
		$smx:50%

		home-section pos:relative
		home-section,figure d:vflex ja:center as:stretch
		h1,h2,h3,nav,article w:1cw	
		h1,h2 ff:brand ws:pre-line pb:6
			fs:34px/0.9 @xs:50px/0.9 @sm:60px/0.9 @md:90px/0.9 @lg:116px/0.9 @1100:122px/0.9
		h2.small
			fs:34px/0.9 @xs:40px/0.9 @sm:50px/0.9 @md:80px/0.9 @lg:90px/0.9
		h3 c:cool8
			fs:xl/1.5 @md:2xl/1.5
		article p fs:lg/1.4

		>>> app-code-block@force rd:lg

	def caroseul-item href
		<figure.item> <app-code-block.demo href=`/examples/css/{href}.imba?preview=styles`>

	def mount
		#onscroll ||= scrolled.bind(self)
		#onpoint ||= pointing.bind(self)
		window.addEventListener('scroll',#onscroll,{passive: yes})
		window.addEventListener('mousemove',#onpoint,{passive: yes})
		scrolled!

	def unmount
		window.removeEventListener('scroll',#onscroll,{passive: yes})
		window.removeEventListener('mousemove',#onpoint,{passive: yes})

	def pointing e
		let x = Math.round(e.x * 100 / window.innerWidth)
		let y = Math.round(e.y * 100 / window.innerHeight)
		# on animation frame?!
		# log 'pointing!',e.x,x
		let dirty = no
		if #ptrx =? x
			dirty = yes
			# style.setProperty('--ptrx',x + '%')
		if #ptry =? y
			dirty = yes
			# style.setProperty('--ptry',y + '%')

		if dirty
			relayout!

	def relayout
		for el in querySelectorAll('home-section')
			el.relayout!
		self

	def scrolled e
		# log 'scrolled',window.scrollY
		# could alternate / spread them out
		
		let sy = #cache.scrollY = window.scrollY
		let poy = Math.round(sy + window.innerHeight * 0.5)
		# relayout!
		# style.perspective = "800px"
		style.perspectiveOrigin = "50% {poy}px"
		return
		# $origo.style.top = (poy)px
		#	el.relayout!
		self

	def resizing e
		if #cache.width =? window.innerWidth
			for el in querySelectorAll('app-popover')
				el.relayout!
		return

	def render
		<self @resize.silent.debounce(100ms)=resizing>
			# <rotating-shapes>
			<home-section[pt:40yp pb:10yp bg:linear-gradient(blue3/10,blue3/0)]>
				<h1[py:5].gradient> `Build Fast, Fast.`
				<div[w:1cw d:block @870:hgrid mt:10]>
					<div[w:2cols max-width:590px ml:2 fs:xl/1.8 mr:4]>
						<p[c:cool8]> `Imba is a Web programming language that's fast in two ways: Imba's time-saving syntax with built-in tags and styles results in less typing and switching files so you can {<u> 'build things fast.'} Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM libraries, so you can {<u> 'build fast things.'}`
						<div[d:block @480:hflex fs:md @580:lg  mx:-2 my:4]>
							css a rd:xl m:2 p:2 bg:green3 bd:green3-5 bcb:green5 px:4 c:green8 fw:bold d:block ta:center
								@hover bg:green3-3
							<a href="/language/getting-started"> "Get started"
							css div rd:xl bd:gray2 bg:gray1 m:2 p:2 pr:4 c:gray6 ff:mono bs:solid fw:bold
								fs:sm @580:17px ls:-0.3px d:hflex ja:center
								@before content: '>' c:gray3  px:1
							<div> "npx imba create hello-world"
					<ul>
						css d:block rd:lg p:6 fs:lg bxs:xxs,lg bg:white/70 h:auto as:start
							@!1024 p:4 fs:md
							@!870 d:none
						for usp in usps
							<li[py:1 d:hflex a:center px:2 pr:6]>
								<svg[mr:3 size:16px c:purple7] src='icons/arrow-right.svg'>
								<span> usp
			
			<home-section[py:10]>
				
				<.bg[pos:abs inset:0 z:-40px t:30% b:-40px scale-x:1.3 rotate:2deg bg:cool2]>
				<div.windowed-demo> <app-code-block[w:1cw].demo href=examples.paint>

				# <app-demo[w:1cw mt:10].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe?preview=lg'>
				# <app-demo.demo.full-width-demo.inline-preview.clock href='/examples/simple-clock?preview=lg'>

			<home-section[pt:30]>
				
				<h2.gradient[ws:pre]> `Smart,\nBeautiful,\nMinimal`
				<h3[mb:16]> <div[max-width:560px]> `Imba's syntax is optimized for getting things done with less typing. It's packed with smart features.`
				<div.p3d.windowed-demo[mb:16]> <app-code-block[w:1cw].demo href=examples.server>
				<h3[mb:16]> <div[max-width:560px]> `Imba works just as well on the server as on the client. In fact, the whole stack of scrimba.com is written in Imba. `
				# <div.p3d.windowed-demo[mb:16]> <app-code-block[w:1cw].demo href=examples.server>
				# if true
				#	<div.p3d.windowed-demo> for item in ls('/home/features').children
				#		<div[w:1cw mb:18].p3d innerHTML=item.html>
				# <app-demo[w:1cw].demo.windowed-demo href='/examples/tic-tac-toe?preview=lg'>
			
			<home-section[pt:30 d:none]>	
				# <h2.gradient[ws:pre].small> `One Language,\nZero Configuration`
				<h2.gradient[ws:pre]> `Full-stack`
				<h3[mb:16]> <div[max-width:560px]> `Imba works just as well on the server as on the client. In fact, the whole stack of scrimba.com is written in Imba. `

			<home-section[pt:30]>
				<h2[c:pink6]> `Unbelievable\nPerformance`
				<h3[mb:6]> <div[max-width:560px]> `Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM approaches.`
				# <figure> <app-demo[w:1cw 1dw:300px].demo.windowed-demo.left-aligned href='/examples/performance/app.imba?preview=lg'>
				<.box.p3d[pos:rel]>
					css w:1cw fs:lg d:hflex p:8 px:10
					<div[pos:abs inset:0 bg:warmer2 rd:lg z:-4px]>
					<div.body[w: <460px]> `A benchmark was conducted by comparing a Todo MVC implementation across frameworks. The benchmark steps through a deterministic sequence of state alterations measuring the time taken to reconcile the whole application view after: Toggling an item, removing an item, inserting an item, renaming an item, and doing nothing.`
					<bench-graph[ml:auto as:flex-end z:-3px]>

			<home-section[pt:30]>
				<h2.gradient> `From Prototype to Production`
				<h3[mb:16]> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is powered by Imba both frontend & backend.`
				<div.p3d.windowed-demo[mb:16]> <app-code-block[w:1cw].demo href=examples.game>
				# <.windowed-demo[my:8]> <app-code-block[w:1cw].demo href='/examples/simple-clock?preview=md'>
				# <article.text[columns:1 my:4 cg:30px]>
				#	<p> `Imba uses a novel way to update the dom, opening up for a new way of writing web applications. Without having to worry about the cost of re-rendering you can break away from State Management libraries.`
			
			if false
				<home-section[py:20]>
					<h2.gradient[ta:center]> `Styles Evolved`
					<p> `Inspired by Tailwindcss, Imba features a rich syntax for styling components`
					<app-carousel renderer=carousel-item> for item in ['sizing','layouts','appearance','transform','colors',	'appearance','transform','colors','appearance']
						<figure[px:4]>
							let preview = item == 'layouts' ? 'inline' : 'styles'
							<app-code-block[w:100%].card-demo href=`/examples/css/{item}.imba?preview={preview}`>
							<p[mt:4]> `Some text about this card here`

			# <home-section[py:10]>
			# 	<app-demo[w:1cw].demo.windowed-demo href='/examples/clock/app.imba?preview=lg'>
			# 	# <app-demo.demo.full-width-demo.inline-preview.clock href='/examples/simple-clock?preview=lg'>
			if false
				<home-section[pt:30]>
					<h2.gradient> `From Prototype to Production`
					<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`
					<div.windowed-demo[my:8]> <app-code-block[w:1cw].demo href='/examples/express/server.imba'>

			# <figure[py:30]>
			# 	<h2.gradient> `Game Changing`
			# 	<app-demo[w:1cw].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe?preview=lg'>

			<home-section[py:30]>
				<h2.gradient> `Incredible Tooling`
				<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`