css body p:4

tag x-checkbox
	def render
		<self> <label.block>
			<input type='checkbox' bind=data>
			<span[pl:1]> <slot>

const state = { enabled: no }

imba.mount do <main>
	<x-checkbox bind=state.enabled> 'Enable'
	if state.enabled
		<span[pl:1 c:gray6]> 'State is enabled'