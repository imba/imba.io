# Styles & Theming

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

## Declaring styles

Global styles are declared using the `css` keyword

```imba
css .btn
    display: block;
    background: #b2f5ea;
    padding-left: 4px;
    padding-right: 4px;
# ... other code here
```
Besides using indentation instead of `{}` it looks very much like regular css. We staunchly believe that less code is better code, so we have strived to make the styling syntax as concise as possible, yet easily readable. Semi-colons are optional:

```imba
css .btn
    display: block
    background: #b2f5ea
    padding-left: 4px
    padding-right: 4px
```
The following parts might look messy on first glance, but bear with us. Line breaks are optional.

```imba
css .btn
    display:block background:#b2f5ea
    padding-left:4px padding-right:4px
```
While there is a case to be made against short variable names in general, css properties are static. We believe in providing short aliases for oft-used css properties.
```imba
css .btn
    d:block bg:#b2f5ea pl:4px pr:4px
```
These are consistent shorthands that will become second nature to write and read after only a very short period of using imba styles.

Styles can also be declared on a single line by separating the selector and the properties with `=`
```imba
css .btn ~arrow[=]~ d:block bg:#b2f5ea pl:4px pr:4px
```
This conciseness comes especially handy when declaring inline styles, which we will come back to later. The imba tooling also includes commands for quickly reformatting, reordering and cleaning up style blocks.

## Nested styles
Styles can also be nested. All nested selectors must include an `&` which represents the parent selector.
```imba
css .btn
    display: block
    background: #b2f5ea
    &:hover
        transform: translateY(-2px) scale(1.1)
    &.primary
        background: #0000FF
        &:hover
            background: #0000CD
```
Nested styles support the same compact syntax, so the rules above could be written like this:
```imba
css .btn = d:block bg:#b2f5ea hover.y:-2px hover.scale:1.1
    &.primary = bg:#0000FF hover.bg:#0000CD
```
You will learn about these `hover.*` properties and why `x` and `scale` seems to be css properties in coming chapters.

## Scoped Styles

It is all fine and

## Inline Styles

# Theme

Imba also has a goal of making it as easy as possible to be consistent with regards to fonts, colors, sizes and more throughout your application. In the spirit of Tailwind, we supply a default "theme" with a whole range of delightfully hand-picked colors, font sizes, shadows and sizing/spacing units.

We are not talking about a "theme" like bootstrap – forcing you into creating generic *bootstrap-looking* designs – but more just a minimal set of defaults that can be used to create all sorts of varied but consistent designs. You can choose not to use them at all, or override everything in your custom theme config, but we think you will find it *immensely* useful.

## Colors

The predefined colors are 9 shades of `gray`,`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`purple` and `pink`, hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). You can hover over the colors below to see their name.

<doc-colors></doc-colors>

### Using colors

# Modifiers

## Pseudo class Modifiers

All regular pseudo classes are supported as modifiers, as well as a few convenient aliases

##### Pseudo-class Modifiers
```imba
css .item
    hover.prop: value # .item:hover { prop: value }
    focus.prop: value # .item:focus { prop: value }
    checked.prop: value # .item:empty { prop: value }
    invalid.prop: value # .item:empty { prop: value }
    empty.prop: value # .item:empty { prop: value }
    # ... all regular pseudo-classes are supported
```

##### Aliased Pseudo-class Modifiers
```imba
css .item
    even.prop: value # .item:nth-child(even) { prop: value }
    odd.prop: value # .item:nth-child(odd) { prop: value }
    first.prop: value # .item:first-child { prop: value }
    last.prop: value # .item:last-child { prop: value }
    lone.prop: value # .item:only-child { prop: value }
```

##### Before & After Modifiers
```imba
css .item
    before.content:"hello" # .item::before { content: "hello" }
    after.bg:red # .item::after { background: red }
```

##### Screen Size Modifiers
```imba
css .item
    # breakpoints for various device widths
    xs.p:1 # @media (min-width: 480px) { .item{ padding:0.25rem } }
    sm.p:2 # @media (min-width: 640px) { .item{ padding:0.5rem } }
    md.p:3 # @media (min-width: 768px) { .item{ padding:0.75rem } }
    lg.p:4 # @media (min-width: 1024px) { .item{ padding:1rem } }
    xl.p:5 # @media (min-width: 1280px) { .item{ padding:1.25rem } }
```

##### Media Modifiers
```imba
css .item
    print.margin: 8 # @media print { .item{ margin: 2rem } }
    screen.margin: 0 # @media print { .item{ margin: 0rem } }
```

##### Color Scheme Modifiers
```imba
css .item
    dark.bg: black # @media (prefers-color-scheme: dark) { .item{ ... }  }
    light.bg: white # @media (prefers-color-scheme: light) { .item{ ... }  }
```

##### Chaining Modifiers
```
# All modifiers can be chained
css .item
    bg.focus.hover: whitesmoke # { .item:focus:hover { background: whitesmoke } }
    padding.md.empty: 4 # @media (min-width: 768px) { .item:empty { padding:1rem } } 
```

# Colors

# Layout

# Sizing

# Typography

# Transitions

# Transforms