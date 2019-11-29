---
title: Tags
order: 6
---

# Tags

Even though tags are just very thin wrappers around native DOM elements, they do have some functionality that is worth knowing. If you want to deal with the DOM element directly, you can always access that through `tag.dom`. The DOM element also has a reference to its Imba.Tag wrapper, through `domElement:_tag`

```text
var element = <div.one.two> "Hello"
element # => Imba.Tag - thin wrapper
element.dom # => HTMLDivElement - real dom element
```

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

## Instances

You can think of the tag syntax as a very consise specialized syntax for creating instances of a certain kind of objects. Just like `[]` is a shorter way to create an array `new Array()`

```text
var array = [] # shorthand for creating an array
var node = <div> # shorthand for creating a div element

<div.one title='hello'>
# is really just shorthand for
Imba.createElement('div').flag('one').setTitle('hello').end()
```

## Lifecycle

There are a few methods you can override on custom tags to hook into the lifecycle of a tag. Here we override all these methods in our custom `Example` tag

```text
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

## Interface

```text
tag Example
    def interface
        dom # access to the native dom element
```

## Scheduling

When you mount a tag using `Imba.mount`, you shouldn't usually need to think about scheduling.

### Default scheduling

```text
var counter = 0
var status = "Hello"

tag App
    def doSomething
        self

    def loadAsync
        status = "loading"
        Promise.new do |resolve|
            setTimeout(&,500) do
                resolve(status = "loaded")

    def render
        <self.bar>
            <button> "noop"
            <button :tap.doSomething> "handle" 
            <button :tap.loadAsync> "async"
            <div> "Rendered: {++counter}"
            <div> "Status: {status}"

# when mounting a node with Imba.mount it will automatically
# be scheduled to render after dom events and Imba.commit
Imba.mount <App>
```

Even though most changes to the state of your application will happen as a result of user interactions, there are still a few places you need to notify Imba that things have changed. E.g. if you receive data from a socket you want to call `Imba.commit` after receiving messages `socket.addEventListener('message',Imba:commit)`, and if you are fetching data from a server outside of event handlers, you want to call Imba.commit at the end of the fetch.

### Rendering every frame

```text
tag App
    def mount
        schedule(raf: true)

    def onmousemove e
        @x = e.x
        @y = e.y

    def render
        <self.bar>
            <div> "Mouse is at {@x or 0} {@y or 0}"

Imba.mount <App>
```

### Rendering at intervals

```text
tag Clock
    def mount
        schedule(interval: 1000)

    def render
        <self> Date.new.toLocaleString

Imba.mount <Clock>
```

