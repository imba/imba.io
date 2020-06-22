import '../styling/globals.imba'

let name = 'One'
let state = {start:0,end:0}

imba.mount do <div.grid>
	<input.field bind=name type='text' @selection=(state = e.detail)>
	<p> "sel is {state.start}-{state.end} & value is '{name}'"