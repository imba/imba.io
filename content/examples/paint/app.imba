import './canvas'
import './pickers'

global css body m:0 p:0 of:hidden rd:lg bg:yellow1

const strokes = [1,2,3,5,8,12]
const colors = ['#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899']
const state = {stroke: 5, color: '#3B82F6'}

tag App
	<self>
		<div[ta:center p:6 o:0.1]> 'draw here'
		<app-canvas[pos:abs inset:0] state=state>
		<div.tools[pos:abs b:0 w:100% d:hgrid ja:center]>
			<stroke-picker[mx:2] data=strokes bind:value=state.stroke>
			<color-picker[mx:2] data=colors bind:value=state.color>

imba.mount <App[pos:abs inset:0]>
# ~rd:lg|0,8,-23,50,23,45,83~ tailwind-like css shorthands
# ~yellow1|0,12,-19,50,23,44,74~ and colors
# ~tag|2,10,149,75,18,84,55~ define web components
# ~<div|2,-3,260,48,18,84,55~ indentation-based syntax
# ~ta:center|0,78,-36,34,,1,49~ inline styles
# ~global css|2,-2,44,31,25,83,56~ built-in support for css/styling
# ~state.color|0,17,33,42,25,45,35~ two-way databinding
# ~color-picker|2,-10,364,50,10,86,51~ Custom web components