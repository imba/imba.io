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


# Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down.

## Syntax

##### in selectors

```imba
css button@hover
    bg:blue
```

##### in properties

```imba
css button
    bg@hover:blue
```

##### after properties

```imba
css button
    bg:white @hover:whitesmoke @focus:blue
```

##### class modifiers

```imba
css button
    bg:white .primary:blue ..busy:gray
```

## Reference

<doc-style-modifiers></doc-style-modifiers>


# Breakpoints

# Colors

[demo](/examples/css/colors.imba?preview=styles)

The color CSS data-type represents a color in the sRGB color space. Colors can be defined in all the same ways as in plain css. In addition, imba as built-in support for named colors hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). All named colors come in 10 different shades, named from `color0` up to `color9`. You can hover over each color below to see their name:

<doc-colors></doc-colors>

Just like other colors like `#7A4ACF`, `hsl(120,90%,45%)`, `rgba(120,255,176)`, these named colors can be used anywhere in your styles where a color value is expected.

# Layout

## Sizing [toc-pills]

### w

### h

### size

## Positioning [toc-pills]

### pos

### t

### r

### b

### l

### inset [custom]

## Margin [toc-pills]

### m

### mt

### mr

### mb

### ml

### mx

### my
## Padding [toc-pills]


### p

### pt

### pr

### pb

### pl

### px

### py

## Display [toc-pills]

### d

### d:hflex

### d:vflex

### d:hgrid

### d:vgrid

## Flexbox [toc-pills]

### fl

### flf

### fld

### flb

### flg

### fls

### flw


## Grid [toc-pills]

#### g [css-prop=gap]
#### rg [css-prop=row-gap]
#### cg [css-prop=column-gap]
#### gtr [css-prop=grid-template-rows]
#### gtc [css-prop=grid-template-columns]
#### gta [css-prop=grid-template-areas]
#### gar [css-prop=grid-auto-rows]
#### gac [css-prop=grid-auto-columns]
#### gaf [css-prop=grid-auto-flow]
#### gcg [css-prop=grid-column-gap]
#### grg [css-prop=grid-row-gap]
#### ga [css-prop=grid-area]
#### gr [css-prop=grid-row]
#### gc [css-prop=grid-column]
#### gt [css-prop=grid-template]
#### grs [css-prop=grid-row-start]
#### gcs [css-prop=grid-column-start]
#### gre [css-prop=grid-row-end]
#### gce [css-prop=grid-column-end]

# Alignment

## Alignment [toc-pills]

### ji

### jc

### js

### j

### ai

### ac

### as

### a

### jai

### jac

### jas

### ja


# Typography

## Properties [toc-pills]

### c
### ff
### fs
### fw
### ts
### tt
### ta
### va
### ls
### lh
### ws

## Font Family [toc-pills]

### ff

### ff:mono

### ff:sans

### ff:serif



## Font Size

## Font Weight

# Backgrounds

## Background [toc-pills]

### bg

### bgc

### bgi

### bgr

### bgi

### bga

### bgs

### bgclip

# Borders

## Border [toc-pills]
### bd [border]
### bdr [border-right]
### bdl [border-left]
### bdt [border-top]
### bdb [border-bottom]

## Border Style [toc-pills]
### bs [border-style]
### bsr [border-right-style]
### bsl [border-left-style]
### bst [border-top-style]
### bsb [border-bottom-style]

## Border Width [toc-pills]
### bw [border-width]
### bwr [border-right-width]
### bwl [border-left-width]
### bwt [border-top-width]
### bwb [border-bottom-width]

## Border Color [toc-pills]
### bc [border-color]
### bcr [border-right-color]
### bcl [border-left-color]
### bct [border-top-color]
### bcb [border-bottom-color]

## Border Radius [toc-pills]

[demo](/examples/css/rd.imba?preview=styles)

### rd [border-radius]
### rdtl [border-top-left-radius]
### rdtr [border-top-right-radius]
### rdbl [border-bottom-left-radius]
### rdbr [border-bottom-right-radius]
### rdt [border-top-left-radius_border-top-right-radius]
### rdb [border-bottom-left-radius_border-bottom-right-radius]
### rdl [border-top-left-radius_border-bottom-left-radius]
### rdr [border-top-right-radius_border-bottom-right-radius]

# Animations

# Transforms

## Transform [toc-pills]

[demo](/examples/css/transform.imba?preview=styles)

### x

### y

### z

### scale

### scale-x

### scale-y

### rotate

### skew-x

### skew-y

# Appearance

