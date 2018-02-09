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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(6);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.6'};

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

var Imba = __webpack_require__(0), _T = Imba.TAGS;
var Page = _T.defineTag('Page')
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

__webpack_require__(5);
module.exports = __webpack_require__(27);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

var App = __webpack_require__(16).App;
var Site = __webpack_require__(18).Site;
document.body.innerHTML = '';
Imba.mount(Site.build(this).setData(App.deserialize(APPCACHE)).end());


/***/ }),
/* 6 */
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
	__webpack_require__(7);
	__webpack_require__(8);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 7 */
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(9);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(3);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);

if (true) {
	__webpack_require__(15);
};

if (false) {};


/***/ }),
/* 9 */
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
/* 10 */
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

Imba.static = function (items,nr){
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
	this.$ = {};
	this._tree_ = null;
	this._owner_ = ctx;
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
	child.prototype._empty = true;
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

Imba.Tag.prototype.ref_ = function (ref,ctx){
	ctx['_' + ref] = this;
	this.flag(this._ref = ref);
	this._owner = ctx;
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

Imba.Tag.prototype.on$ = function (slot,handler){
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
	if (prev) { handler.state = prev.state };
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
	if (false) {} else {
		this._empty ? this.append(nodes) : this.empty().append(nodes);
		this._tree_ = null;
	};
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
	this._empty = false;
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
	Remove all content inside node
	*/

Imba.Tag.prototype.empty = function (){
	if (this._dom.firstChild) {
		this.$.text = null;
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this);
	};
	
	this._nodes_ = this._text_ = null;
	this._empty = true;
	return this;
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


/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	var $_;
	let flags = ($_ = this.$).flags || ($_.flags = {});
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

Imba.Tags.prototype.baseType = function (name){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[name]) {
		console.log("tag already exists?",name);
	};
	
	supr || (supr = this.baseType(name));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		this[name] = tagtype;
		Imba.SINGLETONS[name.slice(1)] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + name.replace(/_/g,'-');
		this[name] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		// deprecate
		if (body.length == 2) {
			// create clone
			if (!tagtype.hasOwnProperty('TAGS')) {
				tagtype.TAGS = (supertype.TAGS || this).__clone();
			};
		};
		
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
	(prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
	return this;
};

Imba.Tags.prototype.findTagType = function (type){
	var attrs, props;
	let klass = this[type];
	if (!(klass)) {
		if (this._nodeNames.indexOf(type) >= 0) {
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

Imba.Tags.prototype.$ = function (typ,owner){
	if (true) {
		if (!this.findTagType(typ)) { throw (("cannot find tag-type " + typ)) };
	};
	return this.findTagType(typ).build(owner);
};

Imba.Tags.prototype.$set = function (cache,slot){
	return cache[slot] = new TagSet(cache,slot);
};

function TagSet(parent,slot){
	this.i$ = 0;
	this.s$ = slot;
	this.c$ = parent;
};

TagSet.prototype.$ = function (key,node){
	this.i$++;
	node.k$ = key;
	return this[key] = node;
};

TagSet.prototype.$iter = function (){
	var item = [];
	item.static = 5;
	item.cache = this;
	return item;
};

TagSet.prototype.$prune = function (items){
	let par = this.c$;
	let slot = this.s$;
	let clone = new TagSet(par,slot);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.k$] = item;
	};
	clone.i$ = items.length;
	return par[slot] = clone;
};


Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
var html = Imba.TAGS.defineNamespace('html');
html._nodeNames = Imba.HTML_TAGS;

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


var svg = Imba.TAGS.defineNamespace('svg');
svg._nodeNames = Imba.SVG_TAGS;
svg.baseType = function() { return 'element'; };
svg.element = Imba.SVGTag;

Imba.TAGS = html; // make the html namespace the root

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
	var ns = (svgSupport && (dom instanceof SVGElement)) ? Imba.TAGS._SVG : Imba.TAGS;
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	var type = ns.element;
	
	if (ns._nodeNames.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	};
	
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
		Imba.TAGS.extendTag('element', function(tag){
			
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// predefine all supported html tags
Imba.TAGS.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.TAGS.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});


Imba.TAGS.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataValue(node,path,mods){
	var self = this;
	self._node = node;
	self._path = path;
	self._mods = mods || {};
	self._setter = Imba.toSetter(self._path);
	let valueFn = node.value;
	node.value = function() { return self.mod(valueFn.call(this)); };
};

DataValue.prototype.data = function (){
	return this._node.data() || this._node._owner_.data();
};

DataValue.prototype.lazy = function (){
	return this._mods.lazy;
};

DataValue.prototype.get = function (){
	let data = this.data();
	let val = data[this._path];
	return (data[this._setter] && (val instanceof Function)) ? data[this._path]() : val;
};

DataValue.prototype.set = function (value){
	let data = this.data();
	let prev = data[this._path];
	if (prev instanceof Function) {
		if (data[this._setter] instanceof Function) {
			data[this._setter](value);
			return this;
		};
	};
	return data[this._path] = value;
};

DataValue.prototype.isArray = function (val){
	if(val === undefined) val = this.get();
	return val && val.splice && val.sort;
};

DataValue.prototype.mod = function (value){
	var self = this;
	if (value instanceof Array) {
		return value.map(function(_0) { return self.mod(_0); });
	};
	if (self._mods.trim && (typeof value=='string'||value instanceof String)) {
		value = value.trim();
	};
	if (self._mods.number) {
		value = parseFloat(value);
	};
	return value;
};

Imba.TAGS.extendTag('input', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.model())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this.model().get();
			let dval = (this._value != undefined) ? this._value : this.value();
			// console.log "change",type,checked,dval
			
			if (this.type() == 'radio') {
				return this.model().set(dval,true);
			} else if (this.dom().value == 'on') {
				return this.model().set(!(!(checked)),true);
			} else if (this.model().isArray()) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!(checked) && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.model().set(dval);
			};
		} else {
			return this.model().set(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._model || this._localValue !== undefined) { return this };
		let mval = this._model.get();
		if (mval == this._modelValue) { return this };
		if (!this.model().isArray()) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = this.model().isArray() ? (
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

Imba.TAGS.extendTag('textarea', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !(this.model())) { return };
		if (this.model()) {
			this._dom.value = this.model().get();
		};
		this._initialValue = this._dom.value;
		return this;
	};
});

Imba.TAGS.extendTag('option', function(tag){
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

Imba.TAGS.extendTag('select', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this._value = value;
			if (typeof value == 'object') {
				for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
					opt = items[i];
					let oval = (opt._tag ? opt._tag.value() : opt.value);
					if (value == oval) {
						this.dom().selectedIndex = i;
						break;
					};
				};
			} else {
				this.dom().value = value;
			};
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
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (!(this.model())) { return };
		
		let mval = this.model().get();
		// sync dom value
		if (this.multiple()) {
			for (let i = 0, items = iter$(this.dom().options), len = items.length, option; i < len; i++) {
				option = items[i];
				let oval = this.model().mod(option._tag ? option._tag.value() : option.value);
				let sel = mval.indexOf(oval) >= 0;
				option.selected = sel;
			};
		} else {
			this.setValue(mval);
			// what if mval is rich? Would be nice with some mapping
			// dom:value = mval
		};
		return this;
	};
});


/***/ }),
/* 12 */
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
/* 13 */
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
	return (e.button() != undefined) ? ((e.button() === 0)) : el.on$key(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.on$key(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};
el.getHandler = function (str){
	return this[str];
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
			while (el && (!(fn) || !(fn instanceof Function))){
				if (fn = el.getHandler(handler)) {
					handler = fn;
					context = el;
				} else {
					el = el.parent();
				};
			};
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			// should we take awaits into account?
			// was bubbling before - has not been modified
			if (!(isMod)) {
				bubble = false; // stop propagation by default
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
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!(handler)) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) { // and (hname:length == name:length or hname[name:length] == '.')
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
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
/* 14 */
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
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

var Imba = __webpack_require__(1);

// 1 - static shape - unknown content
// 2 - static shape and static children
// 3 - single item
// 4 - optimized array - only length will change
// 5 - optimized collection

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
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) {
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


Imba.TAGS.extendTag('element', function(tag){
	
	tag.prototype.setChildren = function (new$,typ){
		var old = this._tree_;
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!(old) && typ != 3) {
			this.empty();
			appendNested(this,new$);
		} else if (typ == 1) {
			// here we _know _that it is an array with the same shape
			// every time
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				// prev = old[i]
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			// this is possibly fully dynamic. It often is
			// but the old or new could be static while the other is not
			// this is not handled now
			// what if it was previously a static array? edgecase - but must work
			// could we simply do replace-child?
			if (new$ && new$._dom) {
				this.empty();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$.static == 5 && old && old.static == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.empty();
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
			this.empty();
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

// if $web$
// optimization for setText
var proto = Imba.Tag.prototype;
var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
		// optimization
	};
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(17).Router;

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


var gcache = {};
var requests = {};

function App(cache){
	if(cache === undefined) cache = {};
	this._cache = cache;
	this._docs = {};
	if (true) {
		this._loc = document.location;
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _T = Imba.TAGS;
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

_T.extendTag('element', function(tag){
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
_T.extendTag('a', function(tag){
	
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
			setId('#gist').open(m[2]);
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
		return this.reroute();
	};
});


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _T = Imba.TAGS;
var HomePage = __webpack_require__(19).HomePage;
var GuidesPage = __webpack_require__(25).GuidesPage;
var DocsPage = __webpack_require__(26).DocsPage;

_T.extendTag('element', function(tag){
	
	tag.prototype.root = function (){
		return this._owner_ ? this._owner_.root() : this;
	};
	
	tag.prototype.app = function (){
		return this.root().app();
	};
});


var Site = _T.defineTag('Site', function(tag){
	
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
		var self = this, $ = self.$;
		console.log("render site",this.app().path());
		return this.setChildren([
			($.A=$.A || _T.$('header',this).setId('header')).setContent(
				($.B=$.B || _T.$('nav',self).flag('content')).setContent([
					($.C=$.C || _T.$('a',self).flag('tab').flag('logo').setHref('/home')).setContent(($.D=$.D || _T.$('i',self).setText('imba')).end(),2).end(),
					($.E=$.E || _T.$('a',self).flag('tab').flag('home').setHref('/home')).setContent(($.F=$.F || _T.$('i',self).setText('home')).end(),2).end(),
					($.G=$.G || _T.$('a',self).flag('tab').flag('guides').setHref('/guides')).setContent(($.H=$.H || _T.$('i',self).setText('guides')).end(),2).end(),
					($.I=$.I || _T.$('a',self).flag('tab').flag('docs').setHref('/docs')).setContent(($.J=$.J || _T.$('i',self).setText('api')).end(),2).end(),
					($.K=$.K || _T.$('a',self).flag('tab').flag('blog').setHref('/blog')).setContent(($.L=$.L || _T.$('i',self).setText('blog')).end(),2).end(),
					(self.app().router().segment(0) == 'gists') ? (
						($.M=$.M || _T.$('a',self).flag('tab').flag('blog').setHref('/gists')).setContent(($.N=$.N || _T.$('i',self).setText('gists')).end(),2).end()
					) : void(0),
					
					($.O=$.O || _T.$('span',self).flag('greedy')).end(),
					($.P=$.P || _T.$('a',self).flag('twitter').setHref('http://twitter.com/imbajs')).setContent(($.Q=$.Q || _T.$('i',self).setText('twitter')).end(),2).end(),
					($.R=$.R || _T.$('a',self).flag('github').setHref('https://github.com/somebee/imba')).setContent(($.S=$.S || _T.$('i',self).setText('github')).end(),2).end(),
					($.T=$.T || _T.$('a',self).flag('issues').setHref('https://github.com/somebee/imba/issues')).setContent(($.U=$.U || _T.$('i',self).setText('issues')).end(),2).end(),
					($.V=$.V || _T.$('a',self).flag('menu').on$(0,['tap','toggleMenu'])).setContent(($.W=$.W || _T.$('b',self)).end(),2).end()
				],1).end()
			,2).end(),
			
			($.X=$.X || _T.$('main',self)).setContent([
				self.router().scoped('/home') ? (
					($.Y=$.Y || HomePage.build(self)).end()
				) : (self.router().scoped('/guides') ? (
					($.Z=$.Z || GuidesPage.build(self)).end()
				) : (self.router().scoped('/docs') ? (
					($.AA=$.AA || DocsPage.build(self)).end()
				) : void(0)))
			],1).end(),
			
			($.AB=$.AB || _T.$('footer',self).setId('footer')).setContent([
				($.AC=$.AC || _T.$('hr',self)).end(),
				($.AD=$.AD || _T.$('div',self).flag('lft').setText("Imba © 2015-2018")).end(),
				($.AE=$.AE || _T.$('div',self).flag('rgt')).setContent([
					($.AF=$.AF || _T.$('a',self).setHref('http://twitter.com/imbajs').setText('Twitter')).end(),
					($.AG=$.AG || _T.$('a',self).setHref('http://github.com/somebee/imba').setText('GitHub')).end(),
					($.AH=$.AH || _T.$('a',self).setHref('http://github.com/somebee/imba/issues').setText('Issues')).end(),
					($.AI=$.AI || _T.$('a',self).setHref('http://gitter.im/somebee/imba').setText('Chat')).end()
				],2).end()
			],2).end()
		],2).synced();
	};
})
exports.Site = Site;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _T = Imba.TAGS;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(20).Example;
var Marked = __webpack_require__(21).Marked;
var Pattern = __webpack_require__(24).Pattern;


var HomePage = _T.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return this.setChildren(($.A=$.A || _T.$('div',this).flag('body')).setContent([
			($.B=$.B || _T.$('div',self).setId('hero').flag('dark')).setContent(
				(self._pattern || Pattern.build(self).ref_('pattern',self)).end()
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			,2).end(),
			($.C=$.C || _T.$('div',self).flag('content')).setContent([
				($.D=$.D || Marked.build(self).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n")).end(),
				
				($.E=$.E || Example.build(self).flag('dark').setHeading("Simple reminders").setSrc('/home/examples/reminders.imba')).end(),
				
				($.F=$.F || Marked.build(self).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change.")).end(),
				
				($.G=$.G || Example.build(self).flag('dark').setHeading("World clock").setSrc('/home/examples/clock.imba')).end(),
				
				($.H=$.H || Marked.build(self).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")).end(),
				
				($.I=$.I || Example.build(self).flag('dark').setHeading("Custom canvas").setSrc('/home/examples/canvas.imba')).end()
			],2).end()
		],2).end(),2).synced();
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _T = Imba.TAGS;

var Snippet = _T.defineTag('Snippet', function(tag){
	tag.prototype.src = function(v){ return this._src; }
	tag.prototype.setSrc = function(v){ this._src = v; return this; };
	tag.prototype.heading = function(v){ return this._heading; }
	tag.prototype.setHeading = function(v){ this._heading = v; return this; };
	
	tag.prototype.render = function (){
		return this.synced();
	};
})
exports.Snippet = Snippet;

var Example = _T.defineTag('Example', Snippet, function(tag){
	
	tag.prototype.render = function (){
		return this.setText("Example").synced();
	};
})
exports.Example = Example;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _T = Imba.TAGS;
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Marked = _T.defineTag('Marked', function(tag){
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
var Imba = __webpack_require__(0), _T = Imba.TAGS;
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

var Pattern = _T.defineTag('Pattern', function(tag){
	
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
var Imba = __webpack_require__(0), _T = Imba.TAGS;
var Page = __webpack_require__(2).Page;

var GuideTOC = _T.defineTag('GuideTOC', function(tag){
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
		var self = this, $ = self.$;
		if (!this.data().ready()) { return this };
		
		let toc = this.toc();
		
		return this.flag('toc').flag('entry').setLevel((toc.level)).setChildren([
			(toc.children.length && toc.level < 2) ? Imba.static([
				($.A=$.A || _T.$('div',this).flag('header')).setContent(
					($.B=$.B || _T.$('a',self)).setHref(self.route()).setContent(toc.title,3).end()
				,2).end(),
				($.C=$.C || _T.$('div',self).flag('content')).setContent(
					(function() {
						var $$ = ($.D = $.D || []);
						for (let i = 0, items = iter$(toc.children), len = $$.taglen = items.length; i < len; i++) {
							// <div> "Item"
							($$[i]=$$[i] || GuideTOC.build(self)).setData(self.data()).setToc(items[i]).end();
						};return $$;
					})()
				,4).end()
			],2) : (
				($.E=$.E || _T.$('a',self)).setHref(self.route()).setContent(toc.title,3).end()
			)
		],1).synced();
	};
});

var Guide = _T.defineTag('Guide', function(tag){
	tag.prototype.render = function (){
		var data_;
		if (!(data_ = this.data()) && data_.ready  &&  data_.ready()) { return this };
		// really render without imba?
		return this.flag('md').setBody(this.data().body()).synced();
	};
	
	tag.prototype.setBody = function (body){
		if (body != this._body) {
			this._body = body;
			this.dom().innerHTML = body;
		};
		this;
		return this;
	};
});

var GuidesPage = _T.defineTag('GuidesPage', Page, function(tag){
	
	tag.prototype.mount = function (){
		var self = this;
		console.log("GuidesPage mounted");
		self._onscroll || (self._onscroll = function() { return self.scrolled(); });
		return window.addEventListener('scroll',self._onscroll,{passive: true});
		// Doc.get(router.path,'md')
	};
	
	tag.prototype.unmount = function (){
		return window.removeEventListener('scroll',this._onscroll,{passive: true});
	};
	
	tag.prototype.guide = function (){
		return this.app().doc(this.router().path() + '.md');
	};
	
	tag.prototype.scrolled = function (){
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
			self.render();
			scroll() || setTimeout(scroll,20);
		};
		
		return self;
	};
	
	tag.prototype.render = function (){
		var t0, self = this, $ = self.$;
		return this.flag('_page').setChildren([
			(t0 = this._nav || _T.$('nav',this).ref_('nav',this)).setContent(
				(t0.$.a=t0.$.a || _T.$('div',this).flag('content')).setContent([
					(t0.$.b=t0.$.b || GuideTOC.build(this)).setData(this.app().doc('/guides.md')).end(),
					(t0.$.c=t0.$.c || GuideTOC.build(this)).setData(this.app().doc('/guides/language.md')).end()
				],2).end()
			,2).end(),
			($.A=$.A || _T.$('div',this).flag('body').flag('light')).setContent(
				($.B=$.B || Guide.build(self)).setData(self.guide()).end()
			,2).end()
		],2).synced();
	};
})
exports.GuidesPage = GuidesPage;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _T = Imba.TAGS;
var Page = __webpack_require__(2).Page;

function pathToAnchor(path){
	return 'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set');
};

var Desc = _T.defineTag('Desc', function(tag){
	
	tag.prototype.setHtml = function (html){
		if (html != this._html) {
			this.dom().innerHTML = this._html = html;
		};
		this;
		return this;
	};
});

var Ref = _T.defineTag('Ref', function(tag){
	
	tag.prototype.render = function (){
		return this.synced();
	};
});

var Item = _T.defineTag('Item');

var Path = _T.defineTag('Path', 'span', function(tag){
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


var Return = _T.defineTag('Return', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return this.setChildren([
			($.A=$.A || Path.build(this).flag('value')).setData(this.data().value).end(),
			($.B=$.B || _T.$('span',self).flag('desc')).setContent(self.data().desc,3).end()
		],2).synced();
	};
});

var Class = _T.defineTag('Class', Item, function(tag){
	
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
		var self = this, $ = self.$;
		return this.setChildren([
			($.A=$.A || _T.$('span',this).flag('toc-anchor')).setId(pathToAnchor(this.data().namepath)).end(),
			($.B=$.B || _T.$('div',self).flag('header')).setContent(($.C=$.C || _T.$('div',self).flag('title')).setContent(($.D=$.D || Path.build(self)).setData(self.data().namepath).end(),2).end(),2).end(),
			($.E=$.E || Desc.build(self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($.F=$.F || _T.$('div',self).flag('content').flag('ctor')).setContent(
					($.G=$.G || Method.build(self)).setData(self.data().ctor).setPath((self.data().namepath + '.new')).end()
				,2).end()
			) : void(0),
			
			($.H=$.H || _T.$('div',self).flag('content')).setContent([
				(self._statics.length > 0) ? (
					($.I=$.I || _T.$('div',self).flag('section')).setContent([
						($.J=$.J || _T.$('h2',self).flag('header').setText('Static Methods')).end(),
						($.K=$.K || _T.$('div',self).flag('content').flag('list')).setContent((function() {
							var $$ = ($.L = $.L || []);
							for (let i = 0, items = iter$(self._statics), len = $$.taglen = items.length; i < len; i++) {
								($$[i]=$$[i] || Method.build(self).flag('doc')).setData(items[i]).setIname(self.data().namepath).end();
							};return $$;
						})(),4).end()
					],2).end()
				) : void(0),
				
				(self._methods.length > 0) ? (
					($.M=$.M || _T.$('div',self).flag('section')).setContent([
						($.N=$.N || _T.$('h2',self).flag('header').setText('Instance Methods')).end(),
						($.O=$.O || _T.$('div',self).flag('content').flag('list')).setContent((function() {
							var $$1 = ($.P = $.P || []);
							for (let i = 0, items = iter$(self._methods), len = $$1.taglen = items.length; i < len; i++) {
								($$1[i]=$$1[i] || Method.build(self).flag('doc')).setData(items[i]).setIname(self.data().iname).end();
							};return $$1;
						})(),4).end()
					],2).end()
				) : void(0)
			],1).end()
		],1).synced();
	};
});

var Value = _T.defineTag('Value', function(tag){
	
	tag.prototype.render = function (){
		var data_, $1;
		if (this.data().type) {
			this.setFlag(-1,this.data().type).setChildren(
				this.data().value
			,3).synced();
		} else if ((typeof (data_ = this.data())=='string'||data_ instanceof String)) {
			this.flag('str').setText(this.data()).synced();
		} else if ((typeof ($1 = this.data())=='number'||$1 instanceof Number)) {
			this.flag('num').setText(this.data()).synced();
		};
		return this;
	};
});


var Param = _T.defineTag('Param', function(tag){
	
	tag.prototype.type = function (){
		return this.data().type;
	};
	
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return this.setFlag(-1,self.type()).setChildren([
			(self.type() == 'NamedParams') ? (
				(function() {
					var $$ = ($.A = $.A || []);
					for (let i = 0, items = iter$(self.data().nodes), len = $$.taglen = items.length; i < len; i++) {
						($$[i]=$$[i] || Param.build(self)).setData(items[i]).end();
					};return $$;
				})()
			) : Imba.static([
				($.B=$.B || _T.$('div',self).flag('name')).setContent(self.data().name,3).end(),
				self.data().defaults ? Imba.static([
					($.C=$.C || _T.$('i',self)).setContent([(self.type() == 'NamedParam') ? ': ' : ' = '],1).end(),
					($.D=$.D || Value.build(self)).setData(self.data().defaults).end()
				],2) : void(0)
			],3)
		],4).synced();
	};
});

var Method = _T.defineTag('Method', Item, function(tag){
	
	tag.prototype.iname = function(v){ return this._iname; }
	tag.prototype.setIname = function(v){ this._iname = v; return this; };
	tag.prototype.path = function(v){ return this._path; }
	tag.prototype.setPath = function(v){ this._path = v; return this; };
	
	tag.prototype.tags = function (){
		var t0;
		return (t0 = this._tags || _T.$('div',this).ref_('tags',this)).setContent([
			this.data().return ? ((t0.$.a=t0.$.a || Return.build(this).setName('returns')).setData(this.data().return).end()) : void(0),
			
			this.data().deprecated ? (
				(t0.$.b=t0.$.b || _T.$('div',this).flag('deprecated').flag('red').setText('Method is deprecated')).end()
			) : void(0),
			this.data().private ? (
				(t0.$.c=t0.$.c || _T.$('div',this).flag('private').flag('red').setText('Method is private')).end()
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
		var self = this, $ = self.$;
		return this.flag('deprecated',(this.data().deprecated)).setChildren([
			($.A=$.A || _T.$('span',this).flag('toc-anchor')).setId(this.slug()).end(),
			($.B=$.B || _T.$('div',self).flag('header')).setContent([
				($.C=$.C || Path.build(self)).setData(self.path()).end(),
				($.D=$.D || _T.$('div',self).flag('params')).setContent((function() {
					var $$ = ($.E = $.E || []);
					for (let i = 0, items = iter$(self.data().params), len = $$.taglen = items.length; i < len; i++) {
						($$[i]=$$[i] || Param.build(self)).setData(items[i]).end();
					};return $$;
				})(),4).end(),
				($.F=$.F || _T.$('div',self).flag('grow')).end()
			],2).end(),
			($.G=$.G || Desc.build(self).flag('md')).setHtml(self.data().html).end(),
			self.tags()
		],1).synced();
	};
});

var Link = _T.defineTag('Link', 'a', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		this.setHref(("/docs#" + pathToAnchor(this.data().namepath))).setChildren(($.A=$.A || Path.build(this)).setData(this.data().namepath).setShort(this.short()).end(),2).synced();
		return tag.__super__.render.apply(self,arguments);
	};
	
	tag.prototype.ontap = function (){
		tag.__super__.ontap.apply(this,arguments);
		return this.trigger('refocus');
	};
});

var Group = _T.defineTag('Group', function(tag){
	
	tag.prototype.ontap = function (){
		return this.toggleFlag('collapsed');
	};
});


var DocsPage = _T.defineTag('DocsPage', Page, function(tag){
	
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
		var t0, self = this, $ = self.$;
		if (!(this.docs())) { return this };
		
		return this.setChildren([
			(t0 = self._nav || _T.$('nav',this).ref_('nav',this)).setContent((t0.$.a=t0.$.a || _T.$('div',this).flag('content')).setContent(
				(function() {
					var t1, $$ = (t0.$.b = t0.$.b || []);
					for (let i = 0, items = iter$(self.roots()), len = $$.taglen = items.length, root; i < len; i++) {
						root = items[i];
						(t1 = $$[i]=$$[i] || Group.build(self).flag('toc').flag('class').flag('section').flag('compact')).setContent([
							(t1.$.a=t1.$.a || _T.$('div',self).flag('header')).setContent((t1.$.b=t1.$.b || Link.build(self).flag('class')).setData(root).end(),2).end(),
							(t1.$.c=t1.$.c || _T.$('div',self).flag('content')).setContent([
								(t1.$.d=t1.$.d || _T.$('div',self).flag('static')).setContent(
									(function() {
										var t2, $$ = (t1.$.e = t1.$.e || []);
										let res = [];
										for (let j = 0, ary = iter$(root['.']), len = ary.length, meth; j < len; j++) {
											meth = ary[j];
											if (!(meth.desc && !meth.private)) { continue; };
											res.push((t2 = $$[j]=$$[j] || _T.$('div',self).flag('entry')).setContent((t2.$.a=t2.$.a || Link.build(self).setShort(true)).setData(meth).end(),2).end());
										};
										return res;
									})()
								,3).end(),
								(t1.$.f=t1.$.f || _T.$('div',self).flag('instance')).setContent(
									(function() {
										var t2, $$ = (t1.$.g = t1.$.g || []);
										let res = [];
										for (let j = 0, ary = iter$(root['#']), len = ary.length, meth; j < len; j++) {
											meth = ary[j];
											if (!(meth.desc && !meth.private)) { continue; };
											res.push((t2 = $$[j]=$$[j] || _T.$('div',self).flag('entry')).setContent((t2.$.a=t2.$.a || Link.build(self).setShort(true)).setData(meth).end(),2).end());
										};
										return res;
									})()
								,3).end()
							],2).end()
						],2).end();
					};return $$;
				})()
			,4).end(),2).end(),
			($.A=$.A || _T.$('div',self).flag('body')).setContent(
				(function() {
					var $$1 = ($.B = $.B || []);
					for (let i = 0, items = iter$(self.roots()), len = $$1.taglen = items.length; i < len; i++) {
						($$1[i]=$$1[i] || Class.build(self).flag('doc').flag('l')).setData(items[i]).end();
					};return $$1;
				})()
			,4).end()
		],2).synced();
	};
})
exports.DocsPage = DocsPage;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzYzMjJkZjZjODgxMDM4YTc3ZWYiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2luZGV4LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2h0bWwuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vdG91Y2guaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQtbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9yZWNvbmNpbGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5pbWJhIiwid2VicGFjazovLy8uL3NyYy91dGlsL3JvdXRlci5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9TaXRlLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL0hvbWVQYWdlLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QjtBQUMvQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLDZCQUE2QjtBQUM5Qzs7QUFFQTtBQUNBLG1CQUFtQixnQkFBZ0I7QUFDbkM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0Msa0JBQWtCO0FBQ3BELHdCQUF3QjtBQUN4Qix3QkFBd0I7QUFDeEIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0EsOERBQThEO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLHNCQUFzQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQiw0QkFBNEI7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsVUFBVSxtQkFBbUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLENBQUM7QUFDRCxxQkFBcUIsZUFBZSxFQUFFO0FBQ3RDLENBQUM7QUFDRDtBQUNBOztBQUVBLENBQUM7QUFDRDtBQUNBLENBQUM7Ozs7Ozs7O0FDdnlDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7Ozs7O0FDcEJBO0tBQ0ssUUFBUSxFQUFFLE1BQU0sT0FBUSxLQUFNOzs7UUFHNUIsUUFBUSxFQUFFOztFQUVmLE1BQU0sRUFBRSxLQUFLLE1BQU0sS0FBSyxTQUFPLEVBQUU7RUFDakM7O0VBRUEsS0FBSyxFQUFFLE1BQU07RUFDYixNQUFNLFNBQVMsRUFBRSxNQUFNO0VBQ3ZCLE1BQU0sT0FBTyxFQUFFOzs7UUFFVDs7O2NBRUQ7O0NBRU47RUFDYTtNQUNSLE1BQU07TUFDTixNQUFNO01BQ04sTUFBTTs7RUFFVixhQUFlLEtBQUssSUFBSTt3QkFDdkIsTUFBTSxlQUFXO0dBQ2pCLE1BQU0sUUFBUSxlQUFXOzs7RUFFMUIsNEJBQVMsS0FBSyxVQUFVLEdBQUc7O0dBQzFCLE1BQU0sa0JBQWM7R0FDcEIsTUFBTSxLQUFLLGtCQUFjOzs7TUFFdEIsTUFBTTs7RUFFViw0QkFBUyxNQUFNOztHQUNkLE1BQU0sY0FBVTtHQUNoQixNQUFNLFNBQVMsY0FBVTs7O01BRXRCLFNBQVMsRUFBRSxRQUFRO01BQ25CLElBQUksS0FBSyxPQUFPO01BQ2hCLE1BQU0sRUFBRSxNQUFNLE9BQU8sRUFBRTs7RUFFM0IsY0FBVyxTQUFLO09BQ1gsTUFBTSxFQUFFO0dBQ1osTUFBTSxJQUFJO1VBQ0osTUFBTSxFQUFFO1FBQ1QsS0FBSyxHQUFHLFNBQVMsTUFBSSxHQUFHLElBQUksS0FBSyxNQUFNLE1BQU0sRUFBRSxLQUFLO0lBQ3hELElBQUc7S0FDRixNQUFNLEdBQUcsS0FBSztLQUNkLE1BQU0sSUFBSSxLQUFLOztLQUVmLE1BQU0sRUFBRTs7Ozs7RUFFWCxXQUFJLFVBQVUsVUFBVSxFQUFFLE1BQU07T0FDM0IsRUFBRSxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssUUFBUTtrREFDYixXQUFPLEVBQUUsR0FBRyxVQUFVO0tBQ3pELFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7a0NDdkROOztlQUVQOzs7Ozs7Q0FJQztjQUNDOzs7Q0FFRDtjQUNDLEtBQUssR0FBRyxZQUFLOzs7Q0FFZDtnQkFDRyxZQUFLLGlCQUFPLFdBQUk7OztDQUVuQjs7RUFDYSxLQUFPLFlBQUs7O01BRXBCLElBQUksRUFBRTs7Y0FFTCxZQUFJLGNBQU8sVUFBTyxJQUFJO0lBQ3ZCLElBQUksU0FBUyxPQUFPLEdBQUksSUFBSSxNQUFNLEVBQUU7Z0JBQ3RDLGlCQUFDO2lCQUNBLGdCQUFHLFFBQUsseUJBQU8sSUFBSTs7Z0JBQ3BCLGlCQUFDOzs7TUFDQSw4QkFBYSxJQUFJOzt1QkFFaEIsOEJBQVUsYUFBTSxPQUFJOzs7OztnQkFFdEIsZ0JBQUcsUUFBSyx5QkFBTyxJQUFJOzs7Ozs7WUFFdkI7Q0FDQzs7RUFDYSxLQUFPLCtCQUFNLFdBQU4sTUFBTTs7Y0FFcEIsV0FBSSxRQUFLLFlBQUs7OztDQUVwQjtFQUNDLElBQUcsS0FBSyxRQUFHO1FBQ1YsTUFBTSxFQUFFO0dBQ1IsV0FBSSxVQUFVLEVBQUU7Ozs7Ozs7aUJBR1o7O0NBRU47O0VBQ0MsUUFBUTtPQUNSLG1EQUFpQjtTQUNqQixPQUFPLCtCQUEwQixvQkFBbUI7Ozs7Q0FHckQ7U0FDQyxPQUFPLGtDQUE2QixvQkFBbUI7OztDQUV4RDtTQUNDLFdBQUksSUFBSSxjQUFPLE9BQUs7OztDQUVyQjtNQUNLLE1BQU0sRUFBRSxXQUFJO01BQ1o7O01BRUEsVUFBVSxFQUFFLE9BQU87TUFDbkIsR0FBRyxFQUFFLE9BQU87TUFDWixHQUFHLEVBQUUsU0FBUyxLQUFLOztFQUV2QixTQUFHLGNBQWMsR0FBRztPQUNmLEtBQUssRUFBRSxLQUFLLElBQUksVUFBVSxPQUFFO0dBQ3BCLElBQUcsS0FBSyxFQUFFO1FBQ3RCLGNBQWMsR0FBRzs7O01BRWQsYUFBYSxFQUFFLEdBQUcsR0FBRyxVQUFVLEVBQUU7O0VBRXJDLElBQUcsYUFBYSxHQUFHO0dBQ2xCLE1BQU0sRUFBRSxXQUFNLE9BQVUsRUFBRTs7R0FHMUIsNEJBQVk7O1FBQ1AsRUFBRSxHQUFHLEtBQUssVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUMzQixLQUFLLEVBQUUsVUFBVSxFQUFFOztJQUV2QixJQUFHLEtBQUssRUFBRTtLQUNILE1BQU0sRUFBRTs7Ozs7RUFFakIsSUFBRztHQUNGLFNBQUcsTUFBTSxHQUFHLE1BQU07U0FDakIsTUFBTSxFQUFFLE1BQU07SUFDZCxjQUFPLE9BQU8sT0FBRSxTQUFTO0lBQ3pCOzs7Ozs7O0NBSUg7O0VBQ0MsRUFBRTtPQUNGO01BQ0ksT0FBTzs7R0FDVixJQUFPLEdBQUcsRUFBRSxXQUFJLGtCQUFrQixFQUFFLGNBQU87SUFDMUMsR0FBRyxlQUFlO1NBQ2xCLGNBQWMsRUFBRSxPQUFPO1dBQ2hCOztVQUNEOzs7RUFFUixJQUFHLGNBQU87R0FDVDtHQUNBLFNBQVMsR0FBRyxXQUFXLE9BQU87Ozs7OztDQUloQzs7Y0FDTTtjQUNBLFFBQUo7c0JBQ0MsaUJBQUM7dUJBQ0EsOEJBQVUsV0FBSTt1QkFDZCw4QkFBVSxXQUFJOzs7ZUFDaEIsaUJBQUMsYUFBSztnQkFDTCwyQkFBTzs7Ozs7Ozs7Ozs7Ozs7a0NDbEhKOztBQUVQO2VBQ1EsRUFBRSxLQUFLLG1CQUFtQixvQkFBb0I7OztXQUV0RDs7Q0FFQztFQUNDLElBQUcsS0FBSyxRQUFHO0dBQ1YsV0FBSSxVQUFVLE9BQUUsTUFBTSxFQUFFOzs7Ozs7O1VBRzNCOztDQUVDOzs7OztXQUdEOztXQUVBOzs7O0NBR0M7TUFDSyxNQUFNO01BQ04sSUFBSSxFQUFFO0VBQ1YsWUFBRztHQUNGLElBQUc7SUFDRixJQUFJLEVBQUUsSUFBSTs7O1FBRVgsUUFBTyxJQUFJO0lBQ1YsSUFBRyxFQUFFLE9BQU8sR0FBRyxFQUFFO3FCQUNYO1dBQ04sSUFBSyxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUc7bUNBQ0U7O2dDQUVIOzs7Ozs7Ozs7YUFJckI7Ozs7Q0FHQzs7O2VBRUUsaUJBQWlCLHVCQUFYLFlBQUs7ZUFDWCxrQkFBSyx5QkFBTyxZQUFLOzs7OztZQUVwQjs7Ozs7Ozs7Ozs7Q0FJQzs7RUFDZSw4QkFBUzs7UUFBZSxFQUFFO1lBQTVCOztPQUFaOztFQUNjLDhCQUFTOztRQUFlLEVBQUU7YUFBNUI7O09BQVo7T0FDQSxZQUFZOzs7O0NBR2I7OztlQUVFLGtCQUFLLG9CQUFZLE1BQUcsYUFBYSxZQUFLO2VBQ3RDLGlCQUFDLHVDQUFTLGlCQUFDLHNDQUFRLDBCQUFNLFlBQUs7ZUFDOUIsa0JBQU0sUUFBSyxZQUFLO0dBQ2IsWUFBSztnQkFDUCxpQkFBQyxnQkFBUTtpQkFDUiw0QkFBUSxZQUFLLE1BQU0sU0FBTSxZQUFLLFNBQVM7Ozs7ZUFFekMsaUJBQUM7VUFDRyxTQUFTLE9BQU8sRUFBRTtpQkFDcEIsaUJBQUM7a0JBQ0EsZ0JBQUc7a0JBQ0gsaUJBQUMsZ0JBQVE7O09BQU8sbUNBQVk7d0JBQzNCLG1CQUFhLHFCQUFMLFVBQVUsU0FBTSxZQUFLOzs7Ozs7VUFFN0IsU0FBUyxPQUFPLEVBQUU7aUJBQ3BCLGlCQUFDO2tCQUNBLGdCQUFHO2tCQUNILGlCQUFDLGdCQUFROztPQUFPLG1DQUFZOzBCQUMzQixtQkFBYSxxQkFBTCxVQUFVLFNBQU0sWUFBSzs7Ozs7Ozs7OztZQUVwQzs7Q0FFQzs7RUFDQyxJQUFHLFlBQUs7bUJBQ0MsWUFBSztJQUNaLFlBQUs7O1NBQ1AsMEJBQUs7UUFDQyxZQUFLLFFBQUs7U0FDaEIsdUJBQUs7UUFDQyxZQUFLLFFBQUs7Ozs7Ozs7WUFJbEI7O0NBRUM7U0FDQyxZQUFLOzs7Q0FFTjs7eUJBQ1M7SUFDSixZQUFLOzs7S0FDUCw4QkFBYSxZQUFLO3NCQUNqQiwyQkFBTzs7OztnQkFFUixpQkFBQyx5QkFBTyxZQUFLO0lBQ1YsWUFBSztpQkFDUCw2QkFBSSxZQUFLO2lCQUNULDJCQUFPLFlBQUs7Ozs7Ozs7YUFFakI7Ozs7Ozs7Q0FLQzs7b0JBQ0ssU0FBSjtHQUN5QyxZQUFLLDRCQUE3QyxtQkFBcUIsNEJBQWIsWUFBSzs7R0FFVixZQUFLO3NCQUNQLGlCQUFDLG1CQUFXOztHQUNWLFlBQUs7c0JBQ1AsaUJBQUMsZ0JBQVE7Ozs7OztDQUdaO2NBQ0MsTUFBTSxJQUFJLGFBQU0sTUFBTSxFQUFFLFlBQUs7OztDQUU5QjtTQUNDLGFBQWEsWUFBSzs7O0NBRW5COztjQUNPLG1CQUFhLFlBQUs7ZUFDdkIsa0JBQUssb0JBQVksTUFBRztlQUNwQixpQkFBQztnQkFDQSwwQkFBTTtnQkFDTixpQkFBQzs7S0FBUyw4QkFBYSxZQUFLO3NCQUMzQiwyQkFBTzs7O2dCQUNSLGlCQUFDOztlQUNGLGlCQUFLLFlBQUksUUFBSyxZQUFLO0dBQ25COzs7OztXQUVIOzs7O0NBR0M7O09BQ08sb0JBQWEsYUFBYSxZQUFLLG9DQUFhLDBCQUFNLFlBQUssVUFBVSxTQUFNOzs7O0NBRzlFOztjQUVDOzs7O1lBRUY7O0NBRUM7Y0FDQzs7Ozs7ZUFHSzs7Ozs7Ozs7O0NBS047b0JBQ1E7OztDQUVSO2NBQ0M7OztDQUVEO0VBQ0M7Ozs7Q0FHRDtNQUNLLEtBQUssUUFBUSxXQUFJLE1BQU07RUFDM0IsS0FBSyxPQUFFLE1BQU0sRUFBRSxLQUFLLE1BQU0sS0FBSyxVQUFVO0VBQ3pDLE9BQU8sT0FBRSxNQUFNO0VBQ2Y7RUFDQTtVQUNDOzs7O0NBRUY7O0VBQ0M7RUFDQSxJQUFHLFNBQVMsU0FBUztHQUNwQixJQUFPLEdBQUcsRUFBRSxXQUFJLGNBQWMsU0FBUyxTQUFTO0lBQy9DLEdBQUc7Ozs7OztDQUdOO1NBQ0M7OztDQUVEOztFQUNDLElBQU8sR0FBRyxFQUFFLFdBQUksY0FBYyxTQUFTLFNBQVM7R0FDL0MsR0FBRzs7Ozs7Q0FHTDtTQUNDLFlBQUssU0FBUzs7O0NBRWY7T0FDQyxPQUFPO01BQ0gsS0FBSyxPQUFFLE1BQU07O0VBRWpCLGFBQXFCLFlBQUs7aUNBQ3pCLElBQUcsS0FBSyxLQUFLLFdBQVcsR0FBRyxLQUFLO0lBQy9CLFVBQVUsR0FBRyxVQUFVLE9BQU8sT0FBSyw0QkFBVyxLQUFLLFVBQVEsNEJBQVcsRUFBRSxLQUFLLFlBQVksR0FBSSxFQUFFO0lBQy9GLFVBQVUsR0FBRyxVQUFVLE9BQU8sT0FBSyw0QkFBVyxLQUFLLFVBQVEsNEJBQVcsRUFBRSxLQUFLLFlBQVksR0FBSSxFQUFFOztJQUU3RSxJQUFHLEtBQUssYUFBMUIsT0FBTyxLQUFLOzs7Ozs7Q0FHZjs7RUFDYSxNQUFPOzs7Y0FHZCxRQUFKLGdFQUFVLGlCQUFDOzs7S0FDViw4QkFBWTs7MkJBQ1gsa0JBQU0sWUFBSSxjQUFNLGdCQUFRO3lCQUN2QixpQkFBQyw2Q0FBUyxpQkFBVyx1QkFBTDt5QkFDaEIsaUJBQUM7MEJBQ0EsaUJBQUM7Ozs7VUFDQSw0QkFBWTs7aUJBQWUsS0FBSyxLQUFLLElBQUssS0FBSzt5Q0FDOUMsaUJBQUMsNENBQVEsaUJBQVksU0FBTSxlQUFaOzs7OzswQkFDakIsaUJBQUM7Ozs7VUFDQSw0QkFBWTs7aUJBQWUsS0FBSyxLQUFLLElBQUssS0FBSzt5Q0FDOUMsaUJBQUMsNENBQVEsaUJBQVksU0FBTSxlQUFaOzs7Ozs7Ozs7O2VBQ3JCLGlCQUFDOzs7S0FDQSw4QkFBWTt3QkFDWCxrQkFBWSxZQUFJLG1CQUFUOzs7Ozs7Ozs7Ozs7OztBQ25PWix5QyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMzYzMjJkZjZjODgxMDM4YTc3ZWYiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUgXCIuL3NyYy9pbWJhL2luZGV4LmltYmFcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL2ltYmEuaW1iYSIsIiMjI1xuSW1iYSBpcyB0aGUgbmFtZXNwYWNlIGZvciBhbGwgcnVudGltZSByZWxhdGVkIHV0aWxpdGllc1xuQG5hbWVzcGFjZVxuIyMjXG52YXIgSW1iYSA9IHtWRVJTSU9OOiAnMS4zLjAtYmV0YS42J31cblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRUaW1lb3V0IHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgdGhlIHRpbWVvdXQgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0VGltZW91dCBkZWxheSwgJmJsb2NrXG5cdHNldFRpbWVvdXQoJixkZWxheSkgZG9cblx0XHRibG9jaygpXG5cdFx0SW1iYS5jb21taXRcblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRJbnRlcnZhbCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIGV2ZXJ5IGludGVydmFsIHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldEludGVydmFsIGludGVydmFsLCAmYmxvY2tcblx0c2V0SW50ZXJ2YWwoYmxvY2ssaW50ZXJ2YWwpXG5cbiMjI1xuQ2xlYXIgaW50ZXJ2YWwgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJJbnRlcnZhbCBpZFxuXHRjbGVhckludGVydmFsKGlkKVxuXG4jIyNcbkNsZWFyIHRpbWVvdXQgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJUaW1lb3V0IGlkXG5cdGNsZWFyVGltZW91dChpZClcblxuXG5kZWYgSW1iYS5zdWJjbGFzcyBvYmosIHN1cFxuXHRmb3Igayx2IG9mIHN1cFxuXHRcdG9ialtrXSA9IHYgaWYgc3VwLmhhc093blByb3BlcnR5KGspXG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmluaXRpYWxpemUgPSBvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHJldHVybiBvYmpcblxuIyMjXG5MaWdodHdlaWdodCBtZXRob2QgZm9yIG1ha2luZyBhbiBvYmplY3QgaXRlcmFibGUgaW4gaW1iYXMgZm9yL2luIGxvb3BzLlxuSWYgdGhlIGNvbXBpbGVyIGNhbm5vdCBzYXkgZm9yIGNlcnRhaW4gdGhhdCBhIHRhcmdldCBpbiBhIGZvciBsb29wIGlzIGFuXG5hcnJheSwgaXQgd2lsbCBjYWNoZSB0aGUgaXRlcmFibGUgdmVyc2lvbiBiZWZvcmUgbG9vcGluZy5cblxuYGBgaW1iYVxuIyB0aGlzIGlzIHRoZSB3aG9sZSBtZXRob2RcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG5jbGFzcyBDdXN0b21JdGVyYWJsZVxuXHRkZWYgdG9BcnJheVxuXHRcdFsxLDIsM11cblxuIyB3aWxsIHJldHVybiBbMiw0LDZdXG5mb3IgeCBpbiBDdXN0b21JdGVyYWJsZS5uZXdcblx0eCAqIDJcblxuYGBgXG4jIyNcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG4jIyNcbkNvZXJjZXMgYSB2YWx1ZSBpbnRvIGEgcHJvbWlzZS4gSWYgdmFsdWUgaXMgYXJyYXkgaXQgd2lsbFxuY2FsbCBgUHJvbWlzZS5hbGwodmFsdWUpYCwgb3IgaWYgaXQgaXMgbm90IGEgcHJvbWlzZSBpdCB3aWxsXG53cmFwIHRoZSB2YWx1ZSBpbiBgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKWAuIFVzZWQgZm9yIGV4cGVyaW1lbnRhbFxuYXdhaXQgc3ludGF4LlxuQHJldHVybiB7UHJvbWlzZX1cbiMjI1xuZGVmIEltYmEuYXdhaXQgdmFsdWVcblx0aWYgdmFsdWUgaXNhIEFycmF5XG5cdFx0Y29uc29sZS53YXJuKFwiYXdhaXQgKEFycmF5KSBpcyBkZXByZWNhdGVkIC0gdXNlIGF3YWl0IFByb21pc2UuYWxsKEFycmF5KVwiKVxuXHRcdFByb21pc2UuYWxsKHZhbHVlKVxuXHRlbGlmIHZhbHVlIGFuZCB2YWx1ZTp0aGVuXG5cdFx0dmFsdWVcblx0ZWxzZVxuXHRcdFByb21pc2UucmVzb2x2ZSh2YWx1ZSlcblxudmFyIGRhc2hSZWdleCA9IC8tLi9nXG52YXIgc2V0dGVyQ2FjaGUgPSB7fVxuXG5kZWYgSW1iYS50b0NhbWVsQ2FzZSBzdHJcblx0aWYgc3RyLmluZGV4T2YoJy0nKSA+PSAwXG5cdFx0c3RyLnJlcGxhY2UoZGFzaFJlZ2V4KSBkbyB8bXwgbS5jaGFyQXQoMSkudG9VcHBlckNhc2Vcblx0ZWxzZVxuXHRcdHN0clxuXHRcdFxuZGVmIEltYmEudG9TZXR0ZXIgc3RyXG5cdHNldHRlckNhY2hlW3N0cl0gfHw9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgc3RyKVxuXG5kZWYgSW1iYS5pbmRleE9mIGEsYlxuXHRyZXR1cm4gKGIgJiYgYjppbmRleE9mKSA/IGIuaW5kZXhPZihhKSA6IFtdOmluZGV4T2YuY2FsbChhLGIpXG5cbmRlZiBJbWJhLmxlbiBhXG5cdHJldHVybiBhICYmIChhOmxlbiBpc2EgRnVuY3Rpb24gPyBhOmxlbi5jYWxsKGEpIDogYTpsZW5ndGgpIG9yIDBcblxuZGVmIEltYmEucHJvcCBzY29wZSwgbmFtZSwgb3B0c1xuXHRpZiBzY29wZTpkZWZpbmVQcm9wZXJ0eVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVQcm9wZXJ0eShuYW1lLG9wdHMpXG5cdHJldHVyblxuXG5kZWYgSW1iYS5hdHRyIHNjb3BlLCBuYW1lLCBvcHRzID0ge31cblx0aWYgc2NvcGU6ZGVmaW5lQXR0cmlidXRlXG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZUF0dHJpYnV0ZShuYW1lLG9wdHMpXG5cblx0bGV0IGdldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKG5hbWUpXG5cdGxldCBzZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBuYW1lKVxuXHRsZXQgcHJvdG8gPSBzY29wZTpwcm90b3R5cGVcblxuXHRpZiBvcHRzOmRvbVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5kb21bbmFtZV1cblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdGlmIHZhbHVlICE9IHRoaXNbbmFtZV0oKVxuXHRcdFx0XHR0aGlzLmRvbVtuYW1lXSA9IHZhbHVlXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRlbHNlXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRcdHJldHVybiB0aGlzXG5cdHJldHVyblxuXG5kZWYgSW1iYS5wcm9wRGlkU2V0IG9iamVjdCwgcHJvcGVydHksIHZhbCwgcHJldlxuXHRsZXQgZm4gPSBwcm9wZXJ0eTp3YXRjaFxuXHRpZiBmbiBpc2EgRnVuY3Rpb25cblx0XHRmbi5jYWxsKG9iamVjdCx2YWwscHJldixwcm9wZXJ0eSlcblx0ZWxpZiBmbiBpc2EgU3RyaW5nIGFuZCBvYmplY3RbZm5dXG5cdFx0b2JqZWN0W2ZuXSh2YWwscHJldixwcm9wZXJ0eSlcblx0cmV0dXJuXG5cblxuIyBCYXNpYyBldmVudHNcbmRlZiBlbWl0X18gZXZlbnQsIGFyZ3MsIG5vZGVcblx0IyB2YXIgbm9kZSA9IGNic1tldmVudF1cblx0dmFyIHByZXYsIGNiLCByZXRcblxuXHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRpZiBjYiA9IG5vZGU6bGlzdGVuZXJcblx0XHRcdGlmIG5vZGU6cGF0aCBhbmQgY2Jbbm9kZTpwYXRoXVxuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2Jbbm9kZTpwYXRoXS5hcHBseShjYixhcmdzKSA6IGNiW25vZGU6cGF0aF0oKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIGNoZWNrIGlmIGl0IGlzIGEgbWV0aG9kP1xuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2IuYXBwbHkobm9kZSwgYXJncykgOiBjYi5jYWxsKG5vZGUpXG5cblx0XHRpZiBub2RlOnRpbWVzICYmIC0tbm9kZTp0aW1lcyA8PSAwXG5cdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdHJldHVyblxuXG4jIG1ldGhvZCBmb3IgcmVnaXN0ZXJpbmcgYSBsaXN0ZW5lciBvbiBvYmplY3RcbmRlZiBJbWJhLmxpc3RlbiBvYmosIGV2ZW50LCBsaXN0ZW5lciwgcGF0aFxuXHR2YXIgY2JzLCBsaXN0LCB0YWlsXG5cdGNicyA9IG9iajpfX2xpc3RlbmVyc19fIHx8PSB7fVxuXHRsaXN0ID0gY2JzW2V2ZW50XSB8fD0ge31cblx0dGFpbCA9IGxpc3Q6dGFpbCB8fCAobGlzdDp0YWlsID0gKGxpc3Q6bmV4dCA9IHt9KSlcblx0dGFpbDpsaXN0ZW5lciA9IGxpc3RlbmVyXG5cdHRhaWw6cGF0aCA9IHBhdGhcblx0bGlzdDp0YWlsID0gdGFpbDpuZXh0ID0ge31cblx0cmV0dXJuIHRhaWxcblxuIyByZWdpc3RlciBhIGxpc3RlbmVyIG9uY2VcbmRlZiBJbWJhLm9uY2Ugb2JqLCBldmVudCwgbGlzdGVuZXJcblx0dmFyIHRhaWwgPSBJbWJhLmxpc3RlbihvYmosZXZlbnQsbGlzdGVuZXIpXG5cdHRhaWw6dGltZXMgPSAxXG5cdHJldHVybiB0YWlsXG5cbiMgcmVtb3ZlIGEgbGlzdGVuZXJcbmRlZiBJbWJhLnVubGlzdGVuIG9iaiwgZXZlbnQsIGNiLCBtZXRoXG5cdHZhciBub2RlLCBwcmV2XG5cdHZhciBtZXRhID0gb2JqOl9fbGlzdGVuZXJzX19cblx0cmV0dXJuIHVubGVzcyBtZXRhXG5cblx0aWYgbm9kZSA9IG1ldGFbZXZlbnRdXG5cdFx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0XHRpZiBub2RlID09IGNiIHx8IG5vZGU6bGlzdGVuZXIgPT0gY2Jcblx0XHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRcdCMgY2hlY2sgZm9yIGNvcnJlY3QgcGF0aCBhcyB3ZWxsP1xuXHRcdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRcdFx0XHRicmVha1xuXHRyZXR1cm5cblxuIyBlbWl0IGV2ZW50XG5kZWYgSW1iYS5lbWl0IG9iaiwgZXZlbnQsIHBhcmFtc1xuXHRpZiB2YXIgY2IgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRcdGVtaXRfXyhldmVudCxwYXJhbXMsY2JbZXZlbnRdKSBpZiBjYltldmVudF1cblx0XHRlbWl0X18oZXZlbnQsW2V2ZW50LHBhcmFtc10sY2I6YWxsKSBpZiBjYjphbGwgIyBhbmQgZXZlbnQgIT0gJ2FsbCdcblx0cmV0dXJuXG5cbmRlZiBJbWJhLm9ic2VydmVQcm9wZXJ0eSBvYnNlcnZlciwga2V5LCB0cmlnZ2VyLCB0YXJnZXQsIHByZXZcblx0aWYgcHJldiBhbmQgdHlwZW9mIHByZXYgPT0gJ29iamVjdCdcblx0XHRJbWJhLnVubGlzdGVuKHByZXYsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0aWYgdGFyZ2V0IGFuZCB0eXBlb2YgdGFyZ2V0ID09ICdvYmplY3QnXG5cdFx0SW1iYS5saXN0ZW4odGFyZ2V0LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdHNlbGZcblxubW9kdWxlOmV4cG9ydHMgPSBJbWJhXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbWJhLmltYmEiLCJleHBvcnQgdGFnIFBhZ2VcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlBvaW50ZXJcblx0XG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGJ1dHRvbiA9IC0xXG5cdFx0QGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBidXR0b25cblx0XHRAYnV0dG9uXG5cblx0ZGVmIHRvdWNoXG5cdFx0QHRvdWNoXG5cblx0ZGVmIHVwZGF0ZSBlXG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBkaXJ0eSA9IHllc1xuXHRcdHNlbGZcblxuXHQjIHRoaXMgaXMganVzdCBmb3IgcmVndWxhciBtb3VzZSBub3dcblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgZTEgPSBAZXZlbnRcblxuXHRcdGlmIEBkaXJ0eVxuXHRcdFx0QHByZXZFdmVudCA9IGUxXG5cdFx0XHRAZGlydHkgPSBub1xuXG5cdFx0XHQjIGJ1dHRvbiBzaG91bGQgb25seSBjaGFuZ2Ugb24gbW91c2Vkb3duIGV0Y1xuXHRcdFx0aWYgZTE6dHlwZSA9PSAnbW91c2Vkb3duJ1xuXHRcdFx0XHRAYnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0aWYgKEB0b3VjaCBhbmQgQGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHRAdG91Y2guY2FuY2VsIGlmIEB0b3VjaFxuXHRcdFx0XHRAdG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHRAdG91Y2gubW91c2Vkb3duKGUxLGUxKVxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNlbW92ZSdcblx0XHRcdFx0QHRvdWNoLm1vdXNlbW92ZShlMSxlMSkgaWYgQHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0QGJ1dHRvbiA9IC0xXG5cblx0XHRcdFx0aWYgQHRvdWNoIGFuZCBAdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdEB0b3VjaC5tb3VzZXVwKGUxLGUxKVxuXHRcdFx0XHRcdEB0b3VjaCA9IG51bGxcblx0XHRcdFx0IyB0cmlnZ2VyIHBvaW50ZXJ1cFxuXHRcdGVsaWYgQHRvdWNoXG5cdFx0XHRAdG91Y2guaWRsZVxuXHRcdHNlbGZcblxuXHRkZWYgeCBkbyBAZXZlbnQ6eFxuXHRkZWYgeSBkbyBAZXZlbnQ6eVxuXHRcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcG9pbnRlci5pbWJhIiwiXG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJ1xuaW1wb3J0IFNpdGUgZnJvbSAnLi92aWV3cy9TaXRlJ1xuZG9jdW1lbnQ6Ym9keTppbm5lckhUTUwgPSAnJyBcbkltYmEubW91bnQgPFNpdGVbQXBwLmRlc2VyaWFsaXplKEFQUENBQ0hFKV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NsaWVudC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG52YXIgYWN0aXZhdGUgPSBub1xuaWYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0aWYgd2luZG93LkltYmFcblx0XHRjb25zb2xlLndhcm4gXCJJbWJhIHZ7d2luZG93LkltYmEuVkVSU0lPTn0gaXMgYWxyZWFkeSBsb2FkZWQuXCJcblx0XHRJbWJhID0gd2luZG93LkltYmFcblx0ZWxzZVxuXHRcdHdpbmRvdy5JbWJhID0gSW1iYVxuXHRcdGFjdGl2YXRlID0geWVzXG5cdFx0aWYgd2luZG93OmRlZmluZSBhbmQgd2luZG93OmRlZmluZTphbWRcblx0XHRcdHdpbmRvdy5kZWZpbmUoXCJpbWJhXCIsW10pIGRvIHJldHVybiBJbWJhXG5cbm1vZHVsZS5leHBvcnRzID0gSW1iYVxuXG51bmxlc3MgJHdlYndvcmtlciRcblx0cmVxdWlyZSAnLi9zY2hlZHVsZXInXG5cdHJlcXVpcmUgJy4vZG9tL2luZGV4J1xuXG5pZiAkd2ViJCBhbmQgYWN0aXZhdGVcblx0SW1iYS5FdmVudE1hbmFnZXIuYWN0aXZhdGVcblx0XG5pZiAkbm9kZSRcblx0dW5sZXNzICR3ZWJwYWNrJFxuXHRcdHJlcXVpcmUgJy4uLy4uL3JlZ2lzdGVyLmpzJ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxuXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICMgdmVyeSBzaW1wbGUgcmFmIHBvbHlmaWxsXG52YXIgY2FuY2VsQW5pbWF0aW9uRnJhbWVcblxuaWYgJG5vZGUkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZG8gfGlkfCBjbGVhclRpbWVvdXQoaWQpXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuaWYgJHdlYiRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6Y2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Om1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93OnJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6bW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5jbGFzcyBUaWNrZXJcblxuXHRwcm9wIHN0YWdlXG5cdHByb3AgcXVldWVcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gLTFcblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGlja2VyID0gZG8gfGV8XG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRcdHRpY2soZSlcblx0XHRzZWxmXG5cblx0ZGVmIGFkZCBpdGVtLCBmb3JjZVxuXHRcdGlmIGZvcmNlIG9yIEBxdWV1ZS5pbmRleE9mKGl0ZW0pID09IC0xXG5cdFx0XHRAcXVldWUucHVzaChpdGVtKVxuXG5cdFx0c2NoZWR1bGUgdW5sZXNzIEBzY2hlZHVsZWRcblxuXHRkZWYgdGljayB0aW1lc3RhbXBcblx0XHR2YXIgaXRlbXMgPSBAcXVldWVcblx0XHRAdHMgPSB0aW1lc3RhbXAgdW5sZXNzIEB0c1xuXHRcdEBkdCA9IHRpbWVzdGFtcCAtIEB0c1xuXHRcdEB0cyA9IHRpbWVzdGFtcFxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gMVxuXHRcdGJlZm9yZVxuXHRcdGlmIGl0ZW1zOmxlbmd0aFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBpdGVtc1xuXHRcdFx0XHRpZiBpdGVtIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdGl0ZW0oQGR0LHNlbGYpXG5cdFx0XHRcdGVsaWYgaXRlbTp0aWNrXG5cdFx0XHRcdFx0aXRlbS50aWNrKEBkdCxzZWxmKVxuXHRcdEBzdGFnZSA9IDJcblx0XHRhZnRlclxuXHRcdEBzdGFnZSA9IEBzY2hlZHVsZWQgPyAwIDogLTFcblx0XHRzZWxmXG5cblx0ZGVmIHNjaGVkdWxlXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdGlmIEBzdGFnZSA9PSAtMVxuXHRcdFx0XHRAc3RhZ2UgPSAwXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoQHRpY2tlcilcblx0XHRzZWxmXG5cblx0ZGVmIGJlZm9yZVxuXHRcdHNlbGZcblxuXHRkZWYgYWZ0ZXJcblx0XHRpZiBJbWJhLlRhZ01hbmFnZXJcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5JbWJhLlRJQ0tFUiA9IFRpY2tlci5uZXdcbkltYmEuU0NIRURVTEVSUyA9IFtdXG5cbmRlZiBJbWJhLnRpY2tlclxuXHRJbWJhLlRJQ0tFUlxuXG5kZWYgSW1iYS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgY2FsbGJhY2tcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKVxuXG5kZWYgSW1iYS5jYW5jZWxBbmltYXRpb25GcmFtZSBpZFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZShpZClcblxuIyBzaG91bGQgYWRkIGFuIEltYmEucnVuIC8gc2V0SW1tZWRpYXRlIHRoYXRcbiMgcHVzaGVzIGxpc3RlbmVyIG9udG8gdGhlIHRpY2stcXVldWUgd2l0aCB0aW1lcyAtIG9uY2VcblxudmFyIGNvbW1pdFF1ZXVlID0gMFxuXG5kZWYgSW1iYS5jb21taXQgcGFyYW1zXG5cdGNvbW1pdFF1ZXVlKytcblx0IyBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRJbWJhLmVtaXQoSW1iYSwnY29tbWl0JyxwYXJhbXMgIT0gdW5kZWZpbmVkID8gW3BhcmFtc10gOiB1bmRlZmluZWQpXG5cdGlmIC0tY29tbWl0UXVldWUgPT0gMFxuXHRcdEltYmEuVGFnTWFuYWdlciBhbmQgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0cmV0dXJuXG5cbiMjI1xuXG5JbnN0YW5jZXMgb2YgSW1iYS5TY2hlZHVsZXIgbWFuYWdlcyB3aGVuIHRvIGNhbGwgYHRpY2soKWAgb24gdGhlaXIgdGFyZ2V0LFxuYXQgYSBzcGVjaWZpZWQgZnJhbWVyYXRlIG9yIHdoZW4gY2VydGFpbiBldmVudHMgb2NjdXIuIFJvb3Qtbm9kZXMgaW4geW91clxuYXBwbGljYXRpb25zIHdpbGwgdXN1YWxseSBoYXZlIGEgc2NoZWR1bGVyIHRvIG1ha2Ugc3VyZSB0aGV5IHJlcmVuZGVyIHdoZW5cbnNvbWV0aGluZyBjaGFuZ2VzLiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIG1ha2UgaW5uZXIgY29tcG9uZW50cyB1c2UgdGhlaXJcbm93biBzY2hlZHVsZXJzIHRvIGNvbnRyb2wgd2hlbiB0aGV5IHJlbmRlci5cblxuQGluYW1lIHNjaGVkdWxlclxuXG4jIyNcbmNsYXNzIEltYmEuU2NoZWR1bGVyXG5cdFxuXHR2YXIgY291bnRlciA9IDBcblxuXHRkZWYgc2VsZi5ldmVudCBlXG5cdFx0SW1iYS5lbWl0KEltYmEsJ2V2ZW50JyxlKVxuXG5cdCMjI1xuXHRDcmVhdGUgYSBuZXcgSW1iYS5TY2hlZHVsZXIgZm9yIHNwZWNpZmllZCB0YXJnZXRcblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSB0YXJnZXRcblx0XHRAaWQgPSBjb3VudGVyKytcblx0XHRAdGFyZ2V0ID0gdGFyZ2V0XG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0QG1hcmtlciA9IGRvIG1hcmtcblx0XHRAdGlja2VyID0gZG8gfGV8IHRpY2soZSlcblxuXHRcdEBkdCA9IDBcblx0XHRAZnJhbWUgPSB7fVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aW1lc3RhbXAgPSAwXG5cdFx0QHRpY2tzID0gMFxuXHRcdEBmbHVzaGVzID0gMFxuXG5cdFx0c2VsZjpvbmV2ZW50ID0gc2VsZjpvbmV2ZW50LmJpbmQoc2VsZilcblx0XHRzZWxmXG5cblx0cHJvcCByYWYgd2F0Y2g6IHllc1xuXHRwcm9wIGludGVydmFsIHdhdGNoOiB5ZXNcblx0cHJvcCBldmVudHMgd2F0Y2g6IHllc1xuXHRwcm9wIG1hcmtlZFxuXG5cdGRlZiByYWZEaWRTZXQgYm9vbFxuXHRcdHJlcXVlc3RUaWNrIGlmIGJvb2wgYW5kIEBhY3RpdmVcblx0XHRzZWxmXG5cblx0ZGVmIGludGVydmFsRGlkU2V0IHRpbWVcblx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdGlmIHRpbWUgYW5kIEBhY3RpdmVcblx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksdGltZSlcblx0XHRzZWxmXG5cblx0ZGVmIGV2ZW50c0RpZFNldCBuZXcsIHByZXZcblx0XHRpZiBAYWN0aXZlIGFuZCBuZXcgYW5kICFwcmV2XG5cdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdGVsaWYgIW5ldyBhbmQgcHJldlxuXHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIHRoZSBjdXJyZW50IHNjaGVkdWxlciBpcyBhY3RpdmUgb3Igbm90XG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgYWN0aXZlXG5cdFx0QGFjdGl2ZVxuXG5cdCMjI1xuXHREZWx0YSB0aW1lIGJldHdlZW4gdGhlIHR3byBsYXN0IHRpY2tzXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkdFxuXHRcdEBkdFxuXG5cdCMjI1xuXHRDb25maWd1cmUgdGhlIHNjaGVkdWxlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbmZpZ3VyZSBvcHRpb25zID0ge31cblx0XHRyYWYgPSBvcHRpb25zOnJhZiBpZiBvcHRpb25zOnJhZiAhPSB1bmRlZmluZWRcblx0XHRpbnRlcnZhbCA9IG9wdGlvbnM6aW50ZXJ2YWwgaWYgb3B0aW9uczppbnRlcnZhbCAhPSB1bmRlZmluZWRcblx0XHRldmVudHMgPSBvcHRpb25zOmV2ZW50cyBpZiBvcHRpb25zOmV2ZW50cyAhPSB1bmRlZmluZWRcblx0XHRzZWxmXG5cblx0IyMjXG5cdE1hcmsgdGhlIHNjaGVkdWxlciBhcyBkaXJ0eS4gVGhpcyB3aWxsIG1ha2Ugc3VyZSB0aGF0XG5cdHRoZSBzY2hlZHVsZXIgY2FsbHMgYHRhcmdldC50aWNrYCBvbiB0aGUgbmV4dCBmcmFtZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG1hcmtcblx0XHRAbWFya2VkID0geWVzXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnN0YW50bHkgdHJpZ2dlciB0YXJnZXQudGljayBhbmQgbWFyayBzY2hlZHVsZXIgYXMgY2xlYW4gKG5vdCBkaXJ0eS9tYXJrZWQpLlxuXHRUaGlzIGlzIGNhbGxlZCBpbXBsaWNpdGx5IGZyb20gdGljaywgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCBtYW51YWxseSBpZiB5b3Vcblx0cmVhbGx5IHdhbnQgdG8gZm9yY2UgYSB0aWNrIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIG5leHQgZnJhbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmx1c2hcblx0XHRAZmx1c2hlcysrXG5cdFx0QHRhcmdldC50aWNrKHNlbGYpXG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAZml4bWUgdGhpcyBleHBlY3RzIHJhZiB0byBydW4gYXQgNjAgZnBzIFxuXG5cdENhbGxlZCBhdXRvbWF0aWNhbGx5IG9uIGV2ZXJ5IGZyYW1lIHdoaWxlIHRoZSBzY2hlZHVsZXIgaXMgYWN0aXZlLlxuXHRJdCB3aWxsIG9ubHkgY2FsbCBgdGFyZ2V0LnRpY2tgIGlmIHRoZSBzY2hlZHVsZXIgaXMgbWFya2VkIGRpcnR5LFxuXHRvciB3aGVuIGFjY29yZGluZyB0byBAZnBzIHNldHRpbmcuXG5cblx0SWYgeW91IGhhdmUgc2V0IHVwIGEgc2NoZWR1bGVyIHdpdGggYW4gZnBzIG9mIDEsIHRpY2sgd2lsbCBzdGlsbCBiZVxuXHRjYWxsZWQgZXZlcnkgZnJhbWUsIGJ1dCBgdGFyZ2V0LnRpY2tgIHdpbGwgb25seSBiZSBjYWxsZWQgb25jZSBldmVyeVxuXHRzZWNvbmQsIGFuZCBpdCB3aWxsICptYWtlIHN1cmUqIGVhY2ggYHRhcmdldC50aWNrYCBoYXBwZW5zIGluIHNlcGFyYXRlXG5cdHNlY29uZHMgYWNjb3JkaW5nIHRvIERhdGUuIFNvIGlmIHlvdSBoYXZlIGEgbm9kZSB0aGF0IHJlbmRlcnMgYSBjbG9ja1xuXHRiYXNlZCBvbiBEYXRlLm5vdyAob3Igc29tZXRoaW5nIHNpbWlsYXIpLCB5b3UgY2FuIHNjaGVkdWxlIGl0IHdpdGggMWZwcyxcblx0bmV2ZXIgbmVlZGluZyB0byB3b3JyeSBhYm91dCB0d28gdGlja3MgaGFwcGVuaW5nIHdpdGhpbiB0aGUgc2FtZSBzZWNvbmQuXG5cdFRoZSBzYW1lIGdvZXMgZm9yIDRmcHMsIDEwZnBzIGV0Yy5cblxuXHRAcHJvdGVjdGVkXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdGljayBkZWx0YSwgdGlja2VyXG5cdFx0QHRpY2tzKytcblx0XHRAZHQgPSBkZWx0YVxuXG5cdFx0aWYgdGlja2VyXG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblxuXHRcdGZsdXNoXG5cblx0XHRpZiBAcmFmIGFuZCBAYWN0aXZlXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHRkZWYgcmVxdWVzdFRpY2tcblx0XHR1bmxlc3MgQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0SW1iYS5USUNLRVIuYWRkKHNlbGYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdGFydCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGFjdGl2ZS5cblx0KipXaGlsZSBhY3RpdmUqKiwgdGhlIHNjaGVkdWxlciB3aWxsIG92ZXJyaWRlIGB0YXJnZXQuY29tbWl0YFxuXHR0byBkbyBub3RoaW5nLiBCeSBkZWZhdWx0IEltYmEudGFnI2NvbW1pdCBjYWxscyByZW5kZXIsIHNvXG5cdHRoYXQgcmVuZGVyaW5nIGlzIGNhc2NhZGVkIHRocm91Z2ggdG8gY2hpbGRyZW4gd2hlbiByZW5kZXJpbmdcblx0YSBub2RlLiBXaGVuIGEgc2NoZWR1bGVyIGlzIGFjdGl2ZSAoZm9yIGEgbm9kZSksIEltYmEgZGlzYWJsZXNcblx0dGhpcyBhdXRvbWF0aWMgcmVuZGVyaW5nLlxuXHQjIyNcblx0ZGVmIGFjdGl2YXRlIGltbWVkaWF0ZSA9IHllc1xuXHRcdHVubGVzcyBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0geWVzXG5cdFx0XHRAY29tbWl0ID0gQHRhcmdldDpjb21taXRcblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gZG8gdGhpc1xuXHRcdFx0QHRhcmdldD8uZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0XHRJbWJhLlNDSEVEVUxFUlMucHVzaChzZWxmKVxuXHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGludGVydmFsIGFuZCAhQGludGVydmFsSWRcblx0XHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSxAaW50ZXJ2YWwpXG5cblx0XHRcdGlmIGltbWVkaWF0ZVxuXHRcdFx0XHR0aWNrKDApXG5cdFx0XHRlbGlmIEByYWZcblx0XHRcdFx0cmVxdWVzdFRpY2tcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRTdG9wIHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgYWN0aXZlLlxuXHQjIyNcblx0ZGVmIGRlYWN0aXZhdGVcblx0XHRpZiBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0gbm9cblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gQGNvbW1pdFxuXHRcdFx0bGV0IGlkeCA9IEltYmEuU0NIRURVTEVSUy5pbmRleE9mKHNlbGYpXG5cdFx0XHRpZiBpZHggPj0gMFxuXHRcdFx0XHRJbWJhLlNDSEVEVUxFUlMuc3BsaWNlKGlkeCwxKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdFx0XHRpZiBAaW50ZXJ2YWxJZFxuXHRcdFx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRcdFxuXHRcdFx0QHRhcmdldD8udW5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB0cmFja1xuXHRcdEBtYXJrZXJcblx0XHRcblx0ZGVmIG9uaW50ZXJ2YWxcblx0XHR0aWNrXG5cdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cblx0ZGVmIG9uZXZlbnQgZXZlbnRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGV2ZW50cyBvciBAbWFya2VkXG5cblx0XHRpZiBAZXZlbnRzIGlzYSBGdW5jdGlvblxuXHRcdFx0bWFyayBpZiBAZXZlbnRzKGV2ZW50LHNlbGYpXG5cdFx0ZWxpZiBAZXZlbnRzIGlzYSBBcnJheVxuXHRcdFx0aWYgQGV2ZW50cy5pbmRleE9mKChldmVudCBhbmQgZXZlbnQ6dHlwZSkgb3IgZXZlbnQpID49IDBcblx0XHRcdFx0bWFya1xuXHRcdGVsc2Vcblx0XHRcdG1hcmtcblx0XHRzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxucmVxdWlyZSAnLi9tYW5hZ2VyJ1xuXG5JbWJhLlRhZ01hbmFnZXIgPSBJbWJhLlRhZ01hbmFnZXJDbGFzcy5uZXdcblxucmVxdWlyZSAnLi90YWcnXG5yZXF1aXJlICcuL2h0bWwnXG5yZXF1aXJlICcuL3BvaW50ZXInXG5yZXF1aXJlICcuL3RvdWNoJ1xucmVxdWlyZSAnLi9ldmVudCdcbnJlcXVpcmUgJy4vZXZlbnQtbWFuYWdlcidcblxuaWYgJHdlYiRcblx0cmVxdWlyZSAnLi9yZWNvbmNpbGVyJ1xuXG5pZiAkbm9kZSRcblx0cmVxdWlyZSAnLi9zZXJ2ZXInXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuVGFnTWFuYWdlckNsYXNzXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0QG1vdW50ZWQgPSBbXVxuXHRcdEBoYXNNb3VudGFibGVzID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIG1vdW50ZWRcblx0XHRAbW91bnRlZFxuXG5cdGRlZiBpbnNlcnQgbm9kZSwgcGFyZW50XG5cdFx0QGluc2VydHMrK1xuXG5cdGRlZiByZW1vdmUgbm9kZSwgcGFyZW50XG5cdFx0QHJlbW92ZXMrK1xuXG5cdGRlZiBjaGFuZ2VzXG5cdFx0QGluc2VydHMgKyBAcmVtb3Zlc1xuXG5cdGRlZiBtb3VudCBub2RlXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdEBoYXNNb3VudGFibGVzID0geWVzXG5cblx0ZGVmIHJlZnJlc2ggZm9yY2UgPSBub1xuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRyZXR1cm4gaWYgIWZvcmNlIGFuZCBjaGFuZ2VzID09IDBcblx0XHQjIGNvbnNvbGUudGltZSgncmVzb2x2ZU1vdW50cycpXG5cdFx0aWYgKEBpbnNlcnRzIGFuZCBAaGFzTW91bnRhYmxlcykgb3IgZm9yY2Vcblx0XHRcdHRyeU1vdW50XG5cblx0XHRpZiAoQHJlbW92ZXMgb3IgZm9yY2UpIGFuZCBAbW91bnRlZDpsZW5ndGhcblx0XHRcdHRyeVVubW91bnRcblx0XHQjIGNvbnNvbGUudGltZUVuZCgncmVzb2x2ZU1vdW50cycpXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0c2VsZlxuXG5cdGRlZiB1bm1vdW50IG5vZGVcblx0XHRzZWxmXG5cblx0ZGVmIHRyeU1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdHZhciBpdGVtcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLl9fbW91bnQnKVxuXHRcdCMgd2hhdCBpZiB3ZSBlbmQgdXAgY3JlYXRpbmcgYWRkaXRpb25hbCBtb3VudGFibGVzIGJ5IG1vdW50aW5nP1xuXHRcdGZvciBlbCBpbiBpdGVtc1xuXHRcdFx0aWYgZWwgYW5kIGVsLkB0YWdcblx0XHRcdFx0aWYgQG1vdW50ZWQuaW5kZXhPZihlbC5AdGFnKSA9PSAtMVxuXHRcdFx0XHRcdG1vdW50Tm9kZShlbC5AdGFnKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIG1vdW50Tm9kZSBub2RlXG5cdFx0QG1vdW50ZWQucHVzaChub2RlKVxuXHRcdG5vZGUuRkxBR1MgfD0gSW1iYS5UQUdfTU9VTlRFRFxuXHRcdG5vZGUubW91bnQgaWYgbm9kZTptb3VudFxuXHRcdHJldHVyblxuXG5cdGRlZiB0cnlVbm1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdGZvciBpdGVtLCBpIGluIEBtb3VudGVkXG5cdFx0XHR1bmxlc3MgZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGl0ZW0uQGRvbSlcblx0XHRcdFx0aXRlbS5GTEFHUyA9IGl0ZW0uRkxBR1MgJiB+SW1iYS5UQUdfTU9VTlRFRFxuXHRcdFx0XHRpZiBpdGVtOnVubW91bnQgYW5kIGl0ZW0uQGRvbVxuXHRcdFx0XHRcdGl0ZW0udW5tb3VudFxuXHRcdFx0XHRlbGlmIGl0ZW0uQHNjaGVkdWxlclxuXHRcdFx0XHRcdCMgTUFZQkUgRklYIFRISVM/XG5cdFx0XHRcdFx0aXRlbS51bnNjaGVkdWxlXG5cdFx0XHRcdEBtb3VudGVkW2ldID0gbnVsbFxuXHRcdFx0XHRjb3VudCsrXG5cdFx0XG5cdFx0aWYgY291bnRcblx0XHRcdEBtb3VudGVkID0gQG1vdW50ZWQuZmlsdGVyIGRvIHxpdGVtfCBpdGVtXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9tYW5hZ2VyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbkltYmEuQ1NTS2V5TWFwID0ge31cblxuSW1iYS5UQUdfQlVJTFQgPSAxXG5JbWJhLlRBR19TRVRVUCA9IDJcbkltYmEuVEFHX01PVU5USU5HID0gNFxuSW1iYS5UQUdfTU9VTlRFRCA9IDhcbkltYmEuVEFHX1NDSEVEVUxFRCA9IDE2XG5JbWJhLlRBR19BV0FLRU5FRCA9IDMyXG5cbiMjI1xuR2V0IHRoZSBjdXJyZW50IGRvY3VtZW50XG4jIyNcbmRlZiBJbWJhLmRvY3VtZW50XG5cdGlmICR3ZWIkXG5cdFx0d2luZG93OmRvY3VtZW50XG5cdGVsc2Vcblx0XHRAZG9jdW1lbnQgfHw9IEltYmFTZXJ2ZXJEb2N1bWVudC5uZXdcblxuIyMjXG5HZXQgdGhlIGJvZHkgZWxlbWVudCB3cmFwcGVkIGluIGFuIEltYmEuVGFnXG4jIyNcbmRlZiBJbWJhLnJvb3Rcblx0dGFnKEltYmEuZG9jdW1lbnQ6Ym9keSlcblxuZGVmIEltYmEuc3RhdGljIGl0ZW1zLCBuclxuXHRpdGVtczpzdGF0aWMgPSBuclxuXHRyZXR1cm4gaXRlbXNcblxuIyMjXG5cbiMjI1xuZGVmIEltYmEubW91bnQgbm9kZSwgaW50b1xuXHRpbnRvIHx8PSBJbWJhLmRvY3VtZW50OmJvZHlcblx0aW50by5hcHBlbmRDaGlsZChub2RlLmRvbSlcblx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLGludG8pXG5cdG5vZGUuc2NoZWR1bGVyLmNvbmZpZ3VyZShldmVudHM6IHllcykuYWN0aXZhdGUobm8pXG5cdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVybiBub2RlXG5cblxuZGVmIEltYmEuY3JlYXRlVGV4dE5vZGUgbm9kZVxuXHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRyZXR1cm4gbm9kZVxuXHRyZXR1cm4gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG4jIyNcblRoaXMgaXMgdGhlIGJhc2VjbGFzcyB0aGF0IGFsbCB0YWdzIGluIGltYmEgaW5oZXJpdCBmcm9tLlxuQGluYW1lIG5vZGVcbiMjI1xuY2xhc3MgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KEBub2RlVHlwZSBvciAnZGl2Jylcblx0XHRpZiBAY2xhc3Nlc1xuXHRcdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0XHRkb206Y2xhc3NOYW1lID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR2YXIgcHJvdG8gPSAoQHByb3RvRG9tIHx8PSBidWlsZE5vZGUpXG5cdFx0cHJvdG8uY2xvbmVOb2RlKGZhbHNlKVxuXG5cdGRlZiBzZWxmLmJ1aWxkIGN0eFxuXHRcdHNlbGYubmV3KHNlbGYuY3JlYXRlTm9kZSxjdHgpXG5cblx0ZGVmIHNlbGYuZG9tXG5cdFx0QHByb3RvRG9tIHx8PSBidWlsZE5vZGVcblxuXHQjIyNcblx0Q2FsbGVkIHdoZW4gYSB0YWcgdHlwZSBpcyBiZWluZyBzdWJjbGFzc2VkLlxuXHQjIyNcblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkOnByb3RvdHlwZS5AZW1wdHkgPSB5ZXNcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5zbGljZVxuXG5cdFx0XHRpZiBjaGlsZC5AZmxhZ05hbWVcblx0XHRcdFx0Y2hpbGQuQGNsYXNzZXMucHVzaChjaGlsZC5AZmxhZ05hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBmbGFnTmFtZSA9IG51bGxcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHQjIyNcblx0SW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBhZnRlciBhIHRhZyBjbGFzcyBoYXNcblx0YmVlbiBkZWNsYXJlZCBvciBleHRlbmRlZC5cblx0XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgb3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHR2YXIgYmFzZSA9IEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdHZhciBoYXNTZXR1cCAgPSBzZWxmOnNldHVwICAhPSBiYXNlOnNldHVwXG5cdFx0dmFyIGhhc0NvbW1pdCA9IHNlbGY6Y29tbWl0ICE9IGJhc2U6Y29tbWl0XG5cdFx0dmFyIGhhc1JlbmRlciA9IHNlbGY6cmVuZGVyICE9IGJhc2U6cmVuZGVyXG5cdFx0dmFyIGhhc01vdW50ICA9IHNlbGY6bW91bnRcblxuXHRcdHZhciBjdG9yID0gc2VsZjpjb25zdHJ1Y3RvclxuXG5cdFx0aWYgaGFzQ29tbWl0IG9yIGhhc1JlbmRlciBvciBoYXNNb3VudCBvciBoYXNTZXR1cFxuXG5cdFx0XHRzZWxmOmVuZCA9IGRvXG5cdFx0XHRcdGlmIHRoaXM6bW91bnQgYW5kICEodGhpcy5GTEFHUyAmIEltYmEuVEFHX01PVU5URUQpXG5cdFx0XHRcdFx0IyBqdXN0IGFjdGl2YXRlIFxuXHRcdFx0XHRcdEltYmEuVGFnTWFuYWdlci5tb3VudCh0aGlzKVxuXG5cdFx0XHRcdHVubGVzcyB0aGlzLkZMQUdTICYgSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLkZMQUdTIHw9IEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5zZXR1cFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb21taXRcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdGlmIGhhc01vdW50XG5cdFx0XHRcdGlmIGN0b3IuQGNsYXNzZXMgYW5kIGN0b3IuQGNsYXNzZXMuaW5kZXhPZignX19tb3VudCcpICA9PSAtMVxuXHRcdFx0XHRcdGN0b3IuQGNsYXNzZXMucHVzaCgnX19tb3VudCcpXG5cblx0XHRcdFx0aWYgY3Rvci5AcHJvdG9Eb21cblx0XHRcdFx0XHRjdG9yLkBwcm90b0RvbTpjbGFzc0xpc3QuYWRkKCdfX21vdW50JylcblxuXHRcdFx0Zm9yIGl0ZW0gaW4gWzptb3VzZW1vdmUsOm1vdXNlZW50ZXIsOm1vdXNlbGVhdmUsOm1vdXNlb3Zlciw6bW91c2VvdXQsOnNlbGVjdHN0YXJ0XVxuXHRcdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihpdGVtKSBpZiB0aGlzW1wib257aXRlbX1cIl1cblx0XHRzZWxmXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBkb20sY3R4XG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRzZWxmOiQgPSB7fVxuXHRcdEB0cmVlXyA9IG51bGxcblx0XHRAb3duZXJfID0gY3R4XG5cdFx0c2VsZi5GTEFHUyA9IDBcblx0XHRidWlsZFxuXHRcdHNlbGZcblxuXHRhdHRyIG5hbWUgaW5saW5lOiBub1xuXHRhdHRyIHJvbGUgaW5saW5lOiBub1xuXHRhdHRyIHRhYmluZGV4IGlubGluZTogbm9cblx0YXR0ciB0aXRsZVxuXG5cdGRlZiBkb21cblx0XHRAZG9tXG5cdFx0XG5cdGRlZiBzZXREb20gZG9tXG5cdFx0ZG9tLkB0YWcgPSBzZWxmXG5cdFx0QGRvbSA9IGRvbVxuXHRcdHNlbGZcblxuXHRkZWYgcmVmXG5cdFx0QHJlZlxuXHRcdFxuXHRkZWYgcm9vdFxuXHRcdEBvd25lcl8gPyBAb3duZXJfLnJvb3QgOiBzZWxmXG5cblx0IyMjXG5cdFNldHRpbmcgcmVmZXJlbmNlcyBmb3IgdGFncyBsaWtlXG5cdGA8ZGl2QGhlYWRlcj5gIHdpbGwgY29tcGlsZSB0byBgdGFnKCdkaXYnKS5yZWZfKCdoZWFkZXInLHRoaXMpLmVuZCgpYFxuXHRCeSBkZWZhdWx0IGl0IGFkZHMgdGhlIHJlZmVyZW5jZSBhcyBhIGNsYXNzTmFtZSB0byB0aGUgdGFnLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgcmVmXyByZWYsIGN0eFxuXHRcdGN0eFsnXycgKyByZWZdID0gc2VsZlxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRAb3duZXIgPSBjdHhcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBkYXRhPSBkYXRhXG5cdFx0QGRhdGEgPSBkYXRhXG5cblx0IyMjXG5cdEdldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0IyMjXG5cdGRlZiBkYXRhXG5cdFx0QGRhdGFcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyXG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGUgaWYgcHJldlxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgaWQ9IGlkXG5cdFx0aWYgaWQgIT0gbnVsbFxuXHRcdFx0ZG9tOmlkID0gaWRcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldE5lc3RlZEF0dHIgbnMsIG5hbWUsIHZhbHVlXG5cdFx0aWYgc2VsZltucysnU2V0QXR0cmlidXRlJ11cblx0XHRcdHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0QXR0cmlidXRlTlMobnMsIG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0QXR0cmlidXRlTlMgbnMsIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cblx0XHRpZiBvbGQgIT0gdmFsdWVcblx0XHRcdGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlIFxuXHRcdFx0XHRkb20uc2V0QXR0cmlidXRlTlMobnMsbmFtZSx2YWx1ZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cblx0ZGVmIGdldEF0dHJpYnV0ZU5TIG5zLCBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFxuXHRcblx0ZGVmIHNldCBrZXksIHZhbHVlLCBtb2RzXG5cdFx0bGV0IHNldHRlciA9IEltYmEudG9TZXR0ZXIoa2V5KVxuXHRcdGlmIHNlbGZbc2V0dGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZbc2V0dGVyXSh2YWx1ZSxtb2RzKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206c2V0QXR0cmlidXRlKGtleSx2YWx1ZSlcblx0XHRzZWxmXG5cdFxuXHRcblx0ZGVmIGdldCBrZXlcblx0XHRAZG9tOmdldEF0dHJpYnV0ZShrZXkpXG5cblx0IyMjXG5cdE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBzcGVjaWFsIHdyYXBwaW5nIGV0Yy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDb250ZW50IGNvbnRlbnQsIHR5cGVcblx0XHRzZXRDaGlsZHJlbiBjb250ZW50LCB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGUuIHR5cGUgcGFyYW0gaXMgb3B0aW9uYWwsXG5cdGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IEltYmEgd2hlbiBjb21waWxpbmcgdGFnIHRyZWVzLiBcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdGlmICRub2RlJFxuXHRcdFx0QHRyZWVfID0gbm9kZXNcblx0XHRlbHNlXG5cdFx0XHRAZW1wdHkgPyBhcHBlbmQobm9kZXMpIDogZW1wdHkuYXBwZW5kKG5vZGVzKVxuXHRcdFx0QHRyZWVfID0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSB0ZW1wbGF0ZSB0aGF0IHdpbGwgcmVuZGVyIHRoZSBjb250ZW50IG9mIG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0VGVtcGxhdGUgdGVtcGxhdGVcblx0XHR1bmxlc3MgQHRlbXBsYXRlXG5cdFx0XHQjIG92ZXJyaWRlIHRoZSBiYXNpY1xuXHRcdFx0aWYgc2VsZjpyZW5kZXIgPT0gSW1iYS5UYWc6cHJvdG90eXBlOnJlbmRlclxuXHRcdFx0XHRzZWxmOnJlbmRlciA9IHNlbGY6cmVuZGVyVGVtcGxhdGUgIyBkbyBzZXRDaGlsZHJlbihyZW5kZXJUZW1wbGF0ZSlcblx0XHRcdHNlbGYub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblxuXHRcdHNlbGY6dGVtcGxhdGUgPSBAdGVtcGxhdGUgPSB0ZW1wbGF0ZVxuXHRcdHNlbGZcblxuXHRkZWYgdGVtcGxhdGVcblx0XHRudWxsXG5cblx0IyMjXG5cdElmIG5vIGN1c3RvbSByZW5kZXItbWV0aG9kIGlzIGRlZmluZWQsIGFuZCB0aGUgbm9kZVxuXHRoYXMgYSB0ZW1wbGF0ZSwgdGhpcyBtZXRob2Qgd2lsbCBiZSB1c2VkIHRvIHJlbmRlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclRlbXBsYXRlXG5cdFx0dmFyIGJvZHkgPSB0ZW1wbGF0ZVxuXHRcdHNldENoaWxkcmVuKGJvZHkpIGlmIGJvZHkgIT0gc2VsZlxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGNoaWxkIGZyb20gY3VycmVudCBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbW92ZUNoaWxkIGNoaWxkXG5cdFx0dmFyIHBhciA9IGRvbVxuXHRcdHZhciBlbCA9IGNoaWxkLkBkb20gb3IgY2hpbGRcblx0XHRpZiBlbCBhbmQgZWw6cGFyZW50Tm9kZSA9PSBwYXJcblx0XHRcdHBhci5yZW1vdmVDaGlsZChlbClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUoZWwuQHRhZyBvciBlbCxzZWxmKVxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRBcHBlbmQgYSBzaW5nbGUgaXRlbSAobm9kZSBvciBzdHJpbmcpIHRvIHRoZSBjdXJyZW50IG5vZGUuXG5cdElmIHN1cHBsaWVkIGl0ZW0gaXMgYSBzdHJpbmcgaXQgd2lsbCBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWRcblx0YnkgSW1iYSBpbnRlcm5hbGx5LCBidXQgd2lsbCBwcmFjdGljYWxseSBuZXZlciBiZSB1c2VkIGV4cGxpY2l0bHkuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYXBwZW5kQ2hpbGQgbm9kZVxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkpXG5cdFx0ZWxpZiBub2RlXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRpZiBub2RlIGFuZCByZWxcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoIChub2RlLkBkb20gb3Igbm9kZSksIChyZWwuQGRvbSBvciByZWwpIClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgbm9kZSBmcm9tIHRoZSBkb20gdHJlZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG9ycGhhbml6ZVxuXHRcdHBhci5yZW1vdmVDaGlsZChzZWxmKSBpZiBsZXQgcGFyID0gcGFyZW50XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0R2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdEByZXR1cm4ge3N0cmluZ30gaW5uZXIgdGV4dCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgdGV4dCB2XG5cdFx0QGRvbTp0ZXh0Q29udGVudFxuXG5cdCMjI1xuXHRTZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0IyMjXG5cdGRlZiB0ZXh0PSB0eHRcblx0XHRAZW1wdHkgPSBub1xuXHRcdEBkb206dGV4dENvbnRlbnQgPSAodHh0ID09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UpID8gJycgOiB0eHRcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0TWV0aG9kIGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIGRhdGEtYXR0cmlidXRlcy4gV2hlbiBjYWxsZWQgd2l0aCB6ZXJvXG5cdGFyZ3VtZW50cyBpdCB3aWxsIHJldHVybiB0aGUgYWN0dWFsIGRhdGFzZXQgZm9yIHRoZSB0YWcuXG5cblx0XHR2YXIgbm9kZSA9IDxkaXYgZGF0YS1uYW1lPSdoZWxsbyc+XG5cdFx0IyBnZXQgdGhlIHdob2xlIGRhdGFzZXRcblx0XHRub2RlLmRhdGFzZXQgIyB7bmFtZTogJ2hlbGxvJ31cblx0XHQjIGdldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScpICMgJ2hlbGxvJ1xuXHRcdCMgc2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJywnbmV3bmFtZScpICMgc2VsZlxuXG5cblx0IyMjXG5cdGRlZiBkYXRhc2V0IGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGRhdGFzZXQoayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdHNldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIix2YWwpXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYga2V5XG5cdFx0XHRyZXR1cm4gZ2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiKVxuXG5cdFx0dmFyIGRhdGFzZXQgPSBkb206ZGF0YXNldFxuXG5cdFx0dW5sZXNzIGRhdGFzZXRcblx0XHRcdGRhdGFzZXQgPSB7fVxuXHRcdFx0Zm9yIGF0cixpIGluIGRvbTphdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIGF0cjpuYW1lLnN1YnN0cigwLDUpID09ICdkYXRhLSdcblx0XHRcdFx0XHRkYXRhc2V0W0ltYmEudG9DYW1lbENhc2UoYXRyOm5hbWUuc2xpY2UoNSkpXSA9IGF0cjp2YWx1ZVxuXG5cdFx0cmV0dXJuIGRhdGFzZXRcblxuXG5cdCMjI1xuXHRSZW1vdmUgYWxsIGNvbnRlbnQgaW5zaWRlIG5vZGVcblx0IyMjXG5cdGRlZiBlbXB0eVxuXHRcdGlmIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0dGhpczokOnRleHQgPSBudWxsXG5cdFx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKG51bGwsc2VsZilcblx0XHRcdFxuXHRcdEBub2Rlc18gPSBAdGV4dF8gPSBudWxsXG5cdFx0QGVtcHR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRFbXB0eSBwbGFjZWhvbGRlci4gT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGN1c3RvbSByZW5kZXIgYmVoYXZpb3VyLlxuXHRXb3JrcyBtdWNoIGxpa2UgdGhlIGZhbWlsaWFyIHJlbmRlci1tZXRob2QgaW4gUmVhY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB3aGlsZSB0YWcgaXMgaW5pdGlhbGl6aW5nLiBObyBpbml0aWFsIHByb3BzXG5cdHdpbGwgaGF2ZSBiZWVuIHNldCBhdCB0aGlzIHBvaW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJ1aWxkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgb25jZSwgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZC4gQWxsIGluaXRpYWwgcHJvcHNcblx0YW5kIGNoaWxkcmVuIHdpbGwgaGF2ZSBiZWVuIHNldCBiZWZvcmUgc2V0dXAgaXMgY2FsbGVkLlxuXHRzZXRDb250ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldHVwXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgZm9yIHRhZ3MgdGhhdCBhcmUgcGFydCBvZlxuXHRhIHRhZyB0cmVlICh0aGF0IGFyZSByZW5kZXJlZCBzZXZlcmFsIHRpbWVzKS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb21taXRcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q2FsbGVkIGJ5IHRoZSB0YWctc2NoZWR1bGVyIChpZiB0aGlzIHRhZyBpcyBzY2hlZHVsZWQpXG5cdEJ5IGRlZmF1bHQgaXQgd2lsbCBjYWxsIHRoaXMucmVuZGVyLiBEbyBub3Qgb3ZlcnJpZGUgdW5sZXNzXG5cdHlvdSByZWFsbHkgdW5kZXJzdGFuZCBpdC5cblxuXHQjIyNcblx0ZGVmIHRpY2tcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdFxuXHRBIHZlcnkgaW1wb3J0YW50IG1ldGhvZCB0aGF0IHlvdSB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIG1hbnVhbGx5LlxuXHRUaGUgdGFnIHN5bnRheCBvZiBJbWJhIGNvbXBpbGVzIHRvIGEgY2hhaW4gb2Ygc2V0dGVycywgd2hpY2ggYWx3YXlzXG5cdGVuZHMgd2l0aCAuZW5kLiBgPGEubGFyZ2U+YCBjb21waWxlcyB0byBgdGFnKCdhJykuZmxhZygnbGFyZ2UnKS5lbmQoKWBcblx0XG5cdFlvdSBhcmUgaGlnaGx5IGFkdmljZWQgdG8gbm90IG92ZXJyaWRlIGl0cyBiZWhhdmlvdXIuIFRoZSBmaXJzdCB0aW1lXG5cdGVuZCBpcyBjYWxsZWQgaXQgd2lsbCBtYXJrIHRoZSB0YWcgYXMgaW5pdGlhbGl6ZWQgYW5kIGNhbGwgSW1iYS5UYWcjc2V0dXAsXG5cdGFuZCBjYWxsIEltYmEuVGFnI2NvbW1pdCBldmVyeSB0aW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGVuZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRpZiBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSAhPSAhIXRvZ2dsZXJcblx0XHRcdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0IyBmaXJlZm94IHdpbGwgdHJpZ2dlciBhIGNoYW5nZSBpZiBhZGRpbmcgZXhpc3RpbmcgY2xhc3Ncblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKSB1bmxlc3MgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGZsYWcgZnJvbSBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdW5mbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRvZ2dsZSBzcGVjaWZpZWQgZmxhZyBvbiBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdG9nZ2xlRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIGN1cnJlbnQgbm9kZSBoYXMgc3BlY2lmaWVkIGZsYWdcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBoYXNGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXG5cblx0IyMjXG5cdFNldC91cGRhdGUgYSBuYW1lZCBmbGFnLiBJdCByZW1lbWJlcnMgdGhlIHByZXZpb3VzXG5cdHZhbHVlIG9mIHRoZSBmbGFnLCBhbmQgcmVtb3ZlcyBpdCBiZWZvcmUgc2V0dGluZyB0aGUgbmV3IHZhbHVlLlxuXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywndG9kbycpXG5cdFx0bm9kZS5zZXRGbGFnKCd0eXBlJywncHJvamVjdCcpXG5cdFx0IyB0b2RvIGlzIHJlbW92ZWQsIHByb2plY3QgaXMgYWRkZWQuXG5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRGbGFnIG5hbWUsIHZhbHVlXG5cdFx0bGV0IGZsYWdzID0gdGhpczokOmZsYWdzIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZmxhZ3NbbmFtZV1cblx0XHRpZiBwcmV2ICE9IHZhbHVlXG5cdFx0XHR1bmZsYWcocHJldikgaWYgcHJldlxuXHRcdFx0ZmxhZyh2YWx1ZSkgaWYgdmFsdWVcblx0XHRcdGZsYWdzW25hbWVdID0gdmFsdWVcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgc2NoZWR1bGVyIGZvciB0aGlzIG5vZGUuIEEgbmV3IHNjaGVkdWxlciB3aWxsIGJlIGNyZWF0ZWRcblx0aWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cblxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZXJcblx0XHRAc2NoZWR1bGVyID89IEltYmEuU2NoZWR1bGVyLm5ldyhzZWxmKVxuXG5cdCMjI1xuXG5cdFNob3J0aGFuZCB0byBzdGFydCBzY2hlZHVsaW5nIGEgbm9kZS4gVGhlIG1ldGhvZCB3aWxsIGJhc2ljYWxseVxuXHRwcm94eSB0aGUgYXJndW1lbnRzIHRocm91Z2ggdG8gc2NoZWR1bGVyLmNvbmZpZ3VyZSwgYW5kIHRoZW5cblx0YWN0aXZhdGUgdGhlIHNjaGVkdWxlci5cblx0XG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGUgb3B0aW9ucyA9IHtldmVudHM6IHllc31cblx0XHRzY2hlZHVsZXIuY29uZmlndXJlKG9wdGlvbnMpLmFjdGl2YXRlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGRlYWN0aXZhdGluZyBzY2hlZHVsZXIgKGlmIHRhZyBoYXMgb25lKS5cblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiB1bnNjaGVkdWxlXG5cdFx0c2NoZWR1bGVyLmRlYWN0aXZhdGUgaWYgQHNjaGVkdWxlclxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHBhcmVudCBvZiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWd9IFxuXHQjIyNcblx0ZGVmIHBhcmVudFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKGRvbTpwYXJlbnROb2RlKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWdbXX1cblx0IyMjXG5cdGRlZiBjaGlsZHJlbiBzZWxcblx0XHRmb3IgaXRlbSBpbiBAZG9tOmNoaWxkcmVuXG5cdFx0XHRpdGVtLkB0YWcgb3IgSW1iYS5nZXRUYWdGb3JEb20oaXRlbSlcblx0XG5cdGRlZiBxdWVyeVNlbGVjdG9yIHFcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLnF1ZXJ5U2VsZWN0b3IocSkpXG5cblx0ZGVmIHF1ZXJ5U2VsZWN0b3JBbGwgcVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbS5xdWVyeVNlbGVjdG9yQWxsKHEpXG5cdFx0XHRpdGVtcy5wdXNoKCBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKSApXG5cdFx0cmV0dXJuIGl0ZW1zXG5cblx0IyMjXG5cdENoZWNrIGlmIHRoaXMgbm9kZSBtYXRjaGVzIGEgc2VsZWN0b3Jcblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBtYXRjaGVzIHNlbFxuXHRcdGlmIHNlbCBpc2EgRnVuY3Rpb25cblx0XHRcdHJldHVybiBzZWwoc2VsZilcblxuXHRcdHNlbCA9IHNlbC5xdWVyeSBpZiBzZWw6cXVlcnkgaXNhIEZ1bmN0aW9uXG5cdFx0aWYgdmFyIGZuID0gKEBkb206bWF0Y2hlcyBvciBAZG9tOm1hdGNoZXNTZWxlY3RvciBvciBAZG9tOndlYmtpdE1hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1zTWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bW96TWF0Y2hlc1NlbGVjdG9yKVxuXHRcdFx0cmV0dXJuIGZuLmNhbGwoQGRvbSxzZWwpXG5cblx0IyMjXG5cdEdldCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyBzdXBwbGllZCBzZWxlY3RvciAvIGZpbHRlclxuXHR0cmF2ZXJzaW5nIHVwd2FyZHMsIGJ1dCBpbmNsdWRpbmcgdGhlIG5vZGUgaXRzZWxmLlxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBjbG9zZXN0IHNlbFxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20uY2xvc2VzdChzZWwpKVxuXG5cdCMjI1xuXHRDaGVjayBpZiBub2RlIGNvbnRhaW5zIG90aGVyIG5vZGVcblx0QHJldHVybiB7Qm9vbGVhbn0gXG5cdCMjI1xuXHRkZWYgY29udGFpbnMgbm9kZVxuXHRcdGRvbS5jb250YWlucyhub2RlLkBkb20gb3Igbm9kZSlcblxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGNvbnNvbGUubG9nIG9uIGVsZW1lbnRzXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbG9nICphcmdzXG5cdFx0YXJncy51bnNoaWZ0KGNvbnNvbGUpXG5cdFx0RnVuY3Rpb246cHJvdG90eXBlOmNhbGwuYXBwbHkoY29uc29sZTpsb2csIGFyZ3MpXG5cdFx0c2VsZlxuXG5cdGRlZiBjc3Mga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0Y3NzKGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIG5hbWUgPSBJbWJhLkNTU0tleU1hcFtrZXldIG9yIGtleVxuXG5cdFx0aWYgdmFsID09IG51bGxcblx0XHRcdGRvbTpzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKVxuXHRcdGVsaWYgdmFsID09IHVuZGVmaW5lZCBhbmQgYXJndW1lbnRzOmxlbmd0aCA9PSAxXG5cdFx0XHRyZXR1cm4gZG9tOnN0eWxlW25hbWVdXG5cdFx0ZWxzZVxuXHRcdFx0aWYgdmFsIGlzYSBOdW1iZXIgYW5kIG5hbWUubWF0Y2goL3dpZHRofGhlaWdodHxsZWZ0fHJpZ2h0fHRvcHxib3R0b20vKVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWwgKyBcInB4XCJcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0U3R5bGUgc3R5bGVcblx0XHRzZXRBdHRyaWJ1dGUoJ3N0eWxlJyxzdHlsZSlcblxuXHRkZWYgc3R5bGVcblx0XHRnZXRBdHRyaWJ1dGUoJ3N0eWxlJylcblxuXHQjIyNcblx0VHJpZ2dlciBhbiBldmVudCBmcm9tIGN1cnJlbnQgbm9kZS4gRGlzcGF0Y2hlZCB0aHJvdWdoIHRoZSBJbWJhIGV2ZW50IG1hbmFnZXIuXG5cdFRvIGRpc3BhdGNoIGFjdHVhbCBkb20gZXZlbnRzLCB1c2UgZG9tLmRpc3BhdGNoRXZlbnQgaW5zdGVhZC5cblxuXHRAcmV0dXJuIHtJbWJhLkV2ZW50fVxuXHQjIyNcblx0ZGVmIHRyaWdnZXIgbmFtZSwgZGF0YSA9IHt9XG5cdFx0JHdlYiQgPyBJbWJhLkV2ZW50cy50cmlnZ2VyKG5hbWUsc2VsZixkYXRhOiBkYXRhKSA6IG51bGxcblxuXHQjIyNcblx0Rm9jdXMgb24gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZm9jdXNcblx0XHRkb20uZm9jdXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBmb2N1cyBmcm9tIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJsdXJcblx0XHRkb20uYmx1clxuXHRcdHNlbGZcblxuXHRkZWYgdG9TdHJpbmdcblx0XHRkb206b3V0ZXJIVE1MXG5cdFxuXG5JbWJhLlRhZzpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IEltYmEuVGFnXG5cbkltYmEuSFRNTF9UQUdTID0gXCJhIGFiYnIgYWRkcmVzcyBhcmVhIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiYXNlIGJkaSBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBiciBidXR0b24gY2FudmFzIGNhcHRpb24gY2l0ZSBjb2RlIGNvbCBjb2xncm91cCBkYXRhIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXYgZGwgZHQgZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGZvcm0gaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaHIgaHRtbCBpIGlmcmFtZSBpbWcgaW5wdXQgaW5zIGtiZCBrZXlnZW4gbGFiZWwgbGVnZW5kIGxpIGxpbmsgbWFpbiBtYXAgbWFyayBtZW51IG1lbnVpdGVtIG1ldGEgbWV0ZXIgbmF2IG5vc2NyaXB0IG9iamVjdCBvbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcGFyYW0gcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBzIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0cmFjayB1IHVsIHZhciB2aWRlbyB3YnJcIi5zcGxpdChcIiBcIilcbkltYmEuSFRNTF9UQUdTX1VOU0FGRSA9IFwiYXJ0aWNsZSBhc2lkZSBoZWFkZXIgc2VjdGlvblwiLnNwbGl0KFwiIFwiKVxuSW1iYS5TVkdfVEFHUyA9IFwiY2lyY2xlIGRlZnMgZWxsaXBzZSBnIGxpbmUgbGluZWFyR3JhZGllbnQgbWFzayBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHN0b3Agc3ZnIHRleHQgdHNwYW5cIi5zcGxpdChcIiBcIilcblxuSW1iYS5IVE1MX0FUVFJTID1cblx0YTogXCJocmVmIHRhcmdldCBocmVmbGFuZyBtZWRpYSBkb3dubG9hZCByZWwgdHlwZVwiXG5cdGZvcm06IFwibWV0aG9kIGFjdGlvbiBlbmN0eXBlIGF1dG9jb21wbGV0ZSB0YXJnZXRcIlxuXHRidXR0b246IFwiYXV0b2ZvY3VzIHR5cGVcIlxuXHRpbnB1dDogXCJhY2NlcHQgZGlzYWJsZWQgZm9ybSBsaXN0IG1heCBtYXhsZW5ndGggbWluIHBhdHRlcm4gcmVxdWlyZWQgc2l6ZSBzdGVwIHR5cGVcIlxuXHRsYWJlbDogXCJhY2Nlc3NrZXkgZm9yIGZvcm1cIlxuXHRpbWc6IFwic3JjIHNyY3NldFwiXG5cdGxpbms6IFwicmVsIHR5cGUgaHJlZiBtZWRpYVwiXG5cdGlmcmFtZTogXCJyZWZlcnJlcnBvbGljeSBzcmMgc3JjZG9jIHNhbmRib3hcIlxuXHRtZXRhOiBcInByb3BlcnR5IGNvbnRlbnQgY2hhcnNldCBkZXNjXCJcblx0b3B0Z3JvdXA6IFwibGFiZWxcIlxuXHRvcHRpb246IFwibGFiZWxcIlxuXHRvdXRwdXQ6IFwiZm9yIGZvcm1cIlxuXHRvYmplY3Q6IFwidHlwZSBkYXRhIHdpZHRoIGhlaWdodFwiXG5cdHBhcmFtOiBcIm5hbWUgdmFsdWVcIlxuXHRwcm9ncmVzczogXCJtYXhcIlxuXHRzY3JpcHQ6IFwic3JjIHR5cGUgYXN5bmMgZGVmZXIgY3Jvc3NvcmlnaW4gaW50ZWdyaXR5IG5vbmNlIGxhbmd1YWdlXCJcblx0c2VsZWN0OiBcInNpemUgZm9ybSBtdWx0aXBsZVwiXG5cdHRleHRhcmVhOiBcInJvd3MgY29sc1wiXG5cblxuSW1iYS5IVE1MX1BST1BTID1cblx0aW5wdXQ6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0dGV4dGFyZWE6IFwiYXV0b2ZvY3VzIGF1dG9jb21wbGV0ZSBhdXRvY29ycmVjdCB2YWx1ZSBwbGFjZWhvbGRlciByZXF1aXJlZCBkaXNhYmxlZCBtdWx0aXBsZSBjaGVja2VkIHJlYWRPbmx5XCJcblx0Zm9ybTogXCJub3ZhbGlkYXRlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRidXR0b246IFwiZGlzYWJsZWRcIlxuXHRzZWxlY3Q6IFwiYXV0b2ZvY3VzIGRpc2FibGVkIHJlcXVpcmVkXCJcblx0b3B0aW9uOiBcImRpc2FibGVkIHNlbGVjdGVkIHZhbHVlXCJcblx0b3B0Z3JvdXA6IFwiZGlzYWJsZWRcIlxuXHRwcm9ncmVzczogXCJ2YWx1ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0Y2FudmFzOiBcIndpZHRoIGhlaWdodFwiXG5cbmRlZiBleHRlbmRlciBvYmosIHN1cFxuXHRmb3Igb3duIGssdiBvZiBzdXBcblx0XHRvYmpba10gPz0gdlxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRzdXAuaW5oZXJpdChvYmopIGlmIHN1cDppbmhlcml0XG5cdHJldHVybiBvYmpcblxuZGVmIFRhZ1xuXHRyZXR1cm4gZG8gfGRvbSxjdHh8XG5cdFx0dGhpcy5pbml0aWFsaXplKGRvbSxjdHgpXG5cdFx0cmV0dXJuIHRoaXNcblxuZGVmIFRhZ1NwYXduZXIgdHlwZVxuXHRyZXR1cm4gZG8gfHpvbmV8IHR5cGUuYnVpbGQoem9uZSlcblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgbnMgbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gfHwgZGVmaW5lTmFtZXNwYWNlKG5hbWUpXG5cblx0ZGVmIGRlZmluZU5hbWVzcGFjZSBuYW1lXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0Y2xvbmUuQG5zID0gbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gPSBjbG9uZVxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBiYXNlVHlwZSBuYW1lXG5cdFx0bmFtZSBpbiBJbWJhLkhUTUxfVEFHUyA/ICdlbGVtZW50JyA6ICdkaXYnXG5cblx0ZGVmIGRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0aWYgYm9keSBhbmQgYm9keS5Abm9kZVR5cGVcblx0XHRcdHN1cHIgPSBib2R5XG5cdFx0XHRib2R5ID0gbnVsbFxuXHRcdFx0XG5cdFx0aWYgc2VsZltuYW1lXVxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0YWcgYWxyZWFkeSBleGlzdHM/XCIsbmFtZVxuXG5cdFx0c3VwciB8fD0gYmFzZVR5cGUobmFtZSlcblxuXHRcdGxldCBzdXBlcnR5cGUgPSBzdXByIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShzdXByKSA6IHN1cHJcblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbnVsbFxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0XHRJbWJhLlNJTkdMRVRPTlNbbmFtZS5zbGljZSgxKV0gPSB0YWd0eXBlXG5cdFx0ZWxpZiBuYW1lWzBdID09IG5hbWVbMF0udG9VcHBlckNhc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbmFtZVxuXHRcdGVsc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gXCJfXCIgKyBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0c2VsZltuYW1lXSA9IHRhZ3R5cGVcblxuXHRcdGV4dGVuZGVyKHRhZ3R5cGUsc3VwZXJ0eXBlKVxuXG5cdFx0aWYgYm9keVxuXHRcdFx0IyBkZXByZWNhdGVcblx0XHRcdGlmIGJvZHk6bGVuZ3RoID09IDJcblx0XHRcdFx0IyBjcmVhdGUgY2xvbmVcblx0XHRcdFx0dW5sZXNzIHRhZ3R5cGUuaGFzT3duUHJvcGVydHkoJ1RBR1MnKVxuXHRcdFx0XHRcdHRhZ3R5cGUuVEFHUyA9IChzdXBlcnR5cGUuVEFHUyBvciBzZWxmKS5fX2Nsb25lXG5cblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXHRcdFx0dGFndHlwZS5kZWZpbmVkIGlmIHRhZ3R5cGU6ZGVmaW5lZFxuXHRcdFx0b3B0aW1pemVUYWcodGFndHlwZSlcblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKG5hbWUpIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRrbGFzcy5leHRlbmRlZCBpZiBrbGFzczpleHRlbmRlZFxuXHRcdG9wdGltaXplVGFnKGtsYXNzKVxuXHRcdHJldHVybiBrbGFzc1xuXG5cdGRlZiBvcHRpbWl6ZVRhZyB0YWd0eXBlXG5cdFx0dGFndHlwZTpwcm90b3R5cGU/Lm9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgZmluZFRhZ1R5cGUgdHlwZVxuXHRcdGxldCBrbGFzcyA9IHNlbGZbdHlwZV1cblx0XHR1bmxlc3Mga2xhc3Ncblx0XHRcdGlmIEBub2RlTmFtZXMuaW5kZXhPZih0eXBlKSA+PSAwXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ2VsZW1lbnQnKVxuXG5cdFx0XHRcdGlmIGxldCBhdHRycyA9IEltYmEuSFRNTF9BVFRSU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIGF0dHJzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUpXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0aWYgbGV0IHByb3BzID0gSW1iYS5IVE1MX1BST1BTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gcHJvcHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSxkb206IHllcylcblx0XHRyZXR1cm4ga2xhc3Ncblx0XHRcblx0ZGVmICQgdHlwLCBvd25lclxuXHRcdGlmICRkZWJ1ZyRcblx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge3R5cH1cIikgdW5sZXNzIGZpbmRUYWdUeXBlKHR5cClcblx0XHRmaW5kVGFnVHlwZSh0eXApLmJ1aWxkKG93bmVyKVxuXHRcdFxuXHRkZWYgJHNldCBjYWNoZSwgc2xvdFxuXHRcdHJldHVybiBjYWNoZVtzbG90XSA9IFRhZ1NldC5uZXcoY2FjaGUsc2xvdClcblxuY2xhc3MgVGFnU2V0XG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBwYXJlbnQsIHNsb3Rcblx0XHRzZWxmOmkkID0gMFxuXHRcdHNlbGY6cyQgPSBzbG90XG5cdFx0c2VsZjpjJCA9IHBhcmVudFxuXHRcblx0ZGVmICQga2V5LCBub2RlXG5cdFx0c2VsZjppJCsrXG5cdFx0bm9kZTprJCA9IGtleVxuXHRcdHNlbGZba2V5XSA9IG5vZGVcblx0XHRcblx0ZGVmICRpdGVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW06c3RhdGljID0gNVxuXHRcdGl0ZW06Y2FjaGUgPSBzZWxmXG5cdFx0cmV0dXJuIGl0ZW1cblx0XHRcblx0ZGVmICRwcnVuZSBpdGVtc1xuXHRcdGxldCBwYXIgPSBzZWxmOmMkXG5cdFx0bGV0IHNsb3QgPSBzZWxmOnMkXHRcdFxuXHRcdGxldCBjbG9uZSA9IFRhZ1NldC5uZXcocGFyLHNsb3QpXG5cdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdGNsb25lW2l0ZW06ayRdID0gaXRlbVxuXHRcdGNsb25lOmkkID0gaXRlbXM6bGVuZ3RoXG5cdFx0cmV0dXJuIHBhcltzbG90XSA9IGNsb25lXG5cblxuSW1iYS5TSU5HTEVUT05TID0ge31cbkltYmEuVEFHUyA9IEltYmEuVGFncy5uZXdcbkltYmEuVEFHU1s6ZWxlbWVudF0gPSBJbWJhLlRBR1NbOmh0bWxlbGVtZW50XSA9IEltYmEuVGFnXG52YXIgaHRtbCA9IEltYmEuVEFHUy5kZWZpbmVOYW1lc3BhY2UoJ2h0bWwnKVxuaHRtbC5Abm9kZU5hbWVzID0gSW1iYS5IVE1MX1RBR1NcblxuY2xhc3MgSW1iYS5TVkdUYWcgPCBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLm5hbWVzcGFjZVVSSVxuXHRcdFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksQG5vZGVUeXBlKVxuXHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdGRvbTpjbGFzc05hbWU6YmFzZVZhbCA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXG5cdFx0aWYgY2hpbGQuQG5hbWUgaW4gSW1iYS5TVkdfVEFHU1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5cbnZhciBzdmcgPSBJbWJhLlRBR1MuZGVmaW5lTmFtZXNwYWNlKCdzdmcnKVxuc3ZnLkBub2RlTmFtZXMgPSBJbWJhLlNWR19UQUdTXG5zdmc6YmFzZVR5cGUgPSBkbyAnZWxlbWVudCdcbnN2ZzplbGVtZW50ID0gSW1iYS5TVkdUYWdcblxuSW1iYS5UQUdTID0gaHRtbCAjIG1ha2UgdGhlIGh0bWwgbmFtZXNwYWNlIHRoZSByb290XG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbiMgc2h1b2xkIGJlIHBoYXNlZCBvdXRcbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbmFtZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgbnMgPSBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnQgPyBJbWJhLlRBR1M6X1NWRyA6IEltYmEuVEFHU1xuXG5cdGlmIGRvbTppZCBhbmQgSW1iYS5TSU5HTEVUT05TW2RvbTppZF1cblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdTaW5nbGV0b24oZG9tOmlkKVxuXG5cdHZhciB0eXBlID0gbnM6ZWxlbWVudFxuXG5cdGlmIG5zLkBub2RlTmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwXG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cblx0cmV0dXJuIHR5cGUubmV3KGRvbSxudWxsKS5hd2FrZW4oZG9tKVxuXG4jIGRlcHJlY2F0ZVxuZGVmIEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlc1xuXHR2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LCAnJylcblxuXHRmb3IgcHJlZml4ZWQgaW4gc3R5bGVzXG5cdFx0dmFyIHVucHJlZml4ZWQgPSBwcmVmaXhlZC5yZXBsYWNlKC9eLSh3ZWJraXR8bXN8bW96fG98YmxpbmspLS8sJycpXG5cdFx0dmFyIGNhbWVsQ2FzZSA9IHVucHJlZml4ZWQucmVwbGFjZSgvLShcXHcpL2cpIGRvIHxtLGF8IGEudG9VcHBlckNhc2VcblxuXHRcdCMgaWYgdGhlcmUgZXhpc3RzIGFuIHVucHJlZml4ZWQgdmVyc2lvbiAtLSBhbHdheXMgdXNlIHRoaXNcblx0XHRpZiBwcmVmaXhlZCAhPSB1bnByZWZpeGVkXG5cdFx0XHRjb250aW51ZSBpZiBzdHlsZXMuaGFzT3duUHJvcGVydHkodW5wcmVmaXhlZClcblxuXHRcdCMgcmVnaXN0ZXIgdGhlIHByZWZpeGVzXG5cdFx0SW1iYS5DU1NLZXlNYXBbdW5wcmVmaXhlZF0gPSBJbWJhLkNTU0tleU1hcFtjYW1lbENhc2VdID0gcHJlZml4ZWRcblx0cmV0dXJuXG5cbmlmICR3ZWIkXG5cdEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlcyBpZiBkb2N1bWVudFxuXG5cdCMgT3Z2ZXJyaWRlIGNsYXNzTGlzdFxuXHRpZiBkb2N1bWVudCBhbmQgIWRvY3VtZW50OmRvY3VtZW50RWxlbWVudDpjbGFzc0xpc3Rcblx0XHRleHRlbmQgdGFnIGVsZW1lbnRcblxuXHRcdFx0ZGVmIGhhc0ZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBSZWdFeHAubmV3KCcoXnxcXFxccyknICsgcmVmICsgJyhcXFxcc3wkKScpLnRlc3QoQGRvbTpjbGFzc05hbWUpXG5cblx0XHRcdGRlZiBhZGRGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiBpZiBoYXNGbGFnKHJlZilcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgKz0gKEBkb206Y2xhc3NOYW1lID8gJyAnIDogJycpICsgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB1bmZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIHVubGVzcyBoYXNGbGFnKHJlZilcblx0XHRcdFx0dmFyIHJlZ2V4ID0gUmVnRXhwLm5ldygnKF58XFxcXHMpKicgKyByZWYgKyAnKFxcXFxzfCQpKicsICdnJylcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgPSBAZG9tOmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJylcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHRvZ2dsZUZsYWcgcmVmXG5cdFx0XHRcdGhhc0ZsYWcocmVmKSA/IHVuZmxhZyhyZWYpIDogZmxhZyhyZWYpXG5cblx0XHRcdGRlZiBmbGFnIHJlZiwgYm9vbFxuXHRcdFx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDIgYW5kICEhYm9vbCA9PT0gbm9cblx0XHRcdFx0XHRyZXR1cm4gdW5mbGFnKHJlZilcblx0XHRcdFx0cmV0dXJuIGFkZEZsYWcocmVmKVxuXG5JbWJhLlRhZ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RhZy5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIHByZWRlZmluZSBhbGwgc3VwcG9ydGVkIGh0bWwgdGFnc1xudGFnIGZyYWdtZW50IDwgZWxlbWVudFxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHRJbWJhLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnRcblxuZXh0ZW5kIHRhZyBodG1sXG5cdGRlZiBwYXJlbnRcblx0XHRudWxsXG5cblxuZXh0ZW5kIHRhZyBjYW52YXNcblx0ZGVmIGNvbnRleHQgdHlwZSA9ICcyZCdcblx0XHRkb20uZ2V0Q29udGV4dCh0eXBlKVxuXG5jbGFzcyBEYXRhVmFsdWVcblx0XG5cdGRlZiBpbml0aWFsaXplIG5vZGUsIHBhdGgsIG1vZHNcblx0XHRAbm9kZSA9IG5vZGVcblx0XHRAcGF0aCA9IHBhdGhcblx0XHRAbW9kcyA9IG1vZHMgb3Ige31cblx0XHRAc2V0dGVyID0gSW1iYS50b1NldHRlcihAcGF0aClcblx0XHRsZXQgdmFsdWVGbiA9IG5vZGU6dmFsdWVcblx0XHRub2RlOnZhbHVlID0gZG8gbW9kKHZhbHVlRm4uY2FsbCh0aGlzKSlcblxuXHRkZWYgZGF0YVxuXHRcdEBub2RlLmRhdGEgb3IgQG5vZGUuQG93bmVyXy5kYXRhXG5cdFx0XG5cdGRlZiBsYXp5XG5cdFx0QG1vZHM6bGF6eVxuXHRcdFxuXHRkZWYgZ2V0XG5cdFx0bGV0IGRhdGEgPSBzZWxmLmRhdGFcblx0XHRsZXQgdmFsID0gZGF0YVtAcGF0aF1cblx0XHRyZXR1cm4gZGF0YVtAc2V0dGVyXSBhbmQgdmFsIGlzYSBGdW5jdGlvbiA/IGRhdGFbQHBhdGhdKCkgOiB2YWxcblx0XHRcblx0ZGVmIHNldCB2YWx1ZVxuXHRcdGxldCBkYXRhID0gc2VsZi5kYXRhXG5cdFx0bGV0IHByZXYgPSBkYXRhW0BwYXRoXVxuXHRcdGlmIHByZXYgaXNhIEZ1bmN0aW9uXG5cdFx0XHRpZiBkYXRhW0BzZXR0ZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRkYXRhW0BzZXR0ZXJdKHZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdGRhdGFbQHBhdGhdID0gdmFsdWVcblx0XHRcblx0ZGVmIGlzQXJyYXkgdmFsID0gZ2V0XG5cdFx0dmFsIGFuZCB2YWw6c3BsaWNlIGFuZCB2YWw6c29ydFxuXHRcblx0ZGVmIG1vZCB2YWx1ZVxuXHRcdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdFx0cmV0dXJuIHZhbHVlLm1hcCBkbyBtb2QoJDEpXG5cdFx0aWYgQG1vZHM6dHJpbSBhbmQgdmFsdWUgaXNhIFN0cmluZ1xuXHRcdFx0dmFsdWUgPSB2YWx1ZS50cmltXG5cdFx0aWYgQG1vZHM6bnVtYmVyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpXG5cdFx0cmV0dXJuIHZhbHVlXG5cbmV4dGVuZCB0YWcgaW5wdXRcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cdFxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdG1vZGVsIGFuZCAhbW9kZWwubGF6eSA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2VcdFx0XG5cdFx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QG1vZGVsVmFsdWUgPSBAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdHJldHVybiBlLnNpbGVuY2UgdW5sZXNzIG1vZGVsXG5cdFx0XG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGNoZWNrZWQgPSBAZG9tOmNoZWNrZWRcblx0XHRcdGxldCBtdmFsID0gbW9kZWwuZ2V0XG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZSAhPSB1bmRlZmluZWQgPyBAdmFsdWUgOiB2YWx1ZVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImNoYW5nZVwiLHR5cGUsY2hlY2tlZCxkdmFsXG5cblx0XHRcdGlmIHR5cGUgPT0gJ3JhZGlvJ1xuXHRcdFx0XHRtb2RlbC5zZXQoZHZhbCx0cnVlKVxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHRtb2RlbC5zZXQoISFjaGVja2VkLHRydWUpXG5cdFx0XHRlbGlmIG1vZGVsLmlzQXJyYXlcblx0XHRcdFx0bGV0IGlkeCA9IG12YWwuaW5kZXhPZihkdmFsKVxuXHRcdFx0XHRpZiBjaGVja2VkIGFuZCBpZHggPT0gLTFcblx0XHRcdFx0XHRtdmFsLnB1c2goZHZhbClcblx0XHRcdFx0ZWxpZiAhY2hlY2tlZCBhbmQgaWR4ID49IDBcblx0XHRcdFx0XHRtdmFsLnNwbGljZShpZHgsMSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwuc2V0KGR2YWwpXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwuc2V0KHZhbHVlKVxuXHRcblx0IyBvdmVycmlkaW5nIGVuZCBkaXJlY3RseSBmb3IgcGVyZm9ybWFuY2Vcblx0ZGVmIGVuZFxuXHRcdHJldHVybiBzZWxmIGlmICFAbW9kZWwgb3IgQGxvY2FsVmFsdWUgIT09IHVuZGVmaW5lZFxuXHRcdGxldCBtdmFsID0gQG1vZGVsLmdldFxuXHRcdHJldHVybiBzZWxmIGlmIG12YWwgPT0gQG1vZGVsVmFsdWVcblx0XHRAbW9kZWxWYWx1ZSA9IG12YWwgdW5sZXNzIG1vZGVsLmlzQXJyYXlcblxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlXG5cdFx0XHRsZXQgY2hlY2tlZCA9IGlmIG1vZGVsLmlzQXJyYXlcblx0XHRcdFx0bXZhbC5pbmRleE9mKGR2YWwpID49IDBcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0ISFtdmFsXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG12YWwgPT0gQHZhbHVlXG5cblx0XHRcdEBkb206Y2hlY2tlZCA9IGNoZWNrZWRcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnZhbHVlID0gbXZhbFxuXHRcdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgdGV4dGFyZWFcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0QG1vZGVsIHx8PSBEYXRhVmFsdWUubmV3KHNlbGYsdmFsdWUsbW9kcylcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gdmFsdWUgaWYgQGxvY2FsVmFsdWUgPT0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRtb2RlbCBhbmQgIW1vZGVsLmxhenkgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdG1vZGVsID8gbW9kZWwuc2V0KHZhbHVlKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIGlmIEBsb2NhbFZhbHVlICE9IHVuZGVmaW5lZCBvciAhbW9kZWxcblx0XHRpZiBtb2RlbFxuXHRcdFx0QGRvbTp2YWx1ZSA9IG1vZGVsLmdldFxuXHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIG9wdGlvblxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB2YWx1ZVxuXHRcdEB2YWx1ZSBvciBkb206dmFsdWVcblxuZXh0ZW5kIHRhZyBzZWxlY3Rcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0QG1vZGVsIHx8PSBEYXRhVmFsdWUubmV3KHNlbGYsdmFsdWUsbW9kcylcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdEB2YWx1ZSA9IHZhbHVlXG5cdFx0XHRpZiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCdcblx0XHRcdFx0Zm9yIG9wdCxpIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdFx0bGV0IG92YWwgPSAob3B0LkB0YWcgPyBvcHQuQHRhZy52YWx1ZSA6IG9wdDp2YWx1ZSlcblx0XHRcdFx0XHRpZiB2YWx1ZSA9PSBvdmFsXG5cdFx0XHRcdFx0XHRkb206c2VsZWN0ZWRJbmRleCA9IGlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTp2YWx1ZSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHZhbHVlXG5cdFx0aWYgbXVsdGlwbGVcblx0XHRcdGZvciBvcHRpb24gaW4gZG9tOnNlbGVjdGVkT3B0aW9uc1xuXHRcdFx0XHRvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlXG5cdFx0ZWxzZVxuXHRcdFx0bGV0IG9wdCA9IGRvbTpzZWxlY3RlZE9wdGlvbnNbMF1cblx0XHRcdG9wdCA/IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKSA6IG51bGxcblx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0bW9kZWwgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gdW5sZXNzIG1vZGVsXG5cblx0XHRsZXQgbXZhbCA9IG1vZGVsLmdldFxuXHRcdCMgc3luYyBkb20gdmFsdWVcblx0XHRpZiBtdWx0aXBsZVxuXHRcdFx0Zm9yIG9wdGlvbiBpbiBkb206b3B0aW9uc1xuXHRcdFx0XHRsZXQgb3ZhbCA9IG1vZGVsLm1vZChvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlKVxuXHRcdFx0XHRsZXQgc2VsID0gbXZhbC5pbmRleE9mKG92YWwpID49IDBcblx0XHRcdFx0b3B0aW9uOnNlbGVjdGVkID0gc2VsXG5cdFx0ZWxzZVxuXHRcdFx0c2V0VmFsdWUobXZhbClcblx0XHRcdCMgd2hhdCBpZiBtdmFsIGlzIHJpY2g/IFdvdWxkIGJlIG5pY2Ugd2l0aCBzb21lIG1hcHBpbmdcblx0XHRcdCMgZG9tOnZhbHVlID0gbXZhbFxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIEltYmEuVG91Y2hcbiMgQmVnYW5cdEEgZmluZ2VyIHRvdWNoZWQgdGhlIHNjcmVlbi5cbiMgTW92ZWRcdEEgZmluZ2VyIG1vdmVkIG9uIHRoZSBzY3JlZW4uXG4jIFN0YXRpb25hcnlcdEEgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBzY3JlZW4gYnV0IGhhc24ndCBtb3ZlZC5cbiMgRW5kZWRcdEEgZmluZ2VyIHdhcyBsaWZ0ZWQgZnJvbSB0aGUgc2NyZWVuLiBUaGlzIGlzIHRoZSBmaW5hbCBwaGFzZSBvZiBhIHRvdWNoLlxuIyBDYW5jZWxlZCBUaGUgc3lzdGVtIGNhbmNlbGxlZCB0cmFja2luZyBmb3IgdGhlIHRvdWNoLlxuXG4jIyNcbkNvbnNvbGlkYXRlcyBtb3VzZSBhbmQgdG91Y2ggZXZlbnRzLiBUb3VjaCBvYmplY3RzIHBlcnNpc3QgYWNyb3NzIGEgdG91Y2gsXG5mcm9tIHRvdWNoc3RhcnQgdW50aWwgZW5kL2NhbmNlbC4gV2hlbiBhIHRvdWNoIHN0YXJ0cywgaXQgd2lsbCB0cmF2ZXJzZVxuZG93biBmcm9tIHRoZSBpbm5lcm1vc3QgdGFyZ2V0LCB1bnRpbCBpdCBmaW5kcyBhIG5vZGUgdGhhdCByZXNwb25kcyB0b1xub250b3VjaHN0YXJ0LiBVbmxlc3MgdGhlIHRvdWNoIGlzIGV4cGxpY2l0bHkgcmVkaXJlY3RlZCwgdGhlIHRvdWNoIHdpbGxcbmNhbGwgb250b3VjaG1vdmUgYW5kIG9udG91Y2hlbmQgLyBvbnRvdWNoY2FuY2VsIG9uIHRoZSByZXNwb25kZXIgd2hlbiBhcHByb3ByaWF0ZS5cblxuXHR0YWcgZHJhZ2dhYmxlXG5cdFx0IyBjYWxsZWQgd2hlbiBhIHRvdWNoIHN0YXJ0c1xuXHRcdGRlZiBvbnRvdWNoc3RhcnQgdG91Y2hcblx0XHRcdGZsYWcgJ2RyYWdnaW5nJ1xuXHRcdFx0c2VsZlxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggbW92ZXMgLSBzYW1lIHRvdWNoIG9iamVjdFxuXHRcdGRlZiBvbnRvdWNobW92ZSB0b3VjaFxuXHRcdFx0IyBtb3ZlIHRoZSBub2RlIHdpdGggdG91Y2hcblx0XHRcdGNzcyB0b3A6IHRvdWNoLmR5LCBsZWZ0OiB0b3VjaC5keFxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggZW5kc1xuXHRcdGRlZiBvbnRvdWNoZW5kIHRvdWNoXG5cdFx0XHR1bmZsYWcgJ2RyYWdnaW5nJ1xuXG5AaW5hbWUgdG91Y2hcbiMjI1xuY2xhc3MgSW1iYS5Ub3VjaFxuXHRzZWxmLkxhc3RUaW1lc3RhbXAgPSAwXG5cdHNlbGYuVGFwVGltZW91dCA9IDUwXG5cblx0IyB2YXIgbGFzdE5hdGl2ZVRvdWNoVGltZW91dCA9IDUwXG5cblx0dmFyIHRvdWNoZXMgPSBbXVxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBpZGVudGlmaWVycyA9IHt9XG5cblx0ZGVmIHNlbGYuY291bnRcblx0XHRjb3VudFxuXG5cdGRlZiBzZWxmLmxvb2t1cCBpdGVtXG5cdFx0cmV0dXJuIGl0ZW0gYW5kIChpdGVtOl9fdG91Y2hfXyBvciBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdKVxuXG5cdGRlZiBzZWxmLnJlbGVhc2UgaXRlbSx0b3VjaFxuXHRcdGRlbGV0ZSBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdXG5cdFx0ZGVsZXRlIGl0ZW06X190b3VjaF9fXG5cdFx0cmV0dXJuXG5cblx0ZGVmIHNlbGYub250b3VjaHN0YXJ0IGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRjb250aW51ZSBpZiBsb29rdXAodClcblx0XHRcdHZhciB0b3VjaCA9IGlkZW50aWZpZXJzW3Q6aWRlbnRpZmllcl0gPSBzZWxmLm5ldyhlKSAjIChlKVxuXHRcdFx0dDpfX3RvdWNoX18gPSB0b3VjaFxuXHRcdFx0dG91Y2hlcy5wdXNoKHRvdWNoKVxuXHRcdFx0Y291bnQrK1xuXHRcdFx0dG91Y2gudG91Y2hzdGFydChlLHQpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2htb3ZlIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2htb3ZlKGUsdClcblxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoZW5kIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hlbmQoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblxuXHRcdCMgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdCMgbm90IGFsd2F5cyBzdXBwb3J0ZWQhXG5cdFx0IyB0b3VjaGVzID0gdG91Y2hlcy5maWx0ZXIofHwpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hjYW5jZWwgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGNhbmNlbChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlZG93biBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vtb3ZlIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZXVwIGVcblx0XHRzZWxmXG5cblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgYWN0aXZlXG5cdHByb3AgZXZlbnRcblx0cHJvcCBwb2ludGVyXG5cdHByb3AgdGFyZ2V0XG5cdHByb3AgaGFuZGxlclxuXHRwcm9wIHVwZGF0ZXNcblx0cHJvcCBzdXBwcmVzc1xuXHRwcm9wIGRhdGFcblx0cHJvcCBidWJibGUgY2hhaW5hYmxlOiB5ZXNcblx0cHJvcCB0aW1lc3RhbXBcblxuXHRwcm9wIGdlc3R1cmVzXG5cblx0IyMjXG5cdEBpbnRlcm5hbFxuXHRAY29uc3RydWN0b3Jcblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIGV2ZW50LCBwb2ludGVyXG5cdFx0IyBAbmF0aXZlICA9IGZhbHNlXG5cdFx0c2VsZi5ldmVudCA9IGV2ZW50XG5cdFx0ZGF0YSA9IHt9XG5cdFx0YWN0aXZlID0geWVzXG5cdFx0QGJ1dHRvbiA9IGV2ZW50IGFuZCBldmVudDpidXR0b24gb3IgMFxuXHRcdEBzdXBwcmVzcyA9IG5vICMgZGVwcmVjYXRlZFxuXHRcdEBjYXB0dXJlZCA9IG5vXG5cdFx0YnViYmxlID0gbm9cblx0XHRwb2ludGVyID0gcG9pbnRlclxuXHRcdHVwZGF0ZXMgPSAwXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY2FwdHVyZVxuXHRcdEBjYXB0dXJlZCA9IHllc1xuXHRcdEBldmVudCBhbmQgQGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuXHRcdHVubGVzcyBAc2VsYmxvY2tlclxuXHRcdFx0QHNlbGJsb2NrZXIgPSBkbyB8ZXwgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgaXNDYXB0dXJlZFxuXHRcdCEhQGNhcHR1cmVkXG5cblx0IyMjXG5cdEV4dGVuZCB0aGUgdG91Y2ggd2l0aCBhIHBsdWdpbiAvIGdlc3R1cmUuIFxuXHRBbGwgZXZlbnRzICh0b3VjaHN0YXJ0LG1vdmUgZXRjKSBmb3IgdGhlIHRvdWNoXG5cdHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoZSBwbHVnaW5zIGluIHRoZSBvcmRlciB0aGV5XG5cdGFyZSBhZGRlZC5cblx0IyMjXG5cdGRlZiBleHRlbmQgcGx1Z2luXG5cdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGdlc3R1cmUhISFcIlxuXHRcdEBnZXN0dXJlcyB8fD0gW11cblx0XHRAZ2VzdHVyZXMucHVzaChwbHVnaW4pXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0b3VjaCB0byBzcGVjaWZpZWQgdGFyZ2V0LiBvbnRvdWNoc3RhcnQgd2lsbCBhbHdheXMgYmVcblx0Y2FsbGVkIG9uIHRoZSBuZXcgdGFyZ2V0LlxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0QHJlZGlyZWN0ID0gdGFyZ2V0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdXBwcmVzcyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIuIFdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCBmb3Jcblx0YWxsIG5hdGl2ZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdG91Y2guXG5cdCMjI1xuXHRkZWYgc3VwcHJlc3Ncblx0XHQjIGNvbGxpc2lvbiB3aXRoIHRoZSBzdXBwcmVzcyBwcm9wZXJ0eVxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgc3VwcHJlc3M9IHZhbHVlXG5cdFx0Y29uc29sZS53YXJuICdJbWJhLlRvdWNoI3N1cHByZXNzPSBpcyBkZXByZWNhdGVkJ1xuXHRcdEBzdXByZXNzID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoc3RhcnQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB0b3VjaCA9IHRcblx0XHRAYnV0dG9uID0gMFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2htb3ZlIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGVuZCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cblx0XHRJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXAgPSBlOnRpbWVTdGFtcFxuXG5cdFx0aWYgQG1heGRyIDwgMjBcblx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdGUucHJldmVudERlZmF1bHQgaWYgdGFwLkByZXNwb25kZXJcdFxuXG5cdFx0aWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdFxuXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGNhbmNlbCBlLHRcblx0XHRjYW5jZWxcblxuXHRkZWYgbW91c2Vkb3duIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAYnV0dG9uID0gZTpidXR0b25cblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2Vtb3ZlIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRAZXZlbnQgPSBlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBpc0NhcHR1cmVkXG5cdFx0dXBkYXRlXG5cdFx0bW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2V1cCBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkbGVcblx0XHR1cGRhdGVcblxuXHRkZWYgYmVnYW5cblx0XHRAdGltZXN0YW1wID0gRGF0ZS5ub3dcblx0XHRAbWF4ZHIgPSBAZHIgPSAwXG5cdFx0QHgwID0gQHhcblx0XHRAeTAgPSBAeVxuXG5cdFx0dmFyIGRvbSA9IGV2ZW50OnRhcmdldFxuXHRcdHZhciBub2RlID0gbnVsbFxuXG5cdFx0QHNvdXJjZVRhcmdldCA9IGRvbSBhbmQgdGFnKGRvbSlcblxuXHRcdHdoaWxlIGRvbVxuXHRcdFx0bm9kZSA9IHRhZyhkb20pXG5cdFx0XHRpZiBub2RlICYmIG5vZGU6b250b3VjaHN0YXJ0XG5cdFx0XHRcdEBidWJibGUgPSBub1xuXHRcdFx0XHR0YXJnZXQgPSBub2RlXG5cdFx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZilcblx0XHRcdFx0YnJlYWsgdW5sZXNzIEBidWJibGVcblx0XHRcdGRvbSA9IGRvbTpwYXJlbnROb2RlXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHR2YXIgZHIgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcblx0XHRAbWF4ZHIgPSBkciBpZiBkciA+IEBkclxuXHRcdEBkciA9IGRyXG5cblx0XHQjIGNhdGNoaW5nIGEgdG91Y2gtcmVkaXJlY3Q/IT9cblx0XHRpZiBAcmVkaXJlY3Rcblx0XHRcdGlmIEB0YXJnZXQgYW5kIEB0YXJnZXQ6b250b3VjaGNhbmNlbFxuXHRcdFx0XHRAdGFyZ2V0Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRcdHRhcmdldCA9IEByZWRpcmVjdFxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKSBpZiB0YXJnZXQ6b250b3VjaHN0YXJ0XG5cdFx0XHRyZXR1cm4gdXBkYXRlIGlmIEByZWRpcmVjdCAjIHBvc3NpYmx5IHJlZGlyZWN0aW5nIGFnYWluXG5cblxuXHRcdEB1cGRhdGVzKytcblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaHVwZGF0ZShzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaHVwZGF0ZShzZWxmKVxuXHRcdHVwZGF0ZSBpZiBAcmVkaXJlY3Rcblx0XHRzZWxmXG5cblx0ZGVmIG1vdmVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KSBpZiBnOm9udG91Y2htb3ZlXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KVxuXHRcdHNlbGZcblxuXHRkZWYgZW5kZWRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBjbGVhbnVwX1xuXHRcdGlmIEBtb3VzZW1vdmVcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0XG5cdFx0aWYgQHNlbGJsb2NrZXJcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRcdEBzZWxibG9ja2VyID0gbnVsbFxuXHRcdFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIGFic29sdXRlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgZnJvbSBzdGFydGluZyBwb3NpdGlvbiBcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGRyIGRvIEBkclxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBob3Jpem9udGFsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR4IGRvIEB4IC0gQHgwXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIHZlcnRpY2FsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR5IGRvIEB5IC0gQHkwXG5cblx0IyMjXG5cdEluaXRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeDAgZG8gQHgwXG5cblx0IyMjXG5cdEluaXRpYWwgdmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkwIGRvIEB5MFxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4IGRvIEB4XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5IGRvIEB5XG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eCBkb1xuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB4IC0gQHRhcmdldEJveDpsZWZ0XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHlcblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeSAtIEB0YXJnZXRCb3g6dG9wXG5cblx0IyMjXG5cdEJ1dHRvbiBwcmVzc2VkIGluIHRoaXMgdG91Y2guIE5hdGl2ZSB0b3VjaGVzIGRlZmF1bHRzIHRvIGxlZnQtY2xpY2sgKDApXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBidXR0b24gZG8gQGJ1dHRvbiAjIEBwb2ludGVyID8gQHBvaW50ZXIuYnV0dG9uIDogMFxuXG5cdGRlZiBzb3VyY2VUYXJnZXRcblx0XHRAc291cmNlVGFyZ2V0XG5cblx0ZGVmIGVsYXBzZWRcblx0XHREYXRlLm5vdyAtIEB0aW1lc3RhbXBcblxuXG5jbGFzcyBJbWJhLlRvdWNoR2VzdHVyZVxuXG5cdHByb3AgYWN0aXZlIGRlZmF1bHQ6IG5vXG5cblx0ZGVmIG9udG91Y2hzdGFydCBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNodXBkYXRlIGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2hlbmQgZVxuXHRcdHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnZhciBrZXlDb2RlcyA9IHtcblx0ZXNjOiAyNyxcblx0dGFiOiA5LFxuXHRlbnRlcjogMTMsXG5cdHNwYWNlOiAzMixcblx0dXA6IDM4LFxuXHRkb3duOiA0MFxufVxuXG52YXIgZWwgPSBJbWJhLlRhZzpwcm90b3R5cGVcbmRlZiBlbC5zdG9wTW9kaWZpZXIgZSBkbyBlLnN0b3AgfHwgdHJ1ZVxuZGVmIGVsLnByZXZlbnRNb2RpZmllciBlIGRvIGUucHJldmVudCB8fCB0cnVlXG5kZWYgZWwuc2lsZW5jZU1vZGlmaWVyIGUgZG8gZS5zaWxlbmNlIHx8IHRydWVcbmRlZiBlbC5idWJibGVNb2RpZmllciBlIGRvIGUuYnViYmxlKHllcykgfHwgdHJ1ZVxuZGVmIGVsLmN0cmxNb2RpZmllciBlIGRvIGUuZXZlbnQ6Y3RybEtleSA9PSB0cnVlXG5kZWYgZWwuYWx0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OmFsdEtleSA9PSB0cnVlXG5kZWYgZWwuc2hpZnRNb2RpZmllciBlIGRvIGUuZXZlbnQ6c2hpZnRLZXkgPT0gdHJ1ZVxuZGVmIGVsLm1ldGFNb2RpZmllciBlIGRvIGUuZXZlbnQ6bWV0YUtleSA9PSB0cnVlXG5kZWYgZWwua2V5TW9kaWZpZXIga2V5LCBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0ga2V5KSA6IHRydWVcbmRlZiBlbC5kZWxNb2RpZmllciBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0gOCBvciBlLmtleUNvZGUgPT0gNDYpIDogdHJ1ZVxuZGVmIGVsLnNlbGZNb2RpZmllciBlIGRvIGUuZXZlbnQ6dGFyZ2V0ID09IEBkb21cbmRlZiBlbC5sZWZ0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDApIDogZWwub24ka2V5KDM3LGUpXG5kZWYgZWwucmlnaHRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMikgOiBlbC5vbiRrZXkoMzksZSlcbmRlZiBlbC5taWRkbGVNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMSkgOiB0cnVlXG5kZWYgZWwuZ2V0SGFuZGxlciBzdHIgZG8gc2VsZltzdHJdXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgcHJlZml4XG5cblx0cHJvcCBkYXRhXG5cblx0cHJvcCByZXNwb25kZXJcblxuXHRkZWYgc2VsZi53cmFwIGVcblx0XHRzZWxmLm5ldyhlKVxuXHRcblx0ZGVmIGluaXRpYWxpemUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdEBidWJibGUgPSB5ZXNcblxuXHRkZWYgdHlwZT0gdHlwZVxuXHRcdEB0eXBlID0gdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0QHJldHVybiB7U3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgKGNhc2UtaW5zZW5zaXRpdmUpXG5cdCMjI1xuXHRkZWYgdHlwZVxuXHRcdEB0eXBlIHx8IGV2ZW50OnR5cGVcblx0XG5cdGRlZiBidXR0b24gZG8gZXZlbnQ6YnV0dG9uXG5cdGRlZiBrZXlDb2RlIGRvIGV2ZW50OmtleUNvZGVcblxuXHRkZWYgbmFtZVxuXHRcdEBuYW1lIHx8PSB0eXBlLnRvTG93ZXJDYXNlLnJlcGxhY2UoL1xcOi9nLCcnKVxuXG5cdCMgbWltYyBnZXRzZXRcblx0ZGVmIGJ1YmJsZSB2XG5cdFx0aWYgdiAhPSB1bmRlZmluZWRcblx0XHRcdHNlbGYuYnViYmxlID0gdlxuXHRcdFx0cmV0dXJuIHNlbGZcblx0XHRyZXR1cm4gQGJ1YmJsZVxuXG5cdGRlZiBidWJibGU9IHZcblx0XHRAYnViYmxlID0gdlxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3RvcFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBzdG9wUHJvcGFnYXRpb24gZG8gc3RvcFxuXHRkZWYgaGFsdCBkbyBzdG9wXG5cblx0IyBtaWdyYXRlIGZyb20gY2FuY2VsIHRvIHByZXZlbnRcblx0ZGVmIHByZXZlbnRcblx0XHRpZiBldmVudDpwcmV2ZW50RGVmYXVsdFxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRlbHNlXG5cdFx0XHRldmVudDpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZjpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBwcmV2ZW50RGVmYXVsdFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I3ByZXZlbnREZWZhdWx0IGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdCMjI1xuXHRJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgZXZlbnQuY2FuY2VsIGhhcyBiZWVuIGNhbGxlZC5cblxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIGlzUHJldmVudGVkXG5cdFx0ZXZlbnQgYW5kIGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgb3IgQGNhbmNlbFxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjY2FuY2VsIGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcHJvY2Vzc0hhbmRsZXJzIG5vZGUsIGhhbmRsZXJzXG5cdFx0bGV0IGkgPSAxXG5cdFx0bGV0IGwgPSBoYW5kbGVyczpsZW5ndGhcblx0XHRsZXQgYnViYmxlID0gQGJ1YmJsZVxuXHRcdGxldCBzdGF0ZSA9IGhhbmRsZXJzOnN0YXRlIHx8PSB7fVxuXHRcdGxldCByZXN1bHQgXG5cdFx0XG5cdFx0aWYgYnViYmxlXG5cdFx0XHRAYnViYmxlID0gMVxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdGxldCBpc01vZCA9IGZhbHNlXG5cdFx0XHRsZXQgaGFuZGxlciA9IGhhbmRsZXJzW2krK11cblx0XHRcdGxldCBwYXJhbXMgID0gbnVsbFxuXHRcdFx0bGV0IGNvbnRleHQgPSBub2RlXG5cdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHRcdHBhcmFtcyA9IGhhbmRsZXIuc2xpY2UoMSlcblx0XHRcdFx0aGFuZGxlciA9IGhhbmRsZXJbMF1cblx0XHRcdFxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0aWYga2V5Q29kZXNbaGFuZGxlcl1cblx0XHRcdFx0XHRwYXJhbXMgPSBba2V5Q29kZXNbaGFuZGxlcl1dXG5cdFx0XHRcdFx0aGFuZGxlciA9ICdrZXknXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGxldCBtb2QgPSBoYW5kbGVyICsgJ01vZGlmaWVyJ1xuXG5cdFx0XHRcdGlmIG5vZGVbbW9kXVxuXHRcdFx0XHRcdGlzTW9kID0geWVzXG5cdFx0XHRcdFx0cGFyYW1zID0gKHBhcmFtcyBvciBbXSkuY29uY2F0KFtzZWxmLHN0YXRlXSlcblx0XHRcdFx0XHRoYW5kbGVyID0gbm9kZVttb2RdXG5cdFx0XHRcblx0XHRcdCMgaWYgaXQgaXMgc3RpbGwgYSBzdHJpbmcgLSBjYWxsIGdldEhhbmRsZXIgb25cblx0XHRcdCMgYW5jZXN0b3Igb2Ygbm9kZSB0byBzZWUgaWYgd2UgZ2V0IGEgaGFuZGxlciBmb3IgdGhpcyBuYW1lXG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRsZXQgZWwgPSBub2RlXG5cdFx0XHRcdGxldCBmbiA9IG51bGxcblx0XHRcdFx0d2hpbGUgZWwgYW5kICghZm4gb3IgIShmbiBpc2EgRnVuY3Rpb24pKVxuXHRcdFx0XHRcdGlmIGZuID0gZWwuZ2V0SGFuZGxlcihoYW5kbGVyKVxuXHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuXG5cdFx0XHRcdFx0XHRjb250ZXh0ID0gZWxcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbCA9IGVsLnBhcmVudFxuXHRcdFx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyB3aGF0IGlmIHdlIGFjdHVhbGx5IGNhbGwgc3RvcCBpbnNpZGUgZnVuY3Rpb24/XG5cdFx0XHRcdCMgZG8gd2Ugc3RpbGwgd2FudCB0byBjb250aW51ZSB0aGUgY2hhaW4/XG5cdFx0XHRcdGxldCByZXMgPSBoYW5kbGVyLmFwcGx5KGNvbnRleHQscGFyYW1zIG9yIFtzZWxmXSlcblx0XHRcdFx0XG5cdFx0XHRcdCMgc2hvdWxkIHdlIHRha2UgYXdhaXRzIGludG8gYWNjb3VudD9cblx0XHRcdFx0IyB3YXMgYnViYmxpbmcgYmVmb3JlIC0gaGFzIG5vdCBiZWVuIG1vZGlmaWVkXG5cdFx0XHRcdGlmICFpc01vZFxuXHRcdFx0XHRcdGJ1YmJsZSA9IG5vICMgc3RvcCBwcm9wYWdhdGlvbiBieSBkZWZhdWx0XG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXG5cdFx0XHRcdGlmIHJlcyA9PSBmYWxzZVxuXHRcdFx0XHRcdCMgY29uc29sZS5sb2cgXCJyZXR1cm5lZCBmYWxzZSAtIGJyZWFraW5nXCJcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGlmIHJlcyBhbmQgIUBzaWxlbmNlZCBhbmQgcmVzOnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0cmVzLnRoZW4oSW1iYTpjb21taXQpXG5cdFx0XG5cdFx0IyBpZiB3ZSBoYXZlbnQgc3RvcHBlZCBvciBkZWFsdCB3aXRoIGJ1YmJsZSB3aGlsZSBoYW5kbGluZ1xuXHRcdGlmIEBidWJibGUgPT09IDFcblx0XHRcdEBidWJibGUgPSBidWJibGVcblxuXHRcdHJldHVybiBudWxsXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbmFtZSA9IHNlbGYubmFtZVxuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXHRcdHZhciByZXN1bHRcblx0XHR2YXIgaGFuZGxlcnNcblxuXHRcdHdoaWxlIGRvbW5vZGVcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdGxldCBub2RlID0gZG9tbm9kZS5AZG9tID8gZG9tbm9kZSA6IGRvbW5vZGUuQHRhZ1xuXG5cdFx0XHRpZiBub2RlXG5cdFx0XHRcdGlmIG5vZGVbbWV0aF0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXHRcdFx0XHRcdEBzaWxlbmNlZCA9IG5vXG5cdFx0XHRcdFx0cmVzdWx0ID0gYXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXG5cdFx0XHRcdGlmIGhhbmRsZXJzID0gbm9kZTpfb25fXG5cdFx0XHRcdFx0Zm9yIGhhbmRsZXIgaW4gaGFuZGxlcnMgd2hlbiBoYW5kbGVyXG5cdFx0XHRcdFx0XHRsZXQgaG5hbWUgPSBoYW5kbGVyWzBdXG5cdFx0XHRcdFx0XHRpZiBuYW1lID09IGhhbmRsZXJbMF0gYW5kIGJ1YmJsZSAjIGFuZCAoaG5hbWU6bGVuZ3RoID09IG5hbWU6bGVuZ3RoIG9yIGhuYW1lW25hbWU6bGVuZ3RoXSA9PSAnLicpXG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NIYW5kbGVycyhub2RlLGhhbmRsZXIpXG5cdFx0XHRcdFx0YnJlYWsgdW5sZXNzIGJ1YmJsZVxuXG5cdFx0XHRcdGlmIG5vZGU6b25ldmVudFxuXHRcdFx0XHRcdG5vZGUub25ldmVudChzZWxmKVxuXG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblxuXHRcdCMgaWYgYSBoYW5kbGVyIHJldHVybnMgYSBwcm9taXNlLCBub3RpZnkgc2NoZWR1bGVyc1xuXHRcdCMgYWJvdXQgdGhpcyBhZnRlciBwcm9taXNlIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nXG5cdFx0aWYgcmVzdWx0IGFuZCByZXN1bHQ6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdHJlc3VsdC50aGVuKHNlbGY6cHJvY2Vzc2VkLmJpbmQoc2VsZikpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRpZiAhQHNpbGVuY2VkIGFuZCBAcmVzcG9uZGVyXG5cdFx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSlcblx0XHRcdEltYmEuY29tbWl0KGV2ZW50KVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuIyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG4jIDIgLSBzdGF0aWMgc2hhcGUgYW5kIHN0YXRpYyBjaGlsZHJlblxuIyAzIC0gc2luZ2xlIGl0ZW1cbiMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG4jIDUgLSBvcHRpbWl6ZWQgY29sbGVjdGlvblxuXG5kZWYgcmVtb3ZlTmVzdGVkIHJvb3QsIG5vZGUsIGNhcmV0XG5cdCMgaWYgbm9kZS9ub2RlcyBpc2EgU3RyaW5nXG5cdCMgXHR3ZSBuZWVkIHRvIHVzZSB0aGUgY2FyZXQgdG8gcmVtb3ZlIGVsZW1lbnRzXG5cdCMgXHRmb3Igbm93IHdlIHdpbGwgc2ltcGx5IG5vdCBzdXBwb3J0IHRoaXNcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxtZW1iZXIsY2FyZXQpIGZvciBtZW1iZXIgaW4gbm9kZVxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGxcblx0XHQjIHdoYXQgaWYgdGhpcyBpcyBub3QgbnVsbD8hPyE/XG5cdFx0IyB0YWtlIGEgY2hhbmNlIGFuZCByZW1vdmUgYSB0ZXh0LWVsZW1lbnRuZ1xuXHRcdGxldCBuZXh0ID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0aWYgbmV4dCBpc2EgVGV4dCBhbmQgbmV4dDp0ZXh0Q29udGVudCA9PSBub2RlXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5leHQpXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgJ2Nhbm5vdCByZW1vdmUgc3RyaW5nJ1xuXG5cdHJldHVybiBjYXJldFxuXG5kZWYgYXBwZW5kTmVzdGVkIHJvb3QsIG5vZGVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZVtpKytdKSB3aGlsZSBpIDwga1xuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGwgYW5kIG5vZGUgIT09IGZhbHNlXG5cdFx0cm9vdC5hcHBlbmRDaGlsZCBJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0cmV0dXJuXG5cblxuIyBpbnNlcnQgbm9kZXMgYmVmb3JlIGEgY2VydGFpbiBub2RlXG4jIGRvZXMgbm90IG5lZWQgdG8gcmV0dXJuIGFueSB0YWlsLCBhcyBiZWZvcmVcbiMgd2lsbCBzdGlsbCBiZSBjb3JyZWN0IHRoZXJlXG4jIGJlZm9yZSBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQmVmb3JlIHJvb3QsIG5vZGUsIGJlZm9yZVxuXHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdGxldCBpID0gMFxuXHRcdGxldCBjID0gbm9kZTp0YWdsZW5cblx0XHRsZXQgayA9IGMgIT0gbnVsbCA/IChub2RlOmRvbWxlbiA9IGMpIDogbm9kZTpsZW5ndGhcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlW2krK10sYmVmb3JlKSB3aGlsZSBpIDwga1xuXG5cdGVsaWYgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0cm9vdC5pbnNlcnRCZWZvcmUobm9kZSxiZWZvcmUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSksYmVmb3JlKVxuXG5cdHJldHVybiBiZWZvcmVcblxuIyBhZnRlciBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQWZ0ZXIgcm9vdCwgbm9kZSwgYWZ0ZXJcblx0dmFyIGJlZm9yZSA9IGFmdGVyID8gYWZ0ZXI6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGlmIGJlZm9yZVxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG5vZGUsYmVmb3JlKVxuXHRcdHJldHVybiBiZWZvcmU6cHJldmlvdXNTaWJsaW5nXG5cdGVsc2Vcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxub2RlKVxuXHRcdHJldHVybiByb290LkBkb206bGFzdENoaWxkXG5cbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHR2YXIgbmV3TGVuID0gbmV3Omxlbmd0aFxuXHR2YXIgbGFzdE5ldyA9IG5ld1tuZXdMZW4gLSAxXVxuXG5cdCMgVGhpcyByZS1vcmRlciBhbGdvcml0aG0gaXMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBwcmluY2lwbGU6XG5cdCMgXG5cdCMgV2UgYnVpbGQgYSBcImNoYWluXCIgd2hpY2ggc2hvd3Mgd2hpY2ggaXRlbXMgYXJlIGFscmVhZHkgc29ydGVkLlxuXHQjIElmIHdlJ3JlIGdvaW5nIGZyb20gWzEsIDIsIDNdIC0+IFsyLCAxLCAzXSwgdGhlIHRyZWUgbG9va3MgbGlrZTpcblx0I1xuXHQjIFx0MyAtPiAgMCAoaWR4KVxuXHQjIFx0MiAtPiAtMSAoaWR4KVxuXHQjIFx0MSAtPiAtMSAoaWR4KVxuXHQjXG5cdCMgVGhpcyB0ZWxscyB1cyB0aGF0IHdlIGhhdmUgdHdvIGNoYWlucyBvZiBvcmRlcmVkIGl0ZW1zOlxuXHQjIFxuXHQjIFx0KDEsIDMpIGFuZCAoMilcblx0IyBcblx0IyBUaGUgb3B0aW1hbCByZS1vcmRlcmluZyB0aGVuIGJlY29tZXMgdG8ga2VlcCB0aGUgbG9uZ2VzdCBjaGFpbiBpbnRhY3QsXG5cdCMgYW5kIG1vdmUgYWxsIHRoZSBvdGhlciBpdGVtcy5cblxuXHR2YXIgbmV3UG9zaXRpb24gPSBbXVxuXG5cdCMgVGhlIHRyZWUvZ3JhcGggaXRzZWxmXG5cdHZhciBwcmV2Q2hhaW4gPSBbXVxuXHQjIFRoZSBsZW5ndGggb2YgdGhlIGNoYWluXG5cdHZhciBsZW5ndGhDaGFpbiA9IFtdXG5cblx0IyBLZWVwIHRyYWNrIG9mIHRoZSBsb25nZXN0IGNoYWluXG5cdHZhciBtYXhDaGFpbkxlbmd0aCA9IDBcblx0dmFyIG1heENoYWluRW5kID0gMFxuXG5cdHZhciBoYXNUZXh0Tm9kZXMgPSBub1xuXHR2YXIgbmV3UG9zXG5cblx0Zm9yIG5vZGUsIGlkeCBpbiBvbGRcblx0XHQjIHNwZWNpYWwgY2FzZSBmb3IgVGV4dCBub2Rlc1xuXHRcdGlmIG5vZGUgYW5kIG5vZGU6bm9kZVR5cGUgPT0gM1xuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZTp0ZXh0Q29udGVudClcblx0XHRcdG5ld1tuZXdQb3NdID0gbm9kZSBpZiBuZXdQb3MgPj0gMFxuXHRcdFx0aGFzVGV4dE5vZGVzID0geWVzXG5cdFx0ZWxzZVxuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZSlcblxuXHRcdG5ld1Bvc2l0aW9uLnB1c2gobmV3UG9zKVxuXG5cdFx0aWYgbmV3UG9zID09IC0xXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdFx0XHRwcmV2Q2hhaW4ucHVzaCgtMSlcblx0XHRcdGxlbmd0aENoYWluLnB1c2goLTEpXG5cdFx0XHRjb250aW51ZVxuXG5cdFx0dmFyIHByZXZJZHggPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAyXG5cblx0XHQjIEJ1aWxkIHRoZSBjaGFpbjpcblx0XHR3aGlsZSBwcmV2SWR4ID49IDBcblx0XHRcdGlmIG5ld1Bvc2l0aW9uW3ByZXZJZHhdID09IC0xXG5cdFx0XHRcdHByZXZJZHgtLVxuXHRcdFx0ZWxpZiBuZXdQb3MgPiBuZXdQb3NpdGlvbltwcmV2SWR4XVxuXHRcdFx0XHQjIFlheSwgd2UncmUgYmlnZ2VyIHRoYW4gdGhlIHByZXZpb3VzIVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIE5vcGUsIGxldCdzIHdhbGsgYmFjayB0aGUgY2hhaW5cblx0XHRcdFx0cHJldklkeCA9IHByZXZDaGFpbltwcmV2SWR4XVxuXG5cdFx0cHJldkNoYWluLnB1c2gocHJldklkeClcblxuXHRcdHZhciBjdXJyTGVuZ3RoID0gKHByZXZJZHggPT0gLTEpID8gMCA6IGxlbmd0aENoYWluW3ByZXZJZHhdKzFcblxuXHRcdGlmIGN1cnJMZW5ndGggPiBtYXhDaGFpbkxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5MZW5ndGggPSBjdXJyTGVuZ3RoXG5cdFx0XHRtYXhDaGFpbkVuZCA9IGlkeFxuXG5cdFx0bGVuZ3RoQ2hhaW4ucHVzaChjdXJyTGVuZ3RoKVxuXG5cdHZhciBzdGlja3lOb2RlcyA9IFtdXG5cblx0IyBOb3cgd2UgY2FuIHdhbGsgdGhlIGxvbmdlc3QgY2hhaW4gYmFja3dhcmRzIGFuZCBtYXJrIHRoZW0gYXMgXCJzdGlja3lcIixcblx0IyB3aGljaCBpbXBsaWVzIHRoYXQgdGhleSBzaG91bGQgbm90IGJlIG1vdmVkXG5cdHZhciBjdXJzb3IgPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAxXG5cdHdoaWxlIGN1cnNvciA+PSAwXG5cdFx0aWYgY3Vyc29yID09IG1heENoYWluRW5kIGFuZCBuZXdQb3NpdGlvbltjdXJzb3JdICE9IC0xXG5cdFx0XHRzdGlja3lOb2Rlc1tuZXdQb3NpdGlvbltjdXJzb3JdXSA9IHRydWVcblx0XHRcdG1heENoYWluRW5kID0gcHJldkNoYWluW21heENoYWluRW5kXVxuXG5cdFx0Y3Vyc29yIC09IDFcblxuXHQjIHBvc3NpYmxlIHRvIGRvIHRoaXMgaW4gcmV2ZXJzZWQgb3JkZXIgaW5zdGVhZD9cblx0Zm9yIG5vZGUsIGlkeCBpbiBuZXdcblx0XHRpZiAhc3RpY2t5Tm9kZXNbaWR4XVxuXHRcdFx0IyBjcmVhdGUgdGV4dG5vZGUgZm9yIHN0cmluZywgYW5kIHVwZGF0ZSB0aGUgYXJyYXlcblx0XHRcdHVubGVzcyBub2RlIGFuZCBub2RlLkBkb21cblx0XHRcdFx0bm9kZSA9IG5ld1tpZHhdID0gSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0XHR2YXIgYWZ0ZXIgPSBuZXdbaWR4IC0gMV1cblx0XHRcdGluc2VydE5lc3RlZEFmdGVyKHJvb3QsIG5vZGUsIChhZnRlciBhbmQgYWZ0ZXIuQGRvbSBvciBhZnRlciBvciBjYXJldCkpXG5cblx0XHRjYXJldCA9IG5vZGUuQGRvbSBvciAoY2FyZXQgYW5kIGNhcmV0Om5leHRTaWJsaW5nIG9yIHJvb3QuQGRvbTpmaXJzdENoaWxkKVxuXG5cdCMgc2hvdWxkIHRydXN0IHRoYXQgdGhlIGxhc3QgaXRlbSBpbiBuZXcgbGlzdCBpcyB0aGUgY2FyZXRcblx0cmV0dXJuIGxhc3ROZXcgYW5kIGxhc3ROZXcuQGRvbSBvciBjYXJldFxuXG5cbiMgZXhwZWN0cyBhIGZsYXQgbm9uLXNwYXJzZSBhcnJheSBvZiBub2RlcyBpbiBib3RoIG5ldyBhbmQgb2xkLCBhbHdheXNcbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXHR2YXIgayA9IG5ldzpsZW5ndGhcblx0dmFyIGkgPSBrXG5cdHZhciBsYXN0ID0gbmV3W2sgLSAxXVxuXG5cblx0aWYgayA9PSBvbGQ6bGVuZ3RoIGFuZCBuZXdbMF0gPT09IG9sZFswXVxuXHRcdCMgcnVubmluZyB0aHJvdWdoIHRvIGNvbXBhcmVcblx0XHR3aGlsZSBpLS1cblx0XHRcdGJyZWFrIGlmIG5ld1tpXSAhPT0gb2xkW2ldXG5cblx0aWYgaSA9PSAtMVxuXHRcdHJldHVybiBsYXN0IGFuZCBsYXN0LkBkb20gb3IgbGFzdCBvciBjYXJldFxuXHRlbHNlXG5cdFx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBUWVBFIDUgLSB3ZSBrbm93IHRoYXQgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbmdsZSBhcnJheSBvZlxuIyBrZXllZCB0YWdzIC0gYW5kIHJvb3QgaGFzIG5vIG90aGVyIGNoaWxkcmVuXG5kZWYgcmVjb25jaWxlTG9vcCByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIG5sID0gbmV3Omxlbmd0aFxuXHR2YXIgb2wgPSBvbGQ6bGVuZ3RoXG5cdHZhciBjbCA9IG5ldzpjYWNoZTppJCAjIGNhY2hlLWxlbmd0aFxuXHR2YXIgaSA9IDAsIGQgPSBubCAtIG9sXG5cblx0IyBmaW5kIHRoZSBmaXJzdCBpbmRleCB0aGF0IGlzIGRpZmZlcmVudFxuXHRpKysgd2hpbGUgaSA8IG9sIGFuZCBpIDwgbmwgYW5kIG5ld1tpXSA9PT0gb2xkW2ldXG5cdFxuXHQjIGNvbmRpdGlvbmFsbHkgcHJ1bmUgY2FjaGVcblx0aWYgY2wgPiAxMDAwIGFuZCAoY2wgLSBubCkgPiA1MDBcblx0XHRuZXc6Y2FjaGU6JHBydW5lKG5ldylcblx0XG5cdGlmIGQgPiAwIGFuZCBpID09IG9sXG5cdFx0IyBhZGRlZCBhdCBlbmRcblx0XHRyb290LmFwcGVuZENoaWxkKG5ld1tpKytdKSB3aGlsZSBpIDwgbmxcblx0XHRyZXR1cm5cblx0XG5cdGVsaWYgZCA+IDBcblx0XHRsZXQgaTEgPSBubFxuXHRcdGkxLS0gd2hpbGUgaTEgPiBpIGFuZCBuZXdbaTEgLSAxXSA9PT0gb2xkW2kxIC0gMSAtIGRdXG5cblx0XHRpZiBkID09IChpMSAtIGkpXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgaW4gY2h1bmtcIixpLGkxXG5cdFx0XHRsZXQgYmVmb3JlID0gb2xkW2ldLkBkb21cblx0XHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5ld1tpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRlbGlmIGQgPCAwIGFuZCBpID09IG5sXG5cdFx0IyByZW1vdmVkIGF0IGVuZFxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBvbFxuXHRcdHJldHVyblxuXHRlbGlmIGQgPCAwXG5cdFx0bGV0IGkxID0gb2xcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMSArIGRdID09PSBvbGRbaTEgLSAxXVxuXG5cdFx0aWYgZCA9PSAoaSAtIGkxKVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGRbaSsrXSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblxuXHRlbGlmIGkgPT0gbmxcblx0XHRyZXR1cm5cblxuXHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMocm9vdCxuZXcsb2xkLGNhcmV0KVxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlSW5kZXhlZEFycmF5IHJvb3QsIGFycmF5LCBvbGQsIGNhcmV0XG5cdHZhciBuZXdMZW4gPSBhcnJheTp0YWdsZW5cblx0dmFyIHByZXZMZW4gPSBhcnJheTpkb21sZW4gb3IgMFxuXHR2YXIgbGFzdCA9IG5ld0xlbiA/IGFycmF5W25ld0xlbiAtIDFdIDogbnVsbFxuXHQjIGNvbnNvbGUubG9nIFwicmVjb25jaWxlIG9wdGltaXplZCBhcnJheSghKVwiLGNhcmV0LG5ld0xlbixwcmV2TGVuLGFycmF5XG5cblx0aWYgcHJldkxlbiA+IG5ld0xlblxuXHRcdHdoaWxlIHByZXZMZW4gPiBuZXdMZW5cblx0XHRcdHZhciBpdGVtID0gYXJyYXlbLS1wcmV2TGVuXVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChpdGVtLkBkb20pXG5cblx0ZWxpZiBuZXdMZW4gPiBwcmV2TGVuXG5cdFx0IyBmaW5kIHRoZSBpdGVtIHRvIGluc2VydCBiZWZvcmVcblx0XHRsZXQgcHJldkxhc3QgPSBwcmV2TGVuID8gYXJyYXlbcHJldkxlbiAtIDFdLkBkb20gOiBjYXJldFxuXHRcdGxldCBiZWZvcmUgPSBwcmV2TGFzdCA/IHByZXZMYXN0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcblx0XHR3aGlsZSBwcmV2TGVuIDwgbmV3TGVuXG5cdFx0XHRsZXQgbm9kZSA9IGFycmF5W3ByZXZMZW4rK11cblx0XHRcdGJlZm9yZSA/IHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUuQGRvbSxiZWZvcmUpIDogcm9vdC5hcHBlbmRDaGlsZChub2RlLkBkb20pXG5cdFx0XHRcblx0YXJyYXk6ZG9tbGVuID0gbmV3TGVuXG5cdHJldHVybiBsYXN0ID8gbGFzdC5AZG9tIDogY2FyZXRcblxuXG4jIHRoZSBnZW5lcmFsIHJlY29uY2lsZXIgdGhhdCByZXNwZWN0cyBjb25kaXRpb25zIGV0Y1xuIyBjYXJldCBpcyB0aGUgY3VycmVudCBub2RlIHdlIHdhbnQgdG8gaW5zZXJ0IHRoaW5ncyBhZnRlclxuZGVmIHJlY29uY2lsZU5lc3RlZCByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHQjIHZhciBza2lwbmV3ID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZSBvciBuZXcgPT09IHRydWVcblx0dmFyIG5ld0lzTnVsbCA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Vcblx0dmFyIG9sZElzTnVsbCA9IG9sZCA9PSBudWxsIG9yIG9sZCA9PT0gZmFsc2VcblxuXG5cdGlmIG5ldyA9PT0gb2xkXG5cdFx0IyByZW1lbWJlciB0aGF0IHRoZSBjYXJldCBtdXN0IGJlIGFuIGFjdHVhbCBkb20gZWxlbWVudFxuXHRcdCMgd2Ugc2hvdWxkIGluc3RlYWQgbW92ZSB0aGUgYWN0dWFsIGNhcmV0PyAtIHRydXN0XG5cdFx0aWYgbmV3SXNOdWxsXG5cdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRlbGlmIG5ldy5AZG9tXG5cdFx0XHRyZXR1cm4gbmV3LkBkb21cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG5ldzp0YWdsZW4gIT0gbnVsbFxuXHRcdFx0cmV0dXJuIHJlY29uY2lsZUluZGV4ZWRBcnJheShyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWNcblx0XHRcdFx0XHRmb3IgaXRlbSxpIGluIG5ld1xuXHRcdFx0XHRcdFx0IyB0aGlzIGlzIHdoZXJlIHdlIGNvdWxkIGRvIHRoZSB0cmlwbGUgZXF1YWwgZGlyZWN0bHlcblx0XHRcdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHJvb3QsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpXG5cdFx0XHRcdFx0XG5cdFx0XHRcdCMgaWYgdGhleSBhcmUgbm90IHRoZSBzYW1lIHdlIGNvbnRpbnVlIHRocm91Z2ggdG8gdGhlIGRlZmF1bHRcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb24ocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsaWYgIW9sZElzTnVsbFxuXHRcdFx0aWYgb2xkLkBkb21cblx0XHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgb2xkIHdhcyBhIHN0cmluZy1saWtlIG9iamVjdD9cblx0XHRcdFx0cm9vdC5yZW1vdmVDaGlsZChjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGQpXG5cblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cdFx0IyByZW1vdmUgb2xkXG5cblx0ZWxpZiAhbmV3SXNOdWxsIGFuZCBuZXcuQGRvbVxuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblxuXHRlbGlmIG5ld0lzTnVsbFxuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdHJldHVybiBjYXJldFxuXHRlbHNlXG5cdFx0IyBpZiBvbGQgZGlkIG5vdCBleGlzdCB3ZSBuZWVkIHRvIGFkZCBhIG5ldyBkaXJlY3RseVxuXHRcdGxldCBuZXh0Tm9kZVxuXHRcdCMgaWYgb2xkIHdhcyBhcnJheSBvciBpbWJhdGFnIHdlIG5lZWQgdG8gcmVtb3ZlIGl0IGFuZCB0aGVuIGFkZFxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRlbGlmIG9sZCBhbmQgb2xkLkBkb21cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkKVxuXHRcdGVsaWYgIW9sZElzTnVsbFxuXHRcdFx0IyAuLi5cblx0XHRcdG5leHROb2RlID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRpZiBuZXh0Tm9kZSBpc2EgVGV4dCBhbmQgbmV4dE5vZGU6dGV4dENvbnRlbnQgIT0gbmV3XG5cdFx0XHRcdG5leHROb2RlOnRleHRDb250ZW50ID0gbmV3XG5cdFx0XHRcdHJldHVybiBuZXh0Tm9kZVxuXG5cdFx0IyBub3cgYWRkIHRoZSB0ZXh0bm9kZVxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblxuXG5leHRlbmQgdGFnIGVsZW1lbnRcblxuXHRkZWYgc2V0Q2hpbGRyZW4gbmV3LCB0eXBcblx0XHR2YXIgb2xkID0gQHRyZWVfXG5cblx0XHRpZiBuZXcgPT09IG9sZCBhbmQgbmV3IGFuZCBuZXc6dGFnbGVuID09IHVuZGVmaW5lZFxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmICFvbGQgYW5kIHR5cCAhPSAzXG5cdFx0XHRlbXB0eVxuXHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXG5cdFx0ZWxpZiB0eXAgPT0gMVxuXHRcdFx0IyBoZXJlIHdlIF9rbm93IF90aGF0IGl0IGlzIGFuIGFycmF5IHdpdGggdGhlIHNhbWUgc2hhcGVcblx0XHRcdCMgZXZlcnkgdGltZVxuXHRcdFx0bGV0IGNhcmV0ID0gbnVsbFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0IyBwcmV2ID0gb2xkW2ldXG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdCMgdGhpcyBpcyBwb3NzaWJseSBmdWxseSBkeW5hbWljLiBJdCBvZnRlbiBpc1xuXHRcdFx0IyBidXQgdGhlIG9sZCBvciBuZXcgY291bGQgYmUgc3RhdGljIHdoaWxlIHRoZSBvdGhlciBpcyBub3Rcblx0XHRcdCMgdGhpcyBpcyBub3QgaGFuZGxlZCBub3dcblx0XHRcdCMgd2hhdCBpZiBpdCB3YXMgcHJldmlvdXNseSBhIHN0YXRpYyBhcnJheT8gZWRnZWNhc2UgLSBidXQgbXVzdCB3b3JrXG5cdFx0XHQjIGNvdWxkIHdlIHNpbXBseSBkbyByZXBsYWNlLWNoaWxkP1xuXHRcdFx0aWYgbmV3IGFuZCBuZXcuQGRvbVxuXHRcdFx0XHRlbXB0eVxuXHRcdFx0XHRhcHBlbmRDaGlsZChuZXcpXG5cblx0XHRcdCMgY2hlY2sgaWYgb2xkIGFuZCBuZXcgaXNhIGFycmF5XG5cdFx0XHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRcdFx0aWYgbmV3OnN0YXRpYyA9PSA1IGFuZCBvbGQgYW5kIG9sZDpzdGF0aWMgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGVtcHR5XG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0XHRcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGV4dCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdFx0XHRcblx0XHRlbGlmIHR5cCA9PSA0XG5cdFx0XHRyZWNvbmNpbGVJbmRleGVkQXJyYXkoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcblx0XHRlbGlmIHR5cCA9PSA1XG5cdFx0XHRyZWNvbmNpbGVMb29wKHNlbGYsbmV3LG9sZCxudWxsKVxuXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBvbGQgaXNhIEFycmF5XG5cdFx0XHRyZWNvbmNpbGVOZXN0ZWQoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0ZWxzZVxuXHRcdFx0ZW1wdHlcblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdEB0cmVlXyA9IG5ld1xuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGNvbnRlbnRcblx0XHRAY29udGVudCBvciBjaGlsZHJlbi50b0FycmF5XG5cdFxuXHRkZWYgc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdHJlZV9cblx0XHRcdHZhciB2YWwgPSB0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0XG5cdFx0XHQoQHRleHRfIG9yIEBkb20pOnRleHRDb250ZW50ID0gdmFsXG5cdFx0XHRAdGV4dF8gfHw9IEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHNlbGZcblxuIyBpZiAkd2ViJFxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBwcm90byA9IEltYmEuVGFnOnByb3RvdHlwZVxudmFyIGFwcGxlID0gdHlwZW9mIG5hdmlnYXRvciAhPSAndW5kZWZpbmVkJyBhbmQgKG5hdmlnYXRvcjp2ZW5kb3Igb3IgJycpLmluZGV4T2YoJ0FwcGxlJykgPT0gMFxuaWYgYXBwbGVcblx0ZGVmIHByb3RvLnNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHRAZG9tOnRleHRDb250ZW50ID0gKHRleHQgPT09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UgPyAnJyA6IHRleHQpXG5cdFx0XHRAdHJlZV8gPSB0ZXh0XG5cdFx0cmV0dXJuIHNlbGZcbiMgb3B0aW1pemF0aW9uXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG52YXIgZ2NhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdHNlbGZcblxuXHRkZWYgcmVzZXRcblx0XHRjYWNoZSA9IHt9XG5cdFx0c2VsZlxuXG5cdGRlZiByb3V0ZXJcblx0XHRAcm91dGVyIHx8PSBSb3V0ZXIubmV3KHNlbGYpXG5cblx0ZGVmIHBhdGhcblx0XHQkd2ViJCA/IEBsb2M6cGF0aG5hbWUgOiByZXE6cGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0JHdlYiQgPyBAbG9jOmhhc2guc3Vic3RyKDEpIDogJydcblxuXHRkZWYgZG9jIHNyY1xuXHRcdEBkb2NzW3NyY10gfHw9IERvYy5uZXcoc3JjLHNlbGYpXG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IGdjYWNoZVtzcmNdXG5cdFx0XHRsZXQgcHJvbWlzZSA9IHt0aGVuOiAofGNifCBjYihnY2FjaGVbc3JjXSkpIH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHByb21pc2UgaWYgcmVzXG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nIFwidHJ5IHRvIGZldGNoIHtzcmN9XCJcblx0XHRcdFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdGlmIHNyYy5tYXRjaCgvXFwubWQkLylcblx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdCMgc2hvdWxkIGFsc28gaW5jbHVkZSBtZD9cblx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRsZXQgaHRtbCA9IGhsLkhpZ2hsaWdodGVyLmhpZ2hsaWdodChib2R5LHttb2RlOiAnZnVsbCd9KVxuXHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblxuXHRcdFx0Y2FjaGVbc3JjXSA9IGdjYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cblx0XHRpZiAkbm9kZSRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRpZiAhcmVzXG5cdFx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdFx0aWYgc3JjLm1hdGNoKC9cXC5tZCQvKVxuXHRcdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdFx0IyBzaG91bGQgYWxzbyBpbmNsdWRlIG1kP1xuXHRcdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRcdGxldCBodG1sID0gaGwuSGlnaGxpZ2h0ZXIuaGlnaGxpZ2h0KGJvZHkse21vZGU6ICdmdWxsJ30pXG5cdFx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cdFx0XHRcblx0XHRcdGRlcHNbc3JjXSB8fD0gcmVzXG5cdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdGVsc2Vcblx0XHRcdCMgc2hvdWxkIGd1YXJkIGFnYWluc3QgbXVsdGlwbGUgbG9hZHNcblx0XHRcdGlmIHJlc1xuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0XHRyZXR1cm4ge3RoZW46IChkbyB8dnwgdihyZXMpKX0gIyBmYWtlIHByb21pc2UgaGFja1xuXG5cdFx0XHR2YXIgeGhyID0gWE1MSHR0cFJlcXVlc3QubmV3XG5cdFx0XHR4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcgZG8gfHJlc3xcblx0XHRcdFx0cmVzID0gZGVwc1tzcmNdID0gSlNPTi5wYXJzZSh4aHI6cmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0eGhyLm9wZW4oXCJHRVRcIiwgc3JjKVxuXHRcdFx0eGhyLnNlbmRcblxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGlzc3Vlc1xuXHRcdEBpc3N1ZXMgfHw9IERvYy5nZXQoJy9pc3N1ZXMvYWxsJywnanNvbicpXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAuaW1iYSIsImV4dGVybiBoaXN0b3J5LCBnYVxuXG5leHBvcnQgY2xhc3MgUm91dGVyXG5cblx0cHJvcCBwYXRoXG5cblx0ZGVmIHNlbGYuc2x1ZyBzdHJcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLnRvTG93ZXJDYXNlICMgdHJpbVxuXG5cdFx0dmFyIGZyb20gPSBcIsOgw6HDpMOiw6XDqMOpw6vDqsOsw63Dr8Ouw7LDs8O2w7TDucO6w7zDu8Oxw6fCty9fLDo7XCJcblx0XHR2YXIgdG8gICA9IFwiYWFhYWFlZWVlaWlpaW9vb291dXV1bmMtLS0tLS1cIlxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9bXmEtejAtOSAtXS9nLCAnJykgIyByZW1vdmUgaW52YWxpZCBjaGFyc1xuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICctJykgIyBjb2xsYXBzZSB3aGl0ZXNwYWNlIGFuZCByZXBsYWNlIGJ5IC1cblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvLSsvZywgJy0nKSAjIGNvbGxhcHNlIGRhc2hlc1xuXG5cdFx0cmV0dXJuIHN0clxuXG5cdGRlZiBpbml0aWFsaXplIGFwcFxuXHRcdEBhcHAgPSBhcHBcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHR3aW5kb3c6b25wb3BzdGF0ZSA9IGRvIHxlfFxuXHRcdFx0XHRyZWZyZXNoXG5cblx0XHRzZWxmXG5cblx0ZGVmIHJlZnJlc2hcblx0XHRpZiAkd2ViJFxuXHRcdFx0ZG9jdW1lbnQ6Ym9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm91dGUnLHNlZ21lbnQoMCkpXG5cdFx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgcGF0aFxuXHRcdEBhcHAucGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0QGFwcC5oYXNoXG5cblx0ZGVmIGV4dFxuXHRcdHZhciBwYXRoID0gcGF0aFxuXHRcdHZhciBtID0gcGF0aC5tYXRjaCgvXFwuKFteXFwvXSspJC8pXG5cdFx0bSBhbmQgbVsxXSBvciAnJ1xuXG5cdGRlZiBzZWdtZW50IG5yID0gMFxuXHRcdHBhdGguc3BsaXQoJy8nKVtuciArIDFdIG9yICcnXG5cblx0ZGVmIGdvIGhyZWYsIHN0YXRlID0ge30sIHJlcGxhY2UgPSBub1xuXHRcdGlmIGhyZWYgPT0gJy9pbnN0YWxsJ1xuXHRcdFx0IyByZWRpcmVjdHMgaGVyZVxuXHRcdFx0aHJlZiA9ICcvZ3VpZGVzI3RvYy1pbnN0YWxsYXRpb24nXG5cdFx0XHRcblx0XHRpZiByZXBsYWNlXG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0ZWxzZVxuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsbnVsbCxocmVmKVxuXHRcdFx0cmVmcmVzaFxuXHRcdFx0IyBnYSgnc2VuZCcsICdwYWdldmlldycsIGhyZWYpXG5cblx0XHRpZiAhaHJlZi5tYXRjaCgvXFwjLylcblx0XHRcdHdpbmRvdy5zY3JvbGxUbygwLDApXG5cdFxuXHRcdHNlbGZcblxuXHRkZWYgc2NvcGVkIHJlZywgcGFydFxuXHRcdHZhciBwYXRoID0gcGF0aCArICcjJyArIGhhc2hcblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0dmFyIG54dCA9IHBhdGhbcmVnOmxlbmd0aF1cblx0XHRcdHBhdGguc3Vic3RyKDAscmVnOmxlbmd0aCkgPT0gcmVnIGFuZCAoIW54dCBvciBueHQgPT0gJy0nIG9yIG54dCA9PSAnLycgb3Igbnh0ID09ICcjJyBvciBueHQgPT0gJz8nIG9yIG54dCA9PSAnXycpXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuXHRkZWYgbWF0Y2ggcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXG5cdFx0aWYgcmVnIGlzYSBTdHJpbmdcblx0XHRcdHBhdGggPT0gcmVnXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdGF0dHIgcm91dGVcblxuXHRkZWYgcm91dGVyXG5cdFx0YXBwLnJvdXRlclxuXG5cdGRlZiByZXJvdXRlXG5cdFx0dmFyIHNjb3BlZCA9IHJvdXRlci5zY29wZWQocm91dGUsc2VsZilcblx0XHRmbGFnKCdzY29wZWQnLHNjb3BlZClcblx0XHRmbGFnKCdzZWxlY3RlZCcscm91dGVyLm1hdGNoKHJvdXRlLHNlbGYpKVxuXHRcdGlmIHNjb3BlZCAhPSBAc2NvcGVkXG5cdFx0XHRAc2NvcGVkID0gc2NvcGVkXG5cdFx0XHRzY29wZWQgPyBkaWRzY29wZSA6IGRpZHVuc2NvcGVcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBkaWRzY29wZVxuXHRcdHNlbGZcblxuXHRkZWYgZGlkdW5zY29wZVxuXHRcdHNlbGZcblxuIyBleHRlbmQgbGlua3NcbmV4dGVuZCB0YWcgYVxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0QHJvdXRlIG9yIGhyZWZcblxuXHRkZWYgb250YXAgZVxuXHRcdHZhciBocmVmID0gaHJlZi5yZXBsYWNlKC9eaHR0cFxcOlxcL1xcL2ltYmFcXC5pby8sJycpXG5cblx0XHRpZiBlLmV2ZW50Om1ldGFLZXkgb3IgZS5ldmVudDphbHRLZXlcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcblxuXHRcdGlmIGxldCBtID0gaHJlZi5tYXRjaCgvZ2lzdFxcLmdpdGh1YlxcLmNvbVxcLyhbXlxcL10rKVxcLyhbQS1aYS16XFxkXSspLylcblx0XHRcdGNvbnNvbGUubG9nICdnaXN0ISEnLG1bMV0sbVsyXVxuXHRcdFx0I2dpc3Qub3BlbihtWzJdKVxuXHRcdFx0cmV0dXJuIGUucHJldmVudC5zdG9wXG5cblx0XHRpZiBocmVmWzBdID09ICcjJyBvciBocmVmWzBdID09ICcvJ1xuXHRcdFx0ZS5wcmV2ZW50LnN0b3Bcblx0XHRcdHJvdXRlci5nbyhocmVmLHt9KVxuXHRcdFx0SW1iYS5FdmVudHMudHJpZ2dlcigncm91dGUnLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJlcm91dGVcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8YS50YWIuaG9tZSBocmVmPScvaG9tZSc+IDxpPiAnaG9tZSdcblx0XHRcdFx0XHQ8YS50YWIuZ3VpZGVzIGhyZWY9Jy9ndWlkZXMnPiA8aT4gJ2d1aWRlcydcblx0XHRcdFx0XHQ8YS50YWIuZG9jcyBocmVmPScvZG9jcyc+IDxpPiAnYXBpJ1xuXHRcdFx0XHRcdDxhLnRhYi5ibG9nIGhyZWY9Jy9ibG9nJz4gPGk+ICdibG9nJ1xuXHRcdFx0XHRcdGlmIGFwcC5yb3V0ZXIuc2VnbWVudCgwKSA9PSAnZ2lzdHMnXG5cdFx0XHRcdFx0XHQ8YS50YWIuYmxvZyBocmVmPScvZ2lzdHMnPiA8aT4gJ2dpc3RzJ1xuXG5cdFx0XHRcdFx0PHNwYW4uZ3JlZWR5PlxuXHRcdFx0XHRcdDxhLnR3aXR0ZXIgaHJlZj0naHR0cDovL3R3aXR0ZXIuY29tL2ltYmFqcyc+IDxpPiAndHdpdHRlcidcblx0XHRcdFx0XHQ8YS5naXRodWIgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+IDxpPiAnZ2l0aHViJ1xuXHRcdFx0XHRcdDxhLmlzc3VlcyBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhL2lzc3Vlcyc+IDxpPiAnaXNzdWVzJ1xuXHRcdFx0XHRcdDxhLm1lbnUgOnRhcD0ndG9nZ2xlTWVudSc+IDxiPlxuXHRcdFx0XG5cdFx0XHQ8bWFpbj5cblx0XHRcdFx0aWYgcm91dGVyLnNjb3BlZCgnL2hvbWUnKVxuXHRcdFx0XHRcdDxIb21lUGFnZT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZ3VpZGVzJylcblx0XHRcdFx0XHQ8R3VpZGVzUGFnZT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZG9jcycpXG5cdFx0XHRcdFx0PERvY3NQYWdlPlxuXG5cdFx0XHQ8Zm9vdGVyI2Zvb3Rlcj4gXG5cdFx0XHRcdDxocj5cblx0XHRcdFx0PC5sZnQ+IFwiSW1iYSDCqSAyMDE1LTIwMThcIlxuXHRcdFx0XHQ8LnJndD5cblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gJ1R3aXR0ZXInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gJ0dpdEh1Yidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gJ0lzc3Vlcydcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+ICdDaGF0J1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuaW1wb3J0IEV4YW1wbGUgZnJvbSAnLi9TbmlwcGV0J1xuaW1wb3J0IE1hcmtlZCBmcm9tICcuL01hcmtlZCdcbmltcG9ydCBQYXR0ZXJuIGZyb20gJy4vUGF0dGVybidcblxuXG5leHBvcnQgdGFnIEhvbWVQYWdlIDwgUGFnZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gPC5ib2R5PlxuXHRcdFx0PGRpdiNoZXJvLmRhcms+XG5cdFx0XHRcdDxQYXR0ZXJuQHBhdHRlcm4+XG5cdFx0XHRcdCMgPGhlcm9zbmlwcGV0Lmhlcm8uZGFyayBzcmM9Jy9ob21lL2V4YW1wbGVzL2hlcm8uaW1iYSc+XG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZC53ZWxjb21lLmh1Z2UubGlnaHQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMgQ3JlYXRlIGNvbXBsZXggd2ViIGFwcHMgd2l0aCBlYXNlIVxuXG5cdFx0XHRcdFx0SW1iYSBpcyBhIG5ldyBwcm9ncmFtbWluZyBsYW5ndWFnZSBmb3IgdGhlIHdlYiB0aGF0IGNvbXBpbGVzIHRvIGhpZ2hseSBcblx0XHRcdFx0XHRwZXJmb3JtYW50IGFuZCByZWFkYWJsZSBKYXZhU2NyaXB0LiBJdCBoYXMgbGFuZ3VhZ2UgbGV2ZWwgc3VwcG9ydCBmb3IgZGVmaW5pbmcsIFxuXHRcdFx0XHRcdGV4dGVuZGluZywgc3ViY2xhc3NpbmcsIGluc3RhbnRpYXRpbmcgYW5kIHJlbmRlcmluZyBkb20gbm9kZXMuIEZvciBhIHNpbXBsZSBcblx0XHRcdFx0XHRhcHBsaWNhdGlvbiBsaWtlIFRvZG9NVkMsIGl0IGlzIG1vcmUgdGhhbiBcblx0XHRcdFx0XHRbMTAgdGltZXMgZmFzdGVyIHRoYW4gUmVhY3RdKGh0dHA6Ly9zb21lYmVlLmdpdGh1Yi5pby90b2RvbXZjLXJlbmRlci1iZW5jaG1hcmsvaW5kZXguaHRtbCkgXG5cdFx0XHRcdFx0d2l0aCBsZXNzIGNvZGUsIGFuZCBhIG11Y2ggc21hbGxlciBsaWJyYXJ5LlxuXG5cdFx0XHRcdFx0LS0tXG5cblx0XHRcdFx0XHQtICMjIEltYmEuaW5zcGlyYXRpb25cblx0XHRcdFx0XHQgIEltYmEgYnJpbmdzIHRoZSBiZXN0IGZyb20gUnVieSwgUHl0aG9uLCBhbmQgUmVhY3QgKCsgSlNYKSB0b2dldGhlciBpbiBhIGNsZWFuIGxhbmd1YWdlIGFuZCBydW50aW1lLlxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmludGVyb3BlcmFiaWxpdHlcblx0XHRcdFx0XHQgIEltYmEgY29tcGlsZXMgZG93biB0byBjbGVhbiBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gVXNlIGFueSBKUyBsaWJyYXJ5IGluIEltYmEgYW5kIHZpY2EtdmVyc2EuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0LSAjIyBJbWJhLnBlcmZvcm1hbmNlXG5cdFx0XHRcdFx0ICBCdWlsZCB5b3VyIGFwcGxpY2F0aW9uIHZpZXdzIHVzaW5nIEltYmEncyBuYXRpdmUgdGFncyBmb3IgdW5wcmVjZWRlbnRlZCBwZXJmb3JtYW5jZS5cblxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIlNpbXBsZSByZW1pbmRlcnNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL3JlbWluZGVycy5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIFJldXNhYmxlIGNvbXBvbmVudHNcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRBIGN1c3RvbSB0YWcgLyBjb21wb25lbnQgY2FuIG1haW50YWluIGludGVybmFsIHN0YXRlIGFuZCBjb250cm9sIGhvdyB0byByZW5kZXIgaXRzZWxmLlxuXHRcdFx0XHRcdFdpdGggdGhlIHBlcmZvcm1hbmNlIG9mIERPTSByZWNvbmNpbGlhdGlvbiBpbiBJbWJhLCB5b3UgY2FuIHVzZSBvbmUtd2F5IGRlY2xhcmF0aXZlIGJpbmRpbmdzLFxuXHRcdFx0XHRcdGV2ZW4gZm9yIGFuaW1hdGlvbnMuIFdyaXRlIGFsbCB5b3VyIHZpZXdzIGluIGEgc3RyYWlnaHQtZm9yd2FyZCBsaW5lYXIgZmFzaGlvbiBhcyBpZiB5b3UgY291bGRcblx0XHRcdFx0XHRyZXJlbmRlciB5b3VyIHdob2xlIGFwcGxpY2F0aW9uIG9uICoqZXZlcnkgc2luZ2xlKiogZGF0YS9zdGF0ZSBjaGFuZ2UuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0PEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiV29ybGQgY2xvY2tcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2Nsb2NrLmltYmEnPlxuXG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZD4gXCJcIlwiXG5cdFx0XHRcdFx0IyMgRXh0ZW5kIG5hdGl2ZSB0YWdzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0SW4gYWRkaXRpb24gdG8gZGVmaW5pbmcgY3VzdG9tIHRhZ3MsIHlvdSBjYW4gYWxzbyBleHRlbmQgbmF0aXZlIHRhZ3MsIG9yIGluaGVyaXQgZnJvbSB0aGVtLlxuXHRcdFx0XHRcdEJpbmRpbmcgdG8gZG9tIGV2ZW50cyBpcyBhcyBzaW1wbGUgYXMgZGVmaW5pbmcgbWV0aG9kcyBvbiB5b3VyIHRhZ3M7IGFsbCBldmVudHMgd2lsbCBiZVxuXHRcdFx0XHRcdGVmZmljaWVudGx5IGRlbGVnYXRlZCBhbmQgaGFuZGxlZCBieSBJbWJhLiBMZXQncyBkZWZpbmUgYSBzaW1wbGUgc2tldGNocGFkLi4uXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0PEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiQ3VzdG9tIGNhbnZhc1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2FudmFzLmltYmEnPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Ib21lUGFnZS5pbWJhIiwiXG5leHBvcnQgdGFnIFNuaXBwZXRcblx0cHJvcCBzcmNcblx0cHJvcCBoZWFkaW5nXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFxuZXhwb3J0IHRhZyBFeGFtcGxlIDwgU25pcHBldFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gXCJFeGFtcGxlXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU25pcHBldC5pbWJhIiwiIyBkZWZpbmUgcmVuZGVyZXJcbnZhciBtYXJrZWQgPSByZXF1aXJlICdtYXJrZWQnXG52YXIgbWRyID0gbWFya2VkLlJlbmRlcmVyLm5ld1xuXG5kZWYgbWRyLmhlYWRpbmcgdGV4dCwgbHZsXG5cdFwiPGh7bHZsfT57dGV4dH08L2h7bHZsfT5cIlxuXHRcdFxuZXhwb3J0IHRhZyBNYXJrZWRcblx0ZGVmIHJlbmRlcmVyXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0ZXh0XG5cdFx0XHRAdGV4dCA9IHRleHRcblx0XHRcdGRvbTppbm5lckhUTUwgPSBtYXJrZWQodGV4dCwgcmVuZGVyZXI6IG1kcilcblx0XHRzZWxmXG5cblx0ZGVmIHNldENvbnRlbnQgdmFsLHR5cFxuXHRcdHNldFRleHQodmFsLDApXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL01hcmtlZC5pbWJhIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPD5dKyhAfDpcXC8pW14gPD5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXjwnXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspKFtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxcXFxcW1xcW1xcXV18W15cXFtcXF1dfFxcXSg/PVteXFxbXSpcXF0pKSovO1xuaW5saW5lLl9ocmVmID0gL1xccyo8PyhbXFxzXFxTXSo/KT4/KD86XFxzK1snXCJdKFtcXHNcXFNdKj8pWydcIl0pP1xccyovO1xuXG5pbmxpbmUubGluayA9IHJlcGxhY2UoaW5saW5lLmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgnaHJlZicsIGlubGluZS5faHJlZilcbiAgKCk7XG5cbmlubGluZS5yZWZsaW5rID0gcmVwbGFjZShpbmxpbmUucmVmbGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopL1xufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogcmVwbGFjZShpbmxpbmUuZXNjYXBlKSgnXSknLCAnfnxdKScpKCksXG4gIHVybDogL14oaHR0cHM/OlxcL1xcL1teXFxzPF0rW148Liw6O1wiJylcXF1cXHNdKS8sXG4gIGRlbDogL15+fig/PVxcUykoW1xcc1xcU10qP1xcUyl+fi8sXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLnRleHQpXG4gICAgKCddfCcsICd+XXwnKVxuICAgICgnfCcsICd8aHR0cHM/Oi8vfCcpXG4gICAgKClcbn0pO1xuXG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiByZXBsYWNlKGlubGluZS5icikoJ3syLH0nLCAnKicpKCksXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLmdmbS50ZXh0KSgnezIsfScsICcqJykoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICBpZiAoIXRoaXMubGlua3MpIHtcbiAgICB0aHJvdyBuZXdcbiAgICAgIEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbGlua1xuICAgICwgdGV4dFxuICAgICwgaHJlZlxuICAgICwgY2FwO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGNhcFsxXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoXG4gICAgICAgICAgY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKVxuICAgICAgICApO1xuICAgICAgICBocmVmID0gdGhpcy5tYW5nbGUoJ21haWx0bzonKSArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHVybCAoZ2ZtKVxuICAgIGlmICghdGhpcy5pbkxpbmsgJiYgKGNhcCA9IHRoaXMucnVsZXMudXJsLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBocmVmID0gdGV4dDtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLnRyaW0oKSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuXHQvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmICgvXlteOl0rOlxcLypbXi9dKiQvLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlLnJlcGxhY2UoL1teL10qJC8sICcnKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuXG4gIGlmIChocmVmLnNsaWNlKDAsIDIpID09PSAnLy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvOltcXHNcXFNdKi8sICc6JykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oOlxcLypbXi9dKilbXFxzXFxTXSovLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG52YXIgYmFzZVVybHMgPSB7fTtcbnZhciBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMVxuICAgICwgdGFyZ2V0XG4gICAgLCBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayB8fCB0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG5cbiAgICB2YXIgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodFxuICAgICAgLCB0b2tlbnNcbiAgICAgICwgcGVuZGluZ1xuICAgICAgLCBpID0gMDtcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlLFxuICBiYXNlVXJsOiBudWxsXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZGVmIHNodWZmbGUgYXJyYXlcblx0dmFyIGNvdW50ZXIgPSBhcnJheTpsZW5ndGgsIHRlbXAsIGluZGV4XG5cblx0IyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG5cdHdoaWxlIGNvdW50ZXIgPiAwXG5cdFx0IyBQaWNrIGEgcmFuZG9tIGluZGV4XG5cdFx0aW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tICogY291bnRlcilcblx0XHRjb3VudGVyLS0gIyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcblx0XHQjIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuXHRcdHRlbXAgPSBhcnJheVtjb3VudGVyXVxuXHRcdGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdXG5cdFx0YXJyYXlbaW5kZXhdID0gdGVtcFxuXHRcblx0cmV0dXJuIGFycmF5XG5cbmV4cG9ydCB0YWcgUGF0dGVyblxuXG5cdGRlZiBzZXR1cFxuXHRcdHJldHVybiBzZWxmIGlmICRub2RlJFxuXHRcdHZhciBwYXJ0cyA9IHt0YWdzOiBbXSwga2V5d29yZHM6IFtdLCBtZXRob2RzOiBbXX1cblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBsaW5lcyA9IFtdXG5cblx0XHRmb3Igb3duIGssdiBvZiBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHRcdGl0ZW1zLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblx0XHRcdHBhcnRzOm1ldGhvZHMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXG5cdFx0Zm9yIGsgaW4gSW1iYS5IVE1MX1RBR1Mgb3IgSFRNTF9UQUdTXG5cdFx0XHRpdGVtcy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cdFx0XHRwYXJ0czp0YWdzLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblxuXHRcdHZhciB3b3JkcyA9IFwiZGVmIGlmIGVsc2UgZWxpZiB3aGlsZSB1bnRpbCBmb3IgaW4gb2YgdmFyIGxldCBjbGFzcyBleHRlbmQgZXhwb3J0IGltcG9ydCB0YWcgZ2xvYmFsXCJcblxuXHRcdGZvciBrIGluIHdvcmRzLnNwbGl0KFwiIFwiKVxuXHRcdFx0aXRlbXMucHVzaChcIjxpPntrfTwvaT5cIilcblx0XHRcdHBhcnRzOmtleXdvcmRzLnB1c2goXCI8aT57a308L2k+XCIpXG5cblx0XHR2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zKVxuXHRcdHZhciBhbGwgPSBbXS5jb25jYXQoc2h1ZmZsZWQpXG5cdFx0dmFyIGNvdW50ID0gaXRlbXM6bGVuZ3RoIC0gMVxuXG5cdFx0Zm9yIGxuIGluIFswIC4uIDE0XVxuXHRcdFx0bGV0IGNoYXJzID0gMFxuXHRcdFx0bGluZXNbbG5dID0gW11cblx0XHRcdHdoaWxlIGNoYXJzIDwgMzAwXG5cdFx0XHRcdGxldCBpdGVtID0gKHNodWZmbGVkLnBvcCBvciBhbGxbTWF0aC5mbG9vcihjb3VudCAqIE1hdGgucmFuZG9tKV0pXG5cdFx0XHRcdGlmIGl0ZW1cblx0XHRcdFx0XHRjaGFycyArPSBpdGVtOmxlbmd0aFxuXHRcdFx0XHRcdGxpbmVzW2xuXS5wdXNoKGl0ZW0pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjaGFycyA9IDQwMFxuXG5cdFx0ZG9tOmlubmVySFRNTCA9ICc8ZGl2PicgKyBsaW5lcy5tYXAofGxuLGl8XG5cdFx0XHRsZXQgbyA9IE1hdGgubWF4KDAsKChpIC0gMikgKiAwLjMgLyAxNCkpLnRvRml4ZWQoMilcblx0XHRcdFwiPGRpdiBjbGFzcz0nbGluZScgc3R5bGU9J29wYWNpdHk6IHtvfTsnPlwiICsgbG4uam9pbihcIiBcIikgKyAnPC9kaXY+J1xuXHRcdCkuam9pbignJykgKyAnPC9kaXY+J1xuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGF0dGVybi5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG50YWcgR3VpZGVUT0Ncblx0cHJvcCB0b2Ncblx0YXR0ciBsZXZlbFxuXG5cdGRlZiB0b2dnbGVcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhLnRvY1xuXHRcdFxuXHRkZWYgcm91dGVcblx0XHRcIntkYXRhLnBhdGh9I3t0b2M6c2x1Z31cIlx0XHRcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkYXRhLnJlYWR5XG5cblx0XHRsZXQgdG9jID0gdG9jXG5cblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAyXG5cdFx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlblxuXHRcdFx0XHRcdFx0IyA8ZGl2PiBcIkl0ZW1cIlxuXHRcdFx0XHRcdFx0PEd1aWRlVE9DW2RhdGFdIHRvYz1jaGlsZD5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cbnRhZyBHdWlkZVxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRhdGE/LnJlYWR5XG5cdFx0IyByZWFsbHkgcmVuZGVyIHdpdGhvdXQgaW1iYT9cblx0XHQ8c2VsZi5tZCBib2R5PWRhdGEuYm9keT5cblxuXHRkZWYgYm9keT0gYm9keVxuXHRcdGlmIGJvZHkgIT0gQGJvZHlcblx0XHRcdEBib2R5ID0gYm9keVxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IGJvZHlcblx0XHRzZWxmXG5cbmV4cG9ydCB0YWcgR3VpZGVzUGFnZSA8IFBhZ2Vcblx0XG5cdGRlZiBtb3VudFxuXHRcdGNvbnNvbGUubG9nIFwiR3VpZGVzUGFnZSBtb3VudGVkXCJcblx0XHRAb25zY3JvbGwgfHw9IGRvIHNjcm9sbGVkXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cdFx0IyBEb2MuZ2V0KHJvdXRlci5wYXRoLCdtZCcpXG5cdFx0XG5cdGRlZiB1bm1vdW50XG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cdFx0XG5cdGRlZiBndWlkZVxuXHRcdGFwcC5kb2Mocm91dGVyLnBhdGggKyAnLm1kJylcblx0XHRcblx0ZGVmIHNjcm9sbGVkXG5cdFx0dmFyIGl0ZW1zID0gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF0nKVxuXHRcdHZhciBtYXRjaFxuXG5cdFx0dmFyIHNjcm9sbFRvcCA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdHZhciB3aCA9IHdpbmRvdzppbm5lckhlaWdodFxuXHRcdHZhciBkaCA9IGRvY3VtZW50OmJvZHk6c2Nyb2xsSGVpZ2h0XG5cblx0XHRpZiBAc2Nyb2xsRnJlZXplID49IDBcblx0XHRcdHZhciBkaWZmID0gTWF0aC5hYnMoc2Nyb2xsVG9wIC0gQHNjcm9sbEZyZWV6ZSlcblx0XHRcdHJldHVybiBzZWxmIGlmIGRpZmYgPCA1MFxuXHRcdFx0QHNjcm9sbEZyZWV6ZSA9IC0xXG5cblx0XHR2YXIgc2Nyb2xsQm90dG9tID0gZGggLSAoc2Nyb2xsVG9wICsgd2gpXG5cblx0XHRpZiBzY3JvbGxCb3R0b20gPT0gMFxuXHRcdFx0bWF0Y2ggPSBpdGVtc1tpdGVtcy5sZW4gLSAxXVxuXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdFx0dmFyIHQgPSAoaXRlbTpvZmZzZXRUb3AgKyAzMCArIDYwKSAjIGhhY2tcblx0XHRcdFx0dmFyIGRpc3QgPSBzY3JvbGxUb3AgLSB0XG5cblx0XHRcdFx0aWYgZGlzdCA8IDBcblx0XHRcdFx0XHRicmVhayBtYXRjaCA9IGl0ZW1cblx0XHRcblx0XHRpZiBtYXRjaFxuXHRcdFx0aWYgQGhhc2ggIT0gbWF0Y2g6aWRcblx0XHRcdFx0QGhhc2ggPSBtYXRjaDppZFxuXHRcdFx0XHRyb3V0ZXIuZ28oJyMnICsgQGhhc2gse30seWVzKVxuXHRcdFx0XHRyZW5kZXJcblxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucm91dGUgZVxuXHRcdGUuc3RvcFxuXHRcdGxvZyAnZ3VpZGVzIHJvdXRlZCdcblx0XHR2YXIgc2Nyb2xsID0gZG9cblx0XHRcdGlmIGxldCBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKCcjJyArIHJvdXRlci5oYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlldyh0cnVlKVxuXHRcdFx0XHRAc2Nyb2xsRnJlZXplID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0XHRcdHJldHVybiBlbFxuXHRcdFx0cmV0dXJuIG5vXG5cblx0XHRpZiByb3V0ZXIuaGFzaFxuXHRcdFx0cmVuZGVyXG5cdFx0XHRzY3JvbGwoKSBvciBzZXRUaW1lb3V0KHNjcm9sbCwyMClcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYuX3BhZ2U+XG5cdFx0XHQ8bmF2QG5hdj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdDxHdWlkZVRPQ1thcHAuZG9jKCcvZ3VpZGVzLm1kJyldPlxuXHRcdFx0XHRcdDxHdWlkZVRPQ1thcHAuZG9jKCcvZ3VpZGVzL2xhbmd1YWdlLm1kJyldPlxuXHRcdFx0PC5ib2R5LmxpZ2h0PlxuXHRcdFx0XHQ8R3VpZGVbZ3VpZGVdPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9HdWlkZXNQYWdlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmRlZiBwYXRoVG9BbmNob3IgcGF0aFxuXHQnYXBpLScgKyBwYXRoLnJlcGxhY2UoL1xcLi9nLCdfJykucmVwbGFjZSgvXFwjL2csJ19fJykucmVwbGFjZSgvXFw9L2csJ19zZXQnKVxuXG50YWcgRGVzY1xuXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgaHRtbCAhPSBAaHRtbFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IEBodG1sID0gaHRtbFxuXHRcdHNlbGZcblxudGFnIFJlZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblxudGFnIEl0ZW1cblxudGFnIFBhdGggPCBzcGFuXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgc2V0dXBcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBzdHIgPSBkYXRhXG5cdFx0aWYgc3RyIGlzYSBTdHJpbmdcblx0XHRcdGlmIHNob3J0XG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8oW0EtWl1cXHcqXFwuKSooPz1bQS1aXSkvZywnJylcblxuXHRcdFx0aHRtbCA9IHN0ci5yZXBsYWNlKC9cXGIoW1xcd10rfFxcLnxcXCMpXFxiL2cpIGRvIHxtLGl8XG5cdFx0XHRcdGlmIGkgPT0gJy4nIG9yIGkgPT0gJyMnXG5cdFx0XHRcdFx0XCI8aT57aX08L2k+XCJcblx0XHRcdFx0ZWxpZiBpWzBdID09IGlbMF0udG9VcHBlckNhc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdjb25zdCc+e2l9PC9iPlwiXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdpZCc+e2l9PC9iPlwiXG5cdFx0c2VsZlxuXG5cbnRhZyBSZXR1cm5cblx0YXR0ciBuYW1lXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PFBhdGhbZGF0YTp2YWx1ZV0udmFsdWU+XG5cdFx0XHQ8c3Bhbi5kZXNjPiBkYXRhOmRlc2NcblxudGFnIENsYXNzIDwgSXRlbVxuXG5cdHByb3AgZGF0YSB3YXRjaDogOnBhcnNlXG5cblx0ZGVmIHBhcnNlXG5cdFx0QHN0YXRpY3MgPSAobSBmb3IgbSBpbiBkYXRhWycuJ10gd2hlbiBtOmRlc2MpXG5cdFx0QG1ldGhvZHMgPSAobSBmb3IgbSBpbiBkYXRhWycjJ10gd2hlbiBtOmRlc2MpXG5cdFx0QHByb3BlcnRpZXMgPSBbXVxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKT5cblx0XHRcdDwuaGVhZGVyPiA8LnRpdGxlPiA8UGF0aFtkYXRhOm5hbWVwYXRoXT5cblx0XHRcdDxEZXNjIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0aWYgZGF0YTpjdG9yXG5cdFx0XHRcdDwuY29udGVudC5jdG9yPlxuXHRcdFx0XHRcdDxNZXRob2RbZGF0YTpjdG9yXSBwYXRoPShkYXRhOm5hbWVwYXRoICsgJy5uZXcnKT5cblxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRpZiBAc3RhdGljczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ1N0YXRpYyBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBzdGF0aWNzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6bmFtZXBhdGg+XG5cblx0XHRcdFx0aWYgQG1ldGhvZHM6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdJbnN0YW5jZSBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBtZXRob2RzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6aW5hbWU+XG5cbnRhZyBWYWx1ZVxuXG5cdGRlZiByZW5kZXJcblx0XHRpZiBkYXRhOnR5cGVcblx0XHRcdDxzZWxmIC57ZGF0YTp0eXBlfT5cblx0XHRcdFx0ZGF0YTp2YWx1ZVxuXHRcdGVsaWYgZGF0YSBpc2EgU3RyaW5nXG5cdFx0XHQ8c2VsZi5zdHIgdGV4dD1kYXRhPlxuXHRcdGVsaWYgZGF0YSBpc2EgTnVtYmVyXG5cdFx0XHQ8c2VsZi5udW0gdGV4dD1kYXRhPlxuXHRcdHNlbGZcblx0XHRcblxudGFnIFBhcmFtXG5cblx0ZGVmIHR5cGVcblx0XHRkYXRhOnR5cGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLnt0eXBlfT5cblx0XHRcdGlmIHR5cGUgPT0gJ05hbWVkUGFyYW1zJ1xuXHRcdFx0XHRmb3IgcGFyYW0gaW4gZGF0YTpub2Rlc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDwubmFtZT4gZGF0YTpuYW1lXG5cdFx0XHRcdGlmIGRhdGE6ZGVmYXVsdHNcblx0XHRcdFx0XHQ8aT4gdHlwZSA9PSAnTmFtZWRQYXJhbScgPyAnOiAnIDogJyA9ICdcblx0XHRcdFx0XHQ8VmFsdWVbZGF0YTpkZWZhdWx0c10+XG5cbnRhZyBNZXRob2QgPCBJdGVtXG5cblx0cHJvcCBpbmFtZVxuXHRwcm9wIHBhdGhcblxuXHRkZWYgdGFnc1xuXHRcdDxkaXZAdGFncz5cblx0XHRcdDxSZXR1cm5bZGF0YTpyZXR1cm5dIG5hbWU9J3JldHVybnMnPiBpZiBkYXRhOnJldHVyblxuXG5cdFx0XHRpZiBkYXRhOmRlcHJlY2F0ZWRcblx0XHRcdFx0PC5kZXByZWNhdGVkLnJlZD4gJ01ldGhvZCBpcyBkZXByZWNhdGVkJ1xuXHRcdFx0aWYgZGF0YTpwcml2YXRlXG5cdFx0XHRcdDwucHJpdmF0ZS5yZWQ+ICdNZXRob2QgaXMgcHJpdmF0ZSdcblxuXG5cdGRlZiBwYXRoXG5cdFx0QHBhdGggb3IgKGluYW1lICsgJy4nICsgZGF0YTpuYW1lKVxuXG5cdGRlZiBzbHVnXG5cdFx0cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC5kZXByZWNhdGVkPShkYXRhOmRlcHJlY2F0ZWQpID5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9c2x1Zz5cblx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHQ8UGF0aFtwYXRoXT5cblx0XHRcdFx0PC5wYXJhbXM+IGZvciBwYXJhbSBpbiBkYXRhOnBhcmFtc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRcdDwuZ3Jvdz5cblx0XHRcdDxEZXNjLm1kIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0dGFnc1xuXG50YWcgTGluayA8IGFcblx0cHJvcCBzaG9ydFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiBocmVmPVwiL2RvY3Mje3BhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKX1cIj4gPFBhdGhbZGF0YTpuYW1lcGF0aF0gc2hvcnQ9c2hvcnQ+XG5cdFx0c3VwZXJcblxuXHRkZWYgb250YXBcblx0XHRzdXBlclxuXHRcdHRyaWdnZXIoJ3JlZm9jdXMnKVxuXG50YWcgR3JvdXBcblxuXHRkZWYgb250YXBcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXG5cbmV4cG9ydCB0YWcgRG9jc1BhZ2UgPCBQYWdlXG5cblx0cHJvcCB2ZXJzaW9uIGRlZmF1bHQ6ICdjdXJyZW50J1xuXHRwcm9wIHJvb3RzXG5cblx0ZGVmIHNyY1xuXHRcdFwiL2FwaS97dmVyc2lvbn0uanNvblwiXG5cblx0ZGVmIGRvY3Ncblx0XHRAZG9jc1xuXG5cdGRlZiBzZXR1cFxuXHRcdGxvYWRcblx0XHRzdXBlclxuXG5cdGRlZiBsb2FkXG5cdFx0dmFyIGRvY3MgPSBhd2FpdCBhcHAuZmV0Y2goc3JjKVxuXHRcdERPQ1MgPSBAZG9jcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG5cdFx0RE9DTUFQID0gQGRvY3M6ZW50aXRpZXNcblx0XHRnZW5lcmF0ZVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRsb2FkZWRcblxuXHRkZWYgbG9hZGVkXG5cdFx0cmVuZGVyXG5cdFx0aWYgZG9jdW1lbnQ6bG9jYXRpb246aGFzaFxuXHRcdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJlZm9jdXMgZVxuXHRcdHJlZm9jdXNcblxuXHRkZWYgcmVmb2N1c1xuXHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblxuXHRkZWYgbG9va3VwIHBhdGhcblx0XHRkb2NzOmVudGl0aWVzW3BhdGhdXG5cblx0ZGVmIGdlbmVyYXRlXG5cdFx0QHJvb3RzID0gW11cblx0XHR2YXIgZW50cyA9IEBkb2NzOmVudGl0aWVzXG5cblx0XHRmb3Igb3duIHBhdGgsaXRlbSBvZiBkb2NzOmVudGl0aWVzXG5cdFx0XHRpZiBpdGVtOnR5cGUgPT0gJ2NsYXNzJyBvciBwYXRoID09ICdJbWJhJ1xuXHRcdFx0XHRpdGVtWycuJ10gPSAoaXRlbVsnLiddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXHRcdFx0XHRpdGVtWycjJ10gPSAoaXRlbVsnIyddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXG5cdFx0XHRcdEByb290cy5wdXNoKGl0ZW0pIGlmIGl0ZW06ZGVzY1xuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRvY3Ncblx0XHRcblx0XHQ8c2VsZj5cblx0XHRcdDxuYXZAbmF2PiA8LmNvbnRlbnQ+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PEdyb3VwLnRvYy5jbGFzcy5zZWN0aW9uLmNvbXBhY3Q+XG5cdFx0XHRcdFx0XHQ8LmhlYWRlcj4gPExpbmtbcm9vdF0uY2xhc3M+XG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0XHRcdDwuc3RhdGljPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJy4nXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdFx0XHRcdFx0PC5pbnN0YW5jZT5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycjJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHQ8LmJvZHk+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PENsYXNzW3Jvb3RdLmRvYy5sPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0RvY3NQYWdlLmltYmEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbGVzcy9zaXRlLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=