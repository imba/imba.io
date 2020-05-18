tag app-menu	
	def render
		<self.(l:block fs:sm p:5 w:250px fw:500)>
			for child in data.root.children
				<h5.(p:1 2 color:gray500 fs:xs)> child.title.toUpperCase!
				<div.(pb:8)> for item in child.children

					<a
						.(p:1 2 l:block color:gray600 radius:1 color.hover:gray900)
						.(color.is-active:teal600 bg.is-active:teal200-25)
						route-to=item.href> item.title
					#  .selected=(item==data)