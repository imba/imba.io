# Custom Elements

```imba
# ~shared
css body = p:5

```

Components are reusable elements with functionality and children attached to them. Components are *just like regular classes* and uses all the same syntax to declare properties, methods, getters and setters. To create a Component, use the keyword `tag` followed by a component name according to web-component's custom component naming convention. It must contain at least two words separated by a dash. 

```imba
tag app-component
    # add methods, properties, ...
```

These components are compiled to [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and are *global* in your project. As long as you have imported the component *somewhere in your code*, you can create instances of the component anywhere.

## Local Components

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

## Declaring content

```imba
# ~shared
css body = p:5
css div = p:5 bg:gray3

```

The first thing you usually add to a component is a `render` method somewhere in the class body that declares what the content of the component should be.

```imba
tag app-component
    ~focus[def render
        <self> <div> "My component"]~
```

Because rendering is such a common pattern you can also just include a `<self>` tag directly inside the class body.

```imba
tag app-component
    ~[<self> <div> "My component"]~
```

Components in imba are deceivingly similar to components in React. In Imba, a component is an actual *real* dom element with custom functionality and content. While calling `render` on a react component creates and returns a new virtual DOM tree every time – calling `render` in imba actually mutates real dom elements. The `<self>` inside render represents the component node itself.


# Slots

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
css app-panel
	d:block m:3 b:gray2 t:sm
	& header = p:1 bg:gray3
	& main = p:3 t:md
	& footer = p:1 bg:gray1

# ---
tag app-panel
    <self>
        <header> ~[<slot name="header"> "Panel"]~
        <main> ~[<slot> <p> "Nothing here"]~
        <footer> ~[<slot name="footer"> "Footer"]~

imba.mount do <div> <app-panel>
    ~[<div for="header"> "Custom header"
    <div> "Something in main slot"
    <div> "More in main slot"]~
```

# References

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.
```imba
tag app-panel
    <self> <~[input$name]~ type='text'>
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

# Lifecycle

[Article](/articles/lifecycle.md)