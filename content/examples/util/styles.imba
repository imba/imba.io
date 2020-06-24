css body
	d:grid gaf:row pc:center gap:3 p:3

css main
	d:grid gaf:row ac:start gap:3 p:3
	pos:absolute inset:0

css div
	d:grid gaf:column pc:center gap:3

css section
	d:grid gaf:row pc:center gap:3

css header,footer
	d:grid gaf:column js:stretch jc:stretch ji:stretch gap:3

css article
	d:grid gaf:row ac:start gap:3 p:3
	radius:2
	border:1px dashed gray3
	min-height:60px

css label
	fw:400 c:gray6 fs:sm ta:center

css a td:u c:blue6

css mark
	d:grid gaf:column pc:center pi:center gap:2
	bw:1 bc:yellow4 radius:1 py:1 px:2 fs:smaller
	bg:yellow3 c:yellow8

css button
	d:grid gaf:column pc:center pi:center gap:2
	py:2 px:3 fw:500 width
	bw:1 bc:gray4 radius:2
	c:gray8 @hover:gray9
	bg:gray1 @hover:gray2 @active:gray3
	shadow:sm
	us:none
	y@active:1px	
	@disabled c:gray5


css input@not([type=checkbox])@not([type=radio])@not([type=range])
	py:1 pl:3 fw:500 min-width:10
	bw:1 radius:2
	c:gray8 @hover:gray9
	bc:gray4 @hover:gray5
	bg:white @hover:gray1 @focus:white
	shadow@focus:sm
	@disabled c:gray5

css input[type=number] w:80px
css input@not([type]),input[type=text]
	min-width:20

