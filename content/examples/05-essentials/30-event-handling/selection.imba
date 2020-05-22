# Play around
let name = 'One'
let state = {}
let counter = 0

imba.mount do <div.app>
	<input[name] type='text' @selection=(state = e.detail)>
	<p> "Value is '{name}'"
	<p> "Selection {state.start} - {state.end}"
	<button @click=(counter++)>	"Incr"
