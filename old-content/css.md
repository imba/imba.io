---
title: Styles
multipage: true
---

# Syntax

## Selectors

```imba
css .btn
    position: relative
    display: block
    background: #b2f5ea
    padding-left: 4px
    padding-right: 4px

css .btn@hover
    background: #81e6d9
```

Styles are declared using the `css` keyword. Besides using indentation instead of `{}`, making `;` optional, and using `@pseudo` instead of `:pseudo` it looks like regular css. Line breaks are also optional. The following few snippets might look messy at first glance, but bear with us.

```imba
css .btn
    display:block background:#b2f5ea padding-left:4px padding-right:4px
css .btn@hover
    background: #81e6d9
```

We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties, as well as additional properties covering common usecases:

```imba
css .btn
    d:block pl:4px pr:4px bg:#b2f5ea
css .btn@hover
    bg:#81e6d9
```

We also want to make it easy to follow a consistent design system throughout your project while not enforcing a predefined look and feel. Imba provides default (but configurable) colors, fonts, size units and more to help enforce consistency:

```imba
css .btn
    d:block px:1 bg:teal2
css .btn@hover
    bg:teal3
```

Rules can also be written on a single line

```imba
css .btn d:block px:1 bg:teal2
css .btn@hover bg:teal3
```

There are also some patterns that come up again and again in css. Changing a few properties on `hover` or other states, or setting certain dimensions for specific screen sizes etc. Imba got you covered with property modifiers that we will get into later. But to round up, the first block of css here would usually be written like this in Imba:

```imba
css .btn d:block px:1 bg:teal2 bg@hover:teal3
```

This conciseness comes especially handy when declaring inline styles, which we will come back to later.


### Nested Selectors

Styles can also be nested. Everything before the first property on new lines are treated as nested selectors.

```imba
css .card
    display: block
    background: gray1
    .title color:blue6 # matches .card .title
    h2.desc color:gray6 # matches .card h2.title
    # to scope in on current item use &
    &.large padding:16px # matches .card.large
```

### Global Selectors

A problem with CSS is that often end up with tons of globally competing styles spread around numerous files. Changing some styles in one place might affect some seemingly unrelated elements. In Imba it is really easy to declare styles that should only apply to certain parts of your application.

By default, any style rules declared at the top level of your file using `css selector ...` will only apply to the elements declared inside that file. The `button` style above will only affect literal `button` tags rendered **in the same file**. This means that you can declare styles like this in your file without having to worry about affecting styles in other parts of your application, or even inside nested components that are defined in other files, but used here.

```imba
css button
    position: relative
    display: block
    background: #b2f5ea

# rest of file ...
```

If you prefix your css declaration with the `global` keyword - the styles will apply globally, and in this example affect all `button` elements in your application. The styles will be included as long as they are required somewhere.

```imba
global css button
    position: relative
    display: block
    background: #b2f5ea

# rest of file ...
```

## Modifiers [wip]

```imba
# in selectors
css button@hover
    bg:blue
# in properties
css button
    bg@hover:blue
# after properties
css button
    bg:white @hover:whitesmoke @focus:blue
```

### Pseudo-classes

Pseudo-classes (`:hover`, `:apactive`, ...) from css are supported using an `@` instead of the leading `:`. So the css selector `div:hover` is written as `div@hover` in Imba. In Imba you can also use pseudo-classes directly on properties:

```imba
css div
    opacity:0.9
    opacity@hover:1
```
If you add a `@pseudoclass:value` on the same line as a regular property, it will set the value of the last property, with the pseudo-class applied:

```imba
css div opacity:0.8 @hover:0.9 @focus:1
```
In addition to the default pseudo-classes from css, Imba supports several convenient additions like [@focin](css).

### Class Modifiers [wip]

### Custom Breakpoints [wip]


## Scoped Styles [preview=lg]

If you declare style rules inside `tag` definitions, all the styles will magically only apply to elements inside of this component.

