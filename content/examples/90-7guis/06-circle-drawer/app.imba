import 'util/styles'
import { State } from './state.imba'
		
# From https://eugenkiss.github.io/7guis/tasks
# TODO: The circle nearest to the mouse pointer such that the distance from its center to the pointer is less than its radius, if it exists, is filled with the color gray.

global css html,body w:100% h:100% m:0 p:0

tag circle-drawer
	state = new State!

	css
		.circle-editor 
			pos:absolute inset:10px px:5 py:3 bg:white bd:gray1 top:auto bxs:md
		
		.undo-redo
			d:flex
			jc:center
			gap:8px
			pb:8px
		
		.undo-redo button
			p:4px 16px
			rd:4px
			border:1px solid gray2
			bg:gray1 @hover:gray0

	<self[h:85vh w:100%]>
		<.undo-redo>
			<button @click=state.undoAction> "Undo"
			<button @click=state.redoAction> "Redo"

		if state.editing
			<div.circle-editor>
				<p[fs:sm- c:gray6 mb:2]>
					"Adjust diameter of circle at ({state.selection.cx}, {state.selection.cy})"
				<input[w:100%] type="range" bind=state.selection.r @change.debounce=state.handleScale>
				<global @click.capture.outside.stop=(state.editing=no)>

		<svg[inset:0 size:100% bg:gray2] @click=state.handleClick>
			for circle, i in state.circles
				# <circle[fill:gray3 stroke:gray5] r=circle.r cx=circle.cx cy=circle.cy
				<circle[fill:gray3 stroke:gray5] [fill:gray5]=(circle==state.selection)
					r=circle.r cx=circle.cx cy=circle.cy
					@click.stop=state.setSelection(i)
					@contextmenu.prevent=state.setSelection(i, yes)>

imba.mount <circle-drawer>