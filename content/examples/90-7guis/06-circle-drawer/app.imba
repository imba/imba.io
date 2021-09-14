import 'util/styles'

# TODO (from https://eugenkiss.github.io/7guis/tasks):
# * The task is to build a frame containing an undo and redo button [...]
# * [..] Closing this frame will mark the last diameter as significant for the undo/redo history. Clicking undo will undo the last significant change (i.e. circle creation or diameter adjustment). Clicking redo will reapply the last undoed change unless new changes were made by the user in the meantime.
# TODO: Right-clicking C will make a popup menu appear with one entry “Adjust diameter..”.
# TODO: The circle nearest to the mouse pointer such that the distance from its center to the pointer is less than its radius, if it exists, is filled with the color gray.


global css html,body w:100% h:100% m:0 p:0

tag circle-drawer
	circles = [] # Circles drawn on the SVG as {cx, cy, r}
	selection = null # Circle selected with right click for editing
	editing = no

	def add cx = 0, cy = 0, r = 20
		circles.push(selection = { cx: cx, cy: cy, r: r })

	def edit circle
		selection = circle
		editing = yes

	def select circle
		selection = circle

	css .circle-editor 
		pos:absolute inset:10px px:5 py:3 bg:white bd:gray1 top:auto bxs:md

	<self[d:contents]>
		if editing
			<div.circle-editor>
				<p[fs:sm- c:gray6 mb:2]>
					"Adjust diameter of circle at ({selection.cx}, {selection.cy})"
				<input[w:100%] type="range" bind=selection.r>
				<global @click.capture.outside.stop=(editing=no)>

		<svg[inset:0 size:100% bg:gray2] @click=add(e.offsetX,e.offsetY)>
			for circle, i in circles
				<circle[fill:gray3 stroke:gray5] r=circle.r cx=circle.cx cy=circle.cy
					[fill:gray5]=(circle==selection)
					@click.stop=select(circle)
					@contextmenu.prevent=edit(circle)>

imba.mount <circle-drawer>