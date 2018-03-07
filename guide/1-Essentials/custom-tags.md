---
title: Custom Tags
order: 3
---

# Custom Tags

## Declaring Tags

You can easily define your own tags / components, as easily as creating classes. They are similar to components in react. Tags are defined with the `tag` keyword:

```imba
tag App
    # custom instance methods, properties etc

# create an instance of app - just like any other tag
let app = <App.main> <h1> "Hello"
```

Your custom tags will by default inherit from ‘div’, but they can inherit from any tag. You can also define instance methods on them.

```imba
# define a custom tag, inheriting from form
tag RegisterForm < form
    def onsubmit event
        # declare handlers as methods
        console.log "submitted"

    def someMethod
        console.log "hello"
        self

# create an instance of app - just like any other tag
let form = <RegisterForm>
form.someMethod # => "hello"
```

> When you declare `tag SomeComponent` you are declaring a new tag *type*, not an instance. It is exactly the same as declaring a new `class SomeClass` . `<SomeComponent>` creates a new *instance* of this tag, just like `SomeClass.new` creates a new instance of said class.


## Custom Rendering

Just like components in react, you can declare how custom tags should render, by declaring a render method:

```imba
# define a custom tag, inheriting from form
tag App
    def render
        <self> <h1> "Hello world"

let app = <App.main>
# The DOM tree of app is now:
# <div class='App main'><h1>Hello world</h1></div>
```

> `<self>` inside render deserves some explanation. In Imba, instances of tags are directly linked to their real DOM element. `<self>` refers to the component itself, and is a way of saying "now I want the content inside self to look exactly like the following. This is important to understand.

```imba
tag Wrong
    def render
        <h1> "Hello {Math.random}"

let wrong = <Wrong>
# wrong.render would now simply create a new h1 element
# every time it is called. The DOM element of wrong will
# still have no children.

tag Right
    def render
        <self> <h1> "Hello {Math.random}"
let right = <Right>
# right.render will now update its own DOM tree every time
# it is called, ensuring that the DOM is in fact reflecting
# the view declared inside <self> 
```


## Inheritance

Custom tags can inherit from other custom tags, or from native tags. E.g. if you want to create a custom form component, you can simply inherit from form:

```imba
tag RegisterForm < Form

let view = <RegisterForm>
# the DOM element of view is now of type form.
# html: <form class='RegisterForm'></form>
```


## Properties

```imba
# define a custom tag, inheriting from form
tag App
    # declaring custom properties

    prop slug

    def render
        <self>
            <h1> "Slug is: {slug}"
            if slug == '/home'
                <div> "You are home"

Imba.mount <App slug='/home'>
```

