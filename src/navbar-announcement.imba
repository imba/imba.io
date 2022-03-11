tag navbar-announcement
	prop post\{id:string, context:string, title:string, link:string, linkText:string}
	
	def close
		const key = "p:{post.id}:seen"
		window.localStorage.setItem key, "1"
		imba.unmount self

	css w:100% h:100% d:hflex ai:center jc:center 
		.container
			p:3 px:4 bgc:white rd:lg shadow:0 10px 15px 20px black/10 
			pos:fixed b:0 l:0 r:0 
			@lg b:auto r:auto l:auto pos:relative t:1 mx:8 shadow:lg
			
			ease:quint-out zi:10
			@off o:0 scale:0.8
			# Layout
			d:grid g:3 gt:auto auto / repeat(16, 1fr) 
			@md gt:auto / repeat(16, 1fr) ai:center
		.close order:3 order@md:4  gc: -2 / -1
		.join ta:center order:4 gc:1 / -1
			@md order:3 gc:span 3 js:end
		.content gc:2 / -2 gc@md:span 11

	def render
		<self ease>
			<.container>
				<span[rd:lg bg:white c:$night d:flex ai:center as:center js:center]>
					<svg[size:6] src="./assets/icons/announcement.svg" aria-hidden="true">
				<span.content[c:$night fw:500]> 
					post.title
					
				if post.link
					<a.join[fw:600 bgc:white c:$night] href=post.link target="_blank">
						post.linkText or "Join now"
				<a.close.sm[o:0.7 o@hover:1 cursor:pointer bg:transparent d:flex ai:center as:center js:center] @click=close>
					<svg[size:3.75 c:$night] src="./assets/icons/close.svg">	
