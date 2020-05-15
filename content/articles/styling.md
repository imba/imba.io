```imba
<div.(font-weight:700)> "Bold text"
```

```imba
tag x-app
	css .blue = bg:blue200 color:blue800 bg.hover:blue300
	css .teal = bg:teal200 color:teal800 bg.hover:teal300
	css .yellow = bg:yellow200 color:yellow800 bg.hover:yellow300
	css .red = bg:red200 color:red800 bg.hover:red300
	css .item = p:4 flex:1 radius:3
	
	def render
		<self .(l:flex wrap space:1)>
			<div.blue.item> "One"
			<div.red.item> "Two"
			<div.teal.item> "Three"
			<div.yellow.item> "Four"

imba.mount <x-app>
```

```imba
tag app-repl-styled
	def render
		<self.repl .(l:flex inset:20 radius:2 shadow:xl) .(d:none)=!showing>
			<div.underlay .(l:fixed inset:0 z-index:-1 bg:black-10) @click=hide>
			<div.(l:vflex rel flex:70% ai:stretch bg:gray-900-20) @resize=relayout>
				<header.(color:gray-600)>
```

```imba
tag app-repl-styled
	def render
		<self.repl (l:flex inset:20 radius:2 shadow:xl) (d:none)=!showing>
			<div.underlay (l:fixed inset:0 z-index:-1 bg:black-10) @click=hide>
			<div (l:vflex rel flex:70% ai:stretch bg:gray-900-20) @resize=relayout>
				<header (color:gray-600) :hover(bg:gray)>
```

```imba
tag app-code-block < app-code

    css button { px:2 py:1 fw:bold td.hover:underline }
    css .blue { bg:blue-200 fc:blue-800 bg.hover:blue-300 fc.hover:blue-900 }
    css .teal { bg:teal-200 fc:teal-800 bg.hover:teal-300 fc.hover:teal-900 }

	def render
		<self>
            <div {top:1 right:1 c:blue-400 px:2 3 l:flex sticky}>
                <button.teal @click.edit> 'edit'
				<button.blue @click.run> 'run'
                
```

```imba
tag app-code-block < app-code

    css button = px:2 py:1 fw:bold td.hover:underline
    css .blue = bg:blue-200 fc:blue-800 bg.hover:blue-300 fc.hover:blue-900
    css .teal = bg:teal-200 fc:teal-800 bg.hover:teal-300 fc.hover:teal-900

	def render
		<self>
            <div [top:1 right:1 c:blue-400 px:2 3 l:flex sticky]>
                <button.teal @click.edit> 'edit'
				<button.blue @click.run> 'run'
```

```imba
tag app-code-block < app-code

    css button = px:2 py:1 fw:bold td.hover:underline
    css .blue = bg:blue-200 fc:blue-800 bg.hover:blue-300 fc.hover:blue-900
    css .teal = bg:teal-200 fc:teal-800 bg.hover:teal-300 fc.hover:teal-900

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

```imba
tag app
    def render
		<self.(l:contents f:antialised) @run=runCodeBlock(e.detail)>
			<app-header.(l:sticky top:0)>
			<.page-wrapper.(l:flex mx:auto max-width: 1400px)>
				<div.(l:static noclip-y block)>
				<div.(l:sticky flex: 1 1 auto)> <app-document data=page>
```
The `.()` looks rather clunky, but has a few things going for it. The styles you add here acts like an inline generated class, so it fits the existing class-syntax.

```imba
tag app
    def render
		<self @run=runCodeBlock(e.detail) {l:contents f:antialised}>
			<app-header {l:sticky top:0}>
			<.page-wrapper {l:flex mx:auto max-width: 1400px}>
				<div {l:static noclip-y block}>
				<div {l:sticky flex: 1 1 auto}> <app-document data=page>
```


```imba
tag app
    def render
		<self ${l:contents f:antialised} @run=runCodeBlock(e.detail)>
			<app-header ${l:sticky top:0}>
			<.page-wrapper ${l:flex mx:auto max-width: 1400px}>
				<div ${l:static noclip-y block}>
				<div ${l:sticky flex: 1 1 auto}> <app-document data=page>
