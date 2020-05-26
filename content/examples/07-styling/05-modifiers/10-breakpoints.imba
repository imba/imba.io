###
xs: @media (min-width: 480px)
sm: @media (min-width: 640px)
md: @media (min-width: 768px)
lg: @media (min-width: 1024px)
xl: @media (min-width: 1280px)

not-xs: @media (max-width: 479px)
not-sm: @media (max-width: 639px)
not-md: @media (max-width: 767px)
not-lg: @media (max-width: 1023px)
not-xl: @media (max-width: 1279px)

###

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
