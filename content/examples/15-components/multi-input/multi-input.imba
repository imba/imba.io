const CHR = "\u200b"

tag multi-input
	prop multiple = yes
	prop uniques = yes
	prop placeholder
	prop values = []
	prop readonly = no
	prop strict = no
	prop options

	get prefixes do CHR.repeat(values.length)
	get inputValue do $input ? $input.value.split(CHR).join('') : ''
	get expectedValue do prefixes + inputValue
	get selStart do $input ? $input.selectionStart : 0
	get selEnd do $input ? $input.selectionEnd : 0
		
	def blur
		$input.blur!
		
	def focus
		unless document.activeElement == $input
			$input.focus!
			select(prefixes.length,$input.value.length)
		self

	def submit
		$add(inputValue)
		
	def $add value
		if !uniques or values.indexOf(value) == -1
			values.push(value or inputValue)
		$input.value = prefixes
		self

	def select start, end
		$input.setSelectionRange(start,end or start)

	def handleInput e
		let start = selStart, end = selEnd

		if start != end
			values.splice(start,end - start)

		elif e.inputType == 'deleteContentBackward' and start != 0
			if values.length >= start
				if strict
					select(start - 1,end)
					return e.cancel()
				else
					values.splice(start - 1,1)

	def render
		let start = selStart
		let end = selEnd
		let values = values

		<self
			.readonly=readonly
			.selecting=(start < values.length)
			.writing=inputValue
		>
			<div.views> for item,i in values
				<div.item .sel=(end > i >= start) .before=(start == end == i)> item

			<input$input
				type="text"
				:beforeinput.{handleInput(e)}
				:selection.commit
				:keydown.enter.prevent.submit()
				:keydown.esc.blur
				:change.stop
				:copy.oncopy
				readOnly=readonly
				placeholder=placeholder
			>
	
	def rendered
		if $input.value != expectedValue
			let charsBefore = $input.value.slice(0,start).split(CHR).join("")
			$input.value = expectedValue
			select(prefixes.length + charsBefore.length)

### css scoped

multi-input {
	display: block;
	padding: 10px;
	margin: 10px;
	border: 1px solid black;
	color: inherit;
}

.item {
	padding: 2px;
	display: flex;
	border: 1px solid transparent;
}

.item.before {
	border-left-color: blue;
}

.item.sel {
	border-color: blue;
}

.selecting input {
	caret-color: transparent;
}

###
