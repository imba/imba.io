---
title: Events
multipage: true
---

# Basics

## Listening to Events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, imba will call that handler, with the event as the only argument.

```imba
<div @click=console.log> 'Will log the event'
```

Inside of these lazy handlers you can also refer to the event itself as `e`.

```imba
let x = 0
<button @click=console.log(e.type,e.x,e.y)> "Click"
<button @mousemove=(x = e.x)> "Mouse at {x}"
```

Remember that the expression will be called as is, so you never need to bind functions to their context and/or arguments.

```imba
import {todos} from './data.imba'

const handler = console.log.bind(console)

# ---
<ul> for item,i in todos
	<li @click=handler(e.type,item,i)> item.title
```

## Triggering Events


# Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

## Utility Modifiers

##### log ( ...params )

```imba
# ~preview=small
import 'util/styles'

# ---
# log to the console
imba.mount do
	<button @click.log('logged!')> 'test'
```

##### wait ( duration = 250ms )

```imba
# ~preview=small
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('logged!')> 'default'
	<button @click.wait(100).log('logged!')> 'fast'
	<button @click.log('!').wait(500).log('!!')> 'chained'
```

##### throttle ( ms )

```imba
# ~preview=small
import 'util/styles'

# ---
# disable handler for duration after triggered 
imba.mount do
	<button @click.throttle(1000).log('clicked')> 'click me'
```

##### emit-*name* ( detail = {} )

```imba
# ~preview
import 'util/styles'

# ---
# Shorthand for emitting events
imba.mount do
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit-select> 'emit'
		<button @click.emit-select(a:1,b:2)> 'with data'
```

##### flag-*name* ( target )

```imba
# ~preview
import 'util/styles'

# ---
# Add flag while event is being handled
imba.mount do
	<div.group>
		<button @click.flag-busy> 'flag self'
		<button @click.flag-busy('div').wait(1000)> 'flag div'
# Optionally supply a selector / element to flag
```

## Core Modifiers

##### prevent
```imba
# ~preview
import 'util/styles'

# ---
# calls preventDefault on event
imba.mount do
	<a href='https://google.com' @click.prevent.log('prevented')> 'Link'
```

##### stop
```imba
# ~preview
import 'util/styles'

# ---
# .stop will call stopPropagation() on the event
imba.mount do <div.group @click.log('clicked div')>
	<button @click.stop.log('stopped')> 'stop'
	<button @click.log('bubble')> 'bubble'
```

##### once
```imba
# ~preview
import 'util/styles'
# ---
# the click event will be triggered at most once
imba.mount do <button @click.once.log('once!')> 'Click me'
```

##### capture

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
```

##### passive

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<main[overflow:scroll] @scroll.passive.log('scrolled')>
		<article> "One"
		<article> "Two"
		<article> "Three"
```

##### silence
```imba
# ~preview
import 'util/styles'

# ---
let counter = 0
imba.mount do <section>
	<div.group>
		<button @click.silence.log('silenced')> "Silenced"
		<button @click.log('clicked')> "Not silenced"
	<label> "Rendered {++counter} times"
# By default, Imba will commit after all handled events.
# In the few cases you want to suppress this, add the `silence` modifier.
```


## Guard Modifiers

##### self
```imba
# ~preview
import 'util/styles'
# ---
# only trigger handler if event.target is the element itself
imba.mount do 
	<button @click.self.log('clicked self')>
		"Button"
		<b> "Nested"
```

##### sel ( selector )
```imba
# ~preview
import 'util/styles'

# ---
# only trigger if event.target.closest(selector) is true
imba.mount do <div.group>
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'
```

##### if ( expr )
```imba
# ~preview
import 'util/styles'
# ---
let age = 20
# break chain unless expr is truthy
imba.mount do <div.group>
	<input type='number' bind=age>
	<button @click.if(age > 20).log('drink')> 'drink'
	<button @click.if(age > 16).log('drive')> 'drive'
```

##### ctrl
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless ctrl key is pressed
imba.mount do <div.group>
	<button @click.ctrl.log('ctrl+click')> 'ctrl+click'
	# On mac there is no way to detect a `control+click` event.
	# Instead you will have to intercept the `contextmenu` event,
	# which is triggered by `control+click` and right mouse.
	<button @contextmenu.prevent.ctrl.log('ctrlish+click')> 'ctrlish+click'
```

##### alt
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless alt key is pressed
imba.mount do
	<button @click.alt.log('alt+click')> 'alt+click'
```

##### shift
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless shift key is pressed
imba.mount do
	<button @click.shift.log('shift+click')> 'shift+click'
```

##### meta
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless meta key is pressed
# On mac keyboards, meta is the command key (⌘).
# On windows keyboards, meta is the Windows key (⊞)
imba.mount do <button @click.meta.log('meta+click')> 'meta+click'
```

##### keys
```imba
# ~preview
import 'util/styles'

# ---
imba.mount do 
	<header> <input placeholder='Text..'
		@keydown.enter.log('pressed enter')
		@keydown.left.log('pressed left')
		@keydown.right.log('pressed right')
		@keydown.up.log('pressed up')
		@keydown.down.log('pressed down')
		@keydown.tab.log('pressed tab')
		@keydown.esc.log('pressed esc')
		@keydown.space.log('pressed space')
		@keydown.del.log('pressed del')
	>
```

## Chaining Modifiers

It is important to understand the concept of chaining. You can add multiple modifiers one after another (separated by `.`). When an event is handled, these modifiers will be executed in the specified order.

## Custom Modifiers

### System Key Modifiers

System modifier keys are different from regular keys and when used with `@keyup` events, they have to be pressed when the event is emitted. In other words, `@keyup.ctrl` will only trigger if you release a key while holding down `ctrl`. It won’t trigger if you release the `ctrl` key alone. You can use the following modifiers to trigger event listeners only when the corresponding modifier key is pressed:

# Custom Events

# Pointer Events

Great documentation for pointer events can be found over at [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## Modifiers

##### mouse
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.mouse.log('only mouse!')> 'Button'
```

##### pen
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pen.log('only pen!')> 'Button'
```

##### touch
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.touch.log('only touch!')> 'Button'
```

##### pressure ( threshold = 0.5 )
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pressure.log('pressured?')> 'Button'
```

## Event Types

### pointerover
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerover.log('over!')> 'Button'
```
This event is fired when a pointing device is moved into an element's hit test boundaries.

### pointerenter
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerenter.log('enter!')> 'Button'
```
This event is fired when a pointing device is moved into the hit test boundaries of an element or one of its descendants, including as a result of a pointerdown event from a device that does not support hover (see pointerdown). This event type is similar to pointerover, but differs in that it does not bubble.

### pointerdown
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.log('down!')> 'Button'
```
The event is fired when a pointer becomes active. For mouse, it is fired when the device transitions from no buttons depressed to at least one button depressed. For touch, it is fired when physical contact is made with the digitizer. For pen, it is fired when the stylus makes physical contact with the digitizer.

### pointermove
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointermove.log('move!')> 'Button'
```
This event is fired when a pointer changes coordinates.

### pointerup
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerup.log('up!')> 'Button'
```
This event is fired when a pointer is no longer active.


### pointercancel
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointercancel.log('cancelled!')> 'Button'
```
A browser fires this event if it concludes the pointer will no longer be able to generate events (for example the related device is deactived).


### pointerout
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerout.log('out!')> 'Button'
```
This event is fired for several reasons including: pointing device is moved out of the hit test boundaries of an element; firing the pointerup event for a device that does not support hover (see pointerup); after firing the pointercancel event (see pointercancel); when a pen stylus leaves the hover range detectable by the digitizer.



### pointerleave
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerleave.log('leave!')> 'Button'
```
This event is fired when a pointing device is moved out of the hit test boundaries of an element. For pen devices, this event is fired when the stylus leaves the hover range detectable by the digitizer.

### pointerdrag [custom]

# Touch

```imba
# ~preview=small
import 'util/styles'

# ---
let state = {}
imba.mount do <div>
	<button @touch=(state=e.touch)> 'Button'
	<label> "x:{state.x} y:{state.y} dx:{state.dx} dy:{state.dy}"
```

```imba
# ~preview=small
import 'util/styles'
css button pos:relative
# ---
let s = {x:0,y:0}

def move e
	s.x = e.tx
	s.y = e.ty

imba.mount do <section>
	<div.pill[x:{s.x} y:{s.y}]
		@click.log('clicked')
		@touch(s).threshold(5)=move> 'Button', <b> 'Inner'
	<button @click=(s.x=0,s.y=0)> 'Reset'
```

```imba
# ~preview=small
import 'util/styles'
css button pos:relative
# ---
let s = {x:0,y:0}

def move e
	s.x = e.tx
	s.y = e.ty

imba.mount do <section>
	<div.pill[x:{s.x} y:{s.y}]
		@click.log('clicked')
		@touch(s).prevent.threshold(5)=move>
			'Button'
			<b> 'Inner'
	<button @click=(s.x=0,s.y=0)> 'Reset'
```

```imba
# ~preview=small
import 'util/styles'
css button pos:relative
# ---
let s = {x:0,y:0}
imba.mount do <section>
	<div.pill[x:{s.x} y:{s.y}] @pointerdrag(s)> 'Button'
	<label> <span> "phase:{s.phase}"
	<label> <span> "x:{s.x} y:{s.y}"
	<label> <span> "dx:{s.dx} dy:{s.dy}"
```

| Properties  |  |
| --- | --- |
| `touch.x` | The X coordinate of the point |
| `touch.y` | Current position of touch |
| `touch.dx` | Horizontal movement since start of touch |
| `touch.dy` | Vertical movement since start of touch |
| `touch.mx` | Movement since the previous event |
| `touch.my` | Current position of touch |
| `event.width` | Returns the new width of observed element |
| `event.height` | Returns the new height of observed element |

## Examples

```imba
# ~preview=small
import 'util/styles'
css button pos:relative
# ---
let s = {x:0,y:0}
imba.mount do <section>
	<div.pill[x:{s.x} y:{s.y}] @touch.round.sync(s)> 'Button'
	<label> <span> "phase:{s.phase}"
	<label> <span> "x:{s.x} y:{s.y}"
	<label> <span> "dx:{s.dx} dy:{s.dy}"
```

### Draggable
```imba
# ~preview=xl
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1 radius:sm cursor:default
		bg:white shadow:sm
		@touch scale:1.05 rotate:2deg zi:2 shadow:lg

	def build
		x = y = 0

	def drag e
		if e.type == 'pointerup'
			x += dx
			y += dy
			dx = dy = 0
		else
			dx = e.dx
			dy = e.dy

	def render
		<self[x:{x+dx} y:{y+dy}] @touch.update(self)=drag> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
```

### Draggable using sync
```imba
# ~preview=xl
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1 radius:sm cursor:default
		bg:white shadow:sm
		@touch scale:1.05 rotate:2deg zi:2 shadow:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.threshold(20).sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
```

### Separator
```imba
# ~preview=xl
import 'util/styles'
# css body bg:gray1
# ---
tag Panel
	prop split = 0.3

	def resize e
		split = 1 - e.touch.xa

	def render
		<self[d:flex w:80vw h:80vh bg:teal1]>
			<div[flex:1]> "Master"
			<div[w:3 bg:teal3].separator @touch.anchor(self)=resize>
			<div[flb:{split * 100}%]> "Detail"

imba.mount do <Panel>
```

### Paint

[Code](/examples/applications/paint)


# Resize Event

The [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) interface reports changes to the dimensions of an Element's content or border box. It has [decent browser support](https://caniuse.com/#feat=resizeobserver) and is very useful in a wide variety of usecases. ResizeObserver avoids infinite callback loops and cyclic dependencies that are often created when resizing via a callback function. It does this by only processing elements deeper in the DOM in subsequent frames.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) |
| `event.width` | Returns the new width of observed element |
| `event.height` | Returns the new height of observed element |

##### Example
```imba
# ~preview=xl
import 'util/styles'

# ---
let w = 0, h = 0

imba.mount do
	<section[pi:center]>
		<label> "Size is {w} x {h}"
		<article[h:40px w:100px of:auto resize:both] @resize=(w=e.width,h=e.height)>
		<mark[width:{w}px]> "Imitator"
```

# Intersection Event

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. In Imba it is extremely easy to set up an intersection observer.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |


##### Example

```imba
# ~preview=xl
css body p:6
css .grid d:grid g:3
css .box d:grid gap:4 p:4 radius:2 bw:1 bc:black/5
css .field p:1 px:2 radius:2 bw:1 bc:gray4 c:gray8
css .box bg:white .teal:teal3 .blue:blue3

# ---
import {genres} from 'imdb'

tag Genre
    css @force p:4 bg:blue2 h:120px

	prop ratio = 0

    def intersected e
        ratio = e.ratio

	def render
		<self[opacity:{ratio}] @intersect(10)=intersected> <slot>

imba.mount do
	<div.box> for genre in genres
		<Genre> genre
```

##### intersect(n)
```imba
# n 0-1 adds single threshold at n visibility
<div @intersect(0)=handler> # On 0%
<div @intersect(0.5)=handler> # On 50%
<div @intersect(1)=handler> # On 100%

# n > 1 will add n thresholds - spread evenly
<div @intersect(2)=handler> # Trigger [0%,100%]
<div @intersect(3)=handler> # Trigger [0%,50%,100%]
<div @intersect(5)=handler> # Trigger [0%,25%,50%,75%,100%]
# ... and so forth
```

##### intersect.in
```imba
# Will only trigger when intersection ratio increases
<div @intersect.in=handler>
# Will only trigger when element is more than 50% visible
<div @intersect(0.5).in=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *increased*.

##### intersect.out
```imba
# Will only trigger when element starts intersecting
<div @intersect.out=handler>
# Will trigger whenever any part of the div is hidden
<div @intersect(1).out=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *decreased*.

# Selection Event

