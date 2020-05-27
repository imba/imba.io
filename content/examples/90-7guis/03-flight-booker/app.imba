# https://github.com/eugenkiss/7guis/wiki#flight-booker
tag flight-booker
	prop isReturn = false
	prop start = (new Date).toISOString!.slice(0,10)
	prop end = start

	def bookFlight
		let type = isReturn ? 'return' : 'one-way'
		let message = `You have booked a {type} flight, leaving {new Date(end).toDateString!}`
		message += ` and returning {new Date(end).toDateString!}` if isReturn
		window.alert(message)

	<self>
		<select[isReturn]>
			<option value=false> 'one-way flight'
			<option value=true>	'return flight'
		<input[start] type='date'>
		<input[end] type='date' disabled=!isReturn>
		<button :click.bookFlight disabled=(isReturn && start >= end)> 'book'

imba.mount <flight-booker>

### css
select, input, button {
	display: block;
	margin: 0.5em 0;
	font-size: inherit;
}
###