```
More verbose – explicitly add some sort of prefix (`$%*&`?) in front if curly braces to denote smart styles for the tag.

```imba
tag app
    def render
		<self (l:contents f:antialised) @run=runCodeBlock(e.detail)>
			<app-header (l:sticky top:0)>
			<.page-wrapper (l:flex mx:auto max-width: 1400px)>
				<div (l:static noclip-y block)>
				<div (l:sticky flex: 1 1 auto)> <app-document data=page>
```

```imba
tag app
    def render
		<self[l:contents f:antialised] @run=runCodeBlock(e.detail)>
			<app-header[l:sticky top:0]>
			<.page-wrapper[l:flex mx:auto max-width: 1400px]>
				<div[l:static noclip-y block]>
				<div[l:sticky flex: 1 1 auto]> <app-document data=page>
```
We could use `tag[]` syntax for styling instead of `data=value` shorthand. This would allow for the least amount of characters, and no confusion between `.{classname}` and `{smart: styles}`. One can argue that the magical `[data]` shorthand is confusing anyways.


```imba
tag app
    def render
		<self.l(contents).f(antialised) @run=runCodeBlock(e.detail)>
			<app-header.l(sticky).top(0)>
			<.page-wrapper.l(flex).mx(auto).max-width(1400px)>
				<div .l(static noclip-y block)>
				<div .l(sticky).flex(1 1 auto)> <app-document data=page>
```

```imba
tag app
    def render
		<self.l:contents.f:antialised @run=runCodeBlock(e.detail)>
			<app-header .l:sticky .top:0>
			<.page-wrapper.l(flex).mx(auto).max-width(1400px)>
				<div .l(static noclip-y block)>
				<div .l(sticky).flex(1 1 auto)> <app-document data=page>
```

```imba


tag app-code-block < app-code

	css h1 { text: 6xl/1.4 gray-700 semibold mt:5 mb:3 }
	css h2 { text: 4xl/1.2 border-bottom: 1px solid gray-300}
	css .h3 { text: 2xl/1.2 border-bottom: 1px solid gray-300-70 }
	
    css h1 = text: 6xl/1.4 gray-700 semibold mt:5 mb:3 
	css h2 = text: 4xl/1.2 border-bottom: 1px solid gray-300
	css h3 = text: 2xl/1.2 border-bottom: 1px solid gray-300-70 

    css h4
        font-size: 1xl/1.2
        border-bottom: 1px solid gray-300-70
        &:before { content: 'hello' color:blue-600 }
        &:after { content: 'suffix' color:gray-300-20 }

    css h4
        font-size: 1xl/1.2 border-bottom: 1px solid gray-300-70
        &:before = content: 'hello' color:blue-600
        &:after = content: 'suffix' color:gray-300-20

    css h4
        font-size: 1xl/1.2 border-bottom: 1px solid gray-300-70
        &:before { content: 'hello' color:blue-600 }
        &:after { content: 'suffix' color:gray-300-20 }

    css .blue = bg:blue-200 text:blue-800
        &:hover = text:blue-900 bg:blue-300

    css .blue
        bg:blue-200 text:blue-800
        &:hover { text:blue-900 bg:blue-300 }

    css .blue { bg:blue-200 color:blue-800 bg.hover:blue-300 color.hover:blue-900 }

    css .blue {
        bg:blue-200
        text:blue-800
        bg.hover:blue-300
        text.hover:blue-900
    }

    css .blue {
        bg:blue-200
        text:blue-800
        &:hover { bg:blue-300 text:blue-900 }
    }

	def render
		<self>
            <div {top:1 right:1 c:blue-400 px:2 3 l:flex sticky}>
				<button {px:2 td.hover:underline fw:bold} @click.run> 'run'

