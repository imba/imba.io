# basic styles
css body = p:4
css input = border:gray3 p:2 w:100% radius:2 mb:2

# plain variable
let name = "Jane"
let data = {desc: "No description"}

imba.mount do <div>
	<input[name]>
	# item[expr] is shorthand for <item bind:data=expr>
	<input bind:data=name>
	# can also bind to properties in objects
	<input[data.desc]>



	<div> "Name: {name}"
	<div> data.desc