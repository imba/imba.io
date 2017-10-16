import List from './list'

export class ListenerManager < List
	
	prop view

	def initialize view
		@view = view
		@array = []
		@stack = []
		self

	def will-add item
		item.@view = view

	def did-add item
		item?.attached(@view)

	def emit event, params
		# console.log 'emit event for ListenerManager',event,params
		if let batch = @stack[0]
			batch:events.push([event,params])
			return yes
		else
			let ret
			map do |item| ret = item.on-event(event,params)
			return ret

	def multi o = {}, &cb
		o:events = []
		@stack.unshift(o)
		cb and cb(o)
		if o:events:length
			map do |item| item.on-events(o:events,o)
		@stack.shift
		self


export class Listener
	
	prop view
	prop disabled

	def attached view
		self


	def disable
		disabled = yes
		self

	def enable
		disabled = no
		self

	def on-event event,params
		return if disabled

		let fn = self["on{event}"]
		if fn
			return fn.call(self,params)

	def on-events events, options
		for event in events
			on-event(event[0],event[1])
		return self

	# Called when a new buffer is created.
	def on-new view
		self

	# Called when a new buffer is created. Runs in a separate thread, and does not block the application.
	def on-new-async view
		self

	# Called when a view is cloned from an existing one.
	def on-clone view
		self

	# Called when a view is cloned from an existing one. Runs in a separate thread, and does not block the application.
	def on-clone-async view
		self

	# Called when the file is finished loading.
	def on-load view
		self
	
	# Called when the file is finished loading. Runs in a separate thread, and does not block the application.
	def on-load-async view
		self
	
	# Called when a view is about to be closed. The view will still be in the window at this point.
	def on-pre-close view
		self
	
	# Called when a view is closed (note, there may still be other views into the same buffer).
	def on-close view
		self
	
	# Called just before a view is saved.
	def on-pre-save view
		self
	
	# Called just before a view is saved. Runs in a separate thread, and does not block the application.
	def on-pre-save-async view
		self
	
	# Called after a view has been saved.
	def on-post-save view
		self
	
	
	# Called after a view has been saved. Runs in a separate thread, and does not block the application.
	def on-post-save-async view
		self
	
	
	# Called after changes have been made to a view.
	def on-modified view
		self
	
	
	# Called after changes have been made to a view. Runs in a separate thread, and does not block the application.
	def on-modified-async view
		self
	
	# Called after the selection has been modified in a view.
	def on-selection-modified view
		self
	
	
	# Called after the selection has been modified in a view. Runs in a separate thread, and does not block the application.
	def on-selection-modified-async view
		self
	
	
	# Called when a view gains input focus.
	def on-activated view
		self
	
	
	# Called when a view gains input focus. Runs in a separate thread, and does not block the application.
	def on-activated-async view
		self
	
	
	# Called when a view loses input focus.
	def on-deactivated view
		self
	
	# Called when a view loses input focus. Runs in a separate thread, and does not block the application.
	def on-deactivated-async view
		self
	
	
	# Called when a text command is issued. The listener may return a (command, arguments) tuple to rewrite the command, or None to run the command unmodified.
	def on-text-command view, command_name, args
		self
	
	# Called when a window command is issued. The listener may return a (command, arguments) tuple to rewrite the command, or None to run the command unmodified.
	def on-window-command window, command_name, args
		self
	
	# Called after a text command has been executed.
	def post-text-command(view, command_name, args)
		self
	
	# Called after a window command has been executed.
	def post-window-command window, command_name, args
		self
	
	def on-query-context view, key, operator, operand, match_all
		self
