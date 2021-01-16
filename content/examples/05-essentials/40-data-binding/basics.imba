css body p:4
css input d:block p:1 px:2 c:gray8 bw:1 bc:gray4 radius:2px
css div d:block mt:1 c:gray7

let message = "Hello"

imba.mount do <div>
	<input type='text' bind=message>
	<div> "Message is {message}"