```imba
# ~preview=lg
# these are global -- applies to everything in project
# ---
tag app-card
    css fs:sm rd:md d:vflex bg:teal1 c:teal7
    css .header bg:teal2/50 p:3
    css .body p:3

    <self>
        <.header> "Card Header"
        <.body> <p> "Card Paragraph"

tag app-root
    # local styles does not leak into app-card
    css .header bg:green3 p:4 fw:600

    <self>
        <.header> "App Header"
        <app-card>
        <app-card>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```

Any style you declare in a tag declaration will only ever affect the literal tags inside the declaration. You don't need to worry about affecting styles of deeply nested elements that might share the same class names. This is very practical, and allows us to safely use short and descriptive class names like `header`, `footer`, `body`, `content` etc, and use them for styling.

### Inherited styles

Scoped styles are also inherited when extending components, which makes it very powerful.

```imba
# ~preview=lg
import 'util/styles'
# these are global -- applies to everything in project
css @root ta:center
# ---
tag base-item
    css d:block m:2 p:3 bg:gray2
    css h1 fs:lg fw:600 c:purple7
    <self>
        <h1> "Heading"
        <p> <slot> "Description"

tag pink-item < base-item
    css bg:pink2
    css h1 c:pink7

tag custom-item < pink-item
    <self>
        <h1> "Heading"
        <p[fw:bold]> <slot> "Description"
        <div> "Show more..."

imba.mount do <div>
    <base-item> "Base item"
    <pink-item> "Pink item"
    <custom-item> "Custom item"
```

### Deep Selectors

```imba
# ~preview=lg
# ---
tag app-item
    <self> <p> "Normal"

tag app-root
    css p fw:600
    <self>
        <div> <p> "Bold"
        <div innerHTML='<p>Normal<p>'>
        <div> <app-item>

# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```

As you can see in the example above, the literal `<p>` inside `app-root` is styled by the scoped rule, while the `<p>` inside the nested `<app-item>`, and the `<p>` generated via innerHTML are _not_ styled. There are some cases where you don't want this strict scoping though. Imagine a component that renders markdown or really need to override styles for nested components.

The `>>>` operator _escapes_ the literal confines of the tag.

```imba
# ~preview=lg
# these are global -- applies to everything in project
tag app-item
    <self> <p> "Not bold"
# ---
tag app-root
    css div p fw:600
    css div >>> p c:blue6

    <self>
        <div> <p> "Literal"
        <div> <app-item>
        <div innerHTML='<p>Generated<p>'>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```

The `>>` operator styles immediate children, just like the `>` operator, but it also targets non-literal immediate children.

```imba
# ~preview=lg
# these are global -- applies to everything in project
tag app-item
    <self> <p> "Nested Paragraph"
# ---
tag app-root
    css div p fw:600
    css div >> p c:blue6

    <self>
        <div> <p> "Literal"
        <div> <app-item>
        <div innerHTML='<p>Generated<p>'>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```


## Inline Styles

You can add inline styles on any element using `[style-properties]` syntax. Think of this as an inlined anonymous class with a bunch of css properties. Instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to elements directly:

```imba
<div[position:relative display:flex flex-direction:row padding:2rem]>
```

This might look like regular inline styles, but with abbreviations and modifiers they become much more powerful and expressive:

```imba
# More padding on large screens:
<div[pos:relative d:flex fld:row p:2 @lg:3]>
# Darker background color on hover:
<button[bg:gray2 @hover:gray3]> "Click me"
# Set text color when input is focused:
<input[color@focus:blue7]>
```

Since inline styles are essentially anonymous classes, they can also be applied conditionally:

```imba
# line-through and lighter color if item is done
<div[p:2 color:green9] [td:s c:gray4]=item.done>
```

#### Interpolation

It is also possible to interpolate dynamic values into styles. This happens efficiently at runtime using css variables behind the scenes. This allows you to even write dynamic styles in a declarative manner.

```imba
# ~preview
css div pos:absolute p:3 t:2 l:2
css section d:block pos:absolute inset:0 user-select:none

# ---
let ptr = {x:0, y:0}
let num = 0
imba.mount do
    <section @pointermove=(ptr = e) @click=(num++)>
        <div[bg:teal2 x:{ptr.x} y:{ptr.y} rotate:{ptr.x / 360}]> "Full"
        <div[bg:purple2 x:{ptr.x / 2} y:{ptr.y / 2} rotate:{num / 45}]> "Half"

```

##### Specifying units

When you want to interpolate values with units you can include units after `{expr}` like `{expr}px`,`{expr}%` etc.

```imba
# ~preview
css div p:2 m:2 overflow:hidden min-width:80px

# ---
let ptr = {x:0, y:0}
imba.mount do
    <section[d:block pos:absolute inset:0] @pointermove=(ptr = e)>
        <div[bg:indigo2 w:{20 + ptr.x / 5}%]> "% width"
        <div[bg:green2 w:{ptr.x}px]> "px width"

```

##### Tip! Set properties directly [tip]

You can definitely use interpolated values with css variables as well, but it is best to interpolate them directly at the value where you want to use it. This way Imba can include the correct default unit if none is provided and more.

## Variables

## Units

You can define your own unit that can be used for styling and calculations. The unit can have modifiers like break points and you can use the units in the same way as other css units. The syntax to define a custom unit is `<measure><name>: <value>` e.g. `1col: calc(100vw / 12)`.

```imba custom-unit.imba
global css @root
    1pad: 25px
    1col: calc(100vw / 12)

tag app-dialog
    css 
        width: 12col @md: 6col lg: 3col # span 12 columns by default, 6 colums at >768px viewports and 3 columns on >1280px viewports.
        p: 1pad
```


## Interpolation

## Keyframes

Keyframes are declared with `css @keyframes name` syntax. They work just like keyframes in css.

```imba
# to declare an anim available everywhere - use global
global css @keyframes blink
	0% c:white
	100% c:blue

# non-global animations are only available in the file
css @keyframes blink
	0% c:white
	100% c:blue
```

### Overriding animations in selector [preview=lg]

One improvement over standard css is that you can define keyframes inside other selectors, and thereby override default animations of the same name.

```imba
# We have a global blink animation
global css @keyframes blink
	0% c:white
	100% c:blue
# animate all links on hover
global css a
	d:block bg:gray2 rd:md m:2 p:2
	@hover animation: blink 2s

# Override blink animation just inside #header .item
css #header a
	@keyframes blink
		from opacity:0
		to opacity:1

imba.mount do <div[pos:absolute inset:0 d:flex ja:center]>
	<a> "changing color"
	<div#header> <a> "fading"
```

# Properties

Imba supports all regular css properties. For a full reference on all css properties we recommend visiting the MDN docs. There are some custom properties and shorthands added in Imba that are very valuable. There are also a configurable design system (inpsired by Tailwind) built in. Among other things, this features non-standard values for [box-shadow](css), [border-radius](css), [transition-timing-function](css), as well as [color](css) palettes. The custom [hue](css) property is especially useful..

<api-styleprop-list></api-styleprop-list>

# Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down. See the [guide](/css/syntax#modifiers) for additional details.

### Syntax

```imba
# in selectors
css button@hover
    bg:blue
# in properties
css button
    bg@hover:blue
# after properties
css button
    bg:white @hover:whitesmoke @focus:blue
```

### Class Modifiers

Classes can also be used as modifiers:

```imba
css button c:white bg.primary:blue
# is the same as
css button c:white
    .primary bg:blue
```

## Reference

### Media Modifiers

<api-stylemod-list data-group="media"></api-stylemod-list>

### Breakpoints

<api-stylemod-list data-group="breakpoint"></api-stylemod-list>

### Pseudo-classes

<api-stylemod-list data-group="pseudoclass"></api-stylemod-list>

### Pseudo-elements

<api-stylemod-list data-group="pseudoelement"></api-stylemod-list>

### Special Modifiers

<api-stylemod-list data-group="custom"></api-stylemod-list>



# Breakpoints

With Imba, you don't need to handle your breakpoints inside a media query at the bottom of your style sheet. You can apply breakpoint values *inline* with your other styles, and they will be compiled into media queries at build time.

## Predefined Breakpoints

Imba has 10 predefined breakpoint modifiers. Five for min-width breakpoints and five for max-width breakpoints.
```imba
@xs # -> @media (min-width: 480px){ sel {...} }
@sm # -> @media (min-width: 640px){ sel {...} }
@md # -> @media (min-width: 768px){ sel {...} }
@lg # -> @media (min-width: 1024px){ sel {...} }
@xl # -> @media (min-width: 1280px){ sel {...} }
```
The max-width modifiers use the `lt-` prefix, which stands for "less than."
```imba
@lt-xs # -> @media (max-width: 479px){ sel {...} }
@lt-sm # -> @media (max-width: 639px){ sel {...} }
@lt-md # -> @media (max-width: 767px){ sel {...} }
@lt-lg # -> @media (max-width: 1023px){ sel {...} }
@lt-xl # -> @media (max-width: 1279px){ sel {...} }
```

## Defined Breakpoints

You can set your own custom pixel breakpoints by specifying any number you want after the `@` or `@!` symbols.
`@` for min-width, and `@!` for max-width.


```imba
@700 # -> @media (min-width: 700px)
@!650 # -> @media (max-width: 650px)
```

### Tagged templates [tip]

At the moment, the _defined breakpoint modifier_ does not support other unit types nor specifying the `px` unit type. Any number provided will be assumed to be a pixel value.

## How to use breakpoint modifiers

You may use these breakpoint modifiers in a few different ways.

### Property Breakpoint Modifier

If you will only use a property for a breakpoint, you may modify the property directly with the modifier.
```imba
css .card
	pl@md:1em 
```
```imba
<div.card[pl@md:1em]> # inline with element
```

### Value Breakpoint Modifier

If you will use a single property across multiple breakpoints, you may use multiple breakpoint modifiers in the same line followed by the desired breakpoint value.
```imba
tag App
	css .card
		pl: 0.8em @md:1em @lg: 1.2em
	def render
		<self>
			<.card>
<div.card[pl: 0.8em @md:1em @lg: 1.2em]>
```
### Breakpoint Modifier Block

Suppose you would instead organize your responsive styles by breakpoints rather than properties. In that case, you may place properties within the breakpoint modifier either in single-line or multi-line form.
```imba
css .card
	pl: 0.8em
	@md pl: 1em c:red4 # in one line
	@lg	
		pl: 1.2em # in multiple lines
		c:purple4 # in multiple lines
```

The above syntax cannot be used in inline styles, but you could nest the entire declaration within an element inside your render method, and it will be compiled as an inline style, and it will support dynamic values.
```imba
tag App
	def render
		<self>
			<.card>
				css 
					pl: 0.8em # default value below medium.
					@md pl: 1em # above medium (768px)
					@lg pl: 1.2em # above large (1024px)
				<h2> "..."
				<p> "..."
				
```
Breakpoint blocks are not as succint as inline breakpoint modifiers, but it might add maintenance value for some.


# Colors

[demo](/examples/css/colors.imba?preview=styles)

The color CSS data-type represents a color in the sRGB color space. Colors can be defined in all the same ways as in plain css. In addition, imba as built-in support for named colors hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). All named colors come in 10 different shades, named from `color0` up to `color9`. You can hover over each color below to see their name:

<doc-colors></doc-colors>

Just like other colors like `#7A4ACF`, `hsl(120,90%,45%)`, `rgba(120,255,176)`, these named colors can be used anywhere in your styles where a color value is expected.

# - Customizing Colors [wip]
## Color Theming

Imba already contains color keywords, but you may also create aliases for color keywords, make your own keywords, or redefine the default keywords to new color values.

## Create config file

Create an `imbaconfig.json` at the root of your imba project. Right next to your package.json and readme.md files.

and create a `"theme":{}` object with a `"colors":{}` object within it.

```json
{
	"theme": {
		"colors": {			
		}
	}
}
```

> Any changes made to the imbaconfig.json file will require you to restart your localhost server to take effect.

### Create Aliases

We can create an alias for the `indigo` color called `primary` in this way.

```json
{
	"theme": {
		"colors": {			
			"primary": "indigo"
		}
	}
}
```

Now we can use `primary` instead of `indigo` to set the indigo color.

```
<h1[c:primary4]> "hello world!"
```

We can also override default color keywords. We can make `gray` an alias for `warmer` instead of the default gray colors.

```json
{
	"theme": {
		"colors": {			
			"gray": "warmer"
		}
	}
}
```

### Create Color Keywords

We can create our own color keywords with specified tint values.

```json
{
    "theme": {
        "colors": {
            "coral": {
                "0": "hsl(40,33%,98%)",
                "1": "hsl(28,61%,94%)",
                "2": "hsl(12,62%,88%)",
                "3": "hsl(10,54%,76%)",
                "4": "hsl(6,56%,65%)",
                "5": "hsl(5,49%,54%)",
                "6": "hsl(4,49%,44%)",
                "7": "hsl(4,50%,34%)",
                "8": "hsl(4,50%,24%)",
                "9": "hsl(6,52%,15%)"
            }
        }
    }
}
```

We will then be able to use our own color keyword as we would use the default color keywords.

```
<h1[c:coral7/70]> "hello world!"
```

Any unspecified tint will be interpolated automatically. So the configuration below will produce a similar result.

```json
{
    "theme": {
        "colors": {
            "coral": {
                "0": "hsl(40,33%,98%)",
                "4": "hsl(6,56%,65%)",
                "9": "hsl(6,52%,15%)"
            }
        }
    }
}
```

We could override one of the default keywords with these custom color values.

```json
{
    "theme": {
        "colors": {
            "red": {
                "0": "hsl(40,33%,98%)",
                "4": "hsl(6,56%,65%)",
                "9": "hsl(6,52%,15%)"
            }
        }
    }
}
```

# - Hues [wip]
The `hue` color value works as an argument for passing color values to a component dynamically. The benefit of it over a regular css variable, is that we can still apply Imba's zero to nine lightness values and an alpha value with the forward-slash syntax. 

Forexample `c:hue8/50` would give us any color we pass to the `hue:` property in a lightness value of 8, at 50% opacity.
Below we have a Button component that is using `hue1`, `hue5`,  and `hue8/80`, we can then set the default tint value to cool  `hue:cool`, and the component will have the default color values of `cool1`, `cool5`, and `cool9/80`.
```imba
tag Button
    css c:hue8/80
        bg:hue1 @hover:hue3
        bd:2px solid hue5
        hue:cool # default tint color, will be overridden
    <self>
        <span> <slot>
```
We can then update the tint of a component instance, using a [color keyword](https://imba.io/css/colors) as a value for the `hue` property, as we did with `hue:cool`. We can add a hue value from any style scope, and the hue value will not affect the lightness and alpha values specified in the component's default styles.
```imba
tag App
    prop alpha = 100
    css .red hue:red # component scope style
    <self>
        <Button.global> "global"
        <Button[hue:green]> "green" # inline style
        <Button.red> "red"
        <Button> "amber"
            css hue:amber # nested inline style block
        <Button> "default" # default "cool" color
```
### Dynamic Hue Values [tip]

Value interpolation into `hue` values is not yet supported. A good way to mimic support for it is rather to add the hues you want to have available as global classes, and use dynamic classes:

```imba
# [preview=md]
import 'util/styles'
# ---
global css
    .red hue:red
    .green hue:green
    .blue hue:blue

tag Colors
    items = ['red','green','blue']

    <self> <fieldset>
        for item in items
            <button[c:hue6] .{item}> item
            
imba.mount <Colors>
```

