# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 d:flex
css .demo-2 d:hflex
css .demo-4 d:hflex ja:center
css .demo-6 d:hflex ai:stretch
css .demo-7 d:hflex jc:space-between
css .demo-3 d:vflex
css .demo-5 d:vflex ai:stretch
css .demo-7 d:vflex jc:space-between
# ---

imba.mount do <.inline-demo>
	<div[g:2 p:2 rd:6px size:180px bd:1px dashed cooler4/50 bg:cooler7/10].{vars.flag}>
		<div.child[rd:3px min-width:40px min-height:40px bg:teal4]>
		<div.child[rd:3px min-width:50px min-height:50px bg:indigo4]>
		<div.child[rd:3px min-width:30px min-height:30px bg:purple4]>