css body p:4

const state =
	message: ""
	enabled: false

imba.mount do <label .enabled=state.enabled>
	<input type='checkbox' bind=state.enabled>
	<span[pl:1 color: gray6 ..enabled:green6]> "enabled: {state.enabled}"