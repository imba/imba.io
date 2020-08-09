# css aliases

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

### layout

<doc-style-aliases data-include='d'></doc-style-aliases>

### flexbox

<doc-style-aliases data-regex='flex'></doc-style-aliases>

### grid

<doc-style-aliases data-regex='grid' data-include='g,rg,cg'></doc-style-aliases>

### align

<doc-style-aliases data-keyrule='^a[ics]?$'></doc-style-aliases>

### justify

<doc-style-aliases data-keyrule='^j[ics]?$'></doc-style-aliases>

### place

<doc-style-aliases data-keyrule='^p[ics]$'></doc-style-aliases>

### background

<doc-style-aliases data-regex='background'></doc-style-aliases>

### border

<doc-style-aliases data-keyrule='^bd'></doc-style-aliases>

### border-radius

<doc-style-aliases data-keyrule='^b[tlbr]*r$'></doc-style-aliases>

### transform

<doc-style-transform-aliases></doc-style-transform-aliases>

### other

<doc-style-aliases data-regex='---' data-include='bs,opacity,pe,zi,prefix,suffix,us'></doc-style-transform-aliases>