tag app-repl-styled
	def render
		const $header = .{p:3,height:12,color:gray-800,d:flex,ai:center,fs:sm,fw:500}
		const $tab = .{p:1 2, color.is-active:blue-300}

		<self.repl .(l:fixed flex clip,inset:20,z-index:100,bg:$code-bg-lighter,radius:2,shadow:xl) .(d:none)=!showing>
			<div.underlay .(l:fixed,inset:0,z-index:-1,bg:black-10) @click=hide>
			<div.(l:vflex rel,flex:70%,bg:gray-900-20) @resize=relayout>
				<header.{$header}.(color:gray-600)>
					<div.(d:contents,cursor:default)> for file in project..children
						<div.{$tab} @click=(currentFile = file) .active=(currentFile == file)> <span> file.name

				<div$editor.(l:abs,inset:12 0 0)>

			<div.(l:vflex,flex:1 1 30%,bg:white)>
				<div.(l:vflex,flex:1)>
					<header.{$header}.(bg:gray-200)> <.tab> "Preview"
					<div.(l:rel,flex:1)> $iframe
				<div.divider>
				<div$console.(flex:40%,l:vflex)>
					<header.{$header}.(bg:gray-200)>
						<.tab> "Console"
						<.(grow:1)>
						<button @click=(logs = [])> 'Clear'
					<.content.(flex:1)> for item in logs
						<div.log-item> item.join(", ")
	

const button = ${
    bg:blue-200, color:blue-700, p:2, p.lg:3,
    hover{bg:blue-200,color:blue-800}
}

const button = ${
    bg:blue-200, color:blue-700, p:2, p.lg:3,
    &:hover { bg:blue-200,color:blue-800 }
}

const button = ${
    bg:blue-200;color:blue-700;p:2;p.lg:3;
    bg.hover:blue-300;color.hover:blue-800;
    &:hover { bg:blue-200,color:blue-800 }
}

tag x-app
	prop checked = false
	
	def render
		<self>
			<div.{button}> 'Button?'
			<div.{button} .(fw:bold;bg.hover:blue-400)> 'Button?'
            <div [button,fw:bold;bg.hover:blue-400]> 'Button?'
            <div.{button}.fw(bold).bg-hover(blue-400)> 'Button?'
            <div {button,fw:bold;bg.hover:blue-400}> 'Button?'
            <div ${button,fw:bold;bg.hover:blue-400}> 'Button?'
            <div {button! red! fw:bold bg.hover:blue-400}> 'Button?'

			<div.{markdown}>
				<h1> "Heading 1"
				<h2> "Heading 2"
				<p> "Paragraph"
				<h3> "Heading 3"
				
			<div.{colored} .(display:flex,space:1)> for item,i in labels
				<div.{transform}.{item.color} .(p:4;flex:1;rounded:6px;$rotate.hover:3deg)> <span> item.title

tag x-app
	def render
		<self>
			<div.{transform}.{button}> 'Button?'
			<div.{transform}.{button} .(fw:bold bg.hover:blue(400) scale.md:1.3 rotate:2deg)> 'Button?'

const button = ${
    bg:blue-200, color:blue-700, p:2, p.lg:3,
    bg.hover:blue-200,color.hover:blue-800;
    font:bold sm/2;

    &.blue { bg:blue-200,text:blue-800,text.hover:blue-900,bg.hover:blue-300}
    &.teal { bg:teal-200,text:teal-800,text.hover:teal-900,bg.hover:teal-300}
    &.green { bg:green-200,text:green-800,text.hover:green-900,bg.hover:green-300}
}

const button = ${
    bg:blue-200, color:blue-700, p:2, p.lg:3,
    bg.hover:blue-200,color.hover:blue-800,
    fs:5/2, p:1 2, px:2,py:1

    (&.blue) { bg:blue-200,text:blue-800,text.hover:blue-900,bg.hover:blue-300}
    (&.teal) { bg:teal-200,text:teal-800,text.hover:teal-900,bg.hover:teal-300}
    (&.green) { bg:green-200,text:green-800,text.hover:green-900,bg.hover:green-300}
}

const button = ${
    bg:blue-200;color:blue-700; p:2; p.lg:3;
    bg.hover:blue-200;color.hover:blue-800;
    p:1 2; px:2; py:1;

    &.blue { bg:blue-200;text:blue-800;text.hover:blue-900;bg.hover:blue-300}
    &.teal { bg:teal-200;text:teal-800;text.hover:teal-900;bg.hover:teal-300}
    &.green { bg:green-200;text:green-800;text.hover:green-900;bg.hover:green-300}
}

const button = ${
    p:2 p.lg:3 rounded:1 @semibold @hidden
    &.blue { bg:blue-200 text:blue-800 text.hover:blue-900 bg.hover:blue-300}
    &.teal { bg:teal-200 text:teal-800 text.hover:teal-900 bg.hover:teal-300}
    &.green { bg:green-200 text:green-800 text.hover:green-900 bg.hover:green-300}
}

