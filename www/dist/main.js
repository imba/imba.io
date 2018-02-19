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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.12'};

/*

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

*/

Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};

/*

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

*/

Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};

/*
Clear interval with specified id
*/

Imba.clearInterval = function (id){
	return clearInterval(id);
};

/*
Clear timeout with specified id
*/

Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (let k in sup){
		let v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};

/*
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
*/

Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};

/*
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
*/

Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;
var setterCache = {};

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.toSetter = function (str){
	return setterCache[str] || (setterCache[str] = Imba.toCamelCase('set-' + str));
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	let proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.propDidSet = function (object,property,val,prev){
	let fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};


// Basic events
function emit__(event,args,node){
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
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

// method for registering a listener on object
Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!(meta)) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			};
		};
	};
	return;
};

// emit event
Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Page = Imba.defineTag('Page')
exports.Page = Page;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

Imba.Pointer = function Pointer(){
	this._button = -1;
	this._event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this._button;
};

Imba.Pointer.prototype.touch = function (){
	return this._touch;
};

Imba.Pointer.prototype.update = function (e){
	this._event = e;
	this._dirty = true;
	return this;
};

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			// cancel the previous touch
			if (this._touch) { this._touch.cancel() };
			this._touch = new Imba.Touch(e1,this);
			this._touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this._touch) { this._touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this._button = -1;
			
			if (this._touch && this._touch.button() == e1.button) {
				this._touch.mouseup(e1,e1);
				this._touch = null;
			};
			// trigger pointerup
		};
	} else if (this._touch) {
		this._touch.idle();
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this._event.x;
};
Imba.Pointer.prototype.y = function (){
	return this._event.y;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// externs;

var Snippet = Imba.defineTag('Snippet', function(tag){
	tag.prototype.src = function(v){ return this._src; }
	tag.prototype.setSrc = function(v){ this._src = v; return this; };
	tag.prototype.heading = function(v){ return this._heading; }
	tag.prototype.setHeading = function(v){ this._heading = v; return this; };
	tag.prototype.hl = function(v){ return this._hl; }
	tag.prototype.setHl = function(v){ this._hl = v; return this; };
	
	tag.replace = function (dom){
		let imba = dom.firstChild;
		let js = imba.nextSibling;
		let highlighted = imba.innerHTML;
		let raw = dom.textContent;
		let data = {
			code: raw,
			html: highlighted,
			js: {
				code: js.textContent,
				html: js.innerHTML
			}
		};
		
		let snippet = (_1(Snippet)).setData(data).end();
		dom.parentNode.replaceChild(snippet.dom(),dom);
		return snippet;
	};
	
	tag.prototype.setup = function (){
		this.render();
		this._code.dom().innerHTML = this.data().html;
		this.run();
		return this;
	};
	
	tag.prototype.run = function (){
		var self = this;
		var orig = Imba.mount;
		var js = self.data().js.code;
		js = js.replace("require('imba')",'window.Imba');
		// add console?
		try {
			Imba.mount = function(item) { return orig.call(Imba,item,self._result.dom()); };
			eval(js);
		} catch (e) { };
		
		Imba.mount = orig;
		return self;
	};
	
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('snippet').setChildren($.$ = $.$ || [
			this._code = this._code||_1('code',this).flag('code'),
			this._result = this._result||_1('div',this).flag('result').flag('styled-example')
		],2).synced();
	};
})
exports.Snippet = Snippet;

var Example = Imba.defineTag('Example', Snippet, function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).setText("Example").synced();
	};
})
exports.Example = Example;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6);
module.exports = __webpack_require__(27);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var App = __webpack_require__(17).App;
var Site = __webpack_require__(19).Site;
document.body.innerHTML = '';
Imba.mount((_1(Site)).setData(APP = App.deserialize(APPCACHE)).end());


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (window.Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(8);
	__webpack_require__(9);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; // very simple raf polyfill
var cancelAnimationFrame;

if (false) {};

if (true) {
	cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitRequestAnimationFrame;
	requestAnimationFrame = window.requestAnimationFrame;
	requestAnimationFrame || (requestAnimationFrame = window.webkitRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = window.mozRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); });
};

function Ticker(){
	var self = this;
	self._queue = [];
	self._stage = -1;
	self._scheduled = false;
	self._ticker = function(e) {
		self._scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.stage = function(v){ return this._stage; }
Ticker.prototype.setStage = function(v){ this._stage = v; return this; };
Ticker.prototype.queue = function(v){ return this._queue; }
Ticker.prototype.setQueue = function(v){ this._queue = v; return this; };

Ticker.prototype.add = function (item,force){
	if (force || this._queue.indexOf(item) == -1) {
		this._queue.push(item);
	};
	
	if (!this._scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this._queue;
	if (!this._ts) { this._ts = timestamp };
	this._dt = timestamp - this._ts;
	this._ts = timestamp;
	this._queue = [];
	this._stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this._dt,this);
			} else if (item.tick) {
				item.tick(this._dt,this);
			};
		};
	};
	this._stage = 2;
	this.after();
	this._stage = this._scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		if (this._stage == -1) {
			this._stage = 0;
		};
		requestAnimationFrame(this._ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	if (Imba.TagManager) {
		Imba.TagManager.refresh();
	};
	return this;
};

Imba.TICKER = new Ticker();
Imba.SCHEDULERS = [];

Imba.ticker = function (){
	return Imba.TICKER;
};

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	// Imba.TagManager.refresh
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};

/*

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

*/

Imba.Scheduler = function Scheduler(target){
	var self = this;
	self._id = counter++;
	self._target = target;
	self._marked = false;
	self._active = false;
	self._marker = function() { return self.mark(); };
	self._ticker = function(e) { return self.tick(e); };
	
	self._dt = 0;
	self._frame = {};
	self._scheduled = false;
	self._timestamp = 0;
	self._ticks = 0;
	self._flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};

/*
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	*/

Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Imba.Scheduler.prototype.raf = function(v){ return this._raf; }
Imba.Scheduler.prototype.setRaf = function(v){
	var a = this.raf();
	if(v != a) { this._raf = v; }
	if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	return this;
};
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Imba.Scheduler.prototype.interval = function(v){ return this._interval; }
Imba.Scheduler.prototype.setInterval = function(v){
	var a = this.interval();
	if(v != a) { this._interval = v; }
	if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	return this;
};
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Imba.Scheduler.prototype.events = function(v){ return this._events; }
Imba.Scheduler.prototype.setEvents = function(v){
	var a = this.events();
	if(v != a) { this._events = v; }
	if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	return this;
};
Imba.Scheduler.prototype.marked = function(v){ return this._marked; }
Imba.Scheduler.prototype.setMarked = function(v){ this._marked = v; return this; };

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this._active) this.requestTick();
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this._intervalId);
	this._intervalId = null;
	if (time && this._active) {
		this._intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this._active && new$ && !(prev)) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};

/*
	Check whether the current scheduler is active or not
	@return {bool}
	*/

Imba.Scheduler.prototype.active = function (){
	return this._active;
};

/*
	Delta time between the two last ticks
	@return {Number}
	*/

Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};

/*
	Configure the scheduler
	@return {self}
	*/

Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};

/*
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	*/

Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};

/*
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	*/

Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};

/*
	@fixme this expects raf to run at 60 fps 

	Called automatically on every frame while the scheduler is active.
	It will only call `target.tick` if the scheduler is marked dirty,
	or when according to @fps setting.

	If you have set up a scheduler with an fps of 1, tick will still be
	called every frame, but `target.tick` will only be called once every
	second, and it will *make sure* each `target.tick` happens in separate
	seconds according to Date. So if you have a node that renders a clock
	based on Date.now (or something similar), you can schedule it with 1fps,
	never needing to worry about two ticks happening within the same second.
	The same goes for 4fps, 10fps etc.

	@protected
	@return {self}
	*/

Imba.Scheduler.prototype.tick = function (delta,ticker){
	this._ticks++;
	this._dt = delta;
	
	if (ticker) {
		this._scheduled = false;
	};
	
	this.flush();
	
	if (this._raf && this._active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};

/*
	Start the scheduler if it is not already active.
	**While active**, the scheduler will override `target.commit`
	to do nothing. By default Imba.tag#commit calls render, so
	that rendering is cascaded through to children when rendering
	a node. When a scheduler is active (for a node), Imba disables
	this automatic rendering.
	*/

Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this._active) {
		this._active = true;
		this._commit = this._target.commit;
		this._target.commit = function() { return this; };
		this._target && this._target.flag  &&  this._target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this._events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this._interval && !this._intervalId) {
			this._intervalId = setInterval(this.oninterval.bind(this),this._interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this._raf) {
			this.requestTick();
		};
	};
	return this;
};

/*
	Stop the scheduler if it is active.
	*/

Imba.Scheduler.prototype.deactivate = function (){
	if (this._active) {
		this._active = false;
		this._target.commit = this._commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this._events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		};
		
		this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this._marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this._events || this._marked) { return this };
	
	if (this._events instanceof Function) {
		if (this._events(event,this)) this.mark();
	} else if (this._events instanceof Array) {
		if (this._events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(10);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(3);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);

if (true) {
	__webpack_require__(16);
};

if (false) {};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	return this._inserts++;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	if (false) {};
	return this._hasMountables = true;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!(force) && this.changes() == 0) { return };
	// console.time('resolveMounts')
	if ((this._inserts && this._hasMountables) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	// what if we end up creating additional mountables by mounting?
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	this._mounted.push(node);
	node.FLAGS |= Imba.TAG_MOUNTED;
	if (node.mount) { node.mount() };
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;

/*
Get the current document
*/

Imba.document = function (){
	if (true) {
		return window.document;
	};
};

/*
Get the body element wrapped in an Imba.Tag
*/

Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};

/*

*/

Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	node.scheduler().configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};

/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.$ = TagCache.build(this);
	this.$up = this._owner_ = ctx;
	this._tree_ = null;
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	var base = Imba.Tag.prototype;
	var hasSetup = this.setup != base.setup;
	var hasCommit = this.commit != base.commit;
	var hasRender = this.render != base.render;
	var hasMount = this.mount;
	
	var ctor = this.constructor;
	
	if (hasCommit || hasRender || hasMount || hasSetup) {
		
		this.end = function() {
			if (this.mount && !(this.FLAGS & Imba.TAG_MOUNTED)) {
				// just activate 
				Imba.TagManager.mount(this);
			};
			
			if (!(this.FLAGS & Imba.TAG_SETUP)) {
				this.FLAGS |= Imba.TAG_SETUP;
				this.setup();
			};
			
			this.commit();
			
			return this;
		};
	};
	
	if (true) {
		if (hasMount) {
			if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
				ctor._classes.push('__mount');
			};
			
			if (ctor._protoDom) {
				ctor._protoDom.classList.add('__mount');
			};
		};
		
		for (let i = 0, items = ['mousemove','mouseenter','mouseleave','mouseover','mouseout','selectstart'], len = items.length, item; i < len; i++) {
			item = items[i];
			if (this[("on" + item)]) { Imba.Events.register(item) };
		};
	};
	return this;
};


Imba.attr(Imba.Tag,'name');
Imba.attr(Imba.Tag,'role');
Imba.attr(Imba.Tag,'tabindex');
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};

/*
	Set the data object for node
	@return {self}
	*/

Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};

/*
	Get the data object for node
	*/

Imba.Tag.prototype.data = function (){
	return this._data;
};


Imba.Tag.prototype.bindData = function (target,path,args){
	return this.setData(args ? target[path].apply(target,args) : target[path]);
};

/*
	Set inner html of node
	*/

Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};

/*
	Get inner html of node
	*/

Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this._on_ || (this._on_ = []);
	let prev = handlers[slot];
	// self-bound handlers
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
	};
	return this;
};


Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};

/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttribute(name,value);
	} else {
		this.dom().removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom().setAttributeNS(ns,name,value);
		} else {
			this.dom().removeAttributeNS(ns,name);
		};
	};
	return this;
};


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	let setter = Imba.toSetter(key);
	if (this[setter] instanceof Function) {
		this[setter](value,mods);
	} else {
		this._dom.setAttribute(key,value);
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this._dom.getAttribute(key);
};

/*
	Override this to provide special wrapping etc.
	@return {self}
	*/

Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};

/*
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	*/

Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this._tree_ = nodes;
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		// override the basic
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; // do setChildren(renderTemplate)
		};
		this.optimizeTagStructure();
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};

/*
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	*/

Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};


/*
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._dom || child;
	if (el && el.parentNode == par) {
		par.removeChild(el);
		Imba.TagManager.remove(el._tag || el,this);
	};
	return this;
};

/*
	Remove all content inside node
	*/

Imba.Tag.prototype.removeAllChildren = function (){
	if (this._dom.firstChild) {
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this); // should register each child?
	};
	this._tree_ = this._text_ = null;
	return this;
};

/*
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	*/

Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._dom || node);
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

/*
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	*/

Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._dom || node),(rel._dom || rel));
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};


/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

Imba.Tag.prototype.setText = function (txt){
	this._tree_ = txt;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
	return this;
};


/*
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	*/

Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
		};
		return this;
	};
	
	if (arguments.length == 2) {
		this.setAttribute(("data-" + key),val);
		return this;
	};
	
	if (key) {
		return this.getAttribute(("data-" + key));
	};
	
	var dataset = this.dom().dataset;
	
	if (!(dataset)) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom().attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
};

/*
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	*/

Imba.Tag.prototype.render = function (){
	return this;
};

/*
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	*/

Imba.Tag.prototype.build = function (){
	return this;
};

/*
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	*/

Imba.Tag.prototype.setup = function (){
	return this;
};

/*
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	*/

Imba.Tag.prototype.commit = function (){
	this.render();
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	this.render();
	return this;
};

/*
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	*/

Imba.Tag.prototype.end = function (){
	return this;
};

// called on <self> to check if self is called from other places
Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};

/*
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	*/

Imba.Tag.prototype.synced = function (){
	return this;
};

// called when the node is awakened in the dom - either automatically
// upon attachment to the dom-tree, or the first time imba needs the
// tag for a domnode that has been rendered on the server
Imba.Tag.prototype.awaken = function (){
	return this;
};

/*
	List of flags for this node. 
	*/

Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};

/*
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	*/

Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !(!(toggler))) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this._flags_ || (this._flags_ = {});
	let prev = f[flag];
	
	if (bool && !(prev)) {
		this._dom.classList.add(flag);
		f[flag] = true;
	} else if (prev && !(bool)) {
		this._dom.classList.remove(flag);
		f[flag] = false;
	};
	
	return this;
};

/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this._namedFlags_ || (this._namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};

/*
	Get the children of node
	@return {Imba.Tag[]}
	*/

Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this._dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item._tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this._dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this._dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
};

/*
	Check if this node matches a selector
	@return {Boolean}
	*/

Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query instanceof Function) { sel = sel.query() };
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
};


/*
	Shorthand for console.log on elements
	@return {self}
	*/

Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return true && Imba.Events.trigger(name,this,{data: data});
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
	var cls = this._classes.join(" ");
	if (cls) { dom.className.baseVal = cls };
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	if (Imba.indexOf(child._name,Imba.SVG_TAGS) >= 0) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = this._classes.concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min pattern required size step type",
	label: "accesskey for form",
	img: "src srcset",
	link: "rel type href media",
	iframe: "referrerpolicy src srcdoc sandbox",
	meta: "property content charset desc",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name value",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language",
	select: "size form multiple",
	textarea: "rows cols"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	textarea: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

function extender(obj,sup){
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	return obj;
};

function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

function TagSpawner(type){
	return function(zone) { return type.build(zone); };
};


Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (fullName,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	// if it is namespaced
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !(supr)) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + fullName.replace(/[_\:]/g,'-');
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	var attrs, props;
	let klass = this[type];
	if (!(klass)) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(type,'element');
			
			if (attrs = Imba.HTML_ATTRS[type]) {
				for (let i = 0, items = iter$(attrs.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i]);
				};
			};
			
			if (props = Imba.HTML_PROPS[type]) {
				for (let i = 0, items = iter$(props.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i],{dom: true});
				};
			};
		};
	};
	return klass;
};

Imba.Tags.prototype.createElement = function (name,owner){
	var typ;
	if (name instanceof Function) {
		typ = name;
	} else {
		if (true) {
			if (!this.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		typ = this.findTagType(name);
	};
	return typ.build(owner);
};


Imba.createElement = function (name,ctx,ref,pref){
	var type = name;
	var parent;
	if (name instanceof Function) {
		type = name;
	} else {
		if (true) {
			if (!Imba.TAGS.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		type = Imba.TAGS.findTagType(name);
	};
	
	if (ctx instanceof TagMap) {
		parent = ctx.par$;
	} else if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	// node:$ref = ref if ref
	// context:i$++ # only if it is not an array?
	if (ctx && ref != undefined) {
		ctx[ref] = node;
	};
	
	return node;
};

Imba.createTagCache = function (owner){
	var item = [];
	item._tag = owner;
	return item;
	
	var par = ((this.pref() != undefined) ? this.ctx()[this.pref()] : this.ctx()._tag);
	var node = new TagMap(this.ctx(),this.ref(),par);
	this.ctx()[this.ref()] = node;
	return node;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? pref : ctx._tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node._type = 5;
	node.cache = {i$: 0};
	return node;
};

// use array instead?
function TagCache(owner){
	this._tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item._tag = owner;
	return item;
};



function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
	// self:curr$ = self:$iternew()
	// self:next$ = self:$iternew()
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.static = 5; // wrong(!)
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		// no instance - check for element
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); // should only awaken
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';

// shuold be phased out
Imba.getTagForDom = function (dom){
	if (!(dom)) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS; //  svgSupport and dom isa SVGElement ? Imba.TAGS:_SVG : Imba.TAGS
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	// if ns.@nodeNames.indexOf(name) >= 0
	//	type = ns.findTagType(name)
	
	return new type(dom,null).awaken(dom);
};

// deprecate
Imba.generateCSSPrefixes = function (){
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	return;
};

if (true) {
	if (document) { Imba.generateCSSPrefixes() };
	
	// Ovverride classList
	if (document && !document.documentElement.classList) {
		Imba.extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !(!(bool)) === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// predefine all supported html tags
Imba.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});


Imba.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
};


var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (){
		console.warn("setModel removed. Use <input[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this._data.getFormValue(this);
			let dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on') {
				return this._data.setFormValue(!(!(checked)),this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!(checked) && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._data || this._localValue !== undefined) { return this };
		let mval = this._data.getFormValue(this);
		if (mval == this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!(!(mval))
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
			this._initialValue = this._dom.value;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <textarea[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			let dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		this._initialValue = this._dom.value;
		return this;
	};
});

Imba.extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <select[data:path]>");
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		let prev = this._value;
		this._value = value;
		if (!(syncing)) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		let prev = this._syncValue;
		// check if value has changed
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			// create a copy for syncValue
			value = value.slice();
		};
		
		this._syncValue = value;
		// support array for multiple?
		if (typeof value == 'object') {
			let mult = this.multiple() && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			let res = [];
			for (let i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			let opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// Imba.Touch
// Began	A finger touched the screen.
// Moved	A finger moved on the screen.
// Stationary	A finger is touching the screen but hasn't moved.
// Ended	A finger was lifted from the screen. This is the final phase of a touch.
// Canceled The system cancelled tracking for the touch.

/*
Consolidates mouse and touch events. Touch objects persist across a touch,
from touchstart until end/cancel. When a touch starts, it will traverse
down from the innermost target, until it finds a node that responds to
ontouchstart. Unless the touch is explicitly redirected, the touch will
call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

	tag draggable
		# called when a touch starts
		def ontouchstart touch
			flag 'dragging'
			self
		
		# called when touch moves - same touch object
		def ontouchmove touch
			# move the node with touch
			css top: touch.dy, left: touch.dx
		
		# called when touch ends
		def ontouchend touch
			unflag 'dragging'

@iname touch
*/

Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; // deprecated
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

// var lastNativeTouchTimeout = 50

var touches = [];
var count = 0;
var identifiers = {};

Imba.Touch.count = function (){
	return count;
};

Imba.Touch.lookup = function (item){
	return item && (item.__touch__ || identifiers[item.identifier]);
};

Imba.Touch.release = function (item,touch){
	var v_, $1;
	(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
	((($1 = item.__touch__),delete item.__touch__, $1));
	return;
};

Imba.Touch.ontouchstart = function (e){
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (this.lookup(t)) { continue; };
		var touch = identifiers[t.identifier] = new this(e); // (e)
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};

Imba.Touch.ontouchmove = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	
	// e.preventDefault
	// not always supported!
	// touches = touches.filter(||)
	return this;
};

Imba.Touch.ontouchcancel = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.onmousedown = function (e){
	return this;
};

Imba.Touch.onmousemove = function (e){
	return this;
};

Imba.Touch.onmouseup = function (e){
	return this;
};


Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
Imba.Touch.prototype.timestamp = function(v){ return this._timestamp; }
Imba.Touch.prototype.setTimestamp = function(v){ this._timestamp = v; return this; };

Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };

/*
	@internal
	@constructor
	*/

Imba.Touch.prototype.capture = function (){
	this._captured = true;
	this._event && this._event.stopPropagation();
	if (!this._selblocker) {
		this._selblocker = function(e) { return e.preventDefault(); };
		Imba.document().addEventListener('selectstart',this._selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !(!this._captured);
};

/*
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	*/

Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};

/*
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	*/

Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};

/*
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	*/

Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this._active = false;
	
	return this;
};

Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this._supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this._event = e;
	this._touch = t;
	this._button = 0;
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this._maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.setType('tap');
		tap.process();
		if (tap._responder) { e.preventDefault() };
	};
	
	if (e && this.isCaptured()) {
		e.preventDefault();
	};
	
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self._event = e;
	self._button = e.button;
	self._x = t.clientX;
	self._y = t.clientY;
	self.began();
	self.update();
	self._mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document().addEventListener('mousemove',self._mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this._event = e;
	if (this.isCaptured()) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this._timestamp = Date.now();
	this._maxdr = this._dr = 0;
	this._x0 = this._x;
	this._y0 = this._y;
	
	var dom = this.event().target;
	var node = null;
	
	this._sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this._bubble = false;
			this.setTarget(node);
			this.target().ontouchstart(this);
			if (!this._bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this._updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
	if (dr > this._dr) { this._maxdr = dr };
	this._dr = dr;
	
	// catching a touch-redirect?!?
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; // possibly redirecting again
	};
	
	
	this._updates++;
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
	if (this._redirect) this.update();
	return this;
};

Imba.Touch.prototype.move = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this._event) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this._cancelled) {
		this._cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	var target_;
	if (!this._active) { return this };
	
	this._cancelled = true;
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this._mousemove) {
		Imba.document().removeEventListener('mousemove',this._mousemove,true);
		this._mousemove = null;
	};
	
	if (this._selblocker) {
		Imba.document().removeEventListener('selectstart',this._selblocker,true);
		this._selblocker = null;
	};
	
	return this;
};

/*
	The absolute distance the touch has moved from starting position 
	@return {Number}
	*/

Imba.Touch.prototype.dr = function (){
	return this._dr;
};

/*
	The distance the touch has moved horizontally
	@return {Number}
	*/

Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};

/*
	The distance the touch has moved vertically
	@return {Number}
	*/

Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};

/*
	Initial horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x0 = function (){
	return this._x0;
};

/*
	Initial vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y0 = function (){
	return this._y0;
};

/*
	Horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x = function (){
	return this._x;
};

/*
	Vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y = function (){
	return this._y;
};

/*
	Horizontal position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};

/*
	Vertical position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};

/*
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	*/

Imba.Touch.prototype.button = function (){
	return this._button;
}; // @pointer ? @pointer.button : 0

Imba.Touch.prototype.sourceTarget = function (){
	return this._sourceTarget;
};

Imba.Touch.prototype.elapsed = function (){
	return Date.now() - this._timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Imba.TouchGesture.prototype.active = function(v){ return this._active; }
Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
Imba.TouchGesture.prototype._active = false;

Imba.TouchGesture.prototype.ontouchstart = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchupdate = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchend = function (e){
	return this;
};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event().ctrlKey == true;
};
el.altModifier = function (e){
	return e.event().altKey == true;
};
el.shiftModifier = function (e){
	return e.event().shiftKey == true;
};
el.metaModifier = function (e){
	return e.event().metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode() ? ((e.keyCode() == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode() ? ((e.keyCode() == 8 || e.keyCode() == 46)) : true;
};
el.selfModifier = function (e){
	return e.event().target == this._dom;
};
el.leftModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) { return this };
};

/*
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.

@iname event
*/

Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};

/* reference to the native event */

Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

/* reference to the native event */

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

Imba.Event.prototype.responder = function(v){ return this._responder; }
Imba.Event.prototype.setResponder = function(v){ this._responder = v; return this; };

Imba.Event.wrap = function (e){
	return new this(e);
};

Imba.Event.prototype.setType = function (type){
	this._type = type;
	this;
	return this;
};

/*
	@return {String} The name of the event (case-insensitive)
	*/

Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};
Imba.Event.prototype.native = function (){
	return this._event;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};

// mimc getset
Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.setBubble(v);
		return this;
	};
	return this._bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
};

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

Imba.Event.prototype.stop = function (){
	this.setBubble(false);
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};
Imba.Event.prototype.halt = function (){
	return this.stop();
};

// migrate from cancel to prevent
Imba.Event.prototype.prevent = function (){
	if (this.event().preventDefault) {
		this.event().preventDefault();
	} else {
		this.event().defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented || this._cancel;
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !(!this._silenced);
};

/*
	A reference to the initial target of the event.
	*/

Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};

/*
	A reference to the object responding to the event.
	*/

Imba.Event.prototype.responder = function (){
	return this._responder;
};

/*
	Redirect the event to new target
	*/

Imba.Event.prototype.redirect = function (node){
	this._redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	let i = 1;
	let l = handlers.length;
	let bubble = this._bubble;
	let state = handlers.state || (handlers.state = {});
	let result;
	
	if (bubble) {
		this._bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		// if it is still a string - call getHandler on
		// ancestor of node to see if we get a handler for this name
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!(fn)) {
				console.warn(("event " + this.type() + ": could not find '" + handler + "' in context"),ctx);
			};
			
			// while el and (!fn or !(fn isa Function))
			// 	if fn = el.getHandler(handler)
			// 		if fn[handler] isa Function
			// 			handler = fn[handler]
			// 			context = fn
			// 		elif fn isa Function
			// 			handler = fn
			// 			context = el
			// 	else
			// 		el = el.parent
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			if (!(isMod)) {
				this._responder || (this._responder = node);
			};
			
			if (res == false) {
				// console.log "returned false - breaking"
				break;
			};
			
			if (res && !this._silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	// if we havent stopped or dealt with bubble while handling
	if (this._bubble === 1) {
		this._bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name();
	var meth = ("on" + (this._prefix || '') + name);
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	var domnode = domtarget._responder || domtarget;
	// @todo need to stop infinite redirect-rules here
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!(handler)) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) {
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (this.bubble() && (node[meth] instanceof Function)) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		// add node.nextEventResponder as a separate method here?
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	// if a handler returns a promise, notify schedulers
	// about this after promise has finished processing
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this._silenced && this._responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event());
	};
	return this;
};

/*
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.x = function (){
	return this.native().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.native().y;
};

Imba.Event.prototype.button = function (){
	return this.native().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.native().keyCode;
};
Imba.Event.prototype.ctrl = function (){
	return this.native().ctrlKey;
};
Imba.Event.prototype.alt = function (){
	return this.native().altKey;
};
Imba.Event.prototype.shift = function (){
	return this.native().shiftKey;
};
Imba.Event.prototype.meta = function (){
	return this.native().metaKey;
};
Imba.Event.prototype.key = function (){
	return this.native().key;
};

/*
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	*/

Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(3);

/*

Manager for listening to and delegating events in Imba. A single instance
is always created by Imba (as `Imba.Events`), which handles and delegates all
events at the very root of the document. Imba does not capture all events
by default, so if you want to make sure exotic or custom DOMEvents are delegated
in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`

@iname manager

*/

Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self._shimFocusEvents = true && window.netscape && node.onfocusin === undefined;
	self.setRoot(node);
	self.setListeners([]);
	self.setDelegators({});
	self.setDelegator(function(e) {
		self.delegate(e);
		return true;
	});
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
Imba.EventManager.prototype.count = function(v){ return this._count; }
Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
Imba.EventManager.prototype.setEnabled = function(v){
	var a = this.enabled();
	if(v != a) { this._enabled = v; }
	if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	return this;
}
Imba.EventManager.prototype._enabled = false;
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	
	if (true) {
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager(Imba.document(),{events: [
			'keydown','keyup','keypress',
			'textInput','input','change','submit',
			'focusin','focusout','focus','blur',
			'contextmenu','dblclick',
			'mousewheel','wheel','scroll',
			'beforecopy','copy',
			'beforepaste','paste',
			'beforecut','cut'
		]});
		
		// should listen to dragdrop events by default
		Imba.Events.register([
			'dragstart','drag','dragend',
			'dragenter','dragover','dragleave','dragexit','drop'
		]);
		
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				return Imba.Touch.ontouchcancel(e);
			});
		};
		
		Imba.Events.register('click',function(e) {
			// Only for main mousebutton, no?
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				e._imbaSimulatedTap = true;
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
			return Imba.Events.delegate(e);
		});
		
		Imba.Events.listen('mousedown',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.listen('mouseup',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.register(['mousedown','mouseup']);
		Imba.Events.setEnabled(true);
		return Imba.Events;
	};
};


/*

	Tell the current EventManager to intercept and handle event of a certain name.
	By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
	*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
	*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*

	*/

Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators()[name]) { return this };
	// console.log("register for event {name}")
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners().push([name,handler,capture]);
	if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this._shimFocusEvents) {
		if (e.type == 'focus') {
			Imba.Event.wrap(e).setType('focusin').process();
		} else if (e.type == 'blur') {
			Imba.Event.wrap(e).setType('focusout').process();
		};
	};
	return this;
};

/*

	Create a new Imba.Event

	*/

Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};

/*

	Trigger / process an Imba.Event.

	*/

Imba.EventManager.prototype.trigger = function (){
	return this.create.apply(this,arguments).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().addEventListener(item[0],item[1],item[2]);
	};
	
	window.addEventListener('hashchange',Imba.commit);
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().removeEventListener(item[0],item[1],item[2]);
	};
	
	window.removeEventListener('hashchange',Imba.commit);
	return this;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

var Imba = __webpack_require__(1);

function removeNested(root,node,caret){
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._dom) {
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root._dom.firstChild;
		if ((next instanceof Text) && next.textContent == node) {
			root.removeChild(next);
		} else {
			throw 'cannot remove string';
		};
	};
	
	return caret;
};

function appendNested(root,node){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			appendNested(root,node[i++]);
		};
	} else if (node && node._dom) {
		root.appendChild(node);
	} else if (node != null && node !== false) {
		root.appendChild(Imba.createTextNode(node));
	};
	
	return;
};


// insert nodes before a certain node
// does not need to return any tail, as before
// will still be correct there
// before must be an actual domnode
function insertNestedBefore(root,node,before){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			insertNestedBefore(root,node[i++],before);
		};
	} else if (node && node._dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};

// after must be an actual domnode
function insertNestedAfter(root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
	};
};

function reconcileCollectionChanges(root,new$,old,caret){
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	// This re-order algorithm is based on the following principle:
	// 
	// We build a "chain" which shows which items are already sorted.
	// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
	//
	// 	3 ->  0 (idx)
	// 	2 -> -1 (idx)
	// 	1 -> -1 (idx)
	//
	// This tells us that we have two chains of ordered items:
	// 
	// 	(1, 3) and (2)
	// 
	// The optimal re-ordering then becomes to keep the longest chain intact,
	// and move all the other items.
	
	var newPosition = [];
	
	// The tree/graph itself
	var prevChain = [];
	// The length of the chain
	var lengthChain = [];
	
	// Keep track of the longest chain
	var maxChainLength = 0;
	var maxChainEnd = 0;
	
	var hasTextNodes = false;
	var newPos;
	
	for (let idx = 0, items = iter$(old), len = items.length, node; idx < len; idx++) {
		// special case for Text nodes
		node = items[idx];
		if (node && node.nodeType == 3) {
			newPos = new$.indexOf(node.textContent);
			if (newPos >= 0) { new$[newPos] = node };
			hasTextNodes = true;
		} else {
			newPos = new$.indexOf(node);
		};
		
		newPosition.push(newPos);
		
		if (newPos == -1) {
			root.removeChild(node);
			prevChain.push(-1);
			lengthChain.push(-1);
			continue;
		};
		
		var prevIdx = newPosition.length - 2;
		
		// Build the chain:
		while (prevIdx >= 0){
			if (newPosition[prevIdx] == -1) {
				prevIdx--;
			} else if (newPos > newPosition[prevIdx]) {
				// Yay, we're bigger than the previous!
				break;
			} else {
				// Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx];
			};
		};
		
		prevChain.push(prevIdx);
		
		var currLength = (prevIdx == -1) ? 0 : (lengthChain[prevIdx] + 1);
		
		if (currLength > maxChainLength) {
			maxChainLength = currLength;
			maxChainEnd = idx;
		};
		
		lengthChain.push(currLength);
	};
	
	var stickyNodes = [];
	
	// Now we can walk the longest chain backwards and mark them as "sticky",
	// which implies that they should not be moved
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	// possible to do this in reversed order instead?
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			insertNestedAfter(root,node,(after && after._dom || after || caret));
		};
		
		caret = node._dom || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	// should trust that the last item in new list is the caret
	return lastNew && lastNew._dom || caret;
};


// expects a flat non-sparse array of nodes in both new and old, always
function reconcileCollection(root,new$,old,caret){
	var k = new$.length;
	var i = k;
	var last = new$[k - 1];
	
	
	if (k == old.length && new$[0] === old[0]) {
		// running through to compare
		while (i--){
			if (new$[i] !== old[i]) { break; };
		};
	};
	
	if (i == -1) {
		return last && last._dom || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};

// TYPE 5 - we know that we are dealing with a single array of
// keyed tags - and root has no other children
function reconcileLoop(root,new$,old,caret){
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; // cache-length
	var i = 0,d = nl - ol;
	
	// find the first index that is different
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	// conditionally prune cache
	if (cl > 1000 && (cl - nl) > 500) {
		new$.cache.$prune(new$);
	};
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			// console.log "added in chunk",i,i1
			let before = old[i]._dom;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	return reconcileCollectionChanges(root,new$,old,caret);
};

// expects a flat non-sparse array of nodes in both new and old, always
function reconcileIndexedArray(root,array,old,caret){
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	// console.log "reconcile optimized array(!)",caret,newLen,prevLen,array
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._dom);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._dom : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._dom,before) : root.appendChild(node._dom);
		};
	};
	
	array.domlen = newLen;
	return last ? last._dom : caret;
};


// the general reconciler that respects conditions etc
// caret is the current node we want to insert things after
function reconcileNested(root,new$,old,caret){
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$._dom) {
			return new$._dom;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root._dom.firstChild;
		};
	} else if (new$ instanceof Array) {
		if (old instanceof Array) {
			// look for slot instead?
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) { // should also include a reference?
					for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,items[i],old[i],caret);
					};
					return caret;
				} else {
					removeNested(root,old,caret);
				};
				
				// if they are not the same we continue through to the default
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!(oldIsNull)) {
			if (old._dom) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return insertNestedAfter(root,new$,caret);
		// remove old
	} else if (!(newIsNull) && new$._dom) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		// if old was array or imbatag we need to remove it and then add
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old._dom) {
			root.removeChild(old);
		} else if (!(oldIsNull)) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		// now add the textnode
		return insertNestedAfter(root,new$,caret);
	};
};


Imba.extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this._tree_;
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!(old) && typ != 3) {
			this.removeAllChildren();
			appendNested(this,new$);
		} else if (typ == 1) {
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			let ntyp = typeof new$;
			
			if (new$ && new$._dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.removeAllChildren();
					appendNested(this,new$);
				};
			} else {
				this.setText(new$);
				return this;
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.removeAllChildren();
			appendNested(this,new$);
		};
		
		this._tree_ = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this._text_ || this._dom).textContent = val;
			this._text_ || (this._text_ = this._dom.firstChild);
			this._tree_ = text;
		};
		return this;
	};
});

// alias setContent to setChildren
var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;

// optimization for setText
var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
	};
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(18).Router;

function Doc(src,app){
	this._src = src;
	this._path = src.replace(/\.md$/,'');
	this._app = app;
	this._ready = false;
	this.fetch();
	this;
};

exports.Doc = Doc; // export class 
Doc.prototype.path = function(v){ return this._path; }
Doc.prototype.setPath = function(v){ this._path = v; return this; };
Doc.prototype.src = function(v){ return this._src; }
Doc.prototype.setSrc = function(v){ this._src = v; return this; };
Doc.prototype.data = function(v){ return this._data; }
Doc.prototype.setData = function(v){ this._data = v; return this; };

Doc.prototype.ready = function (){
	return this._ready;
};

Doc.prototype.fetch = function (){
	var self = this;
	return self._promise || (self._promise = self._app.fetch(self.src()).then(function(res) {
		return self.load(res);
	}));
};

Doc.prototype.load = function (doc){
	this._data = doc;
	this._meta = doc.meta || {};
	this._ready = true;
	Imba.commit();
	return this;
};

Doc.prototype.title = function (){
	return this._data.title || 'path';
};

Doc.prototype.toc = function (){
	return this._data && this._data.toc[0];
};

Doc.prototype.body = function (){
	return this._data && this._data.body;
};


var Cache = exports.Cache = {};
var requests = {};

function App(cache){
	if(cache === undefined) cache = {};
	this._cache = cache;
	this._docs = {};
	if (true) {
		this._loc = document.location;
	};
	
	if (this._cache.guide) {
		this._guide = JSON.parse(JSON.stringify(this._cache.guide));
		// for item,i in @guide
		// 	@guide[item:id] = item
		// 	item:next = @guide[i + 1]
		// 	item:prev = @guide[i - 1]
	};
	this;
};

exports.App = App; // export class 
App.prototype.req = function(v){ return this._req; }
App.prototype.setReq = function(v){ this._req = v; return this; };
App.prototype.cache = function(v){ return this._cache; }
App.prototype.setCache = function(v){ this._cache = v; return this; };
App.prototype.issues = function(v){ return this._issues; }
App.prototype.setIssues = function(v){ this._issues = v; return this; };

App.deserialize = function (data){
	if(data === undefined) data = '{}';
	return new this(JSON.parse(data.replace(/§§SCRIPT§§/g,"script")));
};

App.prototype.reset = function (){
	this.setCache({});
	return this;
};

App.prototype.router = function (){
	return this._router || (this._router = new Router(this));
};

App.prototype.path = function (){
	return true && this._loc.pathname;
};

App.prototype.hash = function (){
	return true && this._loc.hash.substr(1);
};

App.prototype.doc = function (src){
	return this._docs[src] || (this._docs[src] = new Doc(src,this));
};

App.prototype.guide = function (){
	return this._guide || (this._guide = this._cache.guide); // .map do ||
};

App.prototype.serialize = function (){
	return JSON.stringify(this.cache()).replace(/\bscript/g,"§§SCRIPT§§");
};

if (false) {};

if (true) {
	App.prototype.fetch = function (src){
		var self = this;
		if (self.cache()[src]) {
			return Promise.resolve(self.cache()[src]);
		};
		
		return requests[src] || (requests[src] = new Promise(async function(resolve) {
			var req = await window.fetch(src);
			var resp = await req.json();
			return resolve(self.cache()[src] = resp);
		}));
	};
};

App.prototype.fetchDocument = function (src,cb){
	var self = this;
	var res = self.deps()[src];
	console.log("no longer?");
	
	if (false) {} else {
		// should guard against multiple loads
		if (res) {
			cb && cb(res);
			return {then: function(v) { return v(res); }}; // fake promise hack
		};
		
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function(res) {
			res = self.deps()[src] = JSON.parse(xhr.responseText);
			return cb && cb(res);
		});
		xhr.open("GET",src);
		xhr.send();
	};
	
	return self;
};

App.prototype.issues = function (){
	return this._issues || (this._issues = Doc.get('/issues/all','json'));
};



/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Router(app){
	var self = this;
	self._app = app;
	
	if (true) {
		window.onpopstate = function(e) {
			return self.refresh();
		};
	};
	
	self;
};

exports.Router = Router; // export class 
Router.prototype.path = function(v){ return this._path; }
Router.prototype.setPath = function(v){ this._path = v; return this; };

Router.slug = function (str){
	str = str.replace(/^\s+|\s+$/g,'').toLowerCase(); // trim
	
	var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaaeeeeiiiioooouuuunc------";
	str = str.replace(/[^a-z0-9 -]/g,''); // remove invalid chars
	str = str.replace(/\s+/g,'-'); // collapse whitespace and replace by -
	str = str.replace(/-+/g,'-'); // collapse dashes
	
	return str;
};

Router.prototype.refresh = function (){
	if (true) {
		document.body.setAttribute('data-route',this.segment(0));
		Imba.commit();
	};
	return this;
};

Router.prototype.path = function (){
	return this._app.path();
};

Router.prototype.hash = function (){
	return this._app.hash();
};

Router.prototype.ext = function (){
	var path = this.path();
	var m = path.match(/\.([^\/]+)$/);
	return m && m[1] || '';
};

Router.prototype.segment = function (nr){
	if(nr === undefined) nr = 0;
	return this.path().split('/')[nr + 1] || '';
};

Router.prototype.go = function (href,state,replace){
	if(state === undefined) state = {};
	if(replace === undefined) replace = false;
	if (href == '/install') {
		// redirects here
		href = '/guides#toc-installation';
	};
	
	if (replace) {
		history.replaceState(state,null,href);
		this.refresh();
	} else {
		history.pushState(state,null,href);
		this.refresh();
		// ga('send', 'pageview', href)
	};
	
	if (!href.match(/\#/)) {
		window.scrollTo(0,0);
	};
	
	return this;
};

Router.prototype.scoped = function (reg,part){
	var path = this.path() + '#' + this.hash();
	if ((typeof reg=='string'||reg instanceof String)) {
		var nxt = path[reg.length];
		return path.substr(0,reg.length) == reg && (!(nxt) || nxt == '-' || nxt == '/' || nxt == '#' || nxt == '?' || nxt == '_');
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Router.prototype.match = function (reg,part){
	var path = this.path() + '#' + this.hash();
	
	if ((typeof reg=='string'||reg instanceof String)) {
		return path == reg;
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Imba.extendTag('element', function(tag){
	tag.prototype.route = function(v){ return this.getAttribute('route'); }
	tag.prototype.setRoute = function(v){ this.setAttribute('route',v); return this; };
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.reroute = function (){
		var scoped = this.router().scoped(this.route(),this);
		this.flag('scoped',scoped);
		this.flag('selected',this.router().match(this.route(),this));
		if (scoped != this._scoped) {
			this._scoped = scoped;
			scoped ? this.didscope() : this.didunscope();
		};
		return this;
	};
	
	tag.prototype.didscope = function (){
		return this;
	};
	
	tag.prototype.didunscope = function (){
		return this;
	};
});

// extend links
Imba.extendTag('a', function(tag){
	
	tag.prototype.route = function (){
		return this._route || this.href();
	};
	
	tag.prototype.ontap = function (e){
		var m;
		if (!(this.href())) { return };
		
		var href = this.href().replace(/^http\:\/\/imba\.io/,'');
		
		if (e.event().metaKey || e.event().altKey) {
			e._responder = null;
			return e.stop();
		};
		
		if (m = href.match(/gist\.github\.com\/([^\/]+)\/([A-Za-z\d]+)/)) {
			console.log('gist!!',m[1],m[2]);
			Imba.getTagSingleton('gist').open(m[2]);
			return e.prevent().stop();
		};
		
		if (href[0] == '#' || href[0] == '/') {
			e.prevent().stop();
			this.router().go(href,{});
			Imba.Events.trigger('route',this);
		} else {
			e._responder = null;
			return e.stop();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		if (true) this.reroute();
		return this;
	};
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var HomePage = __webpack_require__(20).HomePage;
var GuidesPage = __webpack_require__(25).GuidesPage;
var DocsPage = __webpack_require__(26).DocsPage;
var Logo = __webpack_require__(32).Logo;

Imba.extendTag('element', function(tag){
	
	tag.prototype.root = function (){
		return this._owner_ ? this._owner_.root() : this;
	};
	
	tag.prototype.app = function (){
		return this.root().app();
	};
});


var Site = Imba.defineTag('Site', function(tag){
	
	tag.prototype.app = function (){
		return this.data();
	};
	
	tag.prototype.root = function (){
		return this;
	};
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.load = function (){
		return this;
	};
	
	tag.prototype.toggleMenu = function (){
		return document.body.classList.toggle('menu');
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			($[0] || _1('header',$,0,this).setId('header').setContent(
				$[1] || _1('nav',$,1,0).flag('content').setContent([
					_1(Logo,$,2,1),
					_1('a',$,3,1).flag('tab').flag('logo').setHref('/home').setContent($[4] || _1('i',$,4,3).setText('imba'),2),
					_1('span',$,5,1).flag('greedy'),
					_1('a',$,6,1).flag('tab').flag('home').setHref('/home').setContent($[7] || _1('i',$,7,6).setText('home'),2),
					_1('a',$,8,1).flag('tab').flag('guides').setHref('/guide').setContent($[9] || _1('i',$,9,8).setText('learn'),2),
					_1('a',$,10,1).flag('tab').flag('gitter').setHref('https://gitter.im/somebee/imba').setContent($[11] || _1('i',$,11,10).setText('community'),2),
					_1('a',$,12,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[13] || _1('i',$,13,12).setText('github'),2),
					// <a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					_1('a',$,14,1).flag('menu').on$(0,['tap','toggleMenu'],this).setContent($[15] || _1('b',$,15,14),2)
				],2)
			,2)).end((
				$[1].end((
					$[2].end(),
					$[3].end(),
					$[6].end(),
					$[8].end(),
					$[10].end(),
					$[12].end(),
					$[14].end()
				,true))
			,true)),
			
			this.router().scoped('/home') ? (
				($[16] || _1(HomePage,$,16,this)).end()
			) : (this.router().scoped('/guide') ? (
				($[17] || _1(GuidesPage,$,17,this)).bindData(this.app(),'guide',[]).end()
			) : (this.router().scoped('/docs') ? (
				($[18] || _1(DocsPage,$,18,this)).end()
			) : void(0))),
			
			($[19] || _1('footer',$,19,this).setId('footer').setContent([
				_1('hr',$,20,19),
				_1('div',$,21,19).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,22,19).flag('rgt').setContent([
					_1('a',$,23,22).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,24,22).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,25,22).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,26,22).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)).end((
				$[22].end()
			,true))
		],1).synced();
	};
})
exports.Site = Site;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(4).Example;
var Marked = __webpack_require__(21).Marked;
var Pattern = __webpack_require__(24).Pattern;
var Logo = __webpack_require__(32).Logo;


var HomePage = Imba.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setChildren($[0] || _1('div',$,0,this).flag('body').setContent([
			t0 = (t0=_1('div',$,1,0)).setId('hero').flag('dark').setContent([
				this._pattern = this._pattern||_1(Pattern,t0).flag('pattern'),
				_1('div',$,2,t0).flag('content').setContent([
					_1(Marked,$,3,2),
					_1('nav',$,4,2).flag('buttons').setContent([
						// <a.button.try href='#'> "Try online"
						_1('a',$,5,4).flag('button').flag('start').setHref('/guide').setText("Get started"),
						// <a.button.start href='/examples'> "Examples"
						_1('a',$,6,4).flag('button').flag('github').setHref('https://github.com/somebee/imba').setText("Github")
					],2)
				],2)
			
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			],2),
			_1('div',$,7,0).flag('content').setContent([
				_1(Marked,$,8,7).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,9,7).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,10,7).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
			// <Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end(),
					$[2].end((
						$[3].bindData(this.app().guide(),'hero').end(),
						$[4].end()
					,true))
				,true)),
				$[7].end((
					$[8].end(),
					$[9].end(),
					$[10].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Snippet = __webpack_require__(4).Snippet;

var Marked = Imba.defineTag('Marked', function(tag){
	tag.prototype.renderer = function (){
		return this;
	};
	
	tag.prototype.setText = function (text){
		if (text != this._text) {
			this._text = text;
			this.dom().innerHTML = marked(text,{renderer: mdr});
		};
		return this;
	};
	
	tag.prototype.setContent = function (val,typ){
		this.setText(val,0);
		return this;
	};
	
	tag.prototype.setData = function (data){
		if (data && data != this._data) {
			this._data = data;
			this.dom().innerHTML = data.body;
			if (true) this.awakenSnippets();
		};
		return this;
	};
	
	tag.prototype.awakenSnippets = function (){
		for (let i = 0, items = iter$(this.dom().querySelectorAll('.snippet')), len = items.length, item; i < len; i++) {
			item = items[i];
			let code = item.textContent;
			if (code.indexOf('Imba.mount') >= 0) {
				Snippet.replace(item);
			};
		};
		return this;
	};
})
exports.Marked = Marked;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {
'use strict';

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ <>]+(@|:\/)[^ <>]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^<'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)([\s\S]*?[^`])\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|\\[\[\]]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(
          cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1])
        );
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2].trim(), true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return text;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return text;
    }
  }
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = base.replace(/[^/]*$/, '');
    }
  }
  base = baseUrls[' ' + base];

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href;
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
  } else {
    return base + href;
  }
}
var baseUrls = {};
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false,
  baseUrl: null
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)))

/***/ }),
/* 23 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
function shuffle(array){
	var counter = array.length,temp,index;
	
	// While there are elements in the array
	while (counter > 0){
		// Pick a random index
		index = Math.floor(Math.random() * counter);
		counter--; // Decrease counter by 1
		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	};
	
	return array;
};

var Pattern = Imba.defineTag('Pattern', function(tag){
	
	tag.prototype.setup = function (){
		if (false) {};
		var parts = {tags: [],keywords: [],methods: []};
		var items = [];
		var lines = [];
		
		for (let o = Imba.Tag.prototype, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
			k = keys[i];v = o[k];items.push(("<em>" + k + "</em>"));
			parts.methods.push(("<em>" + k + "</em>"));
		};
		
		for (let i = 0, ary = iter$(Imba.HTML_TAGS || HTML_TAGS), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<u>&lt;" + k + "&gt;</u>"));
			parts.tags.push(("<u>&lt;" + k + "&gt;</u>"));
		};
		
		var words = "def if else elif while until for in of var let class extend export import tag global";
		
		for (let i = 0, ary = iter$(words.split(" ")), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<i>" + k + "</i>"));
			parts.keywords.push(("<i>" + k + "</i>"));
		};
		
		var shuffled = shuffle(items);
		var all = [].concat(shuffled);
		var count = items.length - 1;
		
		for (let ln = 0; ln <= 14; ln++) {
			let chars = 0;
			lines[ln] = [];
			while (chars < 300){
				let item = (shuffled.pop() || all[Math.floor(count * Math.random())]);
				if (item) {
					chars += item.length;
					lines[ln].push(item);
				} else {
					chars = 400;
				};
			};
		};
		
		this.dom().innerHTML = '<div>' + lines.map(function(ln,i) {
			let o = Math.max(0,((i - 2) * 0.3 / 14)).toFixed(2);
			return ("<div class='line' style='opacity: " + o + ";'>") + ln.join(" ") + '</div>';
		}).join('') + '</div>';
		return this;
	};
})
exports.Pattern = Pattern;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _3 = Imba.createTagList, _2 = Imba.createTagMap, _4 = Imba.createTagLoopResult, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;
var Snippet = __webpack_require__(4).Snippet;

var GuideTOC = Imba.defineTag('GuideTOC', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.toggle = function (){
		return this.toggleFlag('collapsed');
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc();
	};
	
	tag.prototype.route = function (){
		return ("" + (this.data().path()) + "#" + (this.toc().slug));
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!self.data().ready()) { return self };
		
		let toc = self.toc();
		self.reroute();
		
		return self.$open(0).flag('toc').flag('entry').setLevel((toc.level)).setChildren(
			(toc.children.length && toc.level < 3) ? Imba.static([
				($[0] || _1('div',$,0,self).flag('header').setContent(
					$[1] || _1('a',$,1,0)
				,2)).end((
					$[1].setHref(self.route()).setContent(toc.title,3).end()
				,true)),
				($[2] || _1('div',$,2,self).flag('content')).setContent(
					(function($0) {
						var $$ = $0.$iter();
						for (let i = 0, items = iter$(toc.children), len = items.length, child; i < len; i++) {
							child = items[i];
							if (child.level >= 3) { continue; };
							$$.push(($0[i] || _1(GuideTOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
						};return $$;
					})($[3] || _2($,3,$[2]))
				,5).end()
			],2,1) : (
				($[4] || _1('a',$,4,self)).setHref(self.route()).setContent(toc.title,3).end()
			)
		,3).synced();
	};
});

var Guide = Imba.defineTag('Guide', function(tag){
	
	tag.prototype.setup = function (){
		this.render();
		this._body.dom().innerHTML = this.data().body;
		if (true) {
			this.awakenSnippets();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, ref, ref1;
		return this.$open(0).flag('md').setChildren($.$ = $.$ || [
			this._body = this._body||_1('div',this).flag('body'),
			_1('footer',$,0,this)
		],2).synced((
			$[0].setContent([
				(ref = this.app().guide()[this.data().prev]) ? (
					($[1] || _1('a',$,1,0).flag('prev')).setHref(("/guide/" + (ref.id))).setText("← " + ref.title).end()
				) : void(0),
				(ref1 = this.app().guide()[this.data().next]) ? (
					($[2] || _1('a',$,2,0).flag('next')).setHref(("/guide/" + (ref1.id))).setContent(ref1.title + " →",3).end()
				) : void(0)
			],1).end()
		,true));
	};
	
	tag.prototype.awakenSnippets = function (){
		for (let i = 0, items = iter$(this.dom().querySelectorAll('.snippet')), len = items.length, item; i < len; i++) {
			item = items[i];
			let code = item.textContent;
			if (code.indexOf('Imba.mount') >= 0) {
				Snippet.replace(item);
			};
		};
		return this;
	};
});

var TOC = Imba.defineTag('TOC', 'li', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.__expanded = {'default': true,name: 'expanded'};
	tag.prototype.expanded = function(v){ return this._expanded; }
	tag.prototype.setExpanded = function(v){ this._expanded = v; return this; }
	tag.prototype._expanded = true;
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.route = function (){
		return ("/guide/" + (this.data().route) + "#" + (this.toc().slug));
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc[0];
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flag('toc').flag('entry').setLevel((self.toc().level)).setChildren([
			($[0] || _1('a',$,0,self)).setHref(self.route()).setContent(self.toc().title,3).end(),
			(self.toc().children.length && self.toc().level < 2 && self.expanded()) ? (
				($[1] || _1('ul',$,1,self)).setContent((function($0) {
					var $$ = $0.$iter();
					for (let i = 0, items = iter$(self.toc().children), len = items.length, child; i < len; i++) {
						child = items[i];
						if (child.level >= 3) { continue; };
						$$.push(($0[i] || _1(TOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
					};return $$;
				})($[2] || _2($,2,$[1])),5).end()
			) : void(0)
		],1).synced();
	};
});

var GuidesPage = Imba.defineTag('GuidesPage', Page, function(tag){
	
	tag.prototype.mount = function (){
		var self = this;
		self._onscroll || (self._onscroll = function() { return self.scrolled(); });
		return window.addEventListener('scroll',self._onscroll,{passive: true});
	};
	
	tag.prototype.unmount = function (){
		return window.removeEventListener('scroll',this._onscroll,{passive: true});
	};
	
	tag.prototype.guide = function (){
		return this.data()[this.router().path().replace('/guide/','')] || this.data()['essentials/introduction'];
	};
	
	tag.prototype.scrolled = function (){
		return this;
		
		var items = this.dom().querySelectorAll('[id]');
		var match;
		
		var scrollTop = window.pageYOffset;
		var wh = window.innerHeight;
		var dh = document.body.scrollHeight;
		
		if (this._scrollFreeze >= 0) {
			var diff = Math.abs(scrollTop - this._scrollFreeze);
			if (diff < 50) { return this };
			this._scrollFreeze = -1;
		};
		
		var scrollBottom = dh - (scrollTop + wh);
		
		if (scrollBottom == 0) {
			match = items[len$(items) - 1];
		} else {
			for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
				item = ary[i];
				var t = (item.offsetTop + 30 + 60); // hack
				var dist = scrollTop - t;
				
				if (dist < 0) {
					match = item;break;
				};
			};
		};
		
		if (match) {
			if (this._hash != match.id) {
				this._hash = match.id;
				this.router().go('#' + this._hash,{},true);
				this.render();
			};
		};
		
		return this;
	};
	
	tag.prototype.onroute = function (e){
		var self = this;
		e.stop();
		self.log('guides routed');
		var scroll = function() {
			var el;
			if (el = self.dom().querySelector('#' + self.router().hash())) {
				el.scrollIntoView(true);
				self._scrollFreeze = window.pageYOffset;
				return el;
			};
			return false;
		};
		
		if (self.router().hash()) {
			// render
			scroll() || setTimeout(scroll,20);
		};
		
		return self;
	};
	// prop guide
	
	tag.prototype.render = function (){
		var $ = this.$, self = this, $1;
		let curr = self.guide();
		
		return self.$open(0).flag('_page').setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent(
				$[0] || _1('div',$,0,self._nav).flag('content')
			,2),
			_1('div',$,3,self).flag('body').flag('light')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0,$1,$$) {
						var t0;
						for (let i = 0, items = iter$(self.data().toc), len = items.length, item; i < len; i++) {
							item = items[i];
							$$.push(($0[i] || _1('h1',$0,i)).setContent(item.title || item.id,3).end());
							$$.push((t0 = $1[i] || (t0=_1('ul',$1,i))).setContent(
								(function($0) {
									for (let j = 0, ary = iter$(item.sections), len = $0.taglen = ary.length, section; j < len; j++) {
										section = ary[j];
										($0[j] || _1(TOC,$0,j)).bindData(self.data(),section).setExpanded((self.data()[section] == curr)).end();
									};return $0;
								})(t0.$['A'] || _3(t0.$,'A',$1[i]))
							,4).end());
						};return $$;
					})($[1] || _3($,1,$[0]),$[2] || _3($,2,$[0]),_4())
				// for guide in data
				//	<TOC[guide] toc=guide:toc[0] expanded=(guide == curr)>
				,5).end()
			,true)),
			$[3].setContent(
				self.guide() ? (
					($[($1 = '4$' + self.guide().id)] || _1(Guide,$,$1,3)).bindData(self,'guide',[]).end()
				) : void(0)
			,3).end()
		,true));
	};
})
exports.GuidesPage = GuidesPage;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _3 = Imba.createTagMap, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

function pathToAnchor(path){
	return 'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set');
};

var Desc = Imba.defineTag('Desc', function(tag){
	
	tag.prototype.setHtml = function (html){
		if (html != this._html) {
			this.dom().innerHTML = this._html = html;
		};
		this;
		return this;
	};
});

var Ref = Imba.defineTag('Ref', function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).synced();
	};
});

var Item = Imba.defineTag('Item');

var Path = Imba.defineTag('Path', 'span', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.setup = function (){
		var items = [];
		var str = this.data();
		if ((typeof str=='string'||str instanceof String)) {
			if (this.short()) {
				str = str.replace(/([A-Z]\w*\.)*(?=[A-Z])/g,'');
			};
			
			this.setHtml(str.replace(/\b([\w]+|\.|\#)\b/g,function(m,i) {
				if (i == '.' || i == '#') {
					return ("<i>" + i + "</i>");
				} else if (i[0] == i[0].toUpperCase()) {
					return ("<b class='const'>" + i + "</b>");
				} else {
					return ("<b class='id'>" + i + "</b>");
				};
			}));
		};
		return this;
	};
});


var Return = Imba.defineTag('Return', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1(Path,$,0,this).flag('value'),
			_1('span',$,1,this).flag('desc')
		],2).synced((
			$[0].bindData(this.data(),'value').end(),
			$[1].setContent(this.data().desc,3).end()
		,true));
	};
});

var Class = Imba.defineTag('Class', Item, function(tag){
	
	tag.prototype.__data = {watch: 'parse',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.parse && this.parse(v,a,this.__data) }
		return this;
	};
	
	tag.prototype.parse = function (){
		let res = [];
		for (let i = 0, items = iter$(this.data()['.']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res.push(m);
		};
		this._statics = res;
		let res1 = [];
		for (let i = 0, items = iter$(this.data()['#']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res1.push(m);
		};
		this._methods = res1;
		this._properties = [];
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren([
			($[0] || _1('span',$,0,self).flag('toc-anchor')).setId(pathToAnchor(self.data().namepath)).end(),
			($[1] || _1('div',$,1,self).flag('header').setContent($[2] || _1('div',$,2,1).flag('title').setContent($[3] || _1(Path,$,3,2),2),2)).end((
				$[2].end((
					$[3].bindData(self.data(),'namepath').end()
				,true))
			,true)),
			($[4] || _1(Desc,$,4,self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($[5] || _1('div',$,5,self).flag('content').flag('ctor').setContent(
					$[6] || _1(Method,$,6,5)
				,2)).end((
					$[6].bindData(self.data(),'ctor').setPath((self.data().namepath + '.new')).end()
				,true))
			) : void(0),
			
			($[7] || _1('div',$,7,self).flag('content')).setContent([
				(self._statics.length > 0) ? (
					($[8] || _1('div',$,8,7).flag('section').setContent([
						_1('h2',$,9,8).flag('header').setText('Static Methods'),
						_1('div',$,10,8).flag('content').flag('list')
					],2)).end((
						$[10].setContent((function($0) {
							for (let i = 0, items = iter$(self._statics), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().namepath).end();
							};return $0;
						})($[11] || _2($,11,$[10])),4).end()
					,true))
				) : void(0),
				
				(self._methods.length > 0) ? (
					($[12] || _1('div',$,12,7).flag('section').setContent([
						_1('h2',$,13,12).flag('header').setText('Instance Methods'),
						_1('div',$,14,12).flag('content').flag('list')
					],2)).end((
						$[14].setContent((function($0) {
							for (let i = 0, items = iter$(self._methods), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().iname).end();
							};return $0;
						})($[15] || _2($,15,$[14])),4).end()
					,true))
				) : void(0)
			],1).end()
		],1).synced();
	};
});

var Value = Imba.defineTag('Value', function(tag){
	
	tag.prototype.render = function (){
		var data_, $1;
		if (this.data().type) {
			this.$open(0).setFlag(-1,this.data().type).setChildren(
				this.data().value
			,3).synced();
		} else if ((typeof (data_ = this.data())=='string'||data_ instanceof String)) {
			this.$open(1).flag('str').setText(this.data()).synced();
		} else if ((typeof ($1 = this.data())=='number'||$1 instanceof Number)) {
			this.$open(2).flag('num').setText(this.data()).synced();
		};
		return this;
	};
});


var Param = Imba.defineTag('Param', function(tag){
	
	tag.prototype.type = function (){
		return this.data().type;
	};
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setFlag(-1,self.type()).setChildren(
			(self.type() == 'NamedParams') ? (
				(function($0) {
					for (let i = 0, items = iter$(self.data().nodes), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[0] || _2($,0))
			) : Imba.static([
				($[1] || _1('div',$,1,self).flag('name')).setContent(self.data().name,3).end(),
				self.data().defaults ? Imba.static([
					($[2] || _1('i',$,2,self)).setContent((self.type() == 'NamedParam') ? ': ' : ' = ',3).end(),
					($[3] || _1(Value,$,3,self)).bindData(self.data(),'defaults').end()
				],2,1) : void(0)
			],1,2)
		,3).synced();
	};
});

var Method = Imba.defineTag('Method', Item, function(tag){
	
	tag.prototype.iname = function(v){ return this._iname; }
	tag.prototype.setIname = function(v){ this._iname = v; return this; };
	tag.prototype.path = function(v){ return this._path; }
	tag.prototype.setPath = function(v){ this._path = v; return this; };
	
	tag.prototype.tags = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._tags = this._tags||(t0=_1('div',this)).flag('tags')).setContent([
			this.data().return ? ((t0.$.A || _1(Return,t0.$,'A',t0).setName('returns')).bindData(this.data(),'return').end()) : void(0),
			
			this.data().deprecated ? (
				(t0.$.B || _1('div',t0.$,'B',t0).flag('deprecated').flag('red').setText('Method is deprecated'))
			) : void(0),
			this.data().private ? (
				(t0.$.C || _1('div',t0.$,'C',t0).flag('private').flag('red').setText('Method is private'))
			) : void(0)
		],1).end();
	};
	
	
	tag.prototype.path = function (){
		return this._path || (this.iname() + '.' + this.data().name);
	};
	
	tag.prototype.slug = function (){
		return pathToAnchor(this.data().namepath);
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flagIf('deprecated',(self.data().deprecated)).setChildren([
			$[0] || _1('span',$,0,self).flag('toc-anchor'),
			$[1] || _1('div',$,1,self).flag('header').setContent([
				_1(Path,$,2,1),
				_1('div',$,3,1).flag('params'),
				_1('div',$,5,1).flag('grow')
			],2),
			$[6] || _1(Desc,$,6,self).flag('md'),
			self.tags()
		],1).synced((
			$[0].setId(self.slug()).end(),
			$[1].end((
				$[2].bindData(self,'path',[]).end(),
				$[3].setContent((function($0) {
					for (let i = 0, items = iter$(self.data().params), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[4] || _2($,4,$[3])),4).end()
			,true)),
			$[6].setHtml(self.data().html).end()
		,true));
	};
});

var Link = Imba.defineTag('Link', 'a', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		this.$open(0).setHref(("/docs#" + pathToAnchor(this.data().namepath))).setChildren($[0] || _1(Path,$,0,this),2).synced((
			$[0].bindData(this.data(),'namepath').setShort(this.short()).end()
		,true));
		return tag.__super__.render.apply(this,arguments);
	};
	
	tag.prototype.ontap = function (){
		tag.__super__.ontap.apply(this,arguments);
		return this.trigger('refocus');
	};
});

var Group = Imba.defineTag('Group', function(tag){
	
	tag.prototype.ontap = function (){
		return this.toggleFlag('collapsed');
	};
});


var DocsPage = Imba.defineTag('DocsPage', Page, function(tag){
	
	tag.prototype.__version = {'default': 'current',name: 'version'};
	tag.prototype.version = function(v){ return this._version; }
	tag.prototype.setVersion = function(v){ this._version = v; return this; }
	tag.prototype._version = 'current';
	tag.prototype.roots = function(v){ return this._roots; }
	tag.prototype.setRoots = function(v){ this._roots = v; return this; };
	
	tag.prototype.src = function (){
		return ("/api/" + this.version() + ".json");
	};
	
	tag.prototype.docs = function (){
		return this._docs;
	};
	
	tag.prototype.setup = function (){
		this.load();
		return tag.__super__.setup.apply(this,arguments);
	};
	
	tag.prototype.load = async function (){
		var docs = await this.app().fetch(this.src());
		DOCS = this._docs = JSON.parse(JSON.stringify(docs));
		DOCMAP = this._docs.entities;
		this.generate();
		if (true) {
			return this.loaded();
		};
	};
	
	tag.prototype.loaded = function (){
		var el;
		this.render();
		if (document.location.hash) {
			if (el = this.dom().querySelector(document.location.hash)) {
				el.scrollIntoView();
			};
		};
		return this;
	};
	
	tag.prototype.onrefocus = function (e){
		return this.refocus();
	};
	
	tag.prototype.refocus = function (){
		var el;
		if (el = this.dom().querySelector(document.location.hash)) {
			el.scrollIntoView();
		};
		return this;
	};
	
	tag.prototype.lookup = function (path){
		return this.docs().entities[path];
	};
	
	tag.prototype.generate = function (){
		this._roots = [];
		var ents = this._docs.entities;
		
		for (let o = this.docs().entities, item, i = 0, keys = Object.keys(o), l = keys.length, path; i < l; i++){
			path = keys[i];item = o[path];if (item.type == 'class' || path == 'Imba') {
				item['.'] = (item['.'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				item['#'] = (item['#'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				
				if (item.desc) { this._roots.push(item) };
			};
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!(self.docs())) { return self };
		
		return self.$open(0).setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent($[0] || _1('div',$,0,self._nav).flag('content'),2),
			_1('div',$,2,self).flag('body')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0) {
						var t0;
						for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length, root; i < len; i++) {
							root = items[i];
							(t0 = $0[i] || (t0=_1(Group,$0,i)).flag('toc').flag('class').flag('section').flag('compact').setContent([
								_1('div',t0.$,'A',t0).flag('header').setContent(t0.$.B || _1(Link,t0.$,'B','A').flag('class'),2),
								_1('div',t0.$,'C',t0).flag('content').setContent([
									_1('div',t0.$,'D','C').flag('static'),
									_1('div',t0.$,'F','C').flag('instance')
								],2)
							],2)).end((
								t0.$.A.end((
									t0.$.B.setData(root).end()
								,true)),
								t0.$.C.end((
									t0.$.D.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['.']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['E'] || _3(t0.$,'E',t0.$.D))
									,5).end(),
									t0.$.F.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['#']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['G'] || _3(t0.$,'G',t0.$.F))
									,5).end()
								,true))
							,true));
						};return $0;
					})($[1] || _2($,1,$[0]))
				,4).end()
			,true)),
			$[2].setContent(
				(function($0) {
					for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Class,$0,i).flag('doc').flag('l')).setData(items[i]).end();
					};return $0;
				})($[3] || _2($,3,$[2]))
			,4).end()
		,true));
	};
})
exports.DocsPage = DocsPage;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var Logo = Imba.defineTag('Logo', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('svg:svg',$,0,this).set('xmlns',"http://www.w3.org/2000/svg").set('width',"116").set('height',"108").set('viewBox',"0 0 116 108").setContent(
				$[1] || _1('svg:g',$,1,0).set('fill',"#3E91FF").set('fill-rule',"evenodd").setContent(
					$[2] || _1('svg:path',$,2,1).set('d',"M38.8638869 68.1351424C39.5073476 69.57271 39.6890057 70.9547825 39.4088666 72.2814014 39.1287276 73.6080204 38.4437022 74.6096805 37.3537699 75.2864118 36.2638375 75.9631432 35.0187288 76.1517033 33.6184062 75.8520979 32.7123152 75.6582356 31.735207 75.1892035 30.6870523 74.4449875 28.9429109 72.511945 26.9954547 70.3187797 24.8446252 67.8654257 22.6937958 65.4120718 20.5105674 62.9084866 18.2948748 60.3545951 16.0791821 57.8007035 13.9003309 55.2763902 11.7582558 52.7815794 9.61618066 50.2867686 7.6319162 48.0640634 5.80540286 46.113397 4.76759128 44.5047965 4.39751492 42.9957526 4.69516266 41.58622 5.04533648 39.9279464 6.13425543 38.6444027 7.96195216 37.7355506L11.2147227 36.0916942C12.9013528 35.23932 14.9406188 34.2457658 17.3325818 33.1110021 19.7245448 31.9762383 22.2456979 30.7391523 24.8961167 29.3997071 27.5465356 28.0602619 30.0676887 26.8231759 32.4596517 25.6884121 34.8516147 24.5536483 36.9158504 23.543772 38.6524209 22.6587528 40.3889914 21.7737337 41.4482676 21.2421093 41.8302813 21.0638636 43.5935059 20.2285156 53.6162109 18.7922363 52.4217391 22.7325491L47.9115556 39.8008309C47.8077805 40.1935561 47.476752 40.4844863 47.0739524 40.536973L18.065609 44.3168991C19.4504169 45.9130813 21.0635148 47.7530692 22.9049511 49.836918 24.7463873 51.9207668 26.5996344 54.0504464 28.4647479 56.2260208 30.3298615 58.4015952 32.1831086 60.5312748 34.0245448 62.6151236 35.8659811 64.6989723 37.479079 66.5389602 38.8638869 68.1351424zM67.2090353 76.2221773C65.9199285 77.108676 65.0557147 78.1844225 64.616368 79.4494491 64.1770213 80.7144756 64.2517959 81.9117897 64.840694 83.0414271 65.4295921 84.1710644 66.4018778 84.967275 67.7575804 85.4300825 68.6347998 85.7295462 69.7140012 85.8326519 70.9952172 85.7394025 73.4831625 84.996847 76.2789554 84.1383159 79.3826799 83.1637834 82.4864043 82.1892508 85.6436845 81.1888133 88.8546153 80.1624406 92.0655461 79.1360679 95.2296911 78.1158645 98.3471451 77.1018 101.464599 76.0877354 104.30713 75.2230503 106.874822 74.5077187 108.590124 73.6782757 109.681162 72.5915252 110.147968 71.2474344 110.697151 69.6661512 110.420092 68.0239253 109.316783 66.3207074L107.366721 63.2671813C106.355574 61.6838635 105.11404 59.8008236 103.642084 57.6180053 102.170128 55.4351869 100.6397 53.0997773 99.0507529 50.6117065 97.4618062 48.1236357 95.9313778 45.7882262 94.4594217 43.6054078 92.9874656 41.4225894 91.7328604 39.5129779 90.6955685 37.8765161 89.6582766 36.2400542 89.0213345 35.248794 88.7847232 34.9027056 87.3457031 32.7919922 80.3010254 26.2080078 78.8369005 30.8970692L73.9654789 47.6242056C73.8513184 48.0162014 73.9869249 48.4382316 74.3080551 48.6903601L97.2701725 66.7185771C95.2633408 67.3600601 92.9355824 68.0909485 90.2868275 68.9112643 87.6380726 69.7315801 84.9556916 70.5846092 82.2396039 71.4703772 79.5235163 72.3561452 76.8411352 73.2091743 74.1923803 74.0294902 71.5436255 74.849806 69.2158671 75.5806944 67.2090353 76.2221773zM65.4501401 8.01131118C66.3107935 6.48608129 67.3093706 5.43525523 68.4459012 4.85880147 69.5824318 4.28234771 70.7322595 4.14743206 71.8954188 4.45405048 72.9754953 4.73876759 73.8930671 5.37486487 74.6481616 6.36236141 75.4032562 7.34985795 75.7770161 8.67483946 75.7694527 10.3373457L51.392716 99.8387197C50.7976079 101.696765 49.8527941 102.958873 48.5582463 103.62508 47.2636986 104.291287 45.9933227 104.460128 44.7470806 104.131608 43.5839212 103.82499 42.6207345 103.111165 41.8574915 101.990113 41.0942485 100.86906 40.8328884 99.3765993 41.0734034 97.5126852L65.4501401 8.01131118z")
				,2)
			,2)
		,2).synced((
			$[0].end((
				$[1].end((
					$[2].end()
				,true))
			,true))
		,true));
	};
})
exports.Logo = Logo;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTk3MTYzYjZlYjNmMDcyYWEzZjYiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Mb2dvLmltYmEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDN0RBLE9BQU8sUUFBUTs7Ozs7Ozs7Ozs7O0lDSVgsS0FBSzs7Ozs7Ozs7OztBQVNUO1FBQ0M7RUFDQztTQUNBLEtBQUs7R0FGTzs7Ozs7Ozs7Ozs7QUFXZDtRQUNDLFlBQVksTUFBTTs7Ozs7OztBQUtuQjtRQUNDLGNBQWM7Ozs7Ozs7QUFLZjtRQUNDLGFBQWE7Ozs7QUFHZDtDQUNDOzthQUNZLElBQUcsSUFBSSxlQUFlLE1BQWpDLElBQUksR0FBRyxFQUFFOzs7Q0FFVixJQUFJLFVBQVUsRUFBRSxPQUFPLE9BQU8sSUFBSTtDQUNsQyxJQUFJLFVB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QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QjtBQUMvQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLDZCQUE2QjtBQUM5Qzs7QUFFQTtBQUNBLG1CQUFtQixnQkFBZ0I7QUFDbkM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0Msa0JBQWtCO0FBQ3BELHdCQUF3QjtBQUN4Qix3QkFBd0I7QUFDeEIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0EsOERBQThEO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLHNCQUFzQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQiw0QkFBNEI7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsVUFBVSxtQkFBbUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLENBQUM7QUFDRCxxQkFBcUIsZUFBZSxFQUFFO0FBQ3RDLENBQUM7QUFDRDtBQUNBOztBQUVBLENBQUM7QUFDRDtBQUNBLENBQUM7Ozs7Ozs7O0FDdnlDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7Ozs7O0FDcEJBO0tBQ0ssUUFBUSxFQUFFLE1BQU0sT0FBUSxLQUFNOzs7UUFHNUIsUUFBUSxFQUFFOztFQUVmLE1BQU0sRUFBRSxLQUFLLE1BQU0sS0FBSyxTQUFPLEVBQUU7RUFDakM7O0VBRUEsS0FBSyxFQUFFLE1BQU07RUFDYixNQUFNLFNBQVMsRUFBRSxNQUFNO0VBQ3ZCLE1BQU0sT0FBTyxFQUFFOzs7UUFFVDs7O2NBRUQ7O0NBRU47RUFDYTtNQUNSLE1BQU07TUFDTixNQUFNO01BQ04sTUFBTTs7RUFFVixhQUFlLEtBQUssSUFBSTt3QkFDdkIsTUFBTSxlQUFXO0dBQ2pCLE1BQU0sUUFBUSxlQUFXOzs7RUFFMUIsNEJBQVMsS0FBSyxVQUFVLEdBQUc7O0dBQzFCLE1BQU0sa0JBQWM7R0FDcEIsTUFBTSxLQUFLLGtCQUFjOzs7TUFFdEIsTUFBTTs7RUFFViw0QkFBUyxNQUFNOztHQUNkLE1BQU0sY0FBVTtHQUNoQixNQUFNLFNBQVMsY0FBVTs7O01BRXRCLFNBQVMsRUFBRSxRQUFRO01BQ25CLElBQUksS0FBSyxPQUFPO01BQ2hCLE1BQU0sRUFBRSxNQUFNLE9BQU8sRUFBRTs7RUFFM0IsY0FBVyxTQUFLO09BQ1gsTUFBTSxFQUFFO0dBQ1osTUFBTSxJQUFJO1VBQ0osTUFBTSxFQUFFO1FBQ1QsS0FBSyxHQUFHLFNBQVMsTUFBSSxHQUFHLElBQUksS0FBSyxNQUFNLE1BQU0sRUFBRSxLQUFLO0lBQ3hELElBQUc7S0FDRixNQUFNLEdBQUcsS0FBSztLQUNkLE1BQU0sSUFBSSxLQUFLOztLQUVmLE1BQU0sRUFBRTs7Ozs7RUFFWCxXQUFJLFVBQVUsVUFBVSxFQUFFLE1BQU07T0FDM0IsRUFBRSxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssUUFBUTtrREFDYixXQUFPLEVBQUUsR0FBRyxVQUFVO0tBQ3pELFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7a0NDdkROO3FDQUNBOztlQUVQOzs7Ozs7Q0FJQztjQUNDOzs7Q0FFRDtjQUNDLEtBQUssR0FBRyxZQUFLOzs7Q0FFZDtnQkFDRyxZQUFLLGlCQUFPLFdBQUk7OztDQUVuQjs7RUFDYSxLQUFPLFlBQUs7O01BRXBCLElBQUksRUFBRTtFQUNWOzt1QkFFSyxZQUFJLGNBQU8sVUFBTyxJQUFJO0lBQ3ZCLElBQUksU0FBUyxPQUFPLEdBQUksSUFBSSxNQUFNLEVBQUU7Z0NBQ3JDOzs7VUFDRyxRQUFLLHlCQUFPLElBQUk7O2dDQUNuQjs7O01BQ0EsOEJBQWEsSUFBSTs7V0FBYyxNQUFNLE1BQU0sR0FBRTtxRUFDNUIsT0FBSTs7Ozs7K0JBRW5CLFFBQUsseUJBQU8sSUFBSTs7Ozs7O1lBRXZCOztDQUVDO0VBQ0M7T0FDQSxNQUFNLE1BQUksVUFBVSxFQUFFLFlBQUs7RUFDM0I7R0FDQzs7Ozs7Q0FHRjs7dUJBQ007UUFDQTs7OztLQUVJLElBQUksRUFBRSxXQUFJLFFBQU0sWUFBSzs0QkFDekIsY0FBTSxzQkFBYyxJQUFJLG1CQUFXLEVBQUUsSUFBSTs7S0FDckMsS0FBSSxFQUFFLFdBQUksUUFBTSxZQUFLOzRCQUN6QixjQUFNLHNCQUFjLEtBQUksaUJBQU0sS0FBSSxNQUFNOzs7Ozs7Q0FFOUM7RUFDQyw4QkFBWSxXQUFJOztPQUNYLEtBQUssRUFBRSxLQUFLO0dBQ2hCLElBQUcsS0FBSyxzQkFBc0IsR0FBRztJQUNoQyxRQUFRLFFBQVE7Ozs7Ozs7VUFHcEI7Ozt3Q0FFd0I7OzsyQkFBQTs7OztDQUd2Qjt1QkFDVSxZQUFLLGdCQUFRLFdBQUk7OztDQUUzQjtjQUNDLEtBQUssR0FBRyxZQUFLLElBQUk7OztDQUVsQjs7dUJBQ00sWUFBSSxjQUFPLFVBQU8sV0FBSTs4QkFDdkIsUUFBSyx5QkFBTyxXQUFJO0lBQ2hCLFdBQUksU0FBUyxPQUFPLEdBQUksV0FBSSxNQUFNLEVBQUUsRUFBRSxHQUFJOzs7S0FDdkMsOEJBQWEsV0FBSTs7VUFBYyxNQUFNLE1BQU0sR0FBRTsrREFDdEMsT0FBSTs7Ozs7Ozs7aUJBRWI7O0NBRU47O09BQ0MsbURBQWlCO1NBQ2pCLE9BQU8sK0JBQTBCLG9CQUFtQjs7O0NBRXJEO1NBQ0MsT0FBTyxrQ0FBNkIsb0JBQW1COzs7Q0FFeEQ7U0FDQyxZQUFLLGNBQU8sT0FBSyx1QkFBdUIsR0FBRzs7O0NBRTVDOzs7TUFHSyxNQUFNLEVBQUUsV0FBSTtNQUNaOztNQUVBLFVBQVUsRUFBRSxPQUFPO01BQ25CLEdBQUcsRUFBRSxPQUFPO01BQ1osR0FBRyxFQUFFLFNBQVMsS0FBSzs7RUFFdkIsU0FBRyxjQUFjLEdBQUc7T0FDZixLQUFLLEVBQUUsS0FBSyxJQUFJLFVBQVUsT0FBRTtHQUNwQixJQUFHLEtBQUssRUFBRTtRQUN0QixjQUFjLEdBQUc7OztNQUVkLGFBQWEsRUFBRSxHQUFHLEdBQUcsVUFBVSxFQUFFOztFQUVyQyxJQUFHLGFBQWEsR0FBRztHQUNsQixNQUFNLEVBQUUsV0FBTSxPQUFVLEVBQUU7O0dBRTFCLDRCQUFZOztRQUNQLEVBQUUsR0FBRyxLQUFLLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFDM0IsS0FBSyxFQUFFLFVBQVUsRUFBRTs7SUFFdkIsSUFBRyxLQUFLLEVBQUU7S0FDSCxNQUFNLEVBQUU7Ozs7O0VBRWpCLElBQUc7R0FDRixTQUFHLE1BQU0sR0FBRyxNQUFNO1NBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsY0FBTyxPQUFPLE9BQUUsU0FBUztJQUN6Qjs7Ozs7OztDQUlIOztFQUNDLEVBQUU7T0FDRjtNQUNJLE9BQU87O0dBQ1YsSUFBTyxHQUFHLEVBQUUsV0FBSSxrQkFBa0IsRUFBRSxjQUFPO0lBQzFDLEdBQUcsZUFBZTtTQUNsQixjQUFjLEVBQUUsT0FBTztXQUNoQjs7VUFDRDs7O0VBRVIsSUFBRyxjQUFPOztHQUVULFNBQVMsR0FBRyxXQUFXLE9BQU87Ozs7Ozs7Q0FLaEM7O01BQ0ssS0FBSyxFQUFFOzt1QkFFTjtRQUNBOzhCQUFBLE1BQ0Y7O3NCQVFELGFBQUs7O1FBVEY7Ozs7TUFFRiw4QkFBWSxZQUFLOzttREFDWCxLQUFLLE1BQU0sR0FBRyxLQUFLOzs7U0FFdkIsNEJBQWUsS0FBSzs7MkNBQ2QsWUFBSyxTQUFVLGFBQVUsWUFBSyxTQUFTLEdBQUc7Ozs7Ozs7Ozs7O0lBSWhEO3FCQUNNLGFBQU07Ozs7Ozs7Ozs7Ozs7OztrQ0MxSlo7O0FBRVA7ZUFDUSxFQUFFLEtBQUssbUJBQW1CLG9CQUFvQjs7O1dBRXREOztDQUVDO0VBQ0MsSUFBRyxLQUFLLFFBQUc7R0FDVixXQUFJLFVBQVUsT0FBRSxNQUFNLEVBQUU7Ozs7Ozs7VUFHM0I7O0NBRUM7Ozs7O1dBR0Q7O1dBRUE7Ozs7Q0FHQztNQUNLLE1BQU07TUFDTixJQUFJLEVBQUU7RUFDVixZQUFHO0dBQ0YsSUFBRztJQUNGLElBQUksRUFBRSxJQUFJOzs7UUFFWCxRQUFPLElBQUk7SUFDVixJQUFHLEVBQUUsT0FBTyxHQUFHLEVBQUU7cUJBQ1g7V0FDTixJQUFLLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRzttQ0FDRTs7Z0NBRUg7Ozs7Ozs7OzthQUlyQjs7OztDQUdDOzs7cUJBRW1CO3VCQUNaOztpQkFEQzttQkFDTSxZQUFLOzs7OztZQUVwQjs7Ozs7Ozs7Ozs7Q0FJQzs7RUFDZSw4QkFBUzs7UUFBZSxFQUFFO1lBQTVCOztPQUFaOztFQUNjLDhCQUFTOztRQUFlLEVBQUU7YUFBNUI7O09BQVo7T0FDQSxZQUFZOzs7O0NBR2I7OztnQ0FFTyxvQkFBWSxNQUFHLGFBQWEsWUFBSzsrQkFDckMsa0RBQVU7O21CQUFjOzs7K0JBQ25CLFFBQUssWUFBSztHQUNiLFlBQUs7Z0NBQ04sZ0JBQVE7OzttQkFDQSxvQkFBVyxTQUFNLFlBQUssU0FBUzs7OzsrQkFFeEM7VUFDRyxTQUFTLE9BQU8sRUFBRTs4QkFDbkI7cUJBQ0c7dUJBQ0YsZ0JBQVE7OztPQUFPLG1DQUFZO2tDQUNkLCtCQUFLLFNBQU0sWUFBSzs7Ozs7O1VBRTdCLFNBQVMsT0FBTyxFQUFFO2dDQUNuQjt1QkFDRzt3QkFDRixnQkFBUTs7O09BQU8sbUNBQVk7a0NBQ2QsK0JBQUssU0FBTSxZQUFLOzs7Ozs7Ozs7O1lBRXBDOztDQUVDOztFQUNDLElBQUcsWUFBSzs0QkFDQyxZQUFLO0lBQ1osWUFBSzs7U0FDUCwwQkFBSztpQkFDQyxZQUFLLFFBQUs7U0FDaEIsdUJBQUs7aUJBQ0MsWUFBSyxRQUFLOzs7Ozs7O1lBSWxCOztDQUVDO1NBQ0MsWUFBSzs7O0NBRU47O2tDQUNTO0lBQ0osWUFBSzs7S0FDUCw4QkFBYSxZQUFLOzs7OztnQ0FHakIseUJBQU8sWUFBSztJQUNWLFlBQUs7NENBQ0gsWUFBSzsyQ0FDRjs7Ozs7OzthQUVaOzs7Ozs7O0NBS0M7O29CQUNLO0dBQ3FDLFlBQUssNENBQXhCLDZCQUFiOztHQUVMLFlBQUs7cUNBQ04sbUJBQVc7O0dBQ1YsWUFBSztxQ0FDTixnQkFBUTs7Ozs7O0NBR1o7Y0FDQyxNQUFNLElBQUksYUFBTSxNQUFNLEVBQUUsWUFBSzs7O0NBRTlCO1NBQ0MsYUFBYSxZQUFLOzs7Q0FFbkI7O3VCQUNPLHFCQUFhLFlBQUs7K0JBQ2xCOzhCQUNKOztvQkFFQztvQkFFQTs7NkJBQ0c7R0FDTDs7UUFQaUIsTUFBRzs7OztLQUdULDhCQUFhLFlBQUs7Ozs7O1FBR3BCLFFBQUssWUFBSzs7Ozs7V0FHdEI7Ozs7Q0FHQzs7Z0JBQ08sb0JBQWEsYUFBYSxZQUFLO2lCQUFtQix3QkFBZSxTQUFNOzs7OztDQUc5RTs7Y0FFQzs7OztZQUVGOztDQUVDO2NBQ0M7Ozs7O2VBR0s7Ozs7Ozs7OztDQUtOO29CQUNROzs7Q0FFUjtjQUNDOzs7Q0FFRDtFQUNDOzs7O0NBR0Q7TUFDSyxLQUFLLFFBQVEsV0FBSSxNQUFNO0VBQzNCLEtBQUssT0FBRSxNQUFNLEVBQUUsS0FBSyxNQUFNLEtBQUssVUFBVTtFQUN6QyxPQUFPLE9BQUUsTUFBTTtFQUNmO0VBQ0E7VUFDQzs7OztDQUVGOztFQUNDO0VBQ0EsSUFBRyxTQUFTLFNBQVM7R0FDcEIsSUFBTyxHQUFHLEVBQUUsV0FBSSxjQUFjLFNBQVMsU0FBUztJQUMvQyxHQUFHOzs7Ozs7Q0FHTjtTQUNDOzs7Q0FFRDs7RUFDQyxJQUFPLEdBQUcsRUFBRSxXQUFJLGNBQWMsU0FBUyxTQUFTO0dBQy9DLEdBQUc7Ozs7O0NBR0w7U0FDQyxZQUFLLFNBQVM7OztDQUVmO09BQ0MsT0FBTztNQUNILEtBQUssT0FBRSxNQUFNOztFQUVqQixhQUFxQixZQUFLO2lDQUN6QixJQUFHLEtBQUssS0FBSyxXQUFXLEdBQUcsS0FBSztJQUMvQixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTtJQUMvRixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTs7SUFFN0UsSUFBRyxLQUFLLGFBQTFCLE9BQU8sS0FBSzs7Ozs7O0NBR2Y7O0VBQ2EsTUFBTzs7O1FBR2Qsd0ZBQU87c0JBV1Y7O1FBWEc7Ozs7TUFDSCw4QkFBWTs7MENBQ0wsWUFBSSxjQUFNLGdCQUFROzhCQUN0QiwwREFBb0I7OEJBQ3BCO2dDQUNDO2dDQUdBOzs7Ozs7Ozs7O1dBRkEsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7V0FFNUIsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7Ozs7OztLQUVoQyw4QkFBWTsrQkFDQyxZQUFJOzs7Ozs7Ozs7Ozs7OztBQ25PckIseUM7Ozs7Ozs7Ozs7OztXQ0NPOztDQUVOOzs7a0NBRVcsMENBQW1DLG1CQUFZLG9CQUFhOzhCQUM3RCxzQkFBZTtrQ0FDWCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgOTk3MTYzYjZlYjNmMDcyYWEzZjYiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUgXCIuL3NyYy9pbWJhL2luZGV4LmltYmFcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL2ltYmEuaW1iYSIsIiMjI1xuSW1iYSBpcyB0aGUgbmFtZXNwYWNlIGZvciBhbGwgcnVudGltZSByZWxhdGVkIHV0aWxpdGllc1xuQG5hbWVzcGFjZVxuIyMjXG52YXIgSW1iYSA9IHtWRVJTSU9OOiAnMS4zLjAtYmV0YS4xMid9XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0VGltZW91dCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIHRoZSB0aW1lb3V0IHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldFRpbWVvdXQgZGVsYXksICZibG9ja1xuXHRzZXRUaW1lb3V0KCYsZGVsYXkpIGRvXG5cdFx0YmxvY2soKVxuXHRcdEltYmEuY29tbWl0XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0SW50ZXJ2YWwgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciBldmVyeSBpbnRlcnZhbCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRJbnRlcnZhbCBpbnRlcnZhbCwgJmJsb2NrXG5cdHNldEludGVydmFsKGJsb2NrLGludGVydmFsKVxuXG4jIyNcbkNsZWFyIGludGVydmFsIHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFySW50ZXJ2YWwgaWRcblx0Y2xlYXJJbnRlcnZhbChpZClcblxuIyMjXG5DbGVhciB0aW1lb3V0IHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFyVGltZW91dCBpZFxuXHRjbGVhclRpbWVvdXQoaWQpXG5cblxuZGVmIEltYmEuc3ViY2xhc3Mgb2JqLCBzdXBcblx0Zm9yIGssdiBvZiBzdXBcblx0XHRvYmpba10gPSB2IGlmIHN1cC5oYXNPd25Qcm9wZXJ0eShrKVxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTppbml0aWFsaXplID0gb2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRyZXR1cm4gb2JqXG5cbiMjI1xuTGlnaHR3ZWlnaHQgbWV0aG9kIGZvciBtYWtpbmcgYW4gb2JqZWN0IGl0ZXJhYmxlIGluIGltYmFzIGZvci9pbiBsb29wcy5cbklmIHRoZSBjb21waWxlciBjYW5ub3Qgc2F5IGZvciBjZXJ0YWluIHRoYXQgYSB0YXJnZXQgaW4gYSBmb3IgbG9vcCBpcyBhblxuYXJyYXksIGl0IHdpbGwgY2FjaGUgdGhlIGl0ZXJhYmxlIHZlcnNpb24gYmVmb3JlIGxvb3BpbmcuXG5cbmBgYGltYmFcbiMgdGhpcyBpcyB0aGUgd2hvbGUgbWV0aG9kXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuY2xhc3MgQ3VzdG9tSXRlcmFibGVcblx0ZGVmIHRvQXJyYXlcblx0XHRbMSwyLDNdXG5cbiMgd2lsbCByZXR1cm4gWzIsNCw2XVxuZm9yIHggaW4gQ3VzdG9tSXRlcmFibGUubmV3XG5cdHggKiAyXG5cbmBgYFxuIyMjXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuIyMjXG5Db2VyY2VzIGEgdmFsdWUgaW50byBhIHByb21pc2UuIElmIHZhbHVlIGlzIGFycmF5IGl0IHdpbGxcbmNhbGwgYFByb21pc2UuYWxsKHZhbHVlKWAsIG9yIGlmIGl0IGlzIG5vdCBhIHByb21pc2UgaXQgd2lsbFxud3JhcCB0aGUgdmFsdWUgaW4gYFByb21pc2UucmVzb2x2ZSh2YWx1ZSlgLiBVc2VkIGZvciBleHBlcmltZW50YWxcbmF3YWl0IHN5bnRheC5cbkByZXR1cm4ge1Byb21pc2V9XG4jIyNcbmRlZiBJbWJhLmF3YWl0IHZhbHVlXG5cdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdGNvbnNvbGUud2FybihcImF3YWl0IChBcnJheSkgaXMgZGVwcmVjYXRlZCAtIHVzZSBhd2FpdCBQcm9taXNlLmFsbChBcnJheSlcIilcblx0XHRQcm9taXNlLmFsbCh2YWx1ZSlcblx0ZWxpZiB2YWx1ZSBhbmQgdmFsdWU6dGhlblxuXHRcdHZhbHVlXG5cdGVsc2Vcblx0XHRQcm9taXNlLnJlc29sdmUodmFsdWUpXG5cbnZhciBkYXNoUmVnZXggPSAvLS4vZ1xudmFyIHNldHRlckNhY2hlID0ge31cblxuZGVmIEltYmEudG9DYW1lbENhc2Ugc3RyXG5cdGlmIHN0ci5pbmRleE9mKCctJykgPj0gMFxuXHRcdHN0ci5yZXBsYWNlKGRhc2hSZWdleCkgZG8gfG18IG0uY2hhckF0KDEpLnRvVXBwZXJDYXNlXG5cdGVsc2Vcblx0XHRzdHJcblx0XHRcbmRlZiBJbWJhLnRvU2V0dGVyIHN0clxuXHRzZXR0ZXJDYWNoZVtzdHJdIHx8PSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIHN0cilcblxuZGVmIEltYmEuaW5kZXhPZiBhLGJcblx0cmV0dXJuIChiICYmIGI6aW5kZXhPZikgPyBiLmluZGV4T2YoYSkgOiBbXTppbmRleE9mLmNhbGwoYSxiKVxuXG5kZWYgSW1iYS5sZW4gYVxuXHRyZXR1cm4gYSAmJiAoYTpsZW4gaXNhIEZ1bmN0aW9uID8gYTpsZW4uY2FsbChhKSA6IGE6bGVuZ3RoKSBvciAwXG5cbmRlZiBJbWJhLnByb3Agc2NvcGUsIG5hbWUsIG9wdHNcblx0aWYgc2NvcGU6ZGVmaW5lUHJvcGVydHlcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lUHJvcGVydHkobmFtZSxvcHRzKVxuXHRyZXR1cm5cblxuZGVmIEltYmEuYXR0ciBzY29wZSwgbmFtZSwgb3B0cyA9IHt9XG5cdGlmIHNjb3BlOmRlZmluZUF0dHJpYnV0ZVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVBdHRyaWJ1dGUobmFtZSxvcHRzKVxuXG5cdGxldCBnZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZShuYW1lKVxuXHRsZXQgc2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgbmFtZSlcblx0bGV0IHByb3RvID0gc2NvcGU6cHJvdG90eXBlXG5cblx0aWYgb3B0czpkb21cblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZG9tW25hbWVdXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHRpZiB2YWx1ZSAhPSB0aGlzW25hbWVdKClcblx0XHRcdFx0dGhpcy5kb21bbmFtZV0gPSB2YWx1ZVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0ZWxzZVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSlcblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRyZXR1cm5cblxuZGVmIEltYmEucHJvcERpZFNldCBvYmplY3QsIHByb3BlcnR5LCB2YWwsIHByZXZcblx0bGV0IGZuID0gcHJvcGVydHk6d2F0Y2hcblx0aWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0Zm4uY2FsbChvYmplY3QsdmFsLHByZXYscHJvcGVydHkpXG5cdGVsaWYgZm4gaXNhIFN0cmluZyBhbmQgb2JqZWN0W2ZuXVxuXHRcdG9iamVjdFtmbl0odmFsLHByZXYscHJvcGVydHkpXG5cdHJldHVyblxuXG5cbiMgQmFzaWMgZXZlbnRzXG5kZWYgZW1pdF9fIGV2ZW50LCBhcmdzLCBub2RlXG5cdCMgdmFyIG5vZGUgPSBjYnNbZXZlbnRdXG5cdHZhciBwcmV2LCBjYiwgcmV0XG5cblx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0aWYgY2IgPSBub2RlOmxpc3RlbmVyXG5cdFx0XHRpZiBub2RlOnBhdGggYW5kIGNiW25vZGU6cGF0aF1cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiW25vZGU6cGF0aF0uYXBwbHkoY2IsYXJncykgOiBjYltub2RlOnBhdGhdKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBjaGVjayBpZiBpdCBpcyBhIG1ldGhvZD9cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiLmFwcGx5KG5vZGUsIGFyZ3MpIDogY2IuY2FsbChub2RlKVxuXG5cdFx0aWYgbm9kZTp0aW1lcyAmJiAtLW5vZGU6dGltZXMgPD0gMFxuXHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRyZXR1cm5cblxuIyBtZXRob2QgZm9yIHJlZ2lzdGVyaW5nIGEgbGlzdGVuZXIgb24gb2JqZWN0XG5kZWYgSW1iYS5saXN0ZW4gb2JqLCBldmVudCwgbGlzdGVuZXIsIHBhdGhcblx0dmFyIGNicywgbGlzdCwgdGFpbFxuXHRjYnMgPSBvYmo6X19saXN0ZW5lcnNfXyB8fD0ge31cblx0bGlzdCA9IGNic1tldmVudF0gfHw9IHt9XG5cdHRhaWwgPSBsaXN0OnRhaWwgfHwgKGxpc3Q6dGFpbCA9IChsaXN0Om5leHQgPSB7fSkpXG5cdHRhaWw6bGlzdGVuZXIgPSBsaXN0ZW5lclxuXHR0YWlsOnBhdGggPSBwYXRoXG5cdGxpc3Q6dGFpbCA9IHRhaWw6bmV4dCA9IHt9XG5cdHJldHVybiB0YWlsXG5cbiMgcmVnaXN0ZXIgYSBsaXN0ZW5lciBvbmNlXG5kZWYgSW1iYS5vbmNlIG9iaiwgZXZlbnQsIGxpc3RlbmVyXG5cdHZhciB0YWlsID0gSW1iYS5saXN0ZW4ob2JqLGV2ZW50LGxpc3RlbmVyKVxuXHR0YWlsOnRpbWVzID0gMVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlbW92ZSBhIGxpc3RlbmVyXG5kZWYgSW1iYS51bmxpc3RlbiBvYmosIGV2ZW50LCBjYiwgbWV0aFxuXHR2YXIgbm9kZSwgcHJldlxuXHR2YXIgbWV0YSA9IG9iajpfX2xpc3RlbmVyc19fXG5cdHJldHVybiB1bmxlc3MgbWV0YVxuXG5cdGlmIG5vZGUgPSBtZXRhW2V2ZW50XVxuXHRcdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdFx0aWYgbm9kZSA9PSBjYiB8fCBub2RlOmxpc3RlbmVyID09IGNiXG5cdFx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0XHQjIGNoZWNrIGZvciBjb3JyZWN0IHBhdGggYXMgd2VsbD9cblx0XHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0XHRcdFx0YnJlYWtcblx0cmV0dXJuXG5cbiMgZW1pdCBldmVudFxuZGVmIEltYmEuZW1pdCBvYmosIGV2ZW50LCBwYXJhbXNcblx0aWYgdmFyIGNiID0gb2JqOl9fbGlzdGVuZXJzX19cblx0XHRlbWl0X18oZXZlbnQscGFyYW1zLGNiW2V2ZW50XSkgaWYgY2JbZXZlbnRdXG5cdFx0ZW1pdF9fKGV2ZW50LFtldmVudCxwYXJhbXNdLGNiOmFsbCkgaWYgY2I6YWxsICMgYW5kIGV2ZW50ICE9ICdhbGwnXG5cdHJldHVyblxuXG5kZWYgSW1iYS5vYnNlcnZlUHJvcGVydHkgb2JzZXJ2ZXIsIGtleSwgdHJpZ2dlciwgdGFyZ2V0LCBwcmV2XG5cdGlmIHByZXYgYW5kIHR5cGVvZiBwcmV2ID09ICdvYmplY3QnXG5cdFx0SW1iYS51bmxpc3RlbihwcmV2LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdGlmIHRhcmdldCBhbmQgdHlwZW9mIHRhcmdldCA9PSAnb2JqZWN0J1xuXHRcdEltYmEubGlzdGVuKHRhcmdldCwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRzZWxmXG5cbm1vZHVsZTpleHBvcnRzID0gSW1iYVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW1iYS5pbWJhIiwiZXhwb3J0IHRhZyBQYWdlXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1BhZ2UuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5Qb2ludGVyXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBidXR0b24gPSAtMVxuXHRcdEBldmVudCA9IHt4OiAwLCB5OiAwLCB0eXBlOiAndW5pbml0aWFsaXplZCd9XG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgYnV0dG9uXG5cdFx0QGJ1dHRvblxuXG5cdGRlZiB0b3VjaFxuXHRcdEB0b3VjaFxuXG5cdGRlZiB1cGRhdGUgZVxuXHRcdEBldmVudCA9IGVcblx0XHRAZGlydHkgPSB5ZXNcblx0XHRzZWxmXG5cblx0IyB0aGlzIGlzIGp1c3QgZm9yIHJlZ3VsYXIgbW91c2Ugbm93XG5cdGRlZiBwcm9jZXNzXG5cdFx0dmFyIGUxID0gQGV2ZW50XG5cblx0XHRpZiBAZGlydHlcblx0XHRcdEBwcmV2RXZlbnQgPSBlMVxuXHRcdFx0QGRpcnR5ID0gbm9cblxuXHRcdFx0IyBidXR0b24gc2hvdWxkIG9ubHkgY2hhbmdlIG9uIG1vdXNlZG93biBldGNcblx0XHRcdGlmIGUxOnR5cGUgPT0gJ21vdXNlZG93bidcblx0XHRcdFx0QGJ1dHRvbiA9IGUxOmJ1dHRvblxuXG5cdFx0XHRcdGlmIChAdG91Y2ggYW5kIEBidXR0b24gIT0gMClcblx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHQjIGNhbmNlbCB0aGUgcHJldmlvdXMgdG91Y2hcblx0XHRcdFx0QHRvdWNoLmNhbmNlbCBpZiBAdG91Y2hcblx0XHRcdFx0QHRvdWNoID0gSW1iYS5Ub3VjaC5uZXcoZTEsc2VsZilcblx0XHRcdFx0QHRvdWNoLm1vdXNlZG93bihlMSxlMSlcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZW1vdmUnXG5cdFx0XHRcdEB0b3VjaC5tb3VzZW1vdmUoZTEsZTEpIGlmIEB0b3VjaFxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNldXAnXG5cdFx0XHRcdEBidXR0b24gPSAtMVxuXG5cdFx0XHRcdGlmIEB0b3VjaCBhbmQgQHRvdWNoLmJ1dHRvbiA9PSBlMTpidXR0b25cblx0XHRcdFx0XHRAdG91Y2gubW91c2V1cChlMSxlMSlcblx0XHRcdFx0XHRAdG91Y2ggPSBudWxsXG5cdFx0XHRcdCMgdHJpZ2dlciBwb2ludGVydXBcblx0XHRlbGlmIEB0b3VjaFxuXHRcdFx0QHRvdWNoLmlkbGVcblx0XHRzZWxmXG5cblx0ZGVmIHggZG8gQGV2ZW50Onhcblx0ZGVmIHkgZG8gQGV2ZW50Onlcblx0XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3BvaW50ZXIuaW1iYSIsImV4dGVybiBldmFsXG5cbmV4cG9ydCB0YWcgU25pcHBldFxuXHRwcm9wIHNyY1xuXHRwcm9wIGhlYWRpbmdcblx0cHJvcCBobFxuXHRcblx0ZGVmIHNlbGYucmVwbGFjZSBkb21cblx0XHRsZXQgaW1iYSA9IGRvbTpmaXJzdENoaWxkXG5cdFx0bGV0IGpzID0gaW1iYTpuZXh0U2libGluZ1xuXHRcdGxldCBoaWdobGlnaHRlZCA9IGltYmE6aW5uZXJIVE1MXG5cdFx0bGV0IHJhdyA9IGRvbTp0ZXh0Q29udGVudFxuXHRcdGxldCBkYXRhID1cblx0XHRcdGNvZGU6IHJhd1xuXHRcdFx0aHRtbDogaGlnaGxpZ2h0ZWRcblx0XHRcdGpzOiB7XG5cdFx0XHRcdGNvZGU6IGpzOnRleHRDb250ZW50XG5cdFx0XHRcdGh0bWw6IGpzOmlubmVySFRNTFxuXHRcdFx0fVxuXG5cdFx0bGV0IHNuaXBwZXQgPSA8U25pcHBldFtkYXRhXT5cblx0XHRkb206cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc25pcHBldC5kb20sZG9tKVxuXHRcdHJldHVybiBzbmlwcGV0XG5cdFx0XG5cdGRlZiBzZXR1cFxuXHRcdHJlbmRlclxuXHRcdEBjb2RlLmRvbTppbm5lckhUTUwgPSBkYXRhOmh0bWxcblx0XHRydW5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBydW5cblx0XHR2YXIgb3JpZyA9IEltYmE6bW91bnRcblx0XHR2YXIganMgPSBkYXRhOmpzOmNvZGVcblx0XHRqcyA9IGpzLnJlcGxhY2UoXCJyZXF1aXJlKCdpbWJhJylcIiwnd2luZG93LkltYmEnKVxuXHRcdCMgYWRkIGNvbnNvbGU/XG5cdFx0dHJ5XG5cdFx0XHRJbWJhOm1vdW50ID0gZG8gfGl0ZW18IG9yaWcuY2FsbChJbWJhLGl0ZW0sQHJlc3VsdC5kb20pXG5cdFx0XHRldmFsKGpzKVxuXHRcdFxuXHRcdEltYmE6bW91bnQgPSBvcmlnXG5cdFx0c2VsZlxuXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnNuaXBwZXQ+XG5cdFx0XHQ8Y29kZUBjb2RlPlxuXHRcdFx0PGRpdkByZXN1bHQuc3R5bGVkLWV4YW1wbGU+XG5cdFx0XG5leHBvcnQgdGFnIEV4YW1wbGUgPCBTbmlwcGV0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiBcIkV4YW1wbGVcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TbmlwcGV0LmltYmEiLCJcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnXG5pbXBvcnQgU2l0ZSBmcm9tICcuL3ZpZXdzL1NpdGUnXG5kb2N1bWVudDpib2R5OmlubmVySFRNTCA9ICcnIFxuSW1iYS5tb3VudCA8U2l0ZVtBUFAgPSBBcHAuZGVzZXJpYWxpemUoQVBQQ0FDSEUpXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY2xpZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcbnZhciBhY3RpdmF0ZSA9IG5vXG5pZiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuXHRpZiB3aW5kb3cuSW1iYVxuXHRcdGNvbnNvbGUud2FybiBcIkltYmEgdnt3aW5kb3cuSW1iYS5WRVJTSU9OfSBpcyBhbHJlYWR5IGxvYWRlZC5cIlxuXHRcdEltYmEgPSB3aW5kb3cuSW1iYVxuXHRlbHNlXG5cdFx0d2luZG93LkltYmEgPSBJbWJhXG5cdFx0YWN0aXZhdGUgPSB5ZXNcblx0XHRpZiB3aW5kb3c6ZGVmaW5lIGFuZCB3aW5kb3c6ZGVmaW5lOmFtZFxuXHRcdFx0d2luZG93LmRlZmluZShcImltYmFcIixbXSkgZG8gcmV0dXJuIEltYmFcblxubW9kdWxlLmV4cG9ydHMgPSBJbWJhXG5cbnVubGVzcyAkd2Vid29ya2VyJFxuXHRyZXF1aXJlICcuL3NjaGVkdWxlcidcblx0cmVxdWlyZSAnLi9kb20vaW5kZXgnXG5cbmlmICR3ZWIkIGFuZCBhY3RpdmF0ZVxuXHRJbWJhLkV2ZW50TWFuYWdlci5hY3RpdmF0ZVxuXHRcbmlmICRub2RlJFxuXHR1bmxlc3MgJHdlYnBhY2skXG5cdFx0cmVxdWlyZSAnLi4vLi4vcmVnaXN0ZXIuanMnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG5cbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIyB2ZXJ5IHNpbXBsZSByYWYgcG9seWZpbGxcbnZhciBjYW5jZWxBbmltYXRpb25GcmFtZVxuXG5pZiAkbm9kZSRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBkbyB8aWR8IGNsZWFyVGltZW91dChpZClcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5pZiAkd2ViJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpjYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6bW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6cmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzptb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmNsYXNzIFRpY2tlclxuXG5cdHByb3Agc3RhZ2Vcblx0cHJvcCBxdWV1ZVxuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAtMVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXxcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdFx0dGljayhlKVxuXHRcdHNlbGZcblxuXHRkZWYgYWRkIGl0ZW0sIGZvcmNlXG5cdFx0aWYgZm9yY2Ugb3IgQHF1ZXVlLmluZGV4T2YoaXRlbSkgPT0gLTFcblx0XHRcdEBxdWV1ZS5wdXNoKGl0ZW0pXG5cblx0XHRzY2hlZHVsZSB1bmxlc3MgQHNjaGVkdWxlZFxuXG5cdGRlZiB0aWNrIHRpbWVzdGFtcFxuXHRcdHZhciBpdGVtcyA9IEBxdWV1ZVxuXHRcdEB0cyA9IHRpbWVzdGFtcCB1bmxlc3MgQHRzXG5cdFx0QGR0ID0gdGltZXN0YW1wIC0gQHRzXG5cdFx0QHRzID0gdGltZXN0YW1wXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAxXG5cdFx0YmVmb3JlXG5cdFx0aWYgaXRlbXM6bGVuZ3RoXG5cdFx0XHRmb3IgaXRlbSxpIGluIGl0ZW1zXG5cdFx0XHRcdGlmIGl0ZW0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0aXRlbShAZHQsc2VsZilcblx0XHRcdFx0ZWxpZiBpdGVtOnRpY2tcblx0XHRcdFx0XHRpdGVtLnRpY2soQGR0LHNlbGYpXG5cdFx0QHN0YWdlID0gMlxuXHRcdGFmdGVyXG5cdFx0QHN0YWdlID0gQHNjaGVkdWxlZCA/IDAgOiAtMVxuXHRcdHNlbGZcblxuXHRkZWYgc2NoZWR1bGVcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0aWYgQHN0YWdlID09IC0xXG5cdFx0XHRcdEBzdGFnZSA9IDBcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShAdGlja2VyKVxuXHRcdHNlbGZcblxuXHRkZWYgYmVmb3JlXG5cdFx0c2VsZlxuXG5cdGRlZiBhZnRlclxuXHRcdGlmIEltYmEuVGFnTWFuYWdlclxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cbkltYmEuVElDS0VSID0gVGlja2VyLm5ld1xuSW1iYS5TQ0hFRFVMRVJTID0gW11cblxuZGVmIEltYmEudGlja2VyXG5cdEltYmEuVElDS0VSXG5cbmRlZiBJbWJhLnJlcXVlc3RBbmltYXRpb25GcmFtZSBjYWxsYmFja1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spXG5cbmRlZiBJbWJhLmNhbmNlbEFuaW1hdGlvbkZyYW1lIGlkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKVxuXG4jIHNob3VsZCBhZGQgYW4gSW1iYS5ydW4gLyBzZXRJbW1lZGlhdGUgdGhhdFxuIyBwdXNoZXMgbGlzdGVuZXIgb250byB0aGUgdGljay1xdWV1ZSB3aXRoIHRpbWVzIC0gb25jZVxuXG52YXIgY29tbWl0UXVldWUgPSAwXG5cbmRlZiBJbWJhLmNvbW1pdCBwYXJhbXNcblx0Y29tbWl0UXVldWUrK1xuXHQjIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdEltYmEuZW1pdChJbWJhLCdjb21taXQnLHBhcmFtcyAhPSB1bmRlZmluZWQgPyBbcGFyYW1zXSA6IHVuZGVmaW5lZClcblx0aWYgLS1jb21taXRRdWV1ZSA9PSAwXG5cdFx0SW1iYS5UYWdNYW5hZ2VyIGFuZCBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm5cblxuIyMjXG5cbkluc3RhbmNlcyBvZiBJbWJhLlNjaGVkdWxlciBtYW5hZ2VzIHdoZW4gdG8gY2FsbCBgdGljaygpYCBvbiB0aGVpciB0YXJnZXQsXG5hdCBhIHNwZWNpZmllZCBmcmFtZXJhdGUgb3Igd2hlbiBjZXJ0YWluIGV2ZW50cyBvY2N1ci4gUm9vdC1ub2RlcyBpbiB5b3VyXG5hcHBsaWNhdGlvbnMgd2lsbCB1c3VhbGx5IGhhdmUgYSBzY2hlZHVsZXIgdG8gbWFrZSBzdXJlIHRoZXkgcmVyZW5kZXIgd2hlblxuc29tZXRoaW5nIGNoYW5nZXMuIEl0IGlzIGFsc28gcG9zc2libGUgdG8gbWFrZSBpbm5lciBjb21wb25lbnRzIHVzZSB0aGVpclxub3duIHNjaGVkdWxlcnMgdG8gY29udHJvbCB3aGVuIHRoZXkgcmVuZGVyLlxuXG5AaW5hbWUgc2NoZWR1bGVyXG5cbiMjI1xuY2xhc3MgSW1iYS5TY2hlZHVsZXJcblx0XG5cdHZhciBjb3VudGVyID0gMFxuXG5cdGRlZiBzZWxmLmV2ZW50IGVcblx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLGUpXG5cblx0IyMjXG5cdENyZWF0ZSBhIG5ldyBJbWJhLlNjaGVkdWxlciBmb3Igc3BlY2lmaWVkIHRhcmdldFxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIHRhcmdldFxuXHRcdEBpZCA9IGNvdW50ZXIrK1xuXHRcdEB0YXJnZXQgPSB0YXJnZXRcblx0XHRAbWFya2VkID0gbm9cblx0XHRAYWN0aXZlID0gbm9cblx0XHRAbWFya2VyID0gZG8gbWFya1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXwgdGljayhlKVxuXG5cdFx0QGR0ID0gMFxuXHRcdEBmcmFtZSA9IHt9XG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpbWVzdGFtcCA9IDBcblx0XHRAdGlja3MgPSAwXG5cdFx0QGZsdXNoZXMgPSAwXG5cblx0XHRzZWxmOm9uZXZlbnQgPSBzZWxmOm9uZXZlbnQuYmluZChzZWxmKVxuXHRcdHNlbGZcblxuXHRwcm9wIHJhZiB3YXRjaDogeWVzXG5cdHByb3AgaW50ZXJ2YWwgd2F0Y2g6IHllc1xuXHRwcm9wIGV2ZW50cyB3YXRjaDogeWVzXG5cdHByb3AgbWFya2VkXG5cblx0ZGVmIHJhZkRpZFNldCBib29sXG5cdFx0cmVxdWVzdFRpY2sgaWYgYm9vbCBhbmQgQGFjdGl2ZVxuXHRcdHNlbGZcblxuXHRkZWYgaW50ZXJ2YWxEaWRTZXQgdGltZVxuXHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0aWYgdGltZSBhbmQgQGFjdGl2ZVxuXHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSx0aW1lKVxuXHRcdHNlbGZcblxuXHRkZWYgZXZlbnRzRGlkU2V0IG5ldywgcHJldlxuXHRcdGlmIEBhY3RpdmUgYW5kIG5ldyBhbmQgIXByZXZcblx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0ZWxpZiAhbmV3IGFuZCBwcmV2XG5cdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVyIGlzIGFjdGl2ZSBvciBub3Rcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBhY3RpdmVcblx0XHRAYWN0aXZlXG5cblx0IyMjXG5cdERlbHRhIHRpbWUgYmV0d2VlbiB0aGUgdHdvIGxhc3QgdGlja3Ncblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR0XG5cdFx0QGR0XG5cblx0IyMjXG5cdENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29uZmlndXJlIG9wdGlvbnMgPSB7fVxuXHRcdHJhZiA9IG9wdGlvbnM6cmFmIGlmIG9wdGlvbnM6cmFmICE9IHVuZGVmaW5lZFxuXHRcdGludGVydmFsID0gb3B0aW9uczppbnRlcnZhbCBpZiBvcHRpb25zOmludGVydmFsICE9IHVuZGVmaW5lZFxuXHRcdGV2ZW50cyA9IG9wdGlvbnM6ZXZlbnRzIGlmIG9wdGlvbnM6ZXZlbnRzICE9IHVuZGVmaW5lZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0TWFyayB0aGUgc2NoZWR1bGVyIGFzIGRpcnR5LiBUaGlzIHdpbGwgbWFrZSBzdXJlIHRoYXRcblx0dGhlIHNjaGVkdWxlciBjYWxscyBgdGFyZ2V0LnRpY2tgIG9uIHRoZSBuZXh0IGZyYW1lXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbWFya1xuXHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc3RhbnRseSB0cmlnZ2VyIHRhcmdldC50aWNrIGFuZCBtYXJrIHNjaGVkdWxlciBhcyBjbGVhbiAobm90IGRpcnR5L21hcmtlZCkuXG5cdFRoaXMgaXMgY2FsbGVkIGltcGxpY2l0bHkgZnJvbSB0aWNrLCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuXHRyZWFsbHkgd2FudCB0byBmb3JjZSBhIHRpY2sgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgbmV4dCBmcmFtZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbHVzaFxuXHRcdEBmbHVzaGVzKytcblx0XHRAdGFyZ2V0LnRpY2soc2VsZilcblx0XHRAbWFya2VkID0gbm9cblx0XHRzZWxmXG5cblx0IyMjXG5cdEBmaXhtZSB0aGlzIGV4cGVjdHMgcmFmIHRvIHJ1biBhdCA2MCBmcHMgXG5cblx0Q2FsbGVkIGF1dG9tYXRpY2FsbHkgb24gZXZlcnkgZnJhbWUgd2hpbGUgdGhlIHNjaGVkdWxlciBpcyBhY3RpdmUuXG5cdEl0IHdpbGwgb25seSBjYWxsIGB0YXJnZXQudGlja2AgaWYgdGhlIHNjaGVkdWxlciBpcyBtYXJrZWQgZGlydHksXG5cdG9yIHdoZW4gYWNjb3JkaW5nIHRvIEBmcHMgc2V0dGluZy5cblxuXHRJZiB5b3UgaGF2ZSBzZXQgdXAgYSBzY2hlZHVsZXIgd2l0aCBhbiBmcHMgb2YgMSwgdGljayB3aWxsIHN0aWxsIGJlXG5cdGNhbGxlZCBldmVyeSBmcmFtZSwgYnV0IGB0YXJnZXQudGlja2Agd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGV2ZXJ5XG5cdHNlY29uZCwgYW5kIGl0IHdpbGwgKm1ha2Ugc3VyZSogZWFjaCBgdGFyZ2V0LnRpY2tgIGhhcHBlbnMgaW4gc2VwYXJhdGVcblx0c2Vjb25kcyBhY2NvcmRpbmcgdG8gRGF0ZS4gU28gaWYgeW91IGhhdmUgYSBub2RlIHRoYXQgcmVuZGVycyBhIGNsb2NrXG5cdGJhc2VkIG9uIERhdGUubm93IChvciBzb21ldGhpbmcgc2ltaWxhciksIHlvdSBjYW4gc2NoZWR1bGUgaXQgd2l0aCAxZnBzLFxuXHRuZXZlciBuZWVkaW5nIHRvIHdvcnJ5IGFib3V0IHR3byB0aWNrcyBoYXBwZW5pbmcgd2l0aGluIHRoZSBzYW1lIHNlY29uZC5cblx0VGhlIHNhbWUgZ29lcyBmb3IgNGZwcywgMTBmcHMgZXRjLlxuXG5cdEBwcm90ZWN0ZWRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0aWNrIGRlbHRhLCB0aWNrZXJcblx0XHRAdGlja3MrK1xuXHRcdEBkdCA9IGRlbHRhXG5cblx0XHRpZiB0aWNrZXJcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXG5cdFx0Zmx1c2hcblxuXHRcdGlmIEByYWYgYW5kIEBhY3RpdmVcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdGRlZiByZXF1ZXN0VGlja1xuXHRcdHVubGVzcyBAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRJbWJhLlRJQ0tFUi5hZGQoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN0YXJ0IHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgbm90IGFscmVhZHkgYWN0aXZlLlxuXHQqKldoaWxlIGFjdGl2ZSoqLCB0aGUgc2NoZWR1bGVyIHdpbGwgb3ZlcnJpZGUgYHRhcmdldC5jb21taXRgXG5cdHRvIGRvIG5vdGhpbmcuIEJ5IGRlZmF1bHQgSW1iYS50YWcjY29tbWl0IGNhbGxzIHJlbmRlciwgc29cblx0dGhhdCByZW5kZXJpbmcgaXMgY2FzY2FkZWQgdGhyb3VnaCB0byBjaGlsZHJlbiB3aGVuIHJlbmRlcmluZ1xuXHRhIG5vZGUuIFdoZW4gYSBzY2hlZHVsZXIgaXMgYWN0aXZlIChmb3IgYSBub2RlKSwgSW1iYSBkaXNhYmxlc1xuXHR0aGlzIGF1dG9tYXRpYyByZW5kZXJpbmcuXG5cdCMjI1xuXHRkZWYgYWN0aXZhdGUgaW1tZWRpYXRlID0geWVzXG5cdFx0dW5sZXNzIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSB5ZXNcblx0XHRcdEBjb21taXQgPSBAdGFyZ2V0OmNvbW1pdFxuXHRcdFx0QHRhcmdldDpjb21taXQgPSBkbyB0aGlzXG5cdFx0XHRAdGFyZ2V0Py5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRcdEltYmEuU0NIRURVTEVSUy5wdXNoKHNlbGYpXG5cdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRcdFx0XG5cdFx0XHRpZiBAaW50ZXJ2YWwgYW5kICFAaW50ZXJ2YWxJZFxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLEBpbnRlcnZhbClcblxuXHRcdFx0aWYgaW1tZWRpYXRlXG5cdFx0XHRcdHRpY2soMClcblx0XHRcdGVsaWYgQHJhZlxuXHRcdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFN0b3AgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBhY3RpdmUuXG5cdCMjI1xuXHRkZWYgZGVhY3RpdmF0ZVxuXHRcdGlmIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSBub1xuXHRcdFx0QHRhcmdldDpjb21taXQgPSBAY29tbWl0XG5cdFx0XHRsZXQgaWR4ID0gSW1iYS5TQ0hFRFVMRVJTLmluZGV4T2Yoc2VsZilcblx0XHRcdGlmIGlkeCA+PSAwXG5cdFx0XHRcdEltYmEuU0NIRURVTEVSUy5zcGxpY2UoaWR4LDEpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0XHRcdGlmIEBpbnRlcnZhbElkXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdFx0XG5cdFx0XHRAdGFyZ2V0Py51bmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHRyYWNrXG5cdFx0QG1hcmtlclxuXHRcdFxuXHRkZWYgb25pbnRlcnZhbFxuXHRcdHRpY2tcblx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuXHRkZWYgb25ldmVudCBldmVudFxuXHRcdHJldHVybiBzZWxmIGlmICFAZXZlbnRzIG9yIEBtYXJrZWRcblxuXHRcdGlmIEBldmVudHMgaXNhIEZ1bmN0aW9uXG5cdFx0XHRtYXJrIGlmIEBldmVudHMoZXZlbnQsc2VsZilcblx0XHRlbGlmIEBldmVudHMgaXNhIEFycmF5XG5cdFx0XHRpZiBAZXZlbnRzLmluZGV4T2YoKGV2ZW50IGFuZCBldmVudDp0eXBlKSBvciBldmVudCkgPj0gMFxuXHRcdFx0XHRtYXJrXG5cdFx0ZWxzZVxuXHRcdFx0bWFya1xuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL3NjaGVkdWxlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5yZXF1aXJlICcuL21hbmFnZXInXG5cbkltYmEuVGFnTWFuYWdlciA9IEltYmEuVGFnTWFuYWdlckNsYXNzLm5ld1xuXG5yZXF1aXJlICcuL3RhZydcbnJlcXVpcmUgJy4vaHRtbCdcbnJlcXVpcmUgJy4vcG9pbnRlcidcbnJlcXVpcmUgJy4vdG91Y2gnXG5yZXF1aXJlICcuL2V2ZW50J1xucmVxdWlyZSAnLi9ldmVudC1tYW5hZ2VyJ1xuXG5pZiAkd2ViJFxuXHRyZXF1aXJlICcuL3JlY29uY2lsZXInXG5cbmlmICRub2RlJFxuXHRyZXF1aXJlICcuL3NlcnZlcidcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5UYWdNYW5hZ2VyQ2xhc3Ncblx0ZGVmIGluaXRpYWxpemVcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRAbW91bnRlZCA9IFtdXG5cdFx0QGhhc01vdW50YWJsZXMgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgbW91bnRlZFxuXHRcdEBtb3VudGVkXG5cblx0ZGVmIGluc2VydCBub2RlLCBwYXJlbnRcblx0XHRAaW5zZXJ0cysrXG5cblx0ZGVmIHJlbW92ZSBub2RlLCBwYXJlbnRcblx0XHRAcmVtb3ZlcysrXG5cblx0ZGVmIGNoYW5nZXNcblx0XHRAaW5zZXJ0cyArIEByZW1vdmVzXG5cblx0ZGVmIG1vdW50IG5vZGVcblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0QGhhc01vdW50YWJsZXMgPSB5ZXNcblxuXHRkZWYgcmVmcmVzaCBmb3JjZSA9IG5vXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdHJldHVybiBpZiAhZm9yY2UgYW5kIGNoYW5nZXMgPT0gMFxuXHRcdCMgY29uc29sZS50aW1lKCdyZXNvbHZlTW91bnRzJylcblx0XHRpZiAoQGluc2VydHMgYW5kIEBoYXNNb3VudGFibGVzKSBvciBmb3JjZVxuXHRcdFx0dHJ5TW91bnRcblxuXHRcdGlmIChAcmVtb3ZlcyBvciBmb3JjZSkgYW5kIEBtb3VudGVkOmxlbmd0aFxuXHRcdFx0dHJ5VW5tb3VudFxuXHRcdCMgY29uc29sZS50aW1lRW5kKCdyZXNvbHZlTW91bnRzJylcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRzZWxmXG5cblx0ZGVmIHVubW91bnQgbm9kZVxuXHRcdHNlbGZcblxuXHRkZWYgdHJ5TW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0dmFyIGl0ZW1zID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuX19tb3VudCcpXG5cdFx0IyB3aGF0IGlmIHdlIGVuZCB1cCBjcmVhdGluZyBhZGRpdGlvbmFsIG1vdW50YWJsZXMgYnkgbW91bnRpbmc/XG5cdFx0Zm9yIGVsIGluIGl0ZW1zXG5cdFx0XHRpZiBlbCBhbmQgZWwuQHRhZ1xuXHRcdFx0XHRpZiBAbW91bnRlZC5pbmRleE9mKGVsLkB0YWcpID09IC0xXG5cdFx0XHRcdFx0bW91bnROb2RlKGVsLkB0YWcpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgbW91bnROb2RlIG5vZGVcblx0XHRAbW91bnRlZC5wdXNoKG5vZGUpXG5cdFx0bm9kZS5GTEFHUyB8PSBJbWJhLlRBR19NT1VOVEVEXG5cdFx0bm9kZS5tb3VudCBpZiBub2RlOm1vdW50XG5cdFx0cmV0dXJuXG5cblx0ZGVmIHRyeVVubW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0Zm9yIGl0ZW0sIGkgaW4gQG1vdW50ZWRcblx0XHRcdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQuY29udGFpbnMoaXRlbS5AZG9tKVxuXHRcdFx0XHRpdGVtLkZMQUdTID0gaXRlbS5GTEFHUyAmIH5JbWJhLlRBR19NT1VOVEVEXG5cdFx0XHRcdGlmIGl0ZW06dW5tb3VudCBhbmQgaXRlbS5AZG9tXG5cdFx0XHRcdFx0aXRlbS51bm1vdW50XG5cdFx0XHRcdGVsaWYgaXRlbS5Ac2NoZWR1bGVyXG5cdFx0XHRcdFx0IyBNQVlCRSBGSVggVEhJUz9cblx0XHRcdFx0XHRpdGVtLnVuc2NoZWR1bGVcblx0XHRcdFx0QG1vdW50ZWRbaV0gPSBudWxsXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcblx0XHRpZiBjb3VudFxuXHRcdFx0QG1vdW50ZWQgPSBAbW91bnRlZC5maWx0ZXIgZG8gfGl0ZW18IGl0ZW1cblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuSW1iYS5DU1NLZXlNYXAgPSB7fVxuXG5JbWJhLlRBR19CVUlMVCA9IDFcbkltYmEuVEFHX1NFVFVQID0gMlxuSW1iYS5UQUdfTU9VTlRJTkcgPSA0XG5JbWJhLlRBR19NT1VOVEVEID0gOFxuSW1iYS5UQUdfU0NIRURVTEVEID0gMTZcbkltYmEuVEFHX0FXQUtFTkVEID0gMzJcblxuIyMjXG5HZXQgdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiMjI1xuZGVmIEltYmEuZG9jdW1lbnRcblx0aWYgJHdlYiRcblx0XHR3aW5kb3c6ZG9jdW1lbnRcblx0ZWxzZVxuXHRcdEBkb2N1bWVudCB8fD0gSW1iYVNlcnZlckRvY3VtZW50Lm5ld1xuXG4jIyNcbkdldCB0aGUgYm9keSBlbGVtZW50IHdyYXBwZWQgaW4gYW4gSW1iYS5UYWdcbiMjI1xuZGVmIEltYmEucm9vdFxuXHR0YWcoSW1iYS5kb2N1bWVudDpib2R5KVxuXG5kZWYgSW1iYS5zdGF0aWMgaXRlbXMsIHR5cCwgbnJcblx0aXRlbXMuQHR5cGUgPSB0eXBcblx0aXRlbXM6c3RhdGljID0gbnJcblx0cmV0dXJuIGl0ZW1zXG5cbiMjI1xuXG4jIyNcbmRlZiBJbWJhLm1vdW50IG5vZGUsIGludG9cblx0aW50byB8fD0gSW1iYS5kb2N1bWVudDpib2R5XG5cdGludG8uYXBwZW5kQ2hpbGQobm9kZS5kb20pXG5cdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZSxpbnRvKVxuXHRub2RlLnNjaGVkdWxlci5jb25maWd1cmUoZXZlbnRzOiB5ZXMpLmFjdGl2YXRlKG5vKVxuXHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm4gbm9kZVxuXG5cbmRlZiBJbWJhLmNyZWF0ZVRleHROb2RlIG5vZGVcblx0aWYgbm9kZSBhbmQgbm9kZTpub2RlVHlwZSA9PSAzXG5cdFx0cmV0dXJuIG5vZGVcblx0cmV0dXJuIEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuIyMjXG5UaGlzIGlzIHRoZSBiYXNlY2xhc3MgdGhhdCBhbGwgdGFncyBpbiBpbWJhIGluaGVyaXQgZnJvbS5cbkBpbmFtZSBub2RlXG4jIyNcbmNsYXNzIEltYmEuVGFnXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAbm9kZVR5cGUgb3IgJ2RpdicpXG5cdFx0aWYgQGNsYXNzZXNcblx0XHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdFx0ZG9tOmNsYXNzTmFtZSA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0dmFyIHByb3RvID0gKEBwcm90b0RvbSB8fD0gYnVpbGROb2RlKVxuXHRcdHByb3RvLmNsb25lTm9kZShmYWxzZSlcblxuXHRkZWYgc2VsZi5idWlsZCBjdHhcblx0XHRzZWxmLm5ldyhzZWxmLmNyZWF0ZU5vZGUsY3R4KVxuXG5cdGRlZiBzZWxmLmRvbVxuXHRcdEBwcm90b0RvbSB8fD0gYnVpbGROb2RlXG5cblx0IyMjXG5cdENhbGxlZCB3aGVuIGEgdGFnIHR5cGUgaXMgYmVpbmcgc3ViY2xhc3NlZC5cblx0IyMjXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5zbGljZVxuXG5cdFx0XHRpZiBjaGlsZC5AZmxhZ05hbWVcblx0XHRcdFx0Y2hpbGQuQGNsYXNzZXMucHVzaChjaGlsZC5AZmxhZ05hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBmbGFnTmFtZSA9IG51bGxcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHQjIyNcblx0SW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBhZnRlciBhIHRhZyBjbGFzcyBoYXNcblx0YmVlbiBkZWNsYXJlZCBvciBleHRlbmRlZC5cblx0XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgb3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHR2YXIgYmFzZSA9IEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdHZhciBoYXNTZXR1cCAgPSBzZWxmOnNldHVwICAhPSBiYXNlOnNldHVwXG5cdFx0dmFyIGhhc0NvbW1pdCA9IHNlbGY6Y29tbWl0ICE9IGJhc2U6Y29tbWl0XG5cdFx0dmFyIGhhc1JlbmRlciA9IHNlbGY6cmVuZGVyICE9IGJhc2U6cmVuZGVyXG5cdFx0dmFyIGhhc01vdW50ICA9IHNlbGY6bW91bnRcblxuXHRcdHZhciBjdG9yID0gc2VsZjpjb25zdHJ1Y3RvclxuXG5cdFx0aWYgaGFzQ29tbWl0IG9yIGhhc1JlbmRlciBvciBoYXNNb3VudCBvciBoYXNTZXR1cFxuXG5cdFx0XHRzZWxmOmVuZCA9IGRvXG5cdFx0XHRcdGlmIHRoaXM6bW91bnQgYW5kICEodGhpcy5GTEFHUyAmIEltYmEuVEFHX01PVU5URUQpXG5cdFx0XHRcdFx0IyBqdXN0IGFjdGl2YXRlIFxuXHRcdFx0XHRcdEltYmEuVGFnTWFuYWdlci5tb3VudCh0aGlzKVxuXG5cdFx0XHRcdHVubGVzcyB0aGlzLkZMQUdTICYgSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLkZMQUdTIHw9IEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5zZXR1cFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb21taXRcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdGlmIGhhc01vdW50XG5cdFx0XHRcdGlmIGN0b3IuQGNsYXNzZXMgYW5kIGN0b3IuQGNsYXNzZXMuaW5kZXhPZignX19tb3VudCcpICA9PSAtMVxuXHRcdFx0XHRcdGN0b3IuQGNsYXNzZXMucHVzaCgnX19tb3VudCcpXG5cblx0XHRcdFx0aWYgY3Rvci5AcHJvdG9Eb21cblx0XHRcdFx0XHRjdG9yLkBwcm90b0RvbTpjbGFzc0xpc3QuYWRkKCdfX21vdW50JylcblxuXHRcdFx0Zm9yIGl0ZW0gaW4gWzptb3VzZW1vdmUsOm1vdXNlZW50ZXIsOm1vdXNlbGVhdmUsOm1vdXNlb3Zlciw6bW91c2VvdXQsOnNlbGVjdHN0YXJ0XVxuXHRcdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihpdGVtKSBpZiB0aGlzW1wib257aXRlbX1cIl1cblx0XHRzZWxmXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBkb20sY3R4XG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRzZWxmOiQgPSBUYWdDYWNoZS5idWlsZChzZWxmKVxuXHRcdHNlbGY6JHVwID0gQG93bmVyXyA9IGN0eFxuXHRcdEB0cmVlXyA9IG51bGxcblx0XHRzZWxmLkZMQUdTID0gMFxuXHRcdGJ1aWxkXG5cdFx0c2VsZlxuXG5cdGF0dHIgbmFtZSBpbmxpbmU6IG5vXG5cdGF0dHIgcm9sZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGFiaW5kZXggaW5saW5lOiBub1xuXHRhdHRyIHRpdGxlXG5cblx0ZGVmIGRvbVxuXHRcdEBkb21cblx0XHRcblx0ZGVmIHNldERvbSBkb21cblx0XHRkb20uQHRhZyA9IHNlbGZcblx0XHRAZG9tID0gZG9tXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZcblx0XHRAcmVmXG5cdFx0XG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHQjIyNcblx0U2V0dGluZyByZWZlcmVuY2VzIGZvciB0YWdzIGxpa2Vcblx0YDxkaXZAaGVhZGVyPmAgd2lsbCBjb21waWxlIHRvIGB0YWcoJ2RpdicpLnJlZl8oJ2hlYWRlcicsdGhpcykuZW5kKClgXG5cdEJ5IGRlZmF1bHQgaXQgYWRkcyB0aGUgcmVmZXJlbmNlIGFzIGEgY2xhc3NOYW1lIHRvIHRoZSB0YWcuXG5cblx0QHJldHVybiB7c2VsZn1cblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiByZWZfIHJlZlxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBkYXRhPSBkYXRhXG5cdFx0QGRhdGEgPSBkYXRhXG5cblx0IyMjXG5cdEdldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0IyMjXG5cdGRlZiBkYXRhXG5cdFx0QGRhdGFcblx0XHRcblx0XHRcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdHNldERhdGEoYXJncyA/IHRhcmdldFtwYXRoXS5hcHBseSh0YXJnZXQsYXJncykgOiB0YXJnZXRbcGF0aF0pXG5cblx0IyMjXG5cdFNldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgc2VsZi5odG1sICE9IGh0bWxcblx0XHRcdEBkb206aW5uZXJIVE1MID0gaHRtbFxuXG5cdCMjI1xuXHRHZXQgaW5uZXIgaHRtbCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgaHRtbFxuXHRcdEBkb206aW5uZXJIVE1MXG5cdFxuXHRkZWYgb24kIHNsb3QsaGFuZGxlcixjb250ZXh0XG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aWYgcHJldlxuXHRcdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGVcblx0XHRlbHNlXG5cdFx0XHRoYW5kbGVyOnN0YXRlID0ge2NvbnRleHQ6IGNvbnRleHR9XG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBpZD0gaWRcblx0XHRpZiBpZCAhPSBudWxsXG5cdFx0XHRkb206aWQgPSBpZFxuXG5cdGRlZiBpZFxuXHRcdGRvbTppZFxuXG5cdCMjI1xuXHRBZGRzIGEgbmV3IGF0dHJpYnV0ZSBvciBjaGFuZ2VzIHRoZSB2YWx1ZSBvZiBhbiBleGlzdGluZyBhdHRyaWJ1dGVcblx0b24gdGhlIHNwZWNpZmllZCB0YWcuIElmIHRoZSB2YWx1ZSBpcyBudWxsIG9yIGZhbHNlLCB0aGUgYXR0cmlidXRlXG5cdHdpbGwgYmUgcmVtb3ZlZC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRBdHRyaWJ1dGUgbmFtZSwgdmFsdWVcblx0XHR2YXIgb2xkID0gZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cdFx0aWYgb2xkID09IHZhbHVlXG5cdFx0XHR2YWx1ZVxuXHRcdGVsaWYgdmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2Vcblx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRlbHNlXG5cdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0TmVzdGVkQXR0ciBucywgbmFtZSwgdmFsdWVcblx0XHRpZiBzZWxmW25zKydTZXRBdHRyaWJ1dGUnXVxuXHRcdFx0c2VsZltucysnU2V0QXR0cmlidXRlJ10obmFtZSx2YWx1ZSlcblx0XHRlbHNlXG5cdFx0XHRzZXRBdHRyaWJ1dGVOUyhucywgbmFtZSx2YWx1ZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBzZXRBdHRyaWJ1dGVOUyBucywgbmFtZSwgdmFsdWVcblx0XHR2YXIgb2xkID0gZ2V0QXR0cmlidXRlTlMobnMsbmFtZSlcblxuXHRcdGlmIG9sZCAhPSB2YWx1ZVxuXHRcdFx0aWYgdmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2UgXG5cdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGVOUyhucyxuYW1lLHZhbHVlKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlTlMobnMsbmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyMjXG5cdHJlbW92ZXMgYW4gYXR0cmlidXRlIGZyb20gdGhlIHNwZWNpZmllZCB0YWdcblx0IyMjXG5cdGRlZiByZW1vdmVBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblxuXHQjIyNcblx0cmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gYXR0cmlidXRlIG9uIHRoZSB0YWcuXG5cdElmIHRoZSBnaXZlbiBhdHRyaWJ1dGUgZG9lcyBub3QgZXhpc3QsIHRoZSB2YWx1ZSByZXR1cm5lZFxuXHR3aWxsIGVpdGhlciBiZSBudWxsIG9yIFwiXCIgKHRoZSBlbXB0eSBzdHJpbmcpXG5cdCMjI1xuXHRkZWYgZ2V0QXR0cmlidXRlIG5hbWVcblx0XHRkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblxuXHRkZWYgZ2V0QXR0cmlidXRlTlMgbnMsIG5hbWVcblx0XHRkb20uZ2V0QXR0cmlidXRlTlMobnMsbmFtZSlcblx0XG5cdFxuXHRkZWYgc2V0IGtleSwgdmFsdWUsIG1vZHNcblx0XHRsZXQgc2V0dGVyID0gSW1iYS50b1NldHRlcihrZXkpXG5cdFx0aWYgc2VsZltzZXR0ZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0c2VsZltzZXR0ZXJdKHZhbHVlLG1vZHMpXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbTpzZXRBdHRyaWJ1dGUoa2V5LHZhbHVlKVxuXHRcdHNlbGZcblx0XG5cdFxuXHRkZWYgZ2V0IGtleVxuXHRcdEBkb206Z2V0QXR0cmlidXRlKGtleSlcblxuXHQjIyNcblx0T3ZlcnJpZGUgdGhpcyB0byBwcm92aWRlIHNwZWNpYWwgd3JhcHBpbmcgZXRjLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENvbnRlbnQgY29udGVudCwgdHlwZVxuXHRcdHNldENoaWxkcmVuIGNvbnRlbnQsIHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZS4gdHlwZSBwYXJhbSBpcyBvcHRpb25hbCxcblx0YW5kIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgSW1iYSB3aGVuIGNvbXBpbGluZyB0YWcgdHJlZXMuIFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENoaWxkcmVuIG5vZGVzLCB0eXBlXG5cdFx0IyBvdmVycmlkZGVuIG9uIGNsaWVudCBieSByZWNvbmNpbGVyXG5cdFx0QHRyZWVfID0gbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgdGVtcGxhdGUgdGhhdCB3aWxsIHJlbmRlciB0aGUgY29udGVudCBvZiBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldFRlbXBsYXRlIHRlbXBsYXRlXG5cdFx0dW5sZXNzIEB0ZW1wbGF0ZVxuXHRcdFx0IyBvdmVycmlkZSB0aGUgYmFzaWNcblx0XHRcdGlmIHNlbGY6cmVuZGVyID09IEltYmEuVGFnOnByb3RvdHlwZTpyZW5kZXJcblx0XHRcdFx0c2VsZjpyZW5kZXIgPSBzZWxmOnJlbmRlclRlbXBsYXRlICMgZG8gc2V0Q2hpbGRyZW4ocmVuZGVyVGVtcGxhdGUpXG5cdFx0XHRzZWxmLm9wdGltaXplVGFnU3RydWN0dXJlXG5cblx0XHRzZWxmOnRlbXBsYXRlID0gQHRlbXBsYXRlID0gdGVtcGxhdGVcblx0XHRzZWxmXG5cblx0ZGVmIHRlbXBsYXRlXG5cdFx0bnVsbFxuXG5cdCMjI1xuXHRJZiBubyBjdXN0b20gcmVuZGVyLW1ldGhvZCBpcyBkZWZpbmVkLCBhbmQgdGhlIG5vZGVcblx0aGFzIGEgdGVtcGxhdGUsIHRoaXMgbWV0aG9kIHdpbGwgYmUgdXNlZCB0byByZW5kZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJUZW1wbGF0ZVxuXHRcdHZhciBib2R5ID0gdGVtcGxhdGVcblx0XHRzZXRDaGlsZHJlbihib2R5KSBpZiBib2R5ICE9IHNlbGZcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBjaGlsZCBmcm9tIGN1cnJlbnQgbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW1vdmVDaGlsZCBjaGlsZFxuXHRcdHZhciBwYXIgPSBkb21cblx0XHR2YXIgZWwgPSBjaGlsZC5AZG9tIG9yIGNoaWxkXG5cdFx0aWYgZWwgYW5kIGVsOnBhcmVudE5vZGUgPT0gcGFyXG5cdFx0XHRwYXIucmVtb3ZlQ2hpbGQoZWwpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKGVsLkB0YWcgb3IgZWwsc2VsZilcblx0XHRzZWxmXG5cdFxuXHQjIyNcblx0UmVtb3ZlIGFsbCBjb250ZW50IGluc2lkZSBub2RlXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRpZiBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEBkb20ucmVtb3ZlQ2hpbGQoQGRvbTpmaXJzdENoaWxkKSB3aGlsZSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUobnVsbCxzZWxmKSAjIHNob3VsZCByZWdpc3RlciBlYWNoIGNoaWxkP1xuXHRcdEB0cmVlXyA9IEB0ZXh0XyA9IG51bGxcblx0XHRzZWxmXG5cblx0IyMjXG5cdEFwcGVuZCBhIHNpbmdsZSBpdGVtIChub2RlIG9yIHN0cmluZykgdG8gdGhlIGN1cnJlbnQgbm9kZS5cblx0SWYgc3VwcGxpZWQgaXRlbSBpcyBhIHN0cmluZyBpdCB3aWxsIGF1dG9tYXRpY2FsbHkuIFRoaXMgaXMgdXNlZFxuXHRieSBJbWJhIGludGVybmFsbHksIGJ1dCB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIGJlIHVzZWQgZXhwbGljaXRseS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBhcHBlbmRDaGlsZCBub2RlXG5cdFx0aWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQoSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSlcblx0XHRlbGlmIG5vZGVcblx0XHRcdGRvbS5hcHBlbmRDaGlsZChub2RlLkBkb20gb3Igbm9kZSlcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zZXJ0IGEgbm9kZSBpbnRvIHRoZSBjdXJyZW50IG5vZGUgKHNlbGYpLCBiZWZvcmUgYW5vdGhlci5cblx0VGhlIHJlbGF0aXZlIG5vZGUgbXVzdCBiZSBhIGNoaWxkIG9mIGN1cnJlbnQgbm9kZS4gXG5cdCMjI1xuXHRkZWYgaW5zZXJ0QmVmb3JlIG5vZGUsIHJlbFxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0bm9kZSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdGlmIG5vZGUgYW5kIHJlbFxuXHRcdFx0ZG9tLmluc2VydEJlZm9yZSggKG5vZGUuQGRvbSBvciBub2RlKSwgKHJlbC5AZG9tIG9yIHJlbCkgKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLkB0YWcgb3Igbm9kZSwgc2VsZilcblx0XHRcdCMgRklYTUUgZW5zdXJlIHRoZXNlIGFyZSBub3QgY2FsbGVkIGZvciB0ZXh0IG5vZGVzXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBub2RlIGZyb20gdGhlIGRvbSB0cmVlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgb3JwaGFuaXplXG5cdFx0cGFyLnJlbW92ZUNoaWxkKHNlbGYpIGlmIGxldCBwYXIgPSBwYXJlbnRcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRHZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0QHJldHVybiB7c3RyaW5nfSBpbm5lciB0ZXh0IG9mIG5vZGVcblx0IyMjXG5cdGRlZiB0ZXh0IHZcblx0XHRAZG9tOnRleHRDb250ZW50XG5cblx0IyMjXG5cdFNldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHQjIyNcblx0ZGVmIHRleHQ9IHR4dFxuXHRcdEB0cmVlXyA9IHR4dFxuXHRcdEBkb206dGV4dENvbnRlbnQgPSAodHh0ID09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UpID8gJycgOiB0eHRcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0TWV0aG9kIGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIGRhdGEtYXR0cmlidXRlcy4gV2hlbiBjYWxsZWQgd2l0aCB6ZXJvXG5cdGFyZ3VtZW50cyBpdCB3aWxsIHJldHVybiB0aGUgYWN0dWFsIGRhdGFzZXQgZm9yIHRoZSB0YWcuXG5cblx0XHR2YXIgbm9kZSA9IDxkaXYgZGF0YS1uYW1lPSdoZWxsbyc+XG5cdFx0IyBnZXQgdGhlIHdob2xlIGRhdGFzZXRcblx0XHRub2RlLmRhdGFzZXQgIyB7bmFtZTogJ2hlbGxvJ31cblx0XHQjIGdldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScpICMgJ2hlbGxvJ1xuXHRcdCMgc2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJywnbmV3bmFtZScpICMgc2VsZlxuXG5cblx0IyMjXG5cdGRlZiBkYXRhc2V0IGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGRhdGFzZXQoayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdHNldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIix2YWwpXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYga2V5XG5cdFx0XHRyZXR1cm4gZ2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiKVxuXG5cdFx0dmFyIGRhdGFzZXQgPSBkb206ZGF0YXNldFxuXG5cdFx0dW5sZXNzIGRhdGFzZXRcblx0XHRcdGRhdGFzZXQgPSB7fVxuXHRcdFx0Zm9yIGF0cixpIGluIGRvbTphdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIGF0cjpuYW1lLnN1YnN0cigwLDUpID09ICdkYXRhLSdcblx0XHRcdFx0XHRkYXRhc2V0W0ltYmEudG9DYW1lbENhc2UoYXRyOm5hbWUuc2xpY2UoNSkpXSA9IGF0cjp2YWx1ZVxuXG5cdFx0cmV0dXJuIGRhdGFzZXRcblxuXHQjIyNcblx0RW1wdHkgcGxhY2Vob2xkZXIuIE92ZXJyaWRlIHRvIGltcGxlbWVudCBjdXN0b20gcmVuZGVyIGJlaGF2aW91ci5cblx0V29ya3MgbXVjaCBsaWtlIHRoZSBmYW1pbGlhciByZW5kZXItbWV0aG9kIGluIFJlYWN0LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgd2hpbGUgdGFnIGlzIGluaXRpYWxpemluZy4gTm8gaW5pdGlhbCBwcm9wc1xuXHR3aWxsIGhhdmUgYmVlbiBzZXQgYXQgdGhpcyBwb2ludC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBidWlsZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIG9uY2UsIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQuIEFsbCBpbml0aWFsIHByb3BzXG5cdGFuZCBjaGlsZHJlbiB3aWxsIGhhdmUgYmVlbiBzZXQgYmVmb3JlIHNldHVwIGlzIGNhbGxlZC5cblx0c2V0Q29udGVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXR1cFxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQsIGZvciB0YWdzIHRoYXQgYXJlIHBhcnQgb2Zcblx0YSB0YWcgdHJlZSAodGhhdCBhcmUgcmVuZGVyZWQgc2V2ZXJhbCB0aW1lcykuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29tbWl0XG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXG5cdENhbGxlZCBieSB0aGUgdGFnLXNjaGVkdWxlciAoaWYgdGhpcyB0YWcgaXMgc2NoZWR1bGVkKVxuXHRCeSBkZWZhdWx0IGl0IHdpbGwgY2FsbCB0aGlzLnJlbmRlci4gRG8gbm90IG92ZXJyaWRlIHVubGVzc1xuXHR5b3UgcmVhbGx5IHVuZGVyc3RhbmQgaXQuXG5cblx0IyMjXG5cdGRlZiB0aWNrXG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRcblx0QSB2ZXJ5IGltcG9ydGFudCBtZXRob2QgdGhhdCB5b3Ugd2lsbCBwcmFjdGljYWxseSBuZXZlciBtYW51YWxseS5cblx0VGhlIHRhZyBzeW50YXggb2YgSW1iYSBjb21waWxlcyB0byBhIGNoYWluIG9mIHNldHRlcnMsIHdoaWNoIGFsd2F5c1xuXHRlbmRzIHdpdGggLmVuZC4gYDxhLmxhcmdlPmAgY29tcGlsZXMgdG8gYHRhZygnYScpLmZsYWcoJ2xhcmdlJykuZW5kKClgXG5cdFxuXHRZb3UgYXJlIGhpZ2hseSBhZHZpY2VkIHRvIG5vdCBvdmVycmlkZSBpdHMgYmVoYXZpb3VyLiBUaGUgZmlyc3QgdGltZVxuXHRlbmQgaXMgY2FsbGVkIGl0IHdpbGwgbWFyayB0aGUgdGFnIGFzIGluaXRpYWxpemVkIGFuZCBjYWxsIEltYmEuVGFnI3NldHVwLFxuXHRhbmQgY2FsbCBJbWJhLlRhZyNjb21taXQgZXZlcnkgdGltZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBlbmRcblx0XHRzZWxmXG5cdFx0XG5cdCMgY2FsbGVkIG9uIDxzZWxmPiB0byBjaGVjayBpZiBzZWxmIGlzIGNhbGxlZCBmcm9tIG90aGVyIHBsYWNlc1xuXHRkZWYgJG9wZW4gY29udGV4dFxuXHRcdGlmIGNvbnRleHQgIT0gQGNvbnRleHRfXG5cdFx0XHRAdHJlZV8gPSBudWxsXG5cdFx0XHRAY29udGV4dF8gPSBjb250ZXh0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUaGlzIGlzIGNhbGxlZCBpbnN0ZWFkIG9mIEltYmEuVGFnI2VuZCBmb3IgYDxzZWxmPmAgdGFnIGNoYWlucy5cblx0RGVmYXVsdHMgdG8gbm9vcFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHN5bmNlZFxuXHRcdHNlbGZcblxuXHQjIGNhbGxlZCB3aGVuIHRoZSBub2RlIGlzIGF3YWtlbmVkIGluIHRoZSBkb20gLSBlaXRoZXIgYXV0b21hdGljYWxseVxuXHQjIHVwb24gYXR0YWNobWVudCB0byB0aGUgZG9tLXRyZWUsIG9yIHRoZSBmaXJzdCB0aW1lIGltYmEgbmVlZHMgdGhlXG5cdCMgdGFnIGZvciBhIGRvbW5vZGUgdGhhdCBoYXMgYmVlbiByZW5kZXJlZCBvbiB0aGUgc2VydmVyXG5cdGRlZiBhd2FrZW5cblx0XHRzZWxmXG5cblx0IyMjXG5cdExpc3Qgb2YgZmxhZ3MgZm9yIHRoaXMgbm9kZS4gXG5cdCMjI1xuXHRkZWYgZmxhZ3Ncblx0XHRAZG9tOmNsYXNzTGlzdFxuXG5cdCMjI1xuXHRBZGQgc3BlZmljaWVkIGZsYWcgdG8gY3VycmVudCBub2RlLlxuXHRJZiBhIHNlY29uZCBhcmd1bWVudCBpcyBzdXBwbGllZCwgaXQgd2lsbCBiZSBjb2VyY2VkIGludG8gYSBCb29sZWFuLFxuXHRhbmQgdXNlZCB0byBpbmRpY2F0ZSB3aGV0aGVyIHdlIHNob3VsZCByZW1vdmUgdGhlIGZsYWcgaW5zdGVhZC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbGFnIG5hbWUsIHRvZ2dsZXJcblx0XHQjIGl0IGlzIG1vc3QgbmF0dXJhbCB0byB0cmVhdCBhIHNlY29uZCB1bmRlZmluZWQgYXJndW1lbnQgYXMgYSBuby1zd2l0Y2hcblx0XHQjIHNvIHdlIG5lZWQgdG8gY2hlY2sgdGhlIGFyZ3VtZW50cy1sZW5ndGhcblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdGlmIEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpICE9ICEhdG9nZ2xlclxuXHRcdFx0XHRAZG9tOmNsYXNzTGlzdC50b2dnbGUobmFtZSlcblx0XHRlbHNlXG5cdFx0XHQjIGZpcmVmb3ggd2lsbCB0cmlnZ2VyIGEgY2hhbmdlIGlmIGFkZGluZyBleGlzdGluZyBjbGFzc1xuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKG5hbWUpIHVubGVzcyBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgZmxhZyBmcm9tIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB1bmZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0VG9nZ2xlIHNwZWNpZmllZCBmbGFnIG9uIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0b2dnbGVGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC50b2dnbGUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgY3VycmVudCBub2RlIGhhcyBzcGVjaWZpZWQgZmxhZ1xuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGhhc0ZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cblx0XG5cdGRlZiBmbGFnSWYgZmxhZywgYm9vbFxuXHRcdHZhciBmID0gQGZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZbZmxhZ11cblxuXHRcdGlmIGJvb2wgYW5kICFwcmV2XG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5hZGQoZmxhZylcblx0XHRcdGZbZmxhZ10gPSB5ZXNcblx0XHRlbGlmIHByZXYgYW5kICFib29sXG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUoZmxhZylcblx0XHRcdGZbZmxhZ10gPSBub1xuXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0IyMjXG5cdFNldC91cGRhdGUgYSBuYW1lZCBmbGFnLiBJdCByZW1lbWJlcnMgdGhlIHByZXZpb3VzXG5cdHZhbHVlIG9mIHRoZSBmbGFnLCBhbmQgcmVtb3ZlcyBpdCBiZWZvcmUgc2V0dGluZyB0aGUgbmV3IHZhbHVlLlxuXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywndG9kbycpXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywncHJvamVjdCcpXG5cdFx0IyB0b2RvIGlzIHJlbW92ZWQsIHByb2plY3QgaXMgYWRkZWQuXG5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRGbGFnIG5hbWUsIHZhbHVlXG5cdFx0bGV0IGZsYWdzID0gQG5hbWVkRmxhZ3NfIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZmxhZ3NbbmFtZV1cblx0XHRpZiBwcmV2ICE9IHZhbHVlXG5cdFx0XHR1bmZsYWcocHJldikgaWYgcHJldlxuXHRcdFx0ZmxhZyh2YWx1ZSkgaWYgdmFsdWVcblx0XHRcdGZsYWdzW25hbWVdID0gdmFsdWVcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgc2NoZWR1bGVyIGZvciB0aGlzIG5vZGUuIEEgbmV3IHNjaGVkdWxlciB3aWxsIGJlIGNyZWF0ZWRcblx0aWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cblxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZXJcblx0XHRAc2NoZWR1bGVyID89IEltYmEuU2NoZWR1bGVyLm5ldyhzZWxmKVxuXG5cdCMjI1xuXG5cdFNob3J0aGFuZCB0byBzdGFydCBzY2hlZHVsaW5nIGEgbm9kZS4gVGhlIG1ldGhvZCB3aWxsIGJhc2ljYWxseVxuXHRwcm94eSB0aGUgYXJndW1lbnRzIHRocm91Z2ggdG8gc2NoZWR1bGVyLmNvbmZpZ3VyZSwgYW5kIHRoZW5cblx0YWN0aXZhdGUgdGhlIHNjaGVkdWxlci5cblx0XG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGUgb3B0aW9ucyA9IHtldmVudHM6IHllc31cblx0XHRzY2hlZHVsZXIuY29uZmlndXJlKG9wdGlvbnMpLmFjdGl2YXRlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGRlYWN0aXZhdGluZyBzY2hlZHVsZXIgKGlmIHRhZyBoYXMgb25lKS5cblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiB1bnNjaGVkdWxlXG5cdFx0c2NoZWR1bGVyLmRlYWN0aXZhdGUgaWYgQHNjaGVkdWxlclxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHBhcmVudCBvZiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWd9IFxuXHQjIyNcblx0ZGVmIHBhcmVudFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKGRvbTpwYXJlbnROb2RlKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWdbXX1cblx0IyMjXG5cdGRlZiBjaGlsZHJlbiBzZWxcblx0XHRmb3IgaXRlbSBpbiBAZG9tOmNoaWxkcmVuXG5cdFx0XHRpdGVtLkB0YWcgb3IgSW1iYS5nZXRUYWdGb3JEb20oaXRlbSlcblx0XG5cdGRlZiBxdWVyeVNlbGVjdG9yIHFcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLnF1ZXJ5U2VsZWN0b3IocSkpXG5cblx0ZGVmIHF1ZXJ5U2VsZWN0b3JBbGwgcVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbS5xdWVyeVNlbGVjdG9yQWxsKHEpXG5cdFx0XHRpdGVtcy5wdXNoKCBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKSApXG5cdFx0cmV0dXJuIGl0ZW1zXG5cblx0IyMjXG5cdENoZWNrIGlmIHRoaXMgbm9kZSBtYXRjaGVzIGEgc2VsZWN0b3Jcblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBtYXRjaGVzIHNlbFxuXHRcdGlmIHNlbCBpc2EgRnVuY3Rpb25cblx0XHRcdHJldHVybiBzZWwoc2VsZilcblxuXHRcdHNlbCA9IHNlbC5xdWVyeSBpZiBzZWw6cXVlcnkgaXNhIEZ1bmN0aW9uXG5cdFx0aWYgdmFyIGZuID0gKEBkb206bWF0Y2hlcyBvciBAZG9tOm1hdGNoZXNTZWxlY3RvciBvciBAZG9tOndlYmtpdE1hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1zTWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bW96TWF0Y2hlc1NlbGVjdG9yKVxuXHRcdFx0cmV0dXJuIGZuLmNhbGwoQGRvbSxzZWwpXG5cblx0IyMjXG5cdEdldCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyBzdXBwbGllZCBzZWxlY3RvciAvIGZpbHRlclxuXHR0cmF2ZXJzaW5nIHVwd2FyZHMsIGJ1dCBpbmNsdWRpbmcgdGhlIG5vZGUgaXRzZWxmLlxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBjbG9zZXN0IHNlbFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20uY2xvc2VzdChzZWwpKVxuXG5cdCMjI1xuXHRDaGVjayBpZiBub2RlIGNvbnRhaW5zIG90aGVyIG5vZGVcblx0QHJldHVybiB7Qm9vbGVhbn0gXG5cdCMjI1xuXHRkZWYgY29udGFpbnMgbm9kZVxuXHRcdGRvbS5jb250YWlucyhub2RlLkBkb20gb3Igbm9kZSlcblxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGNvbnNvbGUubG9nIG9uIGVsZW1lbnRzXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbG9nICphcmdzXG5cdFx0YXJncy51bnNoaWZ0KGNvbnNvbGUpXG5cdFx0RnVuY3Rpb246cHJvdG90eXBlOmNhbGwuYXBwbHkoY29uc29sZTpsb2csIGFyZ3MpXG5cdFx0c2VsZlxuXG5cdGRlZiBjc3Mga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0Y3NzKGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIG5hbWUgPSBJbWJhLkNTU0tleU1hcFtrZXldIG9yIGtleVxuXG5cdFx0aWYgdmFsID09IG51bGxcblx0XHRcdGRvbTpzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKVxuXHRcdGVsaWYgdmFsID09IHVuZGVmaW5lZCBhbmQgYXJndW1lbnRzOmxlbmd0aCA9PSAxXG5cdFx0XHRyZXR1cm4gZG9tOnN0eWxlW25hbWVdXG5cdFx0ZWxzZVxuXHRcdFx0aWYgdmFsIGlzYSBOdW1iZXIgYW5kIG5hbWUubWF0Y2goL3dpZHRofGhlaWdodHxsZWZ0fHJpZ2h0fHRvcHxib3R0b20vKVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWwgKyBcInB4XCJcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0U3R5bGUgc3R5bGVcblx0XHRzZXRBdHRyaWJ1dGUoJ3N0eWxlJyxzdHlsZSlcblxuXHRkZWYgc3R5bGVcblx0XHRnZXRBdHRyaWJ1dGUoJ3N0eWxlJylcblxuXHQjIyNcblx0VHJpZ2dlciBhbiBldmVudCBmcm9tIGN1cnJlbnQgbm9kZS4gRGlzcGF0Y2hlZCB0aHJvdWdoIHRoZSBJbWJhIGV2ZW50IG1hbmFnZXIuXG5cdFRvIGRpc3BhdGNoIGFjdHVhbCBkb20gZXZlbnRzLCB1c2UgZG9tLmRpc3BhdGNoRXZlbnQgaW5zdGVhZC5cblxuXHRAcmV0dXJuIHtJbWJhLkV2ZW50fVxuXHQjIyNcblx0ZGVmIHRyaWdnZXIgbmFtZSwgZGF0YSA9IHt9XG5cdFx0JHdlYiQgPyBJbWJhLkV2ZW50cy50cmlnZ2VyKG5hbWUsc2VsZixkYXRhOiBkYXRhKSA6IG51bGxcblxuXHQjIyNcblx0Rm9jdXMgb24gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZm9jdXNcblx0XHRkb20uZm9jdXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBmb2N1cyBmcm9tIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJsdXJcblx0XHRkb20uYmx1clxuXHRcdHNlbGZcblxuXHRkZWYgdG9TdHJpbmdcblx0XHRkb206b3V0ZXJIVE1MXG5cdFxuXG5JbWJhLlRhZzpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IEltYmEuVGFnXG5cbmNsYXNzIEltYmEuU1ZHVGFnIDwgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5uYW1lc3BhY2VVUklcblx0XHRcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLEBub2RlVHlwZSlcblx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRkb206Y2xhc3NOYW1lOmJhc2VWYWwgPSBjbHMgaWYgY2xzXG5cdFx0ZG9tXG5cblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblx0XHRpZiBjaGlsZC5AbmFtZSBpbiBJbWJhLlNWR19UQUdTXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IFwiX1wiICsgY2hpbGQuQG5hbWUucmVwbGFjZSgvXy9nLCAnLScpXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLmNvbmNhdChjbGFzc05hbWUpXG5cbkltYmEuSFRNTF9UQUdTID0gXCJhIGFiYnIgYWRkcmVzcyBhcmVhIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiYXNlIGJkaSBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBiciBidXR0b24gY2FudmFzIGNhcHRpb24gY2l0ZSBjb2RlIGNvbCBjb2xncm91cCBkYXRhIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXYgZGwgZHQgZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGZvcm0gaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaHIgaHRtbCBpIGlmcmFtZSBpbWcgaW5wdXQgaW5zIGtiZCBrZXlnZW4gbGFiZWwgbGVnZW5kIGxpIGxpbmsgbWFpbiBtYXAgbWFyayBtZW51IG1lbnVpdGVtIG1ldGEgbWV0ZXIgbmF2IG5vc2NyaXB0IG9iamVjdCBvbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcGFyYW0gcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBzIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0cmFjayB1IHVsIHZhciB2aWRlbyB3YnJcIi5zcGxpdChcIiBcIilcbkltYmEuSFRNTF9UQUdTX1VOU0FGRSA9IFwiYXJ0aWNsZSBhc2lkZSBoZWFkZXIgc2VjdGlvblwiLnNwbGl0KFwiIFwiKVxuSW1iYS5TVkdfVEFHUyA9IFwiY2lyY2xlIGRlZnMgZWxsaXBzZSBnIGxpbmUgbGluZWFyR3JhZGllbnQgbWFzayBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHN0b3Agc3ZnIHRleHQgdHNwYW5cIi5zcGxpdChcIiBcIilcblxuSW1iYS5IVE1MX0FUVFJTID1cblx0YTogXCJocmVmIHRhcmdldCBocmVmbGFuZyBtZWRpYSBkb3dubG9hZCByZWwgdHlwZVwiXG5cdGZvcm06IFwibWV0aG9kIGFjdGlvbiBlbmN0eXBlIGF1dG9jb21wbGV0ZSB0YXJnZXRcIlxuXHRidXR0b246IFwiYXV0b2ZvY3VzIHR5cGVcIlxuXHRpbnB1dDogXCJhY2NlcHQgZGlzYWJsZWQgZm9ybSBsaXN0IG1heCBtYXhsZW5ndGggbWluIHBhdHRlcm4gcmVxdWlyZWQgc2l6ZSBzdGVwIHR5cGVcIlxuXHRsYWJlbDogXCJhY2Nlc3NrZXkgZm9yIGZvcm1cIlxuXHRpbWc6IFwic3JjIHNyY3NldFwiXG5cdGxpbms6IFwicmVsIHR5cGUgaHJlZiBtZWRpYVwiXG5cdGlmcmFtZTogXCJyZWZlcnJlcnBvbGljeSBzcmMgc3JjZG9jIHNhbmRib3hcIlxuXHRtZXRhOiBcInByb3BlcnR5IGNvbnRlbnQgY2hhcnNldCBkZXNjXCJcblx0b3B0Z3JvdXA6IFwibGFiZWxcIlxuXHRvcHRpb246IFwibGFiZWxcIlxuXHRvdXRwdXQ6IFwiZm9yIGZvcm1cIlxuXHRvYmplY3Q6IFwidHlwZSBkYXRhIHdpZHRoIGhlaWdodFwiXG5cdHBhcmFtOiBcIm5hbWUgdmFsdWVcIlxuXHRwcm9ncmVzczogXCJtYXhcIlxuXHRzY3JpcHQ6IFwic3JjIHR5cGUgYXN5bmMgZGVmZXIgY3Jvc3NvcmlnaW4gaW50ZWdyaXR5IG5vbmNlIGxhbmd1YWdlXCJcblx0c2VsZWN0OiBcInNpemUgZm9ybSBtdWx0aXBsZVwiXG5cdHRleHRhcmVhOiBcInJvd3MgY29sc1wiXG5cblxuSW1iYS5IVE1MX1BST1BTID1cblx0aW5wdXQ6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0dGV4dGFyZWE6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0Zm9ybTogXCJub3ZhbGlkYXRlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRidXR0b246IFwiZGlzYWJsZWRcIlxuXHRzZWxlY3Q6IFwiYXV0b2ZvY3VzIGRpc2FibGVkIHJlcXVpcmVkXCJcblx0b3B0aW9uOiBcImRpc2FibGVkIHNlbGVjdGVkIHZhbHVlXCJcblx0b3B0Z3JvdXA6IFwiZGlzYWJsZWRcIlxuXHRwcm9ncmVzczogXCJ2YWx1ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0Y2FudmFzOiBcIndpZHRoIGhlaWdodFwiXG5cbmRlZiBleHRlbmRlciBvYmosIHN1cFxuXHRmb3Igb3duIGssdiBvZiBzdXBcblx0XHRvYmpba10gPz0gdlxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRzdXAuaW5oZXJpdChvYmopIGlmIHN1cDppbmhlcml0XG5cdHJldHVybiBvYmpcblxuZGVmIFRhZ1xuXHRyZXR1cm4gZG8gfGRvbSxjdHh8XG5cdFx0dGhpcy5pbml0aWFsaXplKGRvbSxjdHgpXG5cdFx0cmV0dXJuIHRoaXNcblxuZGVmIFRhZ1NwYXduZXIgdHlwZVxuXHRyZXR1cm4gZG8gfHpvbmV8IHR5cGUuYnVpbGQoem9uZSlcblxuXG5jbGFzcyBJbWJhLlRhZ3NcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdHNlbGZcblxuXHRkZWYgX19jbG9uZSBuc1xuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBucyBuYW1lXG5cdFx0c2VsZlsnXycgKyBuYW1lLnRvVXBwZXJDYXNlXSB8fCBkZWZpbmVOYW1lc3BhY2UobmFtZSlcblxuXHRkZWYgZGVmaW5lTmFtZXNwYWNlIG5hbWVcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRjbG9uZS5AbnMgPSBuYW1lXG5cdFx0c2VsZlsnXycgKyBuYW1lLnRvVXBwZXJDYXNlXSA9IGNsb25lXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIGJhc2VUeXBlIG5hbWUsIG5zXG5cdFx0bmFtZSBpbiBJbWJhLkhUTUxfVEFHUyA/ICdlbGVtZW50JyA6ICdkaXYnXG5cblx0ZGVmIGRlZmluZVRhZyBmdWxsTmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdGlmIGJvZHkgYW5kIGJvZHkuQG5vZGVUeXBlXG5cdFx0XHRzdXByID0gYm9keVxuXHRcdFx0Ym9keSA9IG51bGxcblx0XHRcdFxuXHRcdGlmIHNlbGZbZnVsbE5hbWVdXG5cdFx0XHRjb25zb2xlLmxvZyBcInRhZyBhbHJlYWR5IGV4aXN0cz9cIixmdWxsTmFtZVxuXHRcdFxuXHRcdCMgaWYgaXQgaXMgbmFtZXNwYWNlZFxuXHRcdHZhciBuc1xuXHRcdHZhciBuYW1lID0gZnVsbE5hbWVcblx0XHRsZXQgbnNpZHggPSBuYW1lLmluZGV4T2YoJzonKVxuXHRcdGlmICBuc2lkeCA+PSAwXG5cdFx0XHRucyA9IGZ1bGxOYW1lLnN1YnN0cigwLG5zaWR4KVxuXHRcdFx0bmFtZSA9IGZ1bGxOYW1lLnN1YnN0cihuc2lkeCArIDEpXG5cdFx0XHRpZiBucyA9PSAnc3ZnJyBhbmQgIXN1cHJcblx0XHRcdFx0c3VwciA9ICdzdmc6ZWxlbWVudCdcblxuXHRcdHN1cHIgfHw9IGJhc2VUeXBlKGZ1bGxOYW1lKVxuXG5cdFx0bGV0IHN1cGVydHlwZSA9IHN1cHIgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKHN1cHIpIDogc3VwclxuXHRcdGxldCB0YWd0eXBlID0gVGFnKClcblxuXHRcdHRhZ3R5cGUuQG5hbWUgPSBuYW1lXG5cdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBudWxsXG5cblx0XHRpZiBuYW1lWzBdID09ICcjJ1xuXHRcdFx0SW1iYS5TSU5HTEVUT05TW25hbWUuc2xpY2UoMSldID0gdGFndHlwZVxuXHRcdFx0c2VsZltuYW1lXSA9IHRhZ3R5cGVcblx0XHRlbGlmIG5hbWVbMF0gPT0gbmFtZVswXS50b1VwcGVyQ2FzZVxuXHRcdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBuYW1lXG5cdFx0ZWxzZVxuXHRcdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBcIl9cIiArIGZ1bGxOYW1lLnJlcGxhY2UoL1tfXFw6XS9nLCAnLScpXG5cdFx0XHRzZWxmW2Z1bGxOYW1lXSA9IHRhZ3R5cGVcblxuXHRcdGV4dGVuZGVyKHRhZ3R5cGUsc3VwZXJ0eXBlKVxuXG5cdFx0aWYgYm9keVxuXHRcdFx0Ym9keS5jYWxsKHRhZ3R5cGUsdGFndHlwZSwgdGFndHlwZS5UQUdTIG9yIHNlbGYpXG5cdFx0XHR0YWd0eXBlLmRlZmluZWQgaWYgdGFndHlwZTpkZWZpbmVkXG5cdFx0XHRvcHRpbWl6ZVRhZyh0YWd0eXBlKVxuXHRcdHJldHVybiB0YWd0eXBlXG5cblx0ZGVmIGRlZmluZVNpbmdsZXRvbiBuYW1lLCBzdXByLCAmYm9keVxuXHRcdGRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuXHRkZWYgZXh0ZW5kVGFnIG5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHR2YXIga2xhc3MgPSAobmFtZSBpc2EgU3RyaW5nID8gZmluZFRhZ1R5cGUobmFtZSkgOiBuYW1lKVxuXHRcdCMgYWxsb3cgZm9yIHByaXZhdGUgdGFncyBoZXJlIGFzIHdlbGw/XG5cdFx0Ym9keSBhbmQgYm9keS5jYWxsKGtsYXNzLGtsYXNzLGtsYXNzOnByb3RvdHlwZSkgaWYgYm9keVxuXHRcdGtsYXNzLmV4dGVuZGVkIGlmIGtsYXNzOmV4dGVuZGVkXG5cdFx0b3B0aW1pemVUYWcoa2xhc3MpXG5cdFx0cmV0dXJuIGtsYXNzXG5cblx0ZGVmIG9wdGltaXplVGFnIHRhZ3R5cGVcblx0XHR0YWd0eXBlOnByb3RvdHlwZT8ub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHRcblx0ZGVmIGZpbmRUYWdUeXBlIHR5cGVcblx0XHRsZXQga2xhc3MgPSBzZWxmW3R5cGVdXG5cdFx0dW5sZXNzIGtsYXNzXG5cdFx0XHRpZiB0eXBlLnN1YnN0cigwLDQpID09ICdzdmc6J1xuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdzdmc6ZWxlbWVudCcpXG5cblx0XHRcdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZih0eXBlKSA+PSAwXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ2VsZW1lbnQnKVxuXG5cdFx0XHRcdGlmIGxldCBhdHRycyA9IEltYmEuSFRNTF9BVFRSU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIGF0dHJzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUpXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0aWYgbGV0IHByb3BzID0gSW1iYS5IVE1MX1BST1BTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gcHJvcHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSxkb206IHllcylcblx0XHRyZXR1cm4ga2xhc3Ncblx0XHRcblx0ZGVmIGNyZWF0ZUVsZW1lbnQgbmFtZSwgb3duZXJcblx0XHR2YXIgdHlwXG5cdFx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHRcdHR5cCA9IG5hbWVcblx0XHRlbHNlXHRcdFx0XG5cdFx0XHRpZiAkZGVidWckXG5cdFx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge25hbWV9XCIpIHVubGVzcyBmaW5kVGFnVHlwZShuYW1lKVxuXHRcdFx0dHlwID0gZmluZFRhZ1R5cGUobmFtZSlcblx0XHR0eXAuYnVpbGQob3duZXIpXG5cblxuZGVmIEltYmEuY3JlYXRlRWxlbWVudCBuYW1lLCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIHBhcmVudFxuXHRpZiBuYW1lIGlzYSBGdW5jdGlvblxuXHRcdHR5cGUgPSBuYW1lXG5cdGVsc2Vcblx0XHRpZiAkZGVidWckXG5cdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgSW1iYS5UQUdTLmZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwZSA9IEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcblx0aWYgY3R4IGlzYSBUYWdNYXBcblx0XHRwYXJlbnQgPSBjdHg6cGFyJFxuXHRlbGlmIHByZWYgaXNhIEltYmEuVGFnXG5cdFx0cGFyZW50ID0gcHJlZlxuXHRlbHNlXG5cdFx0cGFyZW50ID0gY3R4IGFuZCBwcmVmICE9IHVuZGVmaW5lZCA/IGN0eFtwcmVmXSA6IChjdHggYW5kIGN0eC5AdGFnIG9yIGN0eClcblxuXHR2YXIgbm9kZSA9IHR5cGUuYnVpbGQocGFyZW50KVxuXHRcblx0aWYgY3R4IGlzYSBUYWdNYXBcblx0XHRjdHg6aSQrK1xuXHRcdG5vZGU6JGtleSA9IHJlZlxuXG5cdCMgbm9kZTokcmVmID0gcmVmIGlmIHJlZlxuXHQjIGNvbnRleHQ6aSQrKyAjIG9ubHkgaWYgaXQgaXMgbm90IGFuIGFycmF5P1xuXHRpZiBjdHggYW5kIHJlZiAhPSB1bmRlZmluZWRcblx0XHRjdHhbcmVmXSA9IG5vZGVcblxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdDYWNoZSBvd25lclxuXHR2YXIgaXRlbSA9IFtdXG5cdGl0ZW0uQHRhZyA9IG93bmVyXG5cdHJldHVybiBpdGVtXG5cblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IGN0eFtwcmVmXSA6IGN0eC5AdGFnKVxuXHR2YXIgbm9kZSA9IFRhZ01hcC5uZXcoY3R4LHJlZixwYXIpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXHRcbmRlZiBJbWJhLmNyZWF0ZVRhZ01hcCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgcGFyID0gKHByZWYgIT0gdW5kZWZpbmVkID8gcHJlZiA6IGN0eC5AdGFnKVxuXHR2YXIgbm9kZSA9IFRhZ01hcC5uZXcoY3R4LHJlZixwYXIpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdMaXN0IGN0eCwgcmVmLCBwcmVmXG5cdHZhciBub2RlID0gW11cblx0bm9kZS5AdHlwZSA9IDRcblx0bm9kZS5AdGFnID0gKHByZWYgIT0gdW5kZWZpbmVkID8gcHJlZiA6IGN0eC5AdGFnKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTG9vcFJlc3VsdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA1XG5cdG5vZGU6Y2FjaGUgPSB7aSQ6IDB9XG5cdHJldHVybiBub2RlXG5cbiMgdXNlIGFycmF5IGluc3RlYWQ/XG5jbGFzcyBUYWdDYWNoZVxuXHRkZWYgc2VsZi5idWlsZCBvd25lclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0YWcgPSBvd25lclxuXHRcdHJldHVybiBpdGVtXG5cblx0ZGVmIGluaXRpYWxpemUgb3duZXJcblx0XHRzZWxmLkB0YWcgPSBvd25lclxuXHRcdHNlbGZcblx0XG5jbGFzcyBUYWdNYXBcblx0XG5cdGRlZiBpbml0aWFsaXplIGNhY2hlLCByZWYsIHBhclxuXHRcdHNlbGY6Y2FjaGUkID0gY2FjaGVcblx0XHRzZWxmOmtleSQgPSByZWZcblx0XHRzZWxmOnBhciQgPSBwYXJcblx0XHRzZWxmOmkkID0gMFxuXHRcdCMgc2VsZjpjdXJyJCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcdCMgc2VsZjpuZXh0JCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcblx0ZGVmICRpdGVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHR5cGUgPSA1XG5cdFx0aXRlbTpzdGF0aWMgPSA1ICMgd3JvbmcoISlcblx0XHRpdGVtOmNhY2hlID0gc2VsZlxuXHRcdHJldHVybiBpdGVtXG5cdFx0XG5cdGRlZiAkcHJ1bmUgaXRlbXNcblx0XHRsZXQgY2FjaGUgPSBzZWxmOmNhY2hlJFxuXHRcdGxldCBrZXkgPSBzZWxmOmtleSRcblx0XHRsZXQgY2xvbmUgPSBUYWdNYXAubmV3KGNhY2hlLGtleSxzZWxmOnBhciQpXG5cdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdGNsb25lW2l0ZW06a2V5JF0gPSBpdGVtXG5cdFx0Y2xvbmU6aSQgPSBpdGVtczpsZW5ndGhcblx0XHRyZXR1cm4gY2FjaGVba2V5XSA9IGNsb25lXG5cbkltYmEuVGFnTWFwID0gVGFnTWFwXG5JbWJhLlRhZ0NhY2hlID0gVGFnQ2FjaGVcbkltYmEuU0lOR0xFVE9OUyA9IHt9XG5JbWJhLlRBR1MgPSBJbWJhLlRhZ3MubmV3XG5JbWJhLlRBR1NbOmVsZW1lbnRdID0gSW1iYS5UQUdTWzpodG1sZWxlbWVudF0gPSBJbWJhLlRhZ1xuSW1iYS5UQUdTWydzdmc6ZWxlbWVudCddID0gSW1iYS5TVkdUYWdcblxuZGVmIEltYmEuZGVmaW5lVGFnIG5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmRlZmluZVNpbmdsZXRvblRhZyBpZCwgc3VwciA9ICdkaXYnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZXh0ZW5kVGFnIG5hbWUsIGJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5leHRlbmRUYWcobmFtZSxib2R5KVxuXG5kZWYgSW1iYS5nZXRUYWdTaW5nbGV0b24gaWRcdFxuXHR2YXIgZG9tLCBub2RlXG5cblx0aWYgdmFyIGtsYXNzID0gSW1iYS5TSU5HTEVUT05TW2lkXVxuXHRcdHJldHVybiBrbGFzcy5JbnN0YW5jZSBpZiBrbGFzcyBhbmQga2xhc3MuSW5zdGFuY2UgXG5cblx0XHQjIG5vIGluc3RhbmNlIC0gY2hlY2sgZm9yIGVsZW1lbnRcblx0XHRpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdFx0IyB3ZSBoYXZlIGEgbGl2ZSBpbnN0YW5jZSAtIHdoZW4gZmluZGluZyBpdCB0aHJvdWdoIGEgc2VsZWN0b3Igd2Ugc2hvdWxkIGF3YWtlIGl0LCBubz9cblx0XHRcdCMgY29uc29sZS5sb2coJ2NyZWF0aW5nIHRoZSBzaW5nbGV0b24gZnJvbSBleGlzdGluZyBub2RlIGluIGRvbT8nLGlkLHR5cGUpXG5cdFx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdFx0bm9kZS5hd2FrZW4oZG9tKSAjIHNob3VsZCBvbmx5IGF3YWtlblxuXHRcdFx0cmV0dXJuIG5vZGVcblxuXHRcdGRvbSA9IGtsYXNzLmNyZWF0ZU5vZGVcblx0XHRkb206aWQgPSBpZFxuXHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0bm9kZS5lbmQuYXdha2VuKGRvbSlcblx0XHRyZXR1cm4gbm9kZVxuXHRlbGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnRm9yRG9tKGRvbSlcblxudmFyIHN2Z1N1cHBvcnQgPSB0eXBlb2YgU1ZHRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuIyBzaHVvbGQgYmUgcGhhc2VkIG91dFxuZGVmIEltYmEuZ2V0VGFnRm9yRG9tIGRvbVxuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tXG5cdHJldHVybiBkb20gaWYgZG9tLkBkb20gIyBjb3VsZCB1c2UgaW5oZXJpdGFuY2UgaW5zdGVhZFxuXHRyZXR1cm4gZG9tLkB0YWcgaWYgZG9tLkB0YWdcblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbTpub2RlTmFtZVxuXG5cdHZhciBuYW1lID0gZG9tOm5vZGVOYW1lLnRvTG93ZXJDYXNlXG5cdHZhciB0eXBlID0gbmFtZVxuXHR2YXIgbnMgPSBJbWJhLlRBR1MgIyAgc3ZnU3VwcG9ydCBhbmQgZG9tIGlzYSBTVkdFbGVtZW50ID8gSW1iYS5UQUdTOl9TVkcgOiBJbWJhLlRBR1NcblxuXHRpZiBkb206aWQgYW5kIEltYmEuU0lOR0xFVE9OU1tkb206aWRdXG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnU2luZ2xldG9uKGRvbTppZClcblx0XHRcblx0aWYgc3ZnU3VwcG9ydCBhbmQgZG9tIGlzYSBTVkdFbGVtZW50XG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKFwic3ZnOlwiICsgbmFtZSlcblx0ZWxpZiBJbWJhLkhUTUxfVEFHUy5pbmRleE9mKG5hbWUpID49IDBcblx0XHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblx0ZWxzZVxuXHRcdHR5cGUgPSBJbWJhLlRhZ1xuXHQjIGlmIG5zLkBub2RlTmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwXG5cdCNcdHR5cGUgPSBucy5maW5kVGFnVHlwZShuYW1lKVxuXG5cdHJldHVybiB0eXBlLm5ldyhkb20sbnVsbCkuYXdha2VuKGRvbSlcblxuIyBkZXByZWNhdGVcbmRlZiBJbWJhLmdlbmVyYXRlQ1NTUHJlZml4ZXNcblx0dmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50OmRvY3VtZW50RWxlbWVudCwgJycpXG5cblx0Zm9yIHByZWZpeGVkIGluIHN0eWxlc1xuXHRcdHZhciB1bnByZWZpeGVkID0gcHJlZml4ZWQucmVwbGFjZSgvXi0od2Via2l0fG1zfG1venxvfGJsaW5rKS0vLCcnKVxuXHRcdHZhciBjYW1lbENhc2UgPSB1bnByZWZpeGVkLnJlcGxhY2UoLy0oXFx3KS9nKSBkbyB8bSxhfCBhLnRvVXBwZXJDYXNlXG5cblx0XHQjIGlmIHRoZXJlIGV4aXN0cyBhbiB1bnByZWZpeGVkIHZlcnNpb24gLS0gYWx3YXlzIHVzZSB0aGlzXG5cdFx0aWYgcHJlZml4ZWQgIT0gdW5wcmVmaXhlZFxuXHRcdFx0Y29udGludWUgaWYgc3R5bGVzLmhhc093blByb3BlcnR5KHVucHJlZml4ZWQpXG5cblx0XHQjIHJlZ2lzdGVyIHRoZSBwcmVmaXhlc1xuXHRcdEltYmEuQ1NTS2V5TWFwW3VucHJlZml4ZWRdID0gSW1iYS5DU1NLZXlNYXBbY2FtZWxDYXNlXSA9IHByZWZpeGVkXG5cdHJldHVyblxuXG5pZiAkd2ViJFxuXHRJbWJhLmdlbmVyYXRlQ1NTUHJlZml4ZXMgaWYgZG9jdW1lbnRcblxuXHQjIE92dmVycmlkZSBjbGFzc0xpc3Rcblx0aWYgZG9jdW1lbnQgYW5kICFkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQ6Y2xhc3NMaXN0XG5cdFx0ZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0XHRcdGRlZiBoYXNGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gUmVnRXhwLm5ldygnKF58XFxcXHMpJyArIHJlZiArICcoXFxcXHN8JCknKS50ZXN0KEBkb206Y2xhc3NOYW1lKVxuXG5cdFx0XHRkZWYgYWRkRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgaWYgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lICs9IChAZG9tOmNsYXNzTmFtZSA/ICcgJyA6ICcnKSArIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdW5mbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdHZhciByZWdleCA9IFJlZ0V4cC5uZXcoJyhefFxcXFxzKSonICsgcmVmICsgJyhcXFxcc3wkKSonLCAnZycpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lID0gQGRvbTpjbGFzc05hbWUucmVwbGFjZShyZWdleCwgJycpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB0b2dnbGVGbGFnIHJlZlxuXHRcdFx0XHRoYXNGbGFnKHJlZikgPyB1bmZsYWcocmVmKSA6IGZsYWcocmVmKVxuXG5cdFx0XHRkZWYgZmxhZyByZWYsIGJvb2xcblx0XHRcdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyIGFuZCAhIWJvb2wgPT09IG5vXG5cdFx0XHRcdFx0cmV0dXJuIHVuZmxhZyhyZWYpXG5cdFx0XHRcdHJldHVybiBhZGRGbGFnKHJlZilcblxuSW1iYS5UYWdcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuIyBwcmVkZWZpbmUgYWxsIHN1cHBvcnRlZCBodG1sIHRhZ3NcbnRhZyBmcmFnbWVudCA8IGVsZW1lbnRcblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0SW1iYS5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50XG5cbmV4dGVuZCB0YWcgaHRtbFxuXHRkZWYgcGFyZW50XG5cdFx0bnVsbFxuXG5cbmV4dGVuZCB0YWcgY2FudmFzXG5cdGRlZiBjb250ZXh0IHR5cGUgPSAnMmQnXG5cdFx0ZG9tLmdldENvbnRleHQodHlwZSlcblxuY2xhc3MgRGF0YVByb3h5XHRcblx0ZGVmIHNlbGYuYmluZCByZWNlaXZlciwgZGF0YSwgcGF0aCwgYXJnc1xuXHRcdGxldCBwcm94eSA9IHJlY2VpdmVyLkBkYXRhIHx8PSBzZWxmLm5ldyhyZWNlaXZlcixwYXRoLGFyZ3MpXG5cdFx0cHJveHkuYmluZChkYXRhLHBhdGgsYXJncylcblx0XHRyZXR1cm4gcmVjZWl2ZXJcblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBwYXRoLCBhcmdzXG5cdFx0QG5vZGUgPSBub2RlXG5cdFx0QHBhdGggPSBwYXRoXG5cdFx0QGFyZ3MgPSBhcmdzXG5cdFx0QHNldHRlciA9IEltYmEudG9TZXR0ZXIoQHBhdGgpIGlmIEBhcmdzXG5cdFx0XG5cdGRlZiBiaW5kIGRhdGEsIGtleSwgYXJnc1xuXHRcdGlmIGRhdGEgIT0gQGRhdGFcblx0XHRcdEBkYXRhID0gZGF0YVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGdldEZvcm1WYWx1ZVxuXHRcdEBzZXR0ZXIgPyBAZGF0YVtAcGF0aF0oKSA6IEBkYXRhW0BwYXRoXVxuXG5cdGRlZiBzZXRGb3JtVmFsdWUgdmFsdWVcblx0XHRAc2V0dGVyID8gQGRhdGFbQHNldHRlcl0odmFsdWUpIDogKEBkYXRhW0BwYXRoXSA9IHZhbHVlKVxuXG5cbnZhciBpc0FycmF5ID0gZG8gfHZhbHxcblx0dmFsIGFuZCB2YWw6c3BsaWNlIGFuZCB2YWw6c29ydFxuXG52YXIgaXNTaW1pbGFyQXJyYXkgPSBkbyB8YSxifFxuXHRsZXQgbCA9IGE6bGVuZ3RoLCBpID0gMFxuXHRyZXR1cm4gbm8gdW5sZXNzIGwgPT0gYjpsZW5ndGhcblx0d2hpbGUgaSsrIDwgbFxuXHRcdHJldHVybiBubyBpZiBhW2ldICE9IGJbaV1cblx0cmV0dXJuIHllc1xuXG5leHRlbmQgdGFnIGlucHV0XG5cdHByb3AgbGF6eVxuXG5cdGRlZiBzZXRNb2RlbFxuXHRcdGNvbnNvbGUud2FybiBcInNldE1vZGVsIHJlbW92ZWQuIFVzZSA8aW5wdXRbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdEBkYXRhIGFuZCAhbGF6eSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBtb2RlbFZhbHVlID0gQGxvY2FsVmFsdWUgPSB1bmRlZmluZWRcblx0XHRyZXR1cm4gZS5zaWxlbmNlIHVubGVzcyBkYXRhXG5cdFx0XG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGNoZWNrZWQgPSBAZG9tOmNoZWNrZWRcblx0XHRcdGxldCBtdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZSAhPSB1bmRlZmluZWQgPyBAdmFsdWUgOiB2YWx1ZVxuXG5cdFx0XHRpZiB0eXBlID09ICdyYWRpbydcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKGR2YWwsc2VsZilcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKCEhY2hlY2tlZCxzZWxmKVxuXHRcdFx0ZWxpZiBpc0FycmF5KG12YWwpXG5cdFx0XHRcdGxldCBpZHggPSBtdmFsLmluZGV4T2YoZHZhbClcblx0XHRcdFx0aWYgY2hlY2tlZCBhbmQgaWR4ID09IC0xXG5cdFx0XHRcdFx0bXZhbC5wdXNoKGR2YWwpXG5cdFx0XHRcdGVsaWYgIWNoZWNrZWQgYW5kIGlkeCA+PSAwXG5cdFx0XHRcdFx0bXZhbC5zcGxpY2UoaWR4LDEpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZShkdmFsLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlKVxuXHRcblx0IyBvdmVycmlkaW5nIGVuZCBkaXJlY3RseSBmb3IgcGVyZm9ybWFuY2Vcblx0ZGVmIGVuZFxuXHRcdHJldHVybiBzZWxmIGlmICFAZGF0YSBvciBAbG9jYWxWYWx1ZSAhPT0gdW5kZWZpbmVkXG5cdFx0bGV0IG12YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRyZXR1cm4gc2VsZiBpZiBtdmFsID09IEBtb2RlbFZhbHVlXG5cdFx0QG1vZGVsVmFsdWUgPSBtdmFsIHVubGVzcyBpc0FycmF5KG12YWwpXG5cblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZVxuXHRcdFx0bGV0IGNoZWNrZWQgPSBpZiBpc0FycmF5KG12YWwpXG5cdFx0XHRcdG12YWwuaW5kZXhPZihkdmFsKSA+PSAwXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdCEhbXZhbFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtdmFsID09IEB2YWx1ZVxuXG5cdFx0XHRAZG9tOmNoZWNrZWQgPSBjaGVja2VkXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbTp2YWx1ZSA9IG12YWxcblx0XHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIHRleHRhcmVhXG5cdHByb3AgbGF6eVxuXG5cdGRlZiBzZXRNb2RlbCB2YWx1ZSwgbW9kc1xuXHRcdGNvbnNvbGUud2FybiBcInNldE1vZGVsIHJlbW92ZWQuIFVzZSA8dGV4dGFyZWFbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gdmFsdWUgaWYgQGxvY2FsVmFsdWUgPT0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRAZGF0YSBhbmQgIWxhenkgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2VcblxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0QGRhdGEgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBpZiBAbG9jYWxWYWx1ZSAhPSB1bmRlZmluZWQgb3IgIUBkYXRhXG5cdFx0aWYgQGRhdGFcblx0XHRcdGxldCBkdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0XHRAZG9tOnZhbHVlID0gZHZhbCAhPSB1bmRlZmluZWQgPyBkdmFsIDogJydcblx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyBvcHRpb25cblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0aWYgdmFsdWUgIT0gQHZhbHVlXG5cdFx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgdmFsdWVcblx0XHRAdmFsdWUgb3IgZG9tOnZhbHVlXG5cbmV4dGVuZCB0YWcgc2VsZWN0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPHNlbGVjdFtkYXRhOnBhdGhdPlwiXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlLCBzeW5jaW5nXG5cdFx0bGV0IHByZXYgPSBAdmFsdWVcblx0XHRAdmFsdWUgPSB2YWx1ZVxuXHRcdHN5bmNWYWx1ZSh2YWx1ZSkgdW5sZXNzIHN5bmNpbmdcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc3luY1ZhbHVlIHZhbHVlXG5cdFx0bGV0IHByZXYgPSBAc3luY1ZhbHVlXG5cdFx0IyBjaGVjayBpZiB2YWx1ZSBoYXMgY2hhbmdlZFxuXHRcdGlmIG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdGlmIHByZXYgaXNhIEFycmF5IGFuZCBpc1NpbWlsYXJBcnJheShwcmV2LHZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdFx0IyBjcmVhdGUgYSBjb3B5IGZvciBzeW5jVmFsdWVcblx0XHRcdHZhbHVlID0gdmFsdWUuc2xpY2VcblxuXHRcdEBzeW5jVmFsdWUgPSB2YWx1ZVxuXHRcdCMgc3VwcG9ydCBhcnJheSBmb3IgbXVsdGlwbGU/XG5cdFx0aWYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnXG5cdFx0XHRsZXQgbXVsdCA9IG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdFxuXHRcdFx0Zm9yIG9wdCxpIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdGxldCBvdmFsID0gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpXG5cdFx0XHRcdGlmIG11bHRcblx0XHRcdFx0XHRvcHQ6c2VsZWN0ZWQgPSB2YWx1ZS5pbmRleE9mKG92YWwpID49IDBcblx0XHRcdFx0ZWxpZiB2YWx1ZSA9PSBvdmFsXG5cdFx0XHRcdFx0ZG9tOnNlbGVjdGVkSW5kZXggPSBpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRlbHNlXG5cdFx0XHRkb206dmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHZhbHVlXG5cdFx0aWYgbXVsdGlwbGVcblx0XHRcdGZvciBvcHRpb24gaW4gZG9tOnNlbGVjdGVkT3B0aW9uc1xuXHRcdFx0XHRvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlXG5cdFx0ZWxzZVxuXHRcdFx0bGV0IG9wdCA9IGRvbTpzZWxlY3RlZE9wdGlvbnNbMF1cblx0XHRcdG9wdCA/IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKSA6IG51bGxcblx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QGRhdGEgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIGVuZFxuXHRcdGlmIEBkYXRhXG5cdFx0XHRzZXRWYWx1ZShAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZiksMSlcblxuXHRcdGlmIEB2YWx1ZSAhPSBAc3luY1ZhbHVlXG5cdFx0XHRzeW5jVmFsdWUoQHZhbHVlKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIEltYmEuVG91Y2hcbiMgQmVnYW5cdEEgZmluZ2VyIHRvdWNoZWQgdGhlIHNjcmVlbi5cbiMgTW92ZWRcdEEgZmluZ2VyIG1vdmVkIG9uIHRoZSBzY3JlZW4uXG4jIFN0YXRpb25hcnlcdEEgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBzY3JlZW4gYnV0IGhhc24ndCBtb3ZlZC5cbiMgRW5kZWRcdEEgZmluZ2VyIHdhcyBsaWZ0ZWQgZnJvbSB0aGUgc2NyZWVuLiBUaGlzIGlzIHRoZSBmaW5hbCBwaGFzZSBvZiBhIHRvdWNoLlxuIyBDYW5jZWxlZCBUaGUgc3lzdGVtIGNhbmNlbGxlZCB0cmFja2luZyBmb3IgdGhlIHRvdWNoLlxuXG4jIyNcbkNvbnNvbGlkYXRlcyBtb3VzZSBhbmQgdG91Y2ggZXZlbnRzLiBUb3VjaCBvYmplY3RzIHBlcnNpc3QgYWNyb3NzIGEgdG91Y2gsXG5mcm9tIHRvdWNoc3RhcnQgdW50aWwgZW5kL2NhbmNlbC4gV2hlbiBhIHRvdWNoIHN0YXJ0cywgaXQgd2lsbCB0cmF2ZXJzZVxuZG93biBmcm9tIHRoZSBpbm5lcm1vc3QgdGFyZ2V0LCB1bnRpbCBpdCBmaW5kcyBhIG5vZGUgdGhhdCByZXNwb25kcyB0b1xub250b3VjaHN0YXJ0LiBVbmxlc3MgdGhlIHRvdWNoIGlzIGV4cGxpY2l0bHkgcmVkaXJlY3RlZCwgdGhlIHRvdWNoIHdpbGxcbmNhbGwgb250b3VjaG1vdmUgYW5kIG9udG91Y2hlbmQgLyBvbnRvdWNoY2FuY2VsIG9uIHRoZSByZXNwb25kZXIgd2hlbiBhcHByb3ByaWF0ZS5cblxuXHR0YWcgZHJhZ2dhYmxlXG5cdFx0IyBjYWxsZWQgd2hlbiBhIHRvdWNoIHN0YXJ0c1xuXHRcdGRlZiBvbnRvdWNoc3RhcnQgdG91Y2hcblx0XHRcdGZsYWcgJ2RyYWdnaW5nJ1xuXHRcdFx0c2VsZlxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggbW92ZXMgLSBzYW1lIHRvdWNoIG9iamVjdFxuXHRcdGRlZiBvbnRvdWNobW92ZSB0b3VjaFxuXHRcdFx0IyBtb3ZlIHRoZSBub2RlIHdpdGggdG91Y2hcblx0XHRcdGNzcyB0b3A6IHRvdWNoLmR5LCBsZWZ0OiB0b3VjaC5keFxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggZW5kc1xuXHRcdGRlZiBvbnRvdWNoZW5kIHRvdWNoXG5cdFx0XHR1bmZsYWcgJ2RyYWdnaW5nJ1xuXG5AaW5hbWUgdG91Y2hcbiMjI1xuY2xhc3MgSW1iYS5Ub3VjaFxuXHRzZWxmLkxhc3RUaW1lc3RhbXAgPSAwXG5cdHNlbGYuVGFwVGltZW91dCA9IDUwXG5cblx0IyB2YXIgbGFzdE5hdGl2ZVRvdWNoVGltZW91dCA9IDUwXG5cblx0dmFyIHRvdWNoZXMgPSBbXVxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBpZGVudGlmaWVycyA9IHt9XG5cblx0ZGVmIHNlbGYuY291bnRcblx0XHRjb3VudFxuXG5cdGRlZiBzZWxmLmxvb2t1cCBpdGVtXG5cdFx0cmV0dXJuIGl0ZW0gYW5kIChpdGVtOl9fdG91Y2hfXyBvciBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdKVxuXG5cdGRlZiBzZWxmLnJlbGVhc2UgaXRlbSx0b3VjaFxuXHRcdGRlbGV0ZSBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdXG5cdFx0ZGVsZXRlIGl0ZW06X190b3VjaF9fXG5cdFx0cmV0dXJuXG5cblx0ZGVmIHNlbGYub250b3VjaHN0YXJ0IGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRjb250aW51ZSBpZiBsb29rdXAodClcblx0XHRcdHZhciB0b3VjaCA9IGlkZW50aWZpZXJzW3Q6aWRlbnRpZmllcl0gPSBzZWxmLm5ldyhlKSAjIChlKVxuXHRcdFx0dDpfX3RvdWNoX18gPSB0b3VjaFxuXHRcdFx0dG91Y2hlcy5wdXNoKHRvdWNoKVxuXHRcdFx0Y291bnQrK1xuXHRcdFx0dG91Y2gudG91Y2hzdGFydChlLHQpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2htb3ZlIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2htb3ZlKGUsdClcblxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoZW5kIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hlbmQoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblxuXHRcdCMgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdCMgbm90IGFsd2F5cyBzdXBwb3J0ZWQhXG5cdFx0IyB0b3VjaGVzID0gdG91Y2hlcy5maWx0ZXIofHwpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hjYW5jZWwgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGNhbmNlbChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlZG93biBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vtb3ZlIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZXVwIGVcblx0XHRzZWxmXG5cblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgYWN0aXZlXG5cdHByb3AgZXZlbnRcblx0cHJvcCBwb2ludGVyXG5cdHByb3AgdGFyZ2V0XG5cdHByb3AgaGFuZGxlclxuXHRwcm9wIHVwZGF0ZXNcblx0cHJvcCBzdXBwcmVzc1xuXHRwcm9wIGRhdGFcblx0cHJvcCBidWJibGUgY2hhaW5hYmxlOiB5ZXNcblx0cHJvcCB0aW1lc3RhbXBcblxuXHRwcm9wIGdlc3R1cmVzXG5cblx0IyMjXG5cdEBpbnRlcm5hbFxuXHRAY29uc3RydWN0b3Jcblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIGV2ZW50LCBwb2ludGVyXG5cdFx0IyBAbmF0aXZlICA9IGZhbHNlXG5cdFx0c2VsZi5ldmVudCA9IGV2ZW50XG5cdFx0ZGF0YSA9IHt9XG5cdFx0YWN0aXZlID0geWVzXG5cdFx0QGJ1dHRvbiA9IGV2ZW50IGFuZCBldmVudDpidXR0b24gb3IgMFxuXHRcdEBzdXBwcmVzcyA9IG5vICMgZGVwcmVjYXRlZFxuXHRcdEBjYXB0dXJlZCA9IG5vXG5cdFx0YnViYmxlID0gbm9cblx0XHRwb2ludGVyID0gcG9pbnRlclxuXHRcdHVwZGF0ZXMgPSAwXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY2FwdHVyZVxuXHRcdEBjYXB0dXJlZCA9IHllc1xuXHRcdEBldmVudCBhbmQgQGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuXHRcdHVubGVzcyBAc2VsYmxvY2tlclxuXHRcdFx0QHNlbGJsb2NrZXIgPSBkbyB8ZXwgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgaXNDYXB0dXJlZFxuXHRcdCEhQGNhcHR1cmVkXG5cblx0IyMjXG5cdEV4dGVuZCB0aGUgdG91Y2ggd2l0aCBhIHBsdWdpbiAvIGdlc3R1cmUuIFxuXHRBbGwgZXZlbnRzICh0b3VjaHN0YXJ0LG1vdmUgZXRjKSBmb3IgdGhlIHRvdWNoXG5cdHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoZSBwbHVnaW5zIGluIHRoZSBvcmRlciB0aGV5XG5cdGFyZSBhZGRlZC5cblx0IyMjXG5cdGRlZiBleHRlbmQgcGx1Z2luXG5cdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGdlc3R1cmUhISFcIlxuXHRcdEBnZXN0dXJlcyB8fD0gW11cblx0XHRAZ2VzdHVyZXMucHVzaChwbHVnaW4pXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0b3VjaCB0byBzcGVjaWZpZWQgdGFyZ2V0LiBvbnRvdWNoc3RhcnQgd2lsbCBhbHdheXMgYmVcblx0Y2FsbGVkIG9uIHRoZSBuZXcgdGFyZ2V0LlxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0QHJlZGlyZWN0ID0gdGFyZ2V0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdXBwcmVzcyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIuIFdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCBmb3Jcblx0YWxsIG5hdGl2ZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdG91Y2guXG5cdCMjI1xuXHRkZWYgc3VwcHJlc3Ncblx0XHQjIGNvbGxpc2lvbiB3aXRoIHRoZSBzdXBwcmVzcyBwcm9wZXJ0eVxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgc3VwcHJlc3M9IHZhbHVlXG5cdFx0Y29uc29sZS53YXJuICdJbWJhLlRvdWNoI3N1cHByZXNzPSBpcyBkZXByZWNhdGVkJ1xuXHRcdEBzdXByZXNzID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoc3RhcnQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB0b3VjaCA9IHRcblx0XHRAYnV0dG9uID0gMFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2htb3ZlIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGVuZCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cblx0XHRJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXAgPSBlOnRpbWVTdGFtcFxuXG5cdFx0aWYgQG1heGRyIDwgMjBcblx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdGUucHJldmVudERlZmF1bHQgaWYgdGFwLkByZXNwb25kZXJcdFxuXG5cdFx0aWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdFxuXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGNhbmNlbCBlLHRcblx0XHRjYW5jZWxcblxuXHRkZWYgbW91c2Vkb3duIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAYnV0dG9uID0gZTpidXR0b25cblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2Vtb3ZlIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRAZXZlbnQgPSBlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBpc0NhcHR1cmVkXG5cdFx0dXBkYXRlXG5cdFx0bW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2V1cCBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkbGVcblx0XHR1cGRhdGVcblxuXHRkZWYgYmVnYW5cblx0XHRAdGltZXN0YW1wID0gRGF0ZS5ub3dcblx0XHRAbWF4ZHIgPSBAZHIgPSAwXG5cdFx0QHgwID0gQHhcblx0XHRAeTAgPSBAeVxuXG5cdFx0dmFyIGRvbSA9IGV2ZW50OnRhcmdldFxuXHRcdHZhciBub2RlID0gbnVsbFxuXG5cdFx0QHNvdXJjZVRhcmdldCA9IGRvbSBhbmQgdGFnKGRvbSlcblxuXHRcdHdoaWxlIGRvbVxuXHRcdFx0bm9kZSA9IHRhZyhkb20pXG5cdFx0XHRpZiBub2RlICYmIG5vZGU6b250b3VjaHN0YXJ0XG5cdFx0XHRcdEBidWJibGUgPSBub1xuXHRcdFx0XHR0YXJnZXQgPSBub2RlXG5cdFx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZilcblx0XHRcdFx0YnJlYWsgdW5sZXNzIEBidWJibGVcblx0XHRcdGRvbSA9IGRvbTpwYXJlbnROb2RlXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHR2YXIgZHIgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcblx0XHRAbWF4ZHIgPSBkciBpZiBkciA+IEBkclxuXHRcdEBkciA9IGRyXG5cblx0XHQjIGNhdGNoaW5nIGEgdG91Y2gtcmVkaXJlY3Q/IT9cblx0XHRpZiBAcmVkaXJlY3Rcblx0XHRcdGlmIEB0YXJnZXQgYW5kIEB0YXJnZXQ6b250b3VjaGNhbmNlbFxuXHRcdFx0XHRAdGFyZ2V0Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRcdHRhcmdldCA9IEByZWRpcmVjdFxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKSBpZiB0YXJnZXQ6b250b3VjaHN0YXJ0XG5cdFx0XHRyZXR1cm4gdXBkYXRlIGlmIEByZWRpcmVjdCAjIHBvc3NpYmx5IHJlZGlyZWN0aW5nIGFnYWluXG5cblxuXHRcdEB1cGRhdGVzKytcblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaHVwZGF0ZShzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaHVwZGF0ZShzZWxmKVxuXHRcdHVwZGF0ZSBpZiBAcmVkaXJlY3Rcblx0XHRzZWxmXG5cblx0ZGVmIG1vdmVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KSBpZiBnOm9udG91Y2htb3ZlXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KVxuXHRcdHNlbGZcblxuXHRkZWYgZW5kZWRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBjbGVhbnVwX1xuXHRcdGlmIEBtb3VzZW1vdmVcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0XG5cdFx0aWYgQHNlbGJsb2NrZXJcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRcdEBzZWxibG9ja2VyID0gbnVsbFxuXHRcdFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIGFic29sdXRlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgZnJvbSBzdGFydGluZyBwb3NpdGlvbiBcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGRyIGRvIEBkclxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBob3Jpem9udGFsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR4IGRvIEB4IC0gQHgwXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIHZlcnRpY2FsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR5IGRvIEB5IC0gQHkwXG5cblx0IyMjXG5cdEluaXRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeDAgZG8gQHgwXG5cblx0IyMjXG5cdEluaXRpYWwgdmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkwIGRvIEB5MFxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4IGRvIEB4XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5IGRvIEB5XG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eCBkb1xuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB4IC0gQHRhcmdldEJveDpsZWZ0XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHlcblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeSAtIEB0YXJnZXRCb3g6dG9wXG5cblx0IyMjXG5cdEJ1dHRvbiBwcmVzc2VkIGluIHRoaXMgdG91Y2guIE5hdGl2ZSB0b3VjaGVzIGRlZmF1bHRzIHRvIGxlZnQtY2xpY2sgKDApXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBidXR0b24gZG8gQGJ1dHRvbiAjIEBwb2ludGVyID8gQHBvaW50ZXIuYnV0dG9uIDogMFxuXG5cdGRlZiBzb3VyY2VUYXJnZXRcblx0XHRAc291cmNlVGFyZ2V0XG5cblx0ZGVmIGVsYXBzZWRcblx0XHREYXRlLm5vdyAtIEB0aW1lc3RhbXBcblxuXG5jbGFzcyBJbWJhLlRvdWNoR2VzdHVyZVxuXG5cdHByb3AgYWN0aXZlIGRlZmF1bHQ6IG5vXG5cblx0ZGVmIG9udG91Y2hzdGFydCBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNodXBkYXRlIGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2hlbmQgZVxuXHRcdHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnZhciBrZXlDb2RlcyA9IHtcblx0ZXNjOiAyNyxcblx0dGFiOiA5LFxuXHRlbnRlcjogMTMsXG5cdHNwYWNlOiAzMixcblx0dXA6IDM4LFxuXHRkb3duOiA0MFxufVxuXG52YXIgZWwgPSBJbWJhLlRhZzpwcm90b3R5cGVcbmRlZiBlbC5zdG9wTW9kaWZpZXIgZSBkbyBlLnN0b3AgfHwgdHJ1ZVxuZGVmIGVsLnByZXZlbnRNb2RpZmllciBlIGRvIGUucHJldmVudCB8fCB0cnVlXG5kZWYgZWwuc2lsZW5jZU1vZGlmaWVyIGUgZG8gZS5zaWxlbmNlIHx8IHRydWVcbmRlZiBlbC5idWJibGVNb2RpZmllciBlIGRvIGUuYnViYmxlKHllcykgfHwgdHJ1ZVxuZGVmIGVsLmN0cmxNb2RpZmllciBlIGRvIGUuZXZlbnQ6Y3RybEtleSA9PSB0cnVlXG5kZWYgZWwuYWx0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OmFsdEtleSA9PSB0cnVlXG5kZWYgZWwuc2hpZnRNb2RpZmllciBlIGRvIGUuZXZlbnQ6c2hpZnRLZXkgPT0gdHJ1ZVxuZGVmIGVsLm1ldGFNb2RpZmllciBlIGRvIGUuZXZlbnQ6bWV0YUtleSA9PSB0cnVlXG5kZWYgZWwua2V5TW9kaWZpZXIga2V5LCBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0ga2V5KSA6IHRydWVcbmRlZiBlbC5kZWxNb2RpZmllciBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0gOCBvciBlLmtleUNvZGUgPT0gNDYpIDogdHJ1ZVxuZGVmIGVsLnNlbGZNb2RpZmllciBlIGRvIGUuZXZlbnQ6dGFyZ2V0ID09IEBkb21cbmRlZiBlbC5sZWZ0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDApIDogZWwua2V5TW9kaWZpZXIoMzcsZSlcbmRlZiBlbC5yaWdodE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAyKSA6IGVsLmtleU1vZGlmaWVyKDM5LGUpXG5kZWYgZWwubWlkZGxlTW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDEpIDogdHJ1ZVxuXHRcbmRlZiBlbC5nZXRIYW5kbGVyIHN0ciwgZXZlbnRcblx0cmV0dXJuIHNlbGYgaWYgc2VsZltzdHJdXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgcHJlZml4XG5cdFxuXHRwcm9wIHNvdXJjZVxuXG5cdHByb3AgZGF0YVxuXG5cdHByb3AgcmVzcG9uZGVyXG5cblx0ZGVmIHNlbGYud3JhcCBlXG5cdFx0c2VsZi5uZXcoZSlcblx0XG5cdGRlZiBpbml0aWFsaXplIGVcblx0XHRldmVudCA9IGVcblx0XHRAYnViYmxlID0geWVzXG5cblx0ZGVmIHR5cGU9IHR5cGVcblx0XHRAdHlwZSA9IHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdEByZXR1cm4ge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IChjYXNlLWluc2Vuc2l0aXZlKVxuXHQjIyNcblx0ZGVmIHR5cGUgZG8gQHR5cGUgfHwgZXZlbnQ6dHlwZVxuXHRkZWYgbmF0aXZlIGRvIEBldmVudFxuXG5cdGRlZiBuYW1lXG5cdFx0QG5hbWUgfHw9IHR5cGUudG9Mb3dlckNhc2UucmVwbGFjZSgvXFw6L2csJycpXG5cblx0IyBtaW1jIGdldHNldFxuXHRkZWYgYnViYmxlIHZcblx0XHRpZiB2ICE9IHVuZGVmaW5lZFxuXHRcdFx0c2VsZi5idWJibGUgPSB2XG5cdFx0XHRyZXR1cm4gc2VsZlxuXHRcdHJldHVybiBAYnViYmxlXG5cblx0ZGVmIGJ1YmJsZT0gdlxuXHRcdEBidWJibGUgPSB2XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UHJldmVudHMgZnVydGhlciBwcm9wYWdhdGlvbiBvZiB0aGUgY3VycmVudCBldmVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzdG9wXG5cdFx0YnViYmxlID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIHN0b3BQcm9wYWdhdGlvbiBkbyBzdG9wXG5cdGRlZiBoYWx0IGRvIHN0b3BcblxuXHQjIG1pZ3JhdGUgZnJvbSBjYW5jZWwgdG8gcHJldmVudFxuXHRkZWYgcHJldmVudFxuXHRcdGlmIGV2ZW50OnByZXZlbnREZWZhdWx0XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdFxuXHRcdGVsc2Vcblx0XHRcdGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmOmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIHByZXZlbnREZWZhdWx0XG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjcHJldmVudERlZmF1bHQgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0IyMjXG5cdEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBldmVudC5jYW5jZWwgaGFzIGJlZW4gY2FsbGVkLlxuXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgaXNQcmV2ZW50ZWRcblx0XHRldmVudCBhbmQgZXZlbnQ6ZGVmYXVsdFByZXZlbnRlZCBvciBAY2FuY2VsXG5cblx0IyMjXG5cdENhbmNlbCB0aGUgZXZlbnQgKGlmIGNhbmNlbGFibGUpLiBJbiB0aGUgY2FzZSBvZiBuYXRpdmUgZXZlbnRzIGl0XG5cdHdpbGwgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSB3cmFwcGVkIGV2ZW50IG9iamVjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjYW5jZWxcblx0XHRjb25zb2xlLndhcm4gXCJFdmVudCNjYW5jZWwgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0ZGVmIHNpbGVuY2Vcblx0XHRAc2lsZW5jZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIGlzU2lsZW5jZWRcblx0XHQhIUBzaWxlbmNlZFxuXG5cdCMjI1xuXHRBIHJlZmVyZW5jZSB0byB0aGUgaW5pdGlhbCB0YXJnZXQgb2YgdGhlIGV2ZW50LlxuXHQjIyNcblx0ZGVmIHRhcmdldFxuXHRcdHRhZyhldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldClcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIG9iamVjdCByZXNwb25kaW5nIHRvIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiByZXNwb25kZXJcblx0XHRAcmVzcG9uZGVyXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRoZSBldmVudCB0byBuZXcgdGFyZ2V0XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3Qgbm9kZVxuXHRcdEByZWRpcmVjdCA9IG5vZGVcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBwcm9jZXNzSGFuZGxlcnMgbm9kZSwgaGFuZGxlcnNcblx0XHRsZXQgaSA9IDFcblx0XHRsZXQgbCA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdGxldCBidWJibGUgPSBAYnViYmxlXG5cdFx0bGV0IHN0YXRlID0gaGFuZGxlcnM6c3RhdGUgfHw9IHt9XG5cdFx0bGV0IHJlc3VsdCBcblx0XHRcblx0XHRpZiBidWJibGVcblx0XHRcdEBidWJibGUgPSAxXG5cblx0XHR3aGlsZSBpIDwgbFxuXHRcdFx0bGV0IGlzTW9kID0gZmFsc2Vcblx0XHRcdGxldCBoYW5kbGVyID0gaGFuZGxlcnNbaSsrXVxuXHRcdFx0bGV0IHBhcmFtcyAgPSBudWxsXG5cdFx0XHRsZXQgY29udGV4dCA9IG5vZGVcblx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgQXJyYXlcblx0XHRcdFx0cGFyYW1zID0gaGFuZGxlci5zbGljZSgxKVxuXHRcdFx0XHRoYW5kbGVyID0gaGFuZGxlclswXVxuXHRcdFx0XG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRpZiBrZXlDb2Rlc1toYW5kbGVyXVxuXHRcdFx0XHRcdHBhcmFtcyA9IFtrZXlDb2Rlc1toYW5kbGVyXV1cblx0XHRcdFx0XHRoYW5kbGVyID0gJ2tleSdcblx0XHRcdFx0XHRcblx0XHRcdFx0bGV0IG1vZCA9IGhhbmRsZXIgKyAnTW9kaWZpZXInXG5cblx0XHRcdFx0aWYgbm9kZVttb2RdXG5cdFx0XHRcdFx0aXNNb2QgPSB5ZXNcblx0XHRcdFx0XHRwYXJhbXMgPSAocGFyYW1zIG9yIFtdKS5jb25jYXQoW3NlbGYsc3RhdGVdKVxuXHRcdFx0XHRcdGhhbmRsZXIgPSBub2RlW21vZF1cblx0XHRcdFxuXHRcdFx0IyBpZiBpdCBpcyBzdGlsbCBhIHN0cmluZyAtIGNhbGwgZ2V0SGFuZGxlciBvblxuXHRcdFx0IyBhbmNlc3RvciBvZiBub2RlIHRvIHNlZSBpZiB3ZSBnZXQgYSBoYW5kbGVyIGZvciB0aGlzIG5hbWVcblx0XHRcdGlmIHR5cGVvZiBoYW5kbGVyID09ICdzdHJpbmcnXG5cdFx0XHRcdGxldCBlbCA9IG5vZGVcblx0XHRcdFx0bGV0IGZuID0gbnVsbFxuXHRcdFx0XHRsZXQgY3R4ID0gc3RhdGU6Y29udGV4dFxuXHRcblx0XHRcdFx0aWYgY3R4XG5cdFx0XHRcdFx0aWYgY3R4OmdldEhhbmRsZXIgaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRjdHggPSBjdHguZ2V0SGFuZGxlcihoYW5kbGVyLHNlbGYpXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgY3R4W2hhbmRsZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuID0gY3R4W2hhbmRsZXJdXG5cdFx0XHRcdFx0XHRjb250ZXh0ID0gY3R4XG5cblx0XHRcdFx0dW5sZXNzIGZuXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuIFwiZXZlbnQge3R5cGV9OiBjb3VsZCBub3QgZmluZCAne2hhbmRsZXJ9JyBpbiBjb250ZXh0XCIsY3R4XG5cblx0XHRcdFx0IyB3aGlsZSBlbCBhbmQgKCFmbiBvciAhKGZuIGlzYSBGdW5jdGlvbikpXG5cdFx0XHRcdCMgXHRpZiBmbiA9IGVsLmdldEhhbmRsZXIoaGFuZGxlcilcblx0XHRcdFx0IyBcdFx0aWYgZm5baGFuZGxlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgXHRcdFx0aGFuZGxlciA9IGZuW2hhbmRsZXJdXG5cdFx0XHRcdCMgXHRcdFx0Y29udGV4dCA9IGZuXG5cdFx0XHRcdCMgXHRcdGVsaWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgXHRcdFx0aGFuZGxlciA9IGZuXG5cdFx0XHRcdCMgXHRcdFx0Y29udGV4dCA9IGVsXG5cdFx0XHRcdCMgXHRlbHNlXG5cdFx0XHRcdCMgXHRcdGVsID0gZWwucGFyZW50XG5cdFx0XHRcdFx0XG5cdFx0XHRpZiBoYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIHdoYXQgaWYgd2UgYWN0dWFsbHkgY2FsbCBzdG9wIGluc2lkZSBmdW5jdGlvbj9cblx0XHRcdFx0IyBkbyB3ZSBzdGlsbCB3YW50IHRvIGNvbnRpbnVlIHRoZSBjaGFpbj9cblx0XHRcdFx0bGV0IHJlcyA9IGhhbmRsZXIuYXBwbHkoY29udGV4dCxwYXJhbXMgb3IgW3NlbGZdKVxuXG5cdFx0XHRcdGlmICFpc01vZFxuXHRcdFx0XHRcdEByZXNwb25kZXIgfHw9IG5vZGVcblxuXHRcdFx0XHRpZiByZXMgPT0gZmFsc2Vcblx0XHRcdFx0XHQjIGNvbnNvbGUubG9nIFwicmV0dXJuZWQgZmFsc2UgLSBicmVha2luZ1wiXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRpZiByZXMgYW5kICFAc2lsZW5jZWQgYW5kIHJlczp0aGVuIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdHJlcy50aGVuKEltYmE6Y29tbWl0KVxuXHRcdFxuXHRcdCMgaWYgd2UgaGF2ZW50IHN0b3BwZWQgb3IgZGVhbHQgd2l0aCBidWJibGUgd2hpbGUgaGFuZGxpbmdcblx0XHRpZiBAYnViYmxlID09PSAxXG5cdFx0XHRAYnViYmxlID0gYnViYmxlXG5cblx0XHRyZXR1cm4gbnVsbFxuXG5cdGRlZiBwcm9jZXNzXG5cdFx0dmFyIG5hbWUgPSBzZWxmLm5hbWVcblx0XHR2YXIgbWV0aCA9IFwib257QHByZWZpeCBvciAnJ317bmFtZX1cIlxuXHRcdHZhciBhcmdzID0gbnVsbFxuXHRcdHZhciBkb210YXJnZXQgPSBldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldFx0XHRcblx0XHR2YXIgZG9tbm9kZSA9IGRvbXRhcmdldDpfcmVzcG9uZGVyIG9yIGRvbXRhcmdldFxuXHRcdCMgQHRvZG8gbmVlZCB0byBzdG9wIGluZmluaXRlIHJlZGlyZWN0LXJ1bGVzIGhlcmVcblx0XHR2YXIgcmVzdWx0XG5cdFx0dmFyIGhhbmRsZXJzXG5cblx0XHR3aGlsZSBkb21ub2RlXG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHRsZXQgbm9kZSA9IGRvbW5vZGUuQGRvbSA/IGRvbW5vZGUgOiBkb21ub2RlLkB0YWdcblxuXHRcdFx0aWYgbm9kZVxuXHRcdFx0XHRpZiBoYW5kbGVycyA9IG5vZGU6X29uX1xuXHRcdFx0XHRcdGZvciBoYW5kbGVyIGluIGhhbmRsZXJzIHdoZW4gaGFuZGxlclxuXHRcdFx0XHRcdFx0bGV0IGhuYW1lID0gaGFuZGxlclswXVxuXHRcdFx0XHRcdFx0aWYgbmFtZSA9PSBoYW5kbGVyWzBdIGFuZCBidWJibGVcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc0hhbmRsZXJzKG5vZGUsaGFuZGxlcilcblx0XHRcdFx0XHRicmVhayB1bmxlc3MgYnViYmxlXG5cblx0XHRcdFx0aWYgYnViYmxlIGFuZCBub2RlW21ldGhdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdEByZXNwb25kZXIgfHw9IG5vZGVcblx0XHRcdFx0XHRAc2lsZW5jZWQgPSBub1xuXHRcdFx0XHRcdHJlc3VsdCA9IGFyZ3MgPyBub2RlW21ldGhdLmFwcGx5KG5vZGUsYXJncykgOiBub2RlW21ldGhdKHNlbGYsZGF0YSlcblxuXHRcdFx0XHRpZiBub2RlOm9uZXZlbnRcblx0XHRcdFx0XHRub2RlLm9uZXZlbnQoc2VsZilcblxuXHRcdFx0IyBhZGQgbm9kZS5uZXh0RXZlbnRSZXNwb25kZXIgYXMgYSBzZXBhcmF0ZSBtZXRob2QgaGVyZT9cblx0XHRcdHVubGVzcyBidWJibGUgYW5kIGRvbW5vZGUgPSAoQHJlZGlyZWN0IG9yIChub2RlID8gbm9kZS5wYXJlbnQgOiBkb21ub2RlOnBhcmVudE5vZGUpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0cHJvY2Vzc2VkXG5cblx0XHQjIGlmIGEgaGFuZGxlciByZXR1cm5zIGEgcHJvbWlzZSwgbm90aWZ5IHNjaGVkdWxlcnNcblx0XHQjIGFib3V0IHRoaXMgYWZ0ZXIgcHJvbWlzZSBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZ1xuXHRcdGlmIHJlc3VsdCBhbmQgcmVzdWx0OnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXN1bHQudGhlbihzZWxmOnByb2Nlc3NlZC5iaW5kKHNlbGYpKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgcHJvY2Vzc2VkXG5cdFx0aWYgIUBzaWxlbmNlZCBhbmQgQHJlc3BvbmRlclxuXHRcdFx0SW1iYS5lbWl0KEltYmEsJ2V2ZW50Jyxbc2VsZl0pXG5cdFx0XHRJbWJhLmNvbW1pdChldmVudClcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJldHVybiB0aGUgeC9sZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIG1vdXNlIC8gcG9pbnRlciBmb3IgdGhpcyBldmVudFxuXHRAcmV0dXJuIHtOdW1iZXJ9IHggY29vcmRpbmF0ZSBvZiBtb3VzZSAvIHBvaW50ZXIgZm9yIGV2ZW50XG5cdCMjI1xuXHRkZWYgeCBkbyBuYXRpdmU6eFxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHkvdG9wIGNvb3JkaW5hdGUgb2YgdGhlIG1vdXNlIC8gcG9pbnRlciBmb3IgdGhpcyBldmVudFxuXHRAcmV0dXJuIHtOdW1iZXJ9IHkgY29vcmRpbmF0ZSBvZiBtb3VzZSAvIHBvaW50ZXIgZm9yIGV2ZW50XG5cdCMjI1xuXHRkZWYgeSBkbyBuYXRpdmU6eVxuXHRcdFxuXHRkZWYgYnV0dG9uIGRvIG5hdGl2ZTpidXR0b25cblx0ZGVmIGtleUNvZGUgZG8gbmF0aXZlOmtleUNvZGVcblx0ZGVmIGN0cmwgZG8gbmF0aXZlOmN0cmxLZXlcblx0ZGVmIGFsdCBkbyBuYXRpdmU6YWx0S2V5XG5cdGRlZiBzaGlmdCBkbyBuYXRpdmU6c2hpZnRLZXlcblx0ZGVmIG1ldGEgZG8gbmF0aXZlOm1ldGFLZXlcblx0ZGVmIGtleSBkbyBuYXRpdmU6a2V5XG5cblx0IyMjXG5cdFJldHVybnMgYSBOdW1iZXIgcmVwcmVzZW50aW5nIGEgc3lzdGVtIGFuZCBpbXBsZW1lbnRhdGlvblxuXHRkZXBlbmRlbnQgbnVtZXJpYyBjb2RlIGlkZW50aWZ5aW5nIHRoZSB1bm1vZGlmaWVkIHZhbHVlIG9mIHRoZVxuXHRwcmVzc2VkIGtleTsgdGhpcyBpcyB1c3VhbGx5IHRoZSBzYW1lIGFzIGtleUNvZGUuXG5cblx0Rm9yIG1vdXNlLWV2ZW50cywgdGhlIHJldHVybmVkIHZhbHVlIGluZGljYXRlcyB3aGljaCBidXR0b24gd2FzXG5cdHByZXNzZWQgb24gdGhlIG1vdXNlIHRvIHRyaWdnZXIgdGhlIGV2ZW50LlxuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB3aGljaCBkbyBldmVudDp3aGljaFxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcbnJlcXVpcmUoXCIuL3BvaW50ZXJcIilcblxuIyMjXG5cbk1hbmFnZXIgZm9yIGxpc3RlbmluZyB0byBhbmQgZGVsZWdhdGluZyBldmVudHMgaW4gSW1iYS4gQSBzaW5nbGUgaW5zdGFuY2VcbmlzIGFsd2F5cyBjcmVhdGVkIGJ5IEltYmEgKGFzIGBJbWJhLkV2ZW50c2ApLCB3aGljaCBoYW5kbGVzIGFuZCBkZWxlZ2F0ZXMgYWxsXG5ldmVudHMgYXQgdGhlIHZlcnkgcm9vdCBvZiB0aGUgZG9jdW1lbnQuIEltYmEgZG9lcyBub3QgY2FwdHVyZSBhbGwgZXZlbnRzXG5ieSBkZWZhdWx0LCBzbyBpZiB5b3Ugd2FudCB0byBtYWtlIHN1cmUgZXhvdGljIG9yIGN1c3RvbSBET01FdmVudHMgYXJlIGRlbGVnYXRlZFxuaW4gSW1iYSB5b3Ugd2lsbCBuZWVkIHRvIHJlZ2lzdGVyIHRoZW0gaW4gYEltYmEuRXZlbnRzLnJlZ2lzdGVyKG15Q3VzdG9tRXZlbnROYW1lKWBcblxuQGluYW1lIG1hbmFnZXJcblxuIyMjXG5jbGFzcyBJbWJhLkV2ZW50TWFuYWdlclxuXG5cdHByb3Agcm9vdFxuXHRwcm9wIGNvdW50XG5cdHByb3AgZW5hYmxlZCBkZWZhdWx0OiBubywgd2F0Y2g6IHllc1xuXHRwcm9wIGxpc3RlbmVyc1xuXHRwcm9wIGRlbGVnYXRvcnNcblx0cHJvcCBkZWxlZ2F0b3JcblxuXHRkZWYgZW5hYmxlZC1kaWQtc2V0IGJvb2xcblx0XHRib29sID8gb25lbmFibGUgOiBvbmRpc2FibGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYuYWN0aXZhdGVcblx0XHRyZXR1cm4gSW1iYS5FdmVudHMgaWYgSW1iYS5FdmVudHNcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHRJbWJhLlBPSU5URVIgfHw9IEltYmEuUG9pbnRlci5uZXdcblxuXHRcdFx0SW1iYS5FdmVudHMgPSBJbWJhLkV2ZW50TWFuYWdlci5uZXcoSW1iYS5kb2N1bWVudCwgZXZlbnRzOiBbXG5cdFx0XHRcdDprZXlkb3duLCA6a2V5dXAsIDprZXlwcmVzcyxcblx0XHRcdFx0OnRleHRJbnB1dCwgOmlucHV0LCA6Y2hhbmdlLCA6c3VibWl0LFxuXHRcdFx0XHQ6Zm9jdXNpbiwgOmZvY3Vzb3V0LCA6Zm9jdXMsIDpibHVyLFxuXHRcdFx0XHQ6Y29udGV4dG1lbnUsIDpkYmxjbGljayxcblx0XHRcdFx0Om1vdXNld2hlZWwsIDp3aGVlbCwgOnNjcm9sbCxcblx0XHRcdFx0OmJlZm9yZWNvcHksIDpjb3B5LFxuXHRcdFx0XHQ6YmVmb3JlcGFzdGUsIDpwYXN0ZSxcblx0XHRcdFx0OmJlZm9yZWN1dCwgOmN1dFxuXHRcdFx0XSlcblxuXHRcdFx0IyBzaG91bGQgbGlzdGVuIHRvIGRyYWdkcm9wIGV2ZW50cyBieSBkZWZhdWx0XG5cdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihbXG5cdFx0XHRcdDpkcmFnc3RhcnQsOmRyYWcsOmRyYWdlbmQsXG5cdFx0XHRcdDpkcmFnZW50ZXIsOmRyYWdvdmVyLDpkcmFnbGVhdmUsOmRyYWdleGl0LDpkcm9wXG5cdFx0XHRdKVxuXG5cdFx0XHR2YXIgaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cgJiYgd2luZG93Om9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkXG5cblx0XHRcdGlmIGhhc1RvdWNoRXZlbnRzXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hzdGFydCkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNoc3RhcnQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNobW92ZSkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNobW92ZShlKVxuXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hlbmQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaGVuZChlKVxuXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hjYW5jZWwpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaGNhbmNlbChlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3Rlcig6Y2xpY2spIGRvIHxlfFxuXHRcdFx0XHQjIE9ubHkgZm9yIG1haW4gbW91c2VidXR0b24sIG5vP1xuXHRcdFx0XHRpZiAoZTp0aW1lU3RhbXAgLSBJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXApID4gSW1iYS5Ub3VjaC5UYXBUaW1lb3V0XG5cdFx0XHRcdFx0ZS5AaW1iYVNpbXVsYXRlZFRhcCA9IHllc1xuXHRcdFx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdFx0XHR0YXAucHJvY2Vzc1xuXHRcdFx0XHRcdGlmIHRhcC5AcmVzcG9uZGVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0XHQjIGRlbGVnYXRlIHRoZSByZWFsIGNsaWNrIGV2ZW50XG5cdFx0XHRcdEltYmEuRXZlbnRzLmRlbGVnYXRlKGUpXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2Vkb3duKSBkbyB8ZXxcblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuXHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDptb3VzZXVwKSBkbyB8ZXxcblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoWzptb3VzZWRvd24sOm1vdXNldXBdKVxuXHRcdFx0SW1iYS5FdmVudHMuZW5hYmxlZCA9IHllc1xuXHRcdFx0cmV0dXJuIEltYmEuRXZlbnRzXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBldmVudHM6IFtdXG5cdFx0QHNoaW1Gb2N1c0V2ZW50cyA9ICR3ZWIkICYmIHdpbmRvdzpuZXRzY2FwZSAmJiBub2RlOm9uZm9jdXNpbiA9PT0gdW5kZWZpbmVkXG5cdFx0cm9vdCA9IG5vZGVcblx0XHRsaXN0ZW5lcnMgPSBbXVxuXHRcdGRlbGVnYXRvcnMgPSB7fVxuXHRcdGRlbGVnYXRvciA9IGRvIHxlfCBcblx0XHRcdGRlbGVnYXRlKGUpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0Zm9yIGV2ZW50IGluIGV2ZW50c1xuXHRcdFx0cmVnaXN0ZXIoZXZlbnQpXG5cblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXG5cdFRlbGwgdGhlIGN1cnJlbnQgRXZlbnRNYW5hZ2VyIHRvIGludGVyY2VwdCBhbmQgaGFuZGxlIGV2ZW50IG9mIGEgY2VydGFpbiBuYW1lLlxuXHRCeSBkZWZhdWx0LCBJbWJhLkV2ZW50cyB3aWxsIHJlZ2lzdGVyIGludGVyY2VwdG9ycyBmb3I6ICprZXlkb3duKiwgKmtleXVwKiwgXG5cdCprZXlwcmVzcyosICp0ZXh0SW5wdXQqLCAqaW5wdXQqLCAqY2hhbmdlKiwgKnN1Ym1pdCosICpmb2N1c2luKiwgKmZvY3Vzb3V0KiwgXG5cdCpibHVyKiwgKmNvbnRleHRtZW51KiwgKmRibGNsaWNrKiwgKm1vdXNld2hlZWwqLCAqd2hlZWwqXG5cblx0IyMjXG5cdGRlZiByZWdpc3RlciBuYW1lLCBoYW5kbGVyID0gdHJ1ZVxuXHRcdGlmIG5hbWUgaXNhIEFycmF5XG5cdFx0XHRyZWdpc3Rlcih2LGhhbmRsZXIpIGZvciB2IGluIG5hbWVcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRyZXR1cm4gc2VsZiBpZiBkZWxlZ2F0b3JzW25hbWVdXG5cdFx0IyBjb25zb2xlLmxvZyhcInJlZ2lzdGVyIGZvciBldmVudCB7bmFtZX1cIilcblx0XHR2YXIgZm4gPSBkZWxlZ2F0b3JzW25hbWVdID0gaGFuZGxlciBpc2EgRnVuY3Rpb24gPyBoYW5kbGVyIDogZGVsZWdhdG9yXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsZm4seWVzKSBpZiBlbmFibGVkXG5cblx0ZGVmIGxpc3RlbiBuYW1lLCBoYW5kbGVyLCBjYXB0dXJlID0geWVzXG5cdFx0bGlzdGVuZXJzLnB1c2goW25hbWUsaGFuZGxlcixjYXB0dXJlXSlcblx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLGNhcHR1cmUpIGlmIGVuYWJsZWRcblx0XHRzZWxmXG5cblx0ZGVmIGRlbGVnYXRlIGVcblx0XHR2YXIgZXZlbnQgPSBJbWJhLkV2ZW50LndyYXAoZSlcblx0XHRldmVudC5wcm9jZXNzXG5cdFx0aWYgQHNoaW1Gb2N1c0V2ZW50c1xuXHRcdFx0aWYgZTp0eXBlID09ICdmb2N1cydcblx0XHRcdFx0SW1iYS5FdmVudC53cmFwKGUpLnNldFR5cGUoJ2ZvY3VzaW4nKS5wcm9jZXNzXG5cdFx0XHRlbGlmIGU6dHlwZSA9PSAnYmx1cidcblx0XHRcdFx0SW1iYS5FdmVudC53cmFwKGUpLnNldFR5cGUoJ2ZvY3Vzb3V0JykucHJvY2Vzc1xuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDcmVhdGUgYSBuZXcgSW1iYS5FdmVudFxuXG5cdCMjI1xuXHRkZWYgY3JlYXRlIHR5cGUsIHRhcmdldCwgZGF0YTogbnVsbCwgc291cmNlOiBudWxsXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwIHR5cGU6IHR5cGUsIHRhcmdldDogdGFyZ2V0XG5cdFx0ZXZlbnQuZGF0YSA9IGRhdGEgaWYgZGF0YVxuXHRcdGV2ZW50LnNvdXJjZSA9IHNvdXJjZSBpZiBzb3VyY2Vcblx0XHRldmVudFxuXG5cdCMjI1xuXG5cdFRyaWdnZXIgLyBwcm9jZXNzIGFuIEltYmEuRXZlbnQuXG5cblx0IyMjXG5cdGRlZiB0cmlnZ2VyXG5cdFx0Y3JlYXRlKCphcmd1bWVudHMpLnByb2Nlc3NcblxuXHRkZWYgb25lbmFibGVcblx0XHRmb3Igb3duIG5hbWUsaGFuZGxlciBvZiBkZWxlZ2F0b3JzXG5cdFx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLHllcylcblxuXHRcdGZvciBpdGVtIGluIGxpc3RlbmVyc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKGl0ZW1bMF0saXRlbVsxXSxpdGVtWzJdKVxuXHRcdFx0XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLEltYmE6Y29tbWl0KVxuXHRcdHNlbGZcblxuXHRkZWYgb25kaXNhYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LW1hbmFnZXIuaW1iYSIsImV4dGVybiBuYXZpZ2F0b3JcblxudmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5kZWYgcmVtb3ZlTmVzdGVkIHJvb3QsIG5vZGUsIGNhcmV0XG5cdCMgaWYgbm9kZS9ub2RlcyBpc2EgU3RyaW5nXG5cdCMgXHR3ZSBuZWVkIHRvIHVzZSB0aGUgY2FyZXQgdG8gcmVtb3ZlIGVsZW1lbnRzXG5cdCMgXHRmb3Igbm93IHdlIHdpbGwgc2ltcGx5IG5vdCBzdXBwb3J0IHRoaXNcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxtZW1iZXIsY2FyZXQpIGZvciBtZW1iZXIgaW4gbm9kZVxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGxcblx0XHQjIHdoYXQgaWYgdGhpcyBpcyBub3QgbnVsbD8hPyE/XG5cdFx0IyB0YWtlIGEgY2hhbmNlIGFuZCByZW1vdmUgYSB0ZXh0LWVsZW1lbnRuZ1xuXHRcdGxldCBuZXh0ID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0aWYgbmV4dCBpc2EgVGV4dCBhbmQgbmV4dDp0ZXh0Q29udGVudCA9PSBub2RlXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5leHQpXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgJ2Nhbm5vdCByZW1vdmUgc3RyaW5nJ1xuXG5cdHJldHVybiBjYXJldFxuXG5kZWYgYXBwZW5kTmVzdGVkIHJvb3QsIG5vZGVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZVtpKytdKSB3aGlsZSBpIDwga1xuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGwgYW5kIG5vZGUgIT09IGZhbHNlXG5cdFx0cm9vdC5hcHBlbmRDaGlsZCBJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0cmV0dXJuXG5cblxuIyBpbnNlcnQgbm9kZXMgYmVmb3JlIGEgY2VydGFpbiBub2RlXG4jIGRvZXMgbm90IG5lZWQgdG8gcmV0dXJuIGFueSB0YWlsLCBhcyBiZWZvcmVcbiMgd2lsbCBzdGlsbCBiZSBjb3JyZWN0IHRoZXJlXG4jIGJlZm9yZSBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQmVmb3JlIHJvb3QsIG5vZGUsIGJlZm9yZVxuXHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdGxldCBpID0gMFxuXHRcdGxldCBjID0gbm9kZTp0YWdsZW5cblx0XHRsZXQgayA9IGMgIT0gbnVsbCA/IChub2RlOmRvbWxlbiA9IGMpIDogbm9kZTpsZW5ndGhcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlW2krK10sYmVmb3JlKSB3aGlsZSBpIDwga1xuXG5cdGVsaWYgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0cm9vdC5pbnNlcnRCZWZvcmUobm9kZSxiZWZvcmUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSksYmVmb3JlKVxuXG5cdHJldHVybiBiZWZvcmVcblxuIyBhZnRlciBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQWZ0ZXIgcm9vdCwgbm9kZSwgYWZ0ZXJcblx0dmFyIGJlZm9yZSA9IGFmdGVyID8gYWZ0ZXI6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGlmIGJlZm9yZVxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG5vZGUsYmVmb3JlKVxuXHRcdHJldHVybiBiZWZvcmU6cHJldmlvdXNTaWJsaW5nXG5cdGVsc2Vcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxub2RlKVxuXHRcdHJldHVybiByb290LkBkb206bGFzdENoaWxkXG5cbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHR2YXIgbmV3TGVuID0gbmV3Omxlbmd0aFxuXHR2YXIgbGFzdE5ldyA9IG5ld1tuZXdMZW4gLSAxXVxuXG5cdCMgVGhpcyByZS1vcmRlciBhbGdvcml0aG0gaXMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBwcmluY2lwbGU6XG5cdCMgXG5cdCMgV2UgYnVpbGQgYSBcImNoYWluXCIgd2hpY2ggc2hvd3Mgd2hpY2ggaXRlbXMgYXJlIGFscmVhZHkgc29ydGVkLlxuXHQjIElmIHdlJ3JlIGdvaW5nIGZyb20gWzEsIDIsIDNdIC0+IFsyLCAxLCAzXSwgdGhlIHRyZWUgbG9va3MgbGlrZTpcblx0I1xuXHQjIFx0MyAtPiAgMCAoaWR4KVxuXHQjIFx0MiAtPiAtMSAoaWR4KVxuXHQjIFx0MSAtPiAtMSAoaWR4KVxuXHQjXG5cdCMgVGhpcyB0ZWxscyB1cyB0aGF0IHdlIGhhdmUgdHdvIGNoYWlucyBvZiBvcmRlcmVkIGl0ZW1zOlxuXHQjIFxuXHQjIFx0KDEsIDMpIGFuZCAoMilcblx0IyBcblx0IyBUaGUgb3B0aW1hbCByZS1vcmRlcmluZyB0aGVuIGJlY29tZXMgdG8ga2VlcCB0aGUgbG9uZ2VzdCBjaGFpbiBpbnRhY3QsXG5cdCMgYW5kIG1vdmUgYWxsIHRoZSBvdGhlciBpdGVtcy5cblxuXHR2YXIgbmV3UG9zaXRpb24gPSBbXVxuXG5cdCMgVGhlIHRyZWUvZ3JhcGggaXRzZWxmXG5cdHZhciBwcmV2Q2hhaW4gPSBbXVxuXHQjIFRoZSBsZW5ndGggb2YgdGhlIGNoYWluXG5cdHZhciBsZW5ndGhDaGFpbiA9IFtdXG5cblx0IyBLZWVwIHRyYWNrIG9mIHRoZSBsb25nZXN0IGNoYWluXG5cdHZhciBtYXhDaGFpbkxlbmd0aCA9IDBcblx0dmFyIG1heENoYWluRW5kID0gMFxuXG5cdHZhciBoYXNUZXh0Tm9kZXMgPSBub1xuXHR2YXIgbmV3UG9zXG5cblx0Zm9yIG5vZGUsIGlkeCBpbiBvbGRcblx0XHQjIHNwZWNpYWwgY2FzZSBmb3IgVGV4dCBub2Rlc1xuXHRcdGlmIG5vZGUgYW5kIG5vZGU6bm9kZVR5cGUgPT0gM1xuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZTp0ZXh0Q29udGVudClcblx0XHRcdG5ld1tuZXdQb3NdID0gbm9kZSBpZiBuZXdQb3MgPj0gMFxuXHRcdFx0aGFzVGV4dE5vZGVzID0geWVzXG5cdFx0ZWxzZVxuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZSlcblxuXHRcdG5ld1Bvc2l0aW9uLnB1c2gobmV3UG9zKVxuXG5cdFx0aWYgbmV3UG9zID09IC0xXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdFx0XHRwcmV2Q2hhaW4ucHVzaCgtMSlcblx0XHRcdGxlbmd0aENoYWluLnB1c2goLTEpXG5cdFx0XHRjb250aW51ZVxuXG5cdFx0dmFyIHByZXZJZHggPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAyXG5cblx0XHQjIEJ1aWxkIHRoZSBjaGFpbjpcblx0XHR3aGlsZSBwcmV2SWR4ID49IDBcblx0XHRcdGlmIG5ld1Bvc2l0aW9uW3ByZXZJZHhdID09IC0xXG5cdFx0XHRcdHByZXZJZHgtLVxuXHRcdFx0ZWxpZiBuZXdQb3MgPiBuZXdQb3NpdGlvbltwcmV2SWR4XVxuXHRcdFx0XHQjIFlheSwgd2UncmUgYmlnZ2VyIHRoYW4gdGhlIHByZXZpb3VzIVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIE5vcGUsIGxldCdzIHdhbGsgYmFjayB0aGUgY2hhaW5cblx0XHRcdFx0cHJldklkeCA9IHByZXZDaGFpbltwcmV2SWR4XVxuXG5cdFx0cHJldkNoYWluLnB1c2gocHJldklkeClcblxuXHRcdHZhciBjdXJyTGVuZ3RoID0gKHByZXZJZHggPT0gLTEpID8gMCA6IGxlbmd0aENoYWluW3ByZXZJZHhdKzFcblxuXHRcdGlmIGN1cnJMZW5ndGggPiBtYXhDaGFpbkxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5MZW5ndGggPSBjdXJyTGVuZ3RoXG5cdFx0XHRtYXhDaGFpbkVuZCA9IGlkeFxuXG5cdFx0bGVuZ3RoQ2hhaW4ucHVzaChjdXJyTGVuZ3RoKVxuXG5cdHZhciBzdGlja3lOb2RlcyA9IFtdXG5cblx0IyBOb3cgd2UgY2FuIHdhbGsgdGhlIGxvbmdlc3QgY2hhaW4gYmFja3dhcmRzIGFuZCBtYXJrIHRoZW0gYXMgXCJzdGlja3lcIixcblx0IyB3aGljaCBpbXBsaWVzIHRoYXQgdGhleSBzaG91bGQgbm90IGJlIG1vdmVkXG5cdHZhciBjdXJzb3IgPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAxXG5cdHdoaWxlIGN1cnNvciA+PSAwXG5cdFx0aWYgY3Vyc29yID09IG1heENoYWluRW5kIGFuZCBuZXdQb3NpdGlvbltjdXJzb3JdICE9IC0xXG5cdFx0XHRzdGlja3lOb2Rlc1tuZXdQb3NpdGlvbltjdXJzb3JdXSA9IHRydWVcblx0XHRcdG1heENoYWluRW5kID0gcHJldkNoYWluW21heENoYWluRW5kXVxuXG5cdFx0Y3Vyc29yIC09IDFcblxuXHQjIHBvc3NpYmxlIHRvIGRvIHRoaXMgaW4gcmV2ZXJzZWQgb3JkZXIgaW5zdGVhZD9cblx0Zm9yIG5vZGUsIGlkeCBpbiBuZXdcblx0XHRpZiAhc3RpY2t5Tm9kZXNbaWR4XVxuXHRcdFx0IyBjcmVhdGUgdGV4dG5vZGUgZm9yIHN0cmluZywgYW5kIHVwZGF0ZSB0aGUgYXJyYXlcblx0XHRcdHVubGVzcyBub2RlIGFuZCBub2RlLkBkb21cblx0XHRcdFx0bm9kZSA9IG5ld1tpZHhdID0gSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0XHR2YXIgYWZ0ZXIgPSBuZXdbaWR4IC0gMV1cblx0XHRcdGluc2VydE5lc3RlZEFmdGVyKHJvb3QsIG5vZGUsIChhZnRlciBhbmQgYWZ0ZXIuQGRvbSBvciBhZnRlciBvciBjYXJldCkpXG5cblx0XHRjYXJldCA9IG5vZGUuQGRvbSBvciAoY2FyZXQgYW5kIGNhcmV0Om5leHRTaWJsaW5nIG9yIHJvb3QuQGRvbTpmaXJzdENoaWxkKVxuXG5cdCMgc2hvdWxkIHRydXN0IHRoYXQgdGhlIGxhc3QgaXRlbSBpbiBuZXcgbGlzdCBpcyB0aGUgY2FyZXRcblx0cmV0dXJuIGxhc3ROZXcgYW5kIGxhc3ROZXcuQGRvbSBvciBjYXJldFxuXG5cbiMgZXhwZWN0cyBhIGZsYXQgbm9uLXNwYXJzZSBhcnJheSBvZiBub2RlcyBpbiBib3RoIG5ldyBhbmQgb2xkLCBhbHdheXNcbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXHR2YXIgayA9IG5ldzpsZW5ndGhcblx0dmFyIGkgPSBrXG5cdHZhciBsYXN0ID0gbmV3W2sgLSAxXVxuXG5cblx0aWYgayA9PSBvbGQ6bGVuZ3RoIGFuZCBuZXdbMF0gPT09IG9sZFswXVxuXHRcdCMgcnVubmluZyB0aHJvdWdoIHRvIGNvbXBhcmVcblx0XHR3aGlsZSBpLS1cblx0XHRcdGJyZWFrIGlmIG5ld1tpXSAhPT0gb2xkW2ldXG5cblx0aWYgaSA9PSAtMVxuXHRcdHJldHVybiBsYXN0IGFuZCBsYXN0LkBkb20gb3IgbGFzdCBvciBjYXJldFxuXHRlbHNlXG5cdFx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBUWVBFIDUgLSB3ZSBrbm93IHRoYXQgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbmdsZSBhcnJheSBvZlxuIyBrZXllZCB0YWdzIC0gYW5kIHJvb3QgaGFzIG5vIG90aGVyIGNoaWxkcmVuXG5kZWYgcmVjb25jaWxlTG9vcCByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIG5sID0gbmV3Omxlbmd0aFxuXHR2YXIgb2wgPSBvbGQ6bGVuZ3RoXG5cdHZhciBjbCA9IG5ldzpjYWNoZTppJCAjIGNhY2hlLWxlbmd0aFxuXHR2YXIgaSA9IDAsIGQgPSBubCAtIG9sXG5cblx0IyBmaW5kIHRoZSBmaXJzdCBpbmRleCB0aGF0IGlzIGRpZmZlcmVudFxuXHRpKysgd2hpbGUgaSA8IG9sIGFuZCBpIDwgbmwgYW5kIG5ld1tpXSA9PT0gb2xkW2ldXG5cdFxuXHQjIGNvbmRpdGlvbmFsbHkgcHJ1bmUgY2FjaGVcblx0aWYgY2wgPiAxMDAwIGFuZCAoY2wgLSBubCkgPiA1MDBcblx0XHRuZXc6Y2FjaGU6JHBydW5lKG5ldylcblx0XG5cdGlmIGQgPiAwIGFuZCBpID09IG9sXG5cdFx0IyBhZGRlZCBhdCBlbmRcblx0XHRyb290LmFwcGVuZENoaWxkKG5ld1tpKytdKSB3aGlsZSBpIDwgbmxcblx0XHRyZXR1cm5cblx0XG5cdGVsaWYgZCA+IDBcblx0XHRsZXQgaTEgPSBubFxuXHRcdGkxLS0gd2hpbGUgaTEgPiBpIGFuZCBuZXdbaTEgLSAxXSA9PT0gb2xkW2kxIC0gMSAtIGRdXG5cblx0XHRpZiBkID09IChpMSAtIGkpXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgaW4gY2h1bmtcIixpLGkxXG5cdFx0XHRsZXQgYmVmb3JlID0gb2xkW2ldLkBkb21cblx0XHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5ld1tpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRlbGlmIGQgPCAwIGFuZCBpID09IG5sXG5cdFx0IyByZW1vdmVkIGF0IGVuZFxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBvbFxuXHRcdHJldHVyblxuXHRlbGlmIGQgPCAwXG5cdFx0bGV0IGkxID0gb2xcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMSArIGRdID09PSBvbGRbaTEgLSAxXVxuXG5cdFx0aWYgZCA9PSAoaSAtIGkxKVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGRbaSsrXSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblxuXHRlbGlmIGkgPT0gbmxcblx0XHRyZXR1cm5cblxuXHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMocm9vdCxuZXcsb2xkLGNhcmV0KVxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlSW5kZXhlZEFycmF5IHJvb3QsIGFycmF5LCBvbGQsIGNhcmV0XG5cdHZhciBuZXdMZW4gPSBhcnJheTp0YWdsZW5cblx0dmFyIHByZXZMZW4gPSBhcnJheTpkb21sZW4gb3IgMFxuXHR2YXIgbGFzdCA9IG5ld0xlbiA/IGFycmF5W25ld0xlbiAtIDFdIDogbnVsbFxuXHQjIGNvbnNvbGUubG9nIFwicmVjb25jaWxlIG9wdGltaXplZCBhcnJheSghKVwiLGNhcmV0LG5ld0xlbixwcmV2TGVuLGFycmF5XG5cblx0aWYgcHJldkxlbiA+IG5ld0xlblxuXHRcdHdoaWxlIHByZXZMZW4gPiBuZXdMZW5cblx0XHRcdHZhciBpdGVtID0gYXJyYXlbLS1wcmV2TGVuXVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChpdGVtLkBkb20pXG5cblx0ZWxpZiBuZXdMZW4gPiBwcmV2TGVuXG5cdFx0IyBmaW5kIHRoZSBpdGVtIHRvIGluc2VydCBiZWZvcmVcblx0XHRsZXQgcHJldkxhc3QgPSBwcmV2TGVuID8gYXJyYXlbcHJldkxlbiAtIDFdLkBkb20gOiBjYXJldFxuXHRcdGxldCBiZWZvcmUgPSBwcmV2TGFzdCA/IHByZXZMYXN0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcblx0XHR3aGlsZSBwcmV2TGVuIDwgbmV3TGVuXG5cdFx0XHRsZXQgbm9kZSA9IGFycmF5W3ByZXZMZW4rK11cblx0XHRcdGJlZm9yZSA/IHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUuQGRvbSxiZWZvcmUpIDogcm9vdC5hcHBlbmRDaGlsZChub2RlLkBkb20pXG5cdFx0XHRcblx0YXJyYXk6ZG9tbGVuID0gbmV3TGVuXG5cdHJldHVybiBsYXN0ID8gbGFzdC5AZG9tIDogY2FyZXRcblxuXG4jIHRoZSBnZW5lcmFsIHJlY29uY2lsZXIgdGhhdCByZXNwZWN0cyBjb25kaXRpb25zIGV0Y1xuIyBjYXJldCBpcyB0aGUgY3VycmVudCBub2RlIHdlIHdhbnQgdG8gaW5zZXJ0IHRoaW5ncyBhZnRlclxuZGVmIHJlY29uY2lsZU5lc3RlZCByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHQjIHZhciBza2lwbmV3ID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZSBvciBuZXcgPT09IHRydWVcblx0dmFyIG5ld0lzTnVsbCA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Vcblx0dmFyIG9sZElzTnVsbCA9IG9sZCA9PSBudWxsIG9yIG9sZCA9PT0gZmFsc2VcblxuXG5cdGlmIG5ldyA9PT0gb2xkXG5cdFx0IyByZW1lbWJlciB0aGF0IHRoZSBjYXJldCBtdXN0IGJlIGFuIGFjdHVhbCBkb20gZWxlbWVudFxuXHRcdCMgd2Ugc2hvdWxkIGluc3RlYWQgbW92ZSB0aGUgYWN0dWFsIGNhcmV0PyAtIHRydXN0XG5cdFx0aWYgbmV3SXNOdWxsXG5cdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRlbGlmIG5ldy5AZG9tXG5cdFx0XHRyZXR1cm4gbmV3LkBkb21cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG5ldzp0YWdsZW4gIT0gbnVsbFxuXHRcdFx0cmV0dXJuIHJlY29uY2lsZUluZGV4ZWRBcnJheShyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdCMgbG9vayBmb3Igc2xvdCBpbnN0ZWFkP1xuXHRcdFx0bGV0IHR5cCA9IG5ldzpzdGF0aWNcblx0XHRcdGlmIHR5cCBvciBvbGQ6c3RhdGljXG5cdFx0XHRcdCMgaWYgdGhlIHN0YXRpYyBpcyBub3QgbmVzdGVkIC0gd2UgY291bGQgZ2V0IGEgaGludCBmcm9tIGNvbXBpbGVyXG5cdFx0XHRcdCMgYW5kIGp1c3Qgc2tpcCBpdFxuXHRcdFx0XHRpZiB0eXAgPT0gb2xkOnN0YXRpYyAjIHNob3VsZCBhbHNvIGluY2x1ZGUgYSByZWZlcmVuY2U/XG5cdFx0XHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0XHRcdCMgdGhpcyBpcyB3aGVyZSB3ZSBjb3VsZCBkbyB0aGUgdHJpcGxlIGVxdWFsIGRpcmVjdGx5XG5cdFx0XHRcdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChyb290LGl0ZW0sb2xkW2ldLGNhcmV0KVxuXHRcdFx0XHRcdHJldHVybiBjYXJldFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdFx0XHRcdFxuXHRcdFx0XHQjIGlmIHRoZXkgYXJlIG5vdCB0aGUgc2FtZSB3ZSBjb250aW51ZSB0aHJvdWdoIHRvIHRoZSBkZWZhdWx0XG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgQ291bGQgdXNlIG9wdGltaXplZCBsb29wIGlmIHdlIGtub3cgdGhhdCBpdCBvbmx5IGNvbnNpc3RzIG9mIG5vZGVzXG5cdFx0XHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uKHJvb3QsbmV3LG9sZCxjYXJldClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdGlmIG9sZC5AZG9tXG5cdFx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIG9sZCB3YXMgYSBzdHJpbmctbGlrZSBvYmplY3Q/XG5cdFx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkKVxuXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXHRcdCMgcmVtb3ZlIG9sZFxuXG5cdGVsaWYgIW5ld0lzTnVsbCBhbmQgbmV3LkBkb21cblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpIHVubGVzcyBvbGRJc051bGxcblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cblx0ZWxpZiBuZXdJc051bGxcblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpIHVubGVzcyBvbGRJc051bGxcblx0XHRyZXR1cm4gY2FyZXRcblx0ZWxzZVxuXHRcdCMgaWYgb2xkIGRpZCBub3QgZXhpc3Qgd2UgbmVlZCB0byBhZGQgYSBuZXcgZGlyZWN0bHlcblx0XHRsZXQgbmV4dE5vZGVcblx0XHQjIGlmIG9sZCB3YXMgYXJyYXkgb3IgaW1iYXRhZyB3ZSBuZWVkIHRvIHJlbW92ZSBpdCBhbmQgdGhlbiBhZGRcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpXG5cdFx0ZWxpZiBvbGQgYW5kIG9sZC5AZG9tXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdCMgLi4uXG5cdFx0XHRuZXh0Tm9kZSA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdFx0aWYgbmV4dE5vZGUgaXNhIFRleHQgYW5kIG5leHROb2RlOnRleHRDb250ZW50ICE9IG5ld1xuXHRcdFx0XHRuZXh0Tm9kZTp0ZXh0Q29udGVudCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gbmV4dE5vZGVcblxuXHRcdCMgbm93IGFkZCB0aGUgdGV4dG5vZGVcblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdFxuXHQjIDEgLSBzdGF0aWMgc2hhcGUgLSB1bmtub3duIGNvbnRlbnRcblx0IyAyIC0gc3RhdGljIHNoYXBlIGFuZCBzdGF0aWMgY2hpbGRyZW5cblx0IyAzIC0gc2luZ2xlIGl0ZW1cblx0IyA0IC0gb3B0aW1pemVkIGFycmF5IC0gb25seSBsZW5ndGggd2lsbCBjaGFuZ2Vcblx0IyA1IC0gb3B0aW1pemVkIGNvbGxlY3Rpb25cblx0IyA2IC0gdGV4dCBvbmx5XG5cblx0ZGVmIHNldENoaWxkcmVuIG5ldywgdHlwXG5cdFx0IyBpZiB0eXBlb2YgbmV3ID09ICdzdHJpbmcnXG5cdFx0IyBcdHJldHVybiBzZWxmLnRleHQgPSBuZXdcblx0XHR2YXIgb2xkID0gQHRyZWVfXG5cblx0XHRpZiBuZXcgPT09IG9sZCBhbmQgbmV3IGFuZCBuZXc6dGFnbGVuID09IHVuZGVmaW5lZFxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmICFvbGQgYW5kIHR5cCAhPSAzXG5cdFx0XHRyZW1vdmVBbGxDaGlsZHJlblxuXHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXG5cdFx0ZWxpZiB0eXAgPT0gMVxuXHRcdFx0bGV0IGNhcmV0ID0gbnVsbFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQoc2VsZixpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcblx0XHRlbGlmIHR5cCA9PSAyXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0ZWxpZiB0eXAgPT0gM1xuXHRcdFx0bGV0IG50eXAgPSB0eXBlb2YgbmV3XG5cblx0XHRcdGlmIG5ldyBhbmQgbmV3LkBkb21cblx0XHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdFx0YXBwZW5kQ2hpbGQobmV3KVxuXG5cdFx0XHQjIGNoZWNrIGlmIG9sZCBhbmQgbmV3IGlzYSBhcnJheVxuXHRcdFx0ZWxpZiBuZXcgaXNhIEFycmF5XG5cdFx0XHRcdGlmIG5ldy5AdHlwZSA9PSA1IGFuZCBvbGQgYW5kIG9sZC5AdHlwZSA9PSA1XG5cdFx0XHRcdFx0cmVjb25jaWxlTG9vcChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRcdFx0cmVjb25jaWxlTmVzdGVkKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRleHQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIHNlbGZcblx0XHRcdFx0XG5cdFx0ZWxpZiB0eXAgPT0gNFxuXHRcdFx0cmVjb25jaWxlSW5kZXhlZEFycmF5KHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XG5cdFx0ZWxpZiB0eXAgPT0gNVxuXHRcdFx0cmVjb25jaWxlTG9vcChzZWxmLG5ldyxvbGQsbnVsbClcblxuXHRcdGVsaWYgbmV3IGlzYSBBcnJheSBhbmQgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVjb25jaWxlTmVzdGVkKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdGVsc2Vcblx0XHRcdCMgd2hhdCBpZiB0ZXh0P1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdEB0cmVlXyA9IG5ld1xuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGNvbnRlbnRcblx0XHRAY29udGVudCBvciBjaGlsZHJlbi50b0FycmF5XG5cdFxuXHRkZWYgc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdHJlZV9cblx0XHRcdHZhciB2YWwgPSB0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0XG5cdFx0XHQoQHRleHRfIG9yIEBkb20pOnRleHRDb250ZW50ID0gdmFsXG5cdFx0XHRAdGV4dF8gfHw9IEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHNlbGZcblxuIyBhbGlhcyBzZXRDb250ZW50IHRvIHNldENoaWxkcmVuXG52YXIgcHJvdG8gPSBJbWJhLlRhZzpwcm90b3R5cGVcbnByb3RvOnNldENvbnRlbnQgPSBwcm90bzpzZXRDaGlsZHJlblxuXG4jIG9wdGltaXphdGlvbiBmb3Igc2V0VGV4dFxudmFyIGFwcGxlID0gdHlwZW9mIG5hdmlnYXRvciAhPSAndW5kZWZpbmVkJyBhbmQgKG5hdmlnYXRvcjp2ZW5kb3Igb3IgJycpLmluZGV4T2YoJ0FwcGxlJykgPT0gMFxuaWYgYXBwbGVcblx0ZGVmIHByb3RvLnNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHRAZG9tOnRleHRDb250ZW50ID0gKHRleHQgPT09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UgPyAnJyA6IHRleHQpXG5cdFx0XHRAdHJlZV8gPSB0ZXh0XG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9yZWNvbmNpbGVyLmltYmEiLCJpbXBvcnQgUm91dGVyIGZyb20gJy4vdXRpbC9yb3V0ZXInXG5cbmV4cG9ydCBjbGFzcyBEb2NcblxuXHRwcm9wIHBhdGhcblx0cHJvcCBzcmNcblx0cHJvcCBkYXRhXG5cblx0ZGVmIHJlYWR5XG5cdFx0QHJlYWR5XG5cblx0ZGVmIGluaXRpYWxpemUgc3JjLCBhcHBcblx0XHRAc3JjID0gc3JjXG5cdFx0QHBhdGggPSBzcmMucmVwbGFjZSgvXFwubWQkLywnJylcblx0XHRAYXBwID0gYXBwXG5cdFx0QHJlYWR5ID0gbm9cblx0XHRmZXRjaFxuXHRcdHNlbGZcblxuXHRkZWYgZmV0Y2hcblx0XHRAcHJvbWlzZSB8fD0gQGFwcC5mZXRjaChzcmMpLnRoZW4gZG8gfHJlc3xcblx0XHRcdGxvYWQocmVzKVxuXG5cdGRlZiBsb2FkIGRvY1xuXHRcdEBkYXRhID0gZG9jXG5cdFx0QG1ldGEgPSBkb2M6bWV0YSBvciB7fVxuXHRcdEByZWFkeSA9IHllc1xuXHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiB0aXRsZVxuXHRcdEBkYXRhOnRpdGxlIG9yICdwYXRoJ1xuXG5cdGRlZiB0b2Ncblx0XHRAZGF0YSBhbmQgQGRhdGE6dG9jWzBdXG5cblx0ZGVmIGJvZHlcblx0XHRAZGF0YSBhbmQgQGRhdGE6Ym9keVxuXG5cbmV4cG9ydCB2YXIgQ2FjaGUgPSB7fVxudmFyIHJlcXVlc3RzID0ge31cblxuZXhwb3J0IGNsYXNzIEFwcFxuXHRwcm9wIHJlcVxuXHRwcm9wIGNhY2hlXG5cdHByb3AgaXNzdWVzXG5cdFxuXHRkZWYgc2VsZi5kZXNlcmlhbGl6ZSBkYXRhID0gJ3t9J1xuXHRcdHNlbGYubmV3IEpTT04ucGFyc2UoZGF0YS5yZXBsYWNlKC/Cp8KnU0NSSVBUwqfCpy9nLFwic2NyaXB0XCIpKVxuXG5cdGRlZiBpbml0aWFsaXplIGNhY2hlID0ge31cblx0XHRAY2FjaGUgPSBjYWNoZVxuXHRcdEBkb2NzID0ge31cblx0XHRpZiAkd2ViJFxuXHRcdFx0QGxvYyA9IGRvY3VtZW50OmxvY2F0aW9uXG5cdFx0XHRcblx0XHRpZiBAY2FjaGU6Z3VpZGVcblx0XHRcdEBndWlkZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoQGNhY2hlOmd1aWRlKSlcblx0XHRcdCMgZm9yIGl0ZW0saSBpbiBAZ3VpZGVcblx0XHRcdCMgXHRAZ3VpZGVbaXRlbTppZF0gPSBpdGVtXG5cdFx0XHQjIFx0aXRlbTpuZXh0ID0gQGd1aWRlW2kgKyAxXVxuXHRcdFx0IyBcdGl0ZW06cHJldiA9IEBndWlkZVtpIC0gMV1cblx0XHRzZWxmXG5cblx0ZGVmIHJlc2V0XG5cdFx0Y2FjaGUgPSB7fVxuXHRcdHNlbGZcblxuXHRkZWYgcm91dGVyXG5cdFx0QHJvdXRlciB8fD0gUm91dGVyLm5ldyhzZWxmKVxuXG5cdGRlZiBwYXRoXG5cdFx0JHdlYiQgPyBAbG9jOnBhdGhuYW1lIDogcmVxOnBhdGhcblxuXHRkZWYgaGFzaFxuXHRcdCR3ZWIkID8gQGxvYzpoYXNoLnN1YnN0cigxKSA6ICcnXG5cblx0ZGVmIGRvYyBzcmNcblx0XHRAZG9jc1tzcmNdIHx8PSBEb2MubmV3KHNyYyxzZWxmKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRAZ3VpZGUgfHw9IEBjYWNoZTpndWlkZSAjIC5tYXAgZG8gfHxcblx0XHRcblx0ZGVmIHNlcmlhbGl6ZVxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShjYWNoZSkucmVwbGFjZSgvXFxic2NyaXB0L2csXCLCp8KnU0NSSVBUwqfCp1wiKVxuXG5cdGlmICRub2RlJFxuXHRcdGRlZiBmZXRjaCBzcmNcblx0XHRcdGxldCByZXMgPSBjYWNoZVtzcmNdID0gQ2FjaGVbc3JjXVxuXHRcdFx0bGV0IHByb21pc2UgPSB7dGhlbjogKHxjYnwgY2IoQ2FjaGVbc3JjXSkpIH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHByb21pc2UgaWYgcmVzXG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nIFwidHJ5IHRvIGZldGNoIHtzcmN9XCJcblx0XHRcdFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdGlmIHNyYy5tYXRjaCgvXFwubWQkLylcblx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdCMgc2hvdWxkIGFsc28gaW5jbHVkZSBtZD9cblx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRsZXQgaHRtbCA9IGhsLkhpZ2hsaWdodGVyLmhpZ2hsaWdodChib2R5LHttb2RlOiAnZnVsbCd9KVxuXHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblxuXHRcdFx0Y2FjaGVbc3JjXSA9IENhY2hlW3NyY10gPSByZXNcblx0XHRcdHJldHVybiBwcm9taXNlXG5cdFxuXHRpZiAkd2ViJFxuXHRcdGRlZiBmZXRjaCBzcmNcblx0XHRcdGlmIGNhY2hlW3NyY11cblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZVtzcmNdKVxuXHRcdFx0XG5cdFx0XHRyZXF1ZXN0c1tzcmNdIHx8PSBQcm9taXNlLm5ldyBkbyB8cmVzb2x2ZXxcblx0XHRcdFx0dmFyIHJlcSA9IGF3YWl0IHdpbmRvdy5mZXRjaChzcmMpXG5cdFx0XHRcdHZhciByZXNwID0gYXdhaXQgcmVxLmpzb25cblx0XHRcdFx0cmVzb2x2ZShjYWNoZVtzcmNdID0gcmVzcClcblx0XHRcdFxuXHRkZWYgZmV0Y2hEb2N1bWVudCBzcmMsICZjYlxuXHRcdHZhciByZXMgPSBkZXBzW3NyY11cblx0XHRjb25zb2xlLmxvZyBcIm5vIGxvbmdlcj9cIlxuXG5cdFx0aWYgJG5vZGUkXG5cdFx0XHR2YXIgZnMgPSByZXF1aXJlICdmcydcblx0XHRcdHZhciBwYXRoID0gcmVxdWlyZSAncGF0aCdcblx0XHRcdHZhciBtZCA9IHJlcXVpcmUgJy4vdXRpbC9tYXJrZG93bidcblx0XHRcdHZhciBobCA9IHJlcXVpcmUgJy4vc2NyaW1ibGEvY29yZS9oaWdobGlnaHRlcidcblx0XHRcdHZhciBmaWxlcGF0aCA9IFwie19fZGlybmFtZX0vLi4vZG9jcy97c3JjfVwiLnJlcGxhY2UoL1xcL1xcLy9nLCcvJylcblxuXHRcdFx0aWYgIXJlc1xuXHRcdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRcdGlmIHNyYy5tYXRjaCgvXFwubWQkLylcblx0XHRcdFx0XHRyZXMgPSBtZC5yZW5kZXIoYm9keSlcblxuXHRcdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHRcdCMgc2hvdWxkIGFsc28gaW5jbHVkZSBtZD9cblx0XHRcdFx0XHRyZXMgPSBKU09OLnBhcnNlKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0XHRsZXQgaHRtbCA9IGhsLkhpZ2hsaWdodGVyLmhpZ2hsaWdodChib2R5LHttb2RlOiAnZnVsbCd9KVxuXHRcdFx0XHRcdHJlcyA9IHtib2R5OiBib2R5LCBodG1sOiBodG1sfVxuXHRcdFx0XG5cdFx0XHRkZXBzW3NyY10gfHw9IHJlc1xuXHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRlbHNlXG5cdFx0XHQjIHNob3VsZCBndWFyZCBhZ2FpbnN0IG11bHRpcGxlIGxvYWRzXG5cdFx0XHRpZiByZXNcblx0XHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRcdFx0cmV0dXJuIHt0aGVuOiAoZG8gfHZ8IHYocmVzKSl9ICMgZmFrZSBwcm9taXNlIGhhY2tcblxuXHRcdFx0dmFyIHhociA9IFhNTEh0dHBSZXF1ZXN0Lm5ld1xuXHRcdFx0eGhyLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnIGRvIHxyZXN8XG5cdFx0XHRcdHJlcyA9IGRlcHNbc3JjXSA9IEpTT04ucGFyc2UoeGhyOnJlc3BvbnNlVGV4dClcblx0XHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRcdHhoci5vcGVuKFwiR0VUXCIsIHNyYylcblx0XHRcdHhoci5zZW5kXG5cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBpc3N1ZXNcblx0XHRAaXNzdWVzIHx8PSBEb2MuZ2V0KCcvaXNzdWVzL2FsbCcsJ2pzb24nKVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwLmltYmEiLCJleHRlcm4gaGlzdG9yeSwgZ2FcblxuZXhwb3J0IGNsYXNzIFJvdXRlclxuXG5cdHByb3AgcGF0aFxuXG5cdGRlZiBzZWxmLnNsdWcgc3RyXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKS50b0xvd2VyQ2FzZSAjIHRyaW1cblxuXHRcdHZhciBmcm9tID0gXCLDoMOhw6TDosOlw6jDqcOrw6rDrMOtw6/DrsOyw7PDtsO0w7nDusO8w7vDscOnwrcvXyw6O1wiXG5cdFx0dmFyIHRvICAgPSBcImFhYWFhZWVlZWlpaWlvb29vdXV1dW5jLS0tLS0tXCJcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvW15hLXowLTkgLV0vZywgJycpICMgcmVtb3ZlIGludmFsaWQgY2hhcnNcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxzKy9nLCAnLScpICMgY29sbGFwc2Ugd2hpdGVzcGFjZSBhbmQgcmVwbGFjZSBieSAtXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoLy0rL2csICctJykgIyBjb2xsYXBzZSBkYXNoZXNcblxuXHRcdHJldHVybiBzdHJcblxuXHRkZWYgaW5pdGlhbGl6ZSBhcHBcblx0XHRAYXBwID0gYXBwXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0d2luZG93Om9ucG9wc3RhdGUgPSBkbyB8ZXxcblx0XHRcdFx0cmVmcmVzaFxuXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZyZXNoXG5cdFx0aWYgJHdlYiRcblx0XHRcdGRvY3VtZW50OmJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLXJvdXRlJyxzZWdtZW50KDApKVxuXHRcdFx0SW1iYS5jb21taXRcblx0XHRzZWxmXG5cblx0ZGVmIHBhdGhcblx0XHRAYXBwLnBhdGhcblxuXHRkZWYgaGFzaFxuXHRcdEBhcHAuaGFzaFxuXG5cdGRlZiBleHRcblx0XHR2YXIgcGF0aCA9IHBhdGhcblx0XHR2YXIgbSA9IHBhdGgubWF0Y2goL1xcLihbXlxcL10rKSQvKVxuXHRcdG0gYW5kIG1bMV0gb3IgJydcblxuXHRkZWYgc2VnbWVudCBuciA9IDBcblx0XHRwYXRoLnNwbGl0KCcvJylbbnIgKyAxXSBvciAnJ1xuXG5cdGRlZiBnbyBocmVmLCBzdGF0ZSA9IHt9LCByZXBsYWNlID0gbm9cblx0XHRpZiBocmVmID09ICcvaW5zdGFsbCdcblx0XHRcdCMgcmVkaXJlY3RzIGhlcmVcblx0XHRcdGhyZWYgPSAnL2d1aWRlcyN0b2MtaW5zdGFsbGF0aW9uJ1xuXHRcdFx0XG5cdFx0aWYgcmVwbGFjZVxuXHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsbnVsbCxocmVmKVxuXHRcdFx0cmVmcmVzaFxuXHRcdGVsc2Vcblx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRcdCMgZ2EoJ3NlbmQnLCAncGFnZXZpZXcnLCBocmVmKVxuXG5cdFx0aWYgIWhyZWYubWF0Y2goL1xcIy8pXG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8oMCwwKVxuXHRcblx0XHRzZWxmXG5cblx0ZGVmIHNjb3BlZCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cdFx0aWYgcmVnIGlzYSBTdHJpbmdcblx0XHRcdHZhciBueHQgPSBwYXRoW3JlZzpsZW5ndGhdXG5cdFx0XHRwYXRoLnN1YnN0cigwLHJlZzpsZW5ndGgpID09IHJlZyBhbmQgKCFueHQgb3Igbnh0ID09ICctJyBvciBueHQgPT0gJy8nIG9yIG54dCA9PSAnIycgb3Igbnh0ID09ICc/JyBvciBueHQgPT0gJ18nKVxuXHRcdGVsaWYgcmVnIGlzYSBSZWdFeHBcblx0XHRcdHZhciBtID0gcGF0aC5tYXRjaChyZWcpXG5cdFx0XHRwYXJ0ICYmIG0gPyBtW3BhcnRdIDogbVxuXHRcdGVsc2Vcblx0XHRcdG5vXG5cblx0ZGVmIG1hdGNoIHJlZywgcGFydFxuXHRcdHZhciBwYXRoID0gcGF0aCArICcjJyArIGhhc2hcblxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHRwYXRoID09IHJlZ1xuXHRcdGVsaWYgcmVnIGlzYSBSZWdFeHBcblx0XHRcdHZhciBtID0gcGF0aC5tYXRjaChyZWcpXG5cdFx0XHRwYXJ0ICYmIG0gPyBtW3BhcnRdIDogbVxuXHRcdGVsc2Vcblx0XHRcdG5vXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRhdHRyIHJvdXRlXG5cblx0ZGVmIHJvdXRlclxuXHRcdGFwcC5yb3V0ZXJcblxuXHRkZWYgcmVyb3V0ZVxuXHRcdHZhciBzY29wZWQgPSByb3V0ZXIuc2NvcGVkKHJvdXRlLHNlbGYpXG5cdFx0ZmxhZygnc2NvcGVkJyxzY29wZWQpXG5cdFx0ZmxhZygnc2VsZWN0ZWQnLHJvdXRlci5tYXRjaChyb3V0ZSxzZWxmKSlcblx0XHRpZiBzY29wZWQgIT0gQHNjb3BlZFxuXHRcdFx0QHNjb3BlZCA9IHNjb3BlZFxuXHRcdFx0c2NvcGVkID8gZGlkc2NvcGUgOiBkaWR1bnNjb3BlXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgZGlkc2NvcGVcblx0XHRzZWxmXG5cblx0ZGVmIGRpZHVuc2NvcGVcblx0XHRzZWxmXG5cbiMgZXh0ZW5kIGxpbmtzXG5leHRlbmQgdGFnIGFcblx0XG5cdGRlZiByb3V0ZVxuXHRcdEByb3V0ZSBvciBocmVmXG5cblx0ZGVmIG9udGFwIGVcblx0XHRyZXR1cm4gdW5sZXNzIGhyZWZcblxuXHRcdHZhciBocmVmID0gaHJlZi5yZXBsYWNlKC9eaHR0cFxcOlxcL1xcL2ltYmFcXC5pby8sJycpXG5cblx0XHRpZiBlLmV2ZW50Om1ldGFLZXkgb3IgZS5ldmVudDphbHRLZXlcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcblxuXHRcdGlmIGxldCBtID0gaHJlZi5tYXRjaCgvZ2lzdFxcLmdpdGh1YlxcLmNvbVxcLyhbXlxcL10rKVxcLyhbQS1aYS16XFxkXSspLylcblx0XHRcdGNvbnNvbGUubG9nICdnaXN0ISEnLG1bMV0sbVsyXVxuXHRcdFx0I2dpc3Qub3BlbihtWzJdKVxuXHRcdFx0cmV0dXJuIGUucHJldmVudC5zdG9wXG5cblx0XHRpZiBocmVmWzBdID09ICcjJyBvciBocmVmWzBdID09ICcvJ1xuXHRcdFx0ZS5wcmV2ZW50LnN0b3Bcblx0XHRcdHJvdXRlci5nbyhocmVmLHt9KVxuXHRcdFx0SW1iYS5FdmVudHMudHJpZ2dlcigncm91dGUnLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJlcm91dGUgaWYgJHdlYiRcblx0XHRzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbC9yb3V0ZXIuaW1iYSIsImltcG9ydCBIb21lUGFnZSBmcm9tICcuL0hvbWVQYWdlJ1xuaW1wb3J0IEd1aWRlc1BhZ2UgZnJvbSAnLi9HdWlkZXNQYWdlJ1xuaW1wb3J0IERvY3NQYWdlIGZyb20gJy4vRG9jc1BhZ2UnXG5pbXBvcnQgTG9nbyBmcm9tICcuL0xvZ28nXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHRkZWYgYXBwXG5cdFx0cm9vdC5hcHBcblxuXG5leHBvcnQgdGFnIFNpdGVcblx0XG5cdGRlZiBhcHBcblx0XHRkYXRhXG5cdFx0XG5cdGRlZiByb290XG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcm91dGVyXG5cdFx0YXBwLnJvdXRlclxuXHRcdFxuXHRkZWYgbG9hZFxuXHRcdHNlbGZcblx0XHRcdFxuXHRkZWYgdG9nZ2xlTWVudVxuXHRcdGRvY3VtZW50OmJvZHk6Y2xhc3NMaXN0LnRvZ2dsZSgnbWVudScpXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxoZWFkZXIjaGVhZGVyPlxuXHRcdFx0XHQ8bmF2LmNvbnRlbnQ+XG5cdFx0XHRcdFx0PExvZ28+XG5cdFx0XHRcdFx0PGEudGFiLmxvZ28gaHJlZj0nL2hvbWUnPiA8aT4gJ2ltYmEnXG5cdFx0XHRcdFx0PHNwYW4uZ3JlZWR5PlxuXHRcdFx0XHRcdDxhLnRhYi5ob21lIGhyZWY9Jy9ob21lJz4gPGk+ICdob21lJ1xuXHRcdFx0XHRcdDxhLnRhYi5ndWlkZXMgaHJlZj0nL2d1aWRlJz4gPGk+ICdsZWFybidcblx0XHRcdFx0XHQ8YS50YWIuZ2l0dGVyIGhyZWY9J2h0dHBzOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+IDxpPiAnY29tbXVuaXR5J1xuXHRcdFx0XHRcdDxhLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gPGk+ICdnaXRodWInXG5cdFx0XHRcdFx0IyA8YS5pc3N1ZXMgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiA8aT4gJ2lzc3Vlcydcblx0XHRcdFx0XHQ8YS5tZW51IDp0YXA9J3RvZ2dsZU1lbnUnPiA8Yj5cblxuXHRcdFx0aWYgcm91dGVyLnNjb3BlZCgnL2hvbWUnKVxuXHRcdFx0XHQ8SG9tZVBhZ2U+XG5cdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9ndWlkZScpXG5cdFx0XHRcdDxHdWlkZXNQYWdlW2FwcC5ndWlkZV0+XG5cdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9kb2NzJylcblx0XHRcdFx0PERvY3NQYWdlPlxuXG5cdFx0XHQ8Zm9vdGVyI2Zvb3Rlcj4gXG5cdFx0XHRcdDxocj5cblx0XHRcdFx0PC5sZnQ+IFwiSW1iYSDCqSAyMDE1LTIwMThcIlxuXHRcdFx0XHQ8LnJndD5cblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gJ1R3aXR0ZXInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gJ0dpdEh1Yidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gJ0lzc3Vlcydcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+ICdDaGF0J1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuaW1wb3J0IEV4YW1wbGUgZnJvbSAnLi9TbmlwcGV0J1xuaW1wb3J0IE1hcmtlZCBmcm9tICcuL01hcmtlZCdcbmltcG9ydCBQYXR0ZXJuIGZyb20gJy4vUGF0dGVybidcbmltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuXG5leHBvcnQgdGFnIEhvbWVQYWdlIDwgUGFnZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gPC5ib2R5PlxuXHRcdFx0PGRpdiNoZXJvLmRhcms+XG5cdFx0XHRcdDxQYXR0ZXJuQHBhdHRlcm4+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHQ8TWFya2VkW2FwcC5ndWlkZVsnaGVybyddXT5cblx0XHRcdFx0XHQ8bmF2LmJ1dHRvbnM+XG5cdFx0XHRcdFx0XHQjIDxhLmJ1dHRvbi50cnkgaHJlZj0nIyc+IFwiVHJ5IG9ubGluZVwiXG5cdFx0XHRcdFx0XHQ8YS5idXR0b24uc3RhcnQgaHJlZj0nL2d1aWRlJz4gXCJHZXQgc3RhcnRlZFwiXG5cdFx0XHRcdFx0XHQjIDxhLmJ1dHRvbi5zdGFydCBocmVmPScvZXhhbXBsZXMnPiBcIkV4YW1wbGVzXCJcblx0XHRcdFx0XHRcdDxhLmJ1dHRvbi5naXRodWIgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+IFwiR2l0aHViXCJcblxuXHRcdFx0XHQjIDxoZXJvc25pcHBldC5oZXJvLmRhcmsgc3JjPScvaG9tZS9leGFtcGxlcy9oZXJvLmltYmEnPlxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQud2VsY29tZS5odWdlLmxpZ2h0PiBcIlwiXCJcblx0XHRcdFx0XHQjIENyZWF0ZSBjb21wbGV4IHdlYiBhcHBzIHdpdGggZWFzZSFcblxuXHRcdFx0XHRcdEltYmEgaXMgYSBuZXcgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UgZm9yIHRoZSB3ZWIgdGhhdCBjb21waWxlcyB0byBoaWdobHkgXG5cdFx0XHRcdFx0cGVyZm9ybWFudCBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gSXQgaGFzIGxhbmd1YWdlIGxldmVsIHN1cHBvcnQgZm9yIGRlZmluaW5nLCBcblx0XHRcdFx0XHRleHRlbmRpbmcsIHN1YmNsYXNzaW5nLCBpbnN0YW50aWF0aW5nIGFuZCByZW5kZXJpbmcgZG9tIG5vZGVzLiBGb3IgYSBzaW1wbGUgXG5cdFx0XHRcdFx0YXBwbGljYXRpb24gbGlrZSBUb2RvTVZDLCBpdCBpcyBtb3JlIHRoYW4gXG5cdFx0XHRcdFx0WzEwIHRpbWVzIGZhc3RlciB0aGFuIFJlYWN0XShodHRwOi8vc29tZWJlZS5naXRodWIuaW8vdG9kb212Yy1yZW5kZXItYmVuY2htYXJrL2luZGV4Lmh0bWwpIFxuXHRcdFx0XHRcdHdpdGggbGVzcyBjb2RlLCBhbmQgYSBtdWNoIHNtYWxsZXIgbGlicmFyeS5cblxuXHRcdFx0XHRcdC0tLVxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmluc3BpcmF0aW9uXG5cdFx0XHRcdFx0ICBJbWJhIGJyaW5ncyB0aGUgYmVzdCBmcm9tIFJ1YnksIFB5dGhvbiwgYW5kIFJlYWN0ICgrIEpTWCkgdG9nZXRoZXIgaW4gYSBjbGVhbiBsYW5ndWFnZSBhbmQgcnVudGltZS5cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnRlcm9wZXJhYmlsaXR5XG5cdFx0XHRcdFx0ICBJbWJhIGNvbXBpbGVzIGRvd24gdG8gY2xlYW4gYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIFVzZSBhbnkgSlMgbGlicmFyeSBpbiBJbWJhIGFuZCB2aWNhLXZlcnNhLlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC0gIyMgSW1iYS5wZXJmb3JtYW5jZVxuXHRcdFx0XHRcdCAgQnVpbGQgeW91ciBhcHBsaWNhdGlvbiB2aWV3cyB1c2luZyBJbWJhJ3MgbmF0aXZlIHRhZ3MgZm9yIHVucHJlY2VkZW50ZWQgcGVyZm9ybWFuY2UuXG5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIlNpbXBsZSByZW1pbmRlcnNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL3JlbWluZGVycy5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIFJldXNhYmxlIGNvbXBvbmVudHNcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRBIGN1c3RvbSB0YWcgLyBjb21wb25lbnQgY2FuIG1haW50YWluIGludGVybmFsIHN0YXRlIGFuZCBjb250cm9sIGhvdyB0byByZW5kZXIgaXRzZWxmLlxuXHRcdFx0XHRcdFdpdGggdGhlIHBlcmZvcm1hbmNlIG9mIERPTSByZWNvbmNpbGlhdGlvbiBpbiBJbWJhLCB5b3UgY2FuIHVzZSBvbmUtd2F5IGRlY2xhcmF0aXZlIGJpbmRpbmdzLFxuXHRcdFx0XHRcdGV2ZW4gZm9yIGFuaW1hdGlvbnMuIFdyaXRlIGFsbCB5b3VyIHZpZXdzIGluIGEgc3RyYWlnaHQtZm9yd2FyZCBsaW5lYXIgZmFzaGlvbiBhcyBpZiB5b3UgY291bGRcblx0XHRcdFx0XHRyZXJlbmRlciB5b3VyIHdob2xlIGFwcGxpY2F0aW9uIG9uICoqZXZlcnkgc2luZ2xlKiogZGF0YS9zdGF0ZSBjaGFuZ2UuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJXb3JsZCBjbG9ja1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2xvY2suaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBFeHRlbmQgbmF0aXZlIHRhZ3Ncblx0XHRcdFx0XHRcblx0XHRcdFx0XHRJbiBhZGRpdGlvbiB0byBkZWZpbmluZyBjdXN0b20gdGFncywgeW91IGNhbiBhbHNvIGV4dGVuZCBuYXRpdmUgdGFncywgb3IgaW5oZXJpdCBmcm9tIHRoZW0uXG5cdFx0XHRcdFx0QmluZGluZyB0byBkb20gZXZlbnRzIGlzIGFzIHNpbXBsZSBhcyBkZWZpbmluZyBtZXRob2RzIG9uIHlvdXIgdGFnczsgYWxsIGV2ZW50cyB3aWxsIGJlXG5cdFx0XHRcdFx0ZWZmaWNpZW50bHkgZGVsZWdhdGVkIGFuZCBoYW5kbGVkIGJ5IEltYmEuIExldCdzIGRlZmluZSBhIHNpbXBsZSBza2V0Y2hwYWQuLi5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIkN1c3RvbSBjYW52YXNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2NhbnZhcy5pbWJhJz5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIiMgZGVmaW5lIHJlbmRlcmVyXG52YXIgbWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xudmFyIG1kciA9IG1hcmtlZC5SZW5kZXJlci5uZXdcblxuZGVmIG1kci5oZWFkaW5nIHRleHQsIGx2bFxuXHRcIjxoe2x2bH0+e3RleHR9PC9oe2x2bH0+XCJcblx0XG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cdFx0XG5leHBvcnQgdGFnIE1hcmtlZFxuXHRkZWYgcmVuZGVyZXJcblx0XHRzZWxmXG5cblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRleHRcblx0XHRcdEB0ZXh0ID0gdGV4dFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IG1hcmtlZCh0ZXh0LCByZW5kZXJlcjogbWRyKVxuXHRcdHNlbGZcblxuXHRkZWYgc2V0Q29udGVudCB2YWwsdHlwXG5cdFx0c2V0VGV4dCh2YWwsMClcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0RGF0YSBkYXRhXG5cdFx0aWYgZGF0YSBhbmQgZGF0YSAhPSBAZGF0YVxuXHRcdFx0QGRhdGEgPSBkYXRhXG5cdFx0XHRkb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0XHRhd2FrZW5TbmlwcGV0cyBpZiAkd2ViJFxuXHRcdHNlbGZcblx0XHRcdFxuXHRkZWYgYXdha2VuU25pcHBldHNcblx0XHRmb3IgaXRlbSBpbiBkb20ucXVlcnlTZWxlY3RvckFsbCgnLnNuaXBwZXQnKVxuXHRcdFx0bGV0IGNvZGUgPSBpdGVtOnRleHRDb250ZW50XG5cdFx0XHRpZiBjb2RlLmluZGV4T2YoJ0ltYmEubW91bnQnKSA+PSAwXG5cdFx0XHRcdFNuaXBwZXQucmVwbGFjZShpdGVtKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCIvKipcbiAqIG1hcmtlZCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IG5vb3AsXG4gIGhyOiAvXiggKlstKl9dKXszLH0gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgbGhlYWRpbmc6IC9eKFteXFxuXSspXFxuICooPXwtKXsyLH0gKig/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggKj5bXlxcbl0rKFxcbig/IWRlZilbXlxcbl0rKSpcXG4qKSsvLFxuICBsaXN0OiAvXiggKikoYnVsbCkgW1xcc1xcU10rPyg/OmhyfGRlZnxcXG57Mix9KD8hICkoPyFcXDFidWxsIClcXG4qfFxccyokKS8sXG4gIGh0bWw6IC9eICooPzpjb21tZW50ICooPzpcXG58XFxzKiQpfGNsb3NlZCAqKD86XFxuezIsfXxcXHMqJCl8Y2xvc2luZyAqKD86XFxuezIsfXxcXHMqJCkpLyxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogK1tcIihdKFteXFxuXSspW1wiKV0pPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBwYXJhZ3JhcGg6IC9eKCg/OlteXFxuXStcXG4/KD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfHRhZ3xkZWYpKSspXFxuKi8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGQrXFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpIFteXFxuXSooPzpcXG4oPyFcXDFidWxsIClbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IHJlcGxhY2UoYmxvY2suaXRlbSwgJ2dtJylcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCk7XG5cbmJsb2NrLmxpc3QgPSByZXBsYWNlKGJsb2NrLmxpc3QpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86Wy0qX10gKil7Myx9KD86XFxcXG4rfCQpKScpXG4gICgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IHJlcGxhY2UoYmxvY2suYmxvY2txdW90ZSlcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG5ibG9jay5fdGFnID0gJyg/ISg/OidcbiAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGUnXG4gICsgJ3x2YXJ8c2FtcHxrYmR8c3VifHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkbydcbiAgKyAnfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITovfFteXFxcXHdcXFxcc0BdKkApXFxcXGInO1xuXG5ibG9jay5odG1sID0gcmVwbGFjZShibG9jay5odG1sKVxuICAoJ2NvbW1lbnQnLCAvPCEtLVtcXHNcXFNdKj8tLT4vKVxuICAoJ2Nsb3NlZCcsIC88KHRhZylbXFxzXFxTXSs/PFxcL1xcMT4vKVxuICAoJ2Nsb3NpbmcnLCAvPHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8pXG4gICgvdGFnL2csIGJsb2NrLl90YWcpXG4gICgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCdocicsIGJsb2NrLmhyKVxuICAoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICgnYmxvY2txdW90ZScsIGJsb2NrLmJsb2NrcXVvdGUpXG4gICgndGFnJywgJzwnICsgYmxvY2suX3RhZylcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgZmVuY2VzOiAvXiAqKGB7Myx9fH57Myx9KVsgXFwuXSooXFxTKyk/ICpcXG4oW1xcc1xcU10qPylcXHMqXFwxICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiAvXi8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSArKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvXG59KTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJyg/IScsICcoPyEnXG4gICAgKyBibG9jay5nZm0uZmVuY2VzLnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMicpICsgJ3wnXG4gICAgKyBibG9jay5saXN0LnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMycpICsgJ3wnKVxuICAoKTtcblxuLyoqXG4gKiBHRk0gKyBUYWJsZXMgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLnRhYmxlcyA9IG1lcmdlKHt9LCBibG9jay5nZm0sIHtcbiAgbnB0YWJsZTogL14gKihcXFMuKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKVxcbigoPzouKlxcfC4qKD86XFxufCQpKSopXFxuKi8sXG4gIHRhYmxlOiAvXiAqXFx8KC4rKVxcbiAqXFx8KCAqWy06XStbLXwgOl0qKVxcbigoPzogKlxcfC4qKD86XFxufCQpKSopXFxuKi9cbn0pO1xuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cblxuZnVuY3Rpb24gTGV4ZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2Vucy5saW5rcyA9IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMudGFibGVzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2sudGFibGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBCbG9jayBSdWxlc1xuICovXG5cbkxleGVyLnJ1bGVzID0gYmxvY2s7XG5cbi8qKlxuICogU3RhdGljIExleCBNZXRob2RcbiAqL1xuXG5MZXhlci5sZXggPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG59O1xuXG4vKipcbiAqIFByZXByb2Nlc3NpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHNyYyA9IHNyY1xuICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKVxuICAgIC5yZXBsYWNlKC9cXHUwMGEwL2csICcgJylcbiAgICAucmVwbGFjZSgvXFx1MjQyNC9nLCAnXFxuJyk7XG5cbiAgcmV0dXJuIHRoaXMudG9rZW4oc3JjLCB0cnVlKTtcbn07XG5cbi8qKlxuICogTGV4aW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLnRva2VuID0gZnVuY3Rpb24oc3JjLCB0b3AsIGJxKSB7XG4gIHZhciBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpXG4gICAgLCBuZXh0XG4gICAgLCBsb29zZVxuICAgICwgY2FwXG4gICAgLCBidWxsXG4gICAgLCBiXG4gICAgLCBpdGVtXG4gICAgLCBzcGFjZVxuICAgICwgaVxuICAgICwgbDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBjYXAucmVwbGFjZSgvXFxuKyQvLCAnJylcbiAgICAgICAgICA6IGNhcFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmZW5jZXMgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5mZW5jZXMuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgbGFuZzogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLm5wdGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV0uc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdocidcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYmxvY2txdW90ZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrcXVvdGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfc3RhcnQnXG4gICAgICB9KTtcblxuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gKj4gPy9nbSwgJycpO1xuXG4gICAgICAvLyBQYXNzIGB0b3BgIHRvIGtlZXAgdGhlIGN1cnJlbnRcbiAgICAgIC8vIFwidG9wbGV2ZWxcIiBzdGF0ZS4gVGhpcyBpcyBleGFjdGx5XG4gICAgICAvLyBob3cgbWFya2Rvd24ucGwgd29ya3MuXG4gICAgICB0aGlzLnRva2VuKGNhcCwgdG9wLCB0cnVlKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaXN0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGlzdC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWxsID0gY2FwWzJdO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3Rfc3RhcnQnLFxuICAgICAgICBvcmRlcmVkOiBidWxsLmxlbmd0aCA+IDFcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICBsID0gY2FwLmxlbmd0aDtcbiAgICAgIGkgPSAwO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpdGVtID0gY2FwW2ldO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBpdGVtJ3MgYnVsbGV0XG4gICAgICAgIC8vIHNvIGl0IGlzIHNlZW4gYXMgdGhlIG5leHQgdG9rZW4uXG4gICAgICAgIHNwYWNlID0gaXRlbS5sZW5ndGg7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL14gKihbKistXXxcXGQrXFwuKSArLywgJycpO1xuXG4gICAgICAgIC8vIE91dGRlbnQgd2hhdGV2ZXIgdGhlXG4gICAgICAgIC8vIGxpc3QgaXRlbSBjb250YWlucy4gSGFja3kuXG4gICAgICAgIGlmICh+aXRlbS5pbmRleE9mKCdcXG4gJykpIHtcbiAgICAgICAgICBzcGFjZSAtPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgICBpdGVtID0gIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgPyBpdGVtLnJlcGxhY2UobmV3IFJlZ0V4cCgnXiB7MSwnICsgc3BhY2UgKyAnfScsICdnbScpLCAnJylcbiAgICAgICAgICAgIDogaXRlbS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgbmV4dCBsaXN0IGl0ZW0gYmVsb25ncyBoZXJlLlxuICAgICAgICAvLyBCYWNrcGVkYWwgaWYgaXQgZG9lcyBub3QgYmVsb25nIGluIHRoaXMgbGlzdC5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgYiA9IGJsb2NrLmJ1bGxldC5leGVjKGNhcFtpICsgMV0pWzBdO1xuICAgICAgICAgIGlmIChidWxsICE9PSBiICYmICEoYnVsbC5sZW5ndGggPiAxICYmIGIubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgIHNyYyA9IGNhcC5zbGljZShpICsgMSkuam9pbignXFxuJykgKyBzcmM7XG4gICAgICAgICAgICBpID0gbCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgaXRlbSBpcyBsb29zZSBvciBub3QuXG4gICAgICAgIC8vIFVzZTogLyhefFxcbikoPyEgKVteXFxuXStcXG5cXG4oPyFcXHMqJCkvXG4gICAgICAgIC8vIGZvciBkaXNjb3VudCBiZWhhdmlvci5cbiAgICAgICAgbG9vc2UgPSBuZXh0IHx8IC9cXG5cXG4oPyFcXHMqJCkvLnRlc3QoaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSBsIC0gMSkge1xuICAgICAgICAgIG5leHQgPSBpdGVtLmNoYXJBdChpdGVtLmxlbmd0aCAtIDEpID09PSAnXFxuJztcbiAgICAgICAgICBpZiAoIWxvb3NlKSBsb29zZSA9IG5leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBsb29zZVxuICAgICAgICAgICAgPyAnbG9vc2VfaXRlbV9zdGFydCdcbiAgICAgICAgICAgIDogJ2xpc3RfaXRlbV9zdGFydCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSwgYnEpO1xuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fZW5kJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBodG1sXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHRtbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAncGFyYWdyYXBoJ1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA8Pl0rKEB8OlxcLylbXiA8Pl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFtePCdcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86W15fXXxfXykrPylfXFxifF5cXCooKD86XFwqXFwqfFtcXHNcXFNdKSs/KVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKykoW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFxcXFxbXFxbXFxdXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShcbiAgICAgICAgICBjYXBbMV0uY2hhckF0KDYpID09PSAnOidcbiAgICAgICAgICA/IHRoaXMubWFuZ2xlKGNhcFsxXS5zdWJzdHJpbmcoNykpXG4gICAgICAgICAgOiB0aGlzLm1hbmdsZShjYXBbMV0pXG4gICAgICAgICk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0udHJpbSgpLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGV4dChlc2NhcGUodGhpcy5zbWFydHlwYW50cyhjYXBbMF0pKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGVzY2FwZShsaW5rLmhyZWYpXG4gICAgLCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuXG4gIHJldHVybiBjYXBbMF0uY2hhckF0KDApICE9PSAnISdcbiAgICA/IHRoaXMucmVuZGVyZXIubGluayhocmVmLCB0aXRsZSwgdGhpcy5vdXRwdXQoY2FwWzFdKSlcbiAgICA6IHRoaXMucmVuZGVyZXIuaW1hZ2UoaHJlZiwgdGl0bGUsIGVzY2FwZShjYXBbMV0pKTtcbn07XG5cbi8qKlxuICogU21hcnR5cGFudHMgVHJhbnNmb3JtYXRpb25zXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLnNtYXJ0eXBhbnRzID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5zbWFydHlwYW50cykgcmV0dXJuIHRleHQ7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59O1xuXG4vKipcbiAqIE1hbmdsZSBMaW5rc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5tYW5nbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLm1hbmdsZSkgcmV0dXJuIHRleHQ7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbCA9IHRleHQubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgY2g7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5cbmZ1bmN0aW9uIFJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBsYW5nLCBlc2NhcGVkKSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJ1xcbjwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICdcXG48L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcpIHtcbiAgcmV0dXJuICc8aCdcbiAgICArIGxldmVsXG4gICAgKyAnIGlkPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeFxuICAgICsgcmF3LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHddKy9nLCAnLScpXG4gICAgKyAnXCI+J1xuICAgICsgdGV4dFxuICAgICsgJzwvaCdcbiAgICArIGxldmVsXG4gICAgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQpIHtcbiAgdmFyIHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyAnPHRib2R5PlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3Rib2R5PlxcbidcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIHN0eWxlPVwidGV4dC1hbGlnbjonICsgZmxhZ3MuYWxpZ24gKyAnXCI+J1xuICAgIDogJzwnICsgdHlwZSArICc+JztcbiAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cbi8vIHNwYW4gbGV2ZWwgcmVuZGVyZXJcblJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHN0cm9uZz4nICsgdGV4dCArICc8L3N0cm9uZz4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxlbT4nICsgdGV4dCArICc8L2VtPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGNvZGU+JyArIHRleHQgKyAnPC9jb2RlPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxkZWw+JyArIHRleHQgKyAnPC9kZWw+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG5cdC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWcsIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHtcbiAgaWYgKCFiYXNlVXJsc1snICcgKyBiYXNlXSkge1xuICAgIC8vIHdlIGNhbiBpZ25vcmUgZXZlcnl0aGluZyBpbiBiYXNlIGFmdGVyIHRoZSBsYXN0IHNsYXNoIG9mIGl0cyBwYXRoIGNvbXBvbmVudCxcbiAgICAvLyBidXQgd2UgbWlnaHQgbmVlZCB0byBhZGQgX3RoYXRfXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zXG4gICAgaWYgKC9eW146XSs6XFwvKlteL10qJC8udGVzdChiYXNlKSkge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlICsgJy8nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UucmVwbGFjZSgvW14vXSokLywgJycpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG5cbiAgaWYgKGhyZWYuc2xpY2UoMCwgMikgPT09ICcvLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC86W1xcc1xcU10qLywgJzonKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyg6XFwvKlteL10qKVtcXHNcXFNdKi8sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cbnZhciBiYXNlVXJscyA9IHt9O1xudmFyIG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5kZWZhdWx0cyA9IHtcbiAgZ2ZtOiB0cnVlLFxuICB0YWJsZXM6IHRydWUsXG4gIGJyZWFrczogZmFsc2UsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzYW5pdGl6ZXI6IG51bGwsXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc21hcnRMaXN0czogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG4gIGhpZ2hsaWdodDogbnVsbCxcbiAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgc21hcnR5cGFudHM6IGZhbHNlLFxuICBoZWFkZXJQcmVmaXg6ICcnLFxuICByZW5kZXJlcjogbmV3IFJlbmRlcmVyLFxuICB4aHRtbDogZmFsc2UsXG4gIGJhc2VVcmw6IG51bGxcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xuXG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcblxubWFya2VkLklubGluZUxleGVyID0gSW5saW5lTGV4ZXI7XG5tYXJrZWQuaW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlci5vdXRwdXQ7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLm1hcmtlZCA9IG1hcmtlZDtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJkZWYgc2h1ZmZsZSBhcnJheVxuXHR2YXIgY291bnRlciA9IGFycmF5Omxlbmd0aCwgdGVtcCwgaW5kZXhcblxuXHQjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcblx0d2hpbGUgY291bnRlciA+IDBcblx0XHQjIFBpY2sgYSByYW5kb20gaW5kZXhcblx0XHRpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20gKiBjb3VudGVyKVxuXHRcdGNvdW50ZXItLSAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuXHRcdCMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG5cdFx0dGVtcCA9IGFycmF5W2NvdW50ZXJdXG5cdFx0YXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cblx0XHRhcnJheVtpbmRleF0gPSB0ZW1wXG5cdFxuXHRyZXR1cm4gYXJyYXlcblxuZXhwb3J0IHRhZyBQYXR0ZXJuXG5cblx0ZGVmIHNldHVwXG5cdFx0cmV0dXJuIHNlbGYgaWYgJG5vZGUkXG5cdFx0dmFyIHBhcnRzID0ge3RhZ3M6IFtdLCBrZXl3b3JkczogW10sIG1ldGhvZHM6IFtdfVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIGxpbmVzID0gW11cblxuXHRcdGZvciBvd24gayx2IG9mIEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdFx0aXRlbXMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXHRcdFx0cGFydHM6bWV0aG9kcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cblx0XHRmb3IgayBpbiBJbWJhLkhUTUxfVEFHUyBvciBIVE1MX1RBR1Ncblx0XHRcdGl0ZW1zLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblx0XHRcdHBhcnRzOnRhZ3MucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXG5cdFx0dmFyIHdvcmRzID0gXCJkZWYgaWYgZWxzZSBlbGlmIHdoaWxlIHVudGlsIGZvciBpbiBvZiB2YXIgbGV0IGNsYXNzIGV4dGVuZCBleHBvcnQgaW1wb3J0IHRhZyBnbG9iYWxcIlxuXG5cdFx0Zm9yIGsgaW4gd29yZHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXHRcdFx0cGFydHM6a2V5d29yZHMucHVzaChcIjxpPntrfTwvaT5cIilcblxuXHRcdHZhciBzaHVmZmxlZCA9IHNodWZmbGUoaXRlbXMpXG5cdFx0dmFyIGFsbCA9IFtdLmNvbmNhdChzaHVmZmxlZClcblx0XHR2YXIgY291bnQgPSBpdGVtczpsZW5ndGggLSAxXG5cblx0XHRmb3IgbG4gaW4gWzAgLi4gMTRdXG5cdFx0XHRsZXQgY2hhcnMgPSAwXG5cdFx0XHRsaW5lc1tsbl0gPSBbXVxuXHRcdFx0d2hpbGUgY2hhcnMgPCAzMDBcblx0XHRcdFx0bGV0IGl0ZW0gPSAoc2h1ZmZsZWQucG9wIG9yIGFsbFtNYXRoLmZsb29yKGNvdW50ICogTWF0aC5yYW5kb20pXSlcblx0XHRcdFx0aWYgaXRlbVxuXHRcdFx0XHRcdGNoYXJzICs9IGl0ZW06bGVuZ3RoXG5cdFx0XHRcdFx0bGluZXNbbG5dLnB1c2goaXRlbSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNoYXJzID0gNDAwXG5cblx0XHRkb206aW5uZXJIVE1MID0gJzxkaXY+JyArIGxpbmVzLm1hcCh8bG4saXxcblx0XHRcdGxldCBvID0gTWF0aC5tYXgoMCwoKGkgLSAyKSAqIDAuMyAvIDE0KSkudG9GaXhlZCgyKVxuXHRcdFx0XCI8ZGl2IGNsYXNzPSdsaW5lJyBzdHlsZT0nb3BhY2l0eToge299Oyc+XCIgKyBsbi5qb2luKFwiIFwiKSArICc8L2Rpdj4nXG5cdFx0KS5qb2luKCcnKSArICc8L2Rpdj4nXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYXR0ZXJuLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cbnRhZyBHdWlkZVRPQ1xuXHRwcm9wIHRvY1xuXHRhdHRyIGxldmVsXG5cblx0ZGVmIHRvZ2dsZVxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cdFx0XG5cdGRlZiB0b2Ncblx0XHRAdG9jIG9yIGRhdGEudG9jXG5cdFx0XG5cdGRlZiByb3V0ZVxuXHRcdFwie2RhdGEucGF0aH0je3RvYzpzbHVnfVwiXHRcdFxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRhdGEucmVhZHlcblxuXHRcdGxldCB0b2MgPSB0b2Ncblx0XHRyZXJvdXRlXG5cdFxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdGlmIHRvYzpjaGlsZHJlbjpsZW5ndGggYW5kIHRvYzpsZXZlbCA8IDNcblx0XHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0XHQ8R3VpZGVUT0NbZGF0YV0gdG9jPWNoaWxkPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblxudGFnIEd1aWRlXG5cdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAYm9keS5kb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0aWYgJHdlYiRcblx0XHRcdGF3YWtlblNuaXBwZXRzXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYubWQ+XG5cdFx0XHQ8ZGl2QGJvZHk+XG5cdFx0XHQ8Zm9vdGVyPlxuXHRcdFx0XHRpZiBsZXQgcmVmID0gYXBwLmd1aWRlW2RhdGE6cHJldl1cblx0XHRcdFx0XHQ8YS5wcmV2IGhyZWY9XCIvZ3VpZGUve3JlZjppZH1cIj4gXCLihpAgXCIgKyByZWY6dGl0bGVcblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOm5leHRdXG5cdFx0XHRcdFx0PGEubmV4dCBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IHJlZjp0aXRsZSArIFwiIOKGklwiXG5cblx0ZGVmIGF3YWtlblNuaXBwZXRzXG5cdFx0Zm9yIGl0ZW0gaW4gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbmlwcGV0Jylcblx0XHRcdGxldCBjb2RlID0gaXRlbTp0ZXh0Q29udGVudFxuXHRcdFx0aWYgY29kZS5pbmRleE9mKCdJbWJhLm1vdW50JykgPj0gMFxuXHRcdFx0XHRTbmlwcGV0LnJlcGxhY2UoaXRlbSlcblx0XHRzZWxmXG5cbnRhZyBUT0MgPCBsaVxuXHRwcm9wIHRvY1xuXHRwcm9wIGV4cGFuZGVkIGRlZmF1bHQ6IHRydWVcblx0YXR0ciBsZXZlbFxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0XCIvZ3VpZGUve2RhdGE6cm91dGV9I3t0b2M6c2x1Z31cIlxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhOnRvY1swXVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAyIGFuZCBleHBhbmRlZFxuXHRcdFx0XHQ8dWw+IGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW4gd2hlbiBjaGlsZDpsZXZlbCA8IDNcblx0XHRcdFx0XHQ8VE9DW2RhdGFdIHRvYz1jaGlsZD5cblxuZXhwb3J0IHRhZyBHdWlkZXNQYWdlIDwgUGFnZVxuXHRcblx0ZGVmIG1vdW50XG5cdFx0QG9uc2Nyb2xsIHx8PSBkbyBzY3JvbGxlZFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXG5cdGRlZiB1bm1vdW50XG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cdFx0XG5cdGRlZiBndWlkZVxuXHRcdGRhdGFbcm91dGVyLnBhdGgucmVwbGFjZSgnL2d1aWRlLycsJycpXSBvciBkYXRhWydlc3NlbnRpYWxzL2ludHJvZHVjdGlvbiddXG5cdFx0XG5cdGRlZiBzY3JvbGxlZFxuXHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgaXRlbXMgPSBkb20ucXVlcnlTZWxlY3RvckFsbCgnW2lkXScpXG5cdFx0dmFyIG1hdGNoXG5cblx0XHR2YXIgc2Nyb2xsVG9wID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0dmFyIHdoID0gd2luZG93OmlubmVySGVpZ2h0XG5cdFx0dmFyIGRoID0gZG9jdW1lbnQ6Ym9keTpzY3JvbGxIZWlnaHRcblxuXHRcdGlmIEBzY3JvbGxGcmVlemUgPj0gMFxuXHRcdFx0dmFyIGRpZmYgPSBNYXRoLmFicyhzY3JvbGxUb3AgLSBAc2Nyb2xsRnJlZXplKVxuXHRcdFx0cmV0dXJuIHNlbGYgaWYgZGlmZiA8IDUwXG5cdFx0XHRAc2Nyb2xsRnJlZXplID0gLTFcblxuXHRcdHZhciBzY3JvbGxCb3R0b20gPSBkaCAtIChzY3JvbGxUb3AgKyB3aClcblxuXHRcdGlmIHNjcm9sbEJvdHRvbSA9PSAwXG5cdFx0XHRtYXRjaCA9IGl0ZW1zW2l0ZW1zLmxlbiAtIDFdXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdFx0dmFyIHQgPSAoaXRlbTpvZmZzZXRUb3AgKyAzMCArIDYwKSAjIGhhY2tcblx0XHRcdFx0dmFyIGRpc3QgPSBzY3JvbGxUb3AgLSB0XG5cblx0XHRcdFx0aWYgZGlzdCA8IDBcblx0XHRcdFx0XHRicmVhayBtYXRjaCA9IGl0ZW1cblx0XHRcblx0XHRpZiBtYXRjaFxuXHRcdFx0aWYgQGhhc2ggIT0gbWF0Y2g6aWRcblx0XHRcdFx0QGhhc2ggPSBtYXRjaDppZFxuXHRcdFx0XHRyb3V0ZXIuZ28oJyMnICsgQGhhc2gse30seWVzKVxuXHRcdFx0XHRyZW5kZXJcblxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucm91dGUgZVxuXHRcdGUuc3RvcFxuXHRcdGxvZyAnZ3VpZGVzIHJvdXRlZCdcblx0XHR2YXIgc2Nyb2xsID0gZG9cblx0XHRcdGlmIGxldCBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKCcjJyArIHJvdXRlci5oYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlldyh0cnVlKVxuXHRcdFx0XHRAc2Nyb2xsRnJlZXplID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0XHRcdHJldHVybiBlbFxuXHRcdFx0cmV0dXJuIG5vXG5cblx0XHRpZiByb3V0ZXIuaGFzaFxuXHRcdFx0IyByZW5kZXJcblx0XHRcdHNjcm9sbCgpIG9yIHNldFRpbWVvdXQoc2Nyb2xsLDIwKVxuXG5cdFx0c2VsZlxuXHQjIHByb3AgZ3VpZGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0bGV0IGN1cnIgPSBndWlkZVxuXG5cdFx0PHNlbGYuX3BhZ2U+XG5cdFx0XHQ8bmF2QG5hdj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBpdGVtIGluIGRhdGE6dG9jXG5cdFx0XHRcdFx0XHQ8aDE+IGl0ZW06dGl0bGUgb3IgaXRlbTppZFxuXHRcdFx0XHRcdFx0PHVsPlxuXHRcdFx0XHRcdFx0XHRmb3Igc2VjdGlvbiBpbiBpdGVtOnNlY3Rpb25zXG5cdFx0XHRcdFx0XHRcdFx0PFRPQ1tkYXRhW3NlY3Rpb25dXSBleHBhbmRlZD0oZGF0YVtzZWN0aW9uXSA9PSBjdXJyKT5cblx0XHRcdFx0XHQjIGZvciBndWlkZSBpbiBkYXRhXG5cdFx0XHRcdFx0I1x0PFRPQ1tndWlkZV0gdG9jPWd1aWRlOnRvY1swXSBleHBhbmRlZD0oZ3VpZGUgPT0gY3Vycik+XG5cdFx0XHQ8LmJvZHkubGlnaHQ+XG5cdFx0XHRcdGlmIGd1aWRlXG5cdFx0XHRcdFx0PEd1aWRlQHtndWlkZTppZH1bZ3VpZGVdPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9HdWlkZXNQYWdlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmRlZiBwYXRoVG9BbmNob3IgcGF0aFxuXHQnYXBpLScgKyBwYXRoLnJlcGxhY2UoL1xcLi9nLCdfJykucmVwbGFjZSgvXFwjL2csJ19fJykucmVwbGFjZSgvXFw9L2csJ19zZXQnKVxuXG50YWcgRGVzY1xuXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgaHRtbCAhPSBAaHRtbFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IEBodG1sID0gaHRtbFxuXHRcdHNlbGZcblxudGFnIFJlZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblxudGFnIEl0ZW1cblxudGFnIFBhdGggPCBzcGFuXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgc2V0dXBcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBzdHIgPSBkYXRhXG5cdFx0aWYgc3RyIGlzYSBTdHJpbmdcblx0XHRcdGlmIHNob3J0XG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8oW0EtWl1cXHcqXFwuKSooPz1bQS1aXSkvZywnJylcblxuXHRcdFx0aHRtbCA9IHN0ci5yZXBsYWNlKC9cXGIoW1xcd10rfFxcLnxcXCMpXFxiL2cpIGRvIHxtLGl8XG5cdFx0XHRcdGlmIGkgPT0gJy4nIG9yIGkgPT0gJyMnXG5cdFx0XHRcdFx0XCI8aT57aX08L2k+XCJcblx0XHRcdFx0ZWxpZiBpWzBdID09IGlbMF0udG9VcHBlckNhc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdjb25zdCc+e2l9PC9iPlwiXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdpZCc+e2l9PC9iPlwiXG5cdFx0c2VsZlxuXG5cbnRhZyBSZXR1cm5cblx0YXR0ciBuYW1lXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PFBhdGhbZGF0YTp2YWx1ZV0udmFsdWU+XG5cdFx0XHQ8c3Bhbi5kZXNjPiBkYXRhOmRlc2NcblxudGFnIENsYXNzIDwgSXRlbVxuXG5cdHByb3AgZGF0YSB3YXRjaDogOnBhcnNlXG5cblx0ZGVmIHBhcnNlXG5cdFx0QHN0YXRpY3MgPSAobSBmb3IgbSBpbiBkYXRhWycuJ10gd2hlbiBtOmRlc2MpXG5cdFx0QG1ldGhvZHMgPSAobSBmb3IgbSBpbiBkYXRhWycjJ10gd2hlbiBtOmRlc2MpXG5cdFx0QHByb3BlcnRpZXMgPSBbXVxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKT5cblx0XHRcdDwuaGVhZGVyPiA8LnRpdGxlPiA8UGF0aFtkYXRhOm5hbWVwYXRoXT5cblx0XHRcdDxEZXNjIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0aWYgZGF0YTpjdG9yXG5cdFx0XHRcdDwuY29udGVudC5jdG9yPlxuXHRcdFx0XHRcdDxNZXRob2RbZGF0YTpjdG9yXSBwYXRoPShkYXRhOm5hbWVwYXRoICsgJy5uZXcnKT5cblxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRpZiBAc3RhdGljczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ1N0YXRpYyBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBzdGF0aWNzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6bmFtZXBhdGg+XG5cblx0XHRcdFx0aWYgQG1ldGhvZHM6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdJbnN0YW5jZSBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBtZXRob2RzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6aW5hbWU+XG5cbnRhZyBWYWx1ZVxuXG5cdGRlZiByZW5kZXJcblx0XHRpZiBkYXRhOnR5cGVcblx0XHRcdDxzZWxmIC57ZGF0YTp0eXBlfT5cblx0XHRcdFx0ZGF0YTp2YWx1ZVxuXHRcdGVsaWYgZGF0YSBpc2EgU3RyaW5nXG5cdFx0XHQ8c2VsZi5zdHIgdGV4dD1kYXRhPlxuXHRcdGVsaWYgZGF0YSBpc2EgTnVtYmVyXG5cdFx0XHQ8c2VsZi5udW0gdGV4dD1kYXRhPlxuXHRcdHNlbGZcblx0XHRcblxudGFnIFBhcmFtXG5cblx0ZGVmIHR5cGVcblx0XHRkYXRhOnR5cGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLnt0eXBlfT5cblx0XHRcdGlmIHR5cGUgPT0gJ05hbWVkUGFyYW1zJ1xuXHRcdFx0XHRmb3IgcGFyYW0gaW4gZGF0YTpub2Rlc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDwubmFtZT4gZGF0YTpuYW1lXG5cdFx0XHRcdGlmIGRhdGE6ZGVmYXVsdHNcblx0XHRcdFx0XHQ8aT4gdHlwZSA9PSAnTmFtZWRQYXJhbScgPyAnOiAnIDogJyA9ICdcblx0XHRcdFx0XHQ8VmFsdWVbZGF0YTpkZWZhdWx0c10+XG5cbnRhZyBNZXRob2QgPCBJdGVtXG5cblx0cHJvcCBpbmFtZVxuXHRwcm9wIHBhdGhcblxuXHRkZWYgdGFnc1xuXHRcdDxkaXZAdGFncz5cblx0XHRcdDxSZXR1cm5bZGF0YTpyZXR1cm5dIG5hbWU9J3JldHVybnMnPiBpZiBkYXRhOnJldHVyblxuXG5cdFx0XHRpZiBkYXRhOmRlcHJlY2F0ZWRcblx0XHRcdFx0PC5kZXByZWNhdGVkLnJlZD4gJ01ldGhvZCBpcyBkZXByZWNhdGVkJ1xuXHRcdFx0aWYgZGF0YTpwcml2YXRlXG5cdFx0XHRcdDwucHJpdmF0ZS5yZWQ+ICdNZXRob2QgaXMgcHJpdmF0ZSdcblxuXG5cdGRlZiBwYXRoXG5cdFx0QHBhdGggb3IgKGluYW1lICsgJy4nICsgZGF0YTpuYW1lKVxuXG5cdGRlZiBzbHVnXG5cdFx0cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC5kZXByZWNhdGVkPShkYXRhOmRlcHJlY2F0ZWQpID5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9c2x1Zz5cblx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHQ8UGF0aFtwYXRoXT5cblx0XHRcdFx0PC5wYXJhbXM+IGZvciBwYXJhbSBpbiBkYXRhOnBhcmFtc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRcdDwuZ3Jvdz5cblx0XHRcdDxEZXNjLm1kIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0dGFnc1xuXG50YWcgTGluayA8IGFcblx0cHJvcCBzaG9ydFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiBocmVmPVwiL2RvY3Mje3BhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKX1cIj4gPFBhdGhbZGF0YTpuYW1lcGF0aF0gc2hvcnQ9c2hvcnQ+XG5cdFx0c3VwZXJcblxuXHRkZWYgb250YXBcblx0XHRzdXBlclxuXHRcdHRyaWdnZXIoJ3JlZm9jdXMnKVxuXG50YWcgR3JvdXBcblxuXHRkZWYgb250YXBcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXG5cbmV4cG9ydCB0YWcgRG9jc1BhZ2UgPCBQYWdlXG5cblx0cHJvcCB2ZXJzaW9uIGRlZmF1bHQ6ICdjdXJyZW50J1xuXHRwcm9wIHJvb3RzXG5cblx0ZGVmIHNyY1xuXHRcdFwiL2FwaS97dmVyc2lvbn0uanNvblwiXG5cblx0ZGVmIGRvY3Ncblx0XHRAZG9jc1xuXG5cdGRlZiBzZXR1cFxuXHRcdGxvYWRcblx0XHRzdXBlclxuXG5cdGRlZiBsb2FkXG5cdFx0dmFyIGRvY3MgPSBhd2FpdCBhcHAuZmV0Y2goc3JjKVxuXHRcdERPQ1MgPSBAZG9jcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG5cdFx0RE9DTUFQID0gQGRvY3M6ZW50aXRpZXNcblx0XHRnZW5lcmF0ZVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRsb2FkZWRcblxuXHRkZWYgbG9hZGVkXG5cdFx0cmVuZGVyXG5cdFx0aWYgZG9jdW1lbnQ6bG9jYXRpb246aGFzaFxuXHRcdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJlZm9jdXMgZVxuXHRcdHJlZm9jdXNcblxuXHRkZWYgcmVmb2N1c1xuXHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblxuXHRkZWYgbG9va3VwIHBhdGhcblx0XHRkb2NzOmVudGl0aWVzW3BhdGhdXG5cblx0ZGVmIGdlbmVyYXRlXG5cdFx0QHJvb3RzID0gW11cblx0XHR2YXIgZW50cyA9IEBkb2NzOmVudGl0aWVzXG5cblx0XHRmb3Igb3duIHBhdGgsaXRlbSBvZiBkb2NzOmVudGl0aWVzXG5cdFx0XHRpZiBpdGVtOnR5cGUgPT0gJ2NsYXNzJyBvciBwYXRoID09ICdJbWJhJ1xuXHRcdFx0XHRpdGVtWycuJ10gPSAoaXRlbVsnLiddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXHRcdFx0XHRpdGVtWycjJ10gPSAoaXRlbVsnIyddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXG5cdFx0XHRcdEByb290cy5wdXNoKGl0ZW0pIGlmIGl0ZW06ZGVzY1xuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRvY3Ncblx0XHRcblx0XHQ8c2VsZj5cblx0XHRcdDxuYXZAbmF2PiA8LmNvbnRlbnQ+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PEdyb3VwLnRvYy5jbGFzcy5zZWN0aW9uLmNvbXBhY3Q+XG5cdFx0XHRcdFx0XHQ8LmhlYWRlcj4gPExpbmtbcm9vdF0uY2xhc3M+XG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0XHRcdDwuc3RhdGljPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJy4nXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdFx0XHRcdFx0PC5pbnN0YW5jZT5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycjJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHQ8LmJvZHk+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PENsYXNzW3Jvb3RdLmRvYy5sPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0RvY3NQYWdlLmltYmEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbGVzcy9zaXRlLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuZXhwb3J0IHRhZyBMb2dvXG5cdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3ZnOnN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMTZcIiBoZWlnaHQ9XCIxMDhcIiB2aWV3Qm94PVwiMCAwIDExNiAxMDhcIj5cblx0XHRcdFx0PHN2ZzpnIGZpbGw9XCIjM0U5MUZGXCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiPlxuXHRcdFx0XHRcdDxzdmc6cGF0aCBkPVwiTTM4Ljg2Mzg4NjkgNjguMTM1MTQyNEMzOS41MDczNDc2IDY5LjU3MjcxIDM5LjY4OTAwNTcgNzAuOTU0NzgyNSAzOS40MDg4NjY2IDcyLjI4MTQwMTQgMzkuMTI4NzI3NiA3My42MDgwMjA0IDM4LjQ0MzcwMjIgNzQuNjA5NjgwNSAzNy4zNTM3Njk5IDc1LjI4NjQxMTggMzYuMjYzODM3NSA3NS45NjMxNDMyIDM1LjAxODcyODggNzYuMTUxNzAzMyAzMy42MTg0MDYyIDc1Ljg1MjA5NzkgMzIuNzEyMzE1MiA3NS42NTgyMzU2IDMxLjczNTIwNyA3NS4xODkyMDM1IDMwLjY4NzA1MjMgNzQuNDQ0OTg3NSAyOC45NDI5MTA5IDcyLjUxMTk0NSAyNi45OTU0NTQ3IDcwLjMxODc3OTcgMjQuODQ0NjI1MiA2Ny44NjU0MjU3IDIyLjY5Mzc5NTggNjUuNDEyMDcxOCAyMC41MTA1Njc0IDYyLjkwODQ4NjYgMTguMjk0ODc0OCA2MC4zNTQ1OTUxIDE2LjA3OTE4MjEgNTcuODAwNzAzNSAxMy45MDAzMzA5IDU1LjI3NjM5MDIgMTEuNzU4MjU1OCA1Mi43ODE1Nzk0IDkuNjE2MTgwNjYgNTAuMjg2NzY4NiA3LjYzMTkxNjIgNDguMDY0MDYzNCA1LjgwNTQwMjg2IDQ2LjExMzM5NyA0Ljc2NzU5MTI4IDQ0LjUwNDc5NjUgNC4zOTc1MTQ5MiA0Mi45OTU3NTI2IDQuNjk1MTYyNjYgNDEuNTg2MjIgNS4wNDUzMzY0OCAzOS45Mjc5NDY0IDYuMTM0MjU1NDMgMzguNjQ0NDAyNyA3Ljk2MTk1MjE2IDM3LjczNTU1MDZMMTEuMjE0NzIyNyAzNi4wOTE2OTQyQzEyLjkwMTM1MjggMzUuMjM5MzIgMTQuOTQwNjE4OCAzNC4yNDU3NjU4IDE3LjMzMjU4MTggMzMuMTExMDAyMSAxOS43MjQ1NDQ4IDMxLjk3NjIzODMgMjIuMjQ1Njk3OSAzMC43MzkxNTIzIDI0Ljg5NjExNjcgMjkuMzk5NzA3MSAyNy41NDY1MzU2IDI4LjA2MDI2MTkgMzAuMDY3Njg4NyAyNi44MjMxNzU5IDMyLjQ1OTY1MTcgMjUuNjg4NDEyMSAzNC44NTE2MTQ3IDI0LjU1MzY0ODMgMzYuOTE1ODUwNCAyMy41NDM3NzIgMzguNjUyNDIwOSAyMi42NTg3NTI4IDQwLjM4ODk5MTQgMjEuNzczNzMzNyA0MS40NDgyNjc2IDIxLjI0MjEwOTMgNDEuODMwMjgxMyAyMS4wNjM4NjM2IDQzLjU5MzUwNTkgMjAuMjI4NTE1NiA1My42MTYyMTA5IDE4Ljc5MjIzNjMgNTIuNDIxNzM5MSAyMi43MzI1NDkxTDQ3LjkxMTU1NTYgMzkuODAwODMwOUM0Ny44MDc3ODA1IDQwLjE5MzU1NjEgNDcuNDc2NzUyIDQwLjQ4NDQ4NjMgNDcuMDczOTUyNCA0MC41MzY5NzNMMTguMDY1NjA5IDQ0LjMxNjg5OTFDMTkuNDUwNDE2OSA0NS45MTMwODEzIDIxLjA2MzUxNDggNDcuNzUzMDY5MiAyMi45MDQ5NTExIDQ5LjgzNjkxOCAyNC43NDYzODczIDUxLjkyMDc2NjggMjYuNTk5NjM0NCA1NC4wNTA0NDY0IDI4LjQ2NDc0NzkgNTYuMjI2MDIwOCAzMC4zMjk4NjE1IDU4LjQwMTU5NTIgMzIuMTgzMTA4NiA2MC41MzEyNzQ4IDM0LjAyNDU0NDggNjIuNjE1MTIzNiAzNS44NjU5ODExIDY0LjY5ODk3MjMgMzcuNDc5MDc5IDY2LjUzODk2MDIgMzguODYzODg2OSA2OC4xMzUxNDI0ek02Ny4yMDkwMzUzIDc2LjIyMjE3NzNDNjUuOTE5OTI4NSA3Ny4xMDg2NzYgNjUuMDU1NzE0NyA3OC4xODQ0MjI1IDY0LjYxNjM2OCA3OS40NDk0NDkxIDY0LjE3NzAyMTMgODAuNzE0NDc1NiA2NC4yNTE3OTU5IDgxLjkxMTc4OTcgNjQuODQwNjk0IDgzLjA0MTQyNzEgNjUuNDI5NTkyMSA4NC4xNzEwNjQ0IDY2LjQwMTg3NzggODQuOTY3Mjc1IDY3Ljc1NzU4MDQgODUuNDMwMDgyNSA2OC42MzQ3OTk4IDg1LjcyOTU0NjIgNjkuNzE0MDAxMiA4NS44MzI2NTE5IDcwLjk5NTIxNzIgODUuNzM5NDAyNSA3My40ODMxNjI1IDg0Ljk5Njg0NyA3Ni4yNzg5NTU0IDg0LjEzODMxNTkgNzkuMzgyNjc5OSA4My4xNjM3ODM0IDgyLjQ4NjQwNDMgODIuMTg5MjUwOCA4NS42NDM2ODQ1IDgxLjE4ODgxMzMgODguODU0NjE1MyA4MC4xNjI0NDA2IDkyLjA2NTU0NjEgNzkuMTM2MDY3OSA5NS4yMjk2OTExIDc4LjExNTg2NDUgOTguMzQ3MTQ1MSA3Ny4xMDE4IDEwMS40NjQ1OTkgNzYuMDg3NzM1NCAxMDQuMzA3MTMgNzUuMjIzMDUwMyAxMDYuODc0ODIyIDc0LjUwNzcxODcgMTA4LjU5MDEyNCA3My42NzgyNzU3IDEwOS42ODExNjIgNzIuNTkxNTI1MiAxMTAuMTQ3OTY4IDcxLjI0NzQzNDQgMTEwLjY5NzE1MSA2OS42NjYxNTEyIDExMC40MjAwOTIgNjguMDIzOTI1MyAxMDkuMzE2NzgzIDY2LjMyMDcwNzRMMTA3LjM2NjcyMSA2My4yNjcxODEzQzEwNi4zNTU1NzQgNjEuNjgzODYzNSAxMDUuMTE0MDQgNTkuODAwODIzNiAxMDMuNjQyMDg0IDU3LjYxODAwNTMgMTAyLjE3MDEyOCA1NS40MzUxODY5IDEwMC42Mzk3IDUzLjA5OTc3NzMgOTkuMDUwNzUyOSA1MC42MTE3MDY1IDk3LjQ2MTgwNjIgNDguMTIzNjM1NyA5NS45MzEzNzc4IDQ1Ljc4ODIyNjIgOTQuNDU5NDIxNyA0My42MDU0MDc4IDkyLjk4NzQ2NTYgNDEuNDIyNTg5NCA5MS43MzI4NjA0IDM5LjUxMjk3NzkgOTAuNjk1NTY4NSAzNy44NzY1MTYxIDg5LjY1ODI3NjYgMzYuMjQwMDU0MiA4OS4wMjEzMzQ1IDM1LjI0ODc5NCA4OC43ODQ3MjMyIDM0LjkwMjcwNTYgODcuMzQ1NzAzMSAzMi43OTE5OTIyIDgwLjMwMTAyNTQgMjYuMjA4MDA3OCA3OC44MzY5MDA1IDMwLjg5NzA2OTJMNzMuOTY1NDc4OSA0Ny42MjQyMDU2QzczLjg1MTMxODQgNDguMDE2MjAxNCA3My45ODY5MjQ5IDQ4LjQzODIzMTYgNzQuMzA4MDU1MSA0OC42OTAzNjAxTDk3LjI3MDE3MjUgNjYuNzE4NTc3MUM5NS4yNjMzNDA4IDY3LjM2MDA2MDEgOTIuOTM1NTgyNCA2OC4wOTA5NDg1IDkwLjI4NjgyNzUgNjguOTExMjY0MyA4Ny42MzgwNzI2IDY5LjczMTU4MDEgODQuOTU1NjkxNiA3MC41ODQ2MDkyIDgyLjIzOTYwMzkgNzEuNDcwMzc3MiA3OS41MjM1MTYzIDcyLjM1NjE0NTIgNzYuODQxMTM1MiA3My4yMDkxNzQzIDc0LjE5MjM4MDMgNzQuMDI5NDkwMiA3MS41NDM2MjU1IDc0Ljg0OTgwNiA2OS4yMTU4NjcxIDc1LjU4MDY5NDQgNjcuMjA5MDM1MyA3Ni4yMjIxNzczek02NS40NTAxNDAxIDguMDExMzExMThDNjYuMzEwNzkzNSA2LjQ4NjA4MTI5IDY3LjMwOTM3MDYgNS40MzUyNTUyMyA2OC40NDU5MDEyIDQuODU4ODAxNDcgNjkuNTgyNDMxOCA0LjI4MjM0NzcxIDcwLjczMjI1OTUgNC4xNDc0MzIwNiA3MS44OTU0MTg4IDQuNDU0MDUwNDggNzIuOTc1NDk1MyA0LjczODc2NzU5IDczLjg5MzA2NzEgNS4zNzQ4NjQ4NyA3NC42NDgxNjE2IDYuMzYyMzYxNDEgNzUuNDAzMjU2MiA3LjM0OTg1Nzk1IDc1Ljc3NzAxNjEgOC42NzQ4Mzk0NiA3NS43Njk0NTI3IDEwLjMzNzM0NTdMNTEuMzkyNzE2IDk5LjgzODcxOTdDNTAuNzk3NjA3OSAxMDEuNjk2NzY1IDQ5Ljg1Mjc5NDEgMTAyLjk1ODg3MyA0OC41NTgyNDYzIDEwMy42MjUwOCA0Ny4yNjM2OTg2IDEwNC4yOTEyODcgNDUuOTkzMzIyNyAxMDQuNDYwMTI4IDQ0Ljc0NzA4MDYgMTA0LjEzMTYwOCA0My41ODM5MjEyIDEwMy44MjQ5OSA0Mi42MjA3MzQ1IDEwMy4xMTExNjUgNDEuODU3NDkxNSAxMDEuOTkwMTEzIDQxLjA5NDI0ODUgMTAwLjg2OTA2IDQwLjgzMjg4ODQgOTkuMzc2NTk5MyA0MS4wNzM0MDM0IDk3LjUxMjY4NTJMNjUuNDUwMTQwMSA4LjAxMTMxMTE4elwiPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Mb2dvLmltYmEiXSwic291cmNlUm9vdCI6IiJ9