global.$show = do(text,item)
	imba.mount <div.(p:4 pb:0)>
		<label.(color:gray5 f:sm truncate)> text
		item

global.$log = do(desc,value)
	console.info(desc)
	console.log(value)