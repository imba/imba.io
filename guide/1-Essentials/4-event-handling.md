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
        <self.bar>
            # handler will be called when clicking button
            <button :click=(do counter++)> "Increment"
            <div> "count is {counter}"

Imba.mount <App counter=0>
```

In the example above we declared the handler inline. Usually it is better to define the handlers outside of the view, and decouple them from the event itself. This can be done in several ways.

## Resolving Handlers 

You can also supply a string as the handler (`<div :click="doSomething">`). In this case, Imba will look for a method of that name on the current context (self). This means that if you have defined methods on your custom tags, you can refer to these methods. Since binding events is such an integral part of developing web applications, Imba also has a special syntax for this.

```imba
tag App
    prop counter

    def increment
        counter++

    def step amount
        counter += amount

    def render
        <self.bar>
            # inline handler
            <button :click=(do counter++)> "+1"
            # reference to a method on self
            <button :click='increment'> "+1"
            # reference with arguments
            <button :click=['step',2]> "+2"
            # shorthand reference
            <button :click.increment> "+1"
            # shorthand reference with arguments
            <button :click.step(3)> "+3"

            <div> "count is {counter}"

Imba.mount <App counter=0>
```

> `tap` is an alias for `click` that works across mobile, tablets, and desktops.

## Event Modifiers

Inspired by vue.js, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers never need to know about the event in the first place.

```
# call preventDefault on the submit-event, then call doSomething
<form :submit.prevent.doSomething>
```

> What is the difference between a modifier and a handler in this case? There isn't really a difference. In fact, the modifiers are implemented as methods on element, and you can define custom modifiers as well.

* `.stop` - stops event from propagating
* `.prevent` - calls preventDefault on event
* `.silence` - explicitly tell Imba not to broadcast event to schedulers
* `.self` - only trigger subsequent handlers if event.target is the element itself

### Key Modifiers

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

### System Modifier Keys

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

### Mouse Button Modifiers

* .left
* .right
* .middle

## Declaring default handlers

When an event is processed by Imba, it will also look for an `on(eventname)` method on the tags as it traverses up from the original target.

```
tag App
    def onsubmit e
        e.prevent
        window.alert('Tried to submit!')

    def render
        <self>
            <form>
                <input type='text'>
                <button type='submit'> "Submit"

Imba.mount <App>
```


## Custom events

#### `tag.trigger(name, data = null)`

Custom events will bubble like native events, but are dispatched and processed directly inside the Imba.Event system, without generating a real browser Event. Optionally supply data for the event in the second argument. Here is a rather complex example illustrating several ways of dealing with custom events

```imba
tag Todo < li
    def clickRename
        trigger('itemrename',data)

    def clickTitle
        trigger('itemtoggle',data)

    def render
        <self .done=data:done> 
            <span :tap.clickTitle> data:title
            <button :tap.clickRename> 'rename'

tag Todos < ul
    def setup
        @items = [
            {title: "Remember milk", done: false}
            {title: "Test custom events", done: false}
        ]

    # the inner todo triggers a custom itemtoggle event when tapped
    # which will bubble up and eventually trigger onitemtoggle here
    def onitemtoggle e
        e.data:done = !e.data:done

    def onitemrename e
        var todo = e.data
        todo:title = window.prompt("New title",todo:title)

    def render
        <self> for item in @items
            <Todo[item]>

Imba.mount <Todos>
```