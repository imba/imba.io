tag clock
	prop utc

	def build
		schedule(fps: 30, events: no)

	def turns div
		let num = (Date.now/60000 + utc * 60) / div
		return "rotate({(num % 1).toFixed(3)}turn)"
	
	def render
		<self>
			<div.m transform=turns(60)>
			<div.h transform=turns(720)>
			<div.s transform=turns(1)>

<div.clocks> # spawn 4 clocks
	<clock title='New York' utc=-5>
	<clock title='San Fran' utc=-8>
	<clock title='London' utc=0>
	<clock title='Tokyo' utc=9>