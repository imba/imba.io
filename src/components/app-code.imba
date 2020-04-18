tag app-code

	def render
		<self>

tag app-code-block < app-code

tag app-code-inline < app-code

### css

app-code-block {
	white-space: pre;
	padding: 24px 24px 24px 24px;
	border-radius: 3px;
	background: var(--code-bg-lighter);
	display: block;
	font-size: 13px;
	color: var(--code-color);
}

###