
tag imeditor
		
	def render
		<self>
			<imview@view>

	def view
		@view
		
	def activate
		view.activate
		self

	def deactivate
		view.deactivate
		self

	def load code, opts
		view.load(code,opts)
		self

	def fs
		IM.FS

	def oncommand e, c
		if self[c:command] isa Function
			self[c:command].call(self,c:args or [])
			e.halt
		self

	def onsavesession
		console.log "imeditor.saveSession",self
		var path = view.filename.replace(/\.imba$/,'.imbasession')
		var body = JSON.stringify(view.history)

		IM.FS.save(path,body) do
			console.log 'returned from saving!',path