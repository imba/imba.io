# css border radius

### aliases

<doc-style-aliases data-keyrule='^rd.*$'></doc-style-aliases>

### Property Aliases [preview=lg]
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid ja:center border:1px solid gray3
css section.group px:6 jc:center gap:2
# ---
imba.mount do  <section.group>
    <div[rd:50%]> "rd" # all
    <div[rdtl:50%]> "rdtl" # top-left
    <div[rdtr:50%]> "rdtr" # top-right
    <div[rdbl:50%]> "rdbl" # bottom-left
    <div[rdbr:50%]> "rdbr" # bottom-right
    <div[rdt:50%]> "rdt" # top-left and top-right
    <div[rdr:50%]> "rdr" # top-right and bottom-right
    <div[rdb:50%]> "rdb" # bottom-left and bottom-right
    <div[rdl:50%]> "rdl" # top-left and bottom-left
```


### Value Aliases [preview=lg]
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid ja:center border:1px solid gray3
css section.group px:6 jc:center gap:2
# ---
imba.mount do  <section.group>
    <div[rd:xs]> "xs"
    <div[rd:sm]> "sm"
    <div[rd:md]> "md"
    <div[rd:lg]> "lg"
    <div[rd:xl]> "xl"
    <div[rd:full]> "full"
```

### Custom Value Aliases [preview=lg]
To override the default shadows or add new ones simply specify `--border-radius-{name}` in your styles
```imba
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid ja:center border:1px solid gray3
css section.group px:6 jc:center gap:3
# ---
global css @root
    --border-radius-bubble: 5px 20px 15px 

imba.mount do  <section.group>
    <div[rd:xl]> "xl"
    <div[rd:bubble]> "bubble"
```

