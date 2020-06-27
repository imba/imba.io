css @focus outline:none

css body
	d:grid gaf:row ac:center jc:stretch ji:center gap:2 p:2

css main,div,section,form,article,header,footer
	pos:relative

css main
	d:grid gaf:row ac:start gap:2 p:2
	pos:absolute inset:0

css div
	gaf:column pc:center pi:center

css section,form
	d:grid gaf:row ac:center jc:stretch ji:center gap:2

css header,footer
	d:flex fld:row gaf:column js:stretch jc:stretch ji:stretch gap:2

css article
	d:grid gaf:row ac:start gap:2 p:2
	radius:2
	border:1px dashed gray3
	min-height:60px

css figure
	d:grid gaf:row pc:center gap:2

css body > figure@only
	pos:absolute inset:0

css group,cell,box
	d:grid pos:relative gtc:100% ai:center
	1cmx:0.5cg 1cmy:0.5rg
	> div
		all:unset pos:relative m:-1cmx -1cmy d:flex flw:wrap ai:inherit
		
	> div > * m:1cmy 1cmx

css flex
	pos:relative d:flex flw:wrap
	1cmx:0.5cg 1cmy:0.5rg
	m:-1cmx -1cmy
	> * m:1cmy 1cmx

css .group, .bar
	pos:relative d:flex flw:wrap fld:row
	1cmx:0.5cg 1cmy:0.5rg
	m.group:-1cmx -1cmy
	> * m:1cmy 1cmx

css li
	p:1
	bbw:1 bbc:gray3

css label
	fw:400 c:gray6 fs:sm ta:center

css a td:u c:blue6

css mark
	d:grid gaf:column pc:center pi:center gap:2
	bw:1 bc:yellow4 radius:1 py:1 px:2 fs:smaller
	bg:yellow3 c:yellow8

css button
	d:grid gaf:column pc:center pi:center gap:2
	py:1 px:3 fw:400 min-width:6 min-height:8
	bw:1 bc:gray4 radius:2
	fs:md/1.2
	c:gray8 @hover:gray9
	bg:gray1 @hover:gray2 @active:gray3
	shadow:xs
	us:none
	tween:100ms ease-in-out
	y@active:1px
	@focus outline:none shadow:0 0 0 3px blue3/35 bc:blue4
	@disabled c:gray5
	# @is-busy c:gray5 opacity:0.7 scale:0.96 pe:none outline:none

css .chip
	px:2 py:1 fs:sm

css .pill radius:2 bg:teal2 fs:xs c:teal7 py:1 px:2

css .tags
	m: -4px
	> m:4px

css samp,var
	d:grid pc:center pi:center min-width:60px p:1
	bs:dashed bw:1 bc:gray4 radius:2

css select,textarea,input
	py:1 px:3 min-width:10 min-height:8
	bw:1 radius:2
	fs:md/1.2
	c:gray8 @hover:gray9
	bc:gray4 @hover:gray5/80
	bg:white @focus:white
	@focus shadow:0 0 0 3px blue3/35 bc:blue4
	@disabled c:gray5

css input[type=range],input[type=checkbox],input[type=radio]
	p:0 bw:0 shadow:none min-width:initial

css input[type=number] w:60px pr:0

css input@not([type]),input[type=text]
	min-width:20
	flex:1

css input.inline
	bw:0 bg:clear p:0 m:0

css select
	w:160px flex:1

css .faded o:0.5
css .busy c:gray5 opacity:0.7 scale:0.96 pe:none outline:none

css input[type=range]
	-webkit-appearance: none min-height:initial

css input[type=range]::-webkit-slider-runnable-track
	w:100% h:8px bg:gray2 radius:2 border:1px solid gray4 box-sizing:border-box
css input[type=range]::-webkit-slider-thumb
	-webkit-appearance: none 
	w:14px h:14px mt:-4px bg:blue5 radius:10 box-sizing:border-box

css input[type=checkbox]
	min-height:initial

css input[type=radio]
	min-height:initial

css #hud
	pos:absolute t:0 l:0 r:0 p:3 bg:gray1 border-bottom:1px solid gray3
	h:8 fs:sm c:gray5
	input[type=range] w:60px
	.num d:block w:6

css #hud + main t:8