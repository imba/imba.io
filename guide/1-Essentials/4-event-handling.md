---
title: Event Handling
order: 4
---

# Event Handling

## Listening to Events

We can use `<tag :eventname=handler>` to listen to DOM events and run code when they’re triggered.

```imba
tag App
    prop counter
    def render
        <self>
            <div> "count is {counter}"
            # handler will be called when clicking button
            <button :click=(do counter++)> "Increment"

Imba.mount <App counter=0>
```

In the example above we declared the handler inline. Usually it is better to define the handlers outside of the view, and decouple them from the event itself. This can be done in several ways.

## Resolving Handlers 

You can also supply a string as the handler (`<div :click="doSomething">`). In this case, Imba will look for the handler by traversing up the DOM tree and call getHandler on each node, until a handler is returned. The method looks like this:

```imba
def getHandler handlerName
    if self[handlerName + "Modifier"] isa Function
        return self[handlerName + "Modifier"]
    if self[handlerName] isa Function
        return self
    elif @data and @data[handlerName] isa Function
        return @data
```

This means that if you have defined methods on your custom tags, you can refer to these methods:

```imba
tag App
    prop counter
    def increment
        counter++

    def render
        <self>
            <div> "count is {counter}"
            <button :click='increment'> "Increment"

Imba.mount <App counter=0>
```

Taking this one step further, since binding events is such an integral part of developing web applications, Imba has a special syntax for this. You can chain event handlers (and modifiers -- see below) directly:

```
# increment handler will be called upon click
<button :click.increment>
# these can also take arguments
<button :click.increment(2)>
```


```imba
tag App
    prop counter

    def increment
        counter++
        
    def change amount = 0
        counter += amount

    def render
        <self>
            <div> "count is {counter}"
            <button :click.increment> "Increment"
            <button :click.change(2)> "Increment by 2"

Imba.mount <App counter=0>
```


## Event Modifiers

Inspired by vue.js, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers never need to know about the event in the first place.

```
# call preventDefault on the submit-event, then call doSomething
<form :submit.prevent.doSomething>
```

> What is the difference between a modifier and a handler in this case? There isn't really a difference. In fact, the modifiers are implemented as methods on element, and you can define custom modifiers as well.

* .bubble
* .prevent
* .stop
* .self
* .silence

### Guards
* .left
* .right
* .middle


## Key Modifiers

For keyboard events (keydown, keyup, keypress) there are also some very handy modifiers available.
```
# trigger addItem when enter is pressed
<input type='text' :keydown.enter.addItem>

# multiple handlers for the same event is allowed
# trigger gotoPrev/gotoNext when pressing up/down keys
<div :keydown.up.gotoPrev :keydown.down.gotoNext>
```
 
* .left
* .right
* .up
* .down
* .enter
* .tab
* .esc
* .space
* .del

## System Modifier Keys

* .ctrl
* .alt
* .shift
* .meta

```
# only trigger when ctrl is pressed
<button :click.ctrl.myHandler>

# only trigger when shift is pressed
<button :click.shift.myHandler>

# the order of modifiers matters;
# always prevent default action, but only trigger myHandler if alt as pressed
<button :click.prevent.alt.myHandler>
```

## Mouse Button Modifiers

* .left
* .right
* .middle

## Chaining Modifiers


> Because it is by far the most common case, event propagation is stopped when an event is actually handled. So, you must add the .bubble modifier if you want them to travel further.