# vertical inline middle center
# hbml horizontal box middle left

const styles = ${
    .button {vimc, bg:blue-200, text:blue-800, text.hover:blue-900}
}

const colors =
	blue:   ${bg:blue-200,text:blue-800,hover:{text:blue-900,bg:blue-300}}
	red:    ${bg:red-200,text:red-800,hover:{text:red-900,bg:red-300}}
	teal:   ${bg:teal-200,text:teal-800,hover:{text:teal-900,bg:teal-300}}
	yellow: ${bg:yellow-200,text:yellow-800,hover:{text:yellow-900,bg:yellow-300}}

const items = ['one','two','three','four']
const box = ${vsc p-4 flex-1 bg-teal-600/25 teal-600 rounded-2 hover:bg-opacity/50}

<div>
    <div ${hidden;block.md}>
        <div${ml:4;hbmc;ml.md:6}>
        <button ${p:1;border:2 transparent; text:gray400; radius:full; text.hover:white; focus{outline:none;text:white;bg:gray700}} aria-label="Notifications">
<div>
    <div class="hidden md:block">
        <div class="ml-4 flex items-center md:ml-6">
        <button class="p-1 border-2 border-transparent text-gray-400 rounded-full hover:text-white focus:outline-none focus:text-white focus:bg-gray-700" aria-label="Notifications">
            <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">

tag x-app
	prop checked = false
	
	def render
		<self.(cursor-default) .checked=checked>
			<h2> "Is checked? {checked}"
			<button.(fs:sm/1.5 color:purple-400 color.hover:blue-600)> "Welcome"
            <button.(fs:sm/1.5,color:purple400,color.hover:blue600)> "Welcome"
			<button.(text-purple-400 hover:text-blue-600)> "Welcome"
			<p.(bg-red-200)> "Decorators"
			<p.(bg-red-200/50) .(font-bold)=checked> "Decorators {checked}"
			<p.(bg-red-200/25 hover:bg-red-200/75)> "Decorators"
			<input[checked] type='checkbox'>
			
			<div.{list}> for item,i in items
				<div.item.{box} .warn=(i > 1)>
					<span.(hover-item:font-bold)> item
					<span.(text-xs hover-item:underline)> "subtitle"
					<span.(blue-700 in-warn:red-600)> "warning?"
			
			<div.{list}> for item,i in items
				<div.item.{box}> <span.(font-bold)> item

tag x-app
	prop checked = false
	
	def render
		<self {cursor:default} .checked=checked>
        <self %cursor:default .checked=checked>
			<h2> "Is checked? {checked}"
			<button {fs:3/1.5,color:purple-400,color.hover:blue-600}> "Welcome"
			<button {color:purple-400 color.hover:blue-600}> "Welcome"
			<p {bg:red200}> "Decorators"
			<p {bg:red200/50} {fw:bold}=checked> "Decorators {checked}"
			<p {bg:red200/25;bg.hover:red200/75}> "Decorators"
            <p {bg:red200/25;bg-opacity.hover:75}> "Decorators"
            <p {bg:red200/25;bgo.hover:75}> "Decorators"
            <p {bg:red200/25;hover.bgo:75}> "Decorators"
            <p {bg:red200/25 bg.hover:red200/75}> "Decorators"
            <p {bg:red200/25 bgo.hover:75}> "Decorators"
            <p {bg:red200/25 hover.bgo:75}> "Decorators"

            <p %bg=red200/25 %bgo.hover=75> "Decorators"
            <p $bg:red200/25 $bgo.hover:75> "Decorators"
            <p.{bg-red-200 bg-opacity-25 hover:bg-opacity-75}> "Decorators"
			<input[checked] type='checkbox'>
			
			<div.{list}> for item,i in items
				<div.item.{box} .warn=(i > 1)>
					<span {fw.hover-item:bold}> item
					<span {fs:xs,td.hover-item:underline}> "subtitle"
					<span {color:blue-700,color.in-warn:red-600}> "warning?"
			
			<div.{list}> for item,i in items
				<div.item.{box}> <span {fw:bold}> item

imba.mount <x-app .(block p(10))>
```