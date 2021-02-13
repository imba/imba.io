import 'util/styles'
# https://github.com/eugenkiss/7guis/wiki#circle
# TODO: Undo/Redo

tag circle-drawer
	
	circles = []	
	selection = null
	context = false

	def handleClick e
		return context = false if context
		circles = circles.concat({ cx: e.offsetX, cy: e.offsetY, r: 20 })
		selection = circles[circles.length - 1]
	
	def setSelection i, showContext = false
		context = showContext
		selection = circles[i]
	
	css d:block pos:relative

	css svg bg:gray3 w:100% h:40rem
	
	css .context-menu 
		pos:absolute w:90% t:50% l:50% px:5 py:3 bg:white bd:gray1 
		bxs:md transform: translate(-50%,-50%)
		p fs:sm- c:gray6 mb:2
		input w:100%
		
	def render
		<self>

			if context
				<div.context-menu>
					<p> "Adjust diameter of circle at ({selection.cx}, {selection.cy})"
					<input type="range" bind=selection.r>
			
			<svg @click=handleClick>
				for circle, i in circles
					const selected = selection..cx === circle.cx && selection..cy === circle.cy
					<circle r=circle.r 
						[cx:{circle.cx} cy:{circle.cy} fill:white]
						[fill:gray5]=selected
						@click.stop=setSelection(i)
						@contextmenu.prevent=setSelection(i, true)>

imba.mount <circle-drawer>