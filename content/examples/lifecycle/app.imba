console.log 'hello'

var skip-blocked = no

tag app-comp
	prop counter = 0
	prop logs = []
	
	def log value
		logs.push value
		if $logs
			$logs.innerText = logs.join(' -> ')
		
		
	def details
		<div$logs> logs.join(' - ')
	
	def hydrate
		super
		log 'hydrate'
				
	def mount
		super
		log 'mount'
	
	def schedule
		super
		log 'schedule'
		
	def awaken
		super
		log 'awaken'
	
	def render
		log 'render'

tag app-deep < app-comp
	
	def render
		super
		
		<self.box>
			<b> "deep"
			details!

tag app-item < app-comp
	
	def render
		super
		
		<self.box>
			<b> <slot>
			details!
			<app-deep>

tag app-item-blocked < app-item
	
	def render?
		skip-blocked != true
		
tag app-ssr-item < app-item

tag app-root < app-comp
	prop initial-no = no
	prop initial-yes = yes
	
	def mount
		schedule 
	
	def render
		super
		
		<self.box>
			details!
			<div>
				<input$name value="john">
				<button$action :click.{$name.value="jane"}> "Change"
				<button$other-button :click.{$name.value="jean"}> "Change"
				<app-item> 'shown always'
				if initial-yes
					<app-item> 'shown initially'
				if initial-no
					<app-item> 'hidden initially'
				<app-item-blocked> 'block rendering'
			<input[initial-no] type='checkbox'>
			<input[initial-yes] type='checkbox'>
			<input[skip-blocked] type='checkbox'>

			<button :click.silence.{render!}> 'render'
			<button :click.silence.{imba.commit!}> 'imba.commit'
			

var app = <app-root>

imba.mount(app)

### css
.box {
	border: 1px solid red;
	padding: 5px;
	margin: 5px;
	display: block;
}
###