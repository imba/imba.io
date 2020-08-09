# css border radius

### aliases

<doc-style-aliases data-keyrule='^b[tlbr]*r$'></doc-style-aliases>

### Predefined radius [preview=lg]
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid pa:center border:1px solid gray3
css section.group px:6 jc:center gap:3
# ---
imba.mount do  <section.group>
    <div[br:xs]> "xs"
    <div[br:sm]> "sm"
    <div[br:md]> "md"
    <div[br:lg]> "lg"
    <div[br:xl]> "xl"
    <div[br:full]> "full"
```

### Declare custom radius [preview=lg]
To override the default shadows or add new ones simply specify `--border-radius-{name}` in your styles
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid pa:center border:1px solid gray3
css section.group px:6 jc:center gap:3
# ---
global css @root
    --border-radius-bubble: 5px 20px 15px 

imba.mount do  <section.group>
    <div[br:xl]> "xl"
    <div[br:bubble]> "bubble"
```