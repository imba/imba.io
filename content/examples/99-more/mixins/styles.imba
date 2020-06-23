css body p:4
css label c:gray5 fs:sm/1.2 pos:absolute t:-0.5lh px:1 ml:1 bg:white
css section,app-list d:grid gap:4 p:4 radius:2 bw:1 bc:gray3 bs:dashed pos:relative

export css %btn
	p:2 4 radius:3 fw:500 cursor:pointer
	c:gray8 bw:1 bc:black/2 
	transition: 100ms cubic-out
	d:grid pc:center
	bg:blue5 @hover:blue6
	c:blue1 @hover:white
	shadow:sm @hover:md
	y:0 @hover:-2px