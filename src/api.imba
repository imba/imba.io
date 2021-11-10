const json = globalThis['api.json']
let counter = 0

const root = new class
	paths = []
	entities = []
	kinds = {}
	lookups = {}
	members = []
	
	icons = {
		down: import('codicons/arrow-small-down.svg')
		up: import('codicons/arrow-small-up.svg')
		left: import('codicons/arrow-small-left.svg')
		right: import('codicons/arrow-small-right.svg')
		record: import('codicons/record.svg')
	}
	
	def childByName name
		console.log 'api child by name',name
		return self[name]
		
	def entryForPath path
		paths[path]
		
	def lookup path
		if paths[path]
			return paths[path]
			
		if let m = path.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
			let path = "/api/Element/{m[1]}"
			if m[1] == '@event'
				path = "/api/Event"

			if let ev = paths[path]
				if m[2]
					return ev.modifiers.get("@{m[2]}")
				return ev
		return null

	get href
		"/api"
		
	get descendants
		entities
		
	def getEvent name
		let ref = "/api/Element/@{name.replace('@','')}"
		if name == 'event'
			ref = "/api/Event"
		lookup(ref)
		
	def getEventModifier evname,modname
		let ev = getEvent(evname)
		if ev
			ev.modifiers.find(do $1.displayName == modname)
		
	def getStyleProperty name
		lookup("/css/properties/{name}")
		
	def getEntityForToken token
		let entity
		if token.type == 'tag.event.name'
			entity = getEvent(token.value)
		elif token.type == 'tag.event-modifier.name'
			let evname = token.context.name
			let modname = token.value
			entity = getEventModifier(evname,modname)
		elif token.type == 'style.property.name'
			entity = lookup("/css/properties/{token.value}")
			
		elif token.type == 'style.property.modifier' or token.type == 'style.selector.modifier'
			entity = lookup("/css/modifiers/{token.value}")
		
		return entity
		
		

class Members < Array
	
	def constructor owner, items = []
		super(...items)
		#owner = owner
		self
		
	get owner
		#owner
		
	get modifiers
		filter do $1.modifier?
		
	get properties
		filter do $1.property?
		
	get custom
		filter do $1.custom?
		
	get domprops
		filter do $1.tags.idl
		
	get idl
		filter do $1.tags.idl

	get interfaces
		filter do $1 isa InterfaceEntity
		
	get methods
		filter do $1 isa MethodEntity
		
	get resources
		[]
		
	get own
		filter do $1.owner == #owner
		
	get inherited
		filter do $1.owner != #owner and get($1.name) == $1
	
	get unique
		filter do self.get($1.name) == $1

	def filter cb
		new Members(#owner,super)
		
	def get name
		find do $1.name == name
	
	get grouped
		let all = unique
		[all.own,all.inherited]
	
const kindToClass = {}

export class Entity
	static def build desc, owner
		let cls = kindToClass[desc.kind] or Entity
		new cls(desc,owner)

	def constructor desc, owner
		id = "api{counter++}"
		name = desc.name
		desc = desc
		owner = owner
		kind = desc.kind
		
		meta = desc.meta or {}
		events = new Members(self)
		members = new Members(self)
		examples = new Set
		
		unless owner
			root[name] = self
		
		if desc.extends
			up = root[desc.extends]
			
		if desc.type
			type = root[desc.type]
		
		if desc.members
			for item in desc.members
				members.push(Entity.build(item,self))
		
		root.entities.unshift(self)
		root.paths[href] = self
		(root.kinds[kind] ||= []).push(self)
		register!
	
	get qualifier
		''

	get tags
		desc.tags
	
	get docs
		desc.docs or ''
		
	get searchTitle
		displayName
		
	get searchText
		#searchText ||= (displayName).replace(/\-/g,'').toLowerCase!
		
	def match query, options
		searchText.indexOf(query) >= 0
		
	get guide
		global.FS.find('/api/reference').childByHead(href)
		
	def register
		self
		
	get props
		let res\Members = (up ? (members.concat(up.props)) : members)
		res.#owner = self
		res
		
	get detail
		tags.detail
		
	get modifiers
		#modifiers ||= props.filter do $1.modifier?
		
	get properties
		#properties ||= props.properties
		
	get methods
		#methods ||= props.filter do $1 isa MethodEntity
		
	get getters
		#getters ||= props.filter do $1.tags.getter
		
		
	get siblings
		root.kinds[kind].filter do $1 != self
	
	get parents
		[]
		
	get breadcrumb
		[self]
		
	get summary
		desc.tags and desc.tags.summary or (docs and docs.length < 200 ? docs : '')
		
	# get events
	# 	members.events
	
	get head
		displayName
	
	get interface?
		no
		
	get modifier?
		kind == 'eventmodifier'
		
	get property?
		kind == 'property'
		
	get method?
		kind == 'method'
		
	get getter?
		!!tags.getter
		
	get member?
		method? or property?
		
	get event?
		kind == 'event'
		
	get eventmod?
		kind == 'eventmodifier'
		
	get stylemod?
		kind == 'stylemod'
		
	get styleprop?
		kind == 'styleprop'
	
	get style?
		stylemod? or styleprop?

	get custom?
		tags.custom or desc.group == 'custom' or tags.special
			
	get idl?
		tags.idl

	get api?
		yes
		
	get displayName
		name
		
	get title
		displayName
		
	get escapedName
		global.escape(name)
		
	get fullName
		owner ? "{owner.fullName}.{displayName}" : displayName
		
	get href
		"/api/{name}"
		
	get mdn
		''
		
	get icon
		import('codicons/symbol-namespace.svg')
		
	get related
		#related ||= if true
			let all = []
			let meta = desc.tags
			for item in root.kinds[kind]
				continue if item == self
				for own k,v of item.tags
					if v == 1 and meta[k] == 1
						all.push(item)
			all

class NamespaceEntity < Entity

class InterfaceEntity < Entity
	descendants = []
	
	get interface?
		yes
	
	get icon
		import('codicons/symbol-class.svg')

	def register
		let par = up
		while par
			par.descendants.push(self)
			par = par.up

		root[name] = self
		yes

	get href
		owner.href + "/{name}"
		
	get parents
		#parents ||= up ? [up].concat(up.parents) : []
	
	get breadcrumb
		#breadcrumb ||= [self]
		
	get mdn
		custom? ? '' : "https://developer.mozilla.org/en-US/docs/Web/API/{name}"
		
	get related
		parents.slice(0).reverse!.concat(descendants)

class EventInterfaceEntity < InterfaceEntity
	
	get modifierPrefix
		events.length == 1 ? "@{events[0].name}" : "@{name.toLowerCase!.replace(/(\w)event/,'$1')}"
		
	get resources
		['/tags/event-handling']

class EventEntity < Entity
	
	get icon
		# import('codicons/symbol-event.svg')
		import('codicons/mention.svg')

	def register
		root.paths["Element.@{name}"] = self
		type.events.push(self)
		
	get displayName
		"{name}"
		
	get searchTitle
		"{name} {displayName}"
		
	get href
		"/api/Element/@{displayName}"
		
	get siblings
		type.events.filter do $1 != self
		
	get properties
		type.properties
		
	get modifiers
		type.modifiers
		
	get parents
		typechain
		
	get typechain
		#typechain ||= [type]
		
	get breadcrumb
		[type,self]
		
	get docs
		siblings.length == 0 and !desc.docs ? type.docs : desc.docs
		
	get related
		let siblings = siblings
		siblings.length > 0 ? siblings : super
		
	get mdn
		return '' if tags.special
		"https://developer.mozilla.org/en-US/docs/Web/API/Element/{name}_event"
		
	get resources
		[type,'/tags/event-handling']

	# get examples
	#	#examples ||= global.FS.findExamplesFor(new RegExp("({displayName})(?=\\(|\\.|=)",'g'))
		
class EventModifierEntity < Entity
	
	get icon
		import('codicons/symbol-event.svg')
	
	get displayName
		"{name.slice(1)}"
		
	get qualifier
		owner.modifierPrefix + "."
		
	get searchTitle
		"{displayName} @{owner.modifierPrefix}.{displayName}"
		
	get siblings
		#siblings ||= owner.modifiers.own.filter do $1 != self
	
	get parents
		#parents ||= [owner]
		
	get href
		owner.href + '/' + name
		
	get eventNames
		owner.events.map do $1.name
	
	get breadcrumb
		[owner,self]
	
	get related
		owner.modifiers.filter do $1 != self
		
	get resources
		[owner,'/tags/event-handling']
		
	# get examples
	# 	#examples ||= global.FS.findExamplesFor(new RegExp("({eventNames.join('|')})\\.{displayName}(?=\\(|\\.|=)",'g'))
	
class PropertyEntity < Entity
	
	get icon
		return import('codicons/symbol-enum.svg') if idl?
		getter? ? import('codicons/symbol-method.svg') : import('codicons/symbol-field.svg')
		
	get searchTitle
		"{owner.name}.{name}"
	
	get siblings
		owner.properties.filter do $1 != self
		
	get parents
		#parents ||= [owner].concat(owner.parents)
		
	get breadcrumb
		[owner,self]
	
	get href
		owner.href + '/' + escapedName	
		
	get mdn
		return '' if custom? or owner.custom?
		owner.mdn + "/{name}"

class MethodEntity < PropertyEntity
	
	get icon
		import('codicons/symbol-method.svg')
		
	get siblings
		owner.methods.filter do $1 != self

class StyleEntity < Entity
	
	
	
class StyleProperty < StyleEntity
	
	def register
		if alias
			root.paths["/css/properties/{alias}"] = self
		super
	
	get icon
		import('codicons/symbol-enum.svg')
	
	get custom?
		desc.tags.custom
	
	get alias
		desc.alias
	
	get shortName
		alias or name
	
	get aliasFor
		custom? ? tags.detail : name
		
	get href
		"/css/properties/{escapedName}"
	
	get searchText
		#searchText ||= [alias,name].filter(do $1).join('').replace(/\-/g,'').toLowerCase!
		
	get mdn
		return null if custom?
		return "https://developer.mozilla.org/en-US/docs/Web/CSS/{name}"
		
class StyleModifier < StyleEntity
	
	get icon
		import('codicons/symbol-enum.svg')
		
	get searchTitle
		name
	
	get custom?
		desc.tags.custom or desc.group == 'custom'
	
	get href
		"/css/modifiers/{name}"
	
class StyleValue < StyleEntity
	
kindToClass.interface = InterfaceEntity
kindToClass.eventinterface = EventInterfaceEntity
kindToClass.event = EventEntity
kindToClass.property = PropertyEntity
kindToClass.method = MethodEntity
kindToClass.eventmodifier = EventModifierEntity
kindToClass.ns = NamespaceEntity

kindToClass.styleprop = StyleProperty
kindToClass.stylemod = StyleModifier


for entry in json.entries
	Entity.build(entry,root)

global.API = root
export const api = root