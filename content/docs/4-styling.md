---
title: Styling
multipage: true
---

# Basics

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

## Global Styles

Style rules are declared using the `css` keyword.

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
Besides using indentation instead of `{}`, making `;` optional, and using `@pseudo` instead of `:pseudo` it looks like regular css. Line breaks are also optional. The following few snippets might look messy at first glance, but bear with us.

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
This conciseness comes especially handy when declaring inline styles, which we will come back to later. Styles can also be nested. Everything before the first property on new lines are treated as nested selectors.
```imba
css .card
    display: block
    background: gray1
    .title color:blue6 # matches .card .title
    h2.desc color:gray6 # matches .card h2.title
    # to scope in on current item use &
    &.large padding:16px # matches .card.large
```

## Scoped Styles

A problem with CSS is that often end up with tons of globally competing styles spread around numerous files. Changing some styles in one place might affect some seemingly unrelated elements. In Imba it is really easy to declare styles that should only apply to certain parts of your document. If you declare style rules inside tag definitions, all the styles will magically only apply to elements inside of this tag:
```imba
# these are global -- applies to everything in project
css body p:5
css h1 color:red5
css p color:black

# ---
tag app-card
    # local styles declared inside tag body
    css d:block p:3 bw:1 bc:gray2 radius:2
        h1 font:serif color:gray8 fs:20px
        p color:gray5 fs:15px
        $more color:gray4

    <self>
        <h1> "Gray Card Header"
        <p> "Gray Card Desc"
        <a$more> 'show more...'

imba.mount do <div>
    <app-card>
    <h1> "Red Header"
    <p> "Black paragraph"
```

## Inline Styles

You can add inline styles on any element using `[style-properties]` syntax. You can think of this as an inlined anonymous class with a bunch of css properties.
Instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to elements directly:
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


## Interpolation

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

### Specifying units

When you want to interpolate values with units you can include units after `{expr}` like `{expr}px`,`{expr}%` etc.
```imba
# ~preview
css div p:2 m:2 overflow:hidden min-width:80px

# ---
let ptr = {x:0, y:0}
imba.mount do
    <section[d:block pos:absolute inset:0] @pointermove=(ptr = e)>
        <div[bg:indigo2 w:{ptr.x / 10}%]> "% width"
        <div[bg:green2 w:{ptr.x}px]> "px width"
        
```

### Set properties directly
You can definitely use interpolated values with css variables as well, but it is best to interpolate them directly at the value where you want to use it. This way Imba can include the correct default unit if none is provided and more.

## Mixins

[Code](/examples/more/mixins)

##### basics
```imba
css %btn
    py:2 px:3 radius:2
    bg:blue2 .warn:yellow2 .danger:red2
    color:blue7 .warn:yellow7 .danger:red7

imba.mount do <div>
    <div%btn> "Button"
    <div%btn.danger> "Danger"
    <div%btn.warn> "Warn"
```

## Specificity

# Aliases

We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties. Like everything else, using these shorthands is completely optional, but especially for inline styles, they are convenient.

### size & position

<doc-style-aliases data-include='w,h,t,l,b,r,size'></doc-style-aliases>

### margin

<doc-style-aliases data-regex='margin|^m[tblrxy]$'></doc-style-aliases>

### padding

<doc-style-aliases data-regex='padding|^p[tblrxy]$'></doc-style-aliases>

### typography
<doc-style-aliases data-regex='text|font' data-neg='decoration|emphasis'  data-include='c,lh,ta,va,ls,fs,ff,fw,ws' data-exclude='t'></doc-style-aliases>

### text-decoration
<doc-style-aliases data-regex='text-decoration'></doc-style-aliases>

### text-emphasis
<doc-style-aliases data-regex='text-emphasis'></doc-style-aliases>

## Layout

<doc-style-aliases data-include='d'></doc-style-aliases>

### flexbox

<doc-style-aliases data-regex='flex'></doc-style-aliases>

### grid

<doc-style-aliases data-regex='grid' data-include='g,rg,cg'></doc-style-aliases>

### alignment

<doc-style-aliases cols='3-transposed' data-regex='^place|^align|^justify|^[paj][ics]' data-exclude='a'></doc-style-aliases>

### background

<doc-style-aliases data-regex='background'></doc-style-aliases>

### border

<doc-style-aliases cols='3' data-regex='border' data-neg='radius'></doc-style-aliases>

### transform

<doc-style-transform-aliases></doc-style-transform-aliases>

### other

<doc-style-aliases data-regex='---' data-include='shadow,opacity,pe,zi,prefix,suffix,us'></doc-style-transform-aliases>

# Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down.

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

# Extensions

Imba has a goal of making it as easy as possible to be consistent with regards to fonts, colors, sizes and more throughout your application. In the spirit of Tailwind, we supply a default "theme" with a whole range of delightfully hand-picked colors, font sizes, shadows and sizing/spacing units.

We are not talking about a "theme" like bootstrap – forcing you into creating generic bootstrap-looking designs – but more just a minimal set of defaults that can be used to create all sorts of varied but consistent designs. You can choose not to use them at all, or override everything in your custom theme config, but we think you will find it immensely useful.


## Dimensions

Imba allows unitless numeric values for all sizing related properties. For margin, padding, sizes, and positions unitless numbers are equal to `0.25rem * number`. `1rem` is `16px` by default, so this means that the scale increments by `4px` for every integer.

## Colors

The predefined colors are 9 shades of `gray`,`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`purple` and `pink`, hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). You can hover over the colors below to see their name.

<doc-colors></doc-colors>

## Font Family

<doc-style-ff></doc-style-ff>

```imba
# ~preview=200px
import 'util/styles'
# ---
css @root
    # To override the default fonts or add new ones
    # simply specify --font-{name} in your styles:
    --font-sans: Arial # override sans
    --font-comic: Chalkboard, Comic Sans # add comic

imba.mount do  <section>
    <label[fs:xl ff:serif]> "This is serif"
    <label[fs:xl ff:sans]> "This is sans"
    <label[fs:xl ff:mono]> "This is mono"
    <label[fs:xl ff:comic]> "This is comic"
```

## Font Sizes

<doc-style-fs></doc-style-fs>

## Box Shadow

```imba
# ~preview=200px
import 'util/styles'
css body bg:gray1
css div c:gray6 size:14 bg:white radius:2 d:grid pa:center
css section.group px:6 jc:center gap:4 max-width:280px @xs:initial
# ---
css @root
    # To override the default shadows or add new ones
    # simply specify --box-shadow-{name} in your styles:
    --box-shadow-ring: 0 0 0 4px blue4/30, 0 0 0 1px blue4/90

imba.mount do  <section.group>
    <div[shadow:ring]> "ring" # custom
    <div[shadow:xxs]> "xxs"
    <div[shadow:xs]> "xs"
    <div[shadow:sm]> "sm"
    <div[shadow:md]> "md"
    <div[shadow:lg]> "lg"
    <div[shadow:xl]> "xl"
    <div[shadow:2xl]> "2xl"
    <div[shadow:ring,2xl]> "ring" # custom combo
    
```

## Border Radius

```imba
# ~preview=200px
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid pa:center border:1px solid gray3
css section.group px:6 jc:center gap:3
# ---
css @root
    # To override the default shadows or add new ones
    # simply specify --border-radius-{name} in your styles:
    --border-radius-bubble: 5px 20px 15px 

imba.mount do  <section.group>
    <div[radius:xs]> "xs"
    <div[radius:sm]> "sm"
    <div[radius:md]> "md"
    <div[radius:lg]> "lg"
    <div[radius:xl]> "xl"
    <div[radius:full]> "full"
    <div[radius:bubble]> "bubble"
```


## Easings

<doc-style-easings></doc-style-easings>

## Layouts

### Grid

The `grid` property behaves in a slightly special manner in Imba. If you supply a single value/identifier to this like `grid:container`, Imba will compile the style to `grid:var(--grid-container)`.

```imba
# ~preview=200px
css body p:2
css div bg:teal2 p:3
css section p:1 gap:2 pc:center

import {genres} from 'imdb'

# ---
# adding a custom grid with different values for different screen sizes
css @root
    --grid-cols: auto-flow / 1fr 1fr
    --grid-cols@xs: auto-flow / 1fr 1fr 1fr
    --grid-cols@sm: auto-flow / 1fr 1fr 1fr 1fr

# use this grid value anywhere in the code
imba.mount do  <section[display:grid grid:cols]>
    for genre in genres
        <div> genre
```

### Group

Row & column gaps are incredibly useful properties for adding consistent spacing between items inside grids. Even though these properties are promised to come for flexbox in the future, current support [is abysmal](https://caniuse.com/#feat=flexbox-gap). To alleviate some of this, imba includes `display:group` which is a shorthand to allow flexboxes that work with gaps.

```imba
# ~preview
import 'util/styles'

import {labels} from 'util/data'

let gap=2,inner=0
~hide[imba.mount do <#hud.bar>
    <span> 'gap'
    <input type='range' min=0 max=4 bind=gap/> <span.num> gap
    <span> 'inner'
    <input type='range' min=0 max=4 step=0.5 bind=inner/> <span.num> inner
]~
imba.mount do <main[p:8]>
    <section[d:grid ji:stretch gap:{gap}]>
        <div[d:group]> <input/> <button> 'Add'
        <div[d:group]> <input/> <input/> <input/>
        <div[d:group gap:{inner or gap}]> for item in labels
            <div.pill> item.name
```
The only way to get consistent gaps between elements inside flexboxes is to add margins around all their children (on all sides), and then add a negative margin to the container. This is what `display:group` does.
