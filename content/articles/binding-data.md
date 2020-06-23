
## Text inputs

```imba
# ~preview
css body p:4
css input d:block p:1 px:2 c:gray8 bw:1 bc:gray4 radius:2px
css div d:block mt:1 c:gray7

let message = "Hello"

imba.mount do <div>
	<input type='text' bind=message>
	<div> "Message is {message}"
```

## Numeric inputs

```imba
# ~preview
css body p:4 d:grid pc:center
css input[type=number] d:block p:1 c:gray8 bw:1 bc:gray4 radius:2px
css input[type=range] d:block c:gray8
css div d:block mt:1 c:gray7

# ---
let number = 1
let object = {number: 2}

imba.mount do <>
	<div[d:grid gtc:1fr 3fr 1fr 3fr gap:2]>
		<input type='number' min=0 max=10 bind=number>
		<input type='range' min=0 max=10 bind=number>
		<input type='number' min=0 max=10 bind=object.number>
		<input type='range' min=0 max=10 bind=object.number>
	<div.field> "{number} + {object.number} = {number + object.number}"
```

## Checkbox inputs
```imba
# ~preview
css body p:4

const state =
	message: ""
	enabled: false

imba.mount do <label .enabled=state.enabled>
	<input type='checkbox' bind=state.enabled>
	<span[pl:1 color: gray6 ..enabled:green6]> "enabled: {state.enabled}"
```

## Multiple checkboxes

## Radio inputs

## Select

## Select multiple

## Custom binding

```imba
# ~preview
css body p:4 user-select:none

tag x-checkbox
	def render
		<self> <label.block>
			<input type='checkbox' bind=data>
			<span[pl:1]> <slot>

const state = { enabled: no }

imba.mount do <main>
	<x-checkbox bind=state.enabled> 'Enable'
	if state.enabled
		<span[pl:1 c:gray6]> 'State is enabled'
```