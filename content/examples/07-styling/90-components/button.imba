css body
	l:flex wrap center p:10

css button
	p:2 4 radius:3 f:bold cursor:pointer m:1
	c:gray8 b:black-4 shadow:sm
	transition: 100ms cubic-out
	&:hover = y:-2px shadow:md
	&.primary = bg:blue5 c:blue1 bg.hover:blue6 c.hover:white
	&.teal = bg:teal2 c:teal7 bg.hover:teal3 c.hover:teal8
	&.blue = bg:blue2 c:blue7 bg.hover:blue3 c.hover:blue8
	&.green = bg:green2 c:green7 bg.hover:green3 c.hover:green8
	&.danger = bg:red5 c:red1 bg.hover:red6 c.hover:white

imba.mount <>
	<button.primary> "Primary"
	<button> "Normal"
	<button.danger> "Danger"
	<button.blue> "Blue"
	<button.green> "Green"
	<button.teal> "Teal"