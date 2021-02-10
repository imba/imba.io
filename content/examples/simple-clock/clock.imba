import './styles'
# ---
tag app-clock
	<self> # render dials++
		let ts = Date.now! / 60000 + utc * 60
		<div.location> <slot>
		<div.dial.hour[rotate:{ts / 720}]>
		<div.dial.minute[rotate:{ts / 60}]>
		<div.dial.second[rotate:{ts}]>
		<div.circle>

tag app
	<self> # render clocks inside app
		<app-clock utc=-5> 'New York'
		<app-clock utc=-8> 'San Fran'
		<app-clock utc=0> 'London'
		<app-clock utc=9> 'Tokyo'

imba.mount do <app.grid autorender=10fps>
	