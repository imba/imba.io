Hello there

```imba
tag app-code-block < app-code

    css button = px:2 py:1 fw:bold td.hover:underline
    css .blue = bg:blue-200 fc:blue-800 bg.hover:blue-300 fc.hover:blue-900
    css .teal = bg:teal-200 fc:teal-800 bg.hover:teal-300 fc.hover:teal-900

    css .blue =
        px:2 py:1 fw:bold td.hover:underline
        &:hover = bg:blue-300

	def render
		<self>
            <div[x:{data.x} y:{data.y} right:1 c:blue-400 px:2 3 l:flex sticky]>
                <button[px:1 bg:teal400].teal @click.edit> 'edit'
				<button.blue @click.run> 'run'
            
            # use .{}
            <div.{x:{data.x} y:{data.y} right:1 c:blue-400 px:2 3 l:flex sticky}>

            # use [] for styles instead of data
            <div[x:{data.x} y:{data.y} c:blue-400 px:2 3 l:flex sticky]>

            # use {}
            <div {opacity:0}=data.hidden>
```