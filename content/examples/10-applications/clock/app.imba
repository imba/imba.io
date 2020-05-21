tag app-clock
	prop utc

	def mount
		$interval = setInterval(render.bind(self),1000)
	
	def unmount
		clearInterval($interval)

	def turns div
		let num = (Date.now! / 60000 + utc * 60) / div
		return "rotate({(num % 1).toFixed(3)}turn)"
	
	def render
		<self.clock>
			<div.dial.h css:transform=turns(720)>
			<div.dial.m css:transform=turns(60)>
			<div.dial.s css:transform=turns(1)>

imba.mount do <div.clocks> # spawn 4 clocks
	<app-clock title='New York' utc=-5>
	<app-clock title='San Fran' utc=-8>
	<app-clock title='London' utc=0>
	<app-clock title='Tokyo' utc=9>