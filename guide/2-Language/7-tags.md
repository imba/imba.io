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

