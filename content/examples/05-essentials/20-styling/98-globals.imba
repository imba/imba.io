css body p:6

css .grid d:grid g:3
css .box d:grid gap:4 p:4 radius:2 bw:1 bc:black/5
css .field p:1 px:2 radius:2 bw:1 bc:gray4 c:gray8

css .box
	bg:white .teal:teal3 .blue:blue3

css button,.btn
	p:2 4 radius:3 fw:500 cursor:pointer
	c:gray8 bw:1 bc:black/2 shadow:sm
	transition: 100ms cubic-out
	@hover y:-2px shadow:md
	&.primary bg:blue5 @hover:blue6 c:blue1 @hover:white
	&.teal bg:teal2 @hover:teal3 c:teal7 @hover:teal8
	&.blue bg:blue2 @hover:blue3 c:blue7 @hover:blue8
	&.green bg:green2 @hover:green3 c:green7 @hover:green8
	&.danger bg:red5 @hover:red6 c:red1 @hover:white

