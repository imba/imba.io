import 'util/styles'

# TODO (from https://eugenkiss.github.io/7guis/tasks):
# * The task is to build a frame containing an undo and redo button [...]
# * [..] Closing this frame will mark the last diameter as significant for the undo/redo history. Clicking undo will undo the last significant change (i.e. circle creation or diameter adjustment). Clicking redo will reapply the last undoed change unless new changes were made by the user in the meantime.
# TODO: Right-clicking C will make a popup menu appear with one entry “Adjust diameter..”.
# TODO: The circle nearest to the mouse pointer such that the distance from its center to the pointer is less than its radius, if it exists, is filled with the color gray.


tag circle-drawer
	circles = [] # Circles drawn on the SVG as {cx, cy, r}
	selection = null # Circle selected with right click for editing
	editing = no

	def handleClick e
		return if e.phase !== 'ended' # Create on mouse up
		return if e.events[-1].button !== 0 # Only left clicks
		editing = no
		circles.push({ cx: e..event..offsetX, cy: e..event..offsetY, r: 60 })
		selection = circles[-1]

	def setSelection i
		editing = yes
		selection = circles[i]

	css d:block pos:relative

	css svg bg:gray3 w:100% h:40rem
	

	css .circle-editor 
		pos:absolute w:90% t:50% l:50% px:5 py:3 bg:white bd:gray1 
		bxs:md transform: translate(-50%,-50%)
		p fs:sm- c:gray6 mb:2
		input w:100%

	def render
		<self>
			if editing
				<div.circle-editor>
					<p> "Adjust diameter of circle at ({selection.cx}, {selection.cy})"
					<input type="range" bind=selection.r>

			<svg @touch.fit=handleClick [d:block overflow:hidden bg:blue1] @contextmenu.sel('circle')>
				for circle, i in circles
					const selected = selection..cx === circle.cx && selection..cy === circle.cy
					<circle r=circle.r cx=circle.cx cy=circle.cy
						[fill:gray5]=selected
						@contextmenu.prevent=setSelection(i)>

imba.mount <circle-drawer>