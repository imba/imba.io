# @show inline styles are defined in [ ... ]
<div[background:#bee3f8 padding:16px]> "Panel"

# @show common properties have shorter aliases
<div[bg:#e9d8fd p:16px]> "Panel"

# @show common properties have shorter aliases
<div[bg:teal2 color:teal7 radius:3 p:4 fs:sm fw:bold]> "Panel"

# @show @hover modifier
<div[p:4 color:green6 bg:green2 @hover:green3]> "Hover me"

let skew = -10deg
# @show dynamic style properties
<div[bg:teal2 color:teal7 p:4 skew-x:{skew}]> "Skewed"

