# Styling

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

## Design system

Imba has a goal of making it as easy as possible to be consistent with regards to fonts, colors, sizes and more throughout your application. In the spirit of Tailwind, we supply a default "theme" with a whole range of delightfully hand-picked colors, font sizes, shadows and sizing/spacing units.

We are not talking about a "theme" like bootstrap – forcing you into creating generic bootstrap-looking designs – but more just a minimal set of defaults that can be used to create all sorts of varied but consistent designs. You can choose not to use them at all, or override everything in your custom theme config, but we think you will find it immensely useful.

# Global Styles

Style rules are declared using the `css` keyword.

```imba
css .btn =
    position: relative
    display: block
    background: #b2f5ea
    padding-left: 4px
    padding-right: 4px
css .btn:hover =
    background: #81e6d9
```
Besides using indentation instead of `{}` and making `;` optional it looks like regular css. Line breaks are also optional. The following few snippets might look messy at first glance, but bear with us.

```imba
css .btn =
    position:relative display:block background:#b2f5ea
    padding-left:4px padding-right:4px
css .btn:hover =
    background: #81e6d9
```
We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties, as well as additional properties covering common usecases:
```imba
css .btn =
    d:rel block pl:4px pr:4px bg:#b2f5ea
css .btn:hover =
    bg:#81e6d9
```
We also want to make it easy to follow a consistent design system throughout your project while not enforcing a predefined look and feel. Imba provides default (but configurable) colors, fonts, size units and more to help enforce consistency:
```imba
css .btn =
    d:rel block px:1 bg:teal2
css .btn:hover =
    bg:teal3
```
Rules can also be written on a single line
```imba
css .btn = d:rel block px:1 bg:teal2
css .btn:hover = bg:teal3
```

There are also some patterns that come up again and again in css. Changing a few properties on `hover` or other states, or setting certain dimensions for specific screen sizes etc. Imba got you covered with property modifiers that we will get into later. But to round up, the first block of css here would usually be written like this in Imba:
```imba
css .btn = d:rel block px:1 bg:teal2 bg@hover:teal3
```
This conciseness comes especially handy when declaring inline styles, which we will come back to later. The imba tooling also includes commands for quickly reformatting, reordering and cleaning up style blocks.


## Nested Rules
Styles can also be nested. All nested selectors must include an `&` which represents the parent selector.
```imba
css .btn =
    display: block
    background: gray1
    &:hover =
        transform: translateY(-2px)
    &.primary =
        background: blue4
        &:hover =
            background: blue5
```
Nested styles support the same compact syntax, so the rules above could be written like this:
```imba
css .btn = d:block bg:gray1 y@hover:-2px
    &.primary = bg:blue4 bg@hover:blue5
```
Don't worry, you will learn about these unfamiliar modifiers and properties on the coming chapters.

# Scoped Styles

Another problem with CSS is that often end up with tons of globally competing styles spread around numerous files. Changing some styles in one place might affect some seemingly unrelated elements. In Imba it is really easy to declare styles that should only apply to certain parts of your document. If you declare style rules inside tag definitions, all the styles will magically only apply to elements inside of this tag:
```imba
css body = p:5
css h1 = f:red5

# ---
tag app-card
    css = d:block p:3 r:2 b:gray2
    css h1 = f:20px serif gray8
    css p = f:15px gray5

    <self>
        <h1> "Card title"
        <p> "Card description"

imba.mount do <div>
    <app-card>
    <h1> "Unstyled header"
    <p> "Unstyled paragraph"
```

## Local Scoping
```imba
css body = p:5
css h1 = f:red5

# ---
tag app-card
    css = d:block p:3 r:2 b:gray2
    css .title = f:20px serif gray8
    css .desc = f:15px gray5

    <self>
        <h1.title> "Card title"
        <p.desc> "Card description"
        <app-button> "Read more..."

tag app-button
    <self> <span.title> <slot> "Button"

imba.mount do <div>
    <app-card>
    <h1> "Unstyled header"
    <p> "Unstyled paragraph"
```
In the example above, the `span` inside `app-button` will also be styled with the `.title` style defined in app-card. This is not always something you want. In that case, you can use the `:local` pseudo selector to hinder that.
```imba
css body = p:5
css h1 = f:red5

# ---
tag app-card
    css = d:block p:3 r:2 b:gray2
    css .title~[:local]~ = f:20px serif gray8
    css .desc = f:15px gray5
~hide[
    <self>
        <h1.title> "Card title"
        <p.desc> "Card description"
        <app-button> "Read more..."

tag app-button
    <self> <span.title> <slot> "Button"

imba.mount do <div>
    <app-card>
    <h1> "Unstyled header"
    <p> "Unstyled paragraph"]~
```

## Styling Named Elements

You can also style named elements using their prefixed `$name` directly in the style selector.
```imba
tag app-card
    css = d:block p:3 r:2 b:gray2
    css $title = f:20px serif gray8
    css $desc = f:15px gray5

    <self>
        <h1$title> "Card title"
        <p$desc> "Card description"
```

# Inline Styles

You can add inline styles on any element using `.(style-properties)` syntax. You can think of this as an inlined anonymous class with a bunch of css properties.
Instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to elements directly:
```imba
<div.(position:relative display:flex flex-direction:row padding:2rem)>
```
This might look like regular inline styles, but with abbreviations and modifiers they become much more powerful and expressive:
```imba
# More padding on large screens:
<div.(l:rel vflex p:2 p@lg:3)>
# Darker background color on hover:
<button.(bg:gray2 bg@hover:gray3)> "Click me"
# Set text color when input is focused:
<input.(c@focus:blue7)>
```
Since inline styles are essentially anonymous classes, they can also be applied conditionally:
```imba
# line-through and lighter color if item is done
<div.(p:2 f:green9) .(f:line-through gray4)=item.done>
```

# Modifiers

## Basic syntax

##### Modifiers in selector
```imba
# 1.25rem left & right margin 
css @md section = mx:5
```
##### Modifiers after property
```imba
css :root =
    $header-height:48px @md:56px @lg:68px
```
When you write `@modifier:value`, the value will always apply to the previous non-modifier property.
```imba
css :root = bg:red1 @hover:red2 px:2 @md:3 @lg:4
```

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

## Screen Size Modifiers

The screen-size modifiers in Imba are mobile-first.

##### Screen Size
```imba
css .item
    # breakpoints for various device widths
    xs.p:1 # @media (min-width: 480px) { .item{ padding:0.25rem } }
    sm.p:2 # @media (min-width: 640px) { .item{ padding:0.5rem } }
    md.p:3 # @media (min-width: 768px) { .item{ padding:0.75rem } }
    lg.p:4 # @media (min-width: 1024px) { .item{ padding:1rem } }
    xl.p:5 # @media (min-width: 1280px) { .item{ padding:1.25rem } }
```

##### Negated modifiers
```imba
css .item
    # breakpoints for various device widths
    not-xs.p:1 # @media (max-width: 479px) { .item{ padding:0.25rem } }
    not-sm.p:2 # @media (max-width: 639px) { .item{ padding:0.5rem } }
    not-md.p:3 # @media (max-width: 767px) { .item{ padding:0.75rem } }
    not-lg.p:4 # @media (max-width: 1023px) { .item{ padding:1rem } }
    not-xl.p:5 # @media (max-width: 1279px) { .item{ padding:1.25rem } }
```

## Device Type Modifiers

```imba
css .item
    print.margin: 8 # @media print { .item{ margin: 2rem } }
    screen.margin: 0 # @media print { .item{ margin: 0rem } }
```

## Color Scheme Modifiers

```imba
css .item
    dark.bg: black # @media (prefers-color-scheme: dark) { .item{ ... }  }
    light.bg: white # @media (prefers-color-scheme: light) { .item{ ... }  }
```

## Platform Modifiers [WIP]

```imba
css .item
    mac.bg: black # html.platform-mac .item{ ... }  }
    ios.bg: black # html.platform-ios .item{ ... }  }
    win.bg: black # html.platform-win .item{ ... }  }
    linux.bg: black # html.platform-win .item{ ... }  }
```

## Browser Modifiers [WIP]

```imba
css .item
    ie.bg: black # html.browser-ie .item{ ... }  }
    chrome.bg: black # html.platform-chrome .item{ ... }  }
    safari.bg: black # html.platform-safari .item{ ... }  }
    firefox.bg: black # html.platform-firefox .item{ ... }  }
    opera.bg: black # html.platform-opera .item{ ... }  }
    blink.bg: black # html.platform-blink .item{ ... }  }
    webkit.bg: black # html.platform-webkit .item{ ... }  }
```

##### Chaining Modifiers
```
# All modifiers can be chained
css .item
    bg.focus.hover: whitesmoke # { .item:focus:hover { background: whitesmoke } }
    padding.md.empty: 4 # @media (min-width: 768px) { .item:empty { padding:1rem } } 
```

# Colors

One of the most important parts of a coherent design is consistent use of colors across everything.

The predefined colors are 9 shades of `gray`,`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`purple` and `pink`, hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). You can hover over the colors below to see their name.

<doc-colors></doc-colors>

# Aliases

# Layout

A single property that accepts values describing various common combinators of position, display, overflow, and other properties. Here is a list of all the values layout accepts - and what they are shorthands for:

| Value  | Properties |
| --- | --- |
| `abs` | `position: absolute;` |
| `rel` | `position: relative;` |
| `fixed` | `position: fixed;` |
| `sticky` | `position: sticky;` |
| `static` | `position: static;` |
| `hidden` | `display: none;` |
| `block` | `display: block;` |
| `inline-block` | `display: inline-block;` |
| `inline` | `display: inline;` |
| `flex` | `display: flex;` |
| `inline-flex` | `display: inline-flex;` |
| `vflex` | `display: flex; flex-direction: row;` |
| `inline-vflex` | `display: inline-flex; flex-direction: row;` |
| `grid` | `display: grid;` |
| `inline-grid` | `display: inline-grid;` |
| `table` | `display: table;` |
| `table-caption` | `display: table-caption;` |
| `table-cell` | `display: table-cell;` |
| `table-column` | `display: table-column;` |
| `table-column-group` | `display: table-column-group;` |
| `table-footer-group` | `display: table-footer-group;` |
| `table-header-group` | `display: table-header-group;` |
| `table-row-group` | `display: table-row-group;` |
| `table-row` | `display: table-row;` |
| `contents` | `display: contents;` |
| `clip` | `overflow: hidden;` |
| `noclip` | `overflow: visible;` |
| `clip-x` | `overflow-x: hidden;` |
| `clip-y` | `overflow-y: hidden;` |
| `noclip-x` | `overflow-x: visible;` |
| `noclip-y` | `overflow-y: visible;` |
| `scroll-x` | `overflow-x: auto;` |
| `scroll-y` | `overflow-y: auto;` |
| `scroll` | `overflow: scroll;` |
| `border-box` | `box-sizing: border-box;` |
| `content-box` | `box-sizing: content-box;` |
| `inset` | `top: 0; left: 0; bottom: 0; right: 0;` |
| `visible` | `visibility: visible;` |
| `invisible` | `visibility: hidden;` |

All of these values can be combined 

# Flexbox

| Aliases  |  |
| --- | --- |
| `ai` | align-items |
| `as` | align-self |
| `ac` | align-content |
| `jc` | justify-content |

### align-items

### align-content

### align-self

### flex-direction

### flex

### flex-grow

### flex-shrink

### flex-basis

### justify-content

## layout extensions


# Grid

# Dimensions

Units, shorthands++

## Padding

Properties for controlling an element's padding.

| Aliases  | Properties |
| --- | --- |
| `p` | padding |
| `pl` | padding-left |
| `pr` | padding-right |
| `pt` | padding-top |
| `pb` | padding-bottom |
| `px` | padding-left & padding-right |
| `py` | padding-top & padding-bottom |


## Margin

Properties for controlling an element's margin.

| Aliases  | Properties |
| --- | --- |
| `m`  | margin |
| `ml` | margin-left |
| `mr` | margin-right |
| `mt` | margin-top |
| `mb` | margin-bottom |
| `mx` | margin-left & margin-right |
| `my` | margin-top & margin-bottom |

## Size

| Aliases  | Properties |
| --- | --- |
| `w`  | width |
| `h` | height |

## Position

| Aliases  | Properties |
| --- | --- |
| `ot`  | top |
| `or`  | right |
| `ob`  | bottom |
| `ol`  | left |
| `ox`  | left & right |
| `oy`  | top & bottom |
| `otr`  | top & right |
| `otl`  | top & left |
| `obr`  | bottom & right |
| `obl`  | bottom & left |

## Space between

# Typography

```imba
css h1
    text: bold sm/2 sans
```

## Font Family

Default fonts defined in theme
How to add / change fonts

| Fonts  |  |
| --- | --- |
| `sans`  | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"` |
| `serif` | `Georgia, Cambria, "Times New Roman", Times, serif` |
| `mono` | `Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"` |

## Font Size

| Aliases  |  |
| --- | --- |
| `xxs`  | 10px |
| `xs`   | 12px |
| `sm`   | 14px |
| `md`   | 16px |
| `lg`   | 18px |
| `xl`   | 20px |
| `2xl`  | 24px |
| `3xl`  | 30px |
| `4xl`  | 36px |
| `5xl`  | 48px |
| `6xl`  | 64px |

## Colors and Sizing

An application can quickly become an entangled mess of competing css rules, different shadows, colors, and sizes. We don't want to force developers into a hardcoded set of predefined styles, but we do want to make it easy to keep styles consistent within your project.

## text property

# Backgrounds

| Aliases  | Properties |
| --- | --- |
| `bg` | background |
| `bgc` | background-color |
| `bgi` | background-image |
| `bgs` | background-size |
| `bgp` | background-position |
| `bgr` | background-repeat |
| `bga` | background-attachment |


# Borders

## border

| table  | Properties |
| --- | --- |
| `b` | border |
| `bt` | border-top |
| `br` | border-right |
| `bb` | border-bottom |
| `bl` | border-left |
| `bx` | border-x |
| `by` | border-y |

## border-width
| table  | Properties |
| --- | --- |
| `bw` | border-width |
| `btw` | border-top-width |
| `brw` | border-right-width |
| `bbw` | border-bottom-width |
| `blw` | border-left-width |
| `bxw` | border-x-width |
| `byw` | border-y-width |

## border-color
| table  | Properties |
| --- | --- |
| `bc` | border-color |
| `btc` | border-top-color |
| `brc` | border-right-color |
| `bbc` | border-bottom-color |
| `blc` | border-left-color |
| `bxc` | border-x-color |
| `byc` | border-y-color |

## border-style
| table  | Properties |
| --- | --- |
| `bs` | border-style |
| `bts` | border-top-style |
| `brs` | border-right-style |
| `bbs` | border-bottom-style |
| `bls` | border-left-style |
| `bxs` | border-x-style |
| `bys` | border-y-style |

## divider

# Transforms

| Aliases  |  |
| --- | --- |
| `x` | translateX |
| `y` | translateY |
| `z` | translateZ |
| `rotate` | rotate |
| `scale` | scale |
| `scale-x` | scale-x |
| `scale-y` | scale-y |
| `skew-x` | skew-x |
| `skew-y` | skew-y |

# Transitions

# Breakpoints