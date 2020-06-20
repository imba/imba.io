tag app-clock
	prop utc

	def mount
		$interval = setInterval(render.bind(self),1000)
	
	def unmount
		clearInterval($interval)

	def turns div
		let num = (Date.now! / 60000 + utc * 60) / div
		return "rotate({(num % 1).toFixed(3)}turn)"
	
	get time
		(Date.now! / 60000 + utc * 60)
	
	def render
		<self.clock>
			<div.dial.h[rotate:{time / 720}]>
			<div.dial.m[rotate:{time / 60}]>
			<div.dial.s[rotate:{time}]>

imba.mount do <div.clocks>
	<app-clock title='New York' utc=-5>
	<app-clock title='San Fran' utc=-8>
	<app-clock title='London' utc=0>
	<app-clock title='Tokyo' utc=9>