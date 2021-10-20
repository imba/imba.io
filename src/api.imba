const json = globalThis['api.json']
let counter = 0

const root = new class
	paths = []
	entities = []
	kinds = {}
	lookups = {}
	
	def childByName name
		console.log 'api child by name',name
		return self[name]
		
	def entryForPath path
		paths[path]
		
	def lookup path
		if let m = path.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
			if let ev = paths["/api/Element/{m[1]}"]
				if m[2]
					return ev.modifiers.get("@{m[2]}")
				return ev
		return null

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
		
	get methods
		filter do $1 isa MethodEntity
		
	get own
		filter do $1.owner == #owner
		
	get inherited
		filter do $1.owner != #owner and get($1.name) == $1

	def filter cb
		new Members(#owner,super)
		
	def get name
		find do $1.name == name
	
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
		docs = desc.docs or []
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
		
		root.paths[href] = self
		(root.kinds[kind] ||= []).push(self)
		register!
		
	get guide
		global.FS.find(href)
		
	def register
		self
		
	get props
		let res = (up ? (members.concat(up.props)) : members)
		res.#owner = self
		res
		
	get modifiers
		#modifiers ||= props.filter do $1.modifier?
		
	get properties
		#properties ||= props.properties
		
	get methods
		#methods ||= props.filter do $1 isa MethodEntity
		
	get siblings
		root.kinds[kind].filter do $1 != self
	
	get parents
		[]
		
	get summary
		desc.tags and desc.tags.summary or docs[0]
		
	# get events
	# 	members.events

	get modifier?
		kind == 'eventmodifier'
		
	get property?
		kind == 'property'
		
	get api?
		yes
		
	get displayName
		name
		
	get title
		displayName
		
	get fullName
		owner ? "{owner.fullName}.{displayName}" : displayName
		
	get href
		"/api/{name}"

class InterfaceEntity < Entity
	descendants = []

	def register
		up.descendants.push(self) if up
		yes
		
	get parents
		#parents ||= up ? [up].concat(up.parents) : []

class EventInterfaceEntity < InterfaceEntity
	
	get modifierPrefix
		events.length == 1 ? events[0].displayName : "@{name.toLowerCase!}"
	
class EventEntity < Entity
	
	def register
		root.paths["Element.@{name}"] = self
		type.events.push(self)
		
	get displayName
		"@{name}"
		
	get href
		"/api/Element/{displayName}"
		
	get siblings
		type.events.filter do $1 != self
		
	get properties
		type.properties
		
	get modifiers
		type.modifiers
		
	get typechain
		#typechain ||= [type].concat(type.parents)
		
	# get examples
	#	#examples ||= global.FS.findExamplesFor(new RegExp("({displayName})(?=\\(|\\.|=)",'g'))
		
class EventModifierEntity < Entity
	
	get displayName
		"{name.slice(1)}"
		
	get qualifier
		owner.modifierPrefix
		
	get siblings
		#siblings ||= owner.modifiers.own.filter do $1 != self
		
	get href
		owner.href + '/' + name
		
	get eventNames
		owner.events.map do $1.name
		
	# get examples
	# 	#examples ||= global.FS.findExamplesFor(new RegExp("({eventNames.join('|')})\\.{displayName}(?=\\(|\\.|=)",'g'))
	
class PropertyEntity < Entity
	
	get href
		owner.href + '/' + name	

class MethodEntity < PropertyEntity
	
kindToClass.interface = InterfaceEntity
kindToClass.eventinterface = EventInterfaceEntity
kindToClass.event = EventEntity
kindToClass.property = PropertyEntity
kindToClass.method = MethodEntity
kindToClass.eventmodifier = EventModifierEntity


for entry in json.entries
	root.entities.push Entity.build(entry)
	# let [name,obj] = k.split('.').reverse!
	# let cls = new Entity(k,v)
	# root[k] = cls

global.API = root
export const api = root