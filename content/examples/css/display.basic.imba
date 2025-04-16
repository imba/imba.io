# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 d:block # horizontal top left
css .demo-2 d:inline # horizontal top center
css .demo-3 d:inline-block # horizontal top right
css .demo-4 d:flex # ...
# ---

imba.mount do <.inline-demo>
	<div[g:2 p:2 rd:6px size:180px bd:1px dashed cooler4/50 bg:cooler7/10].{vars.flag}>
		<div.child[rd:3px min-width:40px min-height:40px bg:teal4]>
		<div.child[rd:3px min-width:50px min-height:50px bg:indigo4]>
		<div.child[rd:3px min-width:30px min-height:30px bg:purple4]>