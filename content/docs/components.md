# Components

Components are reusable elements with functionality and children attached to them. Components are _just like regular classes_ and uses all the same syntax to declare properties, methods, getters and setters. To create a component, use the keyword `tag` followed by a component name.

```imba app.imba
# [preview=md]
import {Draggable} from './draggable'

tag App
    <self[inset:0 d:hflex ja:center]>
        <Draggable[hue:blue]> 'One'
		<Draggable[hue:sky]> 'Two'
        <Draggable[hue:indigo]> 'Three'
        <Draggable[hue:purple]> 'Four'

imba.mount <App>
```

```imba draggable.imba
export tag Draggable
	css pos:relative d:flex ja:center
		rd:md bg:hue3 c:gray9/70 
		w:24 h:10 m:1 px:4 fs:sm
        cursor:grab

	prop x = 0
	prop y = 0

	<self[x:{x}px y:{y}px] @touch.moved.sync(self)> <slot> "box"
```


### Global Components
```imba
tag app-component
    # add methods, properties, ...
```
Components with lowercased names containing at least two words separated by a dash are compiled directly to global [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). These components are registered globally and are available anywhere in your project (as long as the file has been imported at least once).


### Local Components
```imba
export tag AppComponent
	# methods, properties, ...
```
Components whose name begins with an uppercase letter are considered local components. They act just like web components, but are not registered globally, and must be exported + imported from other files to be used in your project. Very useful when you want to define custom components that are local to a subsystem of your application.

## Rendering content

## Named Elements [preview=md]

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.

```imba
import 'util/styles'

# ---
tag app-panel
    <self.group>
        <button @click=($name.value += 'Hi')> "Write"
        <input$name type='text'>
# ---

imba.mount <app-panel>
```

In the code above, `$name` is available everywhere inside `app-panel` component, but also from outside the app-panel as a property of the component.

## Declaring Attributes [wip]