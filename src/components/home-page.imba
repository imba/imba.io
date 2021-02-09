const usps = [
	`Compiles to Javascript`
	`Works with Javascript`
	`Smart, Minimal Syntax`
	`Built-in Tags & Styles`
	`Amazing Performance`
]

tag home-page
	css 1cw:auto @lg:980px # custom container-width unit
		section d:vflex ja:center as:stretch
		h1,h2,h3,nav w:1cw	
		h1,h2 ff:brand fs:127px lh:110px ws:pre-line
		h3 fs:2xl/1.5 c:cool8

	css .gradient
		bg: linear-gradient(to right,indigo7, pink7)
		-webkit-background-clip:text
		-webkit-text-fill-color:transparent

	css .windowed-demo w:1cw
		>>> $editor rd:lg l:-8
			$code h@force:auto
			$pre p@force:8
		>>> $preview
			pos:abs w:0.5cw l:auto r:-10% m:0
			t:50% y:-50%
			h:420px w:420px
			rd:lg 
			$frame bxs:xxl bd:none

	css .full-width-demo w:100%
		>>> $editor rd:0px
			$code @force h:auto
			$pre @force w:1cw d:block mx:auto py:16
		>>> $preview
			pos:abs w:0.5cw l:auto r:10% m:0
			t:50% y:-50%
			h:420px w:420px

	def render
		<self[d:vflex a:center]>
			<section[pt:40 pb:20 bg:linear-gradient(blue3,cool7/0)]>
				<h1[py:5 pb].gradient> `Build Fast, Fast`
				<div[w:1cw d:hgrid mt:10]>
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

			<section[pt:30]>
				<h2.gradient> `Smart,\nBeautiful,\nMinimal`
				<h3[fs:2xl/1.5 mb:16]> <div[max-width:560px]> `Imba's syntax is optimized for getting things done with less typing. It's packed with smart features.`
				<app-demo.demo.full-width-demo.inline-preview href='/examples/clock/app.imba?preview=lg'>

			<section[pt:30]>
				<h2.gradient> `Unbelievable\nPerformance`
				<h3> <div[max-width:560px]> `Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM approaches.`

			<section[py:30]>
				<app-demo[w:1cw].demo.windowed-demo href='/examples/clock/app.imba?preview=lg'>