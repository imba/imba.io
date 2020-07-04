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

To make it easier and more fun to work with touches, Imba includes a custom `touch` event that combines `pointerdown` -> `pointermove` -> `pointerup/pointercancel` in one convenient handler, with modifiers for commonly needed functionality.

```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch=(x=e.x,y=e.y)> "x={x} y={y}"
# ---
imba.mount do <Example.rect>
```

The `event` emitted by this handler is not an event, but a `Touch` object, that remains the same across the whole touch. 

| Properties  |  |
| --- | --- |
| `touch.event` | The last/current event in this touch |
| `touch.target` | The element that initiated this touch |
| `touch.events` | Array of all the events that are part of this touch |
| `touch.x` | Normalized x coordinate for the pointer |
| `touch.y` | Normalized y coordinate for the pointer |
| `touch.elapsed` | The duration since pointerdown in milliseconds |


You can add arbitrary properties to the touch object if you need to keep track of things across the many events that will be triggered during this touch.

## Modifiers

### moved ( threshold = 4 )

This guard will break the chain unless the touch has moved more than `threshold`. Once this threshold has been reached, all subsequent updates of touch will pass through. The element will also activate the `@move` pseudostate during touch - after threshold is reached.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# won't trigger until moved 30px from start
	<self @touch.moved(30)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-up ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
### moved-down ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-down=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-left ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-left=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
### moved-right ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-right=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-x ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-x=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
### moved-y ( threshold = 4 )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch.moved-y=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### held ( threshold )


## Syncing

### sync ( data )

A convenient touch modifier that takes care of updating the x,y values of data during touch. When touch starts sync will remember the initial x,y values and only add/subtract from the initial values based on movement of the touch.
```imba
# ~preview=lg
import 'util/styles'

# ---
tag Draggable
	prop pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)>
# ---
imba.mount do <Draggable>
```

Sync will update the x and y properties of whatever object you decide to supply as an argument.

```imba
# ~preview=lg
import 'util/styles'

# ---
const pos = {x:0,y:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)> 'drag'
	<[w:40px x:{pos.y} y:{pos.x}].rect> 'flipped'
```
### sync ( data, alias-x, alias-y )

You can also include the property names you want to sync x and y to/from.
```imba
# ~preview=lg
import 'util/styles'

# ---
const data = {a:0,b:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<[w:80px x:{data.a} top:{data.b}px].rect @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"
```


## Interpolating

A very common need for touches is to convert the coordinates of the touch to some other frame of reference. When dragging you might want to make x,y relative to the container. For a custom slider you might want to convert the coordinates from pixels to relative offset of the slider track. There are loads of other scenarios where you'd want to convert the coordinates to some arbitrary scale and offset. This can easily be achieved with fitting modifiers.

### fit ( box, snap = 1 )

The first argument of fit is the box you want to fit to. If box is a string it will be treated as a selector and try to look up an element matching the selector

```imba
# ~preview=lg
import 'util/styles'
css .rect w:80vw
# ---
tag Fitted
	<self @touch.fit(self)=(y=e.y)> "box.y {y}"
tag Unfitted
	<self @touch=(y=e.y)> "window.y {y}"
tag Snapped
	<self @touch.fit(self,2)=(y=e.y)> "box.y {y}"
# ---
imba.mount do <>
	<Fitted.rect>
	<Unfitted.rect>
	<Snapped.rect>
```

### fit ( box, start, end, snap = 1)

By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self @touch.fit(self,0,100)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
You can use negative values on `start` and `end` as well.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from -50 to +50 with 0.1 increments
	<self @touch.fit(self,-50,50,0.1)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```


You can also use percentages in start and end to reference the width and height of the box we're mapping to.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# this will essentially flip the origin from top left to bottom right
	<self @touch.fit(self,100%,0)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
You can also use arrays to fit the x and y axis to different values.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# will flip and center the y axis
	<self @touch.fit(self,[0,50%],[100%,-50%])=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```

All in all, basic fitting makes it incredibly easy to implement something like a custom slider:
```imba
# ~preview=small
import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative radius:sm
# css .track h:4 w:100% bg:blue3 pos:relative radius:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% radius:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

# ---
tag Slider
	prop min = -50
	prop max = 50
	prop step = 1
	prop value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<Slider min=0 max=1 step=0.25>
	<Slider min=-100 max=100 step=1>
	<Slider min=10 max=-10 step=0.5>
```
Or a pane with resizeable panels:
```imba
# ~preview=small
import 'util/styles'

# ---
tag Panel
	prop split = 70

	<self[d:flex pos:absolute inset:0]>
		<div[bg:teal2 flex-basis:{split}%]>
		<div[fls:0 w:2 bg:teal3 @touch:teal5]
			@touch.pin.fit(self,0,100,2)=(split=e.x)>
		<div[bg:teal1 flex:1]>

imba.mount do <Panel>
```

## Pinning


## Examples

### Simple draggable
```imba
# ~preview=xl
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1 radius:sm cursor:default
		bg:white shadow:sm
		@touch scale:1.02
		@move scale:1.05 rotate:2deg zi:2 shadow:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
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

