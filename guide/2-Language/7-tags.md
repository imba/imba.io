# Tags

Even though tags are just very thin wrappers around native DOM elements, they do have some functionality that is worth knowing. If you want to deal with the DOM element directly, you can always access that through `tag.dom`. The DOM element also has a reference to its Imba.Tag wrapper, through `domElement:_tag`

```
var element = <div.one.two> "Hello"
element # => Imba.Tag - thin wrapper
element.dom # => HTMLDivElement - real dom element
```

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

## Instances

You can think of the tag syntax as a very consise specialized syntax for creating instances of a certain kind of objects. Just like `[]` is a shorter way to create an array `new Array()`

```imba
var array = [] # shorthand for creating an array
var node = <div> # shorthand for creating a div element

<div.one title='hello'>
# is really just shorthand for
Imba.createElement('div').flag('one').setTitle('hello').end()
```


## Declaring

The real power comes from being able to declare custom tags

## Lifecycle

There are a few methods you can override on custom tags to hook into the lifecycle of a tag. Here we override all these methods in our custom `Example` tag

```imba
tag Example
    def build
        # called once, before properties are set
        # setting an instance variable 'counter'
        @counter = 0

    def setup
        # called once, after properties are set

    def mount
        # called when tag has been added to the document
        # schedule tag (to call tick) every 1000ms
        schedule(interval: 1000)

    def unmount
        # called when tag has been removed from the document
        # unscheduling the tag
        unschedule

    def tick
        # called when/if tag is scheduled and scheduler is active
        # default is to call render
        render

    def render
        # declare inner view
        <self.bar>
            <strong> "Title: {data:name}"
            <em> "Counting {@counter++}"

# Mount an instance of Example - with some data
Imba.mount <Example[{name: "Lifecycle"}]>
```

## Styling

```imba
tag Example
    def something
        # called once, after properties are set

    def render
        <self.bar>
            <button css:background='red'> 'A'
            <strong> "Title: {data:name}"

# Mount an instance of Example - with some data
Imba.mount <Example[{name: "Lifecycle"}]>
```

## Events

There are primarily two ways to listen to events in Imba. You either declare handler methods on your tags named "on{eventname}", or you explicitly bind to events inline when instantiating tags. Here is an example of both:

```imba
tag CustomElement
    def ontap e
        # triggered when tapping instance of CustomElement or its children

    def onsubmit e
        # triggered when a submit event fires somewhere inside custom element

    def someHandler
        # triggered when tapping div.inline

    def render
        <self>
            <form> "Hello"
            <div> "Implicit handler"
            <div.inline :tap.someHandler> "Inline handler"
```

Imba handles all events in the dom through a single manager, listening at the root of your document. Each native event is wrapped in an Imba.Event-instance, which has a few methods worth knowing:

```imba
tag CustomElement
    def onclick event
        event.target # returns the Imba.Tag target for event
        event.native # returns the native DOMEvent
        event.type # returns the type of event, in this case 'click'
        event.prevent # calls preventDefault on the native event
        event.stop # calls stopPropagation on the native event

        # a bunch of methods accessing native event
        event.x # Event:x
        event.y # event.native:y
        event.button # event.native:button
        event.which # event.native:which
        event.alt # event.native:altKey
        event.shift # shiftKey
        event.ctrl # event.native:ctrlKey
        event.meta # event.native:metaKey
```

### Custom events

#### `tag.trigger(name, data = null)`

Custom events will bubble like native events, but are dispatched and processed directly inside the Imba.Event system, without generating a real browser Event. Optionally supply data for the event in the second argument. Here is a rather complex example illustrating several ways of dealing with custom events

```imba
tag Todo < li
    def ontap e
        e.stop
        trigger('itemtoggle',data)

    def render
        <self .done=data:done> 
            <span> data:title
            # since trigger is just another method on Imba.Tag
            # we can use the event binding syntax to directly
            # trigger another event on :tap
            <button :tap.stop.trigger('rename',data)> 'rename'

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

    def renameItem e
        var todo = e.data
        todo:title = window.prompt("New title",todo:title)

    def render
        <self>
            for item in @items
                # directly bind ':rename' on Todo to the renameItem
                # method on this Todos instance
                <Todo[item] :rename.renameItem>

Imba.mount <Todos>
```


## Scheduling

#### `tag.schedule(options)`

Call to activate the scheduler for this tag. The default options are `events: true`. See Imba.Scheduler for other options.

```imba
tag Clock
    def mount
        # when element is inserted in document
        # schedule to re-render every second:
        schedule(interval: 1000)

tag App
    def mount
        # when element is inserted in document
        # schedule to re-render after every handled event
        schedule(events: true)

```

Scheduler has 3 different modes:

* raf - tick on every animation frame - usually 60 fps
* events - tick after any handled dom event / call to Imba.commit
* interval - tick ever n milliseconds

### Imba.commit
