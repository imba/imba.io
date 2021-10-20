# [preview=md]
import 'util/styles'

# ---
const data = {a:0,b:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<div[w:80px].rect @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"