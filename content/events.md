---
title: Events
multipage: true
---


# Listening to Events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, Imba will call that handler, with the event as the only argument.

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

# Event Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

## Core Modifiers [toc-pills] [slug=core]

### prevent [event-modifier] [snippet]

Tells the browser that the default action should not be taken. The event will still continue to propagate up the tree. See [Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<a href='https://google.com' @click.prevent.log('prevented')> 'Google.com'
```


### stop [event-modifier] [snippet]

Stops the event from propagating up the tree. Event listeners for the same event on nodes further up the tree will not be triggered. See [Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)

```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<div.group @click.log('clicked div')>
		<button @click.stop.log('stopped')> 'click.stop'
		<button @click.log('bubble')> 'click'
```

### once [event-modifier] [snippet]

Indicates that the listeners should be invoked at most once. The listener will automatically be removed when invoked.

```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<button @click.once.log('once!')> 'Click me'
```

Remember that modifiers can be chained, and that the order of chaining matters. If you have conditional modifiers etc before the `once` - the listener will only be removed if the `once` modifier is reached.

```imba
# [preview=md]
import 'util/styles'

imba.mount do <fieldset>
	<legend> "Try to click buttons without holding shift first"
	<div[d:contents]>
		# ---
		<button @click.shift.once.log('yes!')> "shift-once"
		<button @click.once.shift.log('yes!')> "once-shift"
```

You can click the first button as many times you want without shift, but once you've clicked it while holding down shift it the handler will be invoked, and then removed. On the second button the `once` modifier appears before shift, so the listener will be removed after the first click, no matter if shift was pressed or not.


### capture [event-modifier] [snippet]

Indicating that events of this type should be dispatched to the registered listener before being dispatched to tags deeper in the DOM tree. 

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
```
When clicking the button you will see that the click listener on the parent div will actually be triggered first.

### passive [event-modifier] [snippet]

```imba
# [preview=md]
import 'util/styles'

imba.mount do
	# ---
	<main[overflow:scroll] @scroll.passive.log('scrolled')>
		<article> "One"
		<article> "Two"
		<article> "Three"
```

### silence [event-modifier] [snippet]

By default, Imba will re-render all scheduled tags after any *handled* event. So, Imba won't re-render your application if you click an element that has no attached handlers, but if you've added a `@click` listener somewhere in the chain of elements, `imba.commit` will automatically be called after the event has been handled. 

```imba
# [preview=md]
import 'util/styles'

# ---
let counter = 0
imba.mount do <section>
	<div.group>
		<button @click.silence.log('silenced')> "Silenced"
		<button @click.log('clicked')> "Not silenced"
	<label> "Rendered {++counter} times"
```

This is usually what you want, but it is useful to be able to override this, especially when dealing with `@scroll` and other events that might fire rapidly.

```imba
# [preview=md]
import 'util/styles'

# ---
tag Filter
	counter = 0
	<self>
		<div> "Filter rendered {counter++} times"
		<input value="Default" @selection.log('!')>
		<input value="Silent" @selection.silence.log('!')>

tag App
	counter = 0
	<self[ta:center]>
		<b> "App rendered {counter++} times"
		<Filter>

imba.mount <App>
```
If you try to select the "Default" text you will see that both the `App` and the `Filter` elements re-render. This happens because `App` is mounted via `imba.mount` which automatically schedules the element to render after events, and the Filter is rendered when `App` is rendered since it is a descendant of `App`. Now if you select text in the "Silent" input, it too has an event handler for the same event, but we've added a `.silence` modifier. This prevents the handler from automatically re-rendering scheduled elements after the event.


## Utility Modifiers [toc-pills] [slug=util]

#### wait ( duration = 250ms ) [event-modifier] [snippet]

The `wait` modifier delays the execution of subsequent modifiers and callback. It defaults to wait for 250ms, which can be overridden by passing a number or time as the first/only argument.

```imba
# [preview=sm]
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('!')> 'wait'
	<button @click.wait(100ms).log('!')> 'wait 100ms'
	<button @click.log('!').wait(500ms).log('!!')> 'waith 500ms'
```

In isolation the `wait` modifier might not seem very useful, but in combination with throttling and chained listeners it becomes quite powerful.

#### throttle ( ms ) [event-modifier] [snippet]

The `throttle` modifier ensures the handler is called at most every `n` milliseconds. Please note that there is no default value so if you don't pass in a value in `ms` then the event will not throttle. This can be useful in preventing multiple clicks/calls on the same property.

```imba
# [preview=sm]
import 'util/styles'

# ---
# disable handler for duration after triggered
imba.mount do <fieldset>
	<button @click.throttle(1000).log('clicked')> 'click me'
	<div> "Not clickable within 1 second of previous invocation."
```


#### debounce ( duration = 250ms ) [event-modifier] [snippet]

The `debounce` modifier ensures that a minimum amount of time has elapsed after the user stops interacting and before calling the handler. This is especially useful, for example, when querying an API and not wanting to perform a request on every keystroke.

In this example, the fetch will only occur 250ms after the user stops typing.

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	<input @input.debounce.log('fetch')>
	# ---
	<div> "Fire after no changes for 250ms"
```

The event will also include a `debounced` property which is an array consisting of all the events leading up to the final debounced event.

```imba
# [preview=sm]
import 'util/styles'
imba.mount do <fieldset>
	# ---
	let handler = do(e) console.log('debounced',e.debounced.length)
	<button @mousemove.debounce(250ms)=handler> 'Move mouse here'
```



#### self [event-modifier] [snippet]

The `self` event modifier is a handy way of reacting to events only when they are clicked on the actual element you are interacting with and not, for example, a child element. This can be useful for things like modal wrappers when you only want to react when clicking directly.

```imba
# [preview=sm]
import 'util/styles'
# ---
# only trigger handler if event.target is the element itself
imba.mount do
	<button @click.self.log('clicked self')>
		"Button"
		<b> "Nested"
```

```imba
# [preview=xl]
import 'util/styles'
# ---
# Modal will only close when clicking on wrapper itself, not on the modal content
imba.mount do
	<div.modal-wrapper @click.self.log("Close modal")>
		<main> "Modal content"
```

#### sel ( selector ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# only trigger if event.target.matches(selector) is true
imba.mount do <div.group>
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'
```

#### if ( expr ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'
# ---
let age = 20
# break chain unless expr is truthy
imba.mount do <div.group>
	<input type='number' bind=age>
	<button @click.if(age > 20).log('drink')> 'drink'
	<button @click.if(age > 16).log('drive')> 'drive'
```


#### ctrl [event-modifier] [snippet]

System modifier keys are different from regular keys and when used with @keyup events, they have to be pressed when the event is emitted. In other words, @keyup.ctrl will only trigger if you release a key while holding down ctrl. It won’t trigger if you release the ctrl key alone. You can use the following modifiers to trigger event listeners only when the corresponding modifier key is pressed:

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless ctrl key is pressed
imba.mount do <div.group>
	<button @click.ctrl.log('ctrl+click')> 'ctrl+click'
	# On mac there is no way to detect a `control+click` event.
	# Instead you will have to intercept the `contextmenu` event,
	# which is triggered by `control+click` and right mouse.
	<button
		@contextmenu.prevent.ctrl.log('ctrlish+click')
	> 'ctrlish+click'
```

#### alt [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless alt key is pressed
imba.mount do
	<button @click.alt.log('alt+click')> 'alt+click'
```

#### shift [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless shift key is pressed
imba.mount do
	<button @click.shift.log('shift+click')> 'shift+click'
```

#### meta [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless meta key is pressed
# On mac keyboards, meta is the command key (⌘).
# On windows keyboards, meta is the Windows key (⊞)
imba.mount do <button @click.meta.log('meta+click')> 'meta+click'
```

#### log ( ...params ) [event-modifier] [snippet]

Basic modifier that simply logs to the console. Mostly useful for testing and development.

```imba
# [preview=sm]
import 'util/styles'

# log to the console
imba.mount do
	# ---
	<button @click.log('logged!')> 'test'
```


#### emit-_name_ ( detail = {} ) [event-modifier] [snippet]

Emitting events is a powerful way to react to events inside child tag/components. This would replace patterns in other frameworks where you would typically have to pass through callbacks. Any arguments supplied will be available inside the `e.detail` property.

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit-select> 'emit'
		<button @click.emit-select(a:1,b:2)> 'with data'
```
#### flag-_name_ ( target ) [event-modifier] [snippet]

Flags are a convenient way of briefly adding a class to the element which is currently being triggered. Useful for adding effects to show "active" states.

```imba
# [preview=sm]
import 'util/styles'

# ---
# Add flag while event is being handled
imba.mount do
	<div.group>
		<button @click.flag-busy> 'flag self'
		<button @click.flag-busy('div').wait(1s)> 'flag div'
# Optionally supply a selector / element to flag
```



# Mouse Events [wip]

```imba
<button @click=(console.log("Button was clicked!"))> "Click Me"
```

# Keyboard Events [wip]

# Hotkey Events [wip]

The special hotkey event is based on [Mousetrap](https://craig.is/killing/mice) it will listen for the hotkey globally.

```imba
<div @hotkey("mod+s")=(console.log('save'))>
```

## Modifiers [toc-pills]

In addition to all the common modifiers, keyboard events support additional modifiers:

#### enter [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press enter.." @keydown.enter.log('enter!')>
```

#### left [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press left.." @keydown.left.log('left!')>
```

#### right [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press right.." @keydown.right.log('right!')>
```

#### up [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press up.." @keydown.up.log('up!')>
```

#### down [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press down.." @keydown.down.log('down!')>
```

#### tab [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press tab.." @keydown.tab.log('tab!')>
```

#### esc [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press esc.." @keydown.esc.log('esc!')>
```

#### space [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press space.." @keydown.space.log('space!')>
```

#### del [event-modifier]

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <header>
	# ---
	<input placeholder="Press del.." @keydown.del.log('del!')>
```



# Pointer Events [wip]

## Modifiers [toc-pills]

Modifiers available for all pointer events – pointerover, pointerenter, pointerdown, pointermove, pointerup, pointercancel, pointerout & pointerleave.

### mouse [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.mouse.log('only mouse!')> 'Mouse Only'
```

### pen [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pen.log('only pen!')> 'Pen Only'
```

### touch [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.touch.log('only touch!')> 'Touch Only'
```

### pressure ( threshold = 0.5 ) [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pressure.log('pressured?')> 'Button'
```


# Touch Events

To make it easier and more fun to work with touches, Imba includes a custom `touch` event that combines `pointerdown` -> `pointermove` -> `pointerup/pointercancel` in one convenient handler, with modifiers for commonly needed functionality.

```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
tag Example
	<self>
		# ---
		<div.rect @touch=(x=e.x,y=e.y)> "x={x} y={y}"
		# ---
imba.mount do <Example[d:contents]>
```

The `event` emitted by this handler is not an event, but a `Touch` object, that remains the same across the whole touch. 

## Properties

| table  |  |
| --- | --- |
| `e.event` | The last/current event in this touch |
| `e.target` | The element that initiated this touch |
| `e.events` | Array of all the events that are part of this touch |
| `e.x` | Normalized x coordinate for the pointer |
| `e.y` | Normalized y coordinate for the pointer |
| `e.elapsed` | The time elapsed since pointerdown started (in milliseconds) |


You can add arbitrary properties to the touch object if you need to keep track of things across the many events that will be triggered during this touch.

## Modifiers [toc-pills]

### moved ( threshold = 4px ) [event-modifier] [touch-modifier] [preview=lg]

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4

# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30px)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

This guard will break the chain unless the touch has moved more than `threshold`. Once this threshold has been reached, all subsequent updates of touch will pass through. The element will also activate the `@move` pseudostate during touch - after threshold is reached.



### moved-up ( threshold = 4px ) [event-modifier] [touch-modifier] [preview=lg]

```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-down ( threshold = 4px ) [event-modifier] [touch-modifier]
```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-down=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-left ( threshold = 4px ) [event-modifier] [touch-modifier]
```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-left=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-right ( threshold = 4px ) [event-modifier] [touch-modifier]
```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-right=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-x ( threshold = 4px ) [event-modifier] [touch-modifier]
```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-x=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### moved-y ( threshold = 4px ) [event-modifier] [touch-modifier]
```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-y=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```


### sync [event-modifier] [touch-modifier] [snippet]

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

##### sync( data )

```imba
# [preview=md]
import 'util/styles'

# ---
const pos = {x:0,y:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<div[w:60px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)> 'drag'
	<div[w:60px x:{pos.y} y:{pos.x}].rect> 'flipped'
```

You can also include the property names you want to sync x and y to/from:

##### sync( data, xname = 'x', yname = 'y' )

```imba
# [preview=md]
import 'util/styles'

# ---
const data = {a:0,b:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<div[w:80px].rect @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"
```
You can also include the property names you want to sync x and y to/from.

### fit [event-modifier] [touch-modifier]

A very common need for touches is to convert the coordinates of the touch to some other frame of reference. When dragging you might want to make x,y relative to the container. For a custom slider you might want to convert the coordinates from pixels to relative offset of the slider track. There are loads of other scenarios where you'd want to convert the coordinates to some arbitrary scale and offset. This can easily be achieved with fitting modifiers.

##### fit( box, snap = 1 )

```imba
# [preview=lg]
import 'util/styles'
css .rect w:calc(100vw - 80px)
# ---
tag Unfitted
	<self @touch=(x=e.x)> "window.x {x}"
tag Fitted
	<self @touch.fit(self)=(x=e.x)> "box.x {x}"
tag Snapped
	<self @touch.fit(self,2)=(x=e.x)> "box.x {x}"
# ---
imba.mount do <>
	<Unfitted.rect>
	<Fitted.rect>
	<Snapped.rect>
```
The first argument of fit is the box you want to fit to. If box is a string it will be treated as a selector and try to look up an element matching the selector

##### fit( box, start, end, snap = 1)

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self @touch.fit(self,0,100)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```

By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
You can use negative values on `start` and `end` as well.

```imba
# [preview=lg]
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
# [preview=lg]
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
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# will flip and center the y axis
	<self @touch.fit(self,[0,50%],[100%,-50%])=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```

### pin [event-modifier] [touch-modifier] [wip]

### round [event-modifier] [touch-modifier]

```imba
# [preview=lg]
import 'util/styles'
css .rect w:calc(100vw - 80px)
# ---
tag Unfitted
	<self @touch.round=(x=e.x)> "box.x {x}"
tag Fitted
	<self @touch.round(2)=(x=e.x)> "box.x {x}"
tag Snapped
	<self @touch.round(0.5)=(x=e.x)> "box.x {x}"
# ---
imba.mount do <>
	<Unfitted.rect>
	<Fitted.rect>
	<Snapped.rect>
```

## Examples

### Custom slider
```imba
# [preview=lg]
import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative rd:sm
# css .track h:4 w:100% bg:blue3 pos:relative rd:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% rd:sm
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

### Pane with divider
```imba
# [preview=md]
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

### Simple draggable [app]
```imba
# [preview=xl]
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1
		bg:white bxs:sm rd:sm cursor:default
		@touch scale:1.02
		@move scale:1.05 rotate:2deg zi:2 bxs:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
```

### Paint [app]

```imba
# [preview=xl]
# ---
const dpr = window.devicePixelRatio

tag app-paint
	prop size = 500
	
	def draw e
		let path = e.$path ||= new Path2D
		path.lineTo(e.x * dpr,e.y * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:blue1]>
			<canvas$canvas[size:{size}px]
				width=size*dpr height=size*dpr @touch.fit(self)=draw>

imba.mount <app-paint>
```





# Intersection Events

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. Imba adds a simplified abstraction on top of this via the custom `intersect` event.

### Properties

| table  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |


### Parameters

The `@intersect` events accepts several arguments. You can pass in an object with the same [root](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root), [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), and [threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/threshold)  properties supported by [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver). 

```imba
<div @intersect=handler> # default options
<div @intersect(root: frame, rootMargin: '20px')=handler>
<div @intersect(threshold: [0,0.5,1])=handler>
```

For convenience, imba will convert certain arguments into options. A single number between 0 and 1 will map to the [threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/threshold) option:
```imba
# n 0-1 adds single threshold at n visibility
<div @intersect(0)=handler> # {threshold: 0}
<div @intersect(0.5)=handler> # {threshold: 0.5}
<div @intersect(1)=handler> # {threshold: 1.0}
```
Any number above 1 will add n thresholds, spread evenly:
```imba
<div @intersect(2)=handler> # {threshold: [0,1]}
<div @intersect(3)=handler> # {threshold: [0,0.5,1]}
<div @intersect(5)=handler> # {threshold: [0,0.25,0.5,0.75,1]}
# ... and so forth
```
An element will map to the [root](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) option:
```imba
<div @intersect(frame)=handler> # {root: frame}
<div @intersect(frame,3)=handler> # {root: frame, threshold: [0,0.5,1]}
```
A string will map to the [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) option:
```imba
<div @intersect("20px 10px")=handler> # {rootMargin: "20px 10px"}
```




### Modifiers [toc-pills]

#### in [event-modifier] [intersect-modifier]

The `in` modifier tells the intersection event to only trigger whenever the visibility has *increased*.

```imba
# Will only trigger when intersection ratio increases
<div @intersect.in=handler>
# Will only trigger when element is more than 50% visible
<div @intersect(0.5).in=handler>
```


#### out [event-modifier] [intersect-modifier]

The `out` modifier tells the intersection event to only trigger whenever the visibility has *decreased*.

```imba
# Will only trigger when element starts intersecting
<div @intersect.out=handler>
# Will trigger whenever any part of the div is hidden
<div @intersect(1).out=handler>
```

#### css [event-modifier] [intersect-modifier]

The css modifier sets a css variable `--ratio` on the event target with the current ratio. Use `.css-somevar` to use a different variable name.

```imba
# Div will have a --ratio variable set to the current intersectionRatio
<div @intersect(10).css> # div will have
# Div will have a --shown variable set to the current intersectionRatio
<div @intersect(1).css-shown>
```

### Examples

#### Carousel

```imba
# [preview=lg]
# ---
import {genres} from 'imdb'

tag Card
	prop shown = 1
	css bg:gray3 d:vflex ja:center c:white rd:md pos:relative

	<self[o:{shown}] @intersect(20)=(shown = e.ratio)>
		<div[fs:xl c:gray8]> data.title
		<div[bg:{data.color} p:1 2 rd:lg]> shown.toFixed(2)

tag App
	css self
		d:hgrid pos:absolute inset:0 gap:4px py:6
		ofx:scroll scroll-snap-type:x mandatory
		.item scroll-snap-align:start w:200px
		@before,@after content:" " d:block w:6

	<self> for item in genres
		<Card.item data=item>
# ---
let app = <App>
imba.mount app
```

#### Using event.ratio

```imba
# [preview=lg]

import {Box} from 'controls'
# ---
tag App
	prop num = 0
	<self[o:{num}]>
		<Box @intersect(self,20)=(num = e.ratio)> "drag"
		<Box[rotate:{num}turn]> "watch"
# ---
imba.mount <App.frame>
```

#### Various thresholds

```imba
# [preview=lg]
import {Box} from 'controls'
# ---
tag App
	<self>	
		<Box @intersect.out.log('outside of viewport')> 'drag'
		<Box @intersect(self).out.log('outside of App')> 'drag'
		<Box @intersect(self,0.5).out.log('halfway')> 'drag'
		<Box @intersect(self,1).out.log('covered')> 'drag'
# ---
imba.mount <App.frame>
```

# Resize Events

The [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) interface reports changes to the dimensions of an Element's content or border box. It has [good browser support](https://caniuse.com/#feat=resizeobserver) and is very useful in a wide variety of usecases. ResizeObserver avoids infinite callback loops and cyclic dependencies that are often created when resizing via a callback function. It does this by only processing elements deeper in the DOM in subsequent frames.

## Properties

| table  |  |
| --- | --- |
| `event.entry` | Returns the [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) |
| `event.rect` | A DOMRectReadOnly object containing the new size of the observed element when the callback is run. |

## Examples

```imba
# [preview=md]
import 'util/styles'
# ---
tag App
	prop box = {}

	<self[d:block inset:0 ta:center]>
		<div[fs:sm]> "Size is {box.width} - {box.height}"
		<textarea[w:100px h:40px resize:both] @resize=(box=e.rect)>

imba.mount <App>
```

# Selection Events

The `@selection` event is a custom event which allows listening for selection changes on a particular element such as a `<textarea>` or `<input>` the event object's `detail` property contains the start and end index of the selection.

```imba
# [preview=md]
import 'util/styles'
# ---
tag App

    start = 0
    end = 0

    def handleSelection e
        start = e.detail.start
        end = e.detail.end

    <self[ta:center fs:sm]>
        <input type="text" @selection=handleSelection value="Select some of this text">
        <div> "Selection from {start} to {end}"

imba.mount <App>
```

# Custom Events



### Trigger Event from method

To trigger a custom event you call `element.emit(name,data = {})`

To trigger a custom event you call `emit` on the element you want to trigger an event from.

```imba
# [preview=md]
import 'util/styles'
# ---
tag App
    def lateTrigger
        setTimeout(&,500) do
            emit('waited',some: 'data')

    <self @waited=console.log('done',e.detail)>
        <button @click=lateTrigger> 'click me'

imba.mount <App>
```

### Trigger event via event listener [preview]

You can use the `emit-eventname` modifier to trigger a custom event directly from an event handler.

```imba
import 'util/styles'
# ---
tag Item
    <self>
        # wait 500ms after click - then emit custom waited event
        <button @click.wait(500).emit-waited([1,2,3])> 'click me'

tag App
    <self>
        # listen to custom waited event
        <Item @waited=console.log('done',e.detail)>

imba.mount <App>
```



