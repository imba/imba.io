require './snippet'

var code = """
tag todos

tag todo

<todos>
	<todo> 'This is a task'
	<todo> 'Another task here'
	<todo>
		'Another task here'
		<ul>
			<li> \"jada {Math.random}\"
	<todo> 'Another task here'
	<todo> 'Another task here'
"""

tag gist < snippet

	tag sep

	tag pane

	tag group

	def render
		return self if Imba.SERVER

		<self.dark>
			<group.hor>
				<pane@main>
					@input
					<overlays@overlays view=view> overlays
					@view.end
				<sep>
				<group.ver>
					<pane> <jsview@jsview>
					<pane> self.sandbox
					self.console

	def sandbox
		<sandbox@sandbox.xray.pane editor=self>

	def awaken
		view.load(code,{})
		configure({})
