- Show that we can bind to both variables and properties
- Basic syntax for binding `<element[value-to-bind]>`
- How to expose binding

## Text inputs

```imba
let message = "Hello"

imba.mount do <>
	<input[message].field type='text'>
	<div> "Message is {message}"
```

## Numeric inputs

```imba
let number = 1
let object = {number: 2}

imba.mount do <>
	<label.flex.flex-row>
		<input[number].field type='number' min=0 max=10>
		<input[number].field type='range' min=0 max=10>
	<label.flex.flex-row>
		<input[object.number].field type='number' min=0 max=10>
		<input[object.number].field type='range' min=0 max=10>
	<div.field> "{number} + {object.number} = {number + object.number}"
```

## Checkbox inputs
```imba
const state =
	message: ""
	enabled: false

imba.mount do
	<label>
		<input[state.enabled] type='checkbox'>
		<span> "enabled: {state.enabled}"
```

## Radio inputs

## Select

## Select multiple

## Custom binding

```imba
tag x-checkbox
	def render
		<self> <label.block>
			<input[data] type='checkbox'>
			<span.pl-2> <slot>

const state = { enabled: no }

imba.mount do <main>
	<x-checkbox[state.enabled]> 'Enable'
	if state.enabled
		<span> 'State is enabled!'
```