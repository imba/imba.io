import './canvas'
import './pickers'

global css body m:0 p:0 of:hidden rd:lg bg:yellow1

const strokes = [1,2,3,5,8,12]
const colors = ['#F59E0B','#10B981','#3B82F6','#8B5CF6']
const state = {stroke: 5, color: '#3B82F6'}

tag App
	<self>
		<div[ta:center pt:20 o:0.2 fs:xl]> 'draw here'
		<app-canvas[pos:abs inset:0] state=state>
		<div.tools[pos:abs b:0 w:100% d:hgrid ja:center]>
			<stroke-picker options=strokes bind=state.stroke>
			<color-picker options=colors bind=state.color>

imba.mount <App[pos:abs inset:0]>
# ~rd:lg|16,1.3,-1,50,16,45,83,0.8,0/-~ tailwind-like css shorthands
# ~yellow1|16,3,-0.3,50,12,44,74,1.3,0/-~ and colors
# ~ta:center|16,6,-1,34,,1,49,5.8,-0.5/-~ inline styles
# ~state.color|16,-2,2,42,25,45,35,0,0.8/-~ two-way databinding
# ~global css|18,-6,-0.3,31,12,92,62,0.3,0.5/18,7,-0.6,31,12,10,43,8.1,0~ built-in css
# ~color-picker|18,-19.5,0.5,50,10,86,51,-0.3,0.5/18,2.5,2.3,50,24,4,53,7,1.8~ Custom web components
# ~tag|18,-6.5,-1,75,13,90,54,0,0.5/18,8.8,-0.8,15,22,4,50,7.5,0.8~ define web components
# ~<div|18,-12.8,1,48,18,84,55,-1.5,0.3/18,-0.9,2.3,48,18,52,0,-1.5,0.3~ indentation-based syntax