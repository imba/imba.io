# css shadows [reference]

## Examples

### Predefined shadows [preview=lg]
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 size:14 bg:white radius:2 d:grid pa:center
css section.group px:6 jc:center gap:4 max-width:280px @xs:initial
# ---
imba.mount do <section.group>
    <div[shadow:xxs]> "xxs"
    <div[shadow:xs]> "xs"
    <div[shadow:sm]> "sm"
    <div[shadow:md]> "md"
    <div[shadow:lg]> "lg"
    <div[shadow:xl]> "xl"
    <div[shadow:2xl]> "2xl"    
```
Imba comes with 7 predefined shadows (from tailwind).


### Declare custom shadows [preview=lg]
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 size:14 bg:white radius:2 d:grid pa:center
css section.group px:6 jc:center gap:4 max-width:280px @xs:initial
# ---
global css @root
    # To override the default shadows or add new ones
    # simply specify --box-shadow-{name} in your styles:
    --box-shadow-ring: 0 0 0 4px blue4/30, 0 0 0 1px blue4/90

imba.mount do  <section.group>
    <div[shadow:ring]> "ring" # custom
    <div[shadow:ring,2xl]> "combo"
```
To override the default shadows or add new ones simply specify `--box-shadow-{name}` in your styles. You can even override the style of a certain shadow only for a file or specific component by declearing the `--box-shadow-{name}` in a deeper selector.
