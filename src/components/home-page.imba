const usps = [
	`Compiles to Javascript`
	`Works with Javascript`
	`Smart, Minimal Syntax`
	`Built-in Tags & Styles`
	`Amazing Performance`
]

tag home-page
	css 1cw:90vw @lg:980px # custom container-width unit
		1dw:420px # custom demo-width unit
		1gw:3vw @lg:5vw @xl:8vw # custom gutter-width unit
		section,figure d:vflex ja:center as:stretch
		h1,h2,h3,nav,article w:1cw	
		h1,h2 ff:brand ws:pre-line pb:6
			fs:60px/0.9 @md:90px/0.9 @lg:127px/0.9
		h3 c:cool8
			fs:xl/1.5 @md:2xl/1.5
		article p fs:lg/1.4

	css .gradient
		bg: linear-gradient(to right,indigo7,blue6,pink6)
		-webkit-background-clip:text
		-webkit-text-fill-color:transparent

	css .windowed-demo w:1cw
		>>> $editor rd:lg
			$code h@force:auto
			$pre p@force:8
		>>> $preview
			pos:abs w:0.5cw l:auto r:-1gw m:0
			t:50% y:-50%
			h:1dw w:1dw
			rd:lg 
			$frame bxs:xxl bd:none
		
		&.left-aligned >>>
			$preview r:auto l:-1gw
			$pre pl@force:calc(1dw - 1gw)

	css .full-width-demo w:100%
		>>> $editor rd:0px
			$code @force h:auto
			$pre @force w:1cw d:block mx:auto py:16
		>>> $preview
			pos:abs w:0.5cw l:auto r:10% m:0
			t:50% y:-50%
			h:1dw w:1dw

	def render
		<self[d:vflex a:center]>
			<section[pt:40 pb:20 bg:linear-gradient(blue3,cool7/0)]>
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
				<app-demo[w:1cw].demo.windowed-demo href='/examples/clock/app.imba?preview=lg'>

			<figure[pt:30]>
				<h2.gradient> `Smart,\nBeautiful,\nMinimal`
				<h3[mb:16]> <div[max-width:560px]> `Imba's syntax is optimized for getting things done with less typing. It's packed with smart features.`
				<app-demo.demo.full-width-demo.inline-preview href='/examples/clock/app.imba?preview=lg'>
				# <figcaption> "There are no hidden styles or scripts in this example. This is the whole example."

			<section[pt:30]>
				<h2[c:pink6]> `Unbelievable\nPerformance`
				<h3[mb:6]> <div[max-width:560px]> `Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM approaches.`
				<figure> <app-demo[w:1cw].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe/app.imba?preview=lg'>
				<article.text[columns:1 my:4 cg:30px]>
					<p> `Imba uses a novel way to update the dom, opening up for a new way of writing web applications. Without having to worry about the cost of re-rendering you can break away from State Management libraries.`
				

			<section[pt:30]>
				<h2.gradient> `From Prototype to Production`
				<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`

			<figure[py:30]>
				<h2.gradient> `Game Changing`
				<app-demo[w:1cw].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe/app.imba?preview=lg'>

			<section[py:30]>
				<h2.gradient> `Incredible Tooling`
				<h3> <div[max-width:560px]> `Imba scales all the way from quick prototypes to complex applications. Scrimba.com is fully powered by Imba, both frontend & backend.`

			<figure>
				<h2.gradient> `Code in Style`
				<app-demo[w:1cw].demo.windowed-demo.left-aligned href='/examples/tic-tac-toe/app.imba?preview=lg'>