# Styles

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

## Design system

Imba has a goal of making it as easy as possible to be consistent with regards to fonts, colors, sizes and more throughout your application. In the spirit of Tailwind, we supply a default "theme" with a whole range of delightfully hand-picked colors, font sizes, shadows and sizing/spacing units.

We are not talking about a "theme" like bootstrap – forcing you into creating generic bootstrap-looking designs – but more just a minimal set of defaults that can be used to create all sorts of varied but consistent designs. You can choose not to use them at all, or override everything in your custom theme config, but we think you will find it immensely useful.

# Declarations

Style rules are declared using the `css` keyword.

```imba
css .btn
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
This conciseness comes especially handy when declaring inline styles, which we will come back to later. The imba tooling also includes commands for quickly reformatting, reordering and cleaning up style blocks.

## Nesting

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
When nesting pseudo selectors like `@hover`, they are always merged into the closest non-pseudo selector. This means that you can add a bunch of them one after the other with spaces between them, and they will still be applied to the closest non-pseudo selector.
```imba
css .card
    opacity:0.5
    @hover @focus opacity:1 # will match .card:hover:focus
    .large .selected opacity:1 # will match .card .large .selected
    .class opacity:1 # matches .card .class
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
    css d:block p:3 r:2 b:gray2
        h1 font:serif gray8 fs:20px
    css p font:gray5 fs:15px

    <self>
        <h1> "Gray Card Header"
        <p> "Gray Card Desc"

imba.mount do <div>
    <app-card>
    <h1> "Red Header"
    <p> "Black paragraph"
```

### Local Scoping

If you render other components inside your component, and don't want the styles declared in the tag body to also apply to sub elements of included components etc, just prefix your `css` declaration with `local`:
```imba
css body p:5
# ---
tag app-button
    <self> <span.title> <slot> "Button"

tag app-card
    css d:block p:3 radius:2 border:gray2
    css .desc font:15px gray5
    ~arrow[local]~ css .title font:serif 20px gray8

    <self>
        <div.title> "Card title"
        <p.desc> "Card description"
        # the div.title inside app-button will not be styled!
        <app-button> "Read more..."

imba.mount do <app-card>
```

### Styling Named Elements

You can also style named elements using their prefixed `$name` directly in the style selector.
```imba
tag app-card
    css $title font:serif 20px gray8
    css $desc font:15px gray5

    <self>
        <h1$title> "Card title"
        <p$desc> "Card description"
```

## Mixins

Sometimes you want to create reusable "global" styles, but still not pollute your app with globally applied styles. Let's say you have a style that you reuse for buttons across components, but you don't want to risk any element with the class `.btn` to be affected. If you create a css declaration without an initial selector, it will compile to an anonymous css rule, and return the unique name representing this style.

```imba
const btn = css p:2 bg:blue2 color:blue7 radius:2
console.log btn # a unique string that can be used as a class name

imba.mount do <div.{btn}> "Styled as button"
```
```imba
css %btn p:2 bg:blue2 color:blue7 radius:2
imba.mount do <div.%btn> "Styled as button"
```
These styles can also contain nested rules

```imba
const btn = css p:2 bg:blue2 color:blue7 radius:2
    &.danger bg:red2 color:red7
    &.warn bg:yellow2 color:yellow7

imba.mount do <div>
    <div.{btn}> "Styled as button"
    <div.{btn}.danger> "Danger"
    <div.{btn}.warn> "Warn"
```

```imba

css %button p:2 bg:blue2 color:blue7 radius:2
    &.danger bg:red2 color:red7
    &.warn bg:yellow2 color:yellow7

imba.mount do <div>
    <div.%button> "Styled as button"
    <div.%button.danger> "Danger"
    <div.%button.warn> "Warn"
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
<div[is:rel vflex p:2 @lg:3]>
# Darker background color on hover:
<button[bg:gray2 @hover:gray3]> "Click me"
# Set text color when input is focused:
<input[font@focus:blue7]>
```
Since inline styles are essentially anonymous classes, they can also be applied conditionally:
```imba
# line-through and lighter color if item is done
<div[p:2 font:green9] [font:line-through gray4]=item.done>
```

# Mixins

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

##### importing
```imba
import {%btn} from './styles'

imba.mount do <div>
    <div%btn> "Button"
    <div%btn.danger> "Danger"
    <div%btn.warn> "Warn"
```

# Aliases

We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties. Like everything else, using these shorthands is completely optional, but especially for inline styles, they are convenient.

## size & position

<doc-style-aliases data-include='w,h,t,l,b,r,size'></doc-style-aliases>

## margin

<doc-style-aliases data-regex='margin'></doc-style-aliases>

## padding

<doc-style-aliases data-regex='padding'></doc-style-aliases>

## text & font
<doc-style-aliases data-regex='text|font' data-neg='decoration|emphasis'  data-include='c,lh,ta,va,ls,fs,ff,fw,ws' data-exclude='t'></doc-style-aliases>

## flexbox

<doc-style-aliases data-regex='flex'></doc-style-aliases>

## grid

<doc-style-aliases data-regex='grid' data-include='g,rg,cg'></doc-style-aliases>

## alignment

<doc-style-aliases cols='3-transposed' data-regex='^place|^align|^justify' data-exclude='a'></doc-style-aliases>

## background

<doc-style-aliases data-regex='background'></doc-style-aliases>

## border

<doc-style-aliases cols='3' data-regex='border' data-neg='radius'></doc-style-aliases>

## text-decoration
<doc-style-aliases data-regex='text-decoration'></doc-style-aliases>

## text-emphasis
<doc-style-aliases data-regex='text-emphasis'></doc-style-aliases>

## transform

<doc-style-transform-aliases></doc-style-transform-aliases>

## transition


## other

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

## Modifiers in Selectors

```imba
css section @md
    padding-top:12px
```
Selector modifiers separated by spaces are always merged into the closest non-modifier selector.
```imba
css .card@hover@focus # matches .card:hover:focus
css .card @hover @focus # matches .card:hover:focus
css .card @hover * @focus # matches .card:hover *:focus
css .card @hover .item @focus # matches .card:hover .item:focus
```
Special modifiers like media modifiers can be included anywhere in the selector.
```imba
css .card @lg .item @hover @mac d:block
# @media (min-width: 1024px) { html.ua-mac .item:hover { display:block } }
```
Modifiers can be nested like any other selector type
```imba
css #downloads
    padding-top:12px
    h1,h2,h3
        color:black
        @dark color:white
        @hover,@focus text-decoration:underline
```


## Modifiers in Properties

Modifiers can also be used directly inside single style properties by including them in the property name like `property@hover:value`
```imba
css .button
    display:flex bg:white bg~arrow[@hover]~:gray
```
If you set a property without a name like `@hover:value`, it will automatically refer to the previous property in the declaration.
```imba
css .button
    display:flex bg:white ~arrow[@hover]~:gray
```
This is especially convenient where you want to set multiple variations of variables, and in inline styles where you want to be as DRY as possible. Lets look at a hypotethical stylesheet:
```css
:root {
    --sidebar-width:180px;
    --sidebar-bg:#f2f2f2;
}
@media (min-width:768px) {
    :root { --sidebar-width:220px; }
}
@media (min-width:1024px) {
    :root { --sidebar-width:260px; }
}
@media (prefers-color-scheme: dark) {
    :root { --sidebar-bg:#101010; }
}
```
Maintaining this is very difficult. The various variable overrides are spread out, and it is generally hard to see the specificity and what values will be in effect at what time. In Imba, this all becomes much cleaner:

```imba
css @root
    --sidebar-width:180px @md:220px @lg:260px
    --sidebar-bg:#f2f2f2 @dark:#101010
```

Property modifiers are especially useful for inline styles where you don't want bloated multi-line styles.
```imba
<button[color:blue7 bg:blue2 @hover:blue3]> 'Click me'
<h1[fs:26px @lg:34px color:purple6 mt:30px @lg:50px]> "Hero title"
```

## Class Modifiers

Imba includes `.classname` modifier that will apply only when the styled element has `classname`, and `..classname` that will only take effect if a parent has `classname`. These are especially useful in inline styles, where adding nested selectors can become messy.
```imba
<todo-item[bg:gray1 ~[.done:green1]~] .done=todo.completed>
```
```imba
<todo-item .done=todo.completed>
    <span[td~[..done:line-through]~]> todo.title
```

> Discuss challenges with nested `in-class` etc.


## Pseudo-class Modifiers

All regular pseudo classes are supported as modifiers.

```imba
css .item
    @hover color: black # .item:hover { color: black }
    @focus color: blue # .item:focus { color: blue }
    @checked color: green # .item:empty { color: green }
    @invalid color: red # .item:empty { color: red }
    @empty opacity: 0 # .item:empty { opacity: 0 }
    # ... all regular pseudo-classes are supported
```
Some oft-used modifiers have shorter intuitive aliases.
```imba
css .item
    @odd prop: value   # .item:nth-child(odd) { prop: value }
    @even prop: value  # .item:nth-child(even) { prop: value }
    @first prop: value # .item:first-child { prop: value }
    @last prop: value  # .item:last-child { prop: value }
    @lone prop: value  # .item:only-child { prop: value }
```

## Pseudo-element Modifiers
```imba
css .item
    color:blue padding:10px
    @before content: "hello" color:red
```
As with all other modifiers, pseudo-element modifiers can also be used with properties:
```imba
css .item
    content@before:"hello" # .item::before { content: "hello" }
    bg@after:red # .item::after { background: red }
```

## Screen Size Modifiers

The screen-size modifiers are mobile-first. This means that all modifiers always means 'this size *and up*'. So when setting `padding@sm:2` you essentially set padding to 2 for sm,md,lg and xl.

```imba
# @xs p:1 # @media (min-width: 480px)  { .item { padding:0.25rem } }
# @lt-xs p:1 # @media (max-width: 479px) { .item{ padding:0.25rem } }
# ---
css .item
    p@sm:2 # @media (min-width: 640px)  { .item { padding:0.5rem } }
    p@md:3 # @media (min-width: 768px)  { .item { padding:0.75rem } }
    p@lg:4 # @media (min-width: 1024px) { .item { padding:1rem } }
    p@xl:5 # @media (min-width: 1280px) { .item { padding:1.25rem } }
```

```imba
css .item
    p@lt-sm:2 # @media (max-width: 639px) { .item{ padding:0.5rem } }
    p@lt-md:3 # @media (max-width: 767px) { .item{ padding:0.75rem } }
    p@lt-lg:4 # @media (max-width: 1023px) { .item{ padding:1rem } }
    p@lt-xl:5 # @media (max-width: 1279px) { .item{ padding:1.25rem } }
```

## Screen Orientation Modifiers

```imba
css .item
    margin@landscape:8 # @media (orientation: landscape) { .item{ margin: 2rem } }
    margin@portrait:0 # @media (orientation: portrait) { .item{ margin: 0rem } }
```

## Device Type Modifiers

```imba
css .item
    margin@print: 8 # @media print { .item{ margin: 2rem } }
    margin@screen: 0 # @media print { .item{ margin: 0rem } }
```

## Color Scheme Modifiers

```imba
css .item
    bg@dark: black # @media (prefers-color-scheme: dark) { .item{ ... }  }
    bg@light: white # @media (prefers-color-scheme: light) { .item{ ... }  }
```

## Platform Modifiers [WIP]

```imba
css .item
    bg@mac: black # html.ua-mac .item{ ... }  }
    bg@ios: black # html.ua-ios .item{ ... }  }
    bg@win: black # html.ua-win .item{ ... }  }
    bg@android: black # html.ua-android .item{ ... }  }
    bg@linux: black # html.ua-linux .item{ ... }  }
```

## Browser Modifiers [WIP]

```imba
css .item
    bg@ie: black # html.ua-ie .item{ ... }  }
    bg@chrome: black # html.ua-chrome .item{ ... }  }
    bg@safari: black # html.ua-safari .item{ ... }  }
    bg@firefox: black # html.ua-firefox .item{ ... }  }
    bg@opera: black # html.ua-opera .item{ ... }  }
    bg@blink: black # html.ua-blink .item{ ... }  }
    bg@webkit: black # html.ua-webkit .item{ ... }  }
```

## Class Modifiers
##### Syntax
```imba
# background set to green when todo-item has done class
<todo-item[bg@is-done:green1] .done=todo.completed>
    # line-through text when some parent has done class
    <span[td@in-done:line-through]> todo.title
```

Our goal is to keep the styling as close to the markup and logic as possible(!). Not all relevant states are expressed through the native hover/focus/active/... pseudo-classes. You might often want to style elements based on their own classes, and the classes/states of their parents. Say we have a `.done` class added to todo items that are marked as completed.
```imba
css todo-item
    padding:6px 12px
    color:gray8
    bg:white @hover:blue1
    button.archive display:none
    span.title color:gray8
    &.done
        bg:green1
        span.title color:green6
        button.archive display:none

<todo-item>
    <span.title> 'Remember milk'
    <button.archive> 'x'
```
When you set multiple styles based on multiple class names, your css can quickly descend into a multi-level incomprehensible mess.  In regular inline styles we would not be able to make certain properties take effect only when the element has the `.done` class.
```imba
<todo-item[p:6px 12px c:gray8 bg:white @hover:blue1 @is-done:green1]>
    <span[c:gray8 @in-done:green6]> 'Remember milk'
    <button[d:none @in-done:block]> 'x'
```
## Custom Modifiers


# Presets

## Colors

The predefined colors are 9 shades of `gray`,`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`purple` and `pink`, hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). You can hover over the colors below to see their name.

<doc-colors></doc-colors>

## Fonts

<doc-style-ff></doc-style-ff>

## Font Sizes

<doc-style-fs></doc-style-fs>

## Transitions

### Properties


### Easings

<doc-style-easings></doc-style-easings>



## Units

You can define your own units.
```imba
css @root
    1sb: 200px
    1u: 4px
    1l: 64px
```

# Reference

## Transitions

## Document

- `123c` in width
- `123r` in height
- `>10` and `<10` in width and height
- Special transition properties
