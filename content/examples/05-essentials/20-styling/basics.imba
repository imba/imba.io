# @show inline styles are defined in .( ... )
<div.(background:#c3dafe;padding:16px;)> "Panel"

# @show semicolons are optional 
<div.(background:#bee3f8 padding:16px)> "Panel"

# @show common properties have shorter aliases
<div.(bg:#e9d8fd p:16px)> "Panel"

# Imba has predefined colors, sizes, spaces, fonts and more
# to make it as easy as possible to maintain a consistent
# design language throught your applications

# @show common properties have shorter aliases
<div.(bg:teal2 color:teal7 radius:3 p:4 f:sm bold)> "Panel"

# These styles are not your regular inline styles. Under the
# hood they compile to optimized css rules. Property modifiers
# helps keep the styles concise and clean

# @show property.hover modifier
<div.(color:green6 color.hover:green9)> "Hover me"
