---
title: Closer Look at Tags
order: 6
---

# Closer Look at Tags

Even though tags are just very thin wrappers around native DOM elements, they do have some functionality that is worth knowing. If you want to deal with the DOM element directly, you can always access that through `tag.dom`

```
var element = <div.one.two> "Hello"
element # => Imba.Tag - thin wrapper
element.dom # => HTMLDivElement - real dom element
```


### Lifecycle

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
        <self>
            <h1> "Title: {data:name}"
            <h3> "Counting {@counter++}"

# Mount an instance of Example - with some data
Imba.mount <Example[{name: "Lifecycle"}]>
```

### Methods

Access the raw DOM Element for this tag.

#### `tag.flags`

Returns the dom.classList

#### `tag.data`

Returns the data bound to this tag.

#### `tag.render`

Does nothing by default. Override to do custom rendering.

#### `tag.trigger(name, data = null)`

Trigger custom event on this tag. Events will bubble like native events, but are dispatched and processed directly inside the Imba.Event system, without generating a real browser Event. Optionally supply data for the event in the second argument.

```
tag CustomList < ul
    def select item
        trigger('listselect',item)
```

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

#### `tag.unschedule`

Deactivate the scheduler for this tag.

### Flagging

### Styling

#### `tag.css(name)`

Returns value of inline style named `name`

#### `tag.css(name, value)`

Setting styles
```imba
var node = <div>
# with key and value
node.css('display','block')
# with object
node.css(display: 'block', position: 'absolute')

<div css:display='block'>
# inline styles are actually using the css-method
# Imba.createElement('div').css('display','block').end()
```
