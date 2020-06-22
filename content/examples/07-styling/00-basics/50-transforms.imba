css button
	d:block bg:blue3 color:blue8 radius:2 p:1 3
	transition: 150ms cubic

# @show x:-5px x.hover:5px
<button[ x:-5px @hover:5px]> "Translate x"
# @show y:-5px y.hover:5px
<button[ y:-5px @hover:5px]> "Translate y"

# @show rotate
<button[rotate:2deg]> "Rotate"
# @show skew-x
<button[skew-x:10deg]> "skew-x"
# @show skew-y
<button[skew-y:10deg]> "skew-y"
# @show scale
<button[scale:1.2]> "scale"
# @show scale-x
<button[scale-x:1.2]> "scale-x"
# @show scale-y
<button[scale-y:1.2]> "scale-y"

# @show scale.hover:1.2
<button[scale@hover:1.2]> "Scale on hover"
# @show rotate.hover:1.2
<button[rotate:-5deg rotate@hover:10deg]> "Rotate?"
# @show offset and scale
<button[rotate@hover:10deg scale@hover:1.2]> "Hover me"