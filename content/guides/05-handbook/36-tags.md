# Components

## Web Components

Components are reusable elements with functionality and children attached to them. Components are *just like regular classes* and uses all the same syntax to declare properties, methods, getters and setters. To create a Component, use the keyword `tag` followed by a component name according to web-component's custom component naming convention. It must contain at least two words separated by a dash. 

```imba
tag app-component
    # add methods, properties, ...
```

These components are compiled to [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and are *global* in your project. As long as you have imported the component *somewhere in your code*, you can create instances of the component anywhere.

## Local Components

Custom Elements that start with an uppercase letter is treated as a local component.

Sometimes you want to define custom components that are local to a subsystem of your application. Other parts don't need to know about it, and you definitely don't want it to cause collisions with other parts.
```imba
tag Header
    <self> "App header"

tag App
    <self>
        <Header>
        <main> "Application"
```

As opposed to web components, local components must be exported and imported in the files where they are actually used.

## Functional Components

Any method can essentially act like a component in Imba.

```imba
def app-list items
    <ul> for item in items
        <li> item

const array = [1,2,3]
imba.mount do <div> app-list(array)
```

# Using Slots

Sometimes you want to allow taking in elements from the outside and render them somewhere inside the tree of your component. `<slot>` is a placeholder for the content being passed in from the outside.

##### Basic slot
```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot>]~

<app-option>
    ~[<b> "Option name"
    <span> "Description for this option"]~
```

Anything inside the `<slot>` will be shown if no content is supplied from outside.

```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot> "Unnamed option"]~
<app-option>
```
You can also add named slots using `<slot name=...>` and render into them using `<el for=slotname>` in the outer rendering.
```imba
# ~preview
css app-panel
	d:block m:3 b:gray2 t:sm
	& header = p:1 bg:gray3
	& main = p:3 t:md
	& footer = p:1 bg:gray1

# ---
tag app-panel
    <self>
        <header> ~[<slot name="header"> "Default Header"]~
        <main> ~[<slot> <p> "Default Body"]~
        <footer> ~[<slot name="footer"> "Default Footer"]~

imba.mount do <div> <app-panel>
    ~[<div slot="header"> "Custom Header"
    <div> "Something in main slot"
    <div> "More in main slot"]~
```

# Named Elements

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.
```imba
tag app-panel
    <self> <input~hl[$name]~ type='text'>
```
In the code above, `$name` will be available everywhere inside `app-panel` component.
```imba
tag app-panel
    def write
        $name.value = 'something'

    <self>
        <input$name type='text'>
        <button @click=write> "write"
```

It can also be accessed from outside `app-panel` as a property
```imba
tag app-panel
    <self> <input$name type='text'>

let app = <app-panel>
console.log ~[app.$name]~
```

# Scheduling

# Lifecycle

## Lifecycle Hooks

These methods are meant to be defined in your components. In most cases you will only define a `render` method, and possibly `awaken` if you want to do some additional initialization when the element is first attached to the document.

| table  |  | |
| --- | --- | --- |
| `build` | Called before any properties etc are set | |
| `hydrate` | Called before awaken if element is not hydrated | |
| `dehydrate` | Called before serializing when rendering on server | |
| `awaken` | Called the first time the component is mounted | |
| `mount` | Called when the component is attached to the document | |
| `unmount` | Called when the component is detached from the document | |
| `render` | Called by both visit and tick | |
| `rendered` | Called after every `render` | |

## Lifecycle States

Components also has a bunch of methods that you can call to inspect where in the lifecycle a component is:

| table  |  |
| --- | --- |
| `hydrated?` | Is this element created on the client (by imba) or has it been rehydrated? |
| `awakened?` | Called the first time the tag is mounted |
| `mounting?` | Is component in the process of being mounted? |
| `mounted?` | Is component attached to the document? |
| `render?` | Should component render? |
| `rendered?` | Has component been rendered? |
| `scheduled?` | Is component scheduled? |

## Advanced Hooks

In some special cases you might want to go further and override the default behaviour of Imba.

| table  |  |
| --- | --- |
| `tick` | Called on every imba.commit when component is scheduled |
| `visit` | Called when parent element is rendered |
| `commit` | Called by both visit and tick |

## Hydration

- When will hydrate be called?
- When will dehydrate be called?

## Examples

##### Setup timer
```imba
tag app-clock
    def mount
        # call render every second
        $timer = setInterval(render.bind(self),1000)
    
    def unmount
        # remember to clear interval when tag unmounts
        clearInterval($timer)

    # if you _only_ want the clock to render via timer
    # and not when the parent element renders - we also
    # need to override visit
    def visit
        return
```
- Setting up a timer in mount and clearing it in unmount

##### Override visit
```imba
tag app-clock
    def visit
        commit! unless scheduled?
```

## More

- Would be nice to have a hook for doing things on the first mount only.
- Do something after the first render only?
- Clarify the order of things happening. When is render first called?
- Want one hook that is only called when 
- When are components _not_ scheduled?
- Explain visit, outer render, internal render, and the order
- Clock is a good example to step through many of the lifecycle states
- Add support for scheduling with timer and/or RAF

# Hydration

# Managing State