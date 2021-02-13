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

css app-demo rd@force:lg
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
		pos:abs w:0.5cw l:auto r:-1gw m:0
		t:50% y:-50%
		h:1dw w:1dw
		rd:lg 
		$frame bxs:xxl bd:none
	
	&.left-aligned @800 >>>
		$preview r:auto l:-1gw
		$pre pl@force:calc(1dw - 1gw)

	&.inlined >>>
		1dw:300px
		$preview pos:abs w:1dw l:auto r:30px m:0
		$pre pr@force:calc(1dw)

	&.tic-tac-toe 1dw:300

	@!800
		1cw:100%
		>>> $editor rd:0
			$code pb@force:14
		>>> $preview
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

global css .centered-snippet
	width:720px my:4 mb:30 mx:auto
	max-width:90vw
	# @1000 ml@odd:80px @even:-80px
	p fs:lg ta:center
	app-code-block mb:4
	app-code-file
		.highlights ml:0px @900:-100px
	@!740 w:90vw
	@!700
		.snippet-body@important d:block
		$preview
			pos:absolute b:20px r:20px scale:0.6 origin:100% 100%
			l:auto


tag home-page
	css 1cw:90vw @lg:980px # custom container-width unit
		1dw:420px # custom demo-width unit
		1gw:3vw @lg:5vw @xl:8vw # custom gutter-width unit
		ofx:hidden d:vflex a:center

		section,figure d:vflex ja:center as:stretch
		h1,h2,h3,nav,article w:1cw	
		h1,h2 ff:brand ws:pre-line pb:6
			fs:60px/0.9 @md:90px/0.9 @lg:127px/0.9
		h3 c:cool8
			fs:xl/1.5 @md:2xl/1.5
		article p fs:lg/1.4

		>>> app-code-block@force rd:lg

	def caroseul-item href
		<figure.item> <app-demo.demo href=`/examples/css/{href}.imba?preview=styles`>

	def render
		<self>
			# <app-demo.demo.full-width-demo.inline-preview href='/examples/clock/app.imba?preview=lg'>
			<section[pt:40 pb:20 bg:linear-gradient(blue3,blue3/0)]>
				<h1[py:5 pb].gradient> `Build Fast, Fast`
				<div[w:1cw d:block @md:hgrid mt:10]>
					<div[w:2cols max-width:590px ml:2 fs:xl/1.8 mr:4]>
						<p[c:cool8]> `Imba is a Web programming language that's fast in two ways: Imba's time-saving syntax with built-in tags and styles results in less typing and switching files so you can {<u> 'build things fast.'} Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM libraries, so you can {<u> 'build fast things.'}`
						<a> `Start Learning Imba`
					<ul>
						css d:block rd:lg bxs:xxs,lg p:6 fs:lg bg:white/70
						for usp in usps
							<li[py:1 d:hflex a:center px:2 pr:6]>
								<svg[mr:3 size:16px c:purple7] src='icons/arrow-right.svg'>
								<span> usp

			<section[py:10]>
				# <app-demo[w:1cw].demo.windowed-demo href='/examples/simple-clock?preview=lg'>
				<app-demo.demo.full-width-demo.inline-preview.clock href='/examples/simple-clock?preview=lg'>

			<figure[pt:30]>
				<h2.gradient> `Smart,\nBeautiful,\nMinimal`
				<h3[mb:16]> <div[max-width:560px]> `Imba's syntax is optimized for getting things done with less typing. It's packed with smart features.`

				<div[w:1cw]> for item in ls('/home/features').children
					<div.centered-snippet>
						# <div[ta:center my:4 fw:600 c:gray6]> item.head
						<div innerHTML=item.html>

				# <app-demo.demo.full-width-demo.inline-preview href='/examples/clock/app.imba?preview=lg'>
				<app-demo[w:1cw].demo.windowed-demo href='/examples/tic-tac-toe?preview=lg'>
				# <figcaption> "There are no hidden styles or scripts in this example. This is the whole example."

			<section[pt:30]>
				<h2[c:pink6]> `Unbelievable\nPerformance`
				<h3[mb:6]> <div[max-width:560px]> `Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM approaches.`
				<figure> <app-demo[w:1cw 1dw:300px].demo.windowed-demo.left-aligned href='/examples/performance/app.imba?preview=lg'>
				<article.text[columns:1 my:4 cg:30px]>
					<p> `Imba uses a novel way to update the dom, opening up for a new way of writing web applications. Without having to worry about the cost of re-rendering you can break away from State Management libraries.`
				
			# <section[py:20]>
			# 	<h2.gradient[ta:center]> `Styles Evolved`
			# 	<p> `Inspired by Tailwindcss, Imba features a rich syntax for styling components`
			# 	<app-carousel renderer=carousel-item> for item in ['sizing','layouts','appearance','transform','colors',	'appearance','transform','colors','appearance']
			# 		<figure[px:4]>
			# 			let preview = item == 'layouts' ? 'inline' : 'styles'
			# 			<app-demo[w:100%].card-demo href=`/examples/css/{item}.imba?preview={preview}`>
			# 			<p[mt:4]> `Some text about this card here`
			# 	# <div.carousel scrollLeft=700>
			# 	#	for item in ['transform','colors','appearance']
			# 	#		<figure.item> <app-demo.demo href=`/examples/css/{item}.imba?preview=styles`>
					
			<section[pt:30]>
				<h2.gradient> `From Prototype to Production`
				<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`

			# <figure[py:30]>
			# 	<h2.gradient> `Game Changing`
			# 	<app-demo[w:1cw].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe?preview=lg'>

			<section[py:30]>
				<h2.gradient> `Incredible Tooling`
				<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`
			
			<section[py:10]>
				<app-demo[w:1cw].demo.windowed-demo href='/examples/clock/app.imba?preview=lg'>

			# <figure[py:30]>
			# 	<app-demo[w:1cw].demo.windowed-demo.inlined href='/examples/tic-tac-toe?preview=lg'>