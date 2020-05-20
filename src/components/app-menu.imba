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
		p:5

	def render
		<self.(t:sm 500 w:250px)>
			<div.scroller.(l: abs scroll-y inset:0)> for child in data.root.children
				<h5.(p:1 2 t:xs gray500)> child.title.toUpperCase!
				<div.(pb:8)> for item in child.children
					<a
						.(p:1 2 l:block t:gray600 radius:1 t.hover:gray900)
						.(t.is-active:teal600 bg.is-active:teal200-25)
						route-to=item.href> item.title
					#  .selected=(item==data)