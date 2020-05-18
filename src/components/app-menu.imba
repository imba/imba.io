tag app-menu

	css &:after
		content: ' '
		bg: linear-gradient(transparent,white)
		l: block abs
		width: 90%
		height: 80px
		bottom: 0

	css .scroller
		-webkit-overflow-scrolling: touch
		p:5

	def render
		<self.(fs:sm w:250px fw:500)>
			<div.scroller.(l: abs scroll-y inset:0)> for child in data.root.children
				<h5.(p:1 2 color:gray500 fs:xs)> child.title.toUpperCase!
				<div.(pb:8)> for item in child.children
					<a
						.(p:1 2 l:block color:gray600 radius:1 color.hover:gray900)
						.(color.is-active:teal600 bg.is-active:teal200-25)
						route-to=item.href> item.title
					#  .selected=(item==data)