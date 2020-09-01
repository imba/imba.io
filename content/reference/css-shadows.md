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
    <div[bxs:xxs]> "xxs"
    <div[bxs:xs]> "xs"
    <div[bxs:sm]> "sm"
    <div[bxs:md]> "md"
    <div[bxs:lg]> "lg"
    <div[bxs:xl]> "xl"
    <div[bxs:2xl]> "2xl"    
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
    <div[bxs:ring]> "ring" # custom
    <div[bxs:ring,2xl]> "combo"
```
To override the default shadows or add new ones simply specify `--box-shadow-{name}` in your styles. You can even override the style of a certain shadow only for a file or specific component by declearing the `--box-shadow-{name}` in a deeper selector.
