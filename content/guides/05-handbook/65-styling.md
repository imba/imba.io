# Styles

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

# Rules

Style rules are declared using the `css` keyword

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
While there is a case to be made against short variable names in general, css properties are static. We believe in providing short intuitive aliases for oft-used css properties.
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

## Nested rules
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

## Sizing

## Fonts

## Font Sizes

## Shadows


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

# Layout

A single property that accepts values describing various common combinators of position, display, overflow, and other properties. Here is a list of all the values layout accepts - and what they are shorthands for:

```imba
abs # position: absolute;
rel # position: relative;
fixed # position: fixed;
sticky # position: sticky;
static # position: static;
hidden # display: none;
block # display: block;
inline-block # display: inline-block;
inline # display: inline;
flex # display: flex;
inline-flex # display: inline-flex;
vflex # display: flex; flex-direction: row;
inline-vflex # display: inline-flex; flex-direction: row;
grid # display: grid;
inline-grid # display: inline-grid;
grid # display: grid;
table # display: table;
table-caption # display: table-caption;
table-cell # display: table-cell;
table-column # display: table-column;
table-column-group # display: table-column-group;
table-footer-group # display: table-footer-group;
table-header-group # display: table-header-group;
table-row-group # display: table-row-group;
table-row # display: table-row;
contents # display: contents;
clip # overflow: hidden;
noclip # overflow: visible;
clip-x # overflow-x: hidden;
clip-y # overflow-y: hidden;
noclip-x # overflow-x: visible;
noclip-y # overflow-y: visible;
scroll-x # overflow-x: auto;
scroll-y # overflow-y: auto;
scroll # overflow: scroll;
border-box # box-sizing: border-box;
content-box # box-sizing: content-box;
inset # top: 0; left: 0; bottom: 0; right: 0;
visible # visibility: visible;
invisible # visibility: hidden;

```

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
| `grid` | `display: grid;` |
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

# Sizing

Units, shorthands++

## Padding

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

| Aliases  | Properties |
| --- | --- |
| `m`  | margin |
| `ml` | margin-left |
| `mr` | margin-right |
| `mt` | margin-top |
| `mb` | margin-bottom |
| `mx` | margin-left & margin-right |
| `my` | margin-top & margin-bottom |

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

## Inline styles

Inline styles with superpowers. When using inline styles, how would you ever set 

There are some very common usecases that are pretty verbose to express in regular css. You want to have different font sizes for different screen sizes. You want to slightly change the color or opacity of a background on hover.

## text property

# Backgrounds

# Borders

## Border

## Divide

# Transitions

# Transforms

# Breakpoints