import 'util/styles'
# https://github.com/eugenkiss/7guis/wiki#counter
tag app-temperature
	prop c = 0
	prop f = 32

	set celsius value
		c = +value
		f = +(32 + (9 / 5 * c)).toFixed(1)
	
	set fahrenheit value
		f = +value
		c = +(5 / 9 * (f - 32)).toFixed(1)
	
	<self>
		<input type='number' value=c @input=(celsius = e.target.value)/> " °c = "
		<input type='number' value=f @input=(fahrenheit = e.target.value)/> " °f"

imba.mount <app-temperature>