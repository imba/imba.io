# css fonts

<doc-style-ff></doc-style-ff>

### Predeclared fonts  [preview=lg]
```imba
import 'util/styles'
# ---
imba.mount do <section[fs:lg]>
    <div[ff:serif]> "This is serif"
    <div[ff:sans]> "This is sans"
    <div[ff:mono]> "This is mono"
```

### Declare custom fonts [preview=lg]
```imba
import 'util/styles'
# ---
global css @root
    --font-sans: Arial Narrow # override sans
    --font-comic: Chalkboard, Comic Sans # add comic

imba.mount do <section[fs:lg]>
    <div[ff:serif]> "This is serif"
    <div[ff:sans]> "This is sans"
    <div[ff:comic]> "This is comic"
```