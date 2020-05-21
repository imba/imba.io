tag app-menu

	css &:after
		content: ' '
		bg: linear-gradient(white-0,white-100)
		l: block abs
		width: 90%
		height: 80px
		bottom: 0

	css .scroller
		-webkit-overflow-scrolling: touch
		l: abs scroll-y inset:0 p:5

	css .handle
		l:abs flex center size:12 left:100% top:18 ml:-14 x:100vw
		radius:2 bg:white shadow:sm opacity:0.9 color:teal500
		t:lg l.md: hidden border:gray200

	def render
		<self tabIndex=-1>
			<div.handle> "☰"
			<div.scroller>
				<app-logo.(l:rel block h:14 mb:4 t:teal500) route-to='/'>

				for child in data.root.children
					<h5.(p:1 2 t:xs gray500)> child.title.toUpperCase!
					<div.(pb:8)> for item in child.children
						<a
							.(p:1 2 l:block t:gray600 radius:1 t.hover:gray900)
							.(t.is-active:teal600 bg.is-active:teal200-25)
							route-to=item.href> item.title
						#  .selected=(item==data)