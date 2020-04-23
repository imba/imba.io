---
title: Examples
multipage: true
---


# Todos

```imba
var input = ''
var items = []

def add
	items.push(title: input)
	input = ''

def archive
	items = items.filter do !$1.done

imba.mount do <div.app>
	<form :submit.prevent.{add!}>
		<input[input] placeholder='What to do?'>
	<ul> for item in items
		<li.todo .line-through=item.done>
			<input[item.done] type='checkbox'>
			<span> item.title
	<footer>
		<button :click.{archive!}> "Archive"
```
# Shortcuts

# Infinite List

# Multi Input Field
```imba
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

```

```imba
import '../shared/multi-input.imba'

imba.mount do <div.app>
	<h1> "Hello"
	<multi-input>
```


# Shortcuts

```imba
import 'https://unpkg.com/mousetrap@1.6.5/mousetrap.js'

console.log Mousetrap

```

# 7 Guis

## Counter

```imba
var count = 0

imba.mount do
	<div>
		<input[count] type='number'>
		<button :click.{count++}> 'count'
```

## Temperature

```imba
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
		<input type='number' value=c :input.{celsius = e.target.value}>
		"°c ="
		<input type='number' value=f :input.{fahrenheit = e.target.value}>
		"°f"

imba.mount <app-temperature>

### css
input { width: 5em; }
###
```

## Flight Booker

```imba
tag flight-booker
	prop isReturn = false
	prop start = Date.new.toISOString!.slice(0,10)
	prop end = start

	def bookFlight
		let type = isReturn ? 'return' : 'one-way'
		let message = `You have booked a {type} flight, leaving {Date.new(end).toDateString!}`
		message += ` and returning {Date.new(end).toDateString!}` if isReturn
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
```