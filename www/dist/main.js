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
		
		// var js = 'var require = function(){ return Imba };\n' + data:js:code
		var js = self.data().js.code;
		console.log(Imba);
		js = js.replace("require('imba')",'window.Imba');
		try {
			Imba.mount = function(item) { return orig.call(Imba,item,self._result.dom()); };
			console.log("run code",js);
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

Imba.Event.prototype.button = function (){
	return this.event().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.event().keyCode;
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
	return this.event().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.event().y;
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
		console.log("loading app.router");
		return new Promise(function(resolve) {
			console.log("Site#load");
			return setTimeout(resolve,200);
		});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		console.log("render site",this.app().path());
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('header',$,0,this).setId('header').setContent(
				$[1] || _1('nav',$,1,0).flag('content').setContent([
					_1(Logo,$,2,1),
					_1('a',$,3,1).flag('tab').flag('logo').setHref('/home').setContent($[4] || _1('i',$,4,3).setText('imba'),2),
					_1('span',$,5,1).flag('greedy'),
					_1('a',$,6,1).flag('tab').flag('home').setHref('/home').setContent($[7] || _1('i',$,7,6).setText('home'),2),
					_1('a',$,8,1).flag('tab').flag('guides').setHref('/guide').setContent($[9] || _1('i',$,9,8).setText('learn'),2),
					_1('a',$,10,1).flag('tab').flag('docs').setHref('/docs').setContent($[11] || _1('i',$,11,10).setText('api'),2),
					_1('a',$,12,1).flag('tab').flag('docs').setHref('/examples').setContent($[13] || _1('i',$,13,12).setText('examples'),2),
					// <a.twitter href='http://twitter.com/imbajs'> <i> 'twitter'
					_1('a',$,14,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[15] || _1('i',$,15,14).setText('github'),2),
					// <a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					_1('a',$,16,1).flag('menu').on$(0,['tap','toggleMenu'],this).setContent($[17] || _1('b',$,17,16),2)
				],2)
			,2),
			
			_1('main',$,18,this),
			
			_1('footer',$,22,this).setId('footer').setContent([
				_1('hr',$,23,22),
				_1('div',$,24,22).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,25,22).flag('rgt').setContent([
					_1('a',$,26,25).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,27,25).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,28,25).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,29,25).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].end((
					$[2].end(),
					$[3].end(),
					$[6].end(),
					$[8].end(),
					$[10].end(),
					$[12].end(),
					$[14].end(),
					$[16].end()
				,true))
			,true)),
			$[18].setContent(
				this.router().scoped('/home') ? (
					($[19] || _1(HomePage,$,19,18)).end()
				) : (this.router().scoped('/guide') ? (
					($[20] || _1(GuidesPage,$,20,18)).bindData(this.app(),'guide',[]).end()
				) : (this.router().scoped('/docs') ? (
					($[21] || _1(DocsPage,$,21,18)).end()
				) : void(0)))
			,3).end(),
			$[22].end((
				$[25].end()
			,true))
		,true));
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
						_1('a',$,6,4).flag('button').flag('start').setHref('/examples').setText("Examples"),
						_1('a',$,7,4).flag('button').flag('github').setHref('https://github.com/somebee/imba').setText("Github")
					],2)
				],2)
			
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			],2),
			_1('div',$,8,0).flag('content').setContent([
				_1(Marked,$,9,8).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,10,8).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,11,8).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
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
				$[8].end((
					$[9].end(),
					$[10].end(),
					$[11].end()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWJiY2M3ZWM3MDU2MzAyM2E2N2YiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Mb2dvLmltYmEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDN0RBLE9BQU8sUUFBUTs7Ozs7Ozs7Ozs7O0lDSVgsS0FBSzs7Ozs7Ozs7OztBQVNUO1FBQ0M7RUFDQztTQUNBLEtBQUs7R0FGTzs7Ozs7Ozs7Ozs7QUFXZDtRQUNDLFlBQVksTUFBTTs7Ozs7OztBQUtuQjtRQUNDLGNBQWM7Ozs7Ozs7QUFLZjtRQUNDLGFBQWE7Ozs7QUFHZDtDQUNDOzthQUNZLElBQUcsSUFBSSxlQUFlLE1BQWpDLElBQUksR0FBRyxFQUFFOzs7Q0FFVixJQUFJLFVBQVUsRUFBRSxPQUFPLE9BQU8sSUFBSTtDQUNsQyxJQUFJLFVB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O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixFQUFFO0FBQ25COztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxPQUFPO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsOEJBQThCO0FBQy9DLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsNkJBQTZCO0FBQzlDOztBQUVBO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtDQUFrQyxrQkFBa0I7QUFDcEQsd0JBQXdCO0FBQ3hCLHdCQUF3QjtBQUN4QiwwQkFBMEI7QUFDMUIseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7QUFDQSw4REFBOEQ7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsc0JBQXNCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLDRCQUE0Qjs7QUFFOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVLG1CQUFtQjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7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Y2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhYmJjYzdlYzcwNTYzMDIzYTY3ZiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSBcIi4vc3JjL2ltYmEvaW5kZXguaW1iYVwiXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvaW1iYS5pbWJhIiwiIyMjXG5JbWJhIGlzIHRoZSBuYW1lc3BhY2UgZm9yIGFsbCBydW50aW1lIHJlbGF0ZWQgdXRpbGl0aWVzXG5AbmFtZXNwYWNlXG4jIyNcbnZhciBJbWJhID0ge1ZFUlNJT046ICcxLjMuMC1iZXRhLjEyJ31cblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRUaW1lb3V0IHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgdGhlIHRpbWVvdXQgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0VGltZW91dCBkZWxheSwgJmJsb2NrXG5cdHNldFRpbWVvdXQoJixkZWxheSkgZG9cblx0XHRibG9jaygpXG5cdFx0SW1iYS5jb21taXRcblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRJbnRlcnZhbCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIGV2ZXJ5IGludGVydmFsIHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldEludGVydmFsIGludGVydmFsLCAmYmxvY2tcblx0c2V0SW50ZXJ2YWwoYmxvY2ssaW50ZXJ2YWwpXG5cbiMjI1xuQ2xlYXIgaW50ZXJ2YWwgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJJbnRlcnZhbCBpZFxuXHRjbGVhckludGVydmFsKGlkKVxuXG4jIyNcbkNsZWFyIHRpbWVvdXQgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJUaW1lb3V0IGlkXG5cdGNsZWFyVGltZW91dChpZClcblxuXG5kZWYgSW1iYS5zdWJjbGFzcyBvYmosIHN1cFxuXHRmb3Igayx2IG9mIHN1cFxuXHRcdG9ialtrXSA9IHYgaWYgc3VwLmhhc093blByb3BlcnR5KGspXG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmluaXRpYWxpemUgPSBvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHJldHVybiBvYmpcblxuIyMjXG5MaWdodHdlaWdodCBtZXRob2QgZm9yIG1ha2luZyBhbiBvYmplY3QgaXRlcmFibGUgaW4gaW1iYXMgZm9yL2luIGxvb3BzLlxuSWYgdGhlIGNvbXBpbGVyIGNhbm5vdCBzYXkgZm9yIGNlcnRhaW4gdGhhdCBhIHRhcmdldCBpbiBhIGZvciBsb29wIGlzIGFuXG5hcnJheSwgaXQgd2lsbCBjYWNoZSB0aGUgaXRlcmFibGUgdmVyc2lvbiBiZWZvcmUgbG9vcGluZy5cblxuYGBgaW1iYVxuIyB0aGlzIGlzIHRoZSB3aG9sZSBtZXRob2RcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG5jbGFzcyBDdXN0b21JdGVyYWJsZVxuXHRkZWYgdG9BcnJheVxuXHRcdFsxLDIsM11cblxuIyB3aWxsIHJldHVybiBbMiw0LDZdXG5mb3IgeCBpbiBDdXN0b21JdGVyYWJsZS5uZXdcblx0eCAqIDJcblxuYGBgXG4jIyNcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG4jIyNcbkNvZXJjZXMgYSB2YWx1ZSBpbnRvIGEgcHJvbWlzZS4gSWYgdmFsdWUgaXMgYXJyYXkgaXQgd2lsbFxuY2FsbCBgUHJvbWlzZS5hbGwodmFsdWUpYCwgb3IgaWYgaXQgaXMgbm90IGEgcHJvbWlzZSBpdCB3aWxsXG53cmFwIHRoZSB2YWx1ZSBpbiBgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKWAuIFVzZWQgZm9yIGV4cGVyaW1lbnRhbFxuYXdhaXQgc3ludGF4LlxuQHJldHVybiB7UHJvbWlzZX1cbiMjI1xuZGVmIEltYmEuYXdhaXQgdmFsdWVcblx0aWYgdmFsdWUgaXNhIEFycmF5XG5cdFx0Y29uc29sZS53YXJuKFwiYXdhaXQgKEFycmF5KSBpcyBkZXByZWNhdGVkIC0gdXNlIGF3YWl0IFByb21pc2UuYWxsKEFycmF5KVwiKVxuXHRcdFByb21pc2UuYWxsKHZhbHVlKVxuXHRlbGlmIHZhbHVlIGFuZCB2YWx1ZTp0aGVuXG5cdFx0dmFsdWVcblx0ZWxzZVxuXHRcdFByb21pc2UucmVzb2x2ZSh2YWx1ZSlcblxudmFyIGRhc2hSZWdleCA9IC8tLi9nXG52YXIgc2V0dGVyQ2FjaGUgPSB7fVxuXG5kZWYgSW1iYS50b0NhbWVsQ2FzZSBzdHJcblx0aWYgc3RyLmluZGV4T2YoJy0nKSA+PSAwXG5cdFx0c3RyLnJlcGxhY2UoZGFzaFJlZ2V4KSBkbyB8bXwgbS5jaGFyQXQoMSkudG9VcHBlckNhc2Vcblx0ZWxzZVxuXHRcdHN0clxuXHRcdFxuZGVmIEltYmEudG9TZXR0ZXIgc3RyXG5cdHNldHRlckNhY2hlW3N0cl0gfHw9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgc3RyKVxuXG5kZWYgSW1iYS5pbmRleE9mIGEsYlxuXHRyZXR1cm4gKGIgJiYgYjppbmRleE9mKSA/IGIuaW5kZXhPZihhKSA6IFtdOmluZGV4T2YuY2FsbChhLGIpXG5cbmRlZiBJbWJhLmxlbiBhXG5cdHJldHVybiBhICYmIChhOmxlbiBpc2EgRnVuY3Rpb24gPyBhOmxlbi5jYWxsKGEpIDogYTpsZW5ndGgpIG9yIDBcblxuZGVmIEltYmEucHJvcCBzY29wZSwgbmFtZSwgb3B0c1xuXHRpZiBzY29wZTpkZWZpbmVQcm9wZXJ0eVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVQcm9wZXJ0eShuYW1lLG9wdHMpXG5cdHJldHVyblxuXG5kZWYgSW1iYS5hdHRyIHNjb3BlLCBuYW1lLCBvcHRzID0ge31cblx0aWYgc2NvcGU6ZGVmaW5lQXR0cmlidXRlXG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZUF0dHJpYnV0ZShuYW1lLG9wdHMpXG5cblx0bGV0IGdldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKG5hbWUpXG5cdGxldCBzZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBuYW1lKVxuXHRsZXQgcHJvdG8gPSBzY29wZTpwcm90b3R5cGVcblxuXHRpZiBvcHRzOmRvbVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5kb21bbmFtZV1cblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdGlmIHZhbHVlICE9IHRoaXNbbmFtZV0oKVxuXHRcdFx0XHR0aGlzLmRvbVtuYW1lXSA9IHZhbHVlXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRlbHNlXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRcdHJldHVybiB0aGlzXG5cdHJldHVyblxuXG5kZWYgSW1iYS5wcm9wRGlkU2V0IG9iamVjdCwgcHJvcGVydHksIHZhbCwgcHJldlxuXHRsZXQgZm4gPSBwcm9wZXJ0eTp3YXRjaFxuXHRpZiBmbiBpc2EgRnVuY3Rpb25cblx0XHRmbi5jYWxsKG9iamVjdCx2YWwscHJldixwcm9wZXJ0eSlcblx0ZWxpZiBmbiBpc2EgU3RyaW5nIGFuZCBvYmplY3RbZm5dXG5cdFx0b2JqZWN0W2ZuXSh2YWwscHJldixwcm9wZXJ0eSlcblx0cmV0dXJuXG5cblxuIyBCYXNpYyBldmVudHNcbmRlZiBlbWl0X18gZXZlbnQsIGFyZ3MsIG5vZGVcblx0IyB2YXIgbm9kZSA9IGNic1tldmVudF1cblx0dmFyIHByZXYsIGNiLCByZXRcblxuXHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRpZiBjYiA9IG5vZGU6bGlzdGVuZXJcblx0XHRcdGlmIG5vZGU6cGF0aCBhbmQgY2Jbbm9kZTpwYXRoXVxuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2Jbbm9kZTpwYXRoXS5hcHBseShjYixhcmdzKSA6IGNiW25vZGU6cGF0aF0oKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIGNoZWNrIGlmIGl0IGlzIGEgbWV0aG9kP1xuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2IuYXBwbHkobm9kZSwgYXJncykgOiBjYi5jYWxsKG5vZGUpXG5cblx0XHRpZiBub2RlOnRpbWVzICYmIC0tbm9kZTp0aW1lcyA8PSAwXG5cdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdHJldHVyblxuXG4jIG1ldGhvZCBmb3IgcmVnaXN0ZXJpbmcgYSBsaXN0ZW5lciBvbiBvYmplY3RcbmRlZiBJbWJhLmxpc3RlbiBvYmosIGV2ZW50LCBsaXN0ZW5lciwgcGF0aFxuXHR2YXIgY2JzLCBsaXN0LCB0YWlsXG5cdGNicyA9IG9iajpfX2xpc3RlbmVyc19fIHx8PSB7fVxuXHRsaXN0ID0gY2JzW2V2ZW50XSB8fD0ge31cblx0dGFpbCA9IGxpc3Q6dGFpbCB8fCAobGlzdDp0YWlsID0gKGxpc3Q6bmV4dCA9IHt9KSlcblx0dGFpbDpsaXN0ZW5lciA9IGxpc3RlbmVyXG5cdHRhaWw6cGF0aCA9IHBhdGhcblx0bGlzdDp0YWlsID0gdGFpbDpuZXh0ID0ge31cblx0cmV0dXJuIHRhaWxcblxuIyByZWdpc3RlciBhIGxpc3RlbmVyIG9uY2VcbmRlZiBJbWJhLm9uY2Ugb2JqLCBldmVudCwgbGlzdGVuZXJcblx0dmFyIHRhaWwgPSBJbWJhLmxpc3RlbihvYmosZXZlbnQsbGlzdGVuZXIpXG5cdHRhaWw6dGltZXMgPSAxXG5cdHJldHVybiB0YWlsXG5cbiMgcmVtb3ZlIGEgbGlzdGVuZXJcbmRlZiBJbWJhLnVubGlzdGVuIG9iaiwgZXZlbnQsIGNiLCBtZXRoXG5cdHZhciBub2RlLCBwcmV2XG5cdHZhciBtZXRhID0gb2JqOl9fbGlzdGVuZXJzX19cblx0cmV0dXJuIHVubGVzcyBtZXRhXG5cblx0aWYgbm9kZSA9IG1ldGFbZXZlbnRdXG5cdFx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0XHRpZiBub2RlID09IGNiIHx8IG5vZGU6bGlzdGVuZXIgPT0gY2Jcblx0XHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRcdCMgY2hlY2sgZm9yIGNvcnJlY3QgcGF0aCBhcyB3ZWxsP1xuXHRcdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRcdFx0XHRicmVha1xuXHRyZXR1cm5cblxuIyBlbWl0IGV2ZW50XG5kZWYgSW1iYS5lbWl0IG9iaiwgZXZlbnQsIHBhcmFtc1xuXHRpZiB2YXIgY2IgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRcdGVtaXRfXyhldmVudCxwYXJhbXMsY2JbZXZlbnRdKSBpZiBjYltldmVudF1cblx0XHRlbWl0X18oZXZlbnQsW2V2ZW50LHBhcmFtc10sY2I6YWxsKSBpZiBjYjphbGwgIyBhbmQgZXZlbnQgIT0gJ2FsbCdcblx0cmV0dXJuXG5cbmRlZiBJbWJhLm9ic2VydmVQcm9wZXJ0eSBvYnNlcnZlciwga2V5LCB0cmlnZ2VyLCB0YXJnZXQsIHByZXZcblx0aWYgcHJldiBhbmQgdHlwZW9mIHByZXYgPT0gJ29iamVjdCdcblx0XHRJbWJhLnVubGlzdGVuKHByZXYsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0aWYgdGFyZ2V0IGFuZCB0eXBlb2YgdGFyZ2V0ID09ICdvYmplY3QnXG5cdFx0SW1iYS5saXN0ZW4odGFyZ2V0LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdHNlbGZcblxubW9kdWxlOmV4cG9ydHMgPSBJbWJhXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbWJhLmltYmEiLCJleHBvcnQgdGFnIFBhZ2VcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlBvaW50ZXJcblx0XG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGJ1dHRvbiA9IC0xXG5cdFx0QGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBidXR0b25cblx0XHRAYnV0dG9uXG5cblx0ZGVmIHRvdWNoXG5cdFx0QHRvdWNoXG5cblx0ZGVmIHVwZGF0ZSBlXG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBkaXJ0eSA9IHllc1xuXHRcdHNlbGZcblxuXHQjIHRoaXMgaXMganVzdCBmb3IgcmVndWxhciBtb3VzZSBub3dcblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgZTEgPSBAZXZlbnRcblxuXHRcdGlmIEBkaXJ0eVxuXHRcdFx0QHByZXZFdmVudCA9IGUxXG5cdFx0XHRAZGlydHkgPSBub1xuXG5cdFx0XHQjIGJ1dHRvbiBzaG91bGQgb25seSBjaGFuZ2Ugb24gbW91c2Vkb3duIGV0Y1xuXHRcdFx0aWYgZTE6dHlwZSA9PSAnbW91c2Vkb3duJ1xuXHRcdFx0XHRAYnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0aWYgKEB0b3VjaCBhbmQgQGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHRAdG91Y2guY2FuY2VsIGlmIEB0b3VjaFxuXHRcdFx0XHRAdG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHRAdG91Y2gubW91c2Vkb3duKGUxLGUxKVxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNlbW92ZSdcblx0XHRcdFx0QHRvdWNoLm1vdXNlbW92ZShlMSxlMSkgaWYgQHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0QGJ1dHRvbiA9IC0xXG5cblx0XHRcdFx0aWYgQHRvdWNoIGFuZCBAdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdEB0b3VjaC5tb3VzZXVwKGUxLGUxKVxuXHRcdFx0XHRcdEB0b3VjaCA9IG51bGxcblx0XHRcdFx0IyB0cmlnZ2VyIHBvaW50ZXJ1cFxuXHRcdGVsaWYgQHRvdWNoXG5cdFx0XHRAdG91Y2guaWRsZVxuXHRcdHNlbGZcblxuXHRkZWYgeCBkbyBAZXZlbnQ6eFxuXHRkZWYgeSBkbyBAZXZlbnQ6eVxuXHRcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcG9pbnRlci5pbWJhIiwiZXh0ZXJuIGV2YWxcblxuZXhwb3J0IHRhZyBTbmlwcGV0XG5cdHByb3Agc3JjXG5cdHByb3AgaGVhZGluZ1xuXHRwcm9wIGhsXG5cdFxuXHRkZWYgc2VsZi5yZXBsYWNlIGRvbVxuXHRcdGxldCBpbWJhID0gZG9tOmZpcnN0Q2hpbGRcblx0XHRsZXQganMgPSBpbWJhOm5leHRTaWJsaW5nXG5cdFx0bGV0IGhpZ2hsaWdodGVkID0gaW1iYTppbm5lckhUTUxcblx0XHRsZXQgcmF3ID0gZG9tOnRleHRDb250ZW50XG5cdFx0bGV0IGRhdGEgPVxuXHRcdFx0Y29kZTogcmF3XG5cdFx0XHRodG1sOiBoaWdobGlnaHRlZFxuXHRcdFx0anM6IHtcblx0XHRcdFx0Y29kZToganM6dGV4dENvbnRlbnRcblx0XHRcdFx0aHRtbDoganM6aW5uZXJIVE1MXG5cdFx0XHR9XG5cblx0XHRsZXQgc25pcHBldCA9IDxTbmlwcGV0W2RhdGFdPlxuXHRcdGRvbTpwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzbmlwcGV0LmRvbSxkb20pXG5cdFx0cmV0dXJuIHNuaXBwZXRcblx0XHRcblx0ZGVmIHNldHVwXG5cdFx0cmVuZGVyXG5cdFx0QGNvZGUuZG9tOmlubmVySFRNTCA9IGRhdGE6aHRtbFxuXHRcdHJ1blxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJ1blxuXHRcdHZhciBvcmlnID0gSW1iYTptb3VudFxuXHRcdFxuXHRcdCMgdmFyIGpzID0gJ3ZhciByZXF1aXJlID0gZnVuY3Rpb24oKXsgcmV0dXJuIEltYmEgfTtcXG4nICsgZGF0YTpqczpjb2RlXG5cdFx0dmFyIGpzID0gZGF0YTpqczpjb2RlXG5cdFx0Y29uc29sZS5sb2cgSW1iYVxuXHRcdGpzID0ganMucmVwbGFjZShcInJlcXVpcmUoJ2ltYmEnKVwiLCd3aW5kb3cuSW1iYScpXG5cdFx0dHJ5XG5cdFx0XHRJbWJhOm1vdW50ID0gZG8gfGl0ZW18IG9yaWcuY2FsbChJbWJhLGl0ZW0sQHJlc3VsdC5kb20pXG5cdFx0XHRjb25zb2xlLmxvZyBcInJ1biBjb2RlXCIsIGpzXG5cdFx0XHRldmFsKGpzKVxuXHRcdFxuXHRcdEltYmE6bW91bnQgPSBvcmlnXG5cdFx0c2VsZlxuXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnNuaXBwZXQ+XG5cdFx0XHQ8Y29kZUBjb2RlPlxuXHRcdFx0PGRpdkByZXN1bHQuc3R5bGVkLWV4YW1wbGU+XG5cdFx0XG5leHBvcnQgdGFnIEV4YW1wbGUgPCBTbmlwcGV0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiBcIkV4YW1wbGVcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TbmlwcGV0LmltYmEiLCJcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnXG5pbXBvcnQgU2l0ZSBmcm9tICcuL3ZpZXdzL1NpdGUnXG5kb2N1bWVudDpib2R5OmlubmVySFRNTCA9ICcnIFxuSW1iYS5tb3VudCA8U2l0ZVtBUFAgPSBBcHAuZGVzZXJpYWxpemUoQVBQQ0FDSEUpXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY2xpZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcbnZhciBhY3RpdmF0ZSA9IG5vXG5pZiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuXHRpZiB3aW5kb3cuSW1iYVxuXHRcdGNvbnNvbGUud2FybiBcIkltYmEgdnt3aW5kb3cuSW1iYS5WRVJTSU9OfSBpcyBhbHJlYWR5IGxvYWRlZC5cIlxuXHRcdEltYmEgPSB3aW5kb3cuSW1iYVxuXHRlbHNlXG5cdFx0d2luZG93LkltYmEgPSBJbWJhXG5cdFx0YWN0aXZhdGUgPSB5ZXNcblx0XHRpZiB3aW5kb3c6ZGVmaW5lIGFuZCB3aW5kb3c6ZGVmaW5lOmFtZFxuXHRcdFx0d2luZG93LmRlZmluZShcImltYmFcIixbXSkgZG8gcmV0dXJuIEltYmFcblxubW9kdWxlLmV4cG9ydHMgPSBJbWJhXG5cbnVubGVzcyAkd2Vid29ya2VyJFxuXHRyZXF1aXJlICcuL3NjaGVkdWxlcidcblx0cmVxdWlyZSAnLi9kb20vaW5kZXgnXG5cbmlmICR3ZWIkIGFuZCBhY3RpdmF0ZVxuXHRJbWJhLkV2ZW50TWFuYWdlci5hY3RpdmF0ZVxuXHRcbmlmICRub2RlJFxuXHR1bmxlc3MgJHdlYnBhY2skXG5cdFx0cmVxdWlyZSAnLi4vLi4vcmVnaXN0ZXIuanMnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG5cbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIyB2ZXJ5IHNpbXBsZSByYWYgcG9seWZpbGxcbnZhciBjYW5jZWxBbmltYXRpb25GcmFtZVxuXG5pZiAkbm9kZSRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBkbyB8aWR8IGNsZWFyVGltZW91dChpZClcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5pZiAkd2ViJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpjYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6bW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6cmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzptb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmNsYXNzIFRpY2tlclxuXG5cdHByb3Agc3RhZ2Vcblx0cHJvcCBxdWV1ZVxuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAtMVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXxcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdFx0dGljayhlKVxuXHRcdHNlbGZcblxuXHRkZWYgYWRkIGl0ZW0sIGZvcmNlXG5cdFx0aWYgZm9yY2Ugb3IgQHF1ZXVlLmluZGV4T2YoaXRlbSkgPT0gLTFcblx0XHRcdEBxdWV1ZS5wdXNoKGl0ZW0pXG5cblx0XHRzY2hlZHVsZSB1bmxlc3MgQHNjaGVkdWxlZFxuXG5cdGRlZiB0aWNrIHRpbWVzdGFtcFxuXHRcdHZhciBpdGVtcyA9IEBxdWV1ZVxuXHRcdEB0cyA9IHRpbWVzdGFtcCB1bmxlc3MgQHRzXG5cdFx0QGR0ID0gdGltZXN0YW1wIC0gQHRzXG5cdFx0QHRzID0gdGltZXN0YW1wXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAxXG5cdFx0YmVmb3JlXG5cdFx0aWYgaXRlbXM6bGVuZ3RoXG5cdFx0XHRmb3IgaXRlbSxpIGluIGl0ZW1zXG5cdFx0XHRcdGlmIGl0ZW0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0aXRlbShAZHQsc2VsZilcblx0XHRcdFx0ZWxpZiBpdGVtOnRpY2tcblx0XHRcdFx0XHRpdGVtLnRpY2soQGR0LHNlbGYpXG5cdFx0QHN0YWdlID0gMlxuXHRcdGFmdGVyXG5cdFx0QHN0YWdlID0gQHNjaGVkdWxlZCA/IDAgOiAtMVxuXHRcdHNlbGZcblxuXHRkZWYgc2NoZWR1bGVcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0aWYgQHN0YWdlID09IC0xXG5cdFx0XHRcdEBzdGFnZSA9IDBcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShAdGlja2VyKVxuXHRcdHNlbGZcblxuXHRkZWYgYmVmb3JlXG5cdFx0c2VsZlxuXG5cdGRlZiBhZnRlclxuXHRcdGlmIEltYmEuVGFnTWFuYWdlclxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cbkltYmEuVElDS0VSID0gVGlja2VyLm5ld1xuSW1iYS5TQ0hFRFVMRVJTID0gW11cblxuZGVmIEltYmEudGlja2VyXG5cdEltYmEuVElDS0VSXG5cbmRlZiBJbWJhLnJlcXVlc3RBbmltYXRpb25GcmFtZSBjYWxsYmFja1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spXG5cbmRlZiBJbWJhLmNhbmNlbEFuaW1hdGlvbkZyYW1lIGlkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKVxuXG4jIHNob3VsZCBhZGQgYW4gSW1iYS5ydW4gLyBzZXRJbW1lZGlhdGUgdGhhdFxuIyBwdXNoZXMgbGlzdGVuZXIgb250byB0aGUgdGljay1xdWV1ZSB3aXRoIHRpbWVzIC0gb25jZVxuXG52YXIgY29tbWl0UXVldWUgPSAwXG5cbmRlZiBJbWJhLmNvbW1pdCBwYXJhbXNcblx0Y29tbWl0UXVldWUrK1xuXHQjIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdEltYmEuZW1pdChJbWJhLCdjb21taXQnLHBhcmFtcyAhPSB1bmRlZmluZWQgPyBbcGFyYW1zXSA6IHVuZGVmaW5lZClcblx0aWYgLS1jb21taXRRdWV1ZSA9PSAwXG5cdFx0SW1iYS5UYWdNYW5hZ2VyIGFuZCBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm5cblxuIyMjXG5cbkluc3RhbmNlcyBvZiBJbWJhLlNjaGVkdWxlciBtYW5hZ2VzIHdoZW4gdG8gY2FsbCBgdGljaygpYCBvbiB0aGVpciB0YXJnZXQsXG5hdCBhIHNwZWNpZmllZCBmcmFtZXJhdGUgb3Igd2hlbiBjZXJ0YWluIGV2ZW50cyBvY2N1ci4gUm9vdC1ub2RlcyBpbiB5b3VyXG5hcHBsaWNhdGlvbnMgd2lsbCB1c3VhbGx5IGhhdmUgYSBzY2hlZHVsZXIgdG8gbWFrZSBzdXJlIHRoZXkgcmVyZW5kZXIgd2hlblxuc29tZXRoaW5nIGNoYW5nZXMuIEl0IGlzIGFsc28gcG9zc2libGUgdG8gbWFrZSBpbm5lciBjb21wb25lbnRzIHVzZSB0aGVpclxub3duIHNjaGVkdWxlcnMgdG8gY29udHJvbCB3aGVuIHRoZXkgcmVuZGVyLlxuXG5AaW5hbWUgc2NoZWR1bGVyXG5cbiMjI1xuY2xhc3MgSW1iYS5TY2hlZHVsZXJcblx0XG5cdHZhciBjb3VudGVyID0gMFxuXG5cdGRlZiBzZWxmLmV2ZW50IGVcblx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLGUpXG5cblx0IyMjXG5cdENyZWF0ZSBhIG5ldyBJbWJhLlNjaGVkdWxlciBmb3Igc3BlY2lmaWVkIHRhcmdldFxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIHRhcmdldFxuXHRcdEBpZCA9IGNvdW50ZXIrK1xuXHRcdEB0YXJnZXQgPSB0YXJnZXRcblx0XHRAbWFya2VkID0gbm9cblx0XHRAYWN0aXZlID0gbm9cblx0XHRAbWFya2VyID0gZG8gbWFya1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXwgdGljayhlKVxuXG5cdFx0QGR0ID0gMFxuXHRcdEBmcmFtZSA9IHt9XG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpbWVzdGFtcCA9IDBcblx0XHRAdGlja3MgPSAwXG5cdFx0QGZsdXNoZXMgPSAwXG5cblx0XHRzZWxmOm9uZXZlbnQgPSBzZWxmOm9uZXZlbnQuYmluZChzZWxmKVxuXHRcdHNlbGZcblxuXHRwcm9wIHJhZiB3YXRjaDogeWVzXG5cdHByb3AgaW50ZXJ2YWwgd2F0Y2g6IHllc1xuXHRwcm9wIGV2ZW50cyB3YXRjaDogeWVzXG5cdHByb3AgbWFya2VkXG5cblx0ZGVmIHJhZkRpZFNldCBib29sXG5cdFx0cmVxdWVzdFRpY2sgaWYgYm9vbCBhbmQgQGFjdGl2ZVxuXHRcdHNlbGZcblxuXHRkZWYgaW50ZXJ2YWxEaWRTZXQgdGltZVxuXHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0aWYgdGltZSBhbmQgQGFjdGl2ZVxuXHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSx0aW1lKVxuXHRcdHNlbGZcblxuXHRkZWYgZXZlbnRzRGlkU2V0IG5ldywgcHJldlxuXHRcdGlmIEBhY3RpdmUgYW5kIG5ldyBhbmQgIXByZXZcblx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0ZWxpZiAhbmV3IGFuZCBwcmV2XG5cdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVyIGlzIGFjdGl2ZSBvciBub3Rcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBhY3RpdmVcblx0XHRAYWN0aXZlXG5cblx0IyMjXG5cdERlbHRhIHRpbWUgYmV0d2VlbiB0aGUgdHdvIGxhc3QgdGlja3Ncblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR0XG5cdFx0QGR0XG5cblx0IyMjXG5cdENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29uZmlndXJlIG9wdGlvbnMgPSB7fVxuXHRcdHJhZiA9IG9wdGlvbnM6cmFmIGlmIG9wdGlvbnM6cmFmICE9IHVuZGVmaW5lZFxuXHRcdGludGVydmFsID0gb3B0aW9uczppbnRlcnZhbCBpZiBvcHRpb25zOmludGVydmFsICE9IHVuZGVmaW5lZFxuXHRcdGV2ZW50cyA9IG9wdGlvbnM6ZXZlbnRzIGlmIG9wdGlvbnM6ZXZlbnRzICE9IHVuZGVmaW5lZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0TWFyayB0aGUgc2NoZWR1bGVyIGFzIGRpcnR5LiBUaGlzIHdpbGwgbWFrZSBzdXJlIHRoYXRcblx0dGhlIHNjaGVkdWxlciBjYWxscyBgdGFyZ2V0LnRpY2tgIG9uIHRoZSBuZXh0IGZyYW1lXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbWFya1xuXHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc3RhbnRseSB0cmlnZ2VyIHRhcmdldC50aWNrIGFuZCBtYXJrIHNjaGVkdWxlciBhcyBjbGVhbiAobm90IGRpcnR5L21hcmtlZCkuXG5cdFRoaXMgaXMgY2FsbGVkIGltcGxpY2l0bHkgZnJvbSB0aWNrLCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuXHRyZWFsbHkgd2FudCB0byBmb3JjZSBhIHRpY2sgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgbmV4dCBmcmFtZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbHVzaFxuXHRcdEBmbHVzaGVzKytcblx0XHRAdGFyZ2V0LnRpY2soc2VsZilcblx0XHRAbWFya2VkID0gbm9cblx0XHRzZWxmXG5cblx0IyMjXG5cdEBmaXhtZSB0aGlzIGV4cGVjdHMgcmFmIHRvIHJ1biBhdCA2MCBmcHMgXG5cblx0Q2FsbGVkIGF1dG9tYXRpY2FsbHkgb24gZXZlcnkgZnJhbWUgd2hpbGUgdGhlIHNjaGVkdWxlciBpcyBhY3RpdmUuXG5cdEl0IHdpbGwgb25seSBjYWxsIGB0YXJnZXQudGlja2AgaWYgdGhlIHNjaGVkdWxlciBpcyBtYXJrZWQgZGlydHksXG5cdG9yIHdoZW4gYWNjb3JkaW5nIHRvIEBmcHMgc2V0dGluZy5cblxuXHRJZiB5b3UgaGF2ZSBzZXQgdXAgYSBzY2hlZHVsZXIgd2l0aCBhbiBmcHMgb2YgMSwgdGljayB3aWxsIHN0aWxsIGJlXG5cdGNhbGxlZCBldmVyeSBmcmFtZSwgYnV0IGB0YXJnZXQudGlja2Agd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGV2ZXJ5XG5cdHNlY29uZCwgYW5kIGl0IHdpbGwgKm1ha2Ugc3VyZSogZWFjaCBgdGFyZ2V0LnRpY2tgIGhhcHBlbnMgaW4gc2VwYXJhdGVcblx0c2Vjb25kcyBhY2NvcmRpbmcgdG8gRGF0ZS4gU28gaWYgeW91IGhhdmUgYSBub2RlIHRoYXQgcmVuZGVycyBhIGNsb2NrXG5cdGJhc2VkIG9uIERhdGUubm93IChvciBzb21ldGhpbmcgc2ltaWxhciksIHlvdSBjYW4gc2NoZWR1bGUgaXQgd2l0aCAxZnBzLFxuXHRuZXZlciBuZWVkaW5nIHRvIHdvcnJ5IGFib3V0IHR3byB0aWNrcyBoYXBwZW5pbmcgd2l0aGluIHRoZSBzYW1lIHNlY29uZC5cblx0VGhlIHNhbWUgZ29lcyBmb3IgNGZwcywgMTBmcHMgZXRjLlxuXG5cdEBwcm90ZWN0ZWRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0aWNrIGRlbHRhLCB0aWNrZXJcblx0XHRAdGlja3MrK1xuXHRcdEBkdCA9IGRlbHRhXG5cblx0XHRpZiB0aWNrZXJcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXG5cdFx0Zmx1c2hcblxuXHRcdGlmIEByYWYgYW5kIEBhY3RpdmVcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdGRlZiByZXF1ZXN0VGlja1xuXHRcdHVubGVzcyBAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRJbWJhLlRJQ0tFUi5hZGQoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN0YXJ0IHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgbm90IGFscmVhZHkgYWN0aXZlLlxuXHQqKldoaWxlIGFjdGl2ZSoqLCB0aGUgc2NoZWR1bGVyIHdpbGwgb3ZlcnJpZGUgYHRhcmdldC5jb21taXRgXG5cdHRvIGRvIG5vdGhpbmcuIEJ5IGRlZmF1bHQgSW1iYS50YWcjY29tbWl0IGNhbGxzIHJlbmRlciwgc29cblx0dGhhdCByZW5kZXJpbmcgaXMgY2FzY2FkZWQgdGhyb3VnaCB0byBjaGlsZHJlbiB3aGVuIHJlbmRlcmluZ1xuXHRhIG5vZGUuIFdoZW4gYSBzY2hlZHVsZXIgaXMgYWN0aXZlIChmb3IgYSBub2RlKSwgSW1iYSBkaXNhYmxlc1xuXHR0aGlzIGF1dG9tYXRpYyByZW5kZXJpbmcuXG5cdCMjI1xuXHRkZWYgYWN0aXZhdGUgaW1tZWRpYXRlID0geWVzXG5cdFx0dW5sZXNzIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSB5ZXNcblx0XHRcdEBjb21taXQgPSBAdGFyZ2V0OmNvbW1pdFxuXHRcdFx0QHRhcmdldDpjb21taXQgPSBkbyB0aGlzXG5cdFx0XHRAdGFyZ2V0Py5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRcdEltYmEuU0NIRURVTEVSUy5wdXNoKHNlbGYpXG5cdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRcdFx0XG5cdFx0XHRpZiBAaW50ZXJ2YWwgYW5kICFAaW50ZXJ2YWxJZFxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLEBpbnRlcnZhbClcblxuXHRcdFx0aWYgaW1tZWRpYXRlXG5cdFx0XHRcdHRpY2soMClcblx0XHRcdGVsaWYgQHJhZlxuXHRcdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFN0b3AgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBhY3RpdmUuXG5cdCMjI1xuXHRkZWYgZGVhY3RpdmF0ZVxuXHRcdGlmIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSBub1xuXHRcdFx0QHRhcmdldDpjb21taXQgPSBAY29tbWl0XG5cdFx0XHRsZXQgaWR4ID0gSW1iYS5TQ0hFRFVMRVJTLmluZGV4T2Yoc2VsZilcblx0XHRcdGlmIGlkeCA+PSAwXG5cdFx0XHRcdEltYmEuU0NIRURVTEVSUy5zcGxpY2UoaWR4LDEpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0XHRcdGlmIEBpbnRlcnZhbElkXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdFx0XG5cdFx0XHRAdGFyZ2V0Py51bmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHRyYWNrXG5cdFx0QG1hcmtlclxuXHRcdFxuXHRkZWYgb25pbnRlcnZhbFxuXHRcdHRpY2tcblx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuXHRkZWYgb25ldmVudCBldmVudFxuXHRcdHJldHVybiBzZWxmIGlmICFAZXZlbnRzIG9yIEBtYXJrZWRcblxuXHRcdGlmIEBldmVudHMgaXNhIEZ1bmN0aW9uXG5cdFx0XHRtYXJrIGlmIEBldmVudHMoZXZlbnQsc2VsZilcblx0XHRlbGlmIEBldmVudHMgaXNhIEFycmF5XG5cdFx0XHRpZiBAZXZlbnRzLmluZGV4T2YoKGV2ZW50IGFuZCBldmVudDp0eXBlKSBvciBldmVudCkgPj0gMFxuXHRcdFx0XHRtYXJrXG5cdFx0ZWxzZVxuXHRcdFx0bWFya1xuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL3NjaGVkdWxlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5yZXF1aXJlICcuL21hbmFnZXInXG5cbkltYmEuVGFnTWFuYWdlciA9IEltYmEuVGFnTWFuYWdlckNsYXNzLm5ld1xuXG5yZXF1aXJlICcuL3RhZydcbnJlcXVpcmUgJy4vaHRtbCdcbnJlcXVpcmUgJy4vcG9pbnRlcidcbnJlcXVpcmUgJy4vdG91Y2gnXG5yZXF1aXJlICcuL2V2ZW50J1xucmVxdWlyZSAnLi9ldmVudC1tYW5hZ2VyJ1xuXG5pZiAkd2ViJFxuXHRyZXF1aXJlICcuL3JlY29uY2lsZXInXG5cbmlmICRub2RlJFxuXHRyZXF1aXJlICcuL3NlcnZlcidcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5UYWdNYW5hZ2VyQ2xhc3Ncblx0ZGVmIGluaXRpYWxpemVcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRAbW91bnRlZCA9IFtdXG5cdFx0QGhhc01vdW50YWJsZXMgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgbW91bnRlZFxuXHRcdEBtb3VudGVkXG5cblx0ZGVmIGluc2VydCBub2RlLCBwYXJlbnRcblx0XHRAaW5zZXJ0cysrXG5cblx0ZGVmIHJlbW92ZSBub2RlLCBwYXJlbnRcblx0XHRAcmVtb3ZlcysrXG5cblx0ZGVmIGNoYW5nZXNcblx0XHRAaW5zZXJ0cyArIEByZW1vdmVzXG5cblx0ZGVmIG1vdW50IG5vZGVcblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0QGhhc01vdW50YWJsZXMgPSB5ZXNcblxuXHRkZWYgcmVmcmVzaCBmb3JjZSA9IG5vXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdHJldHVybiBpZiAhZm9yY2UgYW5kIGNoYW5nZXMgPT0gMFxuXHRcdCMgY29uc29sZS50aW1lKCdyZXNvbHZlTW91bnRzJylcblx0XHRpZiAoQGluc2VydHMgYW5kIEBoYXNNb3VudGFibGVzKSBvciBmb3JjZVxuXHRcdFx0dHJ5TW91bnRcblxuXHRcdGlmIChAcmVtb3ZlcyBvciBmb3JjZSkgYW5kIEBtb3VudGVkOmxlbmd0aFxuXHRcdFx0dHJ5VW5tb3VudFxuXHRcdCMgY29uc29sZS50aW1lRW5kKCdyZXNvbHZlTW91bnRzJylcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRzZWxmXG5cblx0ZGVmIHVubW91bnQgbm9kZVxuXHRcdHNlbGZcblxuXHRkZWYgdHJ5TW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0dmFyIGl0ZW1zID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuX19tb3VudCcpXG5cdFx0IyB3aGF0IGlmIHdlIGVuZCB1cCBjcmVhdGluZyBhZGRpdGlvbmFsIG1vdW50YWJsZXMgYnkgbW91bnRpbmc/XG5cdFx0Zm9yIGVsIGluIGl0ZW1zXG5cdFx0XHRpZiBlbCBhbmQgZWwuQHRhZ1xuXHRcdFx0XHRpZiBAbW91bnRlZC5pbmRleE9mKGVsLkB0YWcpID09IC0xXG5cdFx0XHRcdFx0bW91bnROb2RlKGVsLkB0YWcpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgbW91bnROb2RlIG5vZGVcblx0XHRAbW91bnRlZC5wdXNoKG5vZGUpXG5cdFx0bm9kZS5GTEFHUyB8PSBJbWJhLlRBR19NT1VOVEVEXG5cdFx0bm9kZS5tb3VudCBpZiBub2RlOm1vdW50XG5cdFx0cmV0dXJuXG5cblx0ZGVmIHRyeVVubW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0Zm9yIGl0ZW0sIGkgaW4gQG1vdW50ZWRcblx0XHRcdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQuY29udGFpbnMoaXRlbS5AZG9tKVxuXHRcdFx0XHRpdGVtLkZMQUdTID0gaXRlbS5GTEFHUyAmIH5JbWJhLlRBR19NT1VOVEVEXG5cdFx0XHRcdGlmIGl0ZW06dW5tb3VudCBhbmQgaXRlbS5AZG9tXG5cdFx0XHRcdFx0aXRlbS51bm1vdW50XG5cdFx0XHRcdGVsaWYgaXRlbS5Ac2NoZWR1bGVyXG5cdFx0XHRcdFx0IyBNQVlCRSBGSVggVEhJUz9cblx0XHRcdFx0XHRpdGVtLnVuc2NoZWR1bGVcblx0XHRcdFx0QG1vdW50ZWRbaV0gPSBudWxsXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcblx0XHRpZiBjb3VudFxuXHRcdFx0QG1vdW50ZWQgPSBAbW91bnRlZC5maWx0ZXIgZG8gfGl0ZW18IGl0ZW1cblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuSW1iYS5DU1NLZXlNYXAgPSB7fVxuXG5JbWJhLlRBR19CVUlMVCA9IDFcbkltYmEuVEFHX1NFVFVQID0gMlxuSW1iYS5UQUdfTU9VTlRJTkcgPSA0XG5JbWJhLlRBR19NT1VOVEVEID0gOFxuSW1iYS5UQUdfU0NIRURVTEVEID0gMTZcbkltYmEuVEFHX0FXQUtFTkVEID0gMzJcblxuIyMjXG5HZXQgdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiMjI1xuZGVmIEltYmEuZG9jdW1lbnRcblx0aWYgJHdlYiRcblx0XHR3aW5kb3c6ZG9jdW1lbnRcblx0ZWxzZVxuXHRcdEBkb2N1bWVudCB8fD0gSW1iYVNlcnZlckRvY3VtZW50Lm5ld1xuXG4jIyNcbkdldCB0aGUgYm9keSBlbGVtZW50IHdyYXBwZWQgaW4gYW4gSW1iYS5UYWdcbiMjI1xuZGVmIEltYmEucm9vdFxuXHR0YWcoSW1iYS5kb2N1bWVudDpib2R5KVxuXG5kZWYgSW1iYS5zdGF0aWMgaXRlbXMsIHR5cCwgbnJcblx0aXRlbXMuQHR5cGUgPSB0eXBcblx0aXRlbXM6c3RhdGljID0gbnJcblx0cmV0dXJuIGl0ZW1zXG5cbiMjI1xuXG4jIyNcbmRlZiBJbWJhLm1vdW50IG5vZGUsIGludG9cblx0aW50byB8fD0gSW1iYS5kb2N1bWVudDpib2R5XG5cdGludG8uYXBwZW5kQ2hpbGQobm9kZS5kb20pXG5cdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZSxpbnRvKVxuXHRub2RlLnNjaGVkdWxlci5jb25maWd1cmUoZXZlbnRzOiB5ZXMpLmFjdGl2YXRlKG5vKVxuXHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm4gbm9kZVxuXG5cbmRlZiBJbWJhLmNyZWF0ZVRleHROb2RlIG5vZGVcblx0aWYgbm9kZSBhbmQgbm9kZTpub2RlVHlwZSA9PSAzXG5cdFx0cmV0dXJuIG5vZGVcblx0cmV0dXJuIEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuIyMjXG5UaGlzIGlzIHRoZSBiYXNlY2xhc3MgdGhhdCBhbGwgdGFncyBpbiBpbWJhIGluaGVyaXQgZnJvbS5cbkBpbmFtZSBub2RlXG4jIyNcbmNsYXNzIEltYmEuVGFnXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAbm9kZVR5cGUgb3IgJ2RpdicpXG5cdFx0aWYgQGNsYXNzZXNcblx0XHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdFx0ZG9tOmNsYXNzTmFtZSA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0dmFyIHByb3RvID0gKEBwcm90b0RvbSB8fD0gYnVpbGROb2RlKVxuXHRcdHByb3RvLmNsb25lTm9kZShmYWxzZSlcblxuXHRkZWYgc2VsZi5idWlsZCBjdHhcblx0XHRzZWxmLm5ldyhzZWxmLmNyZWF0ZU5vZGUsY3R4KVxuXG5cdGRlZiBzZWxmLmRvbVxuXHRcdEBwcm90b0RvbSB8fD0gYnVpbGROb2RlXG5cblx0IyMjXG5cdENhbGxlZCB3aGVuIGEgdGFnIHR5cGUgaXMgYmVpbmcgc3ViY2xhc3NlZC5cblx0IyMjXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5zbGljZVxuXG5cdFx0XHRpZiBjaGlsZC5AZmxhZ05hbWVcblx0XHRcdFx0Y2hpbGQuQGNsYXNzZXMucHVzaChjaGlsZC5AZmxhZ05hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBmbGFnTmFtZSA9IG51bGxcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHQjIyNcblx0SW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBhZnRlciBhIHRhZyBjbGFzcyBoYXNcblx0YmVlbiBkZWNsYXJlZCBvciBleHRlbmRlZC5cblx0XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgb3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHR2YXIgYmFzZSA9IEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdHZhciBoYXNTZXR1cCAgPSBzZWxmOnNldHVwICAhPSBiYXNlOnNldHVwXG5cdFx0dmFyIGhhc0NvbW1pdCA9IHNlbGY6Y29tbWl0ICE9IGJhc2U6Y29tbWl0XG5cdFx0dmFyIGhhc1JlbmRlciA9IHNlbGY6cmVuZGVyICE9IGJhc2U6cmVuZGVyXG5cdFx0dmFyIGhhc01vdW50ICA9IHNlbGY6bW91bnRcblxuXHRcdHZhciBjdG9yID0gc2VsZjpjb25zdHJ1Y3RvclxuXG5cdFx0aWYgaGFzQ29tbWl0IG9yIGhhc1JlbmRlciBvciBoYXNNb3VudCBvciBoYXNTZXR1cFxuXG5cdFx0XHRzZWxmOmVuZCA9IGRvXG5cdFx0XHRcdGlmIHRoaXM6bW91bnQgYW5kICEodGhpcy5GTEFHUyAmIEltYmEuVEFHX01PVU5URUQpXG5cdFx0XHRcdFx0IyBqdXN0IGFjdGl2YXRlIFxuXHRcdFx0XHRcdEltYmEuVGFnTWFuYWdlci5tb3VudCh0aGlzKVxuXG5cdFx0XHRcdHVubGVzcyB0aGlzLkZMQUdTICYgSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLkZMQUdTIHw9IEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5zZXR1cFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb21taXRcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdGlmIGhhc01vdW50XG5cdFx0XHRcdGlmIGN0b3IuQGNsYXNzZXMgYW5kIGN0b3IuQGNsYXNzZXMuaW5kZXhPZignX19tb3VudCcpICA9PSAtMVxuXHRcdFx0XHRcdGN0b3IuQGNsYXNzZXMucHVzaCgnX19tb3VudCcpXG5cblx0XHRcdFx0aWYgY3Rvci5AcHJvdG9Eb21cblx0XHRcdFx0XHRjdG9yLkBwcm90b0RvbTpjbGFzc0xpc3QuYWRkKCdfX21vdW50JylcblxuXHRcdFx0Zm9yIGl0ZW0gaW4gWzptb3VzZW1vdmUsOm1vdXNlZW50ZXIsOm1vdXNlbGVhdmUsOm1vdXNlb3Zlciw6bW91c2VvdXQsOnNlbGVjdHN0YXJ0XVxuXHRcdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihpdGVtKSBpZiB0aGlzW1wib257aXRlbX1cIl1cblx0XHRzZWxmXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBkb20sY3R4XG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRzZWxmOiQgPSBUYWdDYWNoZS5idWlsZChzZWxmKVxuXHRcdHNlbGY6JHVwID0gQG93bmVyXyA9IGN0eFxuXHRcdEB0cmVlXyA9IG51bGxcblx0XHRzZWxmLkZMQUdTID0gMFxuXHRcdGJ1aWxkXG5cdFx0c2VsZlxuXG5cdGF0dHIgbmFtZSBpbmxpbmU6IG5vXG5cdGF0dHIgcm9sZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGFiaW5kZXggaW5saW5lOiBub1xuXHRhdHRyIHRpdGxlXG5cblx0ZGVmIGRvbVxuXHRcdEBkb21cblx0XHRcblx0ZGVmIHNldERvbSBkb21cblx0XHRkb20uQHRhZyA9IHNlbGZcblx0XHRAZG9tID0gZG9tXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZcblx0XHRAcmVmXG5cdFx0XG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHQjIyNcblx0U2V0dGluZyByZWZlcmVuY2VzIGZvciB0YWdzIGxpa2Vcblx0YDxkaXZAaGVhZGVyPmAgd2lsbCBjb21waWxlIHRvIGB0YWcoJ2RpdicpLnJlZl8oJ2hlYWRlcicsdGhpcykuZW5kKClgXG5cdEJ5IGRlZmF1bHQgaXQgYWRkcyB0aGUgcmVmZXJlbmNlIGFzIGEgY2xhc3NOYW1lIHRvIHRoZSB0YWcuXG5cblx0QHJldHVybiB7c2VsZn1cblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiByZWZfIHJlZlxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBkYXRhPSBkYXRhXG5cdFx0QGRhdGEgPSBkYXRhXG5cblx0IyMjXG5cdEdldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0IyMjXG5cdGRlZiBkYXRhXG5cdFx0QGRhdGFcblx0XHRcblx0XHRcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdHNldERhdGEoYXJncyA/IHRhcmdldFtwYXRoXS5hcHBseSh0YXJnZXQsYXJncykgOiB0YXJnZXRbcGF0aF0pXG5cblx0IyMjXG5cdFNldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgc2VsZi5odG1sICE9IGh0bWxcblx0XHRcdEBkb206aW5uZXJIVE1MID0gaHRtbFxuXG5cdCMjI1xuXHRHZXQgaW5uZXIgaHRtbCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgaHRtbFxuXHRcdEBkb206aW5uZXJIVE1MXG5cdFxuXHRkZWYgb24kIHNsb3QsaGFuZGxlcixjb250ZXh0XG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aWYgcHJldlxuXHRcdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGVcblx0XHRlbHNlXG5cdFx0XHRoYW5kbGVyOnN0YXRlID0ge2NvbnRleHQ6IGNvbnRleHR9XG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBpZD0gaWRcblx0XHRpZiBpZCAhPSBudWxsXG5cdFx0XHRkb206aWQgPSBpZFxuXG5cdGRlZiBpZFxuXHRcdGRvbTppZFxuXG5cdCMjI1xuXHRBZGRzIGEgbmV3IGF0dHJpYnV0ZSBvciBjaGFuZ2VzIHRoZSB2YWx1ZSBvZiBhbiBleGlzdGluZyBhdHRyaWJ1dGVcblx0b24gdGhlIHNwZWNpZmllZCB0YWcuIElmIHRoZSB2YWx1ZSBpcyBudWxsIG9yIGZhbHNlLCB0aGUgYXR0cmlidXRlXG5cdHdpbGwgYmUgcmVtb3ZlZC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRBdHRyaWJ1dGUgbmFtZSwgdmFsdWVcblx0XHR2YXIgb2xkID0gZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cdFx0aWYgb2xkID09IHZhbHVlXG5cdFx0XHR2YWx1ZVxuXHRcdGVsaWYgdmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2Vcblx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRlbHNlXG5cdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0TmVzdGVkQXR0ciBucywgbmFtZSwgdmFsdWVcblx0XHRpZiBzZWxmW25zKydTZXRBdHRyaWJ1dGUnXVxuXHRcdFx0c2VsZltucysnU2V0QXR0cmlidXRlJ10obmFtZSx2YWx1ZSlcblx0XHRlbHNlXG5cdFx0XHRzZXRBdHRyaWJ1dGVOUyhucywgbmFtZSx2YWx1ZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBzZXRBdHRyaWJ1dGVOUyBucywgbmFtZSwgdmFsdWVcblx0XHR2YXIgb2xkID0gZ2V0QXR0cmlidXRlTlMobnMsbmFtZSlcblxuXHRcdGlmIG9sZCAhPSB2YWx1ZVxuXHRcdFx0aWYgdmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2UgXG5cdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGVOUyhucyxuYW1lLHZhbHVlKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlTlMobnMsbmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyMjXG5cdHJlbW92ZXMgYW4gYXR0cmlidXRlIGZyb20gdGhlIHNwZWNpZmllZCB0YWdcblx0IyMjXG5cdGRlZiByZW1vdmVBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblxuXHQjIyNcblx0cmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gYXR0cmlidXRlIG9uIHRoZSB0YWcuXG5cdElmIHRoZSBnaXZlbiBhdHRyaWJ1dGUgZG9lcyBub3QgZXhpc3QsIHRoZSB2YWx1ZSByZXR1cm5lZFxuXHR3aWxsIGVpdGhlciBiZSBudWxsIG9yIFwiXCIgKHRoZSBlbXB0eSBzdHJpbmcpXG5cdCMjI1xuXHRkZWYgZ2V0QXR0cmlidXRlIG5hbWVcblx0XHRkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblxuXHRkZWYgZ2V0QXR0cmlidXRlTlMgbnMsIG5hbWVcblx0XHRkb20uZ2V0QXR0cmlidXRlTlMobnMsbmFtZSlcblx0XG5cdFxuXHRkZWYgc2V0IGtleSwgdmFsdWUsIG1vZHNcblx0XHRsZXQgc2V0dGVyID0gSW1iYS50b1NldHRlcihrZXkpXG5cdFx0aWYgc2VsZltzZXR0ZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0c2VsZltzZXR0ZXJdKHZhbHVlLG1vZHMpXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbTpzZXRBdHRyaWJ1dGUoa2V5LHZhbHVlKVxuXHRcdHNlbGZcblx0XG5cdFxuXHRkZWYgZ2V0IGtleVxuXHRcdEBkb206Z2V0QXR0cmlidXRlKGtleSlcblxuXHQjIyNcblx0T3ZlcnJpZGUgdGhpcyB0byBwcm92aWRlIHNwZWNpYWwgd3JhcHBpbmcgZXRjLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENvbnRlbnQgY29udGVudCwgdHlwZVxuXHRcdHNldENoaWxkcmVuIGNvbnRlbnQsIHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZS4gdHlwZSBwYXJhbSBpcyBvcHRpb25hbCxcblx0YW5kIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgSW1iYSB3aGVuIGNvbXBpbGluZyB0YWcgdHJlZXMuIFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENoaWxkcmVuIG5vZGVzLCB0eXBlXG5cdFx0IyBvdmVycmlkZGVuIG9uIGNsaWVudCBieSByZWNvbmNpbGVyXG5cdFx0QHRyZWVfID0gbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgdGVtcGxhdGUgdGhhdCB3aWxsIHJlbmRlciB0aGUgY29udGVudCBvZiBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldFRlbXBsYXRlIHRlbXBsYXRlXG5cdFx0dW5sZXNzIEB0ZW1wbGF0ZVxuXHRcdFx0IyBvdmVycmlkZSB0aGUgYmFzaWNcblx0XHRcdGlmIHNlbGY6cmVuZGVyID09IEltYmEuVGFnOnByb3RvdHlwZTpyZW5kZXJcblx0XHRcdFx0c2VsZjpyZW5kZXIgPSBzZWxmOnJlbmRlclRlbXBsYXRlICMgZG8gc2V0Q2hpbGRyZW4ocmVuZGVyVGVtcGxhdGUpXG5cdFx0XHRzZWxmLm9wdGltaXplVGFnU3RydWN0dXJlXG5cblx0XHRzZWxmOnRlbXBsYXRlID0gQHRlbXBsYXRlID0gdGVtcGxhdGVcblx0XHRzZWxmXG5cblx0ZGVmIHRlbXBsYXRlXG5cdFx0bnVsbFxuXG5cdCMjI1xuXHRJZiBubyBjdXN0b20gcmVuZGVyLW1ldGhvZCBpcyBkZWZpbmVkLCBhbmQgdGhlIG5vZGVcblx0aGFzIGEgdGVtcGxhdGUsIHRoaXMgbWV0aG9kIHdpbGwgYmUgdXNlZCB0byByZW5kZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJUZW1wbGF0ZVxuXHRcdHZhciBib2R5ID0gdGVtcGxhdGVcblx0XHRzZXRDaGlsZHJlbihib2R5KSBpZiBib2R5ICE9IHNlbGZcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBjaGlsZCBmcm9tIGN1cnJlbnQgbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW1vdmVDaGlsZCBjaGlsZFxuXHRcdHZhciBwYXIgPSBkb21cblx0XHR2YXIgZWwgPSBjaGlsZC5AZG9tIG9yIGNoaWxkXG5cdFx0aWYgZWwgYW5kIGVsOnBhcmVudE5vZGUgPT0gcGFyXG5cdFx0XHRwYXIucmVtb3ZlQ2hpbGQoZWwpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKGVsLkB0YWcgb3IgZWwsc2VsZilcblx0XHRzZWxmXG5cdFxuXHQjIyNcblx0UmVtb3ZlIGFsbCBjb250ZW50IGluc2lkZSBub2RlXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRpZiBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEBkb20ucmVtb3ZlQ2hpbGQoQGRvbTpmaXJzdENoaWxkKSB3aGlsZSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUobnVsbCxzZWxmKSAjIHNob3VsZCByZWdpc3RlciBlYWNoIGNoaWxkP1xuXHRcdEB0cmVlXyA9IEB0ZXh0XyA9IG51bGxcblx0XHRzZWxmXG5cblx0IyMjXG5cdEFwcGVuZCBhIHNpbmdsZSBpdGVtIChub2RlIG9yIHN0cmluZykgdG8gdGhlIGN1cnJlbnQgbm9kZS5cblx0SWYgc3VwcGxpZWQgaXRlbSBpcyBhIHN0cmluZyBpdCB3aWxsIGF1dG9tYXRpY2FsbHkuIFRoaXMgaXMgdXNlZFxuXHRieSBJbWJhIGludGVybmFsbHksIGJ1dCB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIGJlIHVzZWQgZXhwbGljaXRseS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBhcHBlbmRDaGlsZCBub2RlXG5cdFx0aWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQoSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSlcblx0XHRlbGlmIG5vZGVcblx0XHRcdGRvbS5hcHBlbmRDaGlsZChub2RlLkBkb20gb3Igbm9kZSlcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zZXJ0IGEgbm9kZSBpbnRvIHRoZSBjdXJyZW50IG5vZGUgKHNlbGYpLCBiZWZvcmUgYW5vdGhlci5cblx0VGhlIHJlbGF0aXZlIG5vZGUgbXVzdCBiZSBhIGNoaWxkIG9mIGN1cnJlbnQgbm9kZS4gXG5cdCMjI1xuXHRkZWYgaW5zZXJ0QmVmb3JlIG5vZGUsIHJlbFxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0bm9kZSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdGlmIG5vZGUgYW5kIHJlbFxuXHRcdFx0ZG9tLmluc2VydEJlZm9yZSggKG5vZGUuQGRvbSBvciBub2RlKSwgKHJlbC5AZG9tIG9yIHJlbCkgKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLkB0YWcgb3Igbm9kZSwgc2VsZilcblx0XHRcdCMgRklYTUUgZW5zdXJlIHRoZXNlIGFyZSBub3QgY2FsbGVkIGZvciB0ZXh0IG5vZGVzXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBub2RlIGZyb20gdGhlIGRvbSB0cmVlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgb3JwaGFuaXplXG5cdFx0cGFyLnJlbW92ZUNoaWxkKHNlbGYpIGlmIGxldCBwYXIgPSBwYXJlbnRcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRHZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0QHJldHVybiB7c3RyaW5nfSBpbm5lciB0ZXh0IG9mIG5vZGVcblx0IyMjXG5cdGRlZiB0ZXh0IHZcblx0XHRAZG9tOnRleHRDb250ZW50XG5cblx0IyMjXG5cdFNldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHQjIyNcblx0ZGVmIHRleHQ9IHR4dFxuXHRcdEB0cmVlXyA9IHR4dFxuXHRcdEBkb206dGV4dENvbnRlbnQgPSAodHh0ID09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UpID8gJycgOiB0eHRcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0TWV0aG9kIGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIGRhdGEtYXR0cmlidXRlcy4gV2hlbiBjYWxsZWQgd2l0aCB6ZXJvXG5cdGFyZ3VtZW50cyBpdCB3aWxsIHJldHVybiB0aGUgYWN0dWFsIGRhdGFzZXQgZm9yIHRoZSB0YWcuXG5cblx0XHR2YXIgbm9kZSA9IDxkaXYgZGF0YS1uYW1lPSdoZWxsbyc+XG5cdFx0IyBnZXQgdGhlIHdob2xlIGRhdGFzZXRcblx0XHRub2RlLmRhdGFzZXQgIyB7bmFtZTogJ2hlbGxvJ31cblx0XHQjIGdldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScpICMgJ2hlbGxvJ1xuXHRcdCMgc2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJywnbmV3bmFtZScpICMgc2VsZlxuXG5cblx0IyMjXG5cdGRlZiBkYXRhc2V0IGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGRhdGFzZXQoayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdHNldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIix2YWwpXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYga2V5XG5cdFx0XHRyZXR1cm4gZ2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiKVxuXG5cdFx0dmFyIGRhdGFzZXQgPSBkb206ZGF0YXNldFxuXG5cdFx0dW5sZXNzIGRhdGFzZXRcblx0XHRcdGRhdGFzZXQgPSB7fVxuXHRcdFx0Zm9yIGF0cixpIGluIGRvbTphdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIGF0cjpuYW1lLnN1YnN0cigwLDUpID09ICdkYXRhLSdcblx0XHRcdFx0XHRkYXRhc2V0W0ltYmEudG9DYW1lbENhc2UoYXRyOm5hbWUuc2xpY2UoNSkpXSA9IGF0cjp2YWx1ZVxuXG5cdFx0cmV0dXJuIGRhdGFzZXRcblxuXHQjIyNcblx0RW1wdHkgcGxhY2Vob2xkZXIuIE92ZXJyaWRlIHRvIGltcGxlbWVudCBjdXN0b20gcmVuZGVyIGJlaGF2aW91ci5cblx0V29ya3MgbXVjaCBsaWtlIHRoZSBmYW1pbGlhciByZW5kZXItbWV0aG9kIGluIFJlYWN0LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgd2hpbGUgdGFnIGlzIGluaXRpYWxpemluZy4gTm8gaW5pdGlhbCBwcm9wc1xuXHR3aWxsIGhhdmUgYmVlbiBzZXQgYXQgdGhpcyBwb2ludC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBidWlsZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIG9uY2UsIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQuIEFsbCBpbml0aWFsIHByb3BzXG5cdGFuZCBjaGlsZHJlbiB3aWxsIGhhdmUgYmVlbiBzZXQgYmVmb3JlIHNldHVwIGlzIGNhbGxlZC5cblx0c2V0Q29udGVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXR1cFxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQsIGZvciB0YWdzIHRoYXQgYXJlIHBhcnQgb2Zcblx0YSB0YWcgdHJlZSAodGhhdCBhcmUgcmVuZGVyZWQgc2V2ZXJhbCB0aW1lcykuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29tbWl0XG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXG5cdENhbGxlZCBieSB0aGUgdGFnLXNjaGVkdWxlciAoaWYgdGhpcyB0YWcgaXMgc2NoZWR1bGVkKVxuXHRCeSBkZWZhdWx0IGl0IHdpbGwgY2FsbCB0aGlzLnJlbmRlci4gRG8gbm90IG92ZXJyaWRlIHVubGVzc1xuXHR5b3UgcmVhbGx5IHVuZGVyc3RhbmQgaXQuXG5cblx0IyMjXG5cdGRlZiB0aWNrXG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRcblx0QSB2ZXJ5IGltcG9ydGFudCBtZXRob2QgdGhhdCB5b3Ugd2lsbCBwcmFjdGljYWxseSBuZXZlciBtYW51YWxseS5cblx0VGhlIHRhZyBzeW50YXggb2YgSW1iYSBjb21waWxlcyB0byBhIGNoYWluIG9mIHNldHRlcnMsIHdoaWNoIGFsd2F5c1xuXHRlbmRzIHdpdGggLmVuZC4gYDxhLmxhcmdlPmAgY29tcGlsZXMgdG8gYHRhZygnYScpLmZsYWcoJ2xhcmdlJykuZW5kKClgXG5cdFxuXHRZb3UgYXJlIGhpZ2hseSBhZHZpY2VkIHRvIG5vdCBvdmVycmlkZSBpdHMgYmVoYXZpb3VyLiBUaGUgZmlyc3QgdGltZVxuXHRlbmQgaXMgY2FsbGVkIGl0IHdpbGwgbWFyayB0aGUgdGFnIGFzIGluaXRpYWxpemVkIGFuZCBjYWxsIEltYmEuVGFnI3NldHVwLFxuXHRhbmQgY2FsbCBJbWJhLlRhZyNjb21taXQgZXZlcnkgdGltZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBlbmRcblx0XHRzZWxmXG5cdFx0XG5cdCMgY2FsbGVkIG9uIDxzZWxmPiB0byBjaGVjayBpZiBzZWxmIGlzIGNhbGxlZCBmcm9tIG90aGVyIHBsYWNlc1xuXHRkZWYgJG9wZW4gY29udGV4dFxuXHRcdGlmIGNvbnRleHQgIT0gQGNvbnRleHRfXG5cdFx0XHRAdHJlZV8gPSBudWxsXG5cdFx0XHRAY29udGV4dF8gPSBjb250ZXh0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUaGlzIGlzIGNhbGxlZCBpbnN0ZWFkIG9mIEltYmEuVGFnI2VuZCBmb3IgYDxzZWxmPmAgdGFnIGNoYWlucy5cblx0RGVmYXVsdHMgdG8gbm9vcFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHN5bmNlZFxuXHRcdHNlbGZcblxuXHQjIGNhbGxlZCB3aGVuIHRoZSBub2RlIGlzIGF3YWtlbmVkIGluIHRoZSBkb20gLSBlaXRoZXIgYXV0b21hdGljYWxseVxuXHQjIHVwb24gYXR0YWNobWVudCB0byB0aGUgZG9tLXRyZWUsIG9yIHRoZSBmaXJzdCB0aW1lIGltYmEgbmVlZHMgdGhlXG5cdCMgdGFnIGZvciBhIGRvbW5vZGUgdGhhdCBoYXMgYmVlbiByZW5kZXJlZCBvbiB0aGUgc2VydmVyXG5cdGRlZiBhd2FrZW5cblx0XHRzZWxmXG5cblx0IyMjXG5cdExpc3Qgb2YgZmxhZ3MgZm9yIHRoaXMgbm9kZS4gXG5cdCMjI1xuXHRkZWYgZmxhZ3Ncblx0XHRAZG9tOmNsYXNzTGlzdFxuXG5cdCMjI1xuXHRBZGQgc3BlZmljaWVkIGZsYWcgdG8gY3VycmVudCBub2RlLlxuXHRJZiBhIHNlY29uZCBhcmd1bWVudCBpcyBzdXBwbGllZCwgaXQgd2lsbCBiZSBjb2VyY2VkIGludG8gYSBCb29sZWFuLFxuXHRhbmQgdXNlZCB0byBpbmRpY2F0ZSB3aGV0aGVyIHdlIHNob3VsZCByZW1vdmUgdGhlIGZsYWcgaW5zdGVhZC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbGFnIG5hbWUsIHRvZ2dsZXJcblx0XHQjIGl0IGlzIG1vc3QgbmF0dXJhbCB0byB0cmVhdCBhIHNlY29uZCB1bmRlZmluZWQgYXJndW1lbnQgYXMgYSBuby1zd2l0Y2hcblx0XHQjIHNvIHdlIG5lZWQgdG8gY2hlY2sgdGhlIGFyZ3VtZW50cy1sZW5ndGhcblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdGlmIEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpICE9ICEhdG9nZ2xlclxuXHRcdFx0XHRAZG9tOmNsYXNzTGlzdC50b2dnbGUobmFtZSlcblx0XHRlbHNlXG5cdFx0XHQjIGZpcmVmb3ggd2lsbCB0cmlnZ2VyIGEgY2hhbmdlIGlmIGFkZGluZyBleGlzdGluZyBjbGFzc1xuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKG5hbWUpIHVubGVzcyBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgZmxhZyBmcm9tIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB1bmZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0VG9nZ2xlIHNwZWNpZmllZCBmbGFnIG9uIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0b2dnbGVGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC50b2dnbGUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgY3VycmVudCBub2RlIGhhcyBzcGVjaWZpZWQgZmxhZ1xuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGhhc0ZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cblx0XG5cdGRlZiBmbGFnSWYgZmxhZywgYm9vbFxuXHRcdHZhciBmID0gQGZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZbZmxhZ11cblxuXHRcdGlmIGJvb2wgYW5kICFwcmV2XG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5hZGQoZmxhZylcblx0XHRcdGZbZmxhZ10gPSB5ZXNcblx0XHRlbGlmIHByZXYgYW5kICFib29sXG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUoZmxhZylcblx0XHRcdGZbZmxhZ10gPSBub1xuXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0IyMjXG5cdFNldC91cGRhdGUgYSBuYW1lZCBmbGFnLiBJdCByZW1lbWJlcnMgdGhlIHByZXZpb3VzXG5cdHZhbHVlIG9mIHRoZSBmbGFnLCBhbmQgcmVtb3ZlcyBpdCBiZWZvcmUgc2V0dGluZyB0aGUgbmV3IHZhbHVlLlxuXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywndG9kbycpXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywncHJvamVjdCcpXG5cdFx0IyB0b2RvIGlzIHJlbW92ZWQsIHByb2plY3QgaXMgYWRkZWQuXG5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRGbGFnIG5hbWUsIHZhbHVlXG5cdFx0bGV0IGZsYWdzID0gQG5hbWVkRmxhZ3NfIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZmxhZ3NbbmFtZV1cblx0XHRpZiBwcmV2ICE9IHZhbHVlXG5cdFx0XHR1bmZsYWcocHJldikgaWYgcHJldlxuXHRcdFx0ZmxhZyh2YWx1ZSkgaWYgdmFsdWVcblx0XHRcdGZsYWdzW25hbWVdID0gdmFsdWVcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgc2NoZWR1bGVyIGZvciB0aGlzIG5vZGUuIEEgbmV3IHNjaGVkdWxlciB3aWxsIGJlIGNyZWF0ZWRcblx0aWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cblxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZXJcblx0XHRAc2NoZWR1bGVyID89IEltYmEuU2NoZWR1bGVyLm5ldyhzZWxmKVxuXG5cdCMjI1xuXG5cdFNob3J0aGFuZCB0byBzdGFydCBzY2hlZHVsaW5nIGEgbm9kZS4gVGhlIG1ldGhvZCB3aWxsIGJhc2ljYWxseVxuXHRwcm94eSB0aGUgYXJndW1lbnRzIHRocm91Z2ggdG8gc2NoZWR1bGVyLmNvbmZpZ3VyZSwgYW5kIHRoZW5cblx0YWN0aXZhdGUgdGhlIHNjaGVkdWxlci5cblx0XG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGUgb3B0aW9ucyA9IHtldmVudHM6IHllc31cblx0XHRzY2hlZHVsZXIuY29uZmlndXJlKG9wdGlvbnMpLmFjdGl2YXRlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGRlYWN0aXZhdGluZyBzY2hlZHVsZXIgKGlmIHRhZyBoYXMgb25lKS5cblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiB1bnNjaGVkdWxlXG5cdFx0c2NoZWR1bGVyLmRlYWN0aXZhdGUgaWYgQHNjaGVkdWxlclxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHBhcmVudCBvZiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWd9IFxuXHQjIyNcblx0ZGVmIHBhcmVudFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKGRvbTpwYXJlbnROb2RlKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWdbXX1cblx0IyMjXG5cdGRlZiBjaGlsZHJlbiBzZWxcblx0XHRmb3IgaXRlbSBpbiBAZG9tOmNoaWxkcmVuXG5cdFx0XHRpdGVtLkB0YWcgb3IgSW1iYS5nZXRUYWdGb3JEb20oaXRlbSlcblx0XG5cdGRlZiBxdWVyeVNlbGVjdG9yIHFcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLnF1ZXJ5U2VsZWN0b3IocSkpXG5cblx0ZGVmIHF1ZXJ5U2VsZWN0b3JBbGwgcVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbS5xdWVyeVNlbGVjdG9yQWxsKHEpXG5cdFx0XHRpdGVtcy5wdXNoKCBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKSApXG5cdFx0cmV0dXJuIGl0ZW1zXG5cblx0IyMjXG5cdENoZWNrIGlmIHRoaXMgbm9kZSBtYXRjaGVzIGEgc2VsZWN0b3Jcblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBtYXRjaGVzIHNlbFxuXHRcdGlmIHNlbCBpc2EgRnVuY3Rpb25cblx0XHRcdHJldHVybiBzZWwoc2VsZilcblxuXHRcdHNlbCA9IHNlbC5xdWVyeSBpZiBzZWw6cXVlcnkgaXNhIEZ1bmN0aW9uXG5cdFx0aWYgdmFyIGZuID0gKEBkb206bWF0Y2hlcyBvciBAZG9tOm1hdGNoZXNTZWxlY3RvciBvciBAZG9tOndlYmtpdE1hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1zTWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bW96TWF0Y2hlc1NlbGVjdG9yKVxuXHRcdFx0cmV0dXJuIGZuLmNhbGwoQGRvbSxzZWwpXG5cblx0IyMjXG5cdEdldCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyBzdXBwbGllZCBzZWxlY3RvciAvIGZpbHRlclxuXHR0cmF2ZXJzaW5nIHVwd2FyZHMsIGJ1dCBpbmNsdWRpbmcgdGhlIG5vZGUgaXRzZWxmLlxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBjbG9zZXN0IHNlbFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20uY2xvc2VzdChzZWwpKVxuXG5cdCMjI1xuXHRDaGVjayBpZiBub2RlIGNvbnRhaW5zIG90aGVyIG5vZGVcblx0QHJldHVybiB7Qm9vbGVhbn0gXG5cdCMjI1xuXHRkZWYgY29udGFpbnMgbm9kZVxuXHRcdGRvbS5jb250YWlucyhub2RlLkBkb20gb3Igbm9kZSlcblxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGNvbnNvbGUubG9nIG9uIGVsZW1lbnRzXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbG9nICphcmdzXG5cdFx0YXJncy51bnNoaWZ0KGNvbnNvbGUpXG5cdFx0RnVuY3Rpb246cHJvdG90eXBlOmNhbGwuYXBwbHkoY29uc29sZTpsb2csIGFyZ3MpXG5cdFx0c2VsZlxuXG5cdGRlZiBjc3Mga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0Y3NzKGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIG5hbWUgPSBJbWJhLkNTU0tleU1hcFtrZXldIG9yIGtleVxuXG5cdFx0aWYgdmFsID09IG51bGxcblx0XHRcdGRvbTpzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKVxuXHRcdGVsaWYgdmFsID09IHVuZGVmaW5lZCBhbmQgYXJndW1lbnRzOmxlbmd0aCA9PSAxXG5cdFx0XHRyZXR1cm4gZG9tOnN0eWxlW25hbWVdXG5cdFx0ZWxzZVxuXHRcdFx0aWYgdmFsIGlzYSBOdW1iZXIgYW5kIG5hbWUubWF0Y2goL3dpZHRofGhlaWdodHxsZWZ0fHJpZ2h0fHRvcHxib3R0b20vKVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWwgKyBcInB4XCJcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0U3R5bGUgc3R5bGVcblx0XHRzZXRBdHRyaWJ1dGUoJ3N0eWxlJyxzdHlsZSlcblxuXHRkZWYgc3R5bGVcblx0XHRnZXRBdHRyaWJ1dGUoJ3N0eWxlJylcblxuXHQjIyNcblx0VHJpZ2dlciBhbiBldmVudCBmcm9tIGN1cnJlbnQgbm9kZS4gRGlzcGF0Y2hlZCB0aHJvdWdoIHRoZSBJbWJhIGV2ZW50IG1hbmFnZXIuXG5cdFRvIGRpc3BhdGNoIGFjdHVhbCBkb20gZXZlbnRzLCB1c2UgZG9tLmRpc3BhdGNoRXZlbnQgaW5zdGVhZC5cblxuXHRAcmV0dXJuIHtJbWJhLkV2ZW50fVxuXHQjIyNcblx0ZGVmIHRyaWdnZXIgbmFtZSwgZGF0YSA9IHt9XG5cdFx0JHdlYiQgPyBJbWJhLkV2ZW50cy50cmlnZ2VyKG5hbWUsc2VsZixkYXRhOiBkYXRhKSA6IG51bGxcblxuXHQjIyNcblx0Rm9jdXMgb24gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZm9jdXNcblx0XHRkb20uZm9jdXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBmb2N1cyBmcm9tIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJsdXJcblx0XHRkb20uYmx1clxuXHRcdHNlbGZcblxuXHRkZWYgdG9TdHJpbmdcblx0XHRkb206b3V0ZXJIVE1MXG5cdFxuXG5JbWJhLlRhZzpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IEltYmEuVGFnXG5cbmNsYXNzIEltYmEuU1ZHVGFnIDwgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5uYW1lc3BhY2VVUklcblx0XHRcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLEBub2RlVHlwZSlcblx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRkb206Y2xhc3NOYW1lOmJhc2VWYWwgPSBjbHMgaWYgY2xzXG5cdFx0ZG9tXG5cblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblx0XHRpZiBjaGlsZC5AbmFtZSBpbiBJbWJhLlNWR19UQUdTXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IFwiX1wiICsgY2hpbGQuQG5hbWUucmVwbGFjZSgvXy9nLCAnLScpXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLmNvbmNhdChjbGFzc05hbWUpXG5cbkltYmEuSFRNTF9UQUdTID0gXCJhIGFiYnIgYWRkcmVzcyBhcmVhIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiYXNlIGJkaSBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBiciBidXR0b24gY2FudmFzIGNhcHRpb24gY2l0ZSBjb2RlIGNvbCBjb2xncm91cCBkYXRhIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXYgZGwgZHQgZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGZvcm0gaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaHIgaHRtbCBpIGlmcmFtZSBpbWcgaW5wdXQgaW5zIGtiZCBrZXlnZW4gbGFiZWwgbGVnZW5kIGxpIGxpbmsgbWFpbiBtYXAgbWFyayBtZW51IG1lbnVpdGVtIG1ldGEgbWV0ZXIgbmF2IG5vc2NyaXB0IG9iamVjdCBvbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcGFyYW0gcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBzIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0cmFjayB1IHVsIHZhciB2aWRlbyB3YnJcIi5zcGxpdChcIiBcIilcbkltYmEuSFRNTF9UQUdTX1VOU0FGRSA9IFwiYXJ0aWNsZSBhc2lkZSBoZWFkZXIgc2VjdGlvblwiLnNwbGl0KFwiIFwiKVxuSW1iYS5TVkdfVEFHUyA9IFwiY2lyY2xlIGRlZnMgZWxsaXBzZSBnIGxpbmUgbGluZWFyR3JhZGllbnQgbWFzayBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHN0b3Agc3ZnIHRleHQgdHNwYW5cIi5zcGxpdChcIiBcIilcblxuSW1iYS5IVE1MX0FUVFJTID1cblx0YTogXCJocmVmIHRhcmdldCBocmVmbGFuZyBtZWRpYSBkb3dubG9hZCByZWwgdHlwZVwiXG5cdGZvcm06IFwibWV0aG9kIGFjdGlvbiBlbmN0eXBlIGF1dG9jb21wbGV0ZSB0YXJnZXRcIlxuXHRidXR0b246IFwiYXV0b2ZvY3VzIHR5cGVcIlxuXHRpbnB1dDogXCJhY2NlcHQgZGlzYWJsZWQgZm9ybSBsaXN0IG1heCBtYXhsZW5ndGggbWluIHBhdHRlcm4gcmVxdWlyZWQgc2l6ZSBzdGVwIHR5cGVcIlxuXHRsYWJlbDogXCJhY2Nlc3NrZXkgZm9yIGZvcm1cIlxuXHRpbWc6IFwic3JjIHNyY3NldFwiXG5cdGxpbms6IFwicmVsIHR5cGUgaHJlZiBtZWRpYVwiXG5cdGlmcmFtZTogXCJyZWZlcnJlcnBvbGljeSBzcmMgc3JjZG9jIHNhbmRib3hcIlxuXHRtZXRhOiBcInByb3BlcnR5IGNvbnRlbnQgY2hhcnNldCBkZXNjXCJcblx0b3B0Z3JvdXA6IFwibGFiZWxcIlxuXHRvcHRpb246IFwibGFiZWxcIlxuXHRvdXRwdXQ6IFwiZm9yIGZvcm1cIlxuXHRvYmplY3Q6IFwidHlwZSBkYXRhIHdpZHRoIGhlaWdodFwiXG5cdHBhcmFtOiBcIm5hbWUgdmFsdWVcIlxuXHRwcm9ncmVzczogXCJtYXhcIlxuXHRzY3JpcHQ6IFwic3JjIHR5cGUgYXN5bmMgZGVmZXIgY3Jvc3NvcmlnaW4gaW50ZWdyaXR5IG5vbmNlIGxhbmd1YWdlXCJcblx0c2VsZWN0OiBcInNpemUgZm9ybSBtdWx0aXBsZVwiXG5cdHRleHRhcmVhOiBcInJvd3MgY29sc1wiXG5cblxuSW1iYS5IVE1MX1BST1BTID1cblx0aW5wdXQ6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0dGV4dGFyZWE6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0Zm9ybTogXCJub3ZhbGlkYXRlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRidXR0b246IFwiZGlzYWJsZWRcIlxuXHRzZWxlY3Q6IFwiYXV0b2ZvY3VzIGRpc2FibGVkIHJlcXVpcmVkXCJcblx0b3B0aW9uOiBcImRpc2FibGVkIHNlbGVjdGVkIHZhbHVlXCJcblx0b3B0Z3JvdXA6IFwiZGlzYWJsZWRcIlxuXHRwcm9ncmVzczogXCJ2YWx1ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0Y2FudmFzOiBcIndpZHRoIGhlaWdodFwiXG5cbmRlZiBleHRlbmRlciBvYmosIHN1cFxuXHRmb3Igb3duIGssdiBvZiBzdXBcblx0XHRvYmpba10gPz0gdlxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRzdXAuaW5oZXJpdChvYmopIGlmIHN1cDppbmhlcml0XG5cdHJldHVybiBvYmpcblxuZGVmIFRhZ1xuXHRyZXR1cm4gZG8gfGRvbSxjdHh8XG5cdFx0dGhpcy5pbml0aWFsaXplKGRvbSxjdHgpXG5cdFx0cmV0dXJuIHRoaXNcblxuZGVmIFRhZ1NwYXduZXIgdHlwZVxuXHRyZXR1cm4gZG8gfHpvbmV8IHR5cGUuYnVpbGQoem9uZSlcblxuXG5jbGFzcyBJbWJhLlRhZ3NcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdHNlbGZcblxuXHRkZWYgX19jbG9uZSBuc1xuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBucyBuYW1lXG5cdFx0c2VsZlsnXycgKyBuYW1lLnRvVXBwZXJDYXNlXSB8fCBkZWZpbmVOYW1lc3BhY2UobmFtZSlcblxuXHRkZWYgZGVmaW5lTmFtZXNwYWNlIG5hbWVcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRjbG9uZS5AbnMgPSBuYW1lXG5cdFx0c2VsZlsnXycgKyBuYW1lLnRvVXBwZXJDYXNlXSA9IGNsb25lXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIGJhc2VUeXBlIG5hbWUsIG5zXG5cdFx0bmFtZSBpbiBJbWJhLkhUTUxfVEFHUyA/ICdlbGVtZW50JyA6ICdkaXYnXG5cblx0ZGVmIGRlZmluZVRhZyBmdWxsTmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdGlmIGJvZHkgYW5kIGJvZHkuQG5vZGVUeXBlXG5cdFx0XHRzdXByID0gYm9keVxuXHRcdFx0Ym9keSA9IG51bGxcblx0XHRcdFxuXHRcdGlmIHNlbGZbZnVsbE5hbWVdXG5cdFx0XHRjb25zb2xlLmxvZyBcInRhZyBhbHJlYWR5IGV4aXN0cz9cIixmdWxsTmFtZVxuXHRcdFxuXHRcdCMgaWYgaXQgaXMgbmFtZXNwYWNlZFxuXHRcdHZhciBuc1xuXHRcdHZhciBuYW1lID0gZnVsbE5hbWVcblx0XHRsZXQgbnNpZHggPSBuYW1lLmluZGV4T2YoJzonKVxuXHRcdGlmICBuc2lkeCA+PSAwXG5cdFx0XHRucyA9IGZ1bGxOYW1lLnN1YnN0cigwLG5zaWR4KVxuXHRcdFx0bmFtZSA9IGZ1bGxOYW1lLnN1YnN0cihuc2lkeCArIDEpXG5cdFx0XHRpZiBucyA9PSAnc3ZnJyBhbmQgIXN1cHJcblx0XHRcdFx0c3VwciA9ICdzdmc6ZWxlbWVudCdcblxuXHRcdHN1cHIgfHw9IGJhc2VUeXBlKGZ1bGxOYW1lKVxuXG5cdFx0bGV0IHN1cGVydHlwZSA9IHN1cHIgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKHN1cHIpIDogc3VwclxuXHRcdGxldCB0YWd0eXBlID0gVGFnKClcblxuXHRcdHRhZ3R5cGUuQG5hbWUgPSBuYW1lXG5cdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBudWxsXG5cblx0XHRpZiBuYW1lWzBdID09ICcjJ1xuXHRcdFx0SW1iYS5TSU5HTEVUT05TW25hbWUuc2xpY2UoMSldID0gdGFndHlwZVxuXHRcdFx0c2VsZltuYW1lXSA9IHRhZ3R5cGVcblx0XHRlbGlmIG5hbWVbMF0gPT0gbmFtZVswXS50b1VwcGVyQ2FzZVxuXHRcdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBuYW1lXG5cdFx0ZWxzZVxuXHRcdFx0dGFndHlwZS5AZmxhZ05hbWUgPSBcIl9cIiArIGZ1bGxOYW1lLnJlcGxhY2UoL1tfXFw6XS9nLCAnLScpXG5cdFx0XHRzZWxmW2Z1bGxOYW1lXSA9IHRhZ3R5cGVcblxuXHRcdGV4dGVuZGVyKHRhZ3R5cGUsc3VwZXJ0eXBlKVxuXG5cdFx0aWYgYm9keVxuXHRcdFx0Ym9keS5jYWxsKHRhZ3R5cGUsdGFndHlwZSwgdGFndHlwZS5UQUdTIG9yIHNlbGYpXG5cdFx0XHR0YWd0eXBlLmRlZmluZWQgaWYgdGFndHlwZTpkZWZpbmVkXG5cdFx0XHRvcHRpbWl6ZVRhZyh0YWd0eXBlKVxuXHRcdHJldHVybiB0YWd0eXBlXG5cblx0ZGVmIGRlZmluZVNpbmdsZXRvbiBuYW1lLCBzdXByLCAmYm9keVxuXHRcdGRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuXHRkZWYgZXh0ZW5kVGFnIG5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHR2YXIga2xhc3MgPSAobmFtZSBpc2EgU3RyaW5nID8gZmluZFRhZ1R5cGUobmFtZSkgOiBuYW1lKVxuXHRcdCMgYWxsb3cgZm9yIHByaXZhdGUgdGFncyBoZXJlIGFzIHdlbGw/XG5cdFx0Ym9keSBhbmQgYm9keS5jYWxsKGtsYXNzLGtsYXNzLGtsYXNzOnByb3RvdHlwZSkgaWYgYm9keVxuXHRcdGtsYXNzLmV4dGVuZGVkIGlmIGtsYXNzOmV4dGVuZGVkXG5cdFx0b3B0aW1pemVUYWcoa2xhc3MpXG5cdFx0cmV0dXJuIGtsYXNzXG5cblx0ZGVmIG9wdGltaXplVGFnIHRhZ3R5cGVcblx0XHR0YWd0eXBlOnByb3RvdHlwZT8ub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHRcblx0ZGVmIGZpbmRUYWdUeXBlIHR5cGVcblx0XHRsZXQga2xhc3MgPSBzZWxmW3R5cGVdXG5cdFx0dW5sZXNzIGtsYXNzXG5cdFx0XHRpZiB0eXBlLnN1YnN0cigwLDQpID09ICdzdmc6J1xuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdzdmc6ZWxlbWVudCcpXG5cblx0XHRcdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZih0eXBlKSA+PSAwXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ2VsZW1lbnQnKVxuXG5cdFx0XHRcdGlmIGxldCBhdHRycyA9IEltYmEuSFRNTF9BVFRSU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIGF0dHJzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUpXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0aWYgbGV0IHByb3BzID0gSW1iYS5IVE1MX1BST1BTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gcHJvcHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSxkb206IHllcylcblx0XHRyZXR1cm4ga2xhc3Ncblx0XHRcblx0ZGVmIGNyZWF0ZUVsZW1lbnQgbmFtZSwgb3duZXJcblx0XHR2YXIgdHlwXG5cdFx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHRcdHR5cCA9IG5hbWVcblx0XHRlbHNlXHRcdFx0XG5cdFx0XHRpZiAkZGVidWckXG5cdFx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge25hbWV9XCIpIHVubGVzcyBmaW5kVGFnVHlwZShuYW1lKVxuXHRcdFx0dHlwID0gZmluZFRhZ1R5cGUobmFtZSlcblx0XHR0eXAuYnVpbGQob3duZXIpXG5cblxuZGVmIEltYmEuY3JlYXRlRWxlbWVudCBuYW1lLCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIHBhcmVudFxuXHRpZiBuYW1lIGlzYSBGdW5jdGlvblxuXHRcdHR5cGUgPSBuYW1lXG5cdGVsc2Vcblx0XHRpZiAkZGVidWckXG5cdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgSW1iYS5UQUdTLmZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwZSA9IEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcblx0aWYgY3R4IGlzYSBUYWdNYXBcblx0XHRwYXJlbnQgPSBjdHg6cGFyJFxuXHRlbGlmIHByZWYgaXNhIEltYmEuVGFnXG5cdFx0cGFyZW50ID0gcHJlZlxuXHRlbHNlXG5cdFx0cGFyZW50ID0gY3R4IGFuZCBwcmVmICE9IHVuZGVmaW5lZCA/IGN0eFtwcmVmXSA6IChjdHggYW5kIGN0eC5AdGFnIG9yIGN0eClcblxuXHR2YXIgbm9kZSA9IHR5cGUuYnVpbGQocGFyZW50KVxuXHRcblx0aWYgY3R4IGlzYSBUYWdNYXBcblx0XHRjdHg6aSQrK1xuXHRcdG5vZGU6JGtleSA9IHJlZlxuXG5cdCMgbm9kZTokcmVmID0gcmVmIGlmIHJlZlxuXHQjIGNvbnRleHQ6aSQrKyAjIG9ubHkgaWYgaXQgaXMgbm90IGFuIGFycmF5P1xuXHRpZiBjdHggYW5kIHJlZiAhPSB1bmRlZmluZWRcblx0XHRjdHhbcmVmXSA9IG5vZGVcblxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdDYWNoZSBvd25lclxuXHR2YXIgaXRlbSA9IFtdXG5cdGl0ZW0uQHRhZyA9IG93bmVyXG5cdHJldHVybiBpdGVtXG5cblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IGN0eFtwcmVmXSA6IGN0eC5AdGFnKVxuXHR2YXIgbm9kZSA9IFRhZ01hcC5uZXcoY3R4LHJlZixwYXIpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXHRcbmRlZiBJbWJhLmNyZWF0ZVRhZ01hcCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgcGFyID0gKHByZWYgIT0gdW5kZWZpbmVkID8gcHJlZiA6IGN0eC5AdGFnKVxuXHR2YXIgbm9kZSA9IFRhZ01hcC5uZXcoY3R4LHJlZixwYXIpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdMaXN0IGN0eCwgcmVmLCBwcmVmXG5cdHZhciBub2RlID0gW11cblx0bm9kZS5AdHlwZSA9IDRcblx0bm9kZS5AdGFnID0gKHByZWYgIT0gdW5kZWZpbmVkID8gcHJlZiA6IGN0eC5AdGFnKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTG9vcFJlc3VsdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA1XG5cdG5vZGU6Y2FjaGUgPSB7aSQ6IDB9XG5cdHJldHVybiBub2RlXG5cbiMgdXNlIGFycmF5IGluc3RlYWQ/XG5jbGFzcyBUYWdDYWNoZVxuXHRkZWYgc2VsZi5idWlsZCBvd25lclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0YWcgPSBvd25lclxuXHRcdHJldHVybiBpdGVtXG5cblx0ZGVmIGluaXRpYWxpemUgb3duZXJcblx0XHRzZWxmLkB0YWcgPSBvd25lclxuXHRcdHNlbGZcblx0XG5jbGFzcyBUYWdNYXBcblx0XG5cdGRlZiBpbml0aWFsaXplIGNhY2hlLCByZWYsIHBhclxuXHRcdHNlbGY6Y2FjaGUkID0gY2FjaGVcblx0XHRzZWxmOmtleSQgPSByZWZcblx0XHRzZWxmOnBhciQgPSBwYXJcblx0XHRzZWxmOmkkID0gMFxuXHRcdCMgc2VsZjpjdXJyJCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcdCMgc2VsZjpuZXh0JCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcblx0ZGVmICRpdGVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHR5cGUgPSA1XG5cdFx0aXRlbTpzdGF0aWMgPSA1ICMgd3JvbmcoISlcblx0XHRpdGVtOmNhY2hlID0gc2VsZlxuXHRcdHJldHVybiBpdGVtXG5cdFx0XG5cdGRlZiAkcHJ1bmUgaXRlbXNcblx0XHRsZXQgY2FjaGUgPSBzZWxmOmNhY2hlJFxuXHRcdGxldCBrZXkgPSBzZWxmOmtleSRcblx0XHRsZXQgY2xvbmUgPSBUYWdNYXAubmV3KGNhY2hlLGtleSxzZWxmOnBhciQpXG5cdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdGNsb25lW2l0ZW06a2V5JF0gPSBpdGVtXG5cdFx0Y2xvbmU6aSQgPSBpdGVtczpsZW5ndGhcblx0XHRyZXR1cm4gY2FjaGVba2V5XSA9IGNsb25lXG5cbkltYmEuVGFnTWFwID0gVGFnTWFwXG5JbWJhLlRhZ0NhY2hlID0gVGFnQ2FjaGVcbkltYmEuU0lOR0xFVE9OUyA9IHt9XG5JbWJhLlRBR1MgPSBJbWJhLlRhZ3MubmV3XG5JbWJhLlRBR1NbOmVsZW1lbnRdID0gSW1iYS5UQUdTWzpodG1sZWxlbWVudF0gPSBJbWJhLlRhZ1xuSW1iYS5UQUdTWydzdmc6ZWxlbWVudCddID0gSW1iYS5TVkdUYWdcblxuZGVmIEltYmEuZGVmaW5lVGFnIG5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmRlZmluZVNpbmdsZXRvblRhZyBpZCwgc3VwciA9ICdkaXYnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZXh0ZW5kVGFnIG5hbWUsIGJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5leHRlbmRUYWcobmFtZSxib2R5KVxuXG5kZWYgSW1iYS5nZXRUYWdTaW5nbGV0b24gaWRcdFxuXHR2YXIgZG9tLCBub2RlXG5cblx0aWYgdmFyIGtsYXNzID0gSW1iYS5TSU5HTEVUT05TW2lkXVxuXHRcdHJldHVybiBrbGFzcy5JbnN0YW5jZSBpZiBrbGFzcyBhbmQga2xhc3MuSW5zdGFuY2UgXG5cblx0XHQjIG5vIGluc3RhbmNlIC0gY2hlY2sgZm9yIGVsZW1lbnRcblx0XHRpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdFx0IyB3ZSBoYXZlIGEgbGl2ZSBpbnN0YW5jZSAtIHdoZW4gZmluZGluZyBpdCB0aHJvdWdoIGEgc2VsZWN0b3Igd2Ugc2hvdWxkIGF3YWtlIGl0LCBubz9cblx0XHRcdCMgY29uc29sZS5sb2coJ2NyZWF0aW5nIHRoZSBzaW5nbGV0b24gZnJvbSBleGlzdGluZyBub2RlIGluIGRvbT8nLGlkLHR5cGUpXG5cdFx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdFx0bm9kZS5hd2FrZW4oZG9tKSAjIHNob3VsZCBvbmx5IGF3YWtlblxuXHRcdFx0cmV0dXJuIG5vZGVcblxuXHRcdGRvbSA9IGtsYXNzLmNyZWF0ZU5vZGVcblx0XHRkb206aWQgPSBpZFxuXHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0bm9kZS5lbmQuYXdha2VuKGRvbSlcblx0XHRyZXR1cm4gbm9kZVxuXHRlbGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnRm9yRG9tKGRvbSlcblxudmFyIHN2Z1N1cHBvcnQgPSB0eXBlb2YgU1ZHRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuIyBzaHVvbGQgYmUgcGhhc2VkIG91dFxuZGVmIEltYmEuZ2V0VGFnRm9yRG9tIGRvbVxuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tXG5cdHJldHVybiBkb20gaWYgZG9tLkBkb20gIyBjb3VsZCB1c2UgaW5oZXJpdGFuY2UgaW5zdGVhZFxuXHRyZXR1cm4gZG9tLkB0YWcgaWYgZG9tLkB0YWdcblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbTpub2RlTmFtZVxuXG5cdHZhciBuYW1lID0gZG9tOm5vZGVOYW1lLnRvTG93ZXJDYXNlXG5cdHZhciB0eXBlID0gbmFtZVxuXHR2YXIgbnMgPSBJbWJhLlRBR1MgIyAgc3ZnU3VwcG9ydCBhbmQgZG9tIGlzYSBTVkdFbGVtZW50ID8gSW1iYS5UQUdTOl9TVkcgOiBJbWJhLlRBR1NcblxuXHRpZiBkb206aWQgYW5kIEltYmEuU0lOR0xFVE9OU1tkb206aWRdXG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnU2luZ2xldG9uKGRvbTppZClcblx0XHRcblx0aWYgc3ZnU3VwcG9ydCBhbmQgZG9tIGlzYSBTVkdFbGVtZW50XG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKFwic3ZnOlwiICsgbmFtZSlcblx0ZWxpZiBJbWJhLkhUTUxfVEFHUy5pbmRleE9mKG5hbWUpID49IDBcblx0XHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblx0ZWxzZVxuXHRcdHR5cGUgPSBJbWJhLlRhZ1xuXHQjIGlmIG5zLkBub2RlTmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwXG5cdCNcdHR5cGUgPSBucy5maW5kVGFnVHlwZShuYW1lKVxuXG5cdHJldHVybiB0eXBlLm5ldyhkb20sbnVsbCkuYXdha2VuKGRvbSlcblxuIyBkZXByZWNhdGVcbmRlZiBJbWJhLmdlbmVyYXRlQ1NTUHJlZml4ZXNcblx0dmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50OmRvY3VtZW50RWxlbWVudCwgJycpXG5cblx0Zm9yIHByZWZpeGVkIGluIHN0eWxlc1xuXHRcdHZhciB1bnByZWZpeGVkID0gcHJlZml4ZWQucmVwbGFjZSgvXi0od2Via2l0fG1zfG1venxvfGJsaW5rKS0vLCcnKVxuXHRcdHZhciBjYW1lbENhc2UgPSB1bnByZWZpeGVkLnJlcGxhY2UoLy0oXFx3KS9nKSBkbyB8bSxhfCBhLnRvVXBwZXJDYXNlXG5cblx0XHQjIGlmIHRoZXJlIGV4aXN0cyBhbiB1bnByZWZpeGVkIHZlcnNpb24gLS0gYWx3YXlzIHVzZSB0aGlzXG5cdFx0aWYgcHJlZml4ZWQgIT0gdW5wcmVmaXhlZFxuXHRcdFx0Y29udGludWUgaWYgc3R5bGVzLmhhc093blByb3BlcnR5KHVucHJlZml4ZWQpXG5cblx0XHQjIHJlZ2lzdGVyIHRoZSBwcmVmaXhlc1xuXHRcdEltYmEuQ1NTS2V5TWFwW3VucHJlZml4ZWRdID0gSW1iYS5DU1NLZXlNYXBbY2FtZWxDYXNlXSA9IHByZWZpeGVkXG5cdHJldHVyblxuXG5pZiAkd2ViJFxuXHRJbWJhLmdlbmVyYXRlQ1NTUHJlZml4ZXMgaWYgZG9jdW1lbnRcblxuXHQjIE92dmVycmlkZSBjbGFzc0xpc3Rcblx0aWYgZG9jdW1lbnQgYW5kICFkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQ6Y2xhc3NMaXN0XG5cdFx0ZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0XHRcdGRlZiBoYXNGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gUmVnRXhwLm5ldygnKF58XFxcXHMpJyArIHJlZiArICcoXFxcXHN8JCknKS50ZXN0KEBkb206Y2xhc3NOYW1lKVxuXG5cdFx0XHRkZWYgYWRkRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgaWYgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lICs9IChAZG9tOmNsYXNzTmFtZSA/ICcgJyA6ICcnKSArIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdW5mbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdHZhciByZWdleCA9IFJlZ0V4cC5uZXcoJyhefFxcXFxzKSonICsgcmVmICsgJyhcXFxcc3wkKSonLCAnZycpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lID0gQGRvbTpjbGFzc05hbWUucmVwbGFjZShyZWdleCwgJycpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB0b2dnbGVGbGFnIHJlZlxuXHRcdFx0XHRoYXNGbGFnKHJlZikgPyB1bmZsYWcocmVmKSA6IGZsYWcocmVmKVxuXG5cdFx0XHRkZWYgZmxhZyByZWYsIGJvb2xcblx0XHRcdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyIGFuZCAhIWJvb2wgPT09IG5vXG5cdFx0XHRcdFx0cmV0dXJuIHVuZmxhZyhyZWYpXG5cdFx0XHRcdHJldHVybiBhZGRGbGFnKHJlZilcblxuSW1iYS5UYWdcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuIyBwcmVkZWZpbmUgYWxsIHN1cHBvcnRlZCBodG1sIHRhZ3NcbnRhZyBmcmFnbWVudCA8IGVsZW1lbnRcblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0SW1iYS5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50XG5cbmV4dGVuZCB0YWcgaHRtbFxuXHRkZWYgcGFyZW50XG5cdFx0bnVsbFxuXG5cbmV4dGVuZCB0YWcgY2FudmFzXG5cdGRlZiBjb250ZXh0IHR5cGUgPSAnMmQnXG5cdFx0ZG9tLmdldENvbnRleHQodHlwZSlcblxuY2xhc3MgRGF0YVByb3h5XHRcblx0ZGVmIHNlbGYuYmluZCByZWNlaXZlciwgZGF0YSwgcGF0aCwgYXJnc1xuXHRcdGxldCBwcm94eSA9IHJlY2VpdmVyLkBkYXRhIHx8PSBzZWxmLm5ldyhyZWNlaXZlcixwYXRoLGFyZ3MpXG5cdFx0cHJveHkuYmluZChkYXRhLHBhdGgsYXJncylcblx0XHRyZXR1cm4gcmVjZWl2ZXJcblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBwYXRoLCBhcmdzXG5cdFx0QG5vZGUgPSBub2RlXG5cdFx0QHBhdGggPSBwYXRoXG5cdFx0QGFyZ3MgPSBhcmdzXG5cdFx0QHNldHRlciA9IEltYmEudG9TZXR0ZXIoQHBhdGgpIGlmIEBhcmdzXG5cdFx0XG5cdGRlZiBiaW5kIGRhdGEsIGtleSwgYXJnc1xuXHRcdGlmIGRhdGEgIT0gQGRhdGFcblx0XHRcdEBkYXRhID0gZGF0YVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGdldEZvcm1WYWx1ZVxuXHRcdEBzZXR0ZXIgPyBAZGF0YVtAcGF0aF0oKSA6IEBkYXRhW0BwYXRoXVxuXG5cdGRlZiBzZXRGb3JtVmFsdWUgdmFsdWVcblx0XHRAc2V0dGVyID8gQGRhdGFbQHNldHRlcl0odmFsdWUpIDogKEBkYXRhW0BwYXRoXSA9IHZhbHVlKVxuXG5cbnZhciBpc0FycmF5ID0gZG8gfHZhbHxcblx0dmFsIGFuZCB2YWw6c3BsaWNlIGFuZCB2YWw6c29ydFxuXG52YXIgaXNTaW1pbGFyQXJyYXkgPSBkbyB8YSxifFxuXHRsZXQgbCA9IGE6bGVuZ3RoLCBpID0gMFxuXHRyZXR1cm4gbm8gdW5sZXNzIGwgPT0gYjpsZW5ndGhcblx0d2hpbGUgaSsrIDwgbFxuXHRcdHJldHVybiBubyBpZiBhW2ldICE9IGJbaV1cblx0cmV0dXJuIHllc1xuXG5leHRlbmQgdGFnIGlucHV0XG5cdHByb3AgbGF6eVxuXG5cdGRlZiBzZXRNb2RlbFxuXHRcdGNvbnNvbGUud2FybiBcInNldE1vZGVsIHJlbW92ZWQuIFVzZSA8aW5wdXRbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdEBkYXRhIGFuZCAhbGF6eSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBtb2RlbFZhbHVlID0gQGxvY2FsVmFsdWUgPSB1bmRlZmluZWRcblx0XHRyZXR1cm4gZS5zaWxlbmNlIHVubGVzcyBkYXRhXG5cdFx0XG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGNoZWNrZWQgPSBAZG9tOmNoZWNrZWRcblx0XHRcdGxldCBtdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZSAhPSB1bmRlZmluZWQgPyBAdmFsdWUgOiB2YWx1ZVxuXG5cdFx0XHRpZiB0eXBlID09ICdyYWRpbydcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKGR2YWwsc2VsZilcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKCEhY2hlY2tlZCxzZWxmKVxuXHRcdFx0ZWxpZiBpc0FycmF5KG12YWwpXG5cdFx0XHRcdGxldCBpZHggPSBtdmFsLmluZGV4T2YoZHZhbClcblx0XHRcdFx0aWYgY2hlY2tlZCBhbmQgaWR4ID09IC0xXG5cdFx0XHRcdFx0bXZhbC5wdXNoKGR2YWwpXG5cdFx0XHRcdGVsaWYgIWNoZWNrZWQgYW5kIGlkeCA+PSAwXG5cdFx0XHRcdFx0bXZhbC5zcGxpY2UoaWR4LDEpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZShkdmFsLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlKVxuXHRcblx0IyBvdmVycmlkaW5nIGVuZCBkaXJlY3RseSBmb3IgcGVyZm9ybWFuY2Vcblx0ZGVmIGVuZFxuXHRcdHJldHVybiBzZWxmIGlmICFAZGF0YSBvciBAbG9jYWxWYWx1ZSAhPT0gdW5kZWZpbmVkXG5cdFx0bGV0IG12YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRyZXR1cm4gc2VsZiBpZiBtdmFsID09IEBtb2RlbFZhbHVlXG5cdFx0QG1vZGVsVmFsdWUgPSBtdmFsIHVubGVzcyBpc0FycmF5KG12YWwpXG5cblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZVxuXHRcdFx0bGV0IGNoZWNrZWQgPSBpZiBpc0FycmF5KG12YWwpXG5cdFx0XHRcdG12YWwuaW5kZXhPZihkdmFsKSA+PSAwXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdCEhbXZhbFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtdmFsID09IEB2YWx1ZVxuXG5cdFx0XHRAZG9tOmNoZWNrZWQgPSBjaGVja2VkXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbTp2YWx1ZSA9IG12YWxcblx0XHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIHRleHRhcmVhXG5cdHByb3AgbGF6eVxuXG5cdGRlZiBzZXRNb2RlbCB2YWx1ZSwgbW9kc1xuXHRcdGNvbnNvbGUud2FybiBcInNldE1vZGVsIHJlbW92ZWQuIFVzZSA8dGV4dGFyZWFbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gdmFsdWUgaWYgQGxvY2FsVmFsdWUgPT0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRAZGF0YSBhbmQgIWxhenkgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2VcblxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0QGRhdGEgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBpZiBAbG9jYWxWYWx1ZSAhPSB1bmRlZmluZWQgb3IgIUBkYXRhXG5cdFx0aWYgQGRhdGFcblx0XHRcdGxldCBkdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0XHRAZG9tOnZhbHVlID0gZHZhbCAhPSB1bmRlZmluZWQgPyBkdmFsIDogJydcblx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyBvcHRpb25cblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0aWYgdmFsdWUgIT0gQHZhbHVlXG5cdFx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgdmFsdWVcblx0XHRAdmFsdWUgb3IgZG9tOnZhbHVlXG5cbmV4dGVuZCB0YWcgc2VsZWN0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPHNlbGVjdFtkYXRhOnBhdGhdPlwiXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlLCBzeW5jaW5nXG5cdFx0bGV0IHByZXYgPSBAdmFsdWVcblx0XHRAdmFsdWUgPSB2YWx1ZVxuXHRcdHN5bmNWYWx1ZSh2YWx1ZSkgdW5sZXNzIHN5bmNpbmdcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc3luY1ZhbHVlIHZhbHVlXG5cdFx0bGV0IHByZXYgPSBAc3luY1ZhbHVlXG5cdFx0IyBjaGVjayBpZiB2YWx1ZSBoYXMgY2hhbmdlZFxuXHRcdGlmIG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdGlmIHByZXYgaXNhIEFycmF5IGFuZCBpc1NpbWlsYXJBcnJheShwcmV2LHZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdFx0IyBjcmVhdGUgYSBjb3B5IGZvciBzeW5jVmFsdWVcblx0XHRcdHZhbHVlID0gdmFsdWUuc2xpY2VcblxuXHRcdEBzeW5jVmFsdWUgPSB2YWx1ZVxuXHRcdCMgc3VwcG9ydCBhcnJheSBmb3IgbXVsdGlwbGU/XG5cdFx0aWYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnXG5cdFx0XHRsZXQgbXVsdCA9IG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdFxuXHRcdFx0Zm9yIG9wdCxpIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdGxldCBvdmFsID0gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpXG5cdFx0XHRcdGlmIG11bHRcblx0XHRcdFx0XHRvcHQ6c2VsZWN0ZWQgPSB2YWx1ZS5pbmRleE9mKG92YWwpID49IDBcblx0XHRcdFx0ZWxpZiB2YWx1ZSA9PSBvdmFsXG5cdFx0XHRcdFx0ZG9tOnNlbGVjdGVkSW5kZXggPSBpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRlbHNlXG5cdFx0XHRkb206dmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHZhbHVlXG5cdFx0aWYgbXVsdGlwbGVcblx0XHRcdGZvciBvcHRpb24gaW4gZG9tOnNlbGVjdGVkT3B0aW9uc1xuXHRcdFx0XHRvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlXG5cdFx0ZWxzZVxuXHRcdFx0bGV0IG9wdCA9IGRvbTpzZWxlY3RlZE9wdGlvbnNbMF1cblx0XHRcdG9wdCA/IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKSA6IG51bGxcblx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QGRhdGEgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIGVuZFxuXHRcdGlmIEBkYXRhXG5cdFx0XHRzZXRWYWx1ZShAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZiksMSlcblxuXHRcdGlmIEB2YWx1ZSAhPSBAc3luY1ZhbHVlXG5cdFx0XHRzeW5jVmFsdWUoQHZhbHVlKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIEltYmEuVG91Y2hcbiMgQmVnYW5cdEEgZmluZ2VyIHRvdWNoZWQgdGhlIHNjcmVlbi5cbiMgTW92ZWRcdEEgZmluZ2VyIG1vdmVkIG9uIHRoZSBzY3JlZW4uXG4jIFN0YXRpb25hcnlcdEEgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBzY3JlZW4gYnV0IGhhc24ndCBtb3ZlZC5cbiMgRW5kZWRcdEEgZmluZ2VyIHdhcyBsaWZ0ZWQgZnJvbSB0aGUgc2NyZWVuLiBUaGlzIGlzIHRoZSBmaW5hbCBwaGFzZSBvZiBhIHRvdWNoLlxuIyBDYW5jZWxlZCBUaGUgc3lzdGVtIGNhbmNlbGxlZCB0cmFja2luZyBmb3IgdGhlIHRvdWNoLlxuXG4jIyNcbkNvbnNvbGlkYXRlcyBtb3VzZSBhbmQgdG91Y2ggZXZlbnRzLiBUb3VjaCBvYmplY3RzIHBlcnNpc3QgYWNyb3NzIGEgdG91Y2gsXG5mcm9tIHRvdWNoc3RhcnQgdW50aWwgZW5kL2NhbmNlbC4gV2hlbiBhIHRvdWNoIHN0YXJ0cywgaXQgd2lsbCB0cmF2ZXJzZVxuZG93biBmcm9tIHRoZSBpbm5lcm1vc3QgdGFyZ2V0LCB1bnRpbCBpdCBmaW5kcyBhIG5vZGUgdGhhdCByZXNwb25kcyB0b1xub250b3VjaHN0YXJ0LiBVbmxlc3MgdGhlIHRvdWNoIGlzIGV4cGxpY2l0bHkgcmVkaXJlY3RlZCwgdGhlIHRvdWNoIHdpbGxcbmNhbGwgb250b3VjaG1vdmUgYW5kIG9udG91Y2hlbmQgLyBvbnRvdWNoY2FuY2VsIG9uIHRoZSByZXNwb25kZXIgd2hlbiBhcHByb3ByaWF0ZS5cblxuXHR0YWcgZHJhZ2dhYmxlXG5cdFx0IyBjYWxsZWQgd2hlbiBhIHRvdWNoIHN0YXJ0c1xuXHRcdGRlZiBvbnRvdWNoc3RhcnQgdG91Y2hcblx0XHRcdGZsYWcgJ2RyYWdnaW5nJ1xuXHRcdFx0c2VsZlxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggbW92ZXMgLSBzYW1lIHRvdWNoIG9iamVjdFxuXHRcdGRlZiBvbnRvdWNobW92ZSB0b3VjaFxuXHRcdFx0IyBtb3ZlIHRoZSBub2RlIHdpdGggdG91Y2hcblx0XHRcdGNzcyB0b3A6IHRvdWNoLmR5LCBsZWZ0OiB0b3VjaC5keFxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggZW5kc1xuXHRcdGRlZiBvbnRvdWNoZW5kIHRvdWNoXG5cdFx0XHR1bmZsYWcgJ2RyYWdnaW5nJ1xuXG5AaW5hbWUgdG91Y2hcbiMjI1xuY2xhc3MgSW1iYS5Ub3VjaFxuXHRzZWxmLkxhc3RUaW1lc3RhbXAgPSAwXG5cdHNlbGYuVGFwVGltZW91dCA9IDUwXG5cblx0IyB2YXIgbGFzdE5hdGl2ZVRvdWNoVGltZW91dCA9IDUwXG5cblx0dmFyIHRvdWNoZXMgPSBbXVxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBpZGVudGlmaWVycyA9IHt9XG5cblx0ZGVmIHNlbGYuY291bnRcblx0XHRjb3VudFxuXG5cdGRlZiBzZWxmLmxvb2t1cCBpdGVtXG5cdFx0cmV0dXJuIGl0ZW0gYW5kIChpdGVtOl9fdG91Y2hfXyBvciBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdKVxuXG5cdGRlZiBzZWxmLnJlbGVhc2UgaXRlbSx0b3VjaFxuXHRcdGRlbGV0ZSBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdXG5cdFx0ZGVsZXRlIGl0ZW06X190b3VjaF9fXG5cdFx0cmV0dXJuXG5cblx0ZGVmIHNlbGYub250b3VjaHN0YXJ0IGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRjb250aW51ZSBpZiBsb29rdXAodClcblx0XHRcdHZhciB0b3VjaCA9IGlkZW50aWZpZXJzW3Q6aWRlbnRpZmllcl0gPSBzZWxmLm5ldyhlKSAjIChlKVxuXHRcdFx0dDpfX3RvdWNoX18gPSB0b3VjaFxuXHRcdFx0dG91Y2hlcy5wdXNoKHRvdWNoKVxuXHRcdFx0Y291bnQrK1xuXHRcdFx0dG91Y2gudG91Y2hzdGFydChlLHQpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2htb3ZlIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2htb3ZlKGUsdClcblxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoZW5kIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hlbmQoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblxuXHRcdCMgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdCMgbm90IGFsd2F5cyBzdXBwb3J0ZWQhXG5cdFx0IyB0b3VjaGVzID0gdG91Y2hlcy5maWx0ZXIofHwpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hjYW5jZWwgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGNhbmNlbChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlZG93biBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vtb3ZlIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZXVwIGVcblx0XHRzZWxmXG5cblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgYWN0aXZlXG5cdHByb3AgZXZlbnRcblx0cHJvcCBwb2ludGVyXG5cdHByb3AgdGFyZ2V0XG5cdHByb3AgaGFuZGxlclxuXHRwcm9wIHVwZGF0ZXNcblx0cHJvcCBzdXBwcmVzc1xuXHRwcm9wIGRhdGFcblx0cHJvcCBidWJibGUgY2hhaW5hYmxlOiB5ZXNcblx0cHJvcCB0aW1lc3RhbXBcblxuXHRwcm9wIGdlc3R1cmVzXG5cblx0IyMjXG5cdEBpbnRlcm5hbFxuXHRAY29uc3RydWN0b3Jcblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIGV2ZW50LCBwb2ludGVyXG5cdFx0IyBAbmF0aXZlICA9IGZhbHNlXG5cdFx0c2VsZi5ldmVudCA9IGV2ZW50XG5cdFx0ZGF0YSA9IHt9XG5cdFx0YWN0aXZlID0geWVzXG5cdFx0QGJ1dHRvbiA9IGV2ZW50IGFuZCBldmVudDpidXR0b24gb3IgMFxuXHRcdEBzdXBwcmVzcyA9IG5vICMgZGVwcmVjYXRlZFxuXHRcdEBjYXB0dXJlZCA9IG5vXG5cdFx0YnViYmxlID0gbm9cblx0XHRwb2ludGVyID0gcG9pbnRlclxuXHRcdHVwZGF0ZXMgPSAwXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY2FwdHVyZVxuXHRcdEBjYXB0dXJlZCA9IHllc1xuXHRcdEBldmVudCBhbmQgQGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuXHRcdHVubGVzcyBAc2VsYmxvY2tlclxuXHRcdFx0QHNlbGJsb2NrZXIgPSBkbyB8ZXwgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgaXNDYXB0dXJlZFxuXHRcdCEhQGNhcHR1cmVkXG5cblx0IyMjXG5cdEV4dGVuZCB0aGUgdG91Y2ggd2l0aCBhIHBsdWdpbiAvIGdlc3R1cmUuIFxuXHRBbGwgZXZlbnRzICh0b3VjaHN0YXJ0LG1vdmUgZXRjKSBmb3IgdGhlIHRvdWNoXG5cdHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoZSBwbHVnaW5zIGluIHRoZSBvcmRlciB0aGV5XG5cdGFyZSBhZGRlZC5cblx0IyMjXG5cdGRlZiBleHRlbmQgcGx1Z2luXG5cdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGdlc3R1cmUhISFcIlxuXHRcdEBnZXN0dXJlcyB8fD0gW11cblx0XHRAZ2VzdHVyZXMucHVzaChwbHVnaW4pXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0b3VjaCB0byBzcGVjaWZpZWQgdGFyZ2V0LiBvbnRvdWNoc3RhcnQgd2lsbCBhbHdheXMgYmVcblx0Y2FsbGVkIG9uIHRoZSBuZXcgdGFyZ2V0LlxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0QHJlZGlyZWN0ID0gdGFyZ2V0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdXBwcmVzcyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIuIFdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCBmb3Jcblx0YWxsIG5hdGl2ZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdG91Y2guXG5cdCMjI1xuXHRkZWYgc3VwcHJlc3Ncblx0XHQjIGNvbGxpc2lvbiB3aXRoIHRoZSBzdXBwcmVzcyBwcm9wZXJ0eVxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgc3VwcHJlc3M9IHZhbHVlXG5cdFx0Y29uc29sZS53YXJuICdJbWJhLlRvdWNoI3N1cHByZXNzPSBpcyBkZXByZWNhdGVkJ1xuXHRcdEBzdXByZXNzID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoc3RhcnQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB0b3VjaCA9IHRcblx0XHRAYnV0dG9uID0gMFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2htb3ZlIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGVuZCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cblx0XHRJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXAgPSBlOnRpbWVTdGFtcFxuXG5cdFx0aWYgQG1heGRyIDwgMjBcblx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdGUucHJldmVudERlZmF1bHQgaWYgdGFwLkByZXNwb25kZXJcdFxuXG5cdFx0aWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdFxuXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGNhbmNlbCBlLHRcblx0XHRjYW5jZWxcblxuXHRkZWYgbW91c2Vkb3duIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAYnV0dG9uID0gZTpidXR0b25cblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2Vtb3ZlIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRAZXZlbnQgPSBlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBpc0NhcHR1cmVkXG5cdFx0dXBkYXRlXG5cdFx0bW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2V1cCBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkbGVcblx0XHR1cGRhdGVcblxuXHRkZWYgYmVnYW5cblx0XHRAdGltZXN0YW1wID0gRGF0ZS5ub3dcblx0XHRAbWF4ZHIgPSBAZHIgPSAwXG5cdFx0QHgwID0gQHhcblx0XHRAeTAgPSBAeVxuXG5cdFx0dmFyIGRvbSA9IGV2ZW50OnRhcmdldFxuXHRcdHZhciBub2RlID0gbnVsbFxuXG5cdFx0QHNvdXJjZVRhcmdldCA9IGRvbSBhbmQgdGFnKGRvbSlcblxuXHRcdHdoaWxlIGRvbVxuXHRcdFx0bm9kZSA9IHRhZyhkb20pXG5cdFx0XHRpZiBub2RlICYmIG5vZGU6b250b3VjaHN0YXJ0XG5cdFx0XHRcdEBidWJibGUgPSBub1xuXHRcdFx0XHR0YXJnZXQgPSBub2RlXG5cdFx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZilcblx0XHRcdFx0YnJlYWsgdW5sZXNzIEBidWJibGVcblx0XHRcdGRvbSA9IGRvbTpwYXJlbnROb2RlXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHR2YXIgZHIgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcblx0XHRAbWF4ZHIgPSBkciBpZiBkciA+IEBkclxuXHRcdEBkciA9IGRyXG5cblx0XHQjIGNhdGNoaW5nIGEgdG91Y2gtcmVkaXJlY3Q/IT9cblx0XHRpZiBAcmVkaXJlY3Rcblx0XHRcdGlmIEB0YXJnZXQgYW5kIEB0YXJnZXQ6b250b3VjaGNhbmNlbFxuXHRcdFx0XHRAdGFyZ2V0Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRcdHRhcmdldCA9IEByZWRpcmVjdFxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKSBpZiB0YXJnZXQ6b250b3VjaHN0YXJ0XG5cdFx0XHRyZXR1cm4gdXBkYXRlIGlmIEByZWRpcmVjdCAjIHBvc3NpYmx5IHJlZGlyZWN0aW5nIGFnYWluXG5cblxuXHRcdEB1cGRhdGVzKytcblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaHVwZGF0ZShzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaHVwZGF0ZShzZWxmKVxuXHRcdHVwZGF0ZSBpZiBAcmVkaXJlY3Rcblx0XHRzZWxmXG5cblx0ZGVmIG1vdmVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KSBpZiBnOm9udG91Y2htb3ZlXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KVxuXHRcdHNlbGZcblxuXHRkZWYgZW5kZWRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBjbGVhbnVwX1xuXHRcdGlmIEBtb3VzZW1vdmVcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0XG5cdFx0aWYgQHNlbGJsb2NrZXJcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRcdEBzZWxibG9ja2VyID0gbnVsbFxuXHRcdFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIGFic29sdXRlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgZnJvbSBzdGFydGluZyBwb3NpdGlvbiBcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGRyIGRvIEBkclxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBob3Jpem9udGFsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR4IGRvIEB4IC0gQHgwXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIHZlcnRpY2FsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR5IGRvIEB5IC0gQHkwXG5cblx0IyMjXG5cdEluaXRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeDAgZG8gQHgwXG5cblx0IyMjXG5cdEluaXRpYWwgdmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkwIGRvIEB5MFxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4IGRvIEB4XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5IGRvIEB5XG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eCBkb1xuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB4IC0gQHRhcmdldEJveDpsZWZ0XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHlcblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeSAtIEB0YXJnZXRCb3g6dG9wXG5cblx0IyMjXG5cdEJ1dHRvbiBwcmVzc2VkIGluIHRoaXMgdG91Y2guIE5hdGl2ZSB0b3VjaGVzIGRlZmF1bHRzIHRvIGxlZnQtY2xpY2sgKDApXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBidXR0b24gZG8gQGJ1dHRvbiAjIEBwb2ludGVyID8gQHBvaW50ZXIuYnV0dG9uIDogMFxuXG5cdGRlZiBzb3VyY2VUYXJnZXRcblx0XHRAc291cmNlVGFyZ2V0XG5cblx0ZGVmIGVsYXBzZWRcblx0XHREYXRlLm5vdyAtIEB0aW1lc3RhbXBcblxuXG5jbGFzcyBJbWJhLlRvdWNoR2VzdHVyZVxuXG5cdHByb3AgYWN0aXZlIGRlZmF1bHQ6IG5vXG5cblx0ZGVmIG9udG91Y2hzdGFydCBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNodXBkYXRlIGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2hlbmQgZVxuXHRcdHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnZhciBrZXlDb2RlcyA9IHtcblx0ZXNjOiAyNyxcblx0dGFiOiA5LFxuXHRlbnRlcjogMTMsXG5cdHNwYWNlOiAzMixcblx0dXA6IDM4LFxuXHRkb3duOiA0MFxufVxuXG52YXIgZWwgPSBJbWJhLlRhZzpwcm90b3R5cGVcbmRlZiBlbC5zdG9wTW9kaWZpZXIgZSBkbyBlLnN0b3AgfHwgdHJ1ZVxuZGVmIGVsLnByZXZlbnRNb2RpZmllciBlIGRvIGUucHJldmVudCB8fCB0cnVlXG5kZWYgZWwuc2lsZW5jZU1vZGlmaWVyIGUgZG8gZS5zaWxlbmNlIHx8IHRydWVcbmRlZiBlbC5idWJibGVNb2RpZmllciBlIGRvIGUuYnViYmxlKHllcykgfHwgdHJ1ZVxuZGVmIGVsLmN0cmxNb2RpZmllciBlIGRvIGUuZXZlbnQ6Y3RybEtleSA9PSB0cnVlXG5kZWYgZWwuYWx0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OmFsdEtleSA9PSB0cnVlXG5kZWYgZWwuc2hpZnRNb2RpZmllciBlIGRvIGUuZXZlbnQ6c2hpZnRLZXkgPT0gdHJ1ZVxuZGVmIGVsLm1ldGFNb2RpZmllciBlIGRvIGUuZXZlbnQ6bWV0YUtleSA9PSB0cnVlXG5kZWYgZWwua2V5TW9kaWZpZXIga2V5LCBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0ga2V5KSA6IHRydWVcbmRlZiBlbC5kZWxNb2RpZmllciBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0gOCBvciBlLmtleUNvZGUgPT0gNDYpIDogdHJ1ZVxuZGVmIGVsLnNlbGZNb2RpZmllciBlIGRvIGUuZXZlbnQ6dGFyZ2V0ID09IEBkb21cbmRlZiBlbC5sZWZ0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDApIDogZWwua2V5TW9kaWZpZXIoMzcsZSlcbmRlZiBlbC5yaWdodE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAyKSA6IGVsLmtleU1vZGlmaWVyKDM5LGUpXG5kZWYgZWwubWlkZGxlTW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDEpIDogdHJ1ZVxuXHRcbmRlZiBlbC5nZXRIYW5kbGVyIHN0ciwgZXZlbnRcblx0cmV0dXJuIHNlbGYgaWYgc2VsZltzdHJdXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgcHJlZml4XG5cdFxuXHRwcm9wIHNvdXJjZVxuXG5cdHByb3AgZGF0YVxuXG5cdHByb3AgcmVzcG9uZGVyXG5cblx0ZGVmIHNlbGYud3JhcCBlXG5cdFx0c2VsZi5uZXcoZSlcblx0XG5cdGRlZiBpbml0aWFsaXplIGVcblx0XHRldmVudCA9IGVcblx0XHRAYnViYmxlID0geWVzXG5cblx0ZGVmIHR5cGU9IHR5cGVcblx0XHRAdHlwZSA9IHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdEByZXR1cm4ge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IChjYXNlLWluc2Vuc2l0aXZlKVxuXHQjIyNcblx0ZGVmIHR5cGVcblx0XHRAdHlwZSB8fCBldmVudDp0eXBlXG5cdFxuXHRkZWYgYnV0dG9uIGRvIGV2ZW50OmJ1dHRvblxuXHRkZWYga2V5Q29kZSBkbyBldmVudDprZXlDb2RlXG5cblx0ZGVmIG5hbWVcblx0XHRAbmFtZSB8fD0gdHlwZS50b0xvd2VyQ2FzZS5yZXBsYWNlKC9cXDovZywnJylcblxuXHQjIG1pbWMgZ2V0c2V0XG5cdGRlZiBidWJibGUgdlxuXHRcdGlmIHYgIT0gdW5kZWZpbmVkXG5cdFx0XHRzZWxmLmJ1YmJsZSA9IHZcblx0XHRcdHJldHVybiBzZWxmXG5cdFx0cmV0dXJuIEBidWJibGVcblxuXHRkZWYgYnViYmxlPSB2XG5cdFx0QGJ1YmJsZSA9IHZcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRQcmV2ZW50cyBmdXJ0aGVyIHByb3BhZ2F0aW9uIG9mIHRoZSBjdXJyZW50IGV2ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHN0b3Bcblx0XHRidWJibGUgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgc3RvcFByb3BhZ2F0aW9uIGRvIHN0b3Bcblx0ZGVmIGhhbHQgZG8gc3RvcFxuXG5cdCMgbWlncmF0ZSBmcm9tIGNhbmNlbCB0byBwcmV2ZW50XG5cdGRlZiBwcmV2ZW50XG5cdFx0aWYgZXZlbnQ6cHJldmVudERlZmF1bHRcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0XG5cdFx0ZWxzZVxuXHRcdFx0ZXZlbnQ6ZGVmYXVsdFByZXZlbnRlZCA9IHllc1xuXHRcdHNlbGY6ZGVmYXVsdFByZXZlbnRlZCA9IHllc1xuXHRcdHNlbGZcblxuXHRkZWYgcHJldmVudERlZmF1bHRcblx0XHRjb25zb2xlLndhcm4gXCJFdmVudCNwcmV2ZW50RGVmYXVsdCBpcyBkZXByZWNhdGVkIC0gdXNlIEV2ZW50I3ByZXZlbnRcIlxuXHRcdHByZXZlbnRcblxuXHQjIyNcblx0SW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGV2ZW50LmNhbmNlbCBoYXMgYmVlbiBjYWxsZWQuXG5cblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBpc1ByZXZlbnRlZFxuXHRcdGV2ZW50IGFuZCBldmVudDpkZWZhdWx0UHJldmVudGVkIG9yIEBjYW5jZWxcblxuXHQjIyNcblx0Q2FuY2VsIHRoZSBldmVudCAoaWYgY2FuY2VsYWJsZSkuIEluIHRoZSBjYXNlIG9mIG5hdGl2ZSBldmVudHMgaXRcblx0d2lsbCBjYWxsIGBwcmV2ZW50RGVmYXVsdGAgb24gdGhlIHdyYXBwZWQgZXZlbnQgb2JqZWN0LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNhbmNlbFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I2NhbmNlbCBpcyBkZXByZWNhdGVkIC0gdXNlIEV2ZW50I3ByZXZlbnRcIlxuXHRcdHByZXZlbnRcblxuXHRkZWYgc2lsZW5jZVxuXHRcdEBzaWxlbmNlZCA9IHllc1xuXHRcdHNlbGZcblxuXHRkZWYgaXNTaWxlbmNlZFxuXHRcdCEhQHNpbGVuY2VkXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBpbml0aWFsIHRhcmdldCBvZiB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgdGFyZ2V0XG5cdFx0dGFnKGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0KVxuXG5cdCMjI1xuXHRBIHJlZmVyZW5jZSB0byB0aGUgb2JqZWN0IHJlc3BvbmRpbmcgdG8gdGhlIGV2ZW50LlxuXHQjIyNcblx0ZGVmIHJlc3BvbmRlclxuXHRcdEByZXNwb25kZXJcblxuXHQjIyNcblx0UmVkaXJlY3QgdGhlIGV2ZW50IHRvIG5ldyB0YXJnZXRcblx0IyMjXG5cdGRlZiByZWRpcmVjdCBub2RlXG5cdFx0QHJlZGlyZWN0ID0gbm9kZVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHByb2Nlc3NIYW5kbGVycyBub2RlLCBoYW5kbGVyc1xuXHRcdGxldCBpID0gMVxuXHRcdGxldCBsID0gaGFuZGxlcnM6bGVuZ3RoXG5cdFx0bGV0IGJ1YmJsZSA9IEBidWJibGVcblx0XHRsZXQgc3RhdGUgPSBoYW5kbGVyczpzdGF0ZSB8fD0ge31cblx0XHRsZXQgcmVzdWx0IFxuXHRcdFxuXHRcdGlmIGJ1YmJsZVxuXHRcdFx0QGJ1YmJsZSA9IDFcblxuXHRcdHdoaWxlIGkgPCBsXG5cdFx0XHRsZXQgaXNNb2QgPSBmYWxzZVxuXHRcdFx0bGV0IGhhbmRsZXIgPSBoYW5kbGVyc1tpKytdXG5cdFx0XHRsZXQgcGFyYW1zICA9IG51bGxcblx0XHRcdGxldCBjb250ZXh0ID0gbm9kZVxuXHRcdFx0XG5cdFx0XHRpZiBoYW5kbGVyIGlzYSBBcnJheVxuXHRcdFx0XHRwYXJhbXMgPSBoYW5kbGVyLnNsaWNlKDEpXG5cdFx0XHRcdGhhbmRsZXIgPSBoYW5kbGVyWzBdXG5cdFx0XHRcblx0XHRcdGlmIHR5cGVvZiBoYW5kbGVyID09ICdzdHJpbmcnXG5cdFx0XHRcdGlmIGtleUNvZGVzW2hhbmRsZXJdXG5cdFx0XHRcdFx0cGFyYW1zID0gW2tleUNvZGVzW2hhbmRsZXJdXVxuXHRcdFx0XHRcdGhhbmRsZXIgPSAna2V5J1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRsZXQgbW9kID0gaGFuZGxlciArICdNb2RpZmllcidcblxuXHRcdFx0XHRpZiBub2RlW21vZF1cblx0XHRcdFx0XHRpc01vZCA9IHllc1xuXHRcdFx0XHRcdHBhcmFtcyA9IChwYXJhbXMgb3IgW10pLmNvbmNhdChbc2VsZixzdGF0ZV0pXG5cdFx0XHRcdFx0aGFuZGxlciA9IG5vZGVbbW9kXVxuXHRcdFx0XG5cdFx0XHQjIGlmIGl0IGlzIHN0aWxsIGEgc3RyaW5nIC0gY2FsbCBnZXRIYW5kbGVyIG9uXG5cdFx0XHQjIGFuY2VzdG9yIG9mIG5vZGUgdG8gc2VlIGlmIHdlIGdldCBhIGhhbmRsZXIgZm9yIHRoaXMgbmFtZVxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0bGV0IGVsID0gbm9kZVxuXHRcdFx0XHRsZXQgZm4gPSBudWxsXG5cdFx0XHRcdGxldCBjdHggPSBzdGF0ZTpjb250ZXh0XG5cdFxuXHRcdFx0XHRpZiBjdHhcblx0XHRcdFx0XHRpZiBjdHg6Z2V0SGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRcdGN0eCA9IGN0eC5nZXRIYW5kbGVyKGhhbmRsZXIsc2VsZilcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiBjdHhbaGFuZGxlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRoYW5kbGVyID0gZm4gPSBjdHhbaGFuZGxlcl1cblx0XHRcdFx0XHRcdGNvbnRleHQgPSBjdHhcblxuXHRcdFx0XHR1bmxlc3MgZm5cblx0XHRcdFx0XHRjb25zb2xlLndhcm4gXCJldmVudCB7dHlwZX06IGNvdWxkIG5vdCBmaW5kICd7aGFuZGxlcn0nIGluIGNvbnRleHRcIixjdHhcblxuXHRcdFx0XHQjIHdoaWxlIGVsIGFuZCAoIWZuIG9yICEoZm4gaXNhIEZ1bmN0aW9uKSlcblx0XHRcdFx0IyBcdGlmIGZuID0gZWwuZ2V0SGFuZGxlcihoYW5kbGVyKVxuXHRcdFx0XHQjIFx0XHRpZiBmbltoYW5kbGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyBcdFx0XHRoYW5kbGVyID0gZm5baGFuZGxlcl1cblx0XHRcdFx0IyBcdFx0XHRjb250ZXh0ID0gZm5cblx0XHRcdFx0IyBcdFx0ZWxpZiBmbiBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyBcdFx0XHRoYW5kbGVyID0gZm5cblx0XHRcdFx0IyBcdFx0XHRjb250ZXh0ID0gZWxcblx0XHRcdFx0IyBcdGVsc2Vcblx0XHRcdFx0IyBcdFx0ZWwgPSBlbC5wYXJlbnRcblx0XHRcdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgd2hhdCBpZiB3ZSBhY3R1YWxseSBjYWxsIHN0b3AgaW5zaWRlIGZ1bmN0aW9uP1xuXHRcdFx0XHQjIGRvIHdlIHN0aWxsIHdhbnQgdG8gY29udGludWUgdGhlIGNoYWluP1xuXHRcdFx0XHRsZXQgcmVzID0gaGFuZGxlci5hcHBseShjb250ZXh0LHBhcmFtcyBvciBbc2VsZl0pXG5cblx0XHRcdFx0aWYgIWlzTW9kXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXG5cdFx0XHRcdGlmIHJlcyA9PSBmYWxzZVxuXHRcdFx0XHRcdCMgY29uc29sZS5sb2cgXCJyZXR1cm5lZCBmYWxzZSAtIGJyZWFraW5nXCJcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGlmIHJlcyBhbmQgIUBzaWxlbmNlZCBhbmQgcmVzOnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0cmVzLnRoZW4oSW1iYTpjb21taXQpXG5cdFx0XG5cdFx0IyBpZiB3ZSBoYXZlbnQgc3RvcHBlZCBvciBkZWFsdCB3aXRoIGJ1YmJsZSB3aGlsZSBoYW5kbGluZ1xuXHRcdGlmIEBidWJibGUgPT09IDFcblx0XHRcdEBidWJibGUgPSBidWJibGVcblxuXHRcdHJldHVybiBudWxsXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbmFtZSA9IHNlbGYubmFtZVxuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXHRcdHZhciByZXN1bHRcblx0XHR2YXIgaGFuZGxlcnNcblxuXHRcdHdoaWxlIGRvbW5vZGVcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdGxldCBub2RlID0gZG9tbm9kZS5AZG9tID8gZG9tbm9kZSA6IGRvbW5vZGUuQHRhZ1xuXG5cdFx0XHRpZiBub2RlXG5cdFx0XHRcdGlmIGhhbmRsZXJzID0gbm9kZTpfb25fXG5cdFx0XHRcdFx0Zm9yIGhhbmRsZXIgaW4gaGFuZGxlcnMgd2hlbiBoYW5kbGVyXG5cdFx0XHRcdFx0XHRsZXQgaG5hbWUgPSBoYW5kbGVyWzBdXG5cdFx0XHRcdFx0XHRpZiBuYW1lID09IGhhbmRsZXJbMF0gYW5kIGJ1YmJsZVxuXHRcdFx0XHRcdFx0XHRwcm9jZXNzSGFuZGxlcnMobm9kZSxoYW5kbGVyKVxuXHRcdFx0XHRcdGJyZWFrIHVubGVzcyBidWJibGVcblxuXHRcdFx0XHRpZiBidWJibGUgYW5kIG5vZGVbbWV0aF0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXHRcdFx0XHRcdEBzaWxlbmNlZCA9IG5vXG5cdFx0XHRcdFx0cmVzdWx0ID0gYXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXG5cdFx0XHRcdGlmIG5vZGU6b25ldmVudFxuXHRcdFx0XHRcdG5vZGUub25ldmVudChzZWxmKVxuXG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblxuXHRcdCMgaWYgYSBoYW5kbGVyIHJldHVybnMgYSBwcm9taXNlLCBub3RpZnkgc2NoZWR1bGVyc1xuXHRcdCMgYWJvdXQgdGhpcyBhZnRlciBwcm9taXNlIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nXG5cdFx0aWYgcmVzdWx0IGFuZCByZXN1bHQ6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdHJlc3VsdC50aGVuKHNlbGY6cHJvY2Vzc2VkLmJpbmQoc2VsZikpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRpZiAhQHNpbGVuY2VkIGFuZCBAcmVzcG9uZGVyXG5cdFx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSlcblx0XHRcdEltYmEuY29tbWl0KGV2ZW50KVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdFx0XG5cdFx0aWYgQGNhY2hlOmd1aWRlXG5cdFx0XHRAZ3VpZGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjYWNoZTpndWlkZSkpXG5cdFx0XHQjIGZvciBpdGVtLGkgaW4gQGd1aWRlXG5cdFx0XHQjIFx0QGd1aWRlW2l0ZW06aWRdID0gaXRlbVxuXHRcdFx0IyBcdGl0ZW06bmV4dCA9IEBndWlkZVtpICsgMV1cblx0XHRcdCMgXHRpdGVtOnByZXYgPSBAZ3VpZGVbaSAtIDFdXG5cdFx0c2VsZlxuXG5cdGRlZiByZXNldFxuXHRcdGNhY2hlID0ge31cblx0XHRzZWxmXG5cblx0ZGVmIHJvdXRlclxuXHRcdEByb3V0ZXIgfHw9IFJvdXRlci5uZXcoc2VsZilcblxuXHRkZWYgcGF0aFxuXHRcdCR3ZWIkID8gQGxvYzpwYXRobmFtZSA6IHJlcTpwYXRoXG5cblx0ZGVmIGhhc2hcblx0XHQkd2ViJCA/IEBsb2M6aGFzaC5zdWJzdHIoMSkgOiAnJ1xuXG5cdGRlZiBkb2Mgc3JjXG5cdFx0QGRvY3Nbc3JjXSB8fD0gRG9jLm5ldyhzcmMsc2VsZilcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0QGd1aWRlIHx8PSBAY2FjaGU6Z3VpZGUgIyAubWFwIGRvIHx8XG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cdFx0Y29uc29sZS5sb2cgXCJubyBsb25nZXI/XCJcblxuXHRcdGlmICRub2RlJFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGlmICFyZXNcblx0XHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblx0XHRcdFxuXHRcdFx0ZGVwc1tzcmNdIHx8PSByZXNcblx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0ZWxzZVxuXHRcdFx0IyBzaG91bGQgZ3VhcmQgYWdhaW5zdCBtdWx0aXBsZSBsb2Fkc1xuXHRcdFx0aWYgcmVzXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHRcdHJldHVybiB7dGhlbjogKGRvIHx2fCB2KHJlcykpfSAjIGZha2UgcHJvbWlzZSBoYWNrXG5cblx0XHRcdHZhciB4aHIgPSBYTUxIdHRwUmVxdWVzdC5uZXdcblx0XHRcdHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJyBkbyB8cmVzfFxuXHRcdFx0XHRyZXMgPSBkZXBzW3NyY10gPSBKU09OLnBhcnNlKHhocjpyZXNwb25zZVRleHQpXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHR4aHIub3BlbihcIkdFVFwiLCBzcmMpXG5cdFx0XHR4aHIuc2VuZFxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgaXNzdWVzXG5cdFx0QGlzc3VlcyB8fD0gRG9jLmdldCgnL2lzc3Vlcy9hbGwnLCdqc29uJylcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC5pbWJhIiwiZXh0ZXJuIGhpc3RvcnksIGdhXG5cbmV4cG9ydCBjbGFzcyBSb3V0ZXJcblxuXHRwcm9wIHBhdGhcblxuXHRkZWYgc2VsZi5zbHVnIHN0clxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykudG9Mb3dlckNhc2UgIyB0cmltXG5cblx0XHR2YXIgZnJvbSA9IFwiw6DDocOkw6LDpcOow6nDq8Oqw6zDrcOvw67DssOzw7bDtMO5w7rDvMO7w7HDp8K3L18sOjtcIlxuXHRcdHZhciB0byAgID0gXCJhYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAjIHJlbW92ZSBpbnZhbGlkIGNoYXJzXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xccysvZywgJy0nKSAjIGNvbGxhcHNlIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgYnkgLVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8tKy9nLCAnLScpICMgY29sbGFwc2UgZGFzaGVzXG5cblx0XHRyZXR1cm4gc3RyXG5cblx0ZGVmIGluaXRpYWxpemUgYXBwXG5cdFx0QGFwcCA9IGFwcFxuXG5cdFx0aWYgJHdlYiRcblx0XHRcdHdpbmRvdzpvbnBvcHN0YXRlID0gZG8gfGV8XG5cdFx0XHRcdHJlZnJlc2hcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVmcmVzaFxuXHRcdGlmICR3ZWIkXG5cdFx0XHRkb2N1bWVudDpib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3V0ZScsc2VnbWVudCgwKSlcblx0XHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiBwYXRoXG5cdFx0QGFwcC5wYXRoXG5cblx0ZGVmIGhhc2hcblx0XHRAYXBwLmhhc2hcblxuXHRkZWYgZXh0XG5cdFx0dmFyIHBhdGggPSBwYXRoXG5cdFx0dmFyIG0gPSBwYXRoLm1hdGNoKC9cXC4oW15cXC9dKykkLylcblx0XHRtIGFuZCBtWzFdIG9yICcnXG5cblx0ZGVmIHNlZ21lbnQgbnIgPSAwXG5cdFx0cGF0aC5zcGxpdCgnLycpW25yICsgMV0gb3IgJydcblxuXHRkZWYgZ28gaHJlZiwgc3RhdGUgPSB7fSwgcmVwbGFjZSA9IG5vXG5cdFx0aWYgaHJlZiA9PSAnL2luc3RhbGwnXG5cdFx0XHQjIHJlZGlyZWN0cyBoZXJlXG5cdFx0XHRocmVmID0gJy9ndWlkZXMjdG9jLWluc3RhbGxhdGlvbidcblx0XHRcdFxuXHRcdGlmIHJlcGxhY2Vcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRlbHNlXG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0XHQjIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgaHJlZilcblxuXHRcdGlmICFocmVmLm1hdGNoKC9cXCMvKVxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsMClcblx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzY29wZWQgcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHR2YXIgbnh0ID0gcGF0aFtyZWc6bGVuZ3RoXVxuXHRcdFx0cGF0aC5zdWJzdHIoMCxyZWc6bGVuZ3RoKSA9PSByZWcgYW5kICghbnh0IG9yIG54dCA9PSAnLScgb3Igbnh0ID09ICcvJyBvciBueHQgPT0gJyMnIG9yIG54dCA9PSAnPycgb3Igbnh0ID09ICdfJylcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5cdGRlZiBtYXRjaCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0cGF0aCA9PSByZWdcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0YXR0ciByb3V0ZVxuXG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cblx0ZGVmIHJlcm91dGVcblx0XHR2YXIgc2NvcGVkID0gcm91dGVyLnNjb3BlZChyb3V0ZSxzZWxmKVxuXHRcdGZsYWcoJ3Njb3BlZCcsc2NvcGVkKVxuXHRcdGZsYWcoJ3NlbGVjdGVkJyxyb3V0ZXIubWF0Y2gocm91dGUsc2VsZikpXG5cdFx0aWYgc2NvcGVkICE9IEBzY29wZWRcblx0XHRcdEBzY29wZWQgPSBzY29wZWRcblx0XHRcdHNjb3BlZCA/IGRpZHNjb3BlIDogZGlkdW5zY29wZVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGRpZHNjb3BlXG5cdFx0c2VsZlxuXG5cdGRlZiBkaWR1bnNjb3BlXG5cdFx0c2VsZlxuXG4jIGV4dGVuZCBsaW5rc1xuZXh0ZW5kIHRhZyBhXG5cdFxuXHRkZWYgcm91dGVcblx0XHRAcm91dGUgb3IgaHJlZlxuXG5cdGRlZiBvbnRhcCBlXG5cdFx0dmFyIGhyZWYgPSBocmVmLnJlcGxhY2UoL15odHRwXFw6XFwvXFwvaW1iYVxcLmlvLywnJylcblxuXHRcdGlmIGUuZXZlbnQ6bWV0YUtleSBvciBlLmV2ZW50OmFsdEtleVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFxuXG5cdFx0aWYgbGV0IG0gPSBocmVmLm1hdGNoKC9naXN0XFwuZ2l0aHViXFwuY29tXFwvKFteXFwvXSspXFwvKFtBLVphLXpcXGRdKykvKVxuXHRcdFx0Y29uc29sZS5sb2cgJ2dpc3QhIScsbVsxXSxtWzJdXG5cdFx0XHQjZ2lzdC5vcGVuKG1bMl0pXG5cdFx0XHRyZXR1cm4gZS5wcmV2ZW50LnN0b3BcblxuXHRcdGlmIGhyZWZbMF0gPT0gJyMnIG9yIGhyZWZbMF0gPT0gJy8nXG5cdFx0XHRlLnByZXZlbnQuc3RvcFxuXHRcdFx0cm91dGVyLmdvKGhyZWYse30pXG5cdFx0XHRJbWJhLkV2ZW50cy50cmlnZ2VyKCdyb3V0ZScsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmVyb3V0ZSBpZiAkd2ViJFxuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcbmltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8TG9nbz5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudGFiLmhvbWUgaHJlZj0nL2hvbWUnPiA8aT4gJ2hvbWUnXG5cdFx0XHRcdFx0PGEudGFiLmd1aWRlcyBocmVmPScvZ3VpZGUnPiA8aT4gJ2xlYXJuJ1xuXHRcdFx0XHRcdDxhLnRhYi5kb2NzIGhyZWY9Jy9kb2NzJz4gPGk+ICdhcGknXG5cdFx0XHRcdFx0PGEudGFiLmRvY3MgaHJlZj0nL2V4YW1wbGVzJz4gPGk+ICdleGFtcGxlcydcblx0XHRcdFx0XHQjIDxhLnR3aXR0ZXIgaHJlZj0naHR0cDovL3R3aXR0ZXIuY29tL2ltYmFqcyc+IDxpPiAndHdpdHRlcidcblx0XHRcdFx0XHQ8YS5naXRodWIgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+IDxpPiAnZ2l0aHViJ1xuXHRcdFx0XHRcdCMgPGEuaXNzdWVzIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gPGk+ICdpc3N1ZXMnXG5cdFx0XHRcdFx0PGEubWVudSA6dGFwPSd0b2dnbGVNZW51Jz4gPGI+XG5cdFx0XHRcblx0XHRcdDxtYWluPlxuXHRcdFx0XHRpZiByb3V0ZXIuc2NvcGVkKCcvaG9tZScpXG5cdFx0XHRcdFx0PEhvbWVQYWdlPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9ndWlkZScpXG5cdFx0XHRcdFx0PEd1aWRlc1BhZ2VbYXBwLmd1aWRlXT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZG9jcycpXG5cdFx0XHRcdFx0PERvY3NQYWdlPlxuXG5cdFx0XHQ8Zm9vdGVyI2Zvb3Rlcj4gXG5cdFx0XHRcdDxocj5cblx0XHRcdFx0PC5sZnQ+IFwiSW1iYSDCqSAyMDE1LTIwMThcIlxuXHRcdFx0XHQ8LnJndD5cblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gJ1R3aXR0ZXInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gJ0dpdEh1Yidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gJ0lzc3Vlcydcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+ICdDaGF0J1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuaW1wb3J0IEV4YW1wbGUgZnJvbSAnLi9TbmlwcGV0J1xuaW1wb3J0IE1hcmtlZCBmcm9tICcuL01hcmtlZCdcbmltcG9ydCBQYXR0ZXJuIGZyb20gJy4vUGF0dGVybidcbmltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuXG5leHBvcnQgdGFnIEhvbWVQYWdlIDwgUGFnZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gPC5ib2R5PlxuXHRcdFx0PGRpdiNoZXJvLmRhcms+XG5cdFx0XHRcdDxQYXR0ZXJuQHBhdHRlcm4+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHQ8TWFya2VkW2FwcC5ndWlkZVsnaGVybyddXT5cblx0XHRcdFx0XHQ8bmF2LmJ1dHRvbnM+XG5cdFx0XHRcdFx0XHQjIDxhLmJ1dHRvbi50cnkgaHJlZj0nIyc+IFwiVHJ5IG9ubGluZVwiXG5cdFx0XHRcdFx0XHQ8YS5idXR0b24uc3RhcnQgaHJlZj0nL2d1aWRlJz4gXCJHZXQgc3RhcnRlZFwiXG5cdFx0XHRcdFx0XHQ8YS5idXR0b24uc3RhcnQgaHJlZj0nL2V4YW1wbGVzJz4gXCJFeGFtcGxlc1wiXG5cdFx0XHRcdFx0XHQ8YS5idXR0b24uZ2l0aHViIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiBcIkdpdGh1YlwiXG5cblx0XHRcdFx0IyA8aGVyb3NuaXBwZXQuaGVyby5kYXJrIHNyYz0nL2hvbWUvZXhhbXBsZXMvaGVyby5pbWJhJz5cblx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kLndlbGNvbWUuaHVnZS5saWdodD4gXCJcIlwiXG5cdFx0XHRcdFx0IyBDcmVhdGUgY29tcGxleCB3ZWIgYXBwcyB3aXRoIGVhc2UhXG5cblx0XHRcdFx0XHRJbWJhIGlzIGEgbmV3IHByb2dyYW1taW5nIGxhbmd1YWdlIGZvciB0aGUgd2ViIHRoYXQgY29tcGlsZXMgdG8gaGlnaGx5IFxuXHRcdFx0XHRcdHBlcmZvcm1hbnQgYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIEl0IGhhcyBsYW5ndWFnZSBsZXZlbCBzdXBwb3J0IGZvciBkZWZpbmluZywgXG5cdFx0XHRcdFx0ZXh0ZW5kaW5nLCBzdWJjbGFzc2luZywgaW5zdGFudGlhdGluZyBhbmQgcmVuZGVyaW5nIGRvbSBub2Rlcy4gRm9yIGEgc2ltcGxlIFxuXHRcdFx0XHRcdGFwcGxpY2F0aW9uIGxpa2UgVG9kb01WQywgaXQgaXMgbW9yZSB0aGFuIFxuXHRcdFx0XHRcdFsxMCB0aW1lcyBmYXN0ZXIgdGhhbiBSZWFjdF0oaHR0cDovL3NvbWViZWUuZ2l0aHViLmlvL3RvZG9tdmMtcmVuZGVyLWJlbmNobWFyay9pbmRleC5odG1sKSBcblx0XHRcdFx0XHR3aXRoIGxlc3MgY29kZSwgYW5kIGEgbXVjaCBzbWFsbGVyIGxpYnJhcnkuXG5cblx0XHRcdFx0XHQtLS1cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnNwaXJhdGlvblxuXHRcdFx0XHRcdCAgSW1iYSBicmluZ3MgdGhlIGJlc3QgZnJvbSBSdWJ5LCBQeXRob24sIGFuZCBSZWFjdCAoKyBKU1gpIHRvZ2V0aGVyIGluIGEgY2xlYW4gbGFuZ3VhZ2UgYW5kIHJ1bnRpbWUuXG5cblx0XHRcdFx0XHQtICMjIEltYmEuaW50ZXJvcGVyYWJpbGl0eVxuXHRcdFx0XHRcdCAgSW1iYSBjb21waWxlcyBkb3duIHRvIGNsZWFuIGFuZCByZWFkYWJsZSBKYXZhU2NyaXB0LiBVc2UgYW55IEpTIGxpYnJhcnkgaW4gSW1iYSBhbmQgdmljYS12ZXJzYS5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQtICMjIEltYmEucGVyZm9ybWFuY2Vcblx0XHRcdFx0XHQgIEJ1aWxkIHlvdXIgYXBwbGljYXRpb24gdmlld3MgdXNpbmcgSW1iYSdzIG5hdGl2ZSB0YWdzIGZvciB1bnByZWNlZGVudGVkIHBlcmZvcm1hbmNlLlxuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJTaW1wbGUgcmVtaW5kZXJzXCIgc3JjPScvaG9tZS9leGFtcGxlcy9yZW1pbmRlcnMuaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBSZXVzYWJsZSBjb21wb25lbnRzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0QSBjdXN0b20gdGFnIC8gY29tcG9uZW50IGNhbiBtYWludGFpbiBpbnRlcm5hbCBzdGF0ZSBhbmQgY29udHJvbCBob3cgdG8gcmVuZGVyIGl0c2VsZi5cblx0XHRcdFx0XHRXaXRoIHRoZSBwZXJmb3JtYW5jZSBvZiBET00gcmVjb25jaWxpYXRpb24gaW4gSW1iYSwgeW91IGNhbiB1c2Ugb25lLXdheSBkZWNsYXJhdGl2ZSBiaW5kaW5ncyxcblx0XHRcdFx0XHRldmVuIGZvciBhbmltYXRpb25zLiBXcml0ZSBhbGwgeW91ciB2aWV3cyBpbiBhIHN0cmFpZ2h0LWZvcndhcmQgbGluZWFyIGZhc2hpb24gYXMgaWYgeW91IGNvdWxkXG5cdFx0XHRcdFx0cmVyZW5kZXIgeW91ciB3aG9sZSBhcHBsaWNhdGlvbiBvbiAqKmV2ZXJ5IHNpbmdsZSoqIGRhdGEvc3RhdGUgY2hhbmdlLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiV29ybGQgY2xvY2tcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2Nsb2NrLmltYmEnPlxuXG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZD4gXCJcIlwiXG5cdFx0XHRcdFx0IyMgRXh0ZW5kIG5hdGl2ZSB0YWdzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0SW4gYWRkaXRpb24gdG8gZGVmaW5pbmcgY3VzdG9tIHRhZ3MsIHlvdSBjYW4gYWxzbyBleHRlbmQgbmF0aXZlIHRhZ3MsIG9yIGluaGVyaXQgZnJvbSB0aGVtLlxuXHRcdFx0XHRcdEJpbmRpbmcgdG8gZG9tIGV2ZW50cyBpcyBhcyBzaW1wbGUgYXMgZGVmaW5pbmcgbWV0aG9kcyBvbiB5b3VyIHRhZ3M7IGFsbCBldmVudHMgd2lsbCBiZVxuXHRcdFx0XHRcdGVmZmljaWVudGx5IGRlbGVnYXRlZCBhbmQgaGFuZGxlZCBieSBJbWJhLiBMZXQncyBkZWZpbmUgYSBzaW1wbGUgc2tldGNocGFkLi4uXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJDdXN0b20gY2FudmFzXCIgc3JjPScvaG9tZS9leGFtcGxlcy9jYW52YXMuaW1iYSc+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0hvbWVQYWdlLmltYmEiLCIjIGRlZmluZSByZW5kZXJlclxudmFyIG1hcmtlZCA9IHJlcXVpcmUgJ21hcmtlZCdcbnZhciBtZHIgPSBtYXJrZWQuUmVuZGVyZXIubmV3XG5cbmRlZiBtZHIuaGVhZGluZyB0ZXh0LCBsdmxcblx0XCI8aHtsdmx9Pnt0ZXh0fTwvaHtsdmx9PlwiXG5cdFxuaW1wb3J0IFNuaXBwZXQgZnJvbSAnLi9TbmlwcGV0J1xuXHRcdFxuZXhwb3J0IHRhZyBNYXJrZWRcblx0ZGVmIHJlbmRlcmVyXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0ZXh0XG5cdFx0XHRAdGV4dCA9IHRleHRcblx0XHRcdGRvbTppbm5lckhUTUwgPSBtYXJrZWQodGV4dCwgcmVuZGVyZXI6IG1kcilcblx0XHRzZWxmXG5cblx0ZGVmIHNldENvbnRlbnQgdmFsLHR5cFxuXHRcdHNldFRleHQodmFsLDApXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHNldERhdGEgZGF0YVxuXHRcdGlmIGRhdGEgYW5kIGRhdGEgIT0gQGRhdGFcblx0XHRcdEBkYXRhID0gZGF0YVxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IGRhdGE6Ym9keVxuXHRcdFx0YXdha2VuU25pcHBldHMgaWYgJHdlYiRcblx0XHRzZWxmXG5cdFx0XHRcblx0ZGVmIGF3YWtlblNuaXBwZXRzXG5cdFx0Zm9yIGl0ZW0gaW4gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbmlwcGV0Jylcblx0XHRcdGxldCBjb2RlID0gaXRlbTp0ZXh0Q29udGVudFxuXHRcdFx0aWYgY29kZS5pbmRleE9mKCdJbWJhLm1vdW50JykgPj0gMFxuXHRcdFx0XHRTbmlwcGV0LnJlcGxhY2UoaXRlbSlcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL01hcmtlZC5pbWJhIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPD5dKyhAfDpcXC8pW14gPD5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXjwnXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspKFtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxcXFxcW1xcW1xcXV18W15cXFtcXF1dfFxcXSg/PVteXFxbXSpcXF0pKSovO1xuaW5saW5lLl9ocmVmID0gL1xccyo8PyhbXFxzXFxTXSo/KT4/KD86XFxzK1snXCJdKFtcXHNcXFNdKj8pWydcIl0pP1xccyovO1xuXG5pbmxpbmUubGluayA9IHJlcGxhY2UoaW5saW5lLmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgnaHJlZicsIGlubGluZS5faHJlZilcbiAgKCk7XG5cbmlubGluZS5yZWZsaW5rID0gcmVwbGFjZShpbmxpbmUucmVmbGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopL1xufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogcmVwbGFjZShpbmxpbmUuZXNjYXBlKSgnXSknLCAnfnxdKScpKCksXG4gIHVybDogL14oaHR0cHM/OlxcL1xcL1teXFxzPF0rW148Liw6O1wiJylcXF1cXHNdKS8sXG4gIGRlbDogL15+fig/PVxcUykoW1xcc1xcU10qP1xcUyl+fi8sXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLnRleHQpXG4gICAgKCddfCcsICd+XXwnKVxuICAgICgnfCcsICd8aHR0cHM/Oi8vfCcpXG4gICAgKClcbn0pO1xuXG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiByZXBsYWNlKGlubGluZS5icikoJ3syLH0nLCAnKicpKCksXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLmdmbS50ZXh0KSgnezIsfScsICcqJykoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICBpZiAoIXRoaXMubGlua3MpIHtcbiAgICB0aHJvdyBuZXdcbiAgICAgIEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbGlua1xuICAgICwgdGV4dFxuICAgICwgaHJlZlxuICAgICwgY2FwO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGNhcFsxXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoXG4gICAgICAgICAgY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKVxuICAgICAgICApO1xuICAgICAgICBocmVmID0gdGhpcy5tYW5nbGUoJ21haWx0bzonKSArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHVybCAoZ2ZtKVxuICAgIGlmICghdGhpcy5pbkxpbmsgJiYgKGNhcCA9IHRoaXMucnVsZXMudXJsLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBocmVmID0gdGV4dDtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLnRyaW0oKSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuXHQvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmICgvXlteOl0rOlxcLypbXi9dKiQvLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlLnJlcGxhY2UoL1teL10qJC8sICcnKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuXG4gIGlmIChocmVmLnNsaWNlKDAsIDIpID09PSAnLy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvOltcXHNcXFNdKi8sICc6JykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oOlxcLypbXi9dKilbXFxzXFxTXSovLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG52YXIgYmFzZVVybHMgPSB7fTtcbnZhciBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMVxuICAgICwgdGFyZ2V0XG4gICAgLCBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayB8fCB0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG5cbiAgICB2YXIgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodFxuICAgICAgLCB0b2tlbnNcbiAgICAgICwgcGVuZGluZ1xuICAgICAgLCBpID0gMDtcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlLFxuICBiYXNlVXJsOiBudWxsXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZGVmIHNodWZmbGUgYXJyYXlcblx0dmFyIGNvdW50ZXIgPSBhcnJheTpsZW5ndGgsIHRlbXAsIGluZGV4XG5cblx0IyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG5cdHdoaWxlIGNvdW50ZXIgPiAwXG5cdFx0IyBQaWNrIGEgcmFuZG9tIGluZGV4XG5cdFx0aW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tICogY291bnRlcilcblx0XHRjb3VudGVyLS0gIyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcblx0XHQjIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuXHRcdHRlbXAgPSBhcnJheVtjb3VudGVyXVxuXHRcdGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdXG5cdFx0YXJyYXlbaW5kZXhdID0gdGVtcFxuXHRcblx0cmV0dXJuIGFycmF5XG5cbmV4cG9ydCB0YWcgUGF0dGVyblxuXG5cdGRlZiBzZXR1cFxuXHRcdHJldHVybiBzZWxmIGlmICRub2RlJFxuXHRcdHZhciBwYXJ0cyA9IHt0YWdzOiBbXSwga2V5d29yZHM6IFtdLCBtZXRob2RzOiBbXX1cblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBsaW5lcyA9IFtdXG5cblx0XHRmb3Igb3duIGssdiBvZiBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHRcdGl0ZW1zLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblx0XHRcdHBhcnRzOm1ldGhvZHMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXG5cdFx0Zm9yIGsgaW4gSW1iYS5IVE1MX1RBR1Mgb3IgSFRNTF9UQUdTXG5cdFx0XHRpdGVtcy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cdFx0XHRwYXJ0czp0YWdzLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblxuXHRcdHZhciB3b3JkcyA9IFwiZGVmIGlmIGVsc2UgZWxpZiB3aGlsZSB1bnRpbCBmb3IgaW4gb2YgdmFyIGxldCBjbGFzcyBleHRlbmQgZXhwb3J0IGltcG9ydCB0YWcgZ2xvYmFsXCJcblxuXHRcdGZvciBrIGluIHdvcmRzLnNwbGl0KFwiIFwiKVxuXHRcdFx0aXRlbXMucHVzaChcIjxpPntrfTwvaT5cIilcblx0XHRcdHBhcnRzOmtleXdvcmRzLnB1c2goXCI8aT57a308L2k+XCIpXG5cblx0XHR2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zKVxuXHRcdHZhciBhbGwgPSBbXS5jb25jYXQoc2h1ZmZsZWQpXG5cdFx0dmFyIGNvdW50ID0gaXRlbXM6bGVuZ3RoIC0gMVxuXG5cdFx0Zm9yIGxuIGluIFswIC4uIDE0XVxuXHRcdFx0bGV0IGNoYXJzID0gMFxuXHRcdFx0bGluZXNbbG5dID0gW11cblx0XHRcdHdoaWxlIGNoYXJzIDwgMzAwXG5cdFx0XHRcdGxldCBpdGVtID0gKHNodWZmbGVkLnBvcCBvciBhbGxbTWF0aC5mbG9vcihjb3VudCAqIE1hdGgucmFuZG9tKV0pXG5cdFx0XHRcdGlmIGl0ZW1cblx0XHRcdFx0XHRjaGFycyArPSBpdGVtOmxlbmd0aFxuXHRcdFx0XHRcdGxpbmVzW2xuXS5wdXNoKGl0ZW0pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjaGFycyA9IDQwMFxuXG5cdFx0ZG9tOmlubmVySFRNTCA9ICc8ZGl2PicgKyBsaW5lcy5tYXAofGxuLGl8XG5cdFx0XHRsZXQgbyA9IE1hdGgubWF4KDAsKChpIC0gMikgKiAwLjMgLyAxNCkpLnRvRml4ZWQoMilcblx0XHRcdFwiPGRpdiBjbGFzcz0nbGluZScgc3R5bGU9J29wYWNpdHk6IHtvfTsnPlwiICsgbG4uam9pbihcIiBcIikgKyAnPC9kaXY+J1xuXHRcdCkuam9pbignJykgKyAnPC9kaXY+J1xuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGF0dGVybi5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuaW1wb3J0IFNuaXBwZXQgZnJvbSAnLi9TbmlwcGV0J1xuXG50YWcgR3VpZGVUT0Ncblx0cHJvcCB0b2Ncblx0YXR0ciBsZXZlbFxuXG5cdGRlZiB0b2dnbGVcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhLnRvY1xuXHRcdFxuXHRkZWYgcm91dGVcblx0XHRcIntkYXRhLnBhdGh9I3t0b2M6c2x1Z31cIlx0XHRcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkYXRhLnJlYWR5XG5cblx0XHRsZXQgdG9jID0gdG9jXG5cdFx0cmVyb3V0ZVxuXHRcblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAzXG5cdFx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlbiB3aGVuIGNoaWxkOmxldmVsIDwgM1xuXHRcdFx0XHRcdFx0PEd1aWRlVE9DW2RhdGFdIHRvYz1jaGlsZD5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cbnRhZyBHdWlkZVxuXHRcblx0ZGVmIHNldHVwXG5cdFx0cmVuZGVyXG5cdFx0QGJvZHkuZG9tOmlubmVySFRNTCA9IGRhdGE6Ym9keVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRhd2FrZW5TbmlwcGV0c1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLm1kPlxuXHRcdFx0PGRpdkBib2R5PlxuXHRcdFx0PGZvb3Rlcj5cblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOnByZXZdXG5cdFx0XHRcdFx0PGEucHJldiBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IFwi4oaQIFwiICsgcmVmOnRpdGxlXG5cdFx0XHRcdGlmIGxldCByZWYgPSBhcHAuZ3VpZGVbZGF0YTpuZXh0XVxuXHRcdFx0XHRcdDxhLm5leHQgaHJlZj1cIi9ndWlkZS97cmVmOmlkfVwiPiByZWY6dGl0bGUgKyBcIiDihpJcIlxuXG5cdGRlZiBhd2FrZW5TbmlwcGV0c1xuXHRcdGZvciBpdGVtIGluIGRvbS5xdWVyeVNlbGVjdG9yQWxsKCcuc25pcHBldCcpXG5cdFx0XHRsZXQgY29kZSA9IGl0ZW06dGV4dENvbnRlbnRcblx0XHRcdGlmIGNvZGUuaW5kZXhPZignSW1iYS5tb3VudCcpID49IDBcblx0XHRcdFx0U25pcHBldC5yZXBsYWNlKGl0ZW0pXG5cdFx0c2VsZlxuXG50YWcgVE9DIDwgbGlcblx0cHJvcCB0b2Ncblx0cHJvcCBleHBhbmRlZCBkZWZhdWx0OiB0cnVlXG5cdGF0dHIgbGV2ZWxcblx0XG5cdGRlZiByb3V0ZVxuXHRcdFwiL2d1aWRlL3tkYXRhOnJvdXRlfSN7dG9jOnNsdWd9XCJcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YTp0b2NbMF1cblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgMiBhbmQgZXhwYW5kZWRcblx0XHRcdFx0PHVsPiBmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0PFRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cbmV4cG9ydCB0YWcgR3VpZGVzUGFnZSA8IFBhZ2Vcblx0XG5cdGRlZiBtb3VudFxuXHRcdEBvbnNjcm9sbCB8fD0gZG8gc2Nyb2xsZWRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJyxAb25zY3JvbGwscGFzc2l2ZTogdHJ1ZSlcblxuXHRkZWYgdW5tb3VudFxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRkYXRhW3JvdXRlci5wYXRoLnJlcGxhY2UoJy9ndWlkZS8nLCcnKV0gb3IgZGF0YVsnZXNzZW50aWFscy9pbnRyb2R1Y3Rpb24nXVxuXHRcdFxuXHRkZWYgc2Nyb2xsZWRcblx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIGl0ZW1zID0gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF0nKVxuXHRcdHZhciBtYXRjaFxuXG5cdFx0dmFyIHNjcm9sbFRvcCA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdHZhciB3aCA9IHdpbmRvdzppbm5lckhlaWdodFxuXHRcdHZhciBkaCA9IGRvY3VtZW50OmJvZHk6c2Nyb2xsSGVpZ2h0XG5cblx0XHRpZiBAc2Nyb2xsRnJlZXplID49IDBcblx0XHRcdHZhciBkaWZmID0gTWF0aC5hYnMoc2Nyb2xsVG9wIC0gQHNjcm9sbEZyZWV6ZSlcblx0XHRcdHJldHVybiBzZWxmIGlmIGRpZmYgPCA1MFxuXHRcdFx0QHNjcm9sbEZyZWV6ZSA9IC0xXG5cblx0XHR2YXIgc2Nyb2xsQm90dG9tID0gZGggLSAoc2Nyb2xsVG9wICsgd2gpXG5cblx0XHRpZiBzY3JvbGxCb3R0b20gPT0gMFxuXHRcdFx0bWF0Y2ggPSBpdGVtc1tpdGVtcy5sZW4gLSAxXVxuXHRcdGVsc2Vcblx0XHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRcdHZhciB0ID0gKGl0ZW06b2Zmc2V0VG9wICsgMzAgKyA2MCkgIyBoYWNrXG5cdFx0XHRcdHZhciBkaXN0ID0gc2Nyb2xsVG9wIC0gdFxuXG5cdFx0XHRcdGlmIGRpc3QgPCAwXG5cdFx0XHRcdFx0YnJlYWsgbWF0Y2ggPSBpdGVtXG5cdFx0XG5cdFx0aWYgbWF0Y2hcblx0XHRcdGlmIEBoYXNoICE9IG1hdGNoOmlkXG5cdFx0XHRcdEBoYXNoID0gbWF0Y2g6aWRcblx0XHRcdFx0cm91dGVyLmdvKCcjJyArIEBoYXNoLHt9LHllcylcblx0XHRcdFx0cmVuZGVyXG5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJvdXRlIGVcblx0XHRlLnN0b3Bcblx0XHRsb2cgJ2d1aWRlcyByb3V0ZWQnXG5cdFx0dmFyIHNjcm9sbCA9IGRvXG5cdFx0XHRpZiBsZXQgZWwgPSBkb20ucXVlcnlTZWxlY3RvcignIycgKyByb3V0ZXIuaGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXcodHJ1ZSlcblx0XHRcdFx0QHNjcm9sbEZyZWV6ZSA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdFx0XHRyZXR1cm4gZWxcblx0XHRcdHJldHVybiBub1xuXG5cdFx0aWYgcm91dGVyLmhhc2hcblx0XHRcdCMgcmVuZGVyXG5cdFx0XHRzY3JvbGwoKSBvciBzZXRUaW1lb3V0KHNjcm9sbCwyMClcblxuXHRcdHNlbGZcblx0IyBwcm9wIGd1aWRlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGxldCBjdXJyID0gZ3VpZGVcblxuXHRcdDxzZWxmLl9wYWdlPlxuXHRcdFx0PG5hdkBuYXY+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgaXRlbSBpbiBkYXRhOnRvY1xuXHRcdFx0XHRcdFx0PGgxPiBpdGVtOnRpdGxlIG9yIGl0ZW06aWRcblx0XHRcdFx0XHRcdDx1bD5cblx0XHRcdFx0XHRcdFx0Zm9yIHNlY3Rpb24gaW4gaXRlbTpzZWN0aW9uc1xuXHRcdFx0XHRcdFx0XHRcdDxUT0NbZGF0YVtzZWN0aW9uXV0gZXhwYW5kZWQ9KGRhdGFbc2VjdGlvbl0gPT0gY3Vycik+XG5cdFx0XHRcdFx0IyBmb3IgZ3VpZGUgaW4gZGF0YVxuXHRcdFx0XHRcdCNcdDxUT0NbZ3VpZGVdIHRvYz1ndWlkZTp0b2NbMF0gZXhwYW5kZWQ9KGd1aWRlID09IGN1cnIpPlxuXHRcdFx0PC5ib2R5LmxpZ2h0PlxuXHRcdFx0XHRpZiBndWlkZVxuXHRcdFx0XHRcdDxHdWlkZUB7Z3VpZGU6aWR9W2d1aWRlXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG5kZWYgcGF0aFRvQW5jaG9yIHBhdGhcblx0J2FwaS0nICsgcGF0aC5yZXBsYWNlKC9cXC4vZywnXycpLnJlcGxhY2UoL1xcIy9nLCdfXycpLnJlcGxhY2UoL1xcPS9nLCdfc2V0JylcblxudGFnIERlc2NcblxuXHRkZWYgaHRtbD0gaHRtbFxuXHRcdGlmIGh0bWwgIT0gQGh0bWxcblx0XHRcdGRvbTppbm5lckhUTUwgPSBAaHRtbCA9IGh0bWxcblx0XHRzZWxmXG5cbnRhZyBSZWZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cbnRhZyBJdGVtXG5cbnRhZyBQYXRoIDwgc3BhblxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHNldHVwXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHR2YXIgc3RyID0gZGF0YVxuXHRcdGlmIHN0ciBpc2EgU3RyaW5nXG5cdFx0XHRpZiBzaG9ydFxuXHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvKFtBLVpdXFx3KlxcLikqKD89W0EtWl0pL2csJycpXG5cblx0XHRcdGh0bWwgPSBzdHIucmVwbGFjZSgvXFxiKFtcXHddK3xcXC58XFwjKVxcYi9nKSBkbyB8bSxpfFxuXHRcdFx0XHRpZiBpID09ICcuJyBvciBpID09ICcjJ1xuXHRcdFx0XHRcdFwiPGk+e2l9PC9pPlwiXG5cdFx0XHRcdGVsaWYgaVswXSA9PSBpWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0nY29uc3QnPntpfTwvYj5cIlxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0naWQnPntpfTwvYj5cIlxuXHRcdHNlbGZcblxuXG50YWcgUmV0dXJuXG5cdGF0dHIgbmFtZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxQYXRoW2RhdGE6dmFsdWVdLnZhbHVlPlxuXHRcdFx0PHNwYW4uZGVzYz4gZGF0YTpkZXNjXG5cbnRhZyBDbGFzcyA8IEl0ZW1cblxuXHRwcm9wIGRhdGEgd2F0Y2g6IDpwYXJzZVxuXG5cdGRlZiBwYXJzZVxuXHRcdEBzdGF0aWNzID0gKG0gZm9yIG0gaW4gZGF0YVsnLiddIHdoZW4gbTpkZXNjKVxuXHRcdEBtZXRob2RzID0gKG0gZm9yIG0gaW4gZGF0YVsnIyddIHdoZW4gbTpkZXNjKVxuXHRcdEBwcm9wZXJ0aWVzID0gW11cblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1wYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCk+XG5cdFx0XHQ8LmhlYWRlcj4gPC50aXRsZT4gPFBhdGhbZGF0YTpuYW1lcGF0aF0+XG5cdFx0XHQ8RGVzYyBodG1sPWRhdGE6aHRtbD5cblx0XHRcdGlmIGRhdGE6Y3RvclxuXHRcdFx0XHQ8LmNvbnRlbnQuY3Rvcj5cblx0XHRcdFx0XHQ8TWV0aG9kW2RhdGE6Y3Rvcl0gcGF0aD0oZGF0YTpuYW1lcGF0aCArICcubmV3Jyk+XG5cblx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0aWYgQHN0YXRpY3M6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdTdGF0aWMgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAc3RhdGljc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOm5hbWVwYXRoPlxuXG5cdFx0XHRcdGlmIEBtZXRob2RzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnSW5zdGFuY2UgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAbWV0aG9kc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOmluYW1lPlxuXG50YWcgVmFsdWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0aWYgZGF0YTp0eXBlXG5cdFx0XHQ8c2VsZiAue2RhdGE6dHlwZX0+XG5cdFx0XHRcdGRhdGE6dmFsdWVcblx0XHRlbGlmIGRhdGEgaXNhIFN0cmluZ1xuXHRcdFx0PHNlbGYuc3RyIHRleHQ9ZGF0YT5cblx0XHRlbGlmIGRhdGEgaXNhIE51bWJlclxuXHRcdFx0PHNlbGYubnVtIHRleHQ9ZGF0YT5cblx0XHRzZWxmXG5cdFx0XG5cbnRhZyBQYXJhbVxuXG5cdGRlZiB0eXBlXG5cdFx0ZGF0YTp0eXBlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC57dHlwZX0+XG5cdFx0XHRpZiB0eXBlID09ICdOYW1lZFBhcmFtcydcblx0XHRcdFx0Zm9yIHBhcmFtIGluIGRhdGE6bm9kZXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8Lm5hbWU+IGRhdGE6bmFtZVxuXHRcdFx0XHRpZiBkYXRhOmRlZmF1bHRzXG5cdFx0XHRcdFx0PGk+IHR5cGUgPT0gJ05hbWVkUGFyYW0nID8gJzogJyA6ICcgPSAnXG5cdFx0XHRcdFx0PFZhbHVlW2RhdGE6ZGVmYXVsdHNdPlxuXG50YWcgTWV0aG9kIDwgSXRlbVxuXG5cdHByb3AgaW5hbWVcblx0cHJvcCBwYXRoXG5cblx0ZGVmIHRhZ3Ncblx0XHQ8ZGl2QHRhZ3M+XG5cdFx0XHQ8UmV0dXJuW2RhdGE6cmV0dXJuXSBuYW1lPSdyZXR1cm5zJz4gaWYgZGF0YTpyZXR1cm5cblxuXHRcdFx0aWYgZGF0YTpkZXByZWNhdGVkXG5cdFx0XHRcdDwuZGVwcmVjYXRlZC5yZWQ+ICdNZXRob2QgaXMgZGVwcmVjYXRlZCdcblx0XHRcdGlmIGRhdGE6cHJpdmF0ZVxuXHRcdFx0XHQ8LnByaXZhdGUucmVkPiAnTWV0aG9kIGlzIHByaXZhdGUnXG5cblxuXHRkZWYgcGF0aFxuXHRcdEBwYXRoIG9yIChpbmFtZSArICcuJyArIGRhdGE6bmFtZSlcblxuXHRkZWYgc2x1Z1xuXHRcdHBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAuZGVwcmVjYXRlZD0oZGF0YTpkZXByZWNhdGVkKSA+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXNsdWc+XG5cdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0PFBhdGhbcGF0aF0+XG5cdFx0XHRcdDwucGFyYW1zPiBmb3IgcGFyYW0gaW4gZGF0YTpwYXJhbXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0XHQ8Lmdyb3c+XG5cdFx0XHQ8RGVzYy5tZCBodG1sPWRhdGE6aHRtbD5cblx0XHRcdHRhZ3NcblxudGFnIExpbmsgPCBhXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgaHJlZj1cIi9kb2NzI3twYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCl9XCI+IDxQYXRoW2RhdGE6bmFtZXBhdGhdIHNob3J0PXNob3J0PlxuXHRcdHN1cGVyXG5cblx0ZGVmIG9udGFwXG5cdFx0c3VwZXJcblx0XHR0cmlnZ2VyKCdyZWZvY3VzJylcblxudGFnIEdyb3VwXG5cblx0ZGVmIG9udGFwXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblxuXG5leHBvcnQgdGFnIERvY3NQYWdlIDwgUGFnZVxuXG5cdHByb3AgdmVyc2lvbiBkZWZhdWx0OiAnY3VycmVudCdcblx0cHJvcCByb290c1xuXG5cdGRlZiBzcmNcblx0XHRcIi9hcGkve3ZlcnNpb259Lmpzb25cIlxuXG5cdGRlZiBkb2NzXG5cdFx0QGRvY3NcblxuXHRkZWYgc2V0dXBcblx0XHRsb2FkXG5cdFx0c3VwZXJcblxuXHRkZWYgbG9hZFxuXHRcdHZhciBkb2NzID0gYXdhaXQgYXBwLmZldGNoKHNyYylcblx0XHRET0NTID0gQGRvY3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRvY3MpKVxuXHRcdERPQ01BUCA9IEBkb2NzOmVudGl0aWVzXG5cdFx0Z2VuZXJhdGVcblx0XHRpZiAkd2ViJFxuXHRcdFx0bG9hZGVkXG5cblx0ZGVmIGxvYWRlZFxuXHRcdHJlbmRlclxuXHRcdGlmIGRvY3VtZW50OmxvY2F0aW9uOmhhc2hcblx0XHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgb25yZWZvY3VzIGVcblx0XHRyZWZvY3VzXG5cblx0ZGVmIHJlZm9jdXNcblx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cblx0ZGVmIGxvb2t1cCBwYXRoXG5cdFx0ZG9jczplbnRpdGllc1twYXRoXVxuXG5cdGRlZiBnZW5lcmF0ZVxuXHRcdEByb290cyA9IFtdXG5cdFx0dmFyIGVudHMgPSBAZG9jczplbnRpdGllc1xuXG5cdFx0Zm9yIG93biBwYXRoLGl0ZW0gb2YgZG9jczplbnRpdGllc1xuXHRcdFx0aWYgaXRlbTp0eXBlID09ICdjbGFzcycgb3IgcGF0aCA9PSAnSW1iYSdcblx0XHRcdFx0aXRlbVsnLiddID0gKGl0ZW1bJy4nXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblx0XHRcdFx0aXRlbVsnIyddID0gKGl0ZW1bJyMnXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblxuXHRcdFx0XHRAcm9vdHMucHVzaChpdGVtKSBpZiBpdGVtOmRlc2Ncblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkb2NzXG5cdFx0XG5cdFx0PHNlbGY+XG5cdFx0XHQ8bmF2QG5hdj4gPC5jb250ZW50PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxHcm91cC50b2MuY2xhc3Muc2VjdGlvbi5jb21wYWN0PlxuXHRcdFx0XHRcdFx0PC5oZWFkZXI+IDxMaW5rW3Jvb3RdLmNsYXNzPlxuXHRcdFx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdFx0XHQ8LnN0YXRpYz5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycuJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHRcdFx0XHRcdDwuaW5zdGFuY2U+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnIyddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0PC5ib2R5PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxDbGFzc1tyb290XS5kb2MubD5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2xlc3Mvc2l0ZS5sZXNzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmV4cG9ydCB0YWcgTG9nb1xuXHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PHN2ZzpzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTE2XCIgaGVpZ2h0PVwiMTA4XCIgdmlld0JveD1cIjAgMCAxMTYgMTA4XCI+XG5cdFx0XHRcdDxzdmc6ZyBmaWxsPVwiIzNFOTFGRlwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIj5cblx0XHRcdFx0XHQ8c3ZnOnBhdGggZD1cIk0zOC44NjM4ODY5IDY4LjEzNTE0MjRDMzkuNTA3MzQ3NiA2OS41NzI3MSAzOS42ODkwMDU3IDcwLjk1NDc4MjUgMzkuNDA4ODY2NiA3Mi4yODE0MDE0IDM5LjEyODcyNzYgNzMuNjA4MDIwNCAzOC40NDM3MDIyIDc0LjYwOTY4MDUgMzcuMzUzNzY5OSA3NS4yODY0MTE4IDM2LjI2MzgzNzUgNzUuOTYzMTQzMiAzNS4wMTg3Mjg4IDc2LjE1MTcwMzMgMzMuNjE4NDA2MiA3NS44NTIwOTc5IDMyLjcxMjMxNTIgNzUuNjU4MjM1NiAzMS43MzUyMDcgNzUuMTg5MjAzNSAzMC42ODcwNTIzIDc0LjQ0NDk4NzUgMjguOTQyOTEwOSA3Mi41MTE5NDUgMjYuOTk1NDU0NyA3MC4zMTg3Nzk3IDI0Ljg0NDYyNTIgNjcuODY1NDI1NyAyMi42OTM3OTU4IDY1LjQxMjA3MTggMjAuNTEwNTY3NCA2Mi45MDg0ODY2IDE4LjI5NDg3NDggNjAuMzU0NTk1MSAxNi4wNzkxODIxIDU3LjgwMDcwMzUgMTMuOTAwMzMwOSA1NS4yNzYzOTAyIDExLjc1ODI1NTggNTIuNzgxNTc5NCA5LjYxNjE4MDY2IDUwLjI4Njc2ODYgNy42MzE5MTYyIDQ4LjA2NDA2MzQgNS44MDU0MDI4NiA0Ni4xMTMzOTcgNC43Njc1OTEyOCA0NC41MDQ3OTY1IDQuMzk3NTE0OTIgNDIuOTk1NzUyNiA0LjY5NTE2MjY2IDQxLjU4NjIyIDUuMDQ1MzM2NDggMzkuOTI3OTQ2NCA2LjEzNDI1NTQzIDM4LjY0NDQwMjcgNy45NjE5NTIxNiAzNy43MzU1NTA2TDExLjIxNDcyMjcgMzYuMDkxNjk0MkMxMi45MDEzNTI4IDM1LjIzOTMyIDE0Ljk0MDYxODggMzQuMjQ1NzY1OCAxNy4zMzI1ODE4IDMzLjExMTAwMjEgMTkuNzI0NTQ0OCAzMS45NzYyMzgzIDIyLjI0NTY5NzkgMzAuNzM5MTUyMyAyNC44OTYxMTY3IDI5LjM5OTcwNzEgMjcuNTQ2NTM1NiAyOC4wNjAyNjE5IDMwLjA2NzY4ODcgMjYuODIzMTc1OSAzMi40NTk2NTE3IDI1LjY4ODQxMjEgMzQuODUxNjE0NyAyNC41NTM2NDgzIDM2LjkxNTg1MDQgMjMuNTQzNzcyIDM4LjY1MjQyMDkgMjIuNjU4NzUyOCA0MC4zODg5OTE0IDIxLjc3MzczMzcgNDEuNDQ4MjY3NiAyMS4yNDIxMDkzIDQxLjgzMDI4MTMgMjEuMDYzODYzNiA0My41OTM1MDU5IDIwLjIyODUxNTYgNTMuNjE2MjEwOSAxOC43OTIyMzYzIDUyLjQyMTczOTEgMjIuNzMyNTQ5MUw0Ny45MTE1NTU2IDM5LjgwMDgzMDlDNDcuODA3NzgwNSA0MC4xOTM1NTYxIDQ3LjQ3Njc1MiA0MC40ODQ0ODYzIDQ3LjA3Mzk1MjQgNDAuNTM2OTczTDE4LjA2NTYwOSA0NC4zMTY4OTkxQzE5LjQ1MDQxNjkgNDUuOTEzMDgxMyAyMS4wNjM1MTQ4IDQ3Ljc1MzA2OTIgMjIuOTA0OTUxMSA0OS44MzY5MTggMjQuNzQ2Mzg3MyA1MS45MjA3NjY4IDI2LjU5OTYzNDQgNTQuMDUwNDQ2NCAyOC40NjQ3NDc5IDU2LjIyNjAyMDggMzAuMzI5ODYxNSA1OC40MDE1OTUyIDMyLjE4MzEwODYgNjAuNTMxMjc0OCAzNC4wMjQ1NDQ4IDYyLjYxNTEyMzYgMzUuODY1OTgxMSA2NC42OTg5NzIzIDM3LjQ3OTA3OSA2Ni41Mzg5NjAyIDM4Ljg2Mzg4NjkgNjguMTM1MTQyNHpNNjcuMjA5MDM1MyA3Ni4yMjIxNzczQzY1LjkxOTkyODUgNzcuMTA4Njc2IDY1LjA1NTcxNDcgNzguMTg0NDIyNSA2NC42MTYzNjggNzkuNDQ5NDQ5MSA2NC4xNzcwMjEzIDgwLjcxNDQ3NTYgNjQuMjUxNzk1OSA4MS45MTE3ODk3IDY0Ljg0MDY5NCA4My4wNDE0MjcxIDY1LjQyOTU5MjEgODQuMTcxMDY0NCA2Ni40MDE4Nzc4IDg0Ljk2NzI3NSA2Ny43NTc1ODA0IDg1LjQzMDA4MjUgNjguNjM0Nzk5OCA4NS43Mjk1NDYyIDY5LjcxNDAwMTIgODUuODMyNjUxOSA3MC45OTUyMTcyIDg1LjczOTQwMjUgNzMuNDgzMTYyNSA4NC45OTY4NDcgNzYuMjc4OTU1NCA4NC4xMzgzMTU5IDc5LjM4MjY3OTkgODMuMTYzNzgzNCA4Mi40ODY0MDQzIDgyLjE4OTI1MDggODUuNjQzNjg0NSA4MS4xODg4MTMzIDg4Ljg1NDYxNTMgODAuMTYyNDQwNiA5Mi4wNjU1NDYxIDc5LjEzNjA2NzkgOTUuMjI5NjkxMSA3OC4xMTU4NjQ1IDk4LjM0NzE0NTEgNzcuMTAxOCAxMDEuNDY0NTk5IDc2LjA4NzczNTQgMTA0LjMwNzEzIDc1LjIyMzA1MDMgMTA2Ljg3NDgyMiA3NC41MDc3MTg3IDEwOC41OTAxMjQgNzMuNjc4Mjc1NyAxMDkuNjgxMTYyIDcyLjU5MTUyNTIgMTEwLjE0Nzk2OCA3MS4yNDc0MzQ0IDExMC42OTcxNTEgNjkuNjY2MTUxMiAxMTAuNDIwMDkyIDY4LjAyMzkyNTMgMTA5LjMxNjc4MyA2Ni4zMjA3MDc0TDEwNy4zNjY3MjEgNjMuMjY3MTgxM0MxMDYuMzU1NTc0IDYxLjY4Mzg2MzUgMTA1LjExNDA0IDU5LjgwMDgyMzYgMTAzLjY0MjA4NCA1Ny42MTgwMDUzIDEwMi4xNzAxMjggNTUuNDM1MTg2OSAxMDAuNjM5NyA1My4wOTk3NzczIDk5LjA1MDc1MjkgNTAuNjExNzA2NSA5Ny40NjE4MDYyIDQ4LjEyMzYzNTcgOTUuOTMxMzc3OCA0NS43ODgyMjYyIDk0LjQ1OTQyMTcgNDMuNjA1NDA3OCA5Mi45ODc0NjU2IDQxLjQyMjU4OTQgOTEuNzMyODYwNCAzOS41MTI5Nzc5IDkwLjY5NTU2ODUgMzcuODc2NTE2MSA4OS42NTgyNzY2IDM2LjI0MDA1NDIgODkuMDIxMzM0NSAzNS4yNDg3OTQgODguNzg0NzIzMiAzNC45MDI3MDU2IDg3LjM0NTcwMzEgMzIuNzkxOTkyMiA4MC4zMDEwMjU0IDI2LjIwODAwNzggNzguODM2OTAwNSAzMC44OTcwNjkyTDczLjk2NTQ3ODkgNDcuNjI0MjA1NkM3My44NTEzMTg0IDQ4LjAxNjIwMTQgNzMuOTg2OTI0OSA0OC40MzgyMzE2IDc0LjMwODA1NTEgNDguNjkwMzYwMUw5Ny4yNzAxNzI1IDY2LjcxODU3NzFDOTUuMjYzMzQwOCA2Ny4zNjAwNjAxIDkyLjkzNTU4MjQgNjguMDkwOTQ4NSA5MC4yODY4Mjc1IDY4LjkxMTI2NDMgODcuNjM4MDcyNiA2OS43MzE1ODAxIDg0Ljk1NTY5MTYgNzAuNTg0NjA5MiA4Mi4yMzk2MDM5IDcxLjQ3MDM3NzIgNzkuNTIzNTE2MyA3Mi4zNTYxNDUyIDc2Ljg0MTEzNTIgNzMuMjA5MTc0MyA3NC4xOTIzODAzIDc0LjAyOTQ5MDIgNzEuNTQzNjI1NSA3NC44NDk4MDYgNjkuMjE1ODY3MSA3NS41ODA2OTQ0IDY3LjIwOTAzNTMgNzYuMjIyMTc3M3pNNjUuNDUwMTQwMSA4LjAxMTMxMTE4QzY2LjMxMDc5MzUgNi40ODYwODEyOSA2Ny4zMDkzNzA2IDUuNDM1MjU1MjMgNjguNDQ1OTAxMiA0Ljg1ODgwMTQ3IDY5LjU4MjQzMTggNC4yODIzNDc3MSA3MC43MzIyNTk1IDQuMTQ3NDMyMDYgNzEuODk1NDE4OCA0LjQ1NDA1MDQ4IDcyLjk3NTQ5NTMgNC43Mzg3Njc1OSA3My44OTMwNjcxIDUuMzc0ODY0ODcgNzQuNjQ4MTYxNiA2LjM2MjM2MTQxIDc1LjQwMzI1NjIgNy4zNDk4NTc5NSA3NS43NzcwMTYxIDguNjc0ODM5NDYgNzUuNzY5NDUyNyAxMC4zMzczNDU3TDUxLjM5MjcxNiA5OS44Mzg3MTk3QzUwLjc5NzYwNzkgMTAxLjY5Njc2NSA0OS44NTI3OTQxIDEwMi45NTg4NzMgNDguNTU4MjQ2MyAxMDMuNjI1MDggNDcuMjYzNjk4NiAxMDQuMjkxMjg3IDQ1Ljk5MzMyMjcgMTA0LjQ2MDEyOCA0NC43NDcwODA2IDEwNC4xMzE2MDggNDMuNTgzOTIxMiAxMDMuODI0OTkgNDIuNjIwNzM0NSAxMDMuMTExMTY1IDQxLjg1NzQ5MTUgMTAxLjk5MDExMyA0MS4wOTQyNDg1IDEwMC44NjkwNiA0MC44MzI4ODg0IDk5LjM3NjU5OTMgNDEuMDczNDAzNCA5Ny41MTI2ODUyTDY1LjQ1MDE0MDEgOC4wMTEzMTExOHpcIj5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvTG9nby5pbWJhIl0sInNvdXJjZVJvb3QiOiIifQ==