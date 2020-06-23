/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _internal_bind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _internal_bind__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_internal_bind__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _internal_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _events_intersect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
/* harmony import */ var _events_selection__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(14);
/* harmony import */ var _events_resize__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(15);
/* harmony import */ var _events_pointer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(7);
/* harmony import */ var _internal_fragment__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(8);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createLiveFragment", function() { return _internal_fragment__WEBPACK_IMPORTED_MODULE_7__["createLiveFragment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createIndexedFragment", function() { return _internal_fragment__WEBPACK_IMPORTED_MODULE_7__["createIndexedFragment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createKeyedFragment", function() { return _internal_fragment__WEBPACK_IMPORTED_MODULE_7__["createKeyedFragment"]; });













/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _internal_flags__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _internal_scheduler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _events_pointer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var _internal_fragment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _internal_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9);
/* harmony import */ var _svg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(10);
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};
var root = ((typeof window !== 'undefined') ? window : (((typeof globalThis !== 'undefined') ? globalThis : null)));

var imba = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
};

root.imba = imba;

root.customElements || (root.customElements = {
	define: function() { return true; },
	get: function() { return true; }
});

imba.setTimeout = function(fn,ms) {
	
	return setTimeout(function() {
		
		fn();
		return imba.$commit();
	},ms);
};

imba.setInterval = function(fn,ms) {
	
	return setInterval(function() {
		
		fn();
		return imba.$commit();
	},ms);
};

imba.clearInterval = root.clearInterval;
imba.clearTimeout = root.clearTimeout;

Object.defineProperty(imba,'flags',{get: function() { return imba.document.documentElement.classList; }});

if (false) {};

imba.q$ = function (query,ctx){
	
	return ((ctx instanceof Element) ? ctx : document).querySelector(query);
};

imba.q$$ = function (query,ctx){
	
	return ((ctx instanceof Element) ? ctx : document).querySelectorAll(query);
};



const VALID_CSS_UNITS = {
	cm: 1,
	mm: 1,
	Q: 1,
	pc: 1,
	pt: 1,
	px: 1,
	em: 1,
	ex: 1,
	ch: 1,
	rem: 1,
	vw: 1,
	vh: 1,
	vmin: 1,
	vmax: 1,
	s: 1,
	ms: 1,
	fr: 1,
	'%': 1,
	in: 1,
	turn: 1,
	grad: 1,
	rad: 1,
	deg: 1,
	Hz: 1,
	kHz: 1
};

const CSS_DEFAULT_UNITS = {
	x: 'px',
	y: 'px',
	z: 'px',
	rotate: 'turn'
};

const CSS_STR_PROPS = {
	prefix: 1,
	suffix: 1,
	content: 1
};

const CSS_PX_PROPS = /^([xyz])$/;
const CSS_DIM_PROPS = /^([tlbr]|size|[whtlbr]|[mp][tlbrxy]?|[rcxy]?g)$/;

imba.toStyleValue = function (value,unit,key){
	
	let typ = typeof value;
	if (typ == 'number') {
		
		if (!unit) {
			
			if (CSS_PX_PROPS.test(key)) {
				
				unit = 'px';
			} else if (CSS_DIM_PROPS.test(key)) {
				
				unit = 'u';
			} else if (key == 'rotate') {
				
				unit = 'turn';
			};
		};
		
		if (unit) {
			
			if (VALID_CSS_UNITS[unit]) {
				
				
				return value + unit;
			} else if (unit == 'u') {
				
				return value * 4 + 'px';
			} else {
				
				return ("calc(var(--u_" + unit + ",1px) * " + value + ")");
			};
		} else {
			
			true;
		};
	} else if (typ == 'string' && key) {
		
		if (CSS_STR_PROPS[key] && value[0] != '"' && value[0] != "'") {
			
			if (value.indexOf('"') >= 0) {
				
				if (value.indexOf("'") == -1) {
					
					value = "'" + value + "'";
				} else {
					
					false;
				};
			} else {
				
				value = '"' + value + '"';
			};
		};
	};
	
	return value;
};

imba.inlineStyles = function (content,id){
	
	_css__WEBPACK_IMPORTED_MODULE_0__["register"](content,id);
	
	
	
	return;
};

var dashRegex = /-./g;

imba.toCamelCase = function (str){
	
	if (str.indexOf('-') >= 0) {
		
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		
		return str;
		
	};
};



var emit__ = function(event,args,node) {
	
	let prev;
	let cb;
	let ret;
	
	while ((prev = node) && (node = node.next)){
		
		if (cb = node.listener) {
			
			if (node.path && cb[node.path]) {
				
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				
				
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && --node.times <= 0) {
			
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};


imba.listen = function (obj,event,listener,path){
	
	let cbs;
	let list;
	let tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};


imba.once = function (obj,event,listener){
	
	let tail = imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};


imba.unlisten = function (obj,event,cb,meth){
	
	let node;
	let prev;
	let meta = obj.__listeners__;
	if (!meta) { return };
	
	if (node = meta[event]) {
		
		while ((prev = node) && (node = node.next)){
			
			if (node == cb || node.listener == cb) {
				
				prev.next = node.next;
				
				node.listener = null;
				break;
			};
		};
	};
	return;
};


imba.emit = function (obj,event,params){
	var cb;
	
	if (cb = obj.__listeners__) {
		
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) };
	};
	return;
};





imba.scheduler = new _internal_scheduler__WEBPACK_IMPORTED_MODULE_2__["Scheduler"]();
imba.$commit = function() { return imba.scheduler.add('render'); };

imba.commit = function() {
	
	imba.scheduler.add('render');
	return imba.scheduler.promise;
};

imba.tick = function() {
	
	imba.commit();
	return imba.scheduler.promise;
};




imba.mount = function (mountable,into){
	
	let parent = into || document.body;
	let element = mountable;
	if (mountable instanceof Function) {
		
		let ctx = {_: parent};
		let tick = function() {
			
			imba.ctx = ctx;
			return mountable(ctx);
		};
		element = tick();
		imba.scheduler.listen('render',tick);
	} else {
		
		
		
		element.__F |= 64;
	};
	
	return parent.appendChild(element);
};

var proxyHandler = {
	get(target,name){
		
		let ctx = target;
		let val = undefined;
		while (ctx && val == undefined){
			
			if (ctx = ctx.$parent) {
				
				val = ctx[name];
			};
		};
		return val;
	}
};




extend$(Node,{
	
	
	get $context(){
		
		return this.$context_ || (this.$context_ = new Proxy(this,proxyHandler));
	},
	
	get $parent(){
		
		return this.up$ || this.parentNode;
	},
	
	init$(){
		
		return this;
	},
	
	
	replaceWith$(other){
		
		if (!((other instanceof Node)) && other.replace$) {
			
			other.replace$(this);
		} else {
			
			this.parentNode.replaceChild(other,this);
		};
		return other;
	},
	
	insertInto$(parent){
		
		parent.appendChild$(this);
		return this;
	},
	
	insertBefore$(el,prev){
		
		return this.insertBefore(el,prev);
	},
	
	insertBeforeBegin$(other){
		
		return this.parentNode.insertBefore(other,this);
	},
	
	insertAfterEnd$(other){
		
		if (this.nextSibling) {
			
			return this.nextSibling.insertBeforeBegin$(other);
		} else {
			
			return this.parentNode.appendChild(other);
		};
	},
	
	insertAfterBegin$(other){
		
		if (this.childNodes[0]) {
			
			return this.childNodes[0].insertBeforeBegin$(other);
		} else {
			
			return this.appendChild(other);
		};
	},
});

extend$(Comment,{
	
	
	replaceWith$(other){
		
		if (other && other.joinBefore$) {
			
			other.joinBefore$(this);
		} else {
			
			this.parentNode.insertBefore$(other,this);
		};
		
		this.parentNode.removeChild(this);
		
		return other;
	},
});


extend$(Element,{
	
	
	emit(name,detail,o = {bubbles: true}){
		
		if (detail != undefined) { o.detail = detail };
		let event = new CustomEvent(name,o);
		let res = this.dispatchEvent(event);
		return event;
	},
	
	slot$(name,ctx){
		
		return this;
	},
	
	on$(type,mods,scope){
		
		
		let check = 'on$' + type;
		let handler;
		
		
		if (this[check] instanceof Function) {
			
			handler = this[check](mods,scope);
		};
		
		handler = new _events__WEBPACK_IMPORTED_MODULE_3__["EventHandler"](mods,scope);
		let capture = mods.capture;
		let passive = mods.passive;
		
		let o = capture;
		
		if (passive) {
			
			o = {passive: passive,capture: capture};
		};
		
		if (type == 'touch') {
			
			type = 'pointerdown';
			handler.type = 'touch';
		};
		
		this.addEventListener(type,handler,o);
		return handler;
	},
	
	
	text$(item){
		
		this.textContent = item;
		return this;
	},
	
	insert$(item,f,prev){
		
		let type = typeof item;
		
		if (type === 'undefined' || item === null) {
			
			
			if (prev && (prev instanceof Comment)) {
				
				return prev;
			};
			
			let el = document.createComment('');
			prev ? prev.replaceWith$(el) : el.insertInto$(this);
			return el;
		};
		
		
		if (item === prev) {
			
			return item;
		} else if (type !== 'object') {
			
			let res;
			let txt = item;
			
			if ((f & 128) && (f & 256)) {
				
				
				
				
				this.textContent = txt;
				return;
			};
			
			if (prev) {
				
				if (prev instanceof Text) {
					
					prev.textContent = txt;
					return prev;
				} else {
					
					res = document.createTextNode(txt);
					prev.replaceWith$(res,this);
					return res;
				};
			} else {
				
				this.appendChild$(res = document.createTextNode(txt));
				return res;
			};
		} else {
			
			prev ? prev.replaceWith$(item,this) : item.insertInto$(this);
			return item;
		};
		return;
		
	},
	get flags(){
		
		if (!(this.$flags)) {
			
			
			this.$flags = new _internal_flags__WEBPACK_IMPORTED_MODULE_1__["Flags"](this);
			if (this.flag$ == Element.prototype.flag$) {
				
				this.flags$ext = this.className;
			};
			this.flagDeopt$();
		};
		return this.$flags;
	},
	
	flag$(str){
		
		this.className = str;
		return;
		
	},
	flagDeopt$(){
		var self = this;
		
		this.flag$ = function(str) { return self.flagSync$(self.flags$ext = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.flags$own = str); };
		return;
	},
	
	flagSelf$(str){
		
		
		
		this.flagDeopt$();
		return this.flagSelf$(str);
		
		
		
		
		
		
	},
	
	flagSync$(){
		
		return this.className = ((this.flags$ext || '') + ' ' + (this.flags$own || '') + ' ' + (this.$flags || ''));
	},
	
	open$(){
		
		return this;
	},
	
	close$(){
		
		return this;
	},
	
	end$(){
		
		if (this.render) { this.render() };
		return;
	},
	
	css$(key,value,mods){
		
		return this.style[key] = value;
		
	},
	css$var(name,value,unit,key){
		
		let cssval = imba.toStyleValue(value,unit,key);
		this.style.setProperty(name,cssval);
		return;
	},
});

Element.prototype.appendChild$ = Element.prototype.appendChild;
Element.prototype.removeChild$ = Element.prototype.removeChild;
Element.prototype.insertBefore$ = Element.prototype.insertBefore;
Element.prototype.replaceChild$ = Element.prototype.replaceChild;
Element.prototype.set$ = Element.prototype.setAttribute;
Element.prototype.setns$ = Element.prototype.setAttributeNS;

ShadowRoot.prototype.insert$ = Element.prototype.insert$;
ShadowRoot.prototype.appendChild$ = Element.prototype.appendChild$;




imba.createLiveFragment = _internal_fragment__WEBPACK_IMPORTED_MODULE_5__["createLiveFragment"];
imba.createIndexedFragment = _internal_fragment__WEBPACK_IMPORTED_MODULE_5__["createIndexedFragment"];
imba.createKeyedFragment = _internal_fragment__WEBPACK_IMPORTED_MODULE_5__["createKeyedFragment"];





const CustomTagConstructors = {};

class ImbaElementRegistry {
	
	
	constructor(){
		
		this.types = {};
	}
	
	lookup(name){
		
		return this.types[name];
	}
	
	get(name,klass){
		
		if (!name || name == 'component') { return _internal_component__WEBPACK_IMPORTED_MODULE_6__["ImbaElement"] };
		if (this.types[name]) { return this.types[name] };
		if (false) {};
		if (klass && root[klass]) { return root[klass] };
		return root.customElements.get(name) || _internal_component__WEBPACK_IMPORTED_MODULE_6__["ImbaElement"];
	}
	
	create(name){
		
		if (this.types[name]) {
			
			
			return this.types[name].create$();
		} else {
			
			return document.createElement(name);
		};
	}
	
	define(name,klass,options){
		
		this.types[name] = klass;
		klass.nodeName = name;
		
		let proto = klass.prototype;
		
		
		
		
		if (options && options.extends) {
			
			CustomTagConstructors[name] = klass;
		} else {
			
			root.customElements.define(name,klass);
		};
		return klass;
	}
};

imba.tags = new ImbaElementRegistry();




imba.createElement = function (name,parent,flags,text){
	
	var el = document.createElement(name);
	
	if (flags) { el.className = flags };
	
	if (text !== null) {
		
		el.text$(text);
	};
	
	if (parent && (parent instanceof Node)) {
		
		el.insertInto$(parent);
	};
	
	return el;
};

imba.createComponent = function (name,parent,flags,text){
	
	
	var el;
	
	if (typeof name != 'string') {
		
		if (name && name.nodeName) {
			
			name = name.nodeName;
		};
	};
	
	if (CustomTagConstructors[name]) {
		
		el = CustomTagConstructors[name].create$(el);
		el.slot$ = _internal_component__WEBPACK_IMPORTED_MODULE_6__["ImbaElement"].prototype.slot$;
		el.__slots = {};
	} else {
		
		el = document.createElement(name);
	};
	
	el.up$ = parent;
	el.init$();
	
	if (text !== null) {
		
		el.slot$('__').text$(text);
	};
	
	
	if (flags) {
		
		el.flag$(flags);
	};
	return el;
};



imba.createSVGElement = function (name,parent,flags,text){
	
	var el = document.createElementNS("http://www.w3.org/2000/svg",name);
	if (flags) {
		
		if (false) {} else {
			
			el.className.baseVal = flags;
		};
	};
	if (parent && (parent instanceof Node)) {
		
		el.insertInto$(parent);
	};
	return el;
};




/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });

let root;
let resets = '*,::before,::after {	box-sizing: border-box;	border-width: 0;	border-style: solid;	border-color: currentColor;}';

function setup(){
	
	if (!root) {
		
		if (root = document.documentElement) {
			
			return register(resets,'root');
		};
	};
};

function register(styles,id){
	
	setup();
	var el = document.createElement('style');
	el.textContent = styles;
	document.head.appendChild(el);
	return;
};


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Flags", function() { return Flags; });
class Flags {
	
	
	constructor(dom){
		
		this.dom = dom;
		this.string = "";
	}
	
	contains(ref){
		
		return this.dom.classList.contains(ref);
	}
	
	add(ref){
		
		if (this.contains(ref)) { return this };
		this.string += (this.string ? ' ' : '') + ref;
		this.dom.classList.add(ref);
		
		return this;
	}
	
	remove(ref){
		
		if (!this.contains(ref)) { return this };
		var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
		this.string = this.string.replace(regex,'');
		this.dom.classList.remove(ref);
		
		return this;
	}
	
	toggle(ref,bool){
		
		if (bool === undefined) { bool = !this.contains(ref) };
		return bool ? this.add(ref) : this.remove(ref);
	}
	
	valueOf(){
		
		return this.string;
	}
	
	toString(){
		
		return this.string;
	}
	
	sync(){
		
		return this.dom.flagSync$();
	}
};


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Scheduler", function() { return Scheduler; });
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };
var raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (function(blk) { return setTimeout(blk,1000 / 60); });



class Scheduler {
	
	constructor(){
		var self = this;
		
		this.queue = [];
		this.stage = -1;
		this.batch = 0;
		this.scheduled = false;
		this.listeners = {};
		this.$promise = null;
		this.$resolve = null;
		this.$ticker = function(e) {
			
			self.scheduled = false;
			return self.tick(e);
		};
		this;
	}
	
	add(item,force){
		
		if (force || this.queue.indexOf(item) == -1) {
			
			this.queue.push(item);
		};
		
		if (!(this.scheduled)) { return this.schedule() };
	}
	
	listen(ns,item){
		var $listeners;
		
		($listeners = this.listeners)[ns] || ($listeners[ns] = new Set);
		return this.listeners[ns].add(item);
	}
	
	unlisten(ns,item){
		
		return this.listeners[ns] && this.listeners[ns].delete(item);
	}
	
	get promise(){
		var self = this;
		
		return this.$promise || (this.$promise = new Promise(function(resolve) {
			
			return self.$resolve = resolve;
		}));
	}
	
	tick(timestamp){
		var self = this;
		
		var items = this.queue;
		if (!(this.ts)) { this.ts = timestamp };
		this.dt = timestamp - this.ts;
		this.ts = timestamp;
		this.queue = [];
		this.stage = 1;
		this.batch++;
		
		if (items.length) {
			
			for (let i = 0, $items = iter$(items), $len = $items.length; i < $len; i++) {
				let item = $items[i];
				
				if (typeof item === 'string' && this.listeners[item]) {
					
					this.listeners[item].forEach(function(item) {
						
						if (item.tick instanceof Function) {
							
							return item.tick(self);
						} else if (item instanceof Function) {
							
							return item(self);
						};
					});
				} else if (item instanceof Function) {
					
					item(this.dt,this);
				} else if (item.tick) {
					
					item.tick(this.dt,this);
				};
			};
		};
		this.stage = 2;
		this.stage = this.scheduled ? 0 : -1;
		if (this.$promise) {
			
			this.$resolve(this);
			this.$promise = this.$resolve = null;
		};
		return this;
	}
	
	schedule(){
		
		if (!(this.scheduled)) {
			
			this.scheduled = true;
			if (this.stage == -1) {
				
				this.stage = 0;
			};
			raf(this.$ticker);
		};
		return this;
	}
};


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventHandler", function() { return EventHandler; });
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};


const keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	left: [37],
	right: [39],
	del: [8,46]
};


extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["Event"],{
	
	
	wait$mod(state,params){
		
		return new Promise(function(resolve) {
			
			return setTimeout(resolve,(((typeof params[0]=='number'||params[0] instanceof Number)) ? params[0] : 1000));
		});
	},
	
	sel$mod(state,params){
		
		return state.event.target.closest(params[0]) || false;
	},
	
	throttle$mod({handler: handler,element: element,event: event},params){
		
		if (handler.throttled) { return false };
		handler.throttled = true;
		let name = params[0];
		if (!((typeof name=='string'||name instanceof String))) {
			
			name = ("in-" + (event.type || 'event'));
		};
		let cl = element.classList;
		cl.add(name);
		handler.once('idle',function() {
			
			cl.remove(name);
			return handler.throttled = false;
		});
		return true;
	},
});



class EventHandler {
	
	constructor(params,closure){
		
		this.params = params;
		this.closure = closure;
	}
	
	getHandlerForMethod(el,name){
		
		if (!el) { return null };
		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
	}
	
	emit(name,...params){
		return imba.emit(this,name,params);
	}
	on(name,...params){
		return imba.listen(this,name,...params);
	}
	once(name,...params){
		return imba.once(this,name,...params);
	}
	un(name,...params){
		return imba.unlisten(this,name,...params);
	}
	
	async handleEvent(event){
		
		var target = event.target;
		var element = event.currentTarget;
		var mods = this.params;
		var i = 0;
		let commit = true;
		let awaited = false;
		let prevRes = undefined;
		
		let state = {
			element: element,
			event: event,
			modifiers: mods,
			handler: this
		};
		
		if (event.handle$mod) {
			
			if (event.handle$mod(state,mods.options) == false) {
				
				return;
			};
		};
		
		let schema = _dom__WEBPACK_IMPORTED_MODULE_0__["Event"][event.type];
		
		if (schema && schema.handle) {
			
			if (schema.handle(state,mods.options) == false) {
				
				return;
			};
		};
		
		this.currentEvents || (this.currentEvents = new Set);
		this.currentEvents.add(event);
		
		for (let $i = 0, $keys = Object.keys(mods), $l = $keys.length, handler, val; $i < $l; $i++){
			handler = $keys[$i];val = mods[handler];
			
			if (handler[0] == '_') {
				
				continue;
			};
			
			if (handler.indexOf('~') > 0) {
				
				handler = handler.split('~')[0];
			};
			
			let modargs = [];
			let args = [event,this];
			let res = undefined;
			let context = null;
			
			if (handler[0] == '$' && handler[1] == '_' && (val[0] instanceof Function)) {
				
				handler = val[0];
				args = [event,state].concat(val.slice(1));
				context = element;
			} else if (val instanceof Array) {
				
				args = val.slice();
				modargs = args;
				
				for (let i = 0, $items = iter$(args), $len = $items.length; i < $len; i++) {
					let par = $items[i];
					
					
					
					if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
						
						let name = par.slice(2);
						let chain = name.split('.');
						let value = state[chain.shift()] || event;
						
						for (let i = 0, $ary = iter$(chain), $len = $ary.length; i < $len; i++) {
							let part = $ary[i];
							
							value = value ? value[part] : undefined;
						};
						
						args[i] = value;
					};
				};
			};
			
			
			
			if (handler == 'stop') {
				
				event.stopImmediatePropagation();
			} else if (handler == 'prevent') {
				
				event.preventDefault();
			} else if (handler == 'commit') {
				
				commit = true;
			} else if (handler == 'silence') {
				
				commit = false;
			} else if (handler == 'ctrl') {
				
				if (!event.ctrlKey) { break; };
			} else if (handler == 'alt') {
				
				if (!event.altKey) { break; };
			} else if (handler == 'shift') {
				
				if (!event.shiftKey) { break; };
			} else if (handler == 'meta') {
				
				if (!event.metaKey) { break; };
			} else if (handler == 'self') {
				
				if (target != element) { break; };
			} else if (handler == 'once') {
				
				
				element.removeEventListener(event.type,this);
			} else if (handler == 'options') {
				
				continue;
			} else if (keyCodes[handler]) {
				
				if (keyCodes[handler].indexOf(event.keyCode) < 0) {
					
					break;
				};
			} else if (handler == 'trigger' || handler == 'emit') {
				
				let name = args[0];
				let detail = args[1];
				let e = new CustomEvent(name,{bubbles: true,detail: detail});
				e.originalEvent = event;
				let customRes = element.dispatchEvent(e);
			} else if (typeof handler == 'string') {
				
				let mod = handler + '$mod';
				
				if (event[mod] instanceof Function) {
					
					
					handler = mod;
					context = event;
					args = [state,modargs];
				} else if (schema && (schema[handler] instanceof Function)) {
					
					context = schema;
					args = [state,modargs];
				} else if (handler[0] == '_') {
					
					handler = handler.slice(1);
					context = this.closure;
				} else {
					
					context = this.getHandlerForMethod(element,handler);
				};
			};
			
			if (handler instanceof Function) {
				
				res = handler.apply(context || element,args);
			} else if (context) {
				
				res = context[handler].apply(context,args);
			};
			
			if (res && (res.then instanceof Function) && res != imba.scheduler.$promise) {
				
				if (commit) imba.$commit();
				awaited = true;
				
				res = await res;
			};
			
			if (res === false) {
				
				break;
			};
			
			state.value = res;
		};
		
		if (commit) imba.$commit();
		this.currentEvents.delete(event);
		if (this.currentEvents.size == 0) {
			
			this.emit('idle');
		};
		
		return;
	}
};


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Document", function() { return Document; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Node", function() { return Node; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Text", function() { return Text; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Comment", function() { return Comment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Element", function() { return Element; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SVGElement", function() { return SVGElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HTMLElement", function() { return HTMLElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DocumentFragment", function() { return DocumentFragment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShadowRoot", function() { return ShadowRoot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Event", function() { return Event; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomEvent", function() { return CustomEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MouseEvent", function() { return MouseEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "document", function() { return document; });
if (false) {};



var {Document: Document,Node: Node,Text: Text,Comment: Comment,Element: Element,SVGElement: SVGElement,HTMLElement: HTMLElement,DocumentFragment: DocumentFragment,ShadowRoot: ShadowRoot,Event: Event,CustomEvent: CustomEvent,MouseEvent: MouseEvent,document: document} = window;



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


class Touch {
	
	constructor(e){
		
		this.id = e.pointerId;
		this.t0 = Date.now();
		this.x0 = this.x = e.x;
		this.y0 = this.y = e.y;
		this.mx = this.my = 0;
		e.touch = this;
	}
	
	update(e){
		
		this.mx = e.x - this.x;
		this.my = e.y - this.x;
		this.x = e.x;
		this.y = e.y;
		return e.touch = this;
	}
	
	get dx(){
		
		return this.x - this.x0;
	}
	
	get dy(){
		
		return this.y - this.y0;
		
	}
	get dt(){
		
		return Date.now() - this.t0;
	}
};

_dom__WEBPACK_IMPORTED_MODULE_0__["Event"].pointerdown = {
	handle: function(state,options) {
		
		
		let e = state.event;
		let el = state.element;
		let handler = state.handler;
		if (handler.type != 'touch') { return true };
		
		e.dx = e.dy = 0;
		handler.x0 = e.x;
		handler.y0 = e.y;
		handler.pointerId = e.pointerId;
		
		handler.touch = new Touch(e);
		
		let canceller = function() { return false; };
		let selstart = document.onselectstart;
		el.setPointerCapture(e.pointerId);
		
		el.addEventListener('pointermove',handler);
		el.addEventListener('pointerup',handler);
		document.onselectstart = canceller;
		
		el.flags.add('_touch_');
		
		el.addEventListener('pointerup',function(e) {
			
			el.releasePointerCapture(e.pointerId);
			el.removeEventListener('pointermove',handler);
			el.removeEventListener('pointerup',handler);
			handler.pointerId = null;
			if (handler.pointerFlag) {
				
				el.flags.remove(handler.pointerFlag);
			};
			el.flags.remove('_touch_');
			return document.onselectstart = selstart;
		},{once: true});
		return true;
	}
};

_dom__WEBPACK_IMPORTED_MODULE_0__["Event"].pointermove = {
	handle: function(s,args) {
		
		let h = s.handler;
		let e = s.event;
		let id = h.pointerId;
		if (id && e.pointerId != id) { return false };
		if (h.touch) { h.touch.update(e) };
		if (typeof h.x0 == 'number') {
			
			e.dx = e.x - h.x0;
			e.dy = e.y - h.y0;
		};
		return true;
	}
};
_dom__WEBPACK_IMPORTED_MODULE_0__["Event"].pointerup = {
	handle: function(s,args) {
		
		let h = s.handler;
		let e = s.event;
		let id = h.pointerId;
		if (id && e.pointerId != id) { return false };
		if (h.touch) { h.touch.update(e) };
		
		if (typeof h.x0 == 'number') {
			
			e.dx = e.x - h.x0;
			e.dy = e.y - h.y0;
		};
		return true;
	}
};


_dom__WEBPACK_IMPORTED_MODULE_0__["Element"].prototype.on$touch = function(mods,context) {
	
	return;
};


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createLiveFragment", function() { return createLiveFragment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createIndexedFragment", function() { return createIndexedFragment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createKeyedFragment", function() { return createKeyedFragment; });
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};


extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["DocumentFragment"],{
	
	
	get $parent(){
		
		return this.up$ || this.$$parent;
	},
	
	
	setup$(flags,options){
		
		this.$start = imba.document.createComment('start');
		this.$end = imba.document.createComment('end');
		
		this.$end.replaceWith$ = function(other) {
			
			this.parentNode.insertBefore(other,this);
			return other;
		};
		
		this.appendChild(this.$start);
		return this.appendChild(this.$end);
	},
	
	
	
	text$(item){
		
		if (!(this.$text)) {
			
			this.$text = this.insert$(item);
		} else {
			
			this.$text.textContent = item;
		};
		return;
	},
	
	insert$(item,options,toReplace){
		
		if (this.$$parent) {
			
			
			
			return this.$$parent.insert$(item,options,toReplace || this.$end);
		} else {
			
			return _dom__WEBPACK_IMPORTED_MODULE_0__["Element"].prototype.insert$.call(this,item,options,toReplace || this.$end);
		};
	},
	
	insertInto$(parent,before){
		
		if (!(this.$$parent)) {
			
			this.$$parent = parent;
			
			parent.appendChild$(this);
		};
		return this;
	},
	
	replaceWith$(other,parent){
		
		this.$start.insertBeforeBegin$(other);
		var el = this.$start;
		while (el){
			
			let next = el.nextSibling;
			this.appendChild(el);
			if (el == this.$end) { break; };
			el = next;
			
		};
		return other;
	},
	
	appendChild$(child){
		
		this.$end ? this.$end.insertBeforeBegin$(child) : this.appendChild(child);
		return child;
	},
	
	removeChild$(child){
		
		child.parentNode && child.parentNode.removeChild(child);
		return this;
	},
	
	isEmpty$(){
		
		let el = this.$start;
		let end = this.$end;
		
		while (el = el.nextSibling){
			
			if (el == end) { break; };
			if ((el instanceof _dom__WEBPACK_IMPORTED_MODULE_0__["Element"]) || (el instanceof _dom__WEBPACK_IMPORTED_MODULE_0__["Text"])) { return false };
		};
		return true;
	},
});


extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["ShadowRoot"],{
	
	get $parent(){
		
		return this.host;
	},
});

class TagCollection {
	
	constructor(f,parent){
		
		this.__F = f;
		this.$parent = parent;
		
		if (!((f & 128)) && (this instanceof KeyedTagFragment)) {
			
			this.$start = _dom__WEBPACK_IMPORTED_MODULE_0__["document"].createComment('start');
			if (parent) { parent.appendChild$(this.$start) };
		};
		
		if (!(f & 256)) {
			
			this.$end = _dom__WEBPACK_IMPORTED_MODULE_0__["document"].createComment('end');
			if (parent) { parent.appendChild$(this.$end) };
		};
		
		this.setup();
	}
	
	appendChild$(item,index){
		
		
		if (this.$end && this.$parent) {
			
			this.$end.insertBeforeBegin$(item);
		} else if (this.$parent) {
			
			this.$parent.appendChild$(item);
		};
		return;
	}
	
	replaceWith$(other){
		
		this.detachNodes();
		this.$end.insertBeforeBegin$(other);
		this.$parent.removeChild$(this.$end);
		this.$parent = null;
		return;
	}
	
	joinBefore$(before){
		
		return this.insertInto$(before.parentNode,before);
	}
	
	insertInto$(parent,before){
		
		if (!(this.$parent)) {
			
			this.$parent = parent;
			before ? before.insertBeforeBegin$(this.$end) : parent.appendChild$(this.$end);
			this.attachNodes();
		};
		return this;
	}
	
	replace$(other){
		
		if (!(this.$parent)) {
			
			this.$parent = other.parentNode;
		};
		other.replaceWith$(this.$end);
		this.attachNodes();
		return this;
		
	}
	setup(){
		
		return this;
	}
};

class KeyedTagFragment extends TagCollection {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	setup(){
		
		this.array = [];
		this.changes = new Map;
		this.dirty = false;
		return this.$ = {};
	}
	
	push(item,idx){
		
		
		if (!(this.__F & 1)) {
			
			this.array.push(item);
			this.appendChild$(item);
			return;
		};
		
		let toReplace = this.array[idx];
		
		if (toReplace === item) {
			
			true;
		} else {
			
			this.dirty = true;
			
			let prevIndex = this.array.indexOf(item);
			let changed = this.changes.get(item);
			
			if (prevIndex === -1) {
				
				
				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			} else if (prevIndex === idx + 1) {
				
				if (toReplace) {
					
					this.changes.set(toReplace,-1);
				};
				this.array.splice(idx,1);
			} else {
				
				if (prevIndex >= 0) { this.array.splice(prevIndex,1) };
				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			};
			
			if (changed == -1) {
				
				this.changes.delete(item);
			};
		};
		return;
	}
	
	insertChild(item,index){
		
		if (index > 0) {
			
			let other = this.array[index - 1];
			
			other.insertAfterEnd$(item);
		} else if (this.$start) {
			
			this.$start.insertAfterEnd$(item);
		} else {
			
			this.$parent.insertAfterBegin$(item);
		};
		return;
	}
	
	removeChild(item,index){
		
		
		
		if (item.parentNode == this.$parent) {
			
			this.$parent.removeChild(item);
		};
		return;
	}
	
	attachNodes(){
		
		for (let i = 0, $items = iter$(this.array), $len = $items.length; i < $len; i++) {
			let item = $items[i];
			
			this.$end.insertBeforeBegin$(item);
		};
		return;
	}
	
	detachNodes(){
		
		for (let $i = 0, $items = iter$(this.array), $len = $items.length; $i < $len; $i++) {
			let item = $items[$i];
			
			this.$parent.removeChild(item);
		};
		return;
	}
	
	end$(index){
		var self = this;
		
		if (!(this.__F & 1)) {
			
			this.__F |= 1;
			return;
		};
		
		if (this.dirty) {
			
			this.changes.forEach(function(pos,item) {
				
				if (pos == -1) {
					
					return self.removeChild(item);
				};
			});
			this.changes.clear();
			this.dirty = false;
		};
		
		
		if (this.array.length > index) {
			
			
			
			while (this.array.length > index){
				
				let item = this.array.pop();
				this.removeChild(item);
			};
			
		};
		return;
	}
}; KeyedTagFragment.init$();

class IndexedTagFragment extends TagCollection {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	
	setup(){
		
		this.$ = [];
		return this.length = 0;
	}
	
	end$(len){
		
		let from = this.length;
		if (from == len || !(this.$parent)) { return };
		let array = this.$;
		let par = this.$parent;
		
		if (from > len) {
			
			while (from > len){
				
				par.removeChild$(array[--from]);
			};
		} else if (len > from) {
			
			while (len > from){
				
				this.appendChild$(array[from++]);
			};
		};
		this.length = len;
		return;
	}
	
	attachNodes(){
		
		for (let i = 0, $items = iter$(this.$), $len = $items.length; i < $len; i++) {
			let item = $items[i];
			
			if (i == this.length) { break; };
			this.$end.insertBeforeBegin$(item);
		};
		return;
	}
	
	detachNodes(){
		
		let i = 0;
		while (i < this.length){
			
			let item = this.$[i++];
			this.$parent.removeChild$(item);
		};
		return;
	}
}; IndexedTagFragment.init$();

function createLiveFragment(bitflags,options,par){
	
	var el = _dom__WEBPACK_IMPORTED_MODULE_0__["document"].createDocumentFragment();
	el.setup$(bitflags,options);
	if (par) { el.up$ = par };
	return el;
};

function createIndexedFragment(bitflags,parent){
	
	return new IndexedTagFragment(bitflags,parent);
};

function createKeyedFragment(bitflags,parent){
	
	return new KeyedTagFragment(bitflags,parent);
};




/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImbaElement", function() { return ImbaElement; });
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


class ImbaElement extends _dom__WEBPACK_IMPORTED_MODULE_0__["HTMLElement"] {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	
	constructor(){
		
		super();
		this.setup$();
		this.build();
	}
	
	setup$(){
		
		this.__slots = {};
		return this.__F = 0;
	}
	
	init$(){
		
		this.__F |= (1 | 2);
		return this;
		
	}
	flag$(str){
		
		this.className = this.flags$ext = str;
		return;
	}
	
	
	slot$(name,ctx){
		var $__slots;
		
		if (name == '__' && !this.render) {
			
			return this;
		};
		
		return ($__slots = this.__slots)[name] || ($__slots[name] = imba.createLiveFragment(0,null,this));
	}
	
	
	build(){
		
		return this;
	}
	
	
	awaken(){
		
		return this;
	}
	
	
	mount(){
		
		return this;
	}
	
	unmount(){
		
		return this;
	}
	
	
	rendered(){
		
		return this;
	}
	
	
	dehydrate(){
		
		return this;
	}
	
	
	hydrate(){
		
		
		this.autoschedule = true;
		return this;
	}
	
	tick(){
		
		return this.commit();
	}
	
	
	visit(){
		
		return this.commit();
	}
	
	
	commit(){
		
		if (!(this.isRender())) { return this };
		this.__F |= 256;
		this.render && this.render();
		this.rendered();
		return this.__F = (this.__F | 512) & ~256;
	}
	
	
	
	get autoschedule(){
		
		return (this.__F & 64) != 0;
	}
	
	set autoschedule(value){
		
		value ? ((this.__F |= 64)) : ((this.__F &= ~64));
	}
	
	isRender(){
		
		return true;
	}
	
	isMounting(){
		
		return (this.__F & 16) != 0;
	}
	
	isMounted(){
		
		return (this.__F & 32) != 0;
	}
	
	isAwakened(){
		
		return (this.__F & 8) != 0;
	}
	
	isRendered(){
		
		return (this.__F & 512) != 0;
	}
	
	isRendering(){
		
		return (this.__F & 256) != 0;
	}
	
	isScheduled(){
		
		return (this.__F & 128) != 0;
	}
	
	isHydrated(){
		
		return (this.__F & 2) != 0;
	}
	
	schedule(){
		
		imba.scheduler.listen('render',this);
		this.__F |= 128;
		return this;
	}
	
	unschedule(){
		
		imba.scheduler.unlisten('render',this);
		this.__F &= ~128;
		return this;
	}
	
	end$(){
		
		return this.visit();
	}
	
	connectedCallback(){
		
		let flags = this.__F;
		let inited = flags & 1;
		let awakened = flags & 8;
		
		
		if (flags & (16 | 32)) {
			
			return;
		};
		
		this.__F |= 16;
		
		if (!inited) {
			
			this.init$();
		};
		
		if (!(flags & 2)) {
			
			this.flags$ext = this.className;
			this.hydrate();
			this.__F |= 2;
			this.commit();
		};
		
		if (!awakened) {
			
			this.awaken();
			this.__F |= 8;
		};
		
		let res = this.mount();
		if (res && (res.then instanceof Function)) {
			
			res.then(imba.commit);
		};
		
		
		
		flags = this.__F = (this.__F | 32) & ~16;
		
		if (flags & 64) {
			
			this.schedule();
		};
		
		return this;
	}
	
	disconnectedCallback(){
		
		this.__F = this.__F & (~32 & ~16);
		if (this.__F & 128) { this.unschedule() };
		return this.unmount();
	}
}; ImbaElement.init$();


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};




extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["SVGElement"],{
	
	
	flag$(str){
		
		this.className.baseVal = this.flags$ext = str;
		return;
	},
	
	flagSelf$(str){
		var self = this;
		
		
		
		this.flag$ = function(str) { return self.flagSync$(self.flags$ext = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.flags$own = str); };
		return this.flagSelf$(str);
	},
	
	flagSync$(){
		
		return this.className.baseVal = ((this.flags$ext || '') + ' ' + (this.flags$own || '') + ' ' + (this.$flags || ''));
	},
});



/***/ }),
/* 11 */
/***/ (function(module, exports) {

function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};
const toBind = {
	INPUT: true,
	SELECT: true,
	TEXTAREA: true,
	BUTTON: true
};

var isGroup = function(obj) {
	
	return (obj instanceof Array) || (obj && (obj.has instanceof Function));
};

var bindHas = function(object,value) {
	
	if (object instanceof Array) {
		
		return object.indexOf(value) >= 0;
	} else if (object && (object.has instanceof Function)) {
		
		return object.has(value);
	} else if (object && (object.contains instanceof Function)) {
		
		return object.contains(value);
	} else if (object == value) {
		
		return true;
	} else {
		
		return false;
	};
};

var bindAdd = function(object,value) {
	
	if (object instanceof Array) {
		
		return object.push(value);
	} else if (object && (object.add instanceof Function)) {
		
		return object.add(value);
	};
};

var bindRemove = function(object,value) {
	
	if (object instanceof Array) {
		
		let idx = object.indexOf(value);
		if (idx >= 0) { return object.splice(idx,1) };
	} else if (object && (object.delete instanceof Function)) {
		
		return object.delete(value);
	};
};

function createProxyProperty(target){
	
	function getter(){
		
		return target[0] ? target[0][target[1]] : undefined;
	};
	
	function setter(v){
		
		return target[0] ? ((target[0][target[1]] = v)) : null;
	};
	
	return {
		get: getter,
		set: setter
	};
};



extend$(Element,{
	
	getRichValue(){
		
		return this.value;
	},
	
	setRichValue(value){
		
		return this.value = value;
	},
	
	bind$(key,value){
		
		let o = value || [];
		
		if (key == 'data' && !(this.$$bound) && toBind[this.nodeName]) {
			
			this.$$bound = true;
			if (this.change$) {
				
				this.addEventListener('change',this.change$ = this.change$.bind(this));
			};
			if (this.input$) {
				
				this.addEventListener('input',this.input$ = this.input$.bind(this),{capture: true});
			};
			if (this.click$) {
				
				this.addEventListener('click',this.click$ = this.click$.bind(this),{capture: true});
			};
			
			
		};
		
		Object.defineProperty(this,key,(o instanceof Array) ? createProxyProperty(o) : o);
		return o;
	},
});

Object.defineProperty(Element.prototype,'richValue',{
	get(){
		
		return this.getRichValue();
	},
	set(v){
		
		return this.setRichValue(v);
	}
});

extend$(HTMLSelectElement,{
	
	
	change$(e){
		
		let model = this.data;
		let prev = this.$$value;
		this.$$value = undefined;
		let values = this.getRichValue();
		
		if (this.multiple) {
			
			if (prev) {
				
				for (let $i = 0, $items = iter$(prev), $len = $items.length; $i < $len; $i++) {
					let value = $items[$i];
					if (values.indexOf(value) != -1) { continue; };
					
					bindRemove(model,value);
				};
			};
			
			for (let $i = 0, $items = iter$(values), $len = $items.length; $i < $len; $i++) {
				let value = $items[$i];
				
				if (!prev || prev.indexOf(value) == -1) {
					
					bindAdd(model,value);
				};
			};
		} else {
			
			this.data = values[0];
		};
		imba.commit();
		return this;
	},
	
	getRichValue(){
		var $res;
		
		if (this.$$value) {
			
			return this.$$value;
		};
		
		$res = [];
		for (let $i = 0, $items = iter$(this.selectedOptions), $len = $items.length; $i < $len; $i++) {
			let o = $items[$i];
			
			$res.push(o.richValue);
		};
		return this.$$value = $res;
	},
	
	syncValue(){
		
		let model = this.data;
		
		if (this.multiple) {
			
			let vals = [];
			for (let i = 0, $items = iter$(this.options), $len = $items.length; i < $len; i++) {
				let option = $items[i];
				
				let val = option.richValue;
				let sel = bindHas(model,val);
				option.selected = sel;
				if (sel) { vals.push(val) };
			};
			this.$$value = vals;
		} else {
			
			for (let i = 0, $items = iter$(this.options), $len = $items.length; i < $len; i++) {
				let option = $items[i];
				
				let val = option.richValue;
				if (val == model) {
					
					this.$$value = [val];
					this.selectedIndex = i;break;
				};
			};
		};
		return;
	},
	
	end$(){
		
		return this.syncValue();
	},
});

extend$(HTMLOptionElement,{
	
	setRichValue(value){
		
		this.$$value = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.$$value !== undefined) {
			
			return this.$$value;
		};
		return this.value;
	},
});

extend$(HTMLTextAreaElement,{
	
	setRichValue(value){
		
		this.$$value = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.$$value !== undefined) {
			
			return this.$$value;
		};
		return this.value;
	},
	
	input$(e){
		
		this.data = this.value;
		return imba.commit();
	},
	
	end$(){
		
		if (this.$$bound && this.value != this.data) {
			
			return this.value = this.data;
		};
	},
});


extend$(HTMLInputElement,{
	
	
	input$(e){
		
		let typ = this.type;
		
		if (typ == 'checkbox' || typ == 'radio') {
			
			return;
		};
		
		this.$$value = undefined;
		this.data = this.richValue;
		return imba.commit();
	},
	
	change$(e){
		
		let model = this.data;
		let val = this.richValue;
		
		if (this.type == 'checkbox' || this.type == 'radio') {
			
			let checked = this.checked;
			if (isGroup(model)) {
				
				checked ? bindAdd(model,val) : bindRemove(model,val);
			} else {
				
				this.data = checked ? val : false;
			};
		};
		return imba.commit();
	},
	
	setRichValue(value){
		
		if (this.$$value !== value) {
			
			this.$$value = value;
			
			if (this.value !== value) {
				
				this.value = value;
			};
		};
		return;
	},
	
	getRichValue(){
		
		if (this.$$value !== undefined) {
			
			return this.$$value;
		};
		
		let value = this.value;
		let typ = this.type;
		
		if (typ == 'range' || typ == 'number') {
			
			value = this.valueAsNumber;
			if (Number.isNaN(value)) { value = null };
		} else if (typ == 'checkbox') {
			
			if (value == undefined || value === 'on') { value = true };
		};
		
		return value;
	},
	
	end$(){
		
		if (this.$$bound) {
			
			let typ = this.type;
			if (typ == 'checkbox' || typ == 'radio') {
				
				let val = this.data;
				if (val === true || val === false || val == null) {
					
					this.checked = !!val;
				} else {
					
					this.checked = bindHas(val,this.richValue);
				};
			} else {
				
				this.richValue = this.data;
			};
		};
		return;
		
	},
});
extend$(HTMLButtonElement,{
	
	
	get checked(){
		
		return this.$checked;
		
	},
	set checked(val){
		
		if (val != this.$checked) {
			
			this.$checked = val;
			this.flags.toggle('checked',!!val);
		};
	},
	
	setRichValue(value){
		
		this.$$value = value;
		return this.value = value;
	},
	
	getRichValue(){
		
		if (this.$$value !== undefined) {
			
			return this.$$value;
		};
		return this.value;
		
	},
	click$(e){
		
		let data = this.data;
		let toggled = this.checked;
		let val = this.richValue;
		
		if (isGroup(data)) {
			
			toggled ? bindRemove(data,val) : bindAdd(data,val);
		} else {
			
			this.data = toggled ? null : val;
		};
		
		return imba.commit();
	},
	
	end$(){
		
		if (this.$$bound) {
			
			let val = this.data;
			if (val === true || val === false || val == null) {
				
				this.checked = !!val;
			} else {
				
				this.checked = bindHas(val,this.richValue);
			};
		};
		return;
	},
});


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};


extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["SVGElement"],{
	
	
	flag$(str){
		
		this.className.baseVal = this.flags$ext = str;
		return;
	},
	
	flagSelf$(str){
		var self = this;
		
		
		
		this.flag$ = function(str) { return self.flagSync$(self.flags$ext = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.flags$own = str); };
		return this.flagSelf$(str);
	},
	
	flagSync$(){
		
		return this.className.baseVal = ((this.flags$ext || '') + ' ' + (this.flags$own || '') + ' ' + (this.$flags || ''));
	},
});


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };


const observers = new (globalThis.WeakMap || Map);
const defaults = {threshold: [0]};
const rootTarget = {};

_dom__WEBPACK_IMPORTED_MODULE_0__["Event"].intersect = {
	handle: function(state,args) {
		
		let obs = state.event.detail.observer;
		return state.modifiers._observer == obs;
	},
	
	in: function(state,args) {
		
		return state.event.detail.delta > 0;
	},
	
	out: function(state,args) {
		
		return state.event.detail.delta < 0;
	}
};

function callback(name,key){
	
	return function(entries,observer) {
		
		let map = observer.prevRatios || (observer.prevRatios = new WeakMap);
		
		for (let $i = 0, $items = iter$(entries), $len = $items.length; $i < $len; $i++) {
			let entry = $items[$i];
			
			let prev = map.get(entry.target) || 0;
			let ratio = entry.intersectionRatio;
			let detail = {entry: entry,ratio: ratio,from: prev,delta: (ratio - prev),observer: observer};
			let e = new _dom__WEBPACK_IMPORTED_MODULE_0__["CustomEvent"](name,{bubbles: false,detail: detail});
			e.delta = detail.delta;
			e.ratio = detail.ratio;
			try {
				
				e.rx = entry.intersectionRect.width / entry.boundingClientRect.width;
				e.ry = entry.intersectionRect.height / entry.boundingClientRect.height;
			} catch (e) { };
			map.set(entry.target,ratio);
			entry.target.dispatchEvent(e);
		};
		return;
	};
};

function getIntersectionObserver(opts = defaults){
	
	let key = opts.threshold.join('-') + opts.rootMargin;
	let target = opts.root || rootTarget;
	let map = observers.get(target);
	map || observers.set(target,map = {});
	return map[key] || (map[key] = new IntersectionObserver(callback('intersect',key),opts));
};

_dom__WEBPACK_IMPORTED_MODULE_0__["Element"].prototype.on$intersect = function(mods,context) {
	
	let obs;
	if (mods.options) {
		
		let th = [];
		let opts = {threshold: th};
		
		for (let $i = 0, $items = iter$(mods.options), $len = $items.length; $i < $len; $i++) {
			let arg = $items[$i];
			
			if (arg instanceof _dom__WEBPACK_IMPORTED_MODULE_0__["Element"]) {
				
				opts.root = arg;
			} else if (typeof arg == 'number') {
				
				th.push(arg);
				
			};
		};
		if (th.length == 1) {
			
			let num = th[0];
			if (num > 1) {
				
				th[0] = 0;
				while (th.length < num){
					
					th.push(th.length / (num - 1));
				};
			};
		};
		
		if (th.length == 0) { th.push(0) };
		obs = getIntersectionObserver(opts);
	} else {
		
		obs = getIntersectionObserver();
	};
	
	mods._observer = obs;
	return obs.observe(this);
};


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


var selHandler;

function activateSelectionHandler(){
	
	if (!selHandler) {
		
		selHandler = function(e) {
			
			if (e.handled$) { return };
			e.handled$ = true;
			
			let target = document.activeElement;
			if (target && target.matches('input,textarea')) {
				
				let custom = new _dom__WEBPACK_IMPORTED_MODULE_0__["CustomEvent"]('selection',{
					detail: {
						start: target.selectionStart,
						end: target.selectionEnd
					}
				});
				return target.dispatchEvent(custom);
			};
		};
		return document.addEventListener('selectionchange',selHandler);
	};
};

_dom__WEBPACK_IMPORTED_MODULE_0__["Element"].prototype.on$selection = function(mods,context) {
	
	return activateSelectionHandler();
};


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function extend$(target,ext){
	// @ts-ignore
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	// @ts-ignore
	Object.defineProperties(target.prototype,descriptors);
	return target;
};
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };



var resizeObserver = null;

function getResizeObserver(){
	
	if (!globalThis.ResizeObserver) {
		
		if (!resizeObserver) {
			
			console.warn(':resize not supported in this browser');
			resizeObserver = {observe: function() { return true; }};
		};
	};
	return resizeObserver || (resizeObserver = new ResizeObserver(function(entries) {
		
		for (let $i = 0, $items = iter$(entries), $len = $items.length; $i < $len; $i++) {
			let entry = $items[$i];
			
			let e = new _dom__WEBPACK_IMPORTED_MODULE_0__["CustomEvent"]('resize',{bubbles: false,detail: entry});
			e.rect = entry.contentRect;
			entry.target.dispatchEvent(e);
		};
		return;
	}));
};

extend$(_dom__WEBPACK_IMPORTED_MODULE_0__["Element"],{
	
	
	on$resize(chain,context){
		
		return getResizeObserver().observe(this);
	},
});


/***/ })
/******/ ]);