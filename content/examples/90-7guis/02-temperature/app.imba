import 'util/styles'

# https://github.com/eugenkiss/7guis/wiki#counter

tag app-temperature
	
	prop c = 0 @set
		f = +(32 + (9 / 5 * c)).toFixed(1)
	
	prop f = 32 @set
		c = +(5 / 9 * (f - 32)).toFixed(1)

	css input w:5rem

	<self>
		<input type='number' bind=c /> " °c = "
		<input type='number' bind=f /> " °f"

imba.mount <app-temperature>