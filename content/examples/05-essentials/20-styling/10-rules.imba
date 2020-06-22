css button
	m:1 p:2 4 radius:3 fw:500 cursor:pointer
	c:gray8 bw:1 bc:black/2 shadow:sm
	transition: 100ms cubic-out
	@hover y:-2px shadow:md
	&.primary bg:blue5 @hover:blue6 c:blue1 @hover:white
	&.teal bg:teal2 @hover:teal3 c:teal7 @hover:teal8
	&.blue bg:blue2 @hover:blue3 c:blue7 @hover:blue8
	&.green bg:green2 @hover:green3 c:green7 @hover:green8
	&.danger bg:red5 @hover:red6 c:red1 @hover:white

imba.mount <div[p:10 d:flex flw:wrap pc:center ai:center]>
	<button.secondary> "Normal"
	<button.primary> "Primary"
	<button.danger> "Danger"
	<button.blue> "Blue"
	<button.green> "Green"
	<button.teal> "Teal"