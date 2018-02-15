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

var Imba = {VERSION: '1.3.0-beta.8'};

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

function DataValue(node,path,mods){
	var self = this;
	self._node = node;
	self._path = path;
	self._mods = mods || {};
	self._setter = Imba.toSetter(self._path);
	let valueFn = node.value;
	node.value = function() { return self.mod(valueFn.call(this)); };
};

DataValue.prototype.context = function (){
	if (this._context) { return this._context };
	// caching can lead to weird behaviour
	let el = this._node;
	while (el){
		if (el.data()) {
			this._context = el;
			break;
		};
		el = el._owner_;
	};
	return this._context;
};

DataValue.prototype.data = function (){
	var ctx = this.context();
	return ctx ? ctx.data() : null;
};

DataValue.prototype.lazy = function (){
	return this._mods.lazy;
};

DataValue.prototype.get = function (){
	let data = this.data();
	if (!(data)) { return null };
	let val = data[this._path];
	return ((val instanceof Function) && data[this._setter]) ? data[this._path]() : val;
};

DataValue.prototype.set = function (value){
	let data = this.data();
	if (!(data)) { return };
	
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

Imba.extendTag('input', function(tag){
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

Imba.extendTag('textarea', function(tag){
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
el.getHandler = function (str){
	if (this[str]) {
		return this;
	} else if (this._data && (this._data[str] instanceof Function)) {
		return this._data;
	};
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
					if (fn[handler] instanceof Function) {
						handler = fn[handler];
						context = fn;
					} else if (fn instanceof Function) {
						handler = fn;
						context = el;
					};
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
				$[1] || _1('nav',$,1,0).flag('content')
			,2),
			
			_1('main',$,23,this),
			
			_1('footer',$,27,this).setId('footer').setContent([
				_1('hr',$,28,27),
				_1('div',$,29,27).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,30,27).flag('rgt').setContent([
					_1('a',$,31,30).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,32,30).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,33,30).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,34,30).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].setContent([
					($[2] || _1('a',$,2,1).flag('tab').flag('logo').setHref('/home').setContent($[3] || _1('i',$,3,2).setText('imba'),2)).end(),
					($[4] || _1('a',$,4,1).flag('tab').flag('home').setHref('/home').setContent($[5] || _1('i',$,5,4).setText('home'),2)).end(),
					($[6] || _1('a',$,6,1).flag('tab').flag('guides').setHref('/guide').setContent($[7] || _1('i',$,7,6).setText('guides'),2)).end(),
					($[8] || _1('a',$,8,1).flag('tab').flag('docs').setHref('/docs').setContent($[9] || _1('i',$,9,8).setText('api'),2)).end(),
					($[10] || _1('a',$,10,1).flag('tab').flag('blog').setHref('/blog').setContent($[11] || _1('i',$,11,10).setText('blog'),2)).end(),
					(this.app().router().segment(0) == 'gists') ? (
						($[12] || _1('a',$,12,1).flag('tab').flag('blog').setHref('/gists').setContent($[13] || _1('i',$,13,12).setText('gists'),2)).end()
					) : void(0),
					
					($[14] || _1('span',$,14,1).flag('greedy')),
					($[15] || _1('a',$,15,1).flag('twitter').setHref('http://twitter.com/imbajs').setContent($[16] || _1('i',$,16,15).setText('twitter'),2)).end(),
					($[17] || _1('a',$,17,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[18] || _1('i',$,18,17).setText('github'),2)).end(),
					($[19] || _1('a',$,19,1).flag('issues').setHref('https://github.com/somebee/imba/issues').setContent($[20] || _1('i',$,20,19).setText('issues'),2)).end(),
					($[21] || _1('a',$,21,1).flag('menu').on$(0,['tap','toggleMenu']).setContent($[22] || _1('b',$,22,21),2)).end()
				],1).end()
			,true)),
			$[23].setContent(
				this.router().scoped('/home') ? (
					($[24] || _1(HomePage,$,24,23)).end()
				) : (this.router().scoped('/guide') ? (
					($[25] || _1(GuidesPage,$,25,23)).setData(this.app().guide()).end()
				) : (this.router().scoped('/docs') ? (
					($[26] || _1(DocsPage,$,26,23)).end()
				) : void(0)))
			,3).end(),
			$[27].end((
				$[30].end()
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


var HomePage = Imba.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setChildren($[0] || _1('div',$,0,this).flag('body').setContent([
			t0 = (t0=_1('div',$,1,0)).setId('hero').flag('dark').setContent(
				this._pattern = this._pattern||_1(Pattern,t0).flag('pattern')
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			,2),
			_1('div',$,2,0).flag('content').setContent([
				_1(Marked,$,3,2).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,4,2).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,5,2).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
			// <Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end()
				,true)),
				$[2].end((
					$[3].end(),
					$[4].end(),
					$[5].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

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
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
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
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
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
      out += this.renderer.codespan(escape(cap[2], true));
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
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
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
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
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
      return '<p>An error occured:</p><pre>'
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
  xhtml: false
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
							$$.push(($0[i] || _1(GuideTOC,$0,i)).setData(self.data()).setToc(child).end());
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
						$$.push(($0[i] || _1(TOC,$0,i)).setData(self.data()).setToc(child).end());
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
										($0[j] || _1(TOC,$0,j)).setData(self.data()[section]).setExpanded((self.data()[section] == curr)).end();
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
					($[($1 = '4$' + self.guide().id)] || _1(Guide,$,$1,3)).setData(self.guide()).end()
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
			$[0].setData(this.data().value).end(),
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
					$[3].setData(self.data().namepath).end()
				,true))
			,true)),
			($[4] || _1(Desc,$,4,self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($[5] || _1('div',$,5,self).flag('content').flag('ctor').setContent(
					$[6] || _1(Method,$,6,5)
				,2)).end((
					$[6].setData(self.data().ctor).setPath((self.data().namepath + '.new')).end()
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
					($[3] || _1(Value,$,3,self)).setData(self.data().defaults).end()
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
			this.data().return ? ((t0.$.A || _1(Return,t0.$,'A',t0).setName('returns')).setData(this.data().return).end()) : void(0),
			
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
				$[2].setData(self.path()).end(),
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
			$[0].setData(this.data().namepath).setShort(this.short()).end()
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

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYjQyM2YwMzk1OTcwYTMyNjA3ZWUiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixFQUFFO0FBQ25COztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxPQUFPO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsOEJBQThCO0FBQy9DLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsNkJBQTZCO0FBQzlDOztBQUVBO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtDQUFrQyxrQkFBa0I7QUFDcEQsd0JBQXdCO0FBQ3hCLHdCQUF3QjtBQUN4QiwwQkFBMEI7QUFDMUIseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7QUFDQSw4REFBOEQ7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxzQkFBc0I7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsNEJBQTRCOztBQUU5QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLFVBQVUsbUJBQW1CO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNELHFCQUFxQixlQUFlLEVBQUU7QUFDdEMsQ0FBQztBQUNEO0FBQ0E7O0FBRUEsQ0FBQztBQUNEO0FBQ0EsQ0FBQzs7Ozs7Ozs7QUNyd0NEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDOzs7Ozs7Ozs7QUNwQkE7S0FDSyxRQUFRLEVBQUUsTUFBTSxPQUFRLEtBQU07OztRQUc1QixRQUFRLEVBQUU7O0VBRWYsTUFBTSxFQUFFLEtBQUssTUFBTSxLQUFLLFNBQU8sRUFBRTtFQUNqQzs7RUFFQSxLQUFLLEVBQUUsTUFBTTtFQUNiLE1BQU0sU0FBUyxFQUFFLE1BQU07RUFDdkIsTUFBTSxPQUFPLEVBQUU7OztRQUVUOzs7Y0FFRDs7Q0FFTjtFQUNhO01BQ1IsTUFBTTtNQUNOLE1BQU07TUFDTixNQUFNOztFQUVWLGFBQWUsS0FBSyxJQUFJO3dCQUN2QixNQUFNLGVBQVc7R0FDakIsTUFBTSxRQUFRLGVBQVc7OztFQUUxQiw0QkFBUyxLQUFLLFVBQVUsR0FBRzs7R0FDMUIsTUFBTSxrQkFBYztHQUNwQixNQUFNLEtBQUssa0JBQWM7OztNQUV0QixNQUFNOztFQUVWLDRCQUFTLE1BQU07O0dBQ2QsTUFBTSxjQUFVO0dBQ2hCLE1BQU0sU0FBUyxjQUFVOzs7TUFFdEIsU0FBUyxFQUFFLFFBQVE7TUFDbkIsSUFBSSxLQUFLLE9BQU87TUFDaEIsTUFBTSxFQUFFLE1BQU0sT0FBTyxFQUFFOztFQUUzQixjQUFXLFNBQUs7T0FDWCxNQUFNLEVBQUU7R0FDWixNQUFNLElBQUk7VUFDSixNQUFNLEVBQUU7UUFDVCxLQUFLLEdBQUcsU0FBUyxNQUFJLEdBQUcsSUFBSSxLQUFLLE1BQU0sTUFBTSxFQUFFLEtBQUs7SUFDeEQsSUFBRztLQUNGLE1BQU0sR0FBRyxLQUFLO0tBQ2QsTUFBTSxJQUFJLEtBQUs7O0tBRWYsTUFBTSxFQUFFOzs7OztFQUVYLFdBQUksVUFBVSxVQUFVLEVBQUUsTUFBTTtPQUMzQixFQUFFLEVBQUUsS0FBSyxJQUFJLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxRQUFRO2tEQUNiLFdBQU8sRUFBRSxHQUFHLFVBQVU7S0FDekQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7OztrQ0N2RE47cUNBQ0E7O2VBRVA7Ozs7OztDQUlDO2NBQ0M7OztDQUVEO2NBQ0MsS0FBSyxHQUFHLFlBQUs7OztDQUVkO2dCQUNHLFlBQUssaUJBQU8sV0FBSTs7O0NBRW5COztFQUNhLEtBQU8sWUFBSzs7TUFFcEIsSUFBSSxFQUFFO0VBQ1Y7O3VCQUVLLFlBQUksY0FBTyxVQUFPLElBQUk7SUFDdkIsSUFBSSxTQUFTLE9BQU8sR0FBSSxJQUFJLE1BQU0sRUFBRTtnQ0FDckM7OztVQUNHLFFBQUsseUJBQU8sSUFBSTs7Z0NBQ25COzs7TUFDQSw4QkFBYSxJQUFJOztXQUFjLE1BQU0sTUFBTSxHQUFFO29EQUNsQyxhQUFNLE9BQUk7Ozs7OytCQUVuQixRQUFLLHlCQUFPLElBQUk7Ozs7OztZQUV2Qjs7Q0FFQztFQUNDO09BQ0EsTUFBTSxNQUFJLFVBQVUsRUFBRSxZQUFLO0VBQzNCO0dBQ0M7Ozs7O0NBR0Y7O3VCQUNNO1FBQ0E7Ozs7S0FFSSxJQUFJLEVBQUUsV0FBSSxRQUFNLFlBQUs7NEJBQ3pCLGNBQU0sc0JBQWMsSUFBSSxtQkFBVyxFQUFFLElBQUk7O0tBQ3JDLEtBQUksRUFBRSxXQUFJLFFBQU0sWUFBSzs0QkFDekIsY0FBTSxzQkFBYyxLQUFJLGlCQUFNLEtBQUksTUFBTTs7Ozs7O0NBRTlDO0VBQ0MsOEJBQVksV0FBSTs7T0FDWCxLQUFLLEVBQUUsS0FBSztHQUNoQixJQUFHLEtBQUssc0JBQXNCLEdBQUc7SUFDaEMsUUFBUSxRQUFROzs7Ozs7O1VBR3BCOzs7d0NBRXdCOzs7MkJBQUE7Ozs7Q0FHdkI7dUJBQ1UsWUFBSyxnQkFBUSxXQUFJOzs7Q0FFM0I7Y0FDQyxLQUFLLEdBQUcsWUFBSyxJQUFJOzs7Q0FFbEI7O3VCQUNNLFlBQUksY0FBTyxVQUFPLFdBQUk7OEJBQ3ZCLFFBQUsseUJBQU8sV0FBSTtJQUNoQixXQUFJLFNBQVMsT0FBTyxHQUFJLFdBQUksTUFBTSxFQUFFLEVBQUUsR0FBSTs7O0tBQ3ZDLDhCQUFhLFdBQUk7O1VBQWMsTUFBTSxNQUFNLEdBQUU7OENBQzVDLGFBQU0sT0FBSTs7Ozs7Ozs7aUJBRWI7O0NBRU47O09BQ0MsbURBQWlCO1NBQ2pCLE9BQU8sK0JBQTBCLG9CQUFtQjs7O0NBRXJEO1NBQ0MsT0FBTyxrQ0FBNkIsb0JBQW1COzs7Q0FFeEQ7U0FDQyxZQUFLLGNBQU8sT0FBSyx1QkFBdUIsR0FBRzs7O0NBRTVDOzs7TUFHSyxNQUFNLEVBQUUsV0FBSTtNQUNaOztNQUVBLFVBQVUsRUFBRSxPQUFPO01BQ25CLEdBQUcsRUFBRSxPQUFPO01BQ1osR0FBRyxFQUFFLFNBQVMsS0FBSzs7RUFFdkIsU0FBRyxjQUFjLEdBQUc7T0FDZixLQUFLLEVBQUUsS0FBSyxJQUFJLFVBQVUsT0FBRTtHQUNwQixJQUFHLEtBQUssRUFBRTtRQUN0QixjQUFjLEdBQUc7OztNQUVkLGFBQWEsRUFBRSxHQUFHLEdBQUcsVUFBVSxFQUFFOztFQUVyQyxJQUFHLGFBQWEsR0FBRztHQUNsQixNQUFNLEVBQUUsV0FBTSxPQUFVLEVBQUU7O0dBRTFCLDRCQUFZOztRQUNQLEVBQUUsR0FBRyxLQUFLLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFDM0IsS0FBSyxFQUFFLFVBQVUsRUFBRTs7SUFFdkIsSUFBRyxLQUFLLEVBQUU7S0FDSCxNQUFNLEVBQUU7Ozs7O0VBRWpCLElBQUc7R0FDRixTQUFHLE1BQU0sR0FBRyxNQUFNO1NBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsY0FBTyxPQUFPLE9BQUUsU0FBUztJQUN6Qjs7Ozs7OztDQUlIOztFQUNDLEVBQUU7T0FDRjtNQUNJLE9BQU87O0dBQ1YsSUFBTyxHQUFHLEVBQUUsV0FBSSxrQkFBa0IsRUFBRSxjQUFPO0lBQzFDLEdBQUcsZUFBZTtTQUNsQixjQUFjLEVBQUUsT0FBTztXQUNoQjs7VUFDRDs7O0VBRVIsSUFBRyxjQUFPOztHQUVULFNBQVMsR0FBRyxXQUFXLE9BQU87Ozs7Ozs7Q0FLaEM7O01BQ0ssS0FBSyxFQUFFOzt1QkFFTjtRQUNBOzhCQUFBLE1BQ0Y7O3NCQVFELGFBQUs7O1FBVEY7Ozs7TUFFRiw4QkFBWSxZQUFLOzttREFDWCxLQUFLLE1BQU0sR0FBRyxLQUFLOzs7U0FFdkIsNEJBQWUsS0FBSzs7MENBQ2QsWUFBSyxVQUFVLGFBQVUsWUFBSyxTQUFTLEdBQUc7Ozs7Ozs7Ozs7O0lBSWhEO3FCQUNNLGFBQU0sa0NBQUk7Ozs7Ozs7Ozs7Ozs7OztrQ0MxSmhCOztBQUVQO2VBQ1EsRUFBRSxLQUFLLG1CQUFtQixvQkFBb0I7OztXQUV0RDs7Q0FFQztFQUNDLElBQUcsS0FBSyxRQUFHO0dBQ1YsV0FBSSxVQUFVLE9BQUUsTUFBTSxFQUFFOzs7Ozs7O1VBRzNCOztDQUVDOzs7OztXQUdEOztXQUVBOzs7O0NBR0M7TUFDSyxNQUFNO01BQ04sSUFBSSxFQUFFO0VBQ1YsWUFBRztHQUNGLElBQUc7SUFDRixJQUFJLEVBQUUsSUFBSTs7O1FBRVgsUUFBTyxJQUFJO0lBQ1YsSUFBRyxFQUFFLE9BQU8sR0FBRyxFQUFFO3FCQUNYO1dBQ04sSUFBSyxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUc7bUNBQ0U7O2dDQUVIOzs7Ozs7Ozs7YUFJckI7Ozs7Q0FHQzs7O3FCQUVtQjt1QkFDWjs7Z0JBREMsWUFBSzttQkFDQyxZQUFLOzs7OztZQUVwQjs7Ozs7Ozs7Ozs7Q0FJQzs7RUFDZSw4QkFBUzs7UUFBZSxFQUFFO1lBQTVCOztPQUFaOztFQUNjLDhCQUFTOztRQUFlLEVBQUU7YUFBNUI7O09BQVo7T0FDQSxZQUFZOzs7O0NBR2I7OztnQ0FFTyxvQkFBWSxNQUFHLGFBQWEsWUFBSzsrQkFDckMsa0RBQVU7O2tCQUFjLFlBQUs7OzsrQkFDeEIsUUFBSyxZQUFLO0dBQ2IsWUFBSztnQ0FDTixnQkFBUTs7O2tCQUNBLFlBQUssTUFBTSxTQUFNLFlBQUssU0FBUzs7OzsrQkFFeEM7VUFDRyxTQUFTLE9BQU8sRUFBRTs4QkFDbkI7cUJBQ0c7dUJBQ0YsZ0JBQVE7OztPQUFPLG1DQUFZO2tDQUNkLHFCQUFMLFVBQVUsU0FBTSxZQUFLOzs7Ozs7VUFFN0IsU0FBUyxPQUFPLEVBQUU7Z0NBQ25CO3VCQUNHO3dCQUNGLGdCQUFROzs7T0FBTyxtQ0FBWTtrQ0FDZCxxQkFBTCxVQUFVLFNBQU0sWUFBSzs7Ozs7Ozs7OztZQUVwQzs7Q0FFQzs7RUFDQyxJQUFHLFlBQUs7NEJBQ0MsWUFBSztJQUNaLFlBQUs7O1NBQ1AsMEJBQUs7aUJBQ0MsWUFBSyxRQUFLO1NBQ2hCLHVCQUFLO2lCQUNDLFlBQUssUUFBSzs7Ozs7OztZQUlsQjs7Q0FFQztTQUNDLFlBQUs7OztDQUVOOztrQ0FDUztJQUNKLFlBQUs7O0tBQ1AsOEJBQWEsWUFBSzt3Q0FDVjs7OztnQ0FFUCx5QkFBTyxZQUFLO0lBQ1YsWUFBSzs0Q0FDSCxZQUFLOzBDQUNGLFlBQUs7Ozs7Ozs7YUFFakI7Ozs7Ozs7Q0FLQzs7b0JBQ0s7R0FDcUMsWUFBSyw0Q0FBeEIsNEJBQWIsWUFBSzs7R0FFVixZQUFLO3FDQUNOLG1CQUFXOztHQUNWLFlBQUs7cUNBQ04sZ0JBQVE7Ozs7OztDQUdaO2NBQ0MsTUFBTSxJQUFJLGFBQU0sTUFBTSxFQUFFLFlBQUs7OztDQUU5QjtTQUNDLGFBQWEsWUFBSzs7O0NBRW5COzt1QkFDTyxxQkFBYSxZQUFLOytCQUNsQjs4QkFDSjs7b0JBRUM7b0JBRUE7OzZCQUNHO0dBQ0w7O1FBUGlCLE1BQUc7O2lCQUViOztLQUNJLDhCQUFhLFlBQUs7d0NBQ3BCOzs7O1FBRUEsUUFBSyxZQUFLOzs7OztXQUd0Qjs7OztDQUdDOztnQkFDTyxvQkFBYSxhQUFhLFlBQUs7Z0JBQW1CLFlBQUssVUFBVSxTQUFNOzs7OztDQUc5RTs7Y0FFQzs7OztZQUVGOztDQUVDO2NBQ0M7Ozs7O2VBR0s7Ozs7Ozs7OztDQUtOO29CQUNROzs7Q0FFUjtjQUNDOzs7Q0FFRDtFQUNDOzs7O0NBR0Q7TUFDSyxLQUFLLFFBQVEsV0FBSSxNQUFNO0VBQzNCLEtBQUssT0FBRSxNQUFNLEVBQUUsS0FBSyxNQUFNLEtBQUssVUFBVTtFQUN6QyxPQUFPLE9BQUUsTUFBTTtFQUNmO0VBQ0E7VUFDQzs7OztDQUVGOztFQUNDO0VBQ0EsSUFBRyxTQUFTLFNBQVM7R0FDcEIsSUFBTyxHQUFHLEVBQUUsV0FBSSxjQUFjLFNBQVMsU0FBUztJQUMvQyxHQUFHOzs7Ozs7Q0FHTjtTQUNDOzs7Q0FFRDs7RUFDQyxJQUFPLEdBQUcsRUFBRSxXQUFJLGNBQWMsU0FBUyxTQUFTO0dBQy9DLEdBQUc7Ozs7O0NBR0w7U0FDQyxZQUFLLFNBQVM7OztDQUVmO09BQ0MsT0FBTztNQUNILEtBQUssT0FBRSxNQUFNOztFQUVqQixhQUFxQixZQUFLO2lDQUN6QixJQUFHLEtBQUssS0FBSyxXQUFXLEdBQUcsS0FBSztJQUMvQixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTtJQUMvRixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTs7SUFFN0UsSUFBRyxLQUFLLGFBQTFCLE9BQU8sS0FBSzs7Ozs7O0NBR2Y7O0VBQ2EsTUFBTzs7O1FBR2Qsd0ZBQU87c0JBV1Y7O1FBWEc7Ozs7TUFDSCw4QkFBWTs7MENBQ0wsWUFBSSxjQUFNLGdCQUFROzhCQUN0QiwwREFBb0I7OEJBQ3BCO2dDQUNDO2dDQUdBOzs7O3dCQUxjOzs7Ozs7V0FHZCw0QkFBWTs7a0JBQWUsS0FBSyxLQUFLLElBQUssS0FBSzt1REFDN0Msd0RBQW9CLFNBQU07NEJBQVo7Ozs7Ozs7O1dBRWhCLDRCQUFZOztrQkFBZSxLQUFLLEtBQUssSUFBSyxLQUFLO3VEQUM3Qyx3REFBb0IsU0FBTTs0QkFBWjs7Ozs7Ozs7Ozs7OztLQUVwQiw4QkFBWTsrQkFDQyxZQUFJLG1CQUFUOzs7Ozs7Ozs7Ozs7OztBQ25PWix5QyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYjQyM2YwMzk1OTcwYTMyNjA3ZWUiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUgXCIuL3NyYy9pbWJhL2luZGV4LmltYmFcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL2ltYmEuaW1iYSIsIiMjI1xuSW1iYSBpcyB0aGUgbmFtZXNwYWNlIGZvciBhbGwgcnVudGltZSByZWxhdGVkIHV0aWxpdGllc1xuQG5hbWVzcGFjZVxuIyMjXG52YXIgSW1iYSA9IHtWRVJTSU9OOiAnMS4zLjAtYmV0YS44J31cblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRUaW1lb3V0IHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgdGhlIHRpbWVvdXQgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0VGltZW91dCBkZWxheSwgJmJsb2NrXG5cdHNldFRpbWVvdXQoJixkZWxheSkgZG9cblx0XHRibG9jaygpXG5cdFx0SW1iYS5jb21taXRcblxuIyMjXG5cbkxpZ2h0IHdyYXBwZXIgYXJvdW5kIG5hdGl2ZSBzZXRJbnRlcnZhbCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIGV2ZXJ5IGludGVydmFsIHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldEludGVydmFsIGludGVydmFsLCAmYmxvY2tcblx0c2V0SW50ZXJ2YWwoYmxvY2ssaW50ZXJ2YWwpXG5cbiMjI1xuQ2xlYXIgaW50ZXJ2YWwgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJJbnRlcnZhbCBpZFxuXHRjbGVhckludGVydmFsKGlkKVxuXG4jIyNcbkNsZWFyIHRpbWVvdXQgd2l0aCBzcGVjaWZpZWQgaWRcbiMjI1xuZGVmIEltYmEuY2xlYXJUaW1lb3V0IGlkXG5cdGNsZWFyVGltZW91dChpZClcblxuXG5kZWYgSW1iYS5zdWJjbGFzcyBvYmosIHN1cFxuXHRmb3Igayx2IG9mIHN1cFxuXHRcdG9ialtrXSA9IHYgaWYgc3VwLmhhc093blByb3BlcnR5KGspXG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmluaXRpYWxpemUgPSBvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHJldHVybiBvYmpcblxuIyMjXG5MaWdodHdlaWdodCBtZXRob2QgZm9yIG1ha2luZyBhbiBvYmplY3QgaXRlcmFibGUgaW4gaW1iYXMgZm9yL2luIGxvb3BzLlxuSWYgdGhlIGNvbXBpbGVyIGNhbm5vdCBzYXkgZm9yIGNlcnRhaW4gdGhhdCBhIHRhcmdldCBpbiBhIGZvciBsb29wIGlzIGFuXG5hcnJheSwgaXQgd2lsbCBjYWNoZSB0aGUgaXRlcmFibGUgdmVyc2lvbiBiZWZvcmUgbG9vcGluZy5cblxuYGBgaW1iYVxuIyB0aGlzIGlzIHRoZSB3aG9sZSBtZXRob2RcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG5jbGFzcyBDdXN0b21JdGVyYWJsZVxuXHRkZWYgdG9BcnJheVxuXHRcdFsxLDIsM11cblxuIyB3aWxsIHJldHVybiBbMiw0LDZdXG5mb3IgeCBpbiBDdXN0b21JdGVyYWJsZS5uZXdcblx0eCAqIDJcblxuYGBgXG4jIyNcbmRlZiBJbWJhLml0ZXJhYmxlIG9cblx0cmV0dXJuIG8gPyAobzp0b0FycmF5ID8gby50b0FycmF5IDogbykgOiBbXVxuXG4jIyNcbkNvZXJjZXMgYSB2YWx1ZSBpbnRvIGEgcHJvbWlzZS4gSWYgdmFsdWUgaXMgYXJyYXkgaXQgd2lsbFxuY2FsbCBgUHJvbWlzZS5hbGwodmFsdWUpYCwgb3IgaWYgaXQgaXMgbm90IGEgcHJvbWlzZSBpdCB3aWxsXG53cmFwIHRoZSB2YWx1ZSBpbiBgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKWAuIFVzZWQgZm9yIGV4cGVyaW1lbnRhbFxuYXdhaXQgc3ludGF4LlxuQHJldHVybiB7UHJvbWlzZX1cbiMjI1xuZGVmIEltYmEuYXdhaXQgdmFsdWVcblx0aWYgdmFsdWUgaXNhIEFycmF5XG5cdFx0Y29uc29sZS53YXJuKFwiYXdhaXQgKEFycmF5KSBpcyBkZXByZWNhdGVkIC0gdXNlIGF3YWl0IFByb21pc2UuYWxsKEFycmF5KVwiKVxuXHRcdFByb21pc2UuYWxsKHZhbHVlKVxuXHRlbGlmIHZhbHVlIGFuZCB2YWx1ZTp0aGVuXG5cdFx0dmFsdWVcblx0ZWxzZVxuXHRcdFByb21pc2UucmVzb2x2ZSh2YWx1ZSlcblxudmFyIGRhc2hSZWdleCA9IC8tLi9nXG52YXIgc2V0dGVyQ2FjaGUgPSB7fVxuXG5kZWYgSW1iYS50b0NhbWVsQ2FzZSBzdHJcblx0aWYgc3RyLmluZGV4T2YoJy0nKSA+PSAwXG5cdFx0c3RyLnJlcGxhY2UoZGFzaFJlZ2V4KSBkbyB8bXwgbS5jaGFyQXQoMSkudG9VcHBlckNhc2Vcblx0ZWxzZVxuXHRcdHN0clxuXHRcdFxuZGVmIEltYmEudG9TZXR0ZXIgc3RyXG5cdHNldHRlckNhY2hlW3N0cl0gfHw9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgc3RyKVxuXG5kZWYgSW1iYS5pbmRleE9mIGEsYlxuXHRyZXR1cm4gKGIgJiYgYjppbmRleE9mKSA/IGIuaW5kZXhPZihhKSA6IFtdOmluZGV4T2YuY2FsbChhLGIpXG5cbmRlZiBJbWJhLmxlbiBhXG5cdHJldHVybiBhICYmIChhOmxlbiBpc2EgRnVuY3Rpb24gPyBhOmxlbi5jYWxsKGEpIDogYTpsZW5ndGgpIG9yIDBcblxuZGVmIEltYmEucHJvcCBzY29wZSwgbmFtZSwgb3B0c1xuXHRpZiBzY29wZTpkZWZpbmVQcm9wZXJ0eVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVQcm9wZXJ0eShuYW1lLG9wdHMpXG5cdHJldHVyblxuXG5kZWYgSW1iYS5hdHRyIHNjb3BlLCBuYW1lLCBvcHRzID0ge31cblx0aWYgc2NvcGU6ZGVmaW5lQXR0cmlidXRlXG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZUF0dHJpYnV0ZShuYW1lLG9wdHMpXG5cblx0bGV0IGdldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKG5hbWUpXG5cdGxldCBzZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBuYW1lKVxuXHRsZXQgcHJvdG8gPSBzY29wZTpwcm90b3R5cGVcblxuXHRpZiBvcHRzOmRvbVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5kb21bbmFtZV1cblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdGlmIHZhbHVlICE9IHRoaXNbbmFtZV0oKVxuXHRcdFx0XHR0aGlzLmRvbVtuYW1lXSA9IHZhbHVlXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRlbHNlXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0dGhpcy5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRcdHJldHVybiB0aGlzXG5cdHJldHVyblxuXG5kZWYgSW1iYS5wcm9wRGlkU2V0IG9iamVjdCwgcHJvcGVydHksIHZhbCwgcHJldlxuXHRsZXQgZm4gPSBwcm9wZXJ0eTp3YXRjaFxuXHRpZiBmbiBpc2EgRnVuY3Rpb25cblx0XHRmbi5jYWxsKG9iamVjdCx2YWwscHJldixwcm9wZXJ0eSlcblx0ZWxpZiBmbiBpc2EgU3RyaW5nIGFuZCBvYmplY3RbZm5dXG5cdFx0b2JqZWN0W2ZuXSh2YWwscHJldixwcm9wZXJ0eSlcblx0cmV0dXJuXG5cblxuIyBCYXNpYyBldmVudHNcbmRlZiBlbWl0X18gZXZlbnQsIGFyZ3MsIG5vZGVcblx0IyB2YXIgbm9kZSA9IGNic1tldmVudF1cblx0dmFyIHByZXYsIGNiLCByZXRcblxuXHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRpZiBjYiA9IG5vZGU6bGlzdGVuZXJcblx0XHRcdGlmIG5vZGU6cGF0aCBhbmQgY2Jbbm9kZTpwYXRoXVxuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2Jbbm9kZTpwYXRoXS5hcHBseShjYixhcmdzKSA6IGNiW25vZGU6cGF0aF0oKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIGNoZWNrIGlmIGl0IGlzIGEgbWV0aG9kP1xuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2IuYXBwbHkobm9kZSwgYXJncykgOiBjYi5jYWxsKG5vZGUpXG5cblx0XHRpZiBub2RlOnRpbWVzICYmIC0tbm9kZTp0aW1lcyA8PSAwXG5cdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdHJldHVyblxuXG4jIG1ldGhvZCBmb3IgcmVnaXN0ZXJpbmcgYSBsaXN0ZW5lciBvbiBvYmplY3RcbmRlZiBJbWJhLmxpc3RlbiBvYmosIGV2ZW50LCBsaXN0ZW5lciwgcGF0aFxuXHR2YXIgY2JzLCBsaXN0LCB0YWlsXG5cdGNicyA9IG9iajpfX2xpc3RlbmVyc19fIHx8PSB7fVxuXHRsaXN0ID0gY2JzW2V2ZW50XSB8fD0ge31cblx0dGFpbCA9IGxpc3Q6dGFpbCB8fCAobGlzdDp0YWlsID0gKGxpc3Q6bmV4dCA9IHt9KSlcblx0dGFpbDpsaXN0ZW5lciA9IGxpc3RlbmVyXG5cdHRhaWw6cGF0aCA9IHBhdGhcblx0bGlzdDp0YWlsID0gdGFpbDpuZXh0ID0ge31cblx0cmV0dXJuIHRhaWxcblxuIyByZWdpc3RlciBhIGxpc3RlbmVyIG9uY2VcbmRlZiBJbWJhLm9uY2Ugb2JqLCBldmVudCwgbGlzdGVuZXJcblx0dmFyIHRhaWwgPSBJbWJhLmxpc3RlbihvYmosZXZlbnQsbGlzdGVuZXIpXG5cdHRhaWw6dGltZXMgPSAxXG5cdHJldHVybiB0YWlsXG5cbiMgcmVtb3ZlIGEgbGlzdGVuZXJcbmRlZiBJbWJhLnVubGlzdGVuIG9iaiwgZXZlbnQsIGNiLCBtZXRoXG5cdHZhciBub2RlLCBwcmV2XG5cdHZhciBtZXRhID0gb2JqOl9fbGlzdGVuZXJzX19cblx0cmV0dXJuIHVubGVzcyBtZXRhXG5cblx0aWYgbm9kZSA9IG1ldGFbZXZlbnRdXG5cdFx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0XHRpZiBub2RlID09IGNiIHx8IG5vZGU6bGlzdGVuZXIgPT0gY2Jcblx0XHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRcdCMgY2hlY2sgZm9yIGNvcnJlY3QgcGF0aCBhcyB3ZWxsP1xuXHRcdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRcdFx0XHRicmVha1xuXHRyZXR1cm5cblxuIyBlbWl0IGV2ZW50XG5kZWYgSW1iYS5lbWl0IG9iaiwgZXZlbnQsIHBhcmFtc1xuXHRpZiB2YXIgY2IgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRcdGVtaXRfXyhldmVudCxwYXJhbXMsY2JbZXZlbnRdKSBpZiBjYltldmVudF1cblx0XHRlbWl0X18oZXZlbnQsW2V2ZW50LHBhcmFtc10sY2I6YWxsKSBpZiBjYjphbGwgIyBhbmQgZXZlbnQgIT0gJ2FsbCdcblx0cmV0dXJuXG5cbmRlZiBJbWJhLm9ic2VydmVQcm9wZXJ0eSBvYnNlcnZlciwga2V5LCB0cmlnZ2VyLCB0YXJnZXQsIHByZXZcblx0aWYgcHJldiBhbmQgdHlwZW9mIHByZXYgPT0gJ29iamVjdCdcblx0XHRJbWJhLnVubGlzdGVuKHByZXYsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0aWYgdGFyZ2V0IGFuZCB0eXBlb2YgdGFyZ2V0ID09ICdvYmplY3QnXG5cdFx0SW1iYS5saXN0ZW4odGFyZ2V0LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdHNlbGZcblxubW9kdWxlOmV4cG9ydHMgPSBJbWJhXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbWJhLmltYmEiLCJleHBvcnQgdGFnIFBhZ2VcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlBvaW50ZXJcblx0XG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGJ1dHRvbiA9IC0xXG5cdFx0QGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBidXR0b25cblx0XHRAYnV0dG9uXG5cblx0ZGVmIHRvdWNoXG5cdFx0QHRvdWNoXG5cblx0ZGVmIHVwZGF0ZSBlXG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBkaXJ0eSA9IHllc1xuXHRcdHNlbGZcblxuXHQjIHRoaXMgaXMganVzdCBmb3IgcmVndWxhciBtb3VzZSBub3dcblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgZTEgPSBAZXZlbnRcblxuXHRcdGlmIEBkaXJ0eVxuXHRcdFx0QHByZXZFdmVudCA9IGUxXG5cdFx0XHRAZGlydHkgPSBub1xuXG5cdFx0XHQjIGJ1dHRvbiBzaG91bGQgb25seSBjaGFuZ2Ugb24gbW91c2Vkb3duIGV0Y1xuXHRcdFx0aWYgZTE6dHlwZSA9PSAnbW91c2Vkb3duJ1xuXHRcdFx0XHRAYnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0aWYgKEB0b3VjaCBhbmQgQGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHRAdG91Y2guY2FuY2VsIGlmIEB0b3VjaFxuXHRcdFx0XHRAdG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHRAdG91Y2gubW91c2Vkb3duKGUxLGUxKVxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNlbW92ZSdcblx0XHRcdFx0QHRvdWNoLm1vdXNlbW92ZShlMSxlMSkgaWYgQHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0QGJ1dHRvbiA9IC0xXG5cblx0XHRcdFx0aWYgQHRvdWNoIGFuZCBAdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdEB0b3VjaC5tb3VzZXVwKGUxLGUxKVxuXHRcdFx0XHRcdEB0b3VjaCA9IG51bGxcblx0XHRcdFx0IyB0cmlnZ2VyIHBvaW50ZXJ1cFxuXHRcdGVsaWYgQHRvdWNoXG5cdFx0XHRAdG91Y2guaWRsZVxuXHRcdHNlbGZcblxuXHRkZWYgeCBkbyBAZXZlbnQ6eFxuXHRkZWYgeSBkbyBAZXZlbnQ6eVxuXHRcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcG9pbnRlci5pbWJhIiwiZXh0ZXJuIGV2YWxcblxuZXhwb3J0IHRhZyBTbmlwcGV0XG5cdHByb3Agc3JjXG5cdHByb3AgaGVhZGluZ1xuXHRwcm9wIGhsXG5cdFxuXHRkZWYgc2VsZi5yZXBsYWNlIGRvbVxuXHRcdGxldCBpbWJhID0gZG9tOmZpcnN0Q2hpbGRcblx0XHRsZXQganMgPSBpbWJhOm5leHRTaWJsaW5nXG5cdFx0bGV0IGhpZ2hsaWdodGVkID0gaW1iYTppbm5lckhUTUxcblx0XHRsZXQgcmF3ID0gZG9tOnRleHRDb250ZW50XG5cdFx0bGV0IGRhdGEgPVxuXHRcdFx0Y29kZTogcmF3XG5cdFx0XHRodG1sOiBoaWdobGlnaHRlZFxuXHRcdFx0anM6IHtcblx0XHRcdFx0Y29kZToganM6dGV4dENvbnRlbnRcblx0XHRcdFx0aHRtbDoganM6aW5uZXJIVE1MXG5cdFx0XHR9XG5cblx0XHRsZXQgc25pcHBldCA9IDxTbmlwcGV0W2RhdGFdPlxuXHRcdGRvbTpwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzbmlwcGV0LmRvbSxkb20pXG5cdFx0cmV0dXJuIHNuaXBwZXRcblx0XHRcblx0ZGVmIHNldHVwXG5cdFx0cmVuZGVyXG5cdFx0QGNvZGUuZG9tOmlubmVySFRNTCA9IGRhdGE6aHRtbFxuXHRcdHJ1blxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJ1blxuXHRcdHZhciBvcmlnID0gSW1iYTptb3VudFxuXHRcdFxuXHRcdCMgdmFyIGpzID0gJ3ZhciByZXF1aXJlID0gZnVuY3Rpb24oKXsgcmV0dXJuIEltYmEgfTtcXG4nICsgZGF0YTpqczpjb2RlXG5cdFx0dmFyIGpzID0gZGF0YTpqczpjb2RlXG5cdFx0Y29uc29sZS5sb2cgSW1iYVxuXHRcdGpzID0ganMucmVwbGFjZShcInJlcXVpcmUoJ2ltYmEnKVwiLCd3aW5kb3cuSW1iYScpXG5cdFx0dHJ5XG5cdFx0XHRJbWJhOm1vdW50ID0gZG8gfGl0ZW18IG9yaWcuY2FsbChJbWJhLGl0ZW0sQHJlc3VsdC5kb20pXG5cdFx0XHRjb25zb2xlLmxvZyBcInJ1biBjb2RlXCIsIGpzXG5cdFx0XHRldmFsKGpzKVxuXHRcdFxuXHRcdEltYmE6bW91bnQgPSBvcmlnXG5cdFx0c2VsZlxuXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnNuaXBwZXQ+XG5cdFx0XHQ8Y29kZUBjb2RlPlxuXHRcdFx0PGRpdkByZXN1bHQuc3R5bGVkLWV4YW1wbGU+XG5cdFx0XG5leHBvcnQgdGFnIEV4YW1wbGUgPCBTbmlwcGV0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiBcIkV4YW1wbGVcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TbmlwcGV0LmltYmEiLCJcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnXG5pbXBvcnQgU2l0ZSBmcm9tICcuL3ZpZXdzL1NpdGUnXG5kb2N1bWVudDpib2R5OmlubmVySFRNTCA9ICcnIFxuSW1iYS5tb3VudCA8U2l0ZVtBUFAgPSBBcHAuZGVzZXJpYWxpemUoQVBQQ0FDSEUpXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY2xpZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcbnZhciBhY3RpdmF0ZSA9IG5vXG5pZiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuXHRpZiB3aW5kb3cuSW1iYVxuXHRcdGNvbnNvbGUud2FybiBcIkltYmEgdnt3aW5kb3cuSW1iYS5WRVJTSU9OfSBpcyBhbHJlYWR5IGxvYWRlZC5cIlxuXHRcdEltYmEgPSB3aW5kb3cuSW1iYVxuXHRlbHNlXG5cdFx0d2luZG93LkltYmEgPSBJbWJhXG5cdFx0YWN0aXZhdGUgPSB5ZXNcblx0XHRpZiB3aW5kb3c6ZGVmaW5lIGFuZCB3aW5kb3c6ZGVmaW5lOmFtZFxuXHRcdFx0d2luZG93LmRlZmluZShcImltYmFcIixbXSkgZG8gcmV0dXJuIEltYmFcblxubW9kdWxlLmV4cG9ydHMgPSBJbWJhXG5cbnVubGVzcyAkd2Vid29ya2VyJFxuXHRyZXF1aXJlICcuL3NjaGVkdWxlcidcblx0cmVxdWlyZSAnLi9kb20vaW5kZXgnXG5cbmlmICR3ZWIkIGFuZCBhY3RpdmF0ZVxuXHRJbWJhLkV2ZW50TWFuYWdlci5hY3RpdmF0ZVxuXHRcbmlmICRub2RlJFxuXHR1bmxlc3MgJHdlYnBhY2skXG5cdFx0cmVxdWlyZSAnLi4vLi4vcmVnaXN0ZXIuanMnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG5cbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIyB2ZXJ5IHNpbXBsZSByYWYgcG9seWZpbGxcbnZhciBjYW5jZWxBbmltYXRpb25GcmFtZVxuXG5pZiAkbm9kZSRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBkbyB8aWR8IGNsZWFyVGltZW91dChpZClcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5pZiAkd2ViJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpjYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6bW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6cmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzptb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmNsYXNzIFRpY2tlclxuXG5cdHByb3Agc3RhZ2Vcblx0cHJvcCBxdWV1ZVxuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAtMVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXxcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdFx0dGljayhlKVxuXHRcdHNlbGZcblxuXHRkZWYgYWRkIGl0ZW0sIGZvcmNlXG5cdFx0aWYgZm9yY2Ugb3IgQHF1ZXVlLmluZGV4T2YoaXRlbSkgPT0gLTFcblx0XHRcdEBxdWV1ZS5wdXNoKGl0ZW0pXG5cblx0XHRzY2hlZHVsZSB1bmxlc3MgQHNjaGVkdWxlZFxuXG5cdGRlZiB0aWNrIHRpbWVzdGFtcFxuXHRcdHZhciBpdGVtcyA9IEBxdWV1ZVxuXHRcdEB0cyA9IHRpbWVzdGFtcCB1bmxlc3MgQHRzXG5cdFx0QGR0ID0gdGltZXN0YW1wIC0gQHRzXG5cdFx0QHRzID0gdGltZXN0YW1wXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAxXG5cdFx0YmVmb3JlXG5cdFx0aWYgaXRlbXM6bGVuZ3RoXG5cdFx0XHRmb3IgaXRlbSxpIGluIGl0ZW1zXG5cdFx0XHRcdGlmIGl0ZW0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0aXRlbShAZHQsc2VsZilcblx0XHRcdFx0ZWxpZiBpdGVtOnRpY2tcblx0XHRcdFx0XHRpdGVtLnRpY2soQGR0LHNlbGYpXG5cdFx0QHN0YWdlID0gMlxuXHRcdGFmdGVyXG5cdFx0QHN0YWdlID0gQHNjaGVkdWxlZCA/IDAgOiAtMVxuXHRcdHNlbGZcblxuXHRkZWYgc2NoZWR1bGVcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0aWYgQHN0YWdlID09IC0xXG5cdFx0XHRcdEBzdGFnZSA9IDBcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShAdGlja2VyKVxuXHRcdHNlbGZcblxuXHRkZWYgYmVmb3JlXG5cdFx0c2VsZlxuXG5cdGRlZiBhZnRlclxuXHRcdGlmIEltYmEuVGFnTWFuYWdlclxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cbkltYmEuVElDS0VSID0gVGlja2VyLm5ld1xuSW1iYS5TQ0hFRFVMRVJTID0gW11cblxuZGVmIEltYmEudGlja2VyXG5cdEltYmEuVElDS0VSXG5cbmRlZiBJbWJhLnJlcXVlc3RBbmltYXRpb25GcmFtZSBjYWxsYmFja1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spXG5cbmRlZiBJbWJhLmNhbmNlbEFuaW1hdGlvbkZyYW1lIGlkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKVxuXG4jIHNob3VsZCBhZGQgYW4gSW1iYS5ydW4gLyBzZXRJbW1lZGlhdGUgdGhhdFxuIyBwdXNoZXMgbGlzdGVuZXIgb250byB0aGUgdGljay1xdWV1ZSB3aXRoIHRpbWVzIC0gb25jZVxuXG52YXIgY29tbWl0UXVldWUgPSAwXG5cbmRlZiBJbWJhLmNvbW1pdCBwYXJhbXNcblx0Y29tbWl0UXVldWUrK1xuXHQjIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdEltYmEuZW1pdChJbWJhLCdjb21taXQnLHBhcmFtcyAhPSB1bmRlZmluZWQgPyBbcGFyYW1zXSA6IHVuZGVmaW5lZClcblx0aWYgLS1jb21taXRRdWV1ZSA9PSAwXG5cdFx0SW1iYS5UYWdNYW5hZ2VyIGFuZCBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm5cblxuIyMjXG5cbkluc3RhbmNlcyBvZiBJbWJhLlNjaGVkdWxlciBtYW5hZ2VzIHdoZW4gdG8gY2FsbCBgdGljaygpYCBvbiB0aGVpciB0YXJnZXQsXG5hdCBhIHNwZWNpZmllZCBmcmFtZXJhdGUgb3Igd2hlbiBjZXJ0YWluIGV2ZW50cyBvY2N1ci4gUm9vdC1ub2RlcyBpbiB5b3VyXG5hcHBsaWNhdGlvbnMgd2lsbCB1c3VhbGx5IGhhdmUgYSBzY2hlZHVsZXIgdG8gbWFrZSBzdXJlIHRoZXkgcmVyZW5kZXIgd2hlblxuc29tZXRoaW5nIGNoYW5nZXMuIEl0IGlzIGFsc28gcG9zc2libGUgdG8gbWFrZSBpbm5lciBjb21wb25lbnRzIHVzZSB0aGVpclxub3duIHNjaGVkdWxlcnMgdG8gY29udHJvbCB3aGVuIHRoZXkgcmVuZGVyLlxuXG5AaW5hbWUgc2NoZWR1bGVyXG5cbiMjI1xuY2xhc3MgSW1iYS5TY2hlZHVsZXJcblx0XG5cdHZhciBjb3VudGVyID0gMFxuXG5cdGRlZiBzZWxmLmV2ZW50IGVcblx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLGUpXG5cblx0IyMjXG5cdENyZWF0ZSBhIG5ldyBJbWJhLlNjaGVkdWxlciBmb3Igc3BlY2lmaWVkIHRhcmdldFxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIHRhcmdldFxuXHRcdEBpZCA9IGNvdW50ZXIrK1xuXHRcdEB0YXJnZXQgPSB0YXJnZXRcblx0XHRAbWFya2VkID0gbm9cblx0XHRAYWN0aXZlID0gbm9cblx0XHRAbWFya2VyID0gZG8gbWFya1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXwgdGljayhlKVxuXG5cdFx0QGR0ID0gMFxuXHRcdEBmcmFtZSA9IHt9XG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpbWVzdGFtcCA9IDBcblx0XHRAdGlja3MgPSAwXG5cdFx0QGZsdXNoZXMgPSAwXG5cblx0XHRzZWxmOm9uZXZlbnQgPSBzZWxmOm9uZXZlbnQuYmluZChzZWxmKVxuXHRcdHNlbGZcblxuXHRwcm9wIHJhZiB3YXRjaDogeWVzXG5cdHByb3AgaW50ZXJ2YWwgd2F0Y2g6IHllc1xuXHRwcm9wIGV2ZW50cyB3YXRjaDogeWVzXG5cdHByb3AgbWFya2VkXG5cblx0ZGVmIHJhZkRpZFNldCBib29sXG5cdFx0cmVxdWVzdFRpY2sgaWYgYm9vbCBhbmQgQGFjdGl2ZVxuXHRcdHNlbGZcblxuXHRkZWYgaW50ZXJ2YWxEaWRTZXQgdGltZVxuXHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0aWYgdGltZSBhbmQgQGFjdGl2ZVxuXHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSx0aW1lKVxuXHRcdHNlbGZcblxuXHRkZWYgZXZlbnRzRGlkU2V0IG5ldywgcHJldlxuXHRcdGlmIEBhY3RpdmUgYW5kIG5ldyBhbmQgIXByZXZcblx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0ZWxpZiAhbmV3IGFuZCBwcmV2XG5cdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVyIGlzIGFjdGl2ZSBvciBub3Rcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBhY3RpdmVcblx0XHRAYWN0aXZlXG5cblx0IyMjXG5cdERlbHRhIHRpbWUgYmV0d2VlbiB0aGUgdHdvIGxhc3QgdGlja3Ncblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR0XG5cdFx0QGR0XG5cblx0IyMjXG5cdENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29uZmlndXJlIG9wdGlvbnMgPSB7fVxuXHRcdHJhZiA9IG9wdGlvbnM6cmFmIGlmIG9wdGlvbnM6cmFmICE9IHVuZGVmaW5lZFxuXHRcdGludGVydmFsID0gb3B0aW9uczppbnRlcnZhbCBpZiBvcHRpb25zOmludGVydmFsICE9IHVuZGVmaW5lZFxuXHRcdGV2ZW50cyA9IG9wdGlvbnM6ZXZlbnRzIGlmIG9wdGlvbnM6ZXZlbnRzICE9IHVuZGVmaW5lZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0TWFyayB0aGUgc2NoZWR1bGVyIGFzIGRpcnR5LiBUaGlzIHdpbGwgbWFrZSBzdXJlIHRoYXRcblx0dGhlIHNjaGVkdWxlciBjYWxscyBgdGFyZ2V0LnRpY2tgIG9uIHRoZSBuZXh0IGZyYW1lXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbWFya1xuXHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc3RhbnRseSB0cmlnZ2VyIHRhcmdldC50aWNrIGFuZCBtYXJrIHNjaGVkdWxlciBhcyBjbGVhbiAobm90IGRpcnR5L21hcmtlZCkuXG5cdFRoaXMgaXMgY2FsbGVkIGltcGxpY2l0bHkgZnJvbSB0aWNrLCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuXHRyZWFsbHkgd2FudCB0byBmb3JjZSBhIHRpY2sgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgbmV4dCBmcmFtZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbHVzaFxuXHRcdEBmbHVzaGVzKytcblx0XHRAdGFyZ2V0LnRpY2soc2VsZilcblx0XHRAbWFya2VkID0gbm9cblx0XHRzZWxmXG5cblx0IyMjXG5cdEBmaXhtZSB0aGlzIGV4cGVjdHMgcmFmIHRvIHJ1biBhdCA2MCBmcHMgXG5cblx0Q2FsbGVkIGF1dG9tYXRpY2FsbHkgb24gZXZlcnkgZnJhbWUgd2hpbGUgdGhlIHNjaGVkdWxlciBpcyBhY3RpdmUuXG5cdEl0IHdpbGwgb25seSBjYWxsIGB0YXJnZXQudGlja2AgaWYgdGhlIHNjaGVkdWxlciBpcyBtYXJrZWQgZGlydHksXG5cdG9yIHdoZW4gYWNjb3JkaW5nIHRvIEBmcHMgc2V0dGluZy5cblxuXHRJZiB5b3UgaGF2ZSBzZXQgdXAgYSBzY2hlZHVsZXIgd2l0aCBhbiBmcHMgb2YgMSwgdGljayB3aWxsIHN0aWxsIGJlXG5cdGNhbGxlZCBldmVyeSBmcmFtZSwgYnV0IGB0YXJnZXQudGlja2Agd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGV2ZXJ5XG5cdHNlY29uZCwgYW5kIGl0IHdpbGwgKm1ha2Ugc3VyZSogZWFjaCBgdGFyZ2V0LnRpY2tgIGhhcHBlbnMgaW4gc2VwYXJhdGVcblx0c2Vjb25kcyBhY2NvcmRpbmcgdG8gRGF0ZS4gU28gaWYgeW91IGhhdmUgYSBub2RlIHRoYXQgcmVuZGVycyBhIGNsb2NrXG5cdGJhc2VkIG9uIERhdGUubm93IChvciBzb21ldGhpbmcgc2ltaWxhciksIHlvdSBjYW4gc2NoZWR1bGUgaXQgd2l0aCAxZnBzLFxuXHRuZXZlciBuZWVkaW5nIHRvIHdvcnJ5IGFib3V0IHR3byB0aWNrcyBoYXBwZW5pbmcgd2l0aGluIHRoZSBzYW1lIHNlY29uZC5cblx0VGhlIHNhbWUgZ29lcyBmb3IgNGZwcywgMTBmcHMgZXRjLlxuXG5cdEBwcm90ZWN0ZWRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0aWNrIGRlbHRhLCB0aWNrZXJcblx0XHRAdGlja3MrK1xuXHRcdEBkdCA9IGRlbHRhXG5cblx0XHRpZiB0aWNrZXJcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXG5cdFx0Zmx1c2hcblxuXHRcdGlmIEByYWYgYW5kIEBhY3RpdmVcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdGRlZiByZXF1ZXN0VGlja1xuXHRcdHVubGVzcyBAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRJbWJhLlRJQ0tFUi5hZGQoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN0YXJ0IHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgbm90IGFscmVhZHkgYWN0aXZlLlxuXHQqKldoaWxlIGFjdGl2ZSoqLCB0aGUgc2NoZWR1bGVyIHdpbGwgb3ZlcnJpZGUgYHRhcmdldC5jb21taXRgXG5cdHRvIGRvIG5vdGhpbmcuIEJ5IGRlZmF1bHQgSW1iYS50YWcjY29tbWl0IGNhbGxzIHJlbmRlciwgc29cblx0dGhhdCByZW5kZXJpbmcgaXMgY2FzY2FkZWQgdGhyb3VnaCB0byBjaGlsZHJlbiB3aGVuIHJlbmRlcmluZ1xuXHRhIG5vZGUuIFdoZW4gYSBzY2hlZHVsZXIgaXMgYWN0aXZlIChmb3IgYSBub2RlKSwgSW1iYSBkaXNhYmxlc1xuXHR0aGlzIGF1dG9tYXRpYyByZW5kZXJpbmcuXG5cdCMjI1xuXHRkZWYgYWN0aXZhdGUgaW1tZWRpYXRlID0geWVzXG5cdFx0dW5sZXNzIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSB5ZXNcblx0XHRcdEBjb21taXQgPSBAdGFyZ2V0OmNvbW1pdFxuXHRcdFx0QHRhcmdldDpjb21taXQgPSBkbyB0aGlzXG5cdFx0XHRAdGFyZ2V0Py5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRcdEltYmEuU0NIRURVTEVSUy5wdXNoKHNlbGYpXG5cdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRcdFx0XG5cdFx0XHRpZiBAaW50ZXJ2YWwgYW5kICFAaW50ZXJ2YWxJZFxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLEBpbnRlcnZhbClcblxuXHRcdFx0aWYgaW1tZWRpYXRlXG5cdFx0XHRcdHRpY2soMClcblx0XHRcdGVsaWYgQHJhZlxuXHRcdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFN0b3AgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBhY3RpdmUuXG5cdCMjI1xuXHRkZWYgZGVhY3RpdmF0ZVxuXHRcdGlmIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSBub1xuXHRcdFx0QHRhcmdldDpjb21taXQgPSBAY29tbWl0XG5cdFx0XHRsZXQgaWR4ID0gSW1iYS5TQ0hFRFVMRVJTLmluZGV4T2Yoc2VsZilcblx0XHRcdGlmIGlkeCA+PSAwXG5cdFx0XHRcdEltYmEuU0NIRURVTEVSUy5zcGxpY2UoaWR4LDEpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0XHRcdGlmIEBpbnRlcnZhbElkXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdFx0XG5cdFx0XHRAdGFyZ2V0Py51bmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHRyYWNrXG5cdFx0QG1hcmtlclxuXHRcdFxuXHRkZWYgb25pbnRlcnZhbFxuXHRcdHRpY2tcblx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuXHRkZWYgb25ldmVudCBldmVudFxuXHRcdHJldHVybiBzZWxmIGlmICFAZXZlbnRzIG9yIEBtYXJrZWRcblxuXHRcdGlmIEBldmVudHMgaXNhIEZ1bmN0aW9uXG5cdFx0XHRtYXJrIGlmIEBldmVudHMoZXZlbnQsc2VsZilcblx0XHRlbGlmIEBldmVudHMgaXNhIEFycmF5XG5cdFx0XHRpZiBAZXZlbnRzLmluZGV4T2YoKGV2ZW50IGFuZCBldmVudDp0eXBlKSBvciBldmVudCkgPj0gMFxuXHRcdFx0XHRtYXJrXG5cdFx0ZWxzZVxuXHRcdFx0bWFya1xuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL3NjaGVkdWxlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5yZXF1aXJlICcuL21hbmFnZXInXG5cbkltYmEuVGFnTWFuYWdlciA9IEltYmEuVGFnTWFuYWdlckNsYXNzLm5ld1xuXG5yZXF1aXJlICcuL3RhZydcbnJlcXVpcmUgJy4vaHRtbCdcbnJlcXVpcmUgJy4vcG9pbnRlcidcbnJlcXVpcmUgJy4vdG91Y2gnXG5yZXF1aXJlICcuL2V2ZW50J1xucmVxdWlyZSAnLi9ldmVudC1tYW5hZ2VyJ1xuXG5pZiAkd2ViJFxuXHRyZXF1aXJlICcuL3JlY29uY2lsZXInXG5cbmlmICRub2RlJFxuXHRyZXF1aXJlICcuL3NlcnZlcidcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5UYWdNYW5hZ2VyQ2xhc3Ncblx0ZGVmIGluaXRpYWxpemVcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRAbW91bnRlZCA9IFtdXG5cdFx0QGhhc01vdW50YWJsZXMgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgbW91bnRlZFxuXHRcdEBtb3VudGVkXG5cblx0ZGVmIGluc2VydCBub2RlLCBwYXJlbnRcblx0XHRAaW5zZXJ0cysrXG5cblx0ZGVmIHJlbW92ZSBub2RlLCBwYXJlbnRcblx0XHRAcmVtb3ZlcysrXG5cblx0ZGVmIGNoYW5nZXNcblx0XHRAaW5zZXJ0cyArIEByZW1vdmVzXG5cblx0ZGVmIG1vdW50IG5vZGVcblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0QGhhc01vdW50YWJsZXMgPSB5ZXNcblxuXHRkZWYgcmVmcmVzaCBmb3JjZSA9IG5vXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdHJldHVybiBpZiAhZm9yY2UgYW5kIGNoYW5nZXMgPT0gMFxuXHRcdCMgY29uc29sZS50aW1lKCdyZXNvbHZlTW91bnRzJylcblx0XHRpZiAoQGluc2VydHMgYW5kIEBoYXNNb3VudGFibGVzKSBvciBmb3JjZVxuXHRcdFx0dHJ5TW91bnRcblxuXHRcdGlmIChAcmVtb3ZlcyBvciBmb3JjZSkgYW5kIEBtb3VudGVkOmxlbmd0aFxuXHRcdFx0dHJ5VW5tb3VudFxuXHRcdCMgY29uc29sZS50aW1lRW5kKCdyZXNvbHZlTW91bnRzJylcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRzZWxmXG5cblx0ZGVmIHVubW91bnQgbm9kZVxuXHRcdHNlbGZcblxuXHRkZWYgdHJ5TW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0dmFyIGl0ZW1zID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuX19tb3VudCcpXG5cdFx0IyB3aGF0IGlmIHdlIGVuZCB1cCBjcmVhdGluZyBhZGRpdGlvbmFsIG1vdW50YWJsZXMgYnkgbW91bnRpbmc/XG5cdFx0Zm9yIGVsIGluIGl0ZW1zXG5cdFx0XHRpZiBlbCBhbmQgZWwuQHRhZ1xuXHRcdFx0XHRpZiBAbW91bnRlZC5pbmRleE9mKGVsLkB0YWcpID09IC0xXG5cdFx0XHRcdFx0bW91bnROb2RlKGVsLkB0YWcpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgbW91bnROb2RlIG5vZGVcblx0XHRAbW91bnRlZC5wdXNoKG5vZGUpXG5cdFx0bm9kZS5GTEFHUyB8PSBJbWJhLlRBR19NT1VOVEVEXG5cdFx0bm9kZS5tb3VudCBpZiBub2RlOm1vdW50XG5cdFx0cmV0dXJuXG5cblx0ZGVmIHRyeVVubW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0Zm9yIGl0ZW0sIGkgaW4gQG1vdW50ZWRcblx0XHRcdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQuY29udGFpbnMoaXRlbS5AZG9tKVxuXHRcdFx0XHRpdGVtLkZMQUdTID0gaXRlbS5GTEFHUyAmIH5JbWJhLlRBR19NT1VOVEVEXG5cdFx0XHRcdGlmIGl0ZW06dW5tb3VudCBhbmQgaXRlbS5AZG9tXG5cdFx0XHRcdFx0aXRlbS51bm1vdW50XG5cdFx0XHRcdGVsaWYgaXRlbS5Ac2NoZWR1bGVyXG5cdFx0XHRcdFx0IyBNQVlCRSBGSVggVEhJUz9cblx0XHRcdFx0XHRpdGVtLnVuc2NoZWR1bGVcblx0XHRcdFx0QG1vdW50ZWRbaV0gPSBudWxsXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcblx0XHRpZiBjb3VudFxuXHRcdFx0QG1vdW50ZWQgPSBAbW91bnRlZC5maWx0ZXIgZG8gfGl0ZW18IGl0ZW1cblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuSW1iYS5DU1NLZXlNYXAgPSB7fVxuXG5JbWJhLlRBR19CVUlMVCA9IDFcbkltYmEuVEFHX1NFVFVQID0gMlxuSW1iYS5UQUdfTU9VTlRJTkcgPSA0XG5JbWJhLlRBR19NT1VOVEVEID0gOFxuSW1iYS5UQUdfU0NIRURVTEVEID0gMTZcbkltYmEuVEFHX0FXQUtFTkVEID0gMzJcblxuIyMjXG5HZXQgdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiMjI1xuZGVmIEltYmEuZG9jdW1lbnRcblx0aWYgJHdlYiRcblx0XHR3aW5kb3c6ZG9jdW1lbnRcblx0ZWxzZVxuXHRcdEBkb2N1bWVudCB8fD0gSW1iYVNlcnZlckRvY3VtZW50Lm5ld1xuXG4jIyNcbkdldCB0aGUgYm9keSBlbGVtZW50IHdyYXBwZWQgaW4gYW4gSW1iYS5UYWdcbiMjI1xuZGVmIEltYmEucm9vdFxuXHR0YWcoSW1iYS5kb2N1bWVudDpib2R5KVxuXG5kZWYgSW1iYS5zdGF0aWMgaXRlbXMsIHR5cCwgbnJcblx0aXRlbXMuQHR5cGUgPSB0eXBcblx0aXRlbXM6c3RhdGljID0gbnJcblx0cmV0dXJuIGl0ZW1zXG5cbiMjI1xuXG4jIyNcbmRlZiBJbWJhLm1vdW50IG5vZGUsIGludG9cblx0aW50byB8fD0gSW1iYS5kb2N1bWVudDpib2R5XG5cdGludG8uYXBwZW5kQ2hpbGQobm9kZS5kb20pXG5cdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZSxpbnRvKVxuXHRub2RlLnNjaGVkdWxlci5jb25maWd1cmUoZXZlbnRzOiB5ZXMpLmFjdGl2YXRlKG5vKVxuXHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm4gbm9kZVxuXG5cbmRlZiBJbWJhLmNyZWF0ZVRleHROb2RlIG5vZGVcblx0aWYgbm9kZSBhbmQgbm9kZTpub2RlVHlwZSA9PSAzXG5cdFx0cmV0dXJuIG5vZGVcblx0cmV0dXJuIEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuIyMjXG5UaGlzIGlzIHRoZSBiYXNlY2xhc3MgdGhhdCBhbGwgdGFncyBpbiBpbWJhIGluaGVyaXQgZnJvbS5cbkBpbmFtZSBub2RlXG4jIyNcbmNsYXNzIEltYmEuVGFnXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAbm9kZVR5cGUgb3IgJ2RpdicpXG5cdFx0aWYgQGNsYXNzZXNcblx0XHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdFx0ZG9tOmNsYXNzTmFtZSA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0dmFyIHByb3RvID0gKEBwcm90b0RvbSB8fD0gYnVpbGROb2RlKVxuXHRcdHByb3RvLmNsb25lTm9kZShmYWxzZSlcblxuXHRkZWYgc2VsZi5idWlsZCBjdHhcblx0XHRzZWxmLm5ldyhzZWxmLmNyZWF0ZU5vZGUsY3R4KVxuXG5cdGRlZiBzZWxmLmRvbVxuXHRcdEBwcm90b0RvbSB8fD0gYnVpbGROb2RlXG5cblx0IyMjXG5cdENhbGxlZCB3aGVuIGEgdGFnIHR5cGUgaXMgYmVpbmcgc3ViY2xhc3NlZC5cblx0IyMjXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5zbGljZVxuXG5cdFx0XHRpZiBjaGlsZC5AZmxhZ05hbWVcblx0XHRcdFx0Y2hpbGQuQGNsYXNzZXMucHVzaChjaGlsZC5AZmxhZ05hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBmbGFnTmFtZSA9IG51bGxcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHQjIyNcblx0SW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBhZnRlciBhIHRhZyBjbGFzcyBoYXNcblx0YmVlbiBkZWNsYXJlZCBvciBleHRlbmRlZC5cblx0XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgb3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHR2YXIgYmFzZSA9IEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdHZhciBoYXNTZXR1cCAgPSBzZWxmOnNldHVwICAhPSBiYXNlOnNldHVwXG5cdFx0dmFyIGhhc0NvbW1pdCA9IHNlbGY6Y29tbWl0ICE9IGJhc2U6Y29tbWl0XG5cdFx0dmFyIGhhc1JlbmRlciA9IHNlbGY6cmVuZGVyICE9IGJhc2U6cmVuZGVyXG5cdFx0dmFyIGhhc01vdW50ICA9IHNlbGY6bW91bnRcblxuXHRcdHZhciBjdG9yID0gc2VsZjpjb25zdHJ1Y3RvclxuXG5cdFx0aWYgaGFzQ29tbWl0IG9yIGhhc1JlbmRlciBvciBoYXNNb3VudCBvciBoYXNTZXR1cFxuXG5cdFx0XHRzZWxmOmVuZCA9IGRvXG5cdFx0XHRcdGlmIHRoaXM6bW91bnQgYW5kICEodGhpcy5GTEFHUyAmIEltYmEuVEFHX01PVU5URUQpXG5cdFx0XHRcdFx0IyBqdXN0IGFjdGl2YXRlIFxuXHRcdFx0XHRcdEltYmEuVGFnTWFuYWdlci5tb3VudCh0aGlzKVxuXG5cdFx0XHRcdHVubGVzcyB0aGlzLkZMQUdTICYgSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLkZMQUdTIHw9IEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5zZXR1cFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb21taXRcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdGlmIGhhc01vdW50XG5cdFx0XHRcdGlmIGN0b3IuQGNsYXNzZXMgYW5kIGN0b3IuQGNsYXNzZXMuaW5kZXhPZignX19tb3VudCcpICA9PSAtMVxuXHRcdFx0XHRcdGN0b3IuQGNsYXNzZXMucHVzaCgnX19tb3VudCcpXG5cblx0XHRcdFx0aWYgY3Rvci5AcHJvdG9Eb21cblx0XHRcdFx0XHRjdG9yLkBwcm90b0RvbTpjbGFzc0xpc3QuYWRkKCdfX21vdW50JylcblxuXHRcdFx0Zm9yIGl0ZW0gaW4gWzptb3VzZW1vdmUsOm1vdXNlZW50ZXIsOm1vdXNlbGVhdmUsOm1vdXNlb3Zlciw6bW91c2VvdXQsOnNlbGVjdHN0YXJ0XVxuXHRcdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihpdGVtKSBpZiB0aGlzW1wib257aXRlbX1cIl1cblx0XHRzZWxmXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBkb20sY3R4XG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRzZWxmOiQgPSBUYWdDYWNoZS5idWlsZChzZWxmKVxuXHRcdHNlbGY6JHVwID0gQG93bmVyXyA9IGN0eFxuXHRcdEB0cmVlXyA9IG51bGxcblx0XHRzZWxmLkZMQUdTID0gMFxuXHRcdGJ1aWxkXG5cdFx0c2VsZlxuXG5cdGF0dHIgbmFtZSBpbmxpbmU6IG5vXG5cdGF0dHIgcm9sZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGFiaW5kZXggaW5saW5lOiBub1xuXHRhdHRyIHRpdGxlXG5cblx0ZGVmIGRvbVxuXHRcdEBkb21cblx0XHRcblx0ZGVmIHNldERvbSBkb21cblx0XHRkb20uQHRhZyA9IHNlbGZcblx0XHRAZG9tID0gZG9tXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZcblx0XHRAcmVmXG5cdFx0XG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHQjIyNcblx0U2V0dGluZyByZWZlcmVuY2VzIGZvciB0YWdzIGxpa2Vcblx0YDxkaXZAaGVhZGVyPmAgd2lsbCBjb21waWxlIHRvIGB0YWcoJ2RpdicpLnJlZl8oJ2hlYWRlcicsdGhpcykuZW5kKClgXG5cdEJ5IGRlZmF1bHQgaXQgYWRkcyB0aGUgcmVmZXJlbmNlIGFzIGEgY2xhc3NOYW1lIHRvIHRoZSB0YWcuXG5cblx0QHJldHVybiB7c2VsZn1cblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiByZWZfIHJlZlxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBkYXRhPSBkYXRhXG5cdFx0QGRhdGEgPSBkYXRhXG5cblx0IyMjXG5cdEdldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0IyMjXG5cdGRlZiBkYXRhXG5cdFx0QGRhdGFcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyXG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGUgaWYgcHJldlxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgaWQ9IGlkXG5cdFx0aWYgaWQgIT0gbnVsbFxuXHRcdFx0ZG9tOmlkID0gaWRcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldE5lc3RlZEF0dHIgbnMsIG5hbWUsIHZhbHVlXG5cdFx0aWYgc2VsZltucysnU2V0QXR0cmlidXRlJ11cblx0XHRcdHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0QXR0cmlidXRlTlMobnMsIG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0QXR0cmlidXRlTlMgbnMsIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cblx0XHRpZiBvbGQgIT0gdmFsdWVcblx0XHRcdGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlIFxuXHRcdFx0XHRkb20uc2V0QXR0cmlidXRlTlMobnMsbmFtZSx2YWx1ZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cblx0ZGVmIGdldEF0dHJpYnV0ZU5TIG5zLCBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFxuXHRcblx0ZGVmIHNldCBrZXksIHZhbHVlLCBtb2RzXG5cdFx0bGV0IHNldHRlciA9IEltYmEudG9TZXR0ZXIoa2V5KVxuXHRcdGlmIHNlbGZbc2V0dGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZbc2V0dGVyXSh2YWx1ZSxtb2RzKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206c2V0QXR0cmlidXRlKGtleSx2YWx1ZSlcblx0XHRzZWxmXG5cdFxuXHRcblx0ZGVmIGdldCBrZXlcblx0XHRAZG9tOmdldEF0dHJpYnV0ZShrZXkpXG5cblx0IyMjXG5cdE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBzcGVjaWFsIHdyYXBwaW5nIGV0Yy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDb250ZW50IGNvbnRlbnQsIHR5cGVcblx0XHRzZXRDaGlsZHJlbiBjb250ZW50LCB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGUuIHR5cGUgcGFyYW0gaXMgb3B0aW9uYWwsXG5cdGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IEltYmEgd2hlbiBjb21waWxpbmcgdGFnIHRyZWVzLiBcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdCMgb3ZlcnJpZGRlbiBvbiBjbGllbnQgYnkgcmVjb25jaWxlclxuXHRcdEB0cmVlXyA9IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIHRlbXBsYXRlIHRoYXQgd2lsbCByZW5kZXIgdGhlIGNvbnRlbnQgb2Ygbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRUZW1wbGF0ZSB0ZW1wbGF0ZVxuXHRcdHVubGVzcyBAdGVtcGxhdGVcblx0XHRcdCMgb3ZlcnJpZGUgdGhlIGJhc2ljXG5cdFx0XHRpZiBzZWxmOnJlbmRlciA9PSBJbWJhLlRhZzpwcm90b3R5cGU6cmVuZGVyXG5cdFx0XHRcdHNlbGY6cmVuZGVyID0gc2VsZjpyZW5kZXJUZW1wbGF0ZSAjIGRvIHNldENoaWxkcmVuKHJlbmRlclRlbXBsYXRlKVxuXHRcdFx0c2VsZi5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXG5cdFx0c2VsZjp0ZW1wbGF0ZSA9IEB0ZW1wbGF0ZSA9IHRlbXBsYXRlXG5cdFx0c2VsZlxuXG5cdGRlZiB0ZW1wbGF0ZVxuXHRcdG51bGxcblxuXHQjIyNcblx0SWYgbm8gY3VzdG9tIHJlbmRlci1tZXRob2QgaXMgZGVmaW5lZCwgYW5kIHRoZSBub2RlXG5cdGhhcyBhIHRlbXBsYXRlLCB0aGlzIG1ldGhvZCB3aWxsIGJlIHVzZWQgdG8gcmVuZGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyVGVtcGxhdGVcblx0XHR2YXIgYm9keSA9IHRlbXBsYXRlXG5cdFx0c2V0Q2hpbGRyZW4oYm9keSkgaWYgYm9keSAhPSBzZWxmXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSBjdXJyZW50IG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVtb3ZlQ2hpbGQgY2hpbGRcblx0XHR2YXIgcGFyID0gZG9tXG5cdFx0dmFyIGVsID0gY2hpbGQuQGRvbSBvciBjaGlsZFxuXHRcdGlmIGVsIGFuZCBlbDpwYXJlbnROb2RlID09IHBhclxuXHRcdFx0cGFyLnJlbW92ZUNoaWxkKGVsKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShlbC5AdGFnIG9yIGVsLHNlbGYpXG5cdFx0c2VsZlxuXHRcblx0IyMjXG5cdFJlbW92ZSBhbGwgY29udGVudCBpbnNpZGUgbm9kZVxuXHQjIyNcblx0ZGVmIHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0aWYgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKG51bGwsc2VsZikgIyBzaG91bGQgcmVnaXN0ZXIgZWFjaCBjaGlsZD9cblx0XHRAdHJlZV8gPSBAdGV4dF8gPSBudWxsXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRBcHBlbmQgYSBzaW5nbGUgaXRlbSAobm9kZSBvciBzdHJpbmcpIHRvIHRoZSBjdXJyZW50IG5vZGUuXG5cdElmIHN1cHBsaWVkIGl0ZW0gaXMgYSBzdHJpbmcgaXQgd2lsbCBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWRcblx0YnkgSW1iYSBpbnRlcm5hbGx5LCBidXQgd2lsbCBwcmFjdGljYWxseSBuZXZlciBiZSB1c2VkIGV4cGxpY2l0bHkuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYXBwZW5kQ2hpbGQgbm9kZVxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkpXG5cdFx0ZWxpZiBub2RlXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRpZiBub2RlIGFuZCByZWxcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoIChub2RlLkBkb20gb3Igbm9kZSksIChyZWwuQGRvbSBvciByZWwpIClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgbm9kZSBmcm9tIHRoZSBkb20gdHJlZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG9ycGhhbml6ZVxuXHRcdHBhci5yZW1vdmVDaGlsZChzZWxmKSBpZiBsZXQgcGFyID0gcGFyZW50XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0R2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdEByZXR1cm4ge3N0cmluZ30gaW5uZXIgdGV4dCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgdGV4dCB2XG5cdFx0QGRvbTp0ZXh0Q29udGVudFxuXG5cdCMjI1xuXHRTZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0IyMjXG5cdGRlZiB0ZXh0PSB0eHRcblx0XHRAdHJlZV8gPSB0eHRcblx0XHRAZG9tOnRleHRDb250ZW50ID0gKHR4dCA9PSBudWxsIG9yIHRleHQgPT09IGZhbHNlKSA/ICcnIDogdHh0XG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdE1ldGhvZCBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyBkYXRhLWF0dHJpYnV0ZXMuIFdoZW4gY2FsbGVkIHdpdGggemVyb1xuXHRhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gdGhlIGFjdHVhbCBkYXRhc2V0IGZvciB0aGUgdGFnLlxuXG5cdFx0dmFyIG5vZGUgPSA8ZGl2IGRhdGEtbmFtZT0naGVsbG8nPlxuXHRcdCMgZ2V0IHRoZSB3aG9sZSBkYXRhc2V0XG5cdFx0bm9kZS5kYXRhc2V0ICMge25hbWU6ICdoZWxsbyd9XG5cdFx0IyBnZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnKSAjICdoZWxsbydcblx0XHQjIHNldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScsJ25ld25hbWUnKSAjIHNlbGZcblxuXG5cdCMjI1xuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRkYXRhc2V0KGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRzZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIsdmFsKVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGtleVxuXHRcdFx0cmV0dXJuIGdldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIilcblxuXHRcdHZhciBkYXRhc2V0ID0gZG9tOmRhdGFzZXRcblxuXHRcdHVubGVzcyBkYXRhc2V0XG5cdFx0XHRkYXRhc2V0ID0ge31cblx0XHRcdGZvciBhdHIsaSBpbiBkb206YXR0cmlidXRlc1xuXHRcdFx0XHRpZiBhdHI6bmFtZS5zdWJzdHIoMCw1KSA9PSAnZGF0YS0nXG5cdFx0XHRcdFx0ZGF0YXNldFtJbWJhLnRvQ2FtZWxDYXNlKGF0cjpuYW1lLnNsaWNlKDUpKV0gPSBhdHI6dmFsdWVcblxuXHRcdHJldHVybiBkYXRhc2V0XG5cblx0IyMjXG5cdEVtcHR5IHBsYWNlaG9sZGVyLiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY3VzdG9tIHJlbmRlciBiZWhhdmlvdXIuXG5cdFdvcmtzIG11Y2ggbGlrZSB0aGUgZmFtaWxpYXIgcmVuZGVyLW1ldGhvZCBpbiBSZWFjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHdoaWxlIHRhZyBpcyBpbml0aWFsaXppbmcuIE5vIGluaXRpYWwgcHJvcHNcblx0d2lsbCBoYXZlIGJlZW4gc2V0IGF0IHRoaXMgcG9pbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYnVpbGRcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBvbmNlLCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLiBBbGwgaW5pdGlhbCBwcm9wc1xuXHRhbmQgY2hpbGRyZW4gd2lsbCBoYXZlIGJlZW4gc2V0IGJlZm9yZSBzZXR1cCBpcyBjYWxsZWQuXG5cdHNldENvbnRlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0dXBcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLCBmb3IgdGFncyB0aGF0IGFyZSBwYXJ0IG9mXG5cdGEgdGFnIHRyZWUgKHRoYXQgYXJlIHJlbmRlcmVkIHNldmVyYWwgdGltZXMpLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbW1pdFxuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDYWxsZWQgYnkgdGhlIHRhZy1zY2hlZHVsZXIgKGlmIHRoaXMgdGFnIGlzIHNjaGVkdWxlZClcblx0QnkgZGVmYXVsdCBpdCB3aWxsIGNhbGwgdGhpcy5yZW5kZXIuIERvIG5vdCBvdmVycmlkZSB1bmxlc3Ncblx0eW91IHJlYWxseSB1bmRlcnN0YW5kIGl0LlxuXG5cdCMjI1xuXHRkZWYgdGlja1xuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0XG5cdEEgdmVyeSBpbXBvcnRhbnQgbWV0aG9kIHRoYXQgeW91IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgbWFudWFsbHkuXG5cdFRoZSB0YWcgc3ludGF4IG9mIEltYmEgY29tcGlsZXMgdG8gYSBjaGFpbiBvZiBzZXR0ZXJzLCB3aGljaCBhbHdheXNcblx0ZW5kcyB3aXRoIC5lbmQuIGA8YS5sYXJnZT5gIGNvbXBpbGVzIHRvIGB0YWcoJ2EnKS5mbGFnKCdsYXJnZScpLmVuZCgpYFxuXHRcblx0WW91IGFyZSBoaWdobHkgYWR2aWNlZCB0byBub3Qgb3ZlcnJpZGUgaXRzIGJlaGF2aW91ci4gVGhlIGZpcnN0IHRpbWVcblx0ZW5kIGlzIGNhbGxlZCBpdCB3aWxsIG1hcmsgdGhlIHRhZyBhcyBpbml0aWFsaXplZCBhbmQgY2FsbCBJbWJhLlRhZyNzZXR1cCxcblx0YW5kIGNhbGwgSW1iYS5UYWcjY29tbWl0IGV2ZXJ5IHRpbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZW5kXG5cdFx0c2VsZlxuXHRcdFxuXHQjIGNhbGxlZCBvbiA8c2VsZj4gdG8gY2hlY2sgaWYgc2VsZiBpcyBjYWxsZWQgZnJvbSBvdGhlciBwbGFjZXNcblx0ZGVmICRvcGVuIGNvbnRleHRcblx0XHRpZiBjb250ZXh0ICE9IEBjb250ZXh0X1xuXHRcdFx0QHRyZWVfID0gbnVsbFxuXHRcdFx0QGNvbnRleHRfID0gY29udGV4dFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRpZiBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSAhPSAhIXRvZ2dsZXJcblx0XHRcdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0IyBmaXJlZm94IHdpbGwgdHJpZ2dlciBhIGNoYW5nZSBpZiBhZGRpbmcgZXhpc3RpbmcgY2xhc3Ncblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKSB1bmxlc3MgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGZsYWcgZnJvbSBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdW5mbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRvZ2dsZSBzcGVjaWZpZWQgZmxhZyBvbiBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdG9nZ2xlRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIGN1cnJlbnQgbm9kZSBoYXMgc3BlY2lmaWVkIGZsYWdcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBoYXNGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXG5cdFxuXHRkZWYgZmxhZ0lmIGZsYWcsIGJvb2xcblx0XHR2YXIgZiA9IEBmbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmW2ZsYWddXG5cblx0XHRpZiBib29sIGFuZCAhcHJldlxuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0geWVzXG5cdFx0ZWxpZiBwcmV2IGFuZCAhYm9vbFxuXHRcdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0gbm9cblxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdCMjI1xuXHRTZXQvdXBkYXRlIGEgbmFtZWQgZmxhZy4gSXQgcmVtZW1iZXJzIHRoZSBwcmV2aW91c1xuXHR2YWx1ZSBvZiB0aGUgZmxhZywgYW5kIHJlbW92ZXMgaXQgYmVmb3JlIHNldHRpbmcgdGhlIG5ldyB2YWx1ZS5cblxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3RvZG8nKVxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3Byb2plY3QnKVxuXHRcdCMgdG9kbyBpcyByZW1vdmVkLCBwcm9qZWN0IGlzIGFkZGVkLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0RmxhZyBuYW1lLCB2YWx1ZVxuXHRcdGxldCBmbGFncyA9IEBuYW1lZEZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZsYWdzW25hbWVdXG5cdFx0aWYgcHJldiAhPSB2YWx1ZVxuXHRcdFx0dW5mbGFnKHByZXYpIGlmIHByZXZcblx0XHRcdGZsYWcodmFsdWUpIGlmIHZhbHVlXG5cdFx0XHRmbGFnc1tuYW1lXSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHNjaGVkdWxlciBmb3IgdGhpcyBub2RlLiBBIG5ldyBzY2hlZHVsZXIgd2lsbCBiZSBjcmVhdGVkXG5cdGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG5cblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGVyXG5cdFx0QHNjaGVkdWxlciA/PSBJbWJhLlNjaGVkdWxlci5uZXcoc2VsZilcblxuXHQjIyNcblxuXHRTaG9ydGhhbmQgdG8gc3RhcnQgc2NoZWR1bGluZyBhIG5vZGUuIFRoZSBtZXRob2Qgd2lsbCBiYXNpY2FsbHlcblx0cHJveHkgdGhlIGFyZ3VtZW50cyB0aHJvdWdoIHRvIHNjaGVkdWxlci5jb25maWd1cmUsIGFuZCB0aGVuXG5cdGFjdGl2YXRlIHRoZSBzY2hlZHVsZXIuXG5cdFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlIG9wdGlvbnMgPSB7ZXZlbnRzOiB5ZXN9XG5cdFx0c2NoZWR1bGVyLmNvbmZpZ3VyZShvcHRpb25zKS5hY3RpdmF0ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBkZWFjdGl2YXRpbmcgc2NoZWR1bGVyIChpZiB0YWcgaGFzIG9uZSkuXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgdW5zY2hlZHVsZVxuXHRcdHNjaGVkdWxlci5kZWFjdGl2YXRlIGlmIEBzY2hlZHVsZXJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBwYXJlbnQgb2YgY3VycmVudCBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnfSBcblx0IyMjXG5cdGRlZiBwYXJlbnRcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShkb206cGFyZW50Tm9kZSlcblxuXHQjIyNcblx0R2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnW119XG5cdCMjI1xuXHRkZWYgY2hpbGRyZW4gc2VsXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbTpjaGlsZHJlblxuXHRcdFx0aXRlbS5AdGFnIG9yIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pXG5cdFxuXHRkZWYgcXVlcnlTZWxlY3RvciBxXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5xdWVyeVNlbGVjdG9yKHEpKVxuXG5cdGRlZiBxdWVyeVNlbGVjdG9yQWxsIHFcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdGZvciBpdGVtIGluIEBkb20ucXVlcnlTZWxlY3RvckFsbChxKVxuXHRcdFx0aXRlbXMucHVzaCggSW1iYS5nZXRUYWdGb3JEb20oaXRlbSkgKVxuXHRcdHJldHVybiBpdGVtc1xuXG5cdCMjI1xuXHRDaGVjayBpZiB0aGlzIG5vZGUgbWF0Y2hlcyBhIHNlbGVjdG9yXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgbWF0Y2hlcyBzZWxcblx0XHRpZiBzZWwgaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXR1cm4gc2VsKHNlbGYpXG5cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5IGlzYSBGdW5jdGlvblxuXHRcdGlmIHZhciBmbiA9IChAZG9tOm1hdGNoZXMgb3IgQGRvbTptYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTp3ZWJraXRNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptc01hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1vek1hdGNoZXNTZWxlY3Rvcilcblx0XHRcdHJldHVybiBmbi5jYWxsKEBkb20sc2VsKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgc3VwcGxpZWQgc2VsZWN0b3IgLyBmaWx0ZXJcblx0dHJhdmVyc2luZyB1cHdhcmRzLCBidXQgaW5jbHVkaW5nIHRoZSBub2RlIGl0c2VsZi5cblx0QHJldHVybiB7SW1iYS5UYWd9XG5cdCMjI1xuXHRkZWYgY2xvc2VzdCBzZWxcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLmNsb3Nlc3Qoc2VsKSlcblxuXHQjIyNcblx0Q2hlY2sgaWYgbm9kZSBjb250YWlucyBvdGhlciBub2RlXG5cdEByZXR1cm4ge0Jvb2xlYW59IFxuXHQjIyNcblx0ZGVmIGNvbnRhaW5zIG5vZGVcblx0XHRkb20uY29udGFpbnMobm9kZS5AZG9tIG9yIG5vZGUpXG5cblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBjb25zb2xlLmxvZyBvbiBlbGVtZW50c1xuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGxvZyAqYXJnc1xuXHRcdGFyZ3MudW5zaGlmdChjb25zb2xlKVxuXHRcdEZ1bmN0aW9uOnByb3RvdHlwZTpjYWxsLmFwcGx5KGNvbnNvbGU6bG9nLCBhcmdzKVxuXHRcdHNlbGZcblxuXHRkZWYgY3NzIGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBuYW1lID0gSW1iYS5DU1NLZXlNYXBba2V5XSBvciBrZXlcblxuXHRcdGlmIHZhbCA9PSBudWxsXG5cdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSlcblx0XHRlbGlmIHZhbCA9PSB1bmRlZmluZWQgYW5kIGFyZ3VtZW50czpsZW5ndGggPT0gMVxuXHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtuYW1lXVxuXHRcdGVsc2Vcblx0XHRcdGlmIHZhbCBpc2EgTnVtYmVyIGFuZCBuYW1lLm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsICsgXCJweFwiXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbFxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFN0eWxlIHN0eWxlXG5cdFx0c2V0QXR0cmlidXRlKCdzdHlsZScsc3R5bGUpXG5cblx0ZGVmIHN0eWxlXG5cdFx0Z2V0QXR0cmlidXRlKCdzdHlsZScpXG5cblx0IyMjXG5cdFRyaWdnZXIgYW4gZXZlbnQgZnJvbSBjdXJyZW50IG5vZGUuIERpc3BhdGNoZWQgdGhyb3VnaCB0aGUgSW1iYSBldmVudCBtYW5hZ2VyLlxuXHRUbyBkaXNwYXRjaCBhY3R1YWwgZG9tIGV2ZW50cywgdXNlIGRvbS5kaXNwYXRjaEV2ZW50IGluc3RlYWQuXG5cblx0QHJldHVybiB7SW1iYS5FdmVudH1cblx0IyMjXG5cdGRlZiB0cmlnZ2VyIG5hbWUsIGRhdGEgPSB7fVxuXHRcdCR3ZWIkID8gSW1iYS5FdmVudHMudHJpZ2dlcihuYW1lLHNlbGYsZGF0YTogZGF0YSkgOiBudWxsXG5cblx0IyMjXG5cdEZvY3VzIG9uIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZvY3VzXG5cdFx0ZG9tLmZvY3VzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgZm9jdXMgZnJvbSBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBibHVyXG5cdFx0ZG9tLmJsdXJcblx0XHRzZWxmXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0ZG9tOm91dGVySFRNTFxuXHRcblxuSW1iYS5UYWc6cHJvdG90eXBlOmluaXRpYWxpemUgPSBJbWJhLlRhZ1xuXG5jbGFzcyBJbWJhLlNWR1RhZyA8IEltYmEuVGFnXG5cblx0ZGVmIHNlbGYubmFtZXNwYWNlVVJJXG5cdFx0XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSxAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZTpiYXNlVmFsID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cdFx0aWYgY2hpbGQuQG5hbWUgaW4gSW1iYS5TVkdfVEFHU1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5JbWJhLkhUTUxfVEFHUyA9IFwiYSBhYmJyIGFkZHJlc3MgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgZGF0YSBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGl2IGRsIGR0IGVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBmb3JtIGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZW51aXRlbSBtZXRhIG1ldGVyIG5hdiBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdSB1bCB2YXIgdmlkZW8gd2JyXCIuc3BsaXQoXCIgXCIpXG5JbWJhLkhUTUxfVEFHU19VTlNBRkUgPSBcImFydGljbGUgYXNpZGUgaGVhZGVyIHNlY3Rpb25cIi5zcGxpdChcIiBcIilcbkltYmEuU1ZHX1RBR1MgPSBcImNpcmNsZSBkZWZzIGVsbGlwc2UgZyBsaW5lIGxpbmVhckdyYWRpZW50IG1hc2sgcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzdG9wIHN2ZyB0ZXh0IHRzcGFuXCIuc3BsaXQoXCIgXCIpXG5cbkltYmEuSFRNTF9BVFRSUyA9XG5cdGE6IFwiaHJlZiB0YXJnZXQgaHJlZmxhbmcgbWVkaWEgZG93bmxvYWQgcmVsIHR5cGVcIlxuXHRmb3JtOiBcIm1ldGhvZCBhY3Rpb24gZW5jdHlwZSBhdXRvY29tcGxldGUgdGFyZ2V0XCJcblx0YnV0dG9uOiBcImF1dG9mb2N1cyB0eXBlXCJcblx0aW5wdXQ6IFwiYWNjZXB0IGRpc2FibGVkIGZvcm0gbGlzdCBtYXggbWF4bGVuZ3RoIG1pbiBwYXR0ZXJuIHJlcXVpcmVkIHNpemUgc3RlcCB0eXBlXCJcblx0bGFiZWw6IFwiYWNjZXNza2V5IGZvciBmb3JtXCJcblx0aW1nOiBcInNyYyBzcmNzZXRcIlxuXHRsaW5rOiBcInJlbCB0eXBlIGhyZWYgbWVkaWFcIlxuXHRpZnJhbWU6IFwicmVmZXJyZXJwb2xpY3kgc3JjIHNyY2RvYyBzYW5kYm94XCJcblx0bWV0YTogXCJwcm9wZXJ0eSBjb250ZW50IGNoYXJzZXQgZGVzY1wiXG5cdG9wdGdyb3VwOiBcImxhYmVsXCJcblx0b3B0aW9uOiBcImxhYmVsXCJcblx0b3V0cHV0OiBcImZvciBmb3JtXCJcblx0b2JqZWN0OiBcInR5cGUgZGF0YSB3aWR0aCBoZWlnaHRcIlxuXHRwYXJhbTogXCJuYW1lIHZhbHVlXCJcblx0cHJvZ3Jlc3M6IFwibWF4XCJcblx0c2NyaXB0OiBcInNyYyB0eXBlIGFzeW5jIGRlZmVyIGNyb3Nzb3JpZ2luIGludGVncml0eSBub25jZSBsYW5ndWFnZVwiXG5cdHNlbGVjdDogXCJzaXplIGZvcm0gbXVsdGlwbGVcIlxuXHR0ZXh0YXJlYTogXCJyb3dzIGNvbHNcIlxuXG5cbkltYmEuSFRNTF9QUk9QUyA9XG5cdGlucHV0OiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdHRleHRhcmVhOiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdGZvcm06IFwibm92YWxpZGF0ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0YnV0dG9uOiBcImRpc2FibGVkXCJcblx0c2VsZWN0OiBcImF1dG9mb2N1cyBkaXNhYmxlZCByZXF1aXJlZFwiXG5cdG9wdGlvbjogXCJkaXNhYmxlZCBzZWxlY3RlZCB2YWx1ZVwiXG5cdG9wdGdyb3VwOiBcImRpc2FibGVkXCJcblx0cHJvZ3Jlc3M6IFwidmFsdWVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGNhbnZhczogXCJ3aWR0aCBoZWlnaHRcIlxuXG5kZWYgZXh0ZW5kZXIgb2JqLCBzdXBcblx0Zm9yIG93biBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID89IHZcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0c3VwLmluaGVyaXQob2JqKSBpZiBzdXA6aW5oZXJpdFxuXHRyZXR1cm4gb2JqXG5cbmRlZiBUYWdcblx0cmV0dXJuIGRvIHxkb20sY3R4fFxuXHRcdHRoaXMuaW5pdGlhbGl6ZShkb20sY3R4KVxuXHRcdHJldHVybiB0aGlzXG5cbmRlZiBUYWdTcGF3bmVyIHR5cGVcblx0cmV0dXJuIGRvIHx6b25lfCB0eXBlLmJ1aWxkKHpvbmUpXG5cblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgbnMgbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gfHwgZGVmaW5lTmFtZXNwYWNlKG5hbWUpXG5cblx0ZGVmIGRlZmluZU5hbWVzcGFjZSBuYW1lXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0Y2xvbmUuQG5zID0gbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gPSBjbG9uZVxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBiYXNlVHlwZSBuYW1lLCBuc1xuXHRcdG5hbWUgaW4gSW1iYS5IVE1MX1RBR1MgPyAnZWxlbWVudCcgOiAnZGl2J1xuXG5cdGRlZiBkZWZpbmVUYWcgZnVsbE5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHRpZiBib2R5IGFuZCBib2R5LkBub2RlVHlwZVxuXHRcdFx0c3VwciA9IGJvZHlcblx0XHRcdGJvZHkgPSBudWxsXG5cdFx0XHRcblx0XHRpZiBzZWxmW2Z1bGxOYW1lXVxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0YWcgYWxyZWFkeSBleGlzdHM/XCIsZnVsbE5hbWVcblx0XHRcblx0XHQjIGlmIGl0IGlzIG5hbWVzcGFjZWRcblx0XHR2YXIgbnNcblx0XHR2YXIgbmFtZSA9IGZ1bGxOYW1lXG5cdFx0bGV0IG5zaWR4ID0gbmFtZS5pbmRleE9mKCc6Jylcblx0XHRpZiAgbnNpZHggPj0gMFxuXHRcdFx0bnMgPSBmdWxsTmFtZS5zdWJzdHIoMCxuc2lkeClcblx0XHRcdG5hbWUgPSBmdWxsTmFtZS5zdWJzdHIobnNpZHggKyAxKVxuXHRcdFx0aWYgbnMgPT0gJ3N2ZycgYW5kICFzdXByXG5cdFx0XHRcdHN1cHIgPSAnc3ZnOmVsZW1lbnQnXG5cblx0XHRzdXByIHx8PSBiYXNlVHlwZShmdWxsTmFtZSlcblxuXHRcdGxldCBzdXBlcnR5cGUgPSBzdXByIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShzdXByKSA6IHN1cHJcblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbnVsbFxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdEltYmEuU0lOR0xFVE9OU1tuYW1lLnNsaWNlKDEpXSA9IHRhZ3R5cGVcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0ZWxpZiBuYW1lWzBdID09IG5hbWVbMF0udG9VcHBlckNhc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbmFtZVxuXHRcdGVsc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gXCJfXCIgKyBmdWxsTmFtZS5yZXBsYWNlKC9bX1xcOl0vZywgJy0nKVxuXHRcdFx0c2VsZltmdWxsTmFtZV0gPSB0YWd0eXBlXG5cblx0XHRleHRlbmRlcih0YWd0eXBlLHN1cGVydHlwZSlcblxuXHRcdGlmIGJvZHlcblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXHRcdFx0dGFndHlwZS5kZWZpbmVkIGlmIHRhZ3R5cGU6ZGVmaW5lZFxuXHRcdFx0b3B0aW1pemVUYWcodGFndHlwZSlcblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKG5hbWUpIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRrbGFzcy5leHRlbmRlZCBpZiBrbGFzczpleHRlbmRlZFxuXHRcdG9wdGltaXplVGFnKGtsYXNzKVxuXHRcdHJldHVybiBrbGFzc1xuXG5cdGRlZiBvcHRpbWl6ZVRhZyB0YWd0eXBlXG5cdFx0dGFndHlwZTpwcm90b3R5cGU/Lm9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0XG5cdGRlZiBmaW5kVGFnVHlwZSB0eXBlXG5cdFx0bGV0IGtsYXNzID0gc2VsZlt0eXBlXVxuXHRcdHVubGVzcyBrbGFzc1xuXHRcdFx0aWYgdHlwZS5zdWJzdHIoMCw0KSA9PSAnc3ZnOidcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnc3ZnOmVsZW1lbnQnKVxuXG5cdFx0XHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YodHlwZSkgPj0gMFxuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdlbGVtZW50JylcblxuXHRcdFx0XHRpZiBsZXQgYXR0cnMgPSBJbWJhLkhUTUxfQVRUUlNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBhdHRycy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdGlmIGxldCBwcm9wcyA9IEltYmEuSFRNTF9QUk9QU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIHByb3BzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUsZG9tOiB5ZXMpXG5cdFx0cmV0dXJuIGtsYXNzXG5cdFx0XG5cdGRlZiBjcmVhdGVFbGVtZW50IG5hbWUsIG93bmVyXG5cdFx0dmFyIHR5cFxuXHRcdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0XHR0eXAgPSBuYW1lXG5cdFx0ZWxzZVx0XHRcdFxuXHRcdFx0aWYgJGRlYnVnJFxuXHRcdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgZmluZFRhZ1R5cGUobmFtZSlcblx0XHRcdHR5cCA9IGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwLmJ1aWxkKG93bmVyKVxuXG5cbmRlZiBJbWJhLmNyZWF0ZUVsZW1lbnQgbmFtZSwgY3R4LCByZWYsIHByZWZcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBwYXJlbnRcblx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHR0eXBlID0gbmFtZVxuXHRlbHNlXG5cdFx0aWYgJGRlYnVnJFxuXHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cGUgPSBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0cGFyZW50ID0gY3R4OnBhciRcblx0ZWxpZiBwcmVmIGlzYSBJbWJhLlRhZ1xuXHRcdHBhcmVudCA9IHByZWZcblx0ZWxzZVxuXHRcdHBhcmVudCA9IGN0eCBhbmQgcHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiAoY3R4IGFuZCBjdHguQHRhZyBvciBjdHgpXG5cblx0dmFyIG5vZGUgPSB0eXBlLmJ1aWxkKHBhcmVudClcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0Y3R4OmkkKytcblx0XHRub2RlOiRrZXkgPSByZWZcblxuXHQjIG5vZGU6JHJlZiA9IHJlZiBpZiByZWZcblx0IyBjb250ZXh0OmkkKysgIyBvbmx5IGlmIGl0IGlzIG5vdCBhbiBhcnJheT9cblx0aWYgY3R4IGFuZCByZWYgIT0gdW5kZWZpbmVkXG5cdFx0Y3R4W3JlZl0gPSBub2RlXG5cblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnQ2FjaGUgb3duZXJcblx0dmFyIGl0ZW0gPSBbXVxuXHRpdGVtLkB0YWcgPSBvd25lclxuXHRyZXR1cm4gaXRlbVxuXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblx0XG5kZWYgSW1iYS5jcmVhdGVUYWdNYXAgY3R4LCByZWYsIHByZWZcblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTGlzdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA0XG5cdG5vZGUuQHRhZyA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xvb3BSZXN1bHQgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNVxuXHRub2RlOmNhY2hlID0ge2kkOiAwfVxuXHRyZXR1cm4gbm9kZVxuXG4jIHVzZSBhcnJheSBpbnN0ZWFkP1xuY2xhc3MgVGFnQ2FjaGVcblx0ZGVmIHNlbGYuYnVpbGQgb3duZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdGFnID0gb3duZXJcblx0XHRyZXR1cm4gaXRlbVxuXG5cdGRlZiBpbml0aWFsaXplIG93bmVyXG5cdFx0c2VsZi5AdGFnID0gb3duZXJcblx0XHRzZWxmXG5cdFxuY2xhc3MgVGFnTWFwXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSwgcmVmLCBwYXJcblx0XHRzZWxmOmNhY2hlJCA9IGNhY2hlXG5cdFx0c2VsZjprZXkkID0gcmVmXG5cdFx0c2VsZjpwYXIkID0gcGFyXG5cdFx0c2VsZjppJCA9IDBcblx0XHQjIHNlbGY6Y3VyciQgPSBzZWxmOiRpdGVybmV3KClcblx0XHQjIHNlbGY6bmV4dCQgPSBzZWxmOiRpdGVybmV3KClcblx0XG5cdGRlZiAkaXRlclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0eXBlID0gNVxuXHRcdGl0ZW06c3RhdGljID0gNSAjIHdyb25nKCEpXG5cdFx0aXRlbTpjYWNoZSA9IHNlbGZcblx0XHRyZXR1cm4gaXRlbVxuXHRcdFxuXHRkZWYgJHBydW5lIGl0ZW1zXG5cdFx0bGV0IGNhY2hlID0gc2VsZjpjYWNoZSRcblx0XHRsZXQga2V5ID0gc2VsZjprZXkkXG5cdFx0bGV0IGNsb25lID0gVGFnTWFwLm5ldyhjYWNoZSxrZXksc2VsZjpwYXIkKVxuXHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRjbG9uZVtpdGVtOmtleSRdID0gaXRlbVxuXHRcdGNsb25lOmkkID0gaXRlbXM6bGVuZ3RoXG5cdFx0cmV0dXJuIGNhY2hlW2tleV0gPSBjbG9uZVxuXG5JbWJhLlRhZ01hcCA9IFRhZ01hcFxuSW1iYS5UYWdDYWNoZSA9IFRhZ0NhY2hlXG5JbWJhLlNJTkdMRVRPTlMgPSB7fVxuSW1iYS5UQUdTID0gSW1iYS5UYWdzLm5ld1xuSW1iYS5UQUdTWzplbGVtZW50XSA9IEltYmEuVEFHU1s6aHRtbGVsZW1lbnRdID0gSW1iYS5UYWdcbkltYmEuVEFHU1snc3ZnOmVsZW1lbnQnXSA9IEltYmEuU1ZHVGFnXG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbiMgc2h1b2xkIGJlIHBoYXNlZCBvdXRcbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbmFtZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIG5zID0gSW1iYS5UQUdTICMgIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudCA/IEltYmEuVEFHUzpfU1ZHIDogSW1iYS5UQUdTXG5cblx0aWYgZG9tOmlkIGFuZCBJbWJhLlNJTkdMRVRPTlNbZG9tOmlkXVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ1NpbmdsZXRvbihkb206aWQpXG5cdFx0XG5cdGlmIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShcInN2ZzpcIiArIG5hbWUpXG5cdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZihuYW1lKSA+PSAwXG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cdGVsc2Vcblx0XHR0eXBlID0gSW1iYS5UYWdcblx0IyBpZiBucy5Abm9kZU5hbWVzLmluZGV4T2YobmFtZSkgPj0gMFxuXHQjXHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblxuXHRyZXR1cm4gdHlwZS5uZXcoZG9tLG51bGwpLmF3YWtlbihkb20pXG5cbiMgZGVwcmVjYXRlXG5kZWYgSW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzXG5cdHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQsICcnKVxuXG5cdGZvciBwcmVmaXhlZCBpbiBzdHlsZXNcblx0XHR2YXIgdW5wcmVmaXhlZCA9IHByZWZpeGVkLnJlcGxhY2UoL14tKHdlYmtpdHxtc3xtb3p8b3xibGluayktLywnJylcblx0XHR2YXIgY2FtZWxDYXNlID0gdW5wcmVmaXhlZC5yZXBsYWNlKC8tKFxcdykvZykgZG8gfG0sYXwgYS50b1VwcGVyQ2FzZVxuXG5cdFx0IyBpZiB0aGVyZSBleGlzdHMgYW4gdW5wcmVmaXhlZCB2ZXJzaW9uIC0tIGFsd2F5cyB1c2UgdGhpc1xuXHRcdGlmIHByZWZpeGVkICE9IHVucHJlZml4ZWRcblx0XHRcdGNvbnRpbnVlIGlmIHN0eWxlcy5oYXNPd25Qcm9wZXJ0eSh1bnByZWZpeGVkKVxuXG5cdFx0IyByZWdpc3RlciB0aGUgcHJlZml4ZXNcblx0XHRJbWJhLkNTU0tleU1hcFt1bnByZWZpeGVkXSA9IEltYmEuQ1NTS2V5TWFwW2NhbWVsQ2FzZV0gPSBwcmVmaXhlZFxuXHRyZXR1cm5cblxuaWYgJHdlYiRcblx0SW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzIGlmIGRvY3VtZW50XG5cblx0IyBPdnZlcnJpZGUgY2xhc3NMaXN0XG5cdGlmIGRvY3VtZW50IGFuZCAhZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50OmNsYXNzTGlzdFxuXHRcdGV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdFx0XHRkZWYgaGFzRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIFJlZ0V4cC5uZXcoJyhefFxcXFxzKScgKyByZWYgKyAnKFxcXFxzfCQpJykudGVzdChAZG9tOmNsYXNzTmFtZSlcblxuXHRcdFx0ZGVmIGFkZEZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIGlmIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSArPSAoQGRvbTpjbGFzc05hbWUgPyAnICcgOiAnJykgKyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHVuZmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHR2YXIgcmVnZXggPSBSZWdFeHAubmV3KCcoXnxcXFxccykqJyArIHJlZiArICcoXFxcXHN8JCkqJywgJ2cnKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSA9IEBkb206Y2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsICcnKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdG9nZ2xlRmxhZyByZWZcblx0XHRcdFx0aGFzRmxhZyhyZWYpID8gdW5mbGFnKHJlZikgOiBmbGFnKHJlZilcblxuXHRcdFx0ZGVmIGZsYWcgcmVmLCBib29sXG5cdFx0XHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMiBhbmQgISFib29sID09PSBub1xuXHRcdFx0XHRcdHJldHVybiB1bmZsYWcocmVmKVxuXHRcdFx0XHRyZXR1cm4gYWRkRmxhZyhyZWYpXG5cbkltYmEuVGFnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgcHJlZGVmaW5lIGFsbCBzdXBwb3J0ZWQgaHRtbCB0YWdzXG50YWcgZnJhZ21lbnQgPCBlbGVtZW50XG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdEltYmEuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuXG5leHRlbmQgdGFnIGh0bWxcblx0ZGVmIHBhcmVudFxuXHRcdG51bGxcblxuXG5leHRlbmQgdGFnIGNhbnZhc1xuXHRkZWYgY29udGV4dCB0eXBlID0gJzJkJ1xuXHRcdGRvbS5nZXRDb250ZXh0KHR5cGUpXG5cbmNsYXNzIERhdGFWYWx1ZVxuXHRcblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgcGF0aCwgbW9kc1xuXHRcdEBub2RlID0gbm9kZVxuXHRcdEBwYXRoID0gcGF0aFxuXHRcdEBtb2RzID0gbW9kcyBvciB7fVxuXHRcdEBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKEBwYXRoKVxuXHRcdGxldCB2YWx1ZUZuID0gbm9kZTp2YWx1ZVxuXHRcdG5vZGU6dmFsdWUgPSBkbyBtb2QodmFsdWVGbi5jYWxsKHRoaXMpKVxuXHRcblx0ZGVmIGNvbnRleHRcblx0XHRyZXR1cm4gQGNvbnRleHQgaWYgQGNvbnRleHRcblx0XHQjIGNhY2hpbmcgY2FuIGxlYWQgdG8gd2VpcmQgYmVoYXZpb3VyXG5cdFx0bGV0IGVsID0gQG5vZGVcblx0XHR3aGlsZSBlbFxuXHRcdFx0aWYgZWwuZGF0YVxuXHRcdFx0XHRAY29udGV4dCA9IGVsXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRlbCA9IGVsLkBvd25lcl9cblx0XHRyZXR1cm4gQGNvbnRleHRcblx0XHRcblx0ZGVmIGRhdGFcblx0XHR2YXIgY3R4ID0gY29udGV4dFxuXHRcdGN0eCA/IGN0eC5kYXRhIDogbnVsbFxuXHRcdFxuXHRkZWYgbGF6eVxuXHRcdEBtb2RzOmxhenlcblx0XHRcblx0ZGVmIGdldFxuXHRcdGxldCBkYXRhID0gc2VsZi5kYXRhXG5cdFx0cmV0dXJuIG51bGwgdW5sZXNzIGRhdGFcblx0XHRsZXQgdmFsID0gZGF0YVtAcGF0aF1cblx0XHRyZXR1cm4gdmFsIGlzYSBGdW5jdGlvbiBhbmQgZGF0YVtAc2V0dGVyXSA/IGRhdGFbQHBhdGhdKCkgOiB2YWxcblx0XHRcblx0ZGVmIHNldCB2YWx1ZVxuXHRcdGxldCBkYXRhID0gc2VsZi5kYXRhXG5cdFx0cmV0dXJuIHVubGVzcyBkYXRhXG5cblx0XHRsZXQgcHJldiA9IGRhdGFbQHBhdGhdXG5cdFx0aWYgcHJldiBpc2EgRnVuY3Rpb25cblx0XHRcdGlmIGRhdGFbQHNldHRlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdGRhdGFbQHNldHRlcl0odmFsdWUpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0ZGF0YVtAcGF0aF0gPSB2YWx1ZVxuXHRcdFxuXHRkZWYgaXNBcnJheSB2YWwgPSBnZXRcblx0XHR2YWwgYW5kIHZhbDpzcGxpY2UgYW5kIHZhbDpzb3J0XG5cdFxuXHRkZWYgbW9kIHZhbHVlXG5cdFx0aWYgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRyZXR1cm4gdmFsdWUubWFwIGRvIG1vZCgkMSlcblx0XHRpZiBAbW9kczp0cmltIGFuZCB2YWx1ZSBpc2EgU3RyaW5nXG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnRyaW1cblx0XHRpZiBAbW9kczpudW1iZXJcblx0XHRcdHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSlcblx0XHRyZXR1cm4gdmFsdWVcblxuZXh0ZW5kIHRhZyBpbnB1dFxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblx0XG5cdGRlZiBzZXRNb2RlbCB2YWx1ZSwgbW9kc1xuXHRcdEBtb2RlbCB8fD0gRGF0YVZhbHVlLm5ldyhzZWxmLHZhbHVlLG1vZHMpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0bW9kZWwgYW5kICFtb2RlbC5sYXp5ID8gbW9kZWwuc2V0KHZhbHVlKSA6IGUuc2lsZW5jZVx0XHRcblx0XHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbW9kZWxWYWx1ZSA9IEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIGUuc2lsZW5jZSB1bmxlc3MgbW9kZWxcblx0XHRcblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgY2hlY2tlZCA9IEBkb206Y2hlY2tlZFxuXHRcdFx0bGV0IG12YWwgPSBtb2RlbC5nZXRcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlICE9IHVuZGVmaW5lZCA/IEB2YWx1ZSA6IHZhbHVlXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiY2hhbmdlXCIsdHlwZSxjaGVja2VkLGR2YWxcblxuXHRcdFx0aWYgdHlwZSA9PSAncmFkaW8nXG5cdFx0XHRcdG1vZGVsLnNldChkdmFsLHRydWUpXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdG1vZGVsLnNldCghIWNoZWNrZWQsdHJ1ZSlcblx0XHRcdGVsaWYgbW9kZWwuaXNBcnJheVxuXHRcdFx0XHRsZXQgaWR4ID0gbXZhbC5pbmRleE9mKGR2YWwpXG5cdFx0XHRcdGlmIGNoZWNrZWQgYW5kIGlkeCA9PSAtMVxuXHRcdFx0XHRcdG12YWwucHVzaChkdmFsKVxuXHRcdFx0XHRlbGlmICFjaGVja2VkIGFuZCBpZHggPj0gMFxuXHRcdFx0XHRcdG12YWwuc3BsaWNlKGlkeCwxKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5zZXQoZHZhbClcblx0XHRlbHNlXG5cdFx0XHRtb2RlbC5zZXQodmFsdWUpXG5cdFxuXHQjIG92ZXJyaWRpbmcgZW5kIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZVxuXHRkZWYgZW5kXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBtb2RlbCBvciBAbG9jYWxWYWx1ZSAhPT0gdW5kZWZpbmVkXG5cdFx0bGV0IG12YWwgPSBAbW9kZWwuZ2V0XG5cdFx0cmV0dXJuIHNlbGYgaWYgbXZhbCA9PSBAbW9kZWxWYWx1ZVxuXHRcdEBtb2RlbFZhbHVlID0gbXZhbCB1bmxlc3MgbW9kZWwuaXNBcnJheVxuXG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWVcblx0XHRcdGxldCBjaGVja2VkID0gaWYgbW9kZWwuaXNBcnJheVxuXHRcdFx0XHRtdmFsLmluZGV4T2YoZHZhbCkgPj0gMFxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHQhIW12YWxcblx0XHRcdGVsc2Vcblx0XHRcdFx0bXZhbCA9PSBAdmFsdWVcblxuXHRcdFx0QGRvbTpjaGVja2VkID0gY2hlY2tlZFxuXHRcdGVsc2Vcblx0XHRcdEBkb206dmFsdWUgPSBtdmFsXG5cdFx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyB0ZXh0YXJlYVxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSB2YWx1ZSBpZiBAbG9jYWxWYWx1ZSA9PSB1bmRlZmluZWRcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdG1vZGVsIGFuZCAhbW9kZWwubGF6eSA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2VcblxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0bW9kZWwgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gaWYgQGxvY2FsVmFsdWUgIT0gdW5kZWZpbmVkIG9yICFtb2RlbFxuXHRcdGlmIG1vZGVsXG5cdFx0XHRAZG9tOnZhbHVlID0gbW9kZWwuZ2V0XG5cdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgb3B0aW9uXG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHZhbHVlXG5cdFx0QHZhbHVlIG9yIGRvbTp2YWx1ZVxuXG5leHRlbmQgdGFnIHNlbGVjdFxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0QHZhbHVlID0gdmFsdWVcblx0XHRcdGlmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0J1xuXHRcdFx0XHRmb3Igb3B0LGkgaW4gZG9tOm9wdGlvbnNcblx0XHRcdFx0XHRsZXQgb3ZhbCA9IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKVxuXHRcdFx0XHRcdGlmIHZhbHVlID09IG92YWxcblx0XHRcdFx0XHRcdGRvbTpzZWxlY3RlZEluZGV4ID0gaVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tOnZhbHVlID0gdmFsdWVcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgdmFsdWVcblx0XHRpZiBtdWx0aXBsZVxuXHRcdFx0Zm9yIG9wdGlvbiBpbiBkb206c2VsZWN0ZWRPcHRpb25zXG5cdFx0XHRcdG9wdGlvbi5AdGFnID8gb3B0aW9uLkB0YWcudmFsdWUgOiBvcHRpb246dmFsdWVcblx0XHRlbHNlXG5cdFx0XHRsZXQgb3B0ID0gZG9tOnNlbGVjdGVkT3B0aW9uc1swXVxuXHRcdFx0b3B0ID8gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpIDogbnVsbFxuXHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRtb2RlbCA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiB1bmxlc3MgbW9kZWxcblxuXHRcdGxldCBtdmFsID0gbW9kZWwuZ2V0XG5cdFx0IyBzeW5jIGRvbSB2YWx1ZVxuXHRcdGlmIG11bHRpcGxlXG5cdFx0XHRmb3Igb3B0aW9uIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdGxldCBvdmFsID0gbW9kZWwubW9kKG9wdGlvbi5AdGFnID8gb3B0aW9uLkB0YWcudmFsdWUgOiBvcHRpb246dmFsdWUpXG5cdFx0XHRcdGxldCBzZWwgPSBtdmFsLmluZGV4T2Yob3ZhbCkgPj0gMFxuXHRcdFx0XHRvcHRpb246c2VsZWN0ZWQgPSBzZWxcblx0XHRlbHNlXG5cdFx0XHRzZXRWYWx1ZShtdmFsKVxuXHRcdFx0IyB3aGF0IGlmIG12YWwgaXMgcmljaD8gV291bGQgYmUgbmljZSB3aXRoIHNvbWUgbWFwcGluZ1xuXHRcdFx0IyBkb206dmFsdWUgPSBtdmFsXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9odG1sLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgSW1iYS5Ub3VjaFxuIyBCZWdhblx0QSBmaW5nZXIgdG91Y2hlZCB0aGUgc2NyZWVuLlxuIyBNb3ZlZFx0QSBmaW5nZXIgbW92ZWQgb24gdGhlIHNjcmVlbi5cbiMgU3RhdGlvbmFyeVx0QSBmaW5nZXIgaXMgdG91Y2hpbmcgdGhlIHNjcmVlbiBidXQgaGFzbid0IG1vdmVkLlxuIyBFbmRlZFx0QSBmaW5nZXIgd2FzIGxpZnRlZCBmcm9tIHRoZSBzY3JlZW4uIFRoaXMgaXMgdGhlIGZpbmFsIHBoYXNlIG9mIGEgdG91Y2guXG4jIENhbmNlbGVkIFRoZSBzeXN0ZW0gY2FuY2VsbGVkIHRyYWNraW5nIGZvciB0aGUgdG91Y2guXG5cbiMjI1xuQ29uc29saWRhdGVzIG1vdXNlIGFuZCB0b3VjaCBldmVudHMuIFRvdWNoIG9iamVjdHMgcGVyc2lzdCBhY3Jvc3MgYSB0b3VjaCxcbmZyb20gdG91Y2hzdGFydCB1bnRpbCBlbmQvY2FuY2VsLiBXaGVuIGEgdG91Y2ggc3RhcnRzLCBpdCB3aWxsIHRyYXZlcnNlXG5kb3duIGZyb20gdGhlIGlubmVybW9zdCB0YXJnZXQsIHVudGlsIGl0IGZpbmRzIGEgbm9kZSB0aGF0IHJlc3BvbmRzIHRvXG5vbnRvdWNoc3RhcnQuIFVubGVzcyB0aGUgdG91Y2ggaXMgZXhwbGljaXRseSByZWRpcmVjdGVkLCB0aGUgdG91Y2ggd2lsbFxuY2FsbCBvbnRvdWNobW92ZSBhbmQgb250b3VjaGVuZCAvIG9udG91Y2hjYW5jZWwgb24gdGhlIHJlc3BvbmRlciB3aGVuIGFwcHJvcHJpYXRlLlxuXG5cdHRhZyBkcmFnZ2FibGVcblx0XHQjIGNhbGxlZCB3aGVuIGEgdG91Y2ggc3RhcnRzXG5cdFx0ZGVmIG9udG91Y2hzdGFydCB0b3VjaFxuXHRcdFx0ZmxhZyAnZHJhZ2dpbmcnXG5cdFx0XHRzZWxmXG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBtb3ZlcyAtIHNhbWUgdG91Y2ggb2JqZWN0XG5cdFx0ZGVmIG9udG91Y2htb3ZlIHRvdWNoXG5cdFx0XHQjIG1vdmUgdGhlIG5vZGUgd2l0aCB0b3VjaFxuXHRcdFx0Y3NzIHRvcDogdG91Y2guZHksIGxlZnQ6IHRvdWNoLmR4XG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBlbmRzXG5cdFx0ZGVmIG9udG91Y2hlbmQgdG91Y2hcblx0XHRcdHVuZmxhZyAnZHJhZ2dpbmcnXG5cbkBpbmFtZSB0b3VjaFxuIyMjXG5jbGFzcyBJbWJhLlRvdWNoXG5cdHNlbGYuTGFzdFRpbWVzdGFtcCA9IDBcblx0c2VsZi5UYXBUaW1lb3V0ID0gNTBcblxuXHQjIHZhciBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0ID0gNTBcblxuXHR2YXIgdG91Y2hlcyA9IFtdXG5cdHZhciBjb3VudCA9IDBcblx0dmFyIGlkZW50aWZpZXJzID0ge31cblxuXHRkZWYgc2VsZi5jb3VudFxuXHRcdGNvdW50XG5cblx0ZGVmIHNlbGYubG9va3VwIGl0ZW1cblx0XHRyZXR1cm4gaXRlbSBhbmQgKGl0ZW06X190b3VjaF9fIG9yIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl0pXG5cblx0ZGVmIHNlbGYucmVsZWFzZSBpdGVtLHRvdWNoXG5cdFx0ZGVsZXRlIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl1cblx0XHRkZWxldGUgaXRlbTpfX3RvdWNoX19cblx0XHRyZXR1cm5cblxuXHRkZWYgc2VsZi5vbnRvdWNoc3RhcnQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGNvbnRpbnVlIGlmIGxvb2t1cCh0KVxuXHRcdFx0dmFyIHRvdWNoID0gaWRlbnRpZmllcnNbdDppZGVudGlmaWVyXSA9IHNlbGYubmV3KGUpICMgKGUpXG5cdFx0XHR0Ol9fdG91Y2hfXyA9IHRvdWNoXG5cdFx0XHR0b3VjaGVzLnB1c2godG91Y2gpXG5cdFx0XHRjb3VudCsrXG5cdFx0XHR0b3VjaC50b3VjaHN0YXJ0KGUsdClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaG1vdmUgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaG1vdmUoZSx0KVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hlbmQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGVuZChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXG5cdFx0IyBlLnByZXZlbnREZWZhdWx0XG5cdFx0IyBub3QgYWx3YXlzIHN1cHBvcnRlZCFcblx0XHQjIHRvdWNoZXMgPSB0b3VjaGVzLmZpbHRlcih8fClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGNhbmNlbCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoY2FuY2VsKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vkb3duIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZW1vdmUgZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNldXAgZVxuXHRcdHNlbGZcblxuXG5cdHByb3AgcGhhc2Vcblx0cHJvcCBhY3RpdmVcblx0cHJvcCBldmVudFxuXHRwcm9wIHBvaW50ZXJcblx0cHJvcCB0YXJnZXRcblx0cHJvcCBoYW5kbGVyXG5cdHByb3AgdXBkYXRlc1xuXHRwcm9wIHN1cHByZXNzXG5cdHByb3AgZGF0YVxuXHRwcm9wIGJ1YmJsZSBjaGFpbmFibGU6IHllc1xuXHRwcm9wIHRpbWVzdGFtcFxuXG5cdHByb3AgZ2VzdHVyZXNcblxuXHQjIyNcblx0QGludGVybmFsXG5cdEBjb25zdHJ1Y3RvclxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgZXZlbnQsIHBvaW50ZXJcblx0XHQjIEBuYXRpdmUgID0gZmFsc2Vcblx0XHRzZWxmLmV2ZW50ID0gZXZlbnRcblx0XHRkYXRhID0ge31cblx0XHRhY3RpdmUgPSB5ZXNcblx0XHRAYnV0dG9uID0gZXZlbnQgYW5kIGV2ZW50OmJ1dHRvbiBvciAwXG5cdFx0QHN1cHByZXNzID0gbm8gIyBkZXByZWNhdGVkXG5cdFx0QGNhcHR1cmVkID0gbm9cblx0XHRidWJibGUgPSBub1xuXHRcdHBvaW50ZXIgPSBwb2ludGVyXG5cdFx0dXBkYXRlcyA9IDBcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjYXB0dXJlXG5cdFx0QGNhcHR1cmVkID0geWVzXG5cdFx0QGV2ZW50IGFuZCBAZXZlbnQuc3RvcFByb3BhZ2F0aW9uXG5cdFx0dW5sZXNzIEBzZWxibG9ja2VyXG5cdFx0XHRAc2VsYmxvY2tlciA9IGRvIHxlfCBlLnByZXZlbnREZWZhdWx0XG5cdFx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JyxAc2VsYmxvY2tlcix5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBpc0NhcHR1cmVkXG5cdFx0ISFAY2FwdHVyZWRcblxuXHQjIyNcblx0RXh0ZW5kIHRoZSB0b3VjaCB3aXRoIGEgcGx1Z2luIC8gZ2VzdHVyZS4gXG5cdEFsbCBldmVudHMgKHRvdWNoc3RhcnQsbW92ZSBldGMpIGZvciB0aGUgdG91Y2hcblx0d2lsbCBiZSB0cmlnZ2VyZWQgb24gdGhlIHBsdWdpbnMgaW4gdGhlIG9yZGVyIHRoZXlcblx0YXJlIGFkZGVkLlxuXHQjIyNcblx0ZGVmIGV4dGVuZCBwbHVnaW5cblx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgZ2VzdHVyZSEhIVwiXG5cdFx0QGdlc3R1cmVzIHx8PSBbXVxuXHRcdEBnZXN0dXJlcy5wdXNoKHBsdWdpbilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRvdWNoIHRvIHNwZWNpZmllZCB0YXJnZXQuIG9udG91Y2hzdGFydCB3aWxsIGFsd2F5cyBiZVxuXHRjYWxsZWQgb24gdGhlIG5ldyB0YXJnZXQuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiByZWRpcmVjdCB0YXJnZXRcblx0XHRAcmVkaXJlY3QgPSB0YXJnZXRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN1cHByZXNzIHRoZSBkZWZhdWx0IGJlaGF2aW91ci4gV2lsbCBjYWxsIHByZXZlbnREZWZhdWx0IGZvclxuXHRhbGwgbmF0aXZlIGV2ZW50cyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB0b3VjaC5cblx0IyMjXG5cdGRlZiBzdXBwcmVzc1xuXHRcdCMgY29sbGlzaW9uIHdpdGggdGhlIHN1cHByZXNzIHByb3BlcnR5XG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzdXBwcmVzcz0gdmFsdWVcblx0XHRjb25zb2xlLndhcm4gJ0ltYmEuVG91Y2gjc3VwcHJlc3M9IGlzIGRlcHJlY2F0ZWQnXG5cdFx0QHN1cHJlc3MgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hzdGFydCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHRvdWNoID0gdFxuXHRcdEBidXR0b24gPSAwXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaG1vdmUgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHR1cGRhdGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoZW5kIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblxuXHRcdEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCA9IGU6dGltZVN0YW1wXG5cblx0XHRpZiBAbWF4ZHIgPCAyMFxuXHRcdFx0dmFyIHRhcCA9IEltYmEuRXZlbnQubmV3KGUpXG5cdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHR0YXAucHJvY2Vzc1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiB0YXAuQHJlc3BvbmRlclx0XG5cblx0XHRpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0XG5cblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoY2FuY2VsIGUsdFxuXHRcdGNhbmNlbFxuXG5cdGRlZiBtb3VzZWRvd24gZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBidXR0b24gPSBlOmJ1dHRvblxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdEBtb3VzZW1vdmUgPSAofGV8IG1vdXNlbW92ZShlLGUpIClcblx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZW1vdmUgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdEBldmVudCA9IGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGlzQ2FwdHVyZWRcblx0XHR1cGRhdGVcblx0XHRtb3ZlXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZXVwIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXHRcdHNlbGZcblxuXHRkZWYgaWRsZVxuXHRcdHVwZGF0ZVxuXG5cdGRlZiBiZWdhblxuXHRcdEB0aW1lc3RhbXAgPSBEYXRlLm5vd1xuXHRcdEBtYXhkciA9IEBkciA9IDBcblx0XHRAeDAgPSBAeFxuXHRcdEB5MCA9IEB5XG5cblx0XHR2YXIgZG9tID0gZXZlbnQ6dGFyZ2V0XG5cdFx0dmFyIG5vZGUgPSBudWxsXG5cblx0XHRAc291cmNlVGFyZ2V0ID0gZG9tIGFuZCB0YWcoZG9tKVxuXG5cdFx0d2hpbGUgZG9tXG5cdFx0XHRub2RlID0gdGFnKGRvbSlcblx0XHRcdGlmIG5vZGUgJiYgbm9kZTpvbnRvdWNoc3RhcnRcblx0XHRcdFx0QGJ1YmJsZSA9IG5vXG5cdFx0XHRcdHRhcmdldCA9IG5vZGVcblx0XHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKVxuXHRcdFx0XHRicmVhayB1bmxlc3MgQGJ1YmJsZVxuXHRcdFx0ZG9tID0gZG9tOnBhcmVudE5vZGVcblxuXHRcdEB1cGRhdGVzKytcblx0XHRzZWxmXG5cblx0ZGVmIHVwZGF0ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdHZhciBkciA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxuXHRcdEBtYXhkciA9IGRyIGlmIGRyID4gQGRyXG5cdFx0QGRyID0gZHJcblxuXHRcdCMgY2F0Y2hpbmcgYSB0b3VjaC1yZWRpcmVjdD8hP1xuXHRcdGlmIEByZWRpcmVjdFxuXHRcdFx0aWYgQHRhcmdldCBhbmQgQHRhcmdldDpvbnRvdWNoY2FuY2VsXG5cdFx0XHRcdEB0YXJnZXQub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdFx0dGFyZ2V0ID0gQHJlZGlyZWN0XG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpIGlmIHRhcmdldDpvbnRvdWNoc3RhcnRcblx0XHRcdHJldHVybiB1cGRhdGUgaWYgQHJlZGlyZWN0ICMgcG9zc2libHkgcmVkaXJlY3RpbmcgYWdhaW5cblxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNodXBkYXRlKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNodXBkYXRlKHNlbGYpXG5cdFx0dXBkYXRlIGlmIEByZWRpcmVjdFxuXHRcdHNlbGZcblxuXHRkZWYgbW92ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaG1vdmUoc2VsZixAZXZlbnQpIGlmIGc6b250b3VjaG1vdmVcblxuXHRcdHRhcmdldD8ub250b3VjaG1vdmUoc2VsZixAZXZlbnQpXG5cdFx0c2VsZlxuXG5cdGRlZiBlbmRlZFxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNoZW5kKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNoZW5kKHNlbGYpXG5cdFx0Y2xlYW51cF9cblx0XHRzZWxmXG5cblx0ZGVmIGNhbmNlbFxuXHRcdHVubGVzcyBAY2FuY2VsbGVkXG5cdFx0XHRAY2FuY2VsbGVkID0geWVzXG5cdFx0XHRjYW5jZWxsZWRcblx0XHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxsZWRcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgQGFjdGl2ZVxuXG5cdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaGNhbmNlbChzZWxmKSBpZiBnOm9udG91Y2hjYW5jZWxcblxuXHRcdHRhcmdldD8ub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGNsZWFudXBfXG5cdFx0aWYgQG1vdXNlbW92ZVxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdFx0QG1vdXNlbW92ZSA9IG51bGxcblx0XHRcblx0XHRpZiBAc2VsYmxvY2tlclxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdFx0QHNlbGJsb2NrZXIgPSBudWxsXG5cdFx0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUaGUgYWJzb2x1dGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBmcm9tIHN0YXJ0aW5nIHBvc2l0aW9uIFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHIgZG8gQGRyXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGhvcml6b250YWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHggZG8gQHggLSBAeDBcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgdmVydGljYWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHkgZG8gQHkgLSBAeTBcblxuXHQjIyNcblx0SW5pdGlhbCBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4MCBkbyBAeDBcblxuXHQjIyNcblx0SW5pdGlhbCB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeTAgZG8gQHkwXG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHggZG8gQHhcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkgZG8gQHlcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR4IGRvXG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHggLSBAdGFyZ2V0Qm94OmxlZnRcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eVxuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB5IC0gQHRhcmdldEJveDp0b3BcblxuXHQjIyNcblx0QnV0dG9uIHByZXNzZWQgaW4gdGhpcyB0b3VjaC4gTmF0aXZlIHRvdWNoZXMgZGVmYXVsdHMgdG8gbGVmdC1jbGljayAoMClcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGJ1dHRvbiBkbyBAYnV0dG9uICMgQHBvaW50ZXIgPyBAcG9pbnRlci5idXR0b24gOiAwXG5cblx0ZGVmIHNvdXJjZVRhcmdldFxuXHRcdEBzb3VyY2VUYXJnZXRcblxuXHRkZWYgZWxhcHNlZFxuXHRcdERhdGUubm93IC0gQHRpbWVzdGFtcFxuXG5cbmNsYXNzIEltYmEuVG91Y2hHZXN0dXJlXG5cblx0cHJvcCBhY3RpdmUgZGVmYXVsdDogbm9cblxuXHRkZWYgb250b3VjaHN0YXJ0IGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2h1cGRhdGUgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaGVuZCBlXG5cdFx0c2VsZlxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdG91Y2guaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxudmFyIGtleUNvZGVzID0ge1xuXHRlc2M6IDI3LFxuXHR0YWI6IDksXG5cdGVudGVyOiAxMyxcblx0c3BhY2U6IDMyLFxuXHR1cDogMzgsXG5cdGRvd246IDQwXG59XG5cbnZhciBlbCA9IEltYmEuVGFnOnByb3RvdHlwZVxuZGVmIGVsLnN0b3BNb2RpZmllciBlIGRvIGUuc3RvcCB8fCB0cnVlXG5kZWYgZWwucHJldmVudE1vZGlmaWVyIGUgZG8gZS5wcmV2ZW50IHx8IHRydWVcbmRlZiBlbC5zaWxlbmNlTW9kaWZpZXIgZSBkbyBlLnNpbGVuY2UgfHwgdHJ1ZVxuZGVmIGVsLmJ1YmJsZU1vZGlmaWVyIGUgZG8gZS5idWJibGUoeWVzKSB8fCB0cnVlXG5kZWYgZWwuY3RybE1vZGlmaWVyIGUgZG8gZS5ldmVudDpjdHJsS2V5ID09IHRydWVcbmRlZiBlbC5hbHRNb2RpZmllciBlIGRvIGUuZXZlbnQ6YWx0S2V5ID09IHRydWVcbmRlZiBlbC5zaGlmdE1vZGlmaWVyIGUgZG8gZS5ldmVudDpzaGlmdEtleSA9PSB0cnVlXG5kZWYgZWwubWV0YU1vZGlmaWVyIGUgZG8gZS5ldmVudDptZXRhS2V5ID09IHRydWVcbmRlZiBlbC5rZXlNb2RpZmllciBrZXksIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSBrZXkpIDogdHJ1ZVxuZGVmIGVsLmRlbE1vZGlmaWVyIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSA4IG9yIGUua2V5Q29kZSA9PSA0NikgOiB0cnVlXG5kZWYgZWwuc2VsZk1vZGlmaWVyIGUgZG8gZS5ldmVudDp0YXJnZXQgPT0gQGRvbVxuZGVmIGVsLmxlZnRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMCkgOiBlbC5rZXlNb2RpZmllcigzNyxlKVxuZGVmIGVsLnJpZ2h0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDIpIDogZWwua2V5TW9kaWZpZXIoMzksZSlcbmRlZiBlbC5taWRkbGVNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMSkgOiB0cnVlXG5kZWYgZWwuZ2V0SGFuZGxlciBzdHIgZG9cblx0aWYgc2VsZltzdHJdXG5cdFx0cmV0dXJuIHNlbGZcblx0ZWxpZiBAZGF0YSBhbmQgQGRhdGFbc3RyXSBpc2EgRnVuY3Rpb25cblx0XHRyZXR1cm4gQGRhdGFcblxuIyMjXG5JbWJhIGhhbmRsZXMgYWxsIGV2ZW50cyBpbiB0aGUgZG9tIHRocm91Z2ggYSBzaW5nbGUgbWFuYWdlcixcbmxpc3RlbmluZyBhdCB0aGUgcm9vdCBvZiB5b3VyIGRvY3VtZW50LiBJZiBJbWJhIGZpbmRzIGEgdGFnXG50aGF0IGxpc3RlbnMgdG8gYSBjZXJ0YWluIGV2ZW50LCB0aGUgZXZlbnQgd2lsbCBiZSB3cmFwcGVkIFxuaW4gYW4gYEltYmEuRXZlbnRgLCB3aGljaCBub3JtYWxpemVzIHNvbWUgb2YgdGhlIHF1aXJrcyBhbmQgXG5icm93c2VyIGRpZmZlcmVuY2VzLlxuXG5AaW5hbWUgZXZlbnRcbiMjI1xuY2xhc3MgSW1iYS5FdmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBldmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBwcmVmaXhcblxuXHRwcm9wIGRhdGFcblxuXHRwcm9wIHJlc3BvbmRlclxuXG5cdGRlZiBzZWxmLndyYXAgZVxuXHRcdHNlbGYubmV3KGUpXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBlXG5cdFx0ZXZlbnQgPSBlXG5cdFx0QGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlXG5cdFx0QHR5cGUgfHwgZXZlbnQ6dHlwZVxuXHRcblx0ZGVmIGJ1dHRvbiBkbyBldmVudDpidXR0b25cblx0ZGVmIGtleUNvZGUgZG8gZXZlbnQ6a2V5Q29kZVxuXG5cdGRlZiBuYW1lXG5cdFx0QG5hbWUgfHw9IHR5cGUudG9Mb3dlckNhc2UucmVwbGFjZSgvXFw6L2csJycpXG5cblx0IyBtaW1jIGdldHNldFxuXHRkZWYgYnViYmxlIHZcblx0XHRpZiB2ICE9IHVuZGVmaW5lZFxuXHRcdFx0c2VsZi5idWJibGUgPSB2XG5cdFx0XHRyZXR1cm4gc2VsZlxuXHRcdHJldHVybiBAYnViYmxlXG5cblx0ZGVmIGJ1YmJsZT0gdlxuXHRcdEBidWJibGUgPSB2XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UHJldmVudHMgZnVydGhlciBwcm9wYWdhdGlvbiBvZiB0aGUgY3VycmVudCBldmVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzdG9wXG5cdFx0YnViYmxlID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIHN0b3BQcm9wYWdhdGlvbiBkbyBzdG9wXG5cdGRlZiBoYWx0IGRvIHN0b3BcblxuXHQjIG1pZ3JhdGUgZnJvbSBjYW5jZWwgdG8gcHJldmVudFxuXHRkZWYgcHJldmVudFxuXHRcdGlmIGV2ZW50OnByZXZlbnREZWZhdWx0XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdFxuXHRcdGVsc2Vcblx0XHRcdGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmOmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIHByZXZlbnREZWZhdWx0XG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjcHJldmVudERlZmF1bHQgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0IyMjXG5cdEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBldmVudC5jYW5jZWwgaGFzIGJlZW4gY2FsbGVkLlxuXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgaXNQcmV2ZW50ZWRcblx0XHRldmVudCBhbmQgZXZlbnQ6ZGVmYXVsdFByZXZlbnRlZCBvciBAY2FuY2VsXG5cblx0IyMjXG5cdENhbmNlbCB0aGUgZXZlbnQgKGlmIGNhbmNlbGFibGUpLiBJbiB0aGUgY2FzZSBvZiBuYXRpdmUgZXZlbnRzIGl0XG5cdHdpbGwgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSB3cmFwcGVkIGV2ZW50IG9iamVjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjYW5jZWxcblx0XHRjb25zb2xlLndhcm4gXCJFdmVudCNjYW5jZWwgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0ZGVmIHNpbGVuY2Vcblx0XHRAc2lsZW5jZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIGlzU2lsZW5jZWRcblx0XHQhIUBzaWxlbmNlZFxuXG5cdCMjI1xuXHRBIHJlZmVyZW5jZSB0byB0aGUgaW5pdGlhbCB0YXJnZXQgb2YgdGhlIGV2ZW50LlxuXHQjIyNcblx0ZGVmIHRhcmdldFxuXHRcdHRhZyhldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldClcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIG9iamVjdCByZXNwb25kaW5nIHRvIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiByZXNwb25kZXJcblx0XHRAcmVzcG9uZGVyXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRoZSBldmVudCB0byBuZXcgdGFyZ2V0XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3Qgbm9kZVxuXHRcdEByZWRpcmVjdCA9IG5vZGVcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBwcm9jZXNzSGFuZGxlcnMgbm9kZSwgaGFuZGxlcnNcblx0XHRsZXQgaSA9IDFcblx0XHRsZXQgbCA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdGxldCBidWJibGUgPSBAYnViYmxlXG5cdFx0bGV0IHN0YXRlID0gaGFuZGxlcnM6c3RhdGUgfHw9IHt9XG5cdFx0bGV0IHJlc3VsdCBcblx0XHRcblx0XHRpZiBidWJibGVcblx0XHRcdEBidWJibGUgPSAxXG5cblx0XHR3aGlsZSBpIDwgbFxuXHRcdFx0bGV0IGlzTW9kID0gZmFsc2Vcblx0XHRcdGxldCBoYW5kbGVyID0gaGFuZGxlcnNbaSsrXVxuXHRcdFx0bGV0IHBhcmFtcyAgPSBudWxsXG5cdFx0XHRsZXQgY29udGV4dCA9IG5vZGVcblx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgQXJyYXlcblx0XHRcdFx0cGFyYW1zID0gaGFuZGxlci5zbGljZSgxKVxuXHRcdFx0XHRoYW5kbGVyID0gaGFuZGxlclswXVxuXHRcdFx0XG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRpZiBrZXlDb2Rlc1toYW5kbGVyXVxuXHRcdFx0XHRcdHBhcmFtcyA9IFtrZXlDb2Rlc1toYW5kbGVyXV1cblx0XHRcdFx0XHRoYW5kbGVyID0gJ2tleSdcblx0XHRcdFx0XHRcblx0XHRcdFx0bGV0IG1vZCA9IGhhbmRsZXIgKyAnTW9kaWZpZXInXG5cblx0XHRcdFx0aWYgbm9kZVttb2RdXG5cdFx0XHRcdFx0aXNNb2QgPSB5ZXNcblx0XHRcdFx0XHRwYXJhbXMgPSAocGFyYW1zIG9yIFtdKS5jb25jYXQoW3NlbGYsc3RhdGVdKVxuXHRcdFx0XHRcdGhhbmRsZXIgPSBub2RlW21vZF1cblx0XHRcdFxuXHRcdFx0IyBpZiBpdCBpcyBzdGlsbCBhIHN0cmluZyAtIGNhbGwgZ2V0SGFuZGxlciBvblxuXHRcdFx0IyBhbmNlc3RvciBvZiBub2RlIHRvIHNlZSBpZiB3ZSBnZXQgYSBoYW5kbGVyIGZvciB0aGlzIG5hbWVcblx0XHRcdGlmIHR5cGVvZiBoYW5kbGVyID09ICdzdHJpbmcnXG5cdFx0XHRcdGxldCBlbCA9IG5vZGVcblx0XHRcdFx0bGV0IGZuID0gbnVsbFxuXHRcdFx0XHR3aGlsZSBlbCBhbmQgKCFmbiBvciAhKGZuIGlzYSBGdW5jdGlvbikpXG5cdFx0XHRcdFx0aWYgZm4gPSBlbC5nZXRIYW5kbGVyKGhhbmRsZXIpXG5cdFx0XHRcdFx0XHRpZiBmbltoYW5kbGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuW2hhbmRsZXJdXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQgPSBmblxuXHRcdFx0XHRcdFx0ZWxpZiBmbiBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQgPSBlbFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGVsID0gZWwucGFyZW50XG5cdFx0XHRcdFx0XG5cdFx0XHRpZiBoYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIHdoYXQgaWYgd2UgYWN0dWFsbHkgY2FsbCBzdG9wIGluc2lkZSBmdW5jdGlvbj9cblx0XHRcdFx0IyBkbyB3ZSBzdGlsbCB3YW50IHRvIGNvbnRpbnVlIHRoZSBjaGFpbj9cblx0XHRcdFx0bGV0IHJlcyA9IGhhbmRsZXIuYXBwbHkoY29udGV4dCxwYXJhbXMgb3IgW3NlbGZdKVxuXHRcdFx0XHRcblx0XHRcdFx0IyBzaG91bGQgd2UgdGFrZSBhd2FpdHMgaW50byBhY2NvdW50P1xuXHRcdFx0XHQjIHdhcyBidWJibGluZyBiZWZvcmUgLSBoYXMgbm90IGJlZW4gbW9kaWZpZWRcblx0XHRcdFx0aWYgIWlzTW9kXG5cdFx0XHRcdFx0YnViYmxlID0gbm8gIyBzdG9wIHByb3BhZ2F0aW9uIGJ5IGRlZmF1bHRcblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cblx0XHRcdFx0aWYgcmVzID09IGZhbHNlXG5cdFx0XHRcdFx0IyBjb25zb2xlLmxvZyBcInJldHVybmVkIGZhbHNlIC0gYnJlYWtpbmdcIlxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0aWYgcmVzIGFuZCAhQHNpbGVuY2VkIGFuZCByZXM6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRyZXMudGhlbihJbWJhOmNvbW1pdClcblx0XHRcblx0XHQjIGlmIHdlIGhhdmVudCBzdG9wcGVkIG9yIGRlYWx0IHdpdGggYnViYmxlIHdoaWxlIGhhbmRsaW5nXG5cdFx0aWYgQGJ1YmJsZSA9PT0gMVxuXHRcdFx0QGJ1YmJsZSA9IGJ1YmJsZVxuXG5cdFx0cmV0dXJuIG51bGxcblxuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBuYW1lID0gc2VsZi5uYW1lXG5cdFx0dmFyIG1ldGggPSBcIm9ue0BwcmVmaXggb3IgJyd9e25hbWV9XCJcblx0XHR2YXIgYXJncyA9IG51bGxcblx0XHR2YXIgZG9tdGFyZ2V0ID0gZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXRcdFx0XG5cdFx0dmFyIGRvbW5vZGUgPSBkb210YXJnZXQ6X3Jlc3BvbmRlciBvciBkb210YXJnZXRcblx0XHQjIEB0b2RvIG5lZWQgdG8gc3RvcCBpbmZpbml0ZSByZWRpcmVjdC1ydWxlcyBoZXJlXG5cdFx0dmFyIHJlc3VsdFxuXHRcdHZhciBoYW5kbGVyc1xuXG5cdFx0d2hpbGUgZG9tbm9kZVxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0bGV0IG5vZGUgPSBkb21ub2RlLkBkb20gPyBkb21ub2RlIDogZG9tbm9kZS5AdGFnXG5cblx0XHRcdGlmIG5vZGVcblx0XHRcdFx0aWYgbm9kZVttZXRoXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cdFx0XHRcdFx0QHNpbGVuY2VkID0gbm9cblx0XHRcdFx0XHRyZXN1bHQgPSBhcmdzID8gbm9kZVttZXRoXS5hcHBseShub2RlLGFyZ3MpIDogbm9kZVttZXRoXShzZWxmLGRhdGEpXG5cblx0XHRcdFx0aWYgaGFuZGxlcnMgPSBub2RlOl9vbl9cblx0XHRcdFx0XHRmb3IgaGFuZGxlciBpbiBoYW5kbGVycyB3aGVuIGhhbmRsZXJcblx0XHRcdFx0XHRcdGxldCBobmFtZSA9IGhhbmRsZXJbMF1cblx0XHRcdFx0XHRcdGlmIG5hbWUgPT0gaGFuZGxlclswXSBhbmQgYnViYmxlICMgYW5kIChobmFtZTpsZW5ndGggPT0gbmFtZTpsZW5ndGggb3IgaG5hbWVbbmFtZTpsZW5ndGhdID09ICcuJylcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc0hhbmRsZXJzKG5vZGUsaGFuZGxlcilcblx0XHRcdFx0XHRicmVhayB1bmxlc3MgYnViYmxlXG5cblx0XHRcdFx0aWYgbm9kZTpvbmV2ZW50XG5cdFx0XHRcdFx0bm9kZS5vbmV2ZW50KHNlbGYpXG5cblx0XHRcdCMgYWRkIG5vZGUubmV4dEV2ZW50UmVzcG9uZGVyIGFzIGEgc2VwYXJhdGUgbWV0aG9kIGhlcmU/XG5cdFx0XHR1bmxlc3MgYnViYmxlIGFuZCBkb21ub2RlID0gKEByZWRpcmVjdCBvciAobm9kZSA/IG5vZGUucGFyZW50IDogZG9tbm9kZTpwYXJlbnROb2RlKSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdHByb2Nlc3NlZFxuXG5cdFx0IyBpZiBhIGhhbmRsZXIgcmV0dXJucyBhIHByb21pc2UsIG5vdGlmeSBzY2hlZHVsZXJzXG5cdFx0IyBhYm91dCB0aGlzIGFmdGVyIHByb21pc2UgaGFzIGZpbmlzaGVkIHByb2Nlc3Npbmdcblx0XHRpZiByZXN1bHQgYW5kIHJlc3VsdDp0aGVuIGlzYSBGdW5jdGlvblxuXHRcdFx0cmVzdWx0LnRoZW4oc2VsZjpwcm9jZXNzZWQuYmluZChzZWxmKSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIHByb2Nlc3NlZFxuXHRcdGlmICFAc2lsZW5jZWQgYW5kIEByZXNwb25kZXJcblx0XHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsW3NlbGZdKVxuXHRcdFx0SW1iYS5jb21taXQoZXZlbnQpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHgvbGVmdCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB4IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHggZG8gZXZlbnQ6eFxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHkvdG9wIGNvb3JkaW5hdGUgb2YgdGhlIG1vdXNlIC8gcG9pbnRlciBmb3IgdGhpcyBldmVudFxuXHRAcmV0dXJuIHtOdW1iZXJ9IHkgY29vcmRpbmF0ZSBvZiBtb3VzZSAvIHBvaW50ZXIgZm9yIGV2ZW50XG5cdCMjI1xuXHRkZWYgeSBkbyBldmVudDp5XG5cblx0IyMjXG5cdFJldHVybnMgYSBOdW1iZXIgcmVwcmVzZW50aW5nIGEgc3lzdGVtIGFuZCBpbXBsZW1lbnRhdGlvblxuXHRkZXBlbmRlbnQgbnVtZXJpYyBjb2RlIGlkZW50aWZ5aW5nIHRoZSB1bm1vZGlmaWVkIHZhbHVlIG9mIHRoZVxuXHRwcmVzc2VkIGtleTsgdGhpcyBpcyB1c3VhbGx5IHRoZSBzYW1lIGFzIGtleUNvZGUuXG5cblx0Rm9yIG1vdXNlLWV2ZW50cywgdGhlIHJldHVybmVkIHZhbHVlIGluZGljYXRlcyB3aGljaCBidXR0b24gd2FzXG5cdHByZXNzZWQgb24gdGhlIG1vdXNlIHRvIHRyaWdnZXIgdGhlIGV2ZW50LlxuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB3aGljaCBkbyBldmVudDp3aGljaFxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcbnJlcXVpcmUoXCIuL3BvaW50ZXJcIilcblxuIyMjXG5cbk1hbmFnZXIgZm9yIGxpc3RlbmluZyB0byBhbmQgZGVsZWdhdGluZyBldmVudHMgaW4gSW1iYS4gQSBzaW5nbGUgaW5zdGFuY2VcbmlzIGFsd2F5cyBjcmVhdGVkIGJ5IEltYmEgKGFzIGBJbWJhLkV2ZW50c2ApLCB3aGljaCBoYW5kbGVzIGFuZCBkZWxlZ2F0ZXMgYWxsXG5ldmVudHMgYXQgdGhlIHZlcnkgcm9vdCBvZiB0aGUgZG9jdW1lbnQuIEltYmEgZG9lcyBub3QgY2FwdHVyZSBhbGwgZXZlbnRzXG5ieSBkZWZhdWx0LCBzbyBpZiB5b3Ugd2FudCB0byBtYWtlIHN1cmUgZXhvdGljIG9yIGN1c3RvbSBET01FdmVudHMgYXJlIGRlbGVnYXRlZFxuaW4gSW1iYSB5b3Ugd2lsbCBuZWVkIHRvIHJlZ2lzdGVyIHRoZW0gaW4gYEltYmEuRXZlbnRzLnJlZ2lzdGVyKG15Q3VzdG9tRXZlbnROYW1lKWBcblxuQGluYW1lIG1hbmFnZXJcblxuIyMjXG5jbGFzcyBJbWJhLkV2ZW50TWFuYWdlclxuXG5cdHByb3Agcm9vdFxuXHRwcm9wIGNvdW50XG5cdHByb3AgZW5hYmxlZCBkZWZhdWx0OiBubywgd2F0Y2g6IHllc1xuXHRwcm9wIGxpc3RlbmVyc1xuXHRwcm9wIGRlbGVnYXRvcnNcblx0cHJvcCBkZWxlZ2F0b3JcblxuXHRkZWYgZW5hYmxlZC1kaWQtc2V0IGJvb2xcblx0XHRib29sID8gb25lbmFibGUgOiBvbmRpc2FibGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYuYWN0aXZhdGVcblx0XHRyZXR1cm4gSW1iYS5FdmVudHMgaWYgSW1iYS5FdmVudHNcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHRJbWJhLlBPSU5URVIgfHw9IEltYmEuUG9pbnRlci5uZXdcblxuXHRcdFx0SW1iYS5FdmVudHMgPSBJbWJhLkV2ZW50TWFuYWdlci5uZXcoSW1iYS5kb2N1bWVudCwgZXZlbnRzOiBbXG5cdFx0XHRcdDprZXlkb3duLCA6a2V5dXAsIDprZXlwcmVzcyxcblx0XHRcdFx0OnRleHRJbnB1dCwgOmlucHV0LCA6Y2hhbmdlLCA6c3VibWl0LFxuXHRcdFx0XHQ6Zm9jdXNpbiwgOmZvY3Vzb3V0LCA6Zm9jdXMsIDpibHVyLFxuXHRcdFx0XHQ6Y29udGV4dG1lbnUsIDpkYmxjbGljayxcblx0XHRcdFx0Om1vdXNld2hlZWwsIDp3aGVlbCwgOnNjcm9sbCxcblx0XHRcdFx0OmJlZm9yZWNvcHksIDpjb3B5LFxuXHRcdFx0XHQ6YmVmb3JlcGFzdGUsIDpwYXN0ZSxcblx0XHRcdFx0OmJlZm9yZWN1dCwgOmN1dFxuXHRcdFx0XSlcblxuXHRcdFx0IyBzaG91bGQgbGlzdGVuIHRvIGRyYWdkcm9wIGV2ZW50cyBieSBkZWZhdWx0XG5cdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihbXG5cdFx0XHRcdDpkcmFnc3RhcnQsOmRyYWcsOmRyYWdlbmQsXG5cdFx0XHRcdDpkcmFnZW50ZXIsOmRyYWdvdmVyLDpkcmFnbGVhdmUsOmRyYWdleGl0LDpkcm9wXG5cdFx0XHRdKVxuXG5cdFx0XHR2YXIgaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cgJiYgd2luZG93Om9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkXG5cblx0XHRcdGlmIGhhc1RvdWNoRXZlbnRzXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hzdGFydCkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNoc3RhcnQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNobW92ZSkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNobW92ZShlKVxuXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hlbmQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaGVuZChlKVxuXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hjYW5jZWwpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaGNhbmNlbChlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3Rlcig6Y2xpY2spIGRvIHxlfFxuXHRcdFx0XHQjIE9ubHkgZm9yIG1haW4gbW91c2VidXR0b24sIG5vP1xuXHRcdFx0XHRpZiAoZTp0aW1lU3RhbXAgLSBJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXApID4gSW1iYS5Ub3VjaC5UYXBUaW1lb3V0XG5cdFx0XHRcdFx0ZS5AaW1iYVNpbXVsYXRlZFRhcCA9IHllc1xuXHRcdFx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdFx0XHR0YXAucHJvY2Vzc1xuXHRcdFx0XHRcdGlmIHRhcC5AcmVzcG9uZGVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0XHQjIGRlbGVnYXRlIHRoZSByZWFsIGNsaWNrIGV2ZW50XG5cdFx0XHRcdEltYmEuRXZlbnRzLmRlbGVnYXRlKGUpXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2Vkb3duKSBkbyB8ZXxcblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuXHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDptb3VzZXVwKSBkbyB8ZXxcblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoWzptb3VzZWRvd24sOm1vdXNldXBdKVxuXHRcdFx0SW1iYS5FdmVudHMuZW5hYmxlZCA9IHllc1xuXHRcdFx0cmV0dXJuIEltYmEuRXZlbnRzXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBldmVudHM6IFtdXG5cdFx0QHNoaW1Gb2N1c0V2ZW50cyA9ICR3ZWIkICYmIHdpbmRvdzpuZXRzY2FwZSAmJiBub2RlOm9uZm9jdXNpbiA9PT0gdW5kZWZpbmVkXG5cdFx0cm9vdCA9IG5vZGVcblx0XHRsaXN0ZW5lcnMgPSBbXVxuXHRcdGRlbGVnYXRvcnMgPSB7fVxuXHRcdGRlbGVnYXRvciA9IGRvIHxlfCBcblx0XHRcdGRlbGVnYXRlKGUpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0Zm9yIGV2ZW50IGluIGV2ZW50c1xuXHRcdFx0cmVnaXN0ZXIoZXZlbnQpXG5cblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXG5cdFRlbGwgdGhlIGN1cnJlbnQgRXZlbnRNYW5hZ2VyIHRvIGludGVyY2VwdCBhbmQgaGFuZGxlIGV2ZW50IG9mIGEgY2VydGFpbiBuYW1lLlxuXHRCeSBkZWZhdWx0LCBJbWJhLkV2ZW50cyB3aWxsIHJlZ2lzdGVyIGludGVyY2VwdG9ycyBmb3I6ICprZXlkb3duKiwgKmtleXVwKiwgXG5cdCprZXlwcmVzcyosICp0ZXh0SW5wdXQqLCAqaW5wdXQqLCAqY2hhbmdlKiwgKnN1Ym1pdCosICpmb2N1c2luKiwgKmZvY3Vzb3V0KiwgXG5cdCpibHVyKiwgKmNvbnRleHRtZW51KiwgKmRibGNsaWNrKiwgKm1vdXNld2hlZWwqLCAqd2hlZWwqXG5cblx0IyMjXG5cdGRlZiByZWdpc3RlciBuYW1lLCBoYW5kbGVyID0gdHJ1ZVxuXHRcdGlmIG5hbWUgaXNhIEFycmF5XG5cdFx0XHRyZWdpc3Rlcih2LGhhbmRsZXIpIGZvciB2IGluIG5hbWVcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRyZXR1cm4gc2VsZiBpZiBkZWxlZ2F0b3JzW25hbWVdXG5cdFx0IyBjb25zb2xlLmxvZyhcInJlZ2lzdGVyIGZvciBldmVudCB7bmFtZX1cIilcblx0XHR2YXIgZm4gPSBkZWxlZ2F0b3JzW25hbWVdID0gaGFuZGxlciBpc2EgRnVuY3Rpb24gPyBoYW5kbGVyIDogZGVsZWdhdG9yXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsZm4seWVzKSBpZiBlbmFibGVkXG5cblx0ZGVmIGxpc3RlbiBuYW1lLCBoYW5kbGVyLCBjYXB0dXJlID0geWVzXG5cdFx0bGlzdGVuZXJzLnB1c2goW25hbWUsaGFuZGxlcixjYXB0dXJlXSlcblx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLGNhcHR1cmUpIGlmIGVuYWJsZWRcblx0XHRzZWxmXG5cblx0ZGVmIGRlbGVnYXRlIGVcblx0XHR2YXIgZXZlbnQgPSBJbWJhLkV2ZW50LndyYXAoZSlcblx0XHRldmVudC5wcm9jZXNzXG5cdFx0aWYgQHNoaW1Gb2N1c0V2ZW50c1xuXHRcdFx0aWYgZTp0eXBlID09ICdmb2N1cydcblx0XHRcdFx0SW1iYS5FdmVudC53cmFwKGUpLnNldFR5cGUoJ2ZvY3VzaW4nKS5wcm9jZXNzXG5cdFx0XHRlbGlmIGU6dHlwZSA9PSAnYmx1cidcblx0XHRcdFx0SW1iYS5FdmVudC53cmFwKGUpLnNldFR5cGUoJ2ZvY3Vzb3V0JykucHJvY2Vzc1xuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDcmVhdGUgYSBuZXcgSW1iYS5FdmVudFxuXG5cdCMjI1xuXHRkZWYgY3JlYXRlIHR5cGUsIHRhcmdldCwgZGF0YTogbnVsbCwgc291cmNlOiBudWxsXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwIHR5cGU6IHR5cGUsIHRhcmdldDogdGFyZ2V0XG5cdFx0ZXZlbnQuZGF0YSA9IGRhdGEgaWYgZGF0YVxuXHRcdGV2ZW50LnNvdXJjZSA9IHNvdXJjZSBpZiBzb3VyY2Vcblx0XHRldmVudFxuXG5cdCMjI1xuXG5cdFRyaWdnZXIgLyBwcm9jZXNzIGFuIEltYmEuRXZlbnQuXG5cblx0IyMjXG5cdGRlZiB0cmlnZ2VyXG5cdFx0Y3JlYXRlKCphcmd1bWVudHMpLnByb2Nlc3NcblxuXHRkZWYgb25lbmFibGVcblx0XHRmb3Igb3duIG5hbWUsaGFuZGxlciBvZiBkZWxlZ2F0b3JzXG5cdFx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLHllcylcblxuXHRcdGZvciBpdGVtIGluIGxpc3RlbmVyc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKGl0ZW1bMF0saXRlbVsxXSxpdGVtWzJdKVxuXHRcdFx0XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLEltYmE6Y29tbWl0KVxuXHRcdHNlbGZcblxuXHRkZWYgb25kaXNhYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LW1hbmFnZXIuaW1iYSIsImV4dGVybiBuYXZpZ2F0b3JcblxudmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5kZWYgcmVtb3ZlTmVzdGVkIHJvb3QsIG5vZGUsIGNhcmV0XG5cdCMgaWYgbm9kZS9ub2RlcyBpc2EgU3RyaW5nXG5cdCMgXHR3ZSBuZWVkIHRvIHVzZSB0aGUgY2FyZXQgdG8gcmVtb3ZlIGVsZW1lbnRzXG5cdCMgXHRmb3Igbm93IHdlIHdpbGwgc2ltcGx5IG5vdCBzdXBwb3J0IHRoaXNcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxtZW1iZXIsY2FyZXQpIGZvciBtZW1iZXIgaW4gbm9kZVxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGxcblx0XHQjIHdoYXQgaWYgdGhpcyBpcyBub3QgbnVsbD8hPyE/XG5cdFx0IyB0YWtlIGEgY2hhbmNlIGFuZCByZW1vdmUgYSB0ZXh0LWVsZW1lbnRuZ1xuXHRcdGxldCBuZXh0ID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0aWYgbmV4dCBpc2EgVGV4dCBhbmQgbmV4dDp0ZXh0Q29udGVudCA9PSBub2RlXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5leHQpXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgJ2Nhbm5vdCByZW1vdmUgc3RyaW5nJ1xuXG5cdHJldHVybiBjYXJldFxuXG5kZWYgYXBwZW5kTmVzdGVkIHJvb3QsIG5vZGVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZVtpKytdKSB3aGlsZSBpIDwga1xuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlICE9IG51bGwgYW5kIG5vZGUgIT09IGZhbHNlXG5cdFx0cm9vdC5hcHBlbmRDaGlsZCBJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0cmV0dXJuXG5cblxuIyBpbnNlcnQgbm9kZXMgYmVmb3JlIGEgY2VydGFpbiBub2RlXG4jIGRvZXMgbm90IG5lZWQgdG8gcmV0dXJuIGFueSB0YWlsLCBhcyBiZWZvcmVcbiMgd2lsbCBzdGlsbCBiZSBjb3JyZWN0IHRoZXJlXG4jIGJlZm9yZSBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQmVmb3JlIHJvb3QsIG5vZGUsIGJlZm9yZVxuXHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdGxldCBpID0gMFxuXHRcdGxldCBjID0gbm9kZTp0YWdsZW5cblx0XHRsZXQgayA9IGMgIT0gbnVsbCA/IChub2RlOmRvbWxlbiA9IGMpIDogbm9kZTpsZW5ndGhcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlW2krK10sYmVmb3JlKSB3aGlsZSBpIDwga1xuXG5cdGVsaWYgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0cm9vdC5pbnNlcnRCZWZvcmUobm9kZSxiZWZvcmUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSksYmVmb3JlKVxuXG5cdHJldHVybiBiZWZvcmVcblxuIyBhZnRlciBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQWZ0ZXIgcm9vdCwgbm9kZSwgYWZ0ZXJcblx0dmFyIGJlZm9yZSA9IGFmdGVyID8gYWZ0ZXI6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGlmIGJlZm9yZVxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG5vZGUsYmVmb3JlKVxuXHRcdHJldHVybiBiZWZvcmU6cHJldmlvdXNTaWJsaW5nXG5cdGVsc2Vcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxub2RlKVxuXHRcdHJldHVybiByb290LkBkb206bGFzdENoaWxkXG5cbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHR2YXIgbmV3TGVuID0gbmV3Omxlbmd0aFxuXHR2YXIgbGFzdE5ldyA9IG5ld1tuZXdMZW4gLSAxXVxuXG5cdCMgVGhpcyByZS1vcmRlciBhbGdvcml0aG0gaXMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBwcmluY2lwbGU6XG5cdCMgXG5cdCMgV2UgYnVpbGQgYSBcImNoYWluXCIgd2hpY2ggc2hvd3Mgd2hpY2ggaXRlbXMgYXJlIGFscmVhZHkgc29ydGVkLlxuXHQjIElmIHdlJ3JlIGdvaW5nIGZyb20gWzEsIDIsIDNdIC0+IFsyLCAxLCAzXSwgdGhlIHRyZWUgbG9va3MgbGlrZTpcblx0I1xuXHQjIFx0MyAtPiAgMCAoaWR4KVxuXHQjIFx0MiAtPiAtMSAoaWR4KVxuXHQjIFx0MSAtPiAtMSAoaWR4KVxuXHQjXG5cdCMgVGhpcyB0ZWxscyB1cyB0aGF0IHdlIGhhdmUgdHdvIGNoYWlucyBvZiBvcmRlcmVkIGl0ZW1zOlxuXHQjIFxuXHQjIFx0KDEsIDMpIGFuZCAoMilcblx0IyBcblx0IyBUaGUgb3B0aW1hbCByZS1vcmRlcmluZyB0aGVuIGJlY29tZXMgdG8ga2VlcCB0aGUgbG9uZ2VzdCBjaGFpbiBpbnRhY3QsXG5cdCMgYW5kIG1vdmUgYWxsIHRoZSBvdGhlciBpdGVtcy5cblxuXHR2YXIgbmV3UG9zaXRpb24gPSBbXVxuXG5cdCMgVGhlIHRyZWUvZ3JhcGggaXRzZWxmXG5cdHZhciBwcmV2Q2hhaW4gPSBbXVxuXHQjIFRoZSBsZW5ndGggb2YgdGhlIGNoYWluXG5cdHZhciBsZW5ndGhDaGFpbiA9IFtdXG5cblx0IyBLZWVwIHRyYWNrIG9mIHRoZSBsb25nZXN0IGNoYWluXG5cdHZhciBtYXhDaGFpbkxlbmd0aCA9IDBcblx0dmFyIG1heENoYWluRW5kID0gMFxuXG5cdHZhciBoYXNUZXh0Tm9kZXMgPSBub1xuXHR2YXIgbmV3UG9zXG5cblx0Zm9yIG5vZGUsIGlkeCBpbiBvbGRcblx0XHQjIHNwZWNpYWwgY2FzZSBmb3IgVGV4dCBub2Rlc1xuXHRcdGlmIG5vZGUgYW5kIG5vZGU6bm9kZVR5cGUgPT0gM1xuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZTp0ZXh0Q29udGVudClcblx0XHRcdG5ld1tuZXdQb3NdID0gbm9kZSBpZiBuZXdQb3MgPj0gMFxuXHRcdFx0aGFzVGV4dE5vZGVzID0geWVzXG5cdFx0ZWxzZVxuXHRcdFx0bmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZSlcblxuXHRcdG5ld1Bvc2l0aW9uLnB1c2gobmV3UG9zKVxuXG5cdFx0aWYgbmV3UG9zID09IC0xXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdFx0XHRwcmV2Q2hhaW4ucHVzaCgtMSlcblx0XHRcdGxlbmd0aENoYWluLnB1c2goLTEpXG5cdFx0XHRjb250aW51ZVxuXG5cdFx0dmFyIHByZXZJZHggPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAyXG5cblx0XHQjIEJ1aWxkIHRoZSBjaGFpbjpcblx0XHR3aGlsZSBwcmV2SWR4ID49IDBcblx0XHRcdGlmIG5ld1Bvc2l0aW9uW3ByZXZJZHhdID09IC0xXG5cdFx0XHRcdHByZXZJZHgtLVxuXHRcdFx0ZWxpZiBuZXdQb3MgPiBuZXdQb3NpdGlvbltwcmV2SWR4XVxuXHRcdFx0XHQjIFlheSwgd2UncmUgYmlnZ2VyIHRoYW4gdGhlIHByZXZpb3VzIVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIE5vcGUsIGxldCdzIHdhbGsgYmFjayB0aGUgY2hhaW5cblx0XHRcdFx0cHJldklkeCA9IHByZXZDaGFpbltwcmV2SWR4XVxuXG5cdFx0cHJldkNoYWluLnB1c2gocHJldklkeClcblxuXHRcdHZhciBjdXJyTGVuZ3RoID0gKHByZXZJZHggPT0gLTEpID8gMCA6IGxlbmd0aENoYWluW3ByZXZJZHhdKzFcblxuXHRcdGlmIGN1cnJMZW5ndGggPiBtYXhDaGFpbkxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5MZW5ndGggPSBjdXJyTGVuZ3RoXG5cdFx0XHRtYXhDaGFpbkVuZCA9IGlkeFxuXG5cdFx0bGVuZ3RoQ2hhaW4ucHVzaChjdXJyTGVuZ3RoKVxuXG5cdHZhciBzdGlja3lOb2RlcyA9IFtdXG5cblx0IyBOb3cgd2UgY2FuIHdhbGsgdGhlIGxvbmdlc3QgY2hhaW4gYmFja3dhcmRzIGFuZCBtYXJrIHRoZW0gYXMgXCJzdGlja3lcIixcblx0IyB3aGljaCBpbXBsaWVzIHRoYXQgdGhleSBzaG91bGQgbm90IGJlIG1vdmVkXG5cdHZhciBjdXJzb3IgPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAxXG5cdHdoaWxlIGN1cnNvciA+PSAwXG5cdFx0aWYgY3Vyc29yID09IG1heENoYWluRW5kIGFuZCBuZXdQb3NpdGlvbltjdXJzb3JdICE9IC0xXG5cdFx0XHRzdGlja3lOb2Rlc1tuZXdQb3NpdGlvbltjdXJzb3JdXSA9IHRydWVcblx0XHRcdG1heENoYWluRW5kID0gcHJldkNoYWluW21heENoYWluRW5kXVxuXG5cdFx0Y3Vyc29yIC09IDFcblxuXHQjIHBvc3NpYmxlIHRvIGRvIHRoaXMgaW4gcmV2ZXJzZWQgb3JkZXIgaW5zdGVhZD9cblx0Zm9yIG5vZGUsIGlkeCBpbiBuZXdcblx0XHRpZiAhc3RpY2t5Tm9kZXNbaWR4XVxuXHRcdFx0IyBjcmVhdGUgdGV4dG5vZGUgZm9yIHN0cmluZywgYW5kIHVwZGF0ZSB0aGUgYXJyYXlcblx0XHRcdHVubGVzcyBub2RlIGFuZCBub2RlLkBkb21cblx0XHRcdFx0bm9kZSA9IG5ld1tpZHhdID0gSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0XHR2YXIgYWZ0ZXIgPSBuZXdbaWR4IC0gMV1cblx0XHRcdGluc2VydE5lc3RlZEFmdGVyKHJvb3QsIG5vZGUsIChhZnRlciBhbmQgYWZ0ZXIuQGRvbSBvciBhZnRlciBvciBjYXJldCkpXG5cblx0XHRjYXJldCA9IG5vZGUuQGRvbSBvciAoY2FyZXQgYW5kIGNhcmV0Om5leHRTaWJsaW5nIG9yIHJvb3QuQGRvbTpmaXJzdENoaWxkKVxuXG5cdCMgc2hvdWxkIHRydXN0IHRoYXQgdGhlIGxhc3QgaXRlbSBpbiBuZXcgbGlzdCBpcyB0aGUgY2FyZXRcblx0cmV0dXJuIGxhc3ROZXcgYW5kIGxhc3ROZXcuQGRvbSBvciBjYXJldFxuXG5cbiMgZXhwZWN0cyBhIGZsYXQgbm9uLXNwYXJzZSBhcnJheSBvZiBub2RlcyBpbiBib3RoIG5ldyBhbmQgb2xkLCBhbHdheXNcbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXHR2YXIgayA9IG5ldzpsZW5ndGhcblx0dmFyIGkgPSBrXG5cdHZhciBsYXN0ID0gbmV3W2sgLSAxXVxuXG5cblx0aWYgayA9PSBvbGQ6bGVuZ3RoIGFuZCBuZXdbMF0gPT09IG9sZFswXVxuXHRcdCMgcnVubmluZyB0aHJvdWdoIHRvIGNvbXBhcmVcblx0XHR3aGlsZSBpLS1cblx0XHRcdGJyZWFrIGlmIG5ld1tpXSAhPT0gb2xkW2ldXG5cblx0aWYgaSA9PSAtMVxuXHRcdHJldHVybiBsYXN0IGFuZCBsYXN0LkBkb20gb3IgbGFzdCBvciBjYXJldFxuXHRlbHNlXG5cdFx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBUWVBFIDUgLSB3ZSBrbm93IHRoYXQgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbmdsZSBhcnJheSBvZlxuIyBrZXllZCB0YWdzIC0gYW5kIHJvb3QgaGFzIG5vIG90aGVyIGNoaWxkcmVuXG5kZWYgcmVjb25jaWxlTG9vcCByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIG5sID0gbmV3Omxlbmd0aFxuXHR2YXIgb2wgPSBvbGQ6bGVuZ3RoXG5cdHZhciBjbCA9IG5ldzpjYWNoZTppJCAjIGNhY2hlLWxlbmd0aFxuXHR2YXIgaSA9IDAsIGQgPSBubCAtIG9sXG5cblx0IyBmaW5kIHRoZSBmaXJzdCBpbmRleCB0aGF0IGlzIGRpZmZlcmVudFxuXHRpKysgd2hpbGUgaSA8IG9sIGFuZCBpIDwgbmwgYW5kIG5ld1tpXSA9PT0gb2xkW2ldXG5cdFxuXHQjIGNvbmRpdGlvbmFsbHkgcHJ1bmUgY2FjaGVcblx0aWYgY2wgPiAxMDAwIGFuZCAoY2wgLSBubCkgPiA1MDBcblx0XHRuZXc6Y2FjaGU6JHBydW5lKG5ldylcblx0XG5cdGlmIGQgPiAwIGFuZCBpID09IG9sXG5cdFx0IyBhZGRlZCBhdCBlbmRcblx0XHRyb290LmFwcGVuZENoaWxkKG5ld1tpKytdKSB3aGlsZSBpIDwgbmxcblx0XHRyZXR1cm5cblx0XG5cdGVsaWYgZCA+IDBcblx0XHRsZXQgaTEgPSBubFxuXHRcdGkxLS0gd2hpbGUgaTEgPiBpIGFuZCBuZXdbaTEgLSAxXSA9PT0gb2xkW2kxIC0gMSAtIGRdXG5cblx0XHRpZiBkID09IChpMSAtIGkpXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgaW4gY2h1bmtcIixpLGkxXG5cdFx0XHRsZXQgYmVmb3JlID0gb2xkW2ldLkBkb21cblx0XHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5ld1tpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRlbGlmIGQgPCAwIGFuZCBpID09IG5sXG5cdFx0IyByZW1vdmVkIGF0IGVuZFxuXHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBvbFxuXHRcdHJldHVyblxuXHRlbGlmIGQgPCAwXG5cdFx0bGV0IGkxID0gb2xcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMSArIGRdID09PSBvbGRbaTEgLSAxXVxuXG5cdFx0aWYgZCA9PSAoaSAtIGkxKVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGRbaSsrXSkgd2hpbGUgaSA8IGkxXG5cdFx0XHRyZXR1cm5cblxuXHRlbGlmIGkgPT0gbmxcblx0XHRyZXR1cm5cblxuXHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMocm9vdCxuZXcsb2xkLGNhcmV0KVxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlSW5kZXhlZEFycmF5IHJvb3QsIGFycmF5LCBvbGQsIGNhcmV0XG5cdHZhciBuZXdMZW4gPSBhcnJheTp0YWdsZW5cblx0dmFyIHByZXZMZW4gPSBhcnJheTpkb21sZW4gb3IgMFxuXHR2YXIgbGFzdCA9IG5ld0xlbiA/IGFycmF5W25ld0xlbiAtIDFdIDogbnVsbFxuXHQjIGNvbnNvbGUubG9nIFwicmVjb25jaWxlIG9wdGltaXplZCBhcnJheSghKVwiLGNhcmV0LG5ld0xlbixwcmV2TGVuLGFycmF5XG5cblx0aWYgcHJldkxlbiA+IG5ld0xlblxuXHRcdHdoaWxlIHByZXZMZW4gPiBuZXdMZW5cblx0XHRcdHZhciBpdGVtID0gYXJyYXlbLS1wcmV2TGVuXVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChpdGVtLkBkb20pXG5cblx0ZWxpZiBuZXdMZW4gPiBwcmV2TGVuXG5cdFx0IyBmaW5kIHRoZSBpdGVtIHRvIGluc2VydCBiZWZvcmVcblx0XHRsZXQgcHJldkxhc3QgPSBwcmV2TGVuID8gYXJyYXlbcHJldkxlbiAtIDFdLkBkb20gOiBjYXJldFxuXHRcdGxldCBiZWZvcmUgPSBwcmV2TGFzdCA/IHByZXZMYXN0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcblx0XHR3aGlsZSBwcmV2TGVuIDwgbmV3TGVuXG5cdFx0XHRsZXQgbm9kZSA9IGFycmF5W3ByZXZMZW4rK11cblx0XHRcdGJlZm9yZSA/IHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUuQGRvbSxiZWZvcmUpIDogcm9vdC5hcHBlbmRDaGlsZChub2RlLkBkb20pXG5cdFx0XHRcblx0YXJyYXk6ZG9tbGVuID0gbmV3TGVuXG5cdHJldHVybiBsYXN0ID8gbGFzdC5AZG9tIDogY2FyZXRcblxuXG4jIHRoZSBnZW5lcmFsIHJlY29uY2lsZXIgdGhhdCByZXNwZWN0cyBjb25kaXRpb25zIGV0Y1xuIyBjYXJldCBpcyB0aGUgY3VycmVudCBub2RlIHdlIHdhbnQgdG8gaW5zZXJ0IHRoaW5ncyBhZnRlclxuZGVmIHJlY29uY2lsZU5lc3RlZCByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHQjIHZhciBza2lwbmV3ID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZSBvciBuZXcgPT09IHRydWVcblx0dmFyIG5ld0lzTnVsbCA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Vcblx0dmFyIG9sZElzTnVsbCA9IG9sZCA9PSBudWxsIG9yIG9sZCA9PT0gZmFsc2VcblxuXG5cdGlmIG5ldyA9PT0gb2xkXG5cdFx0IyByZW1lbWJlciB0aGF0IHRoZSBjYXJldCBtdXN0IGJlIGFuIGFjdHVhbCBkb20gZWxlbWVudFxuXHRcdCMgd2Ugc2hvdWxkIGluc3RlYWQgbW92ZSB0aGUgYWN0dWFsIGNhcmV0PyAtIHRydXN0XG5cdFx0aWYgbmV3SXNOdWxsXG5cdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRlbGlmIG5ldy5AZG9tXG5cdFx0XHRyZXR1cm4gbmV3LkBkb21cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG5ldzp0YWdsZW4gIT0gbnVsbFxuXHRcdFx0cmV0dXJuIHJlY29uY2lsZUluZGV4ZWRBcnJheShyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdCMgbG9vayBmb3Igc2xvdCBpbnN0ZWFkP1xuXHRcdFx0bGV0IHR5cCA9IG5ldzpzdGF0aWNcblx0XHRcdGlmIHR5cCBvciBvbGQ6c3RhdGljXG5cdFx0XHRcdCMgaWYgdGhlIHN0YXRpYyBpcyBub3QgbmVzdGVkIC0gd2UgY291bGQgZ2V0IGEgaGludCBmcm9tIGNvbXBpbGVyXG5cdFx0XHRcdCMgYW5kIGp1c3Qgc2tpcCBpdFxuXHRcdFx0XHRpZiB0eXAgPT0gb2xkOnN0YXRpYyAjIHNob3VsZCBhbHNvIGluY2x1ZGUgYSByZWZlcmVuY2U/XG5cdFx0XHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0XHRcdCMgdGhpcyBpcyB3aGVyZSB3ZSBjb3VsZCBkbyB0aGUgdHJpcGxlIGVxdWFsIGRpcmVjdGx5XG5cdFx0XHRcdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChyb290LGl0ZW0sb2xkW2ldLGNhcmV0KVxuXHRcdFx0XHRcdHJldHVybiBjYXJldFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdFx0XHRcdFxuXHRcdFx0XHQjIGlmIHRoZXkgYXJlIG5vdCB0aGUgc2FtZSB3ZSBjb250aW51ZSB0aHJvdWdoIHRvIHRoZSBkZWZhdWx0XG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgQ291bGQgdXNlIG9wdGltaXplZCBsb29wIGlmIHdlIGtub3cgdGhhdCBpdCBvbmx5IGNvbnNpc3RzIG9mIG5vZGVzXG5cdFx0XHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uKHJvb3QsbmV3LG9sZCxjYXJldClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdGlmIG9sZC5AZG9tXG5cdFx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIG9sZCB3YXMgYSBzdHJpbmctbGlrZSBvYmplY3Q/XG5cdFx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkKVxuXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXHRcdCMgcmVtb3ZlIG9sZFxuXG5cdGVsaWYgIW5ld0lzTnVsbCBhbmQgbmV3LkBkb21cblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpIHVubGVzcyBvbGRJc051bGxcblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cblx0ZWxpZiBuZXdJc051bGxcblx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpIHVubGVzcyBvbGRJc051bGxcblx0XHRyZXR1cm4gY2FyZXRcblx0ZWxzZVxuXHRcdCMgaWYgb2xkIGRpZCBub3QgZXhpc3Qgd2UgbmVlZCB0byBhZGQgYSBuZXcgZGlyZWN0bHlcblx0XHRsZXQgbmV4dE5vZGVcblx0XHQjIGlmIG9sZCB3YXMgYXJyYXkgb3IgaW1iYXRhZyB3ZSBuZWVkIHRvIHJlbW92ZSBpdCBhbmQgdGhlbiBhZGRcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpXG5cdFx0ZWxpZiBvbGQgYW5kIG9sZC5AZG9tXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdCMgLi4uXG5cdFx0XHRuZXh0Tm9kZSA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdFx0aWYgbmV4dE5vZGUgaXNhIFRleHQgYW5kIG5leHROb2RlOnRleHRDb250ZW50ICE9IG5ld1xuXHRcdFx0XHRuZXh0Tm9kZTp0ZXh0Q29udGVudCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gbmV4dE5vZGVcblxuXHRcdCMgbm93IGFkZCB0aGUgdGV4dG5vZGVcblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdFxuXHQjIDEgLSBzdGF0aWMgc2hhcGUgLSB1bmtub3duIGNvbnRlbnRcblx0IyAyIC0gc3RhdGljIHNoYXBlIGFuZCBzdGF0aWMgY2hpbGRyZW5cblx0IyAzIC0gc2luZ2xlIGl0ZW1cblx0IyA0IC0gb3B0aW1pemVkIGFycmF5IC0gb25seSBsZW5ndGggd2lsbCBjaGFuZ2Vcblx0IyA1IC0gb3B0aW1pemVkIGNvbGxlY3Rpb25cblx0IyA2IC0gdGV4dCBvbmx5XG5cblx0ZGVmIHNldENoaWxkcmVuIG5ldywgdHlwXG5cdFx0IyBpZiB0eXBlb2YgbmV3ID09ICdzdHJpbmcnXG5cdFx0IyBcdHJldHVybiBzZWxmLnRleHQgPSBuZXdcblx0XHR2YXIgb2xkID0gQHRyZWVfXG5cblx0XHRpZiBuZXcgPT09IG9sZCBhbmQgbmV3IGFuZCBuZXc6dGFnbGVuID09IHVuZGVmaW5lZFxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmICFvbGQgYW5kIHR5cCAhPSAzXG5cdFx0XHRyZW1vdmVBbGxDaGlsZHJlblxuXHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXG5cdFx0ZWxpZiB0eXAgPT0gMVxuXHRcdFx0bGV0IGNhcmV0ID0gbnVsbFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQoc2VsZixpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcblx0XHRlbGlmIHR5cCA9PSAyXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0ZWxpZiB0eXAgPT0gM1xuXHRcdFx0bGV0IG50eXAgPSB0eXBlb2YgbmV3XG5cblx0XHRcdGlmIG5ldyBhbmQgbmV3LkBkb21cblx0XHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdFx0YXBwZW5kQ2hpbGQobmV3KVxuXG5cdFx0XHQjIGNoZWNrIGlmIG9sZCBhbmQgbmV3IGlzYSBhcnJheVxuXHRcdFx0ZWxpZiBuZXcgaXNhIEFycmF5XG5cdFx0XHRcdGlmIG5ldy5AdHlwZSA9PSA1IGFuZCBvbGQgYW5kIG9sZC5AdHlwZSA9PSA1XG5cdFx0XHRcdFx0cmVjb25jaWxlTG9vcChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRcdFx0cmVjb25jaWxlTmVzdGVkKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRleHQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIHNlbGZcblx0XHRcdFx0XG5cdFx0ZWxpZiB0eXAgPT0gNFxuXHRcdFx0cmVjb25jaWxlSW5kZXhlZEFycmF5KHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XG5cdFx0ZWxpZiB0eXAgPT0gNVxuXHRcdFx0cmVjb25jaWxlTG9vcChzZWxmLG5ldyxvbGQsbnVsbClcblxuXHRcdGVsaWYgbmV3IGlzYSBBcnJheSBhbmQgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVjb25jaWxlTmVzdGVkKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdGVsc2Vcblx0XHRcdCMgd2hhdCBpZiB0ZXh0P1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdEB0cmVlXyA9IG5ld1xuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGNvbnRlbnRcblx0XHRAY29udGVudCBvciBjaGlsZHJlbi50b0FycmF5XG5cdFxuXHRkZWYgc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdHJlZV9cblx0XHRcdHZhciB2YWwgPSB0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0XG5cdFx0XHQoQHRleHRfIG9yIEBkb20pOnRleHRDb250ZW50ID0gdmFsXG5cdFx0XHRAdGV4dF8gfHw9IEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHNlbGZcblxuIyBhbGlhcyBzZXRDb250ZW50IHRvIHNldENoaWxkcmVuXG52YXIgcHJvdG8gPSBJbWJhLlRhZzpwcm90b3R5cGVcbnByb3RvOnNldENvbnRlbnQgPSBwcm90bzpzZXRDaGlsZHJlblxuXG4jIG9wdGltaXphdGlvbiBmb3Igc2V0VGV4dFxudmFyIGFwcGxlID0gdHlwZW9mIG5hdmlnYXRvciAhPSAndW5kZWZpbmVkJyBhbmQgKG5hdmlnYXRvcjp2ZW5kb3Igb3IgJycpLmluZGV4T2YoJ0FwcGxlJykgPT0gMFxuaWYgYXBwbGVcblx0ZGVmIHByb3RvLnNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHRAZG9tOnRleHRDb250ZW50ID0gKHRleHQgPT09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UgPyAnJyA6IHRleHQpXG5cdFx0XHRAdHJlZV8gPSB0ZXh0XG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9yZWNvbmNpbGVyLmltYmEiLCJpbXBvcnQgUm91dGVyIGZyb20gJy4vdXRpbC9yb3V0ZXInXG5cbmV4cG9ydCBjbGFzcyBEb2NcblxuXHRwcm9wIHBhdGhcblx0cHJvcCBzcmNcblx0cHJvcCBkYXRhXG5cblx0ZGVmIHJlYWR5XG5cdFx0QHJlYWR5XG5cblx0ZGVmIGluaXRpYWxpemUgc3JjLCBhcHBcblx0XHRAc3JjID0gc3JjXG5cdFx0QHBhdGggPSBzcmMucmVwbGFjZSgvXFwubWQkLywnJylcblx0XHRAYXBwID0gYXBwXG5cdFx0QHJlYWR5ID0gbm9cblx0XHRmZXRjaFxuXHRcdHNlbGZcblxuXHRkZWYgZmV0Y2hcblx0XHRAcHJvbWlzZSB8fD0gQGFwcC5mZXRjaChzcmMpLnRoZW4gZG8gfHJlc3xcblx0XHRcdGxvYWQocmVzKVxuXG5cdGRlZiBsb2FkIGRvY1xuXHRcdEBkYXRhID0gZG9jXG5cdFx0QG1ldGEgPSBkb2M6bWV0YSBvciB7fVxuXHRcdEByZWFkeSA9IHllc1xuXHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiB0aXRsZVxuXHRcdEBkYXRhOnRpdGxlIG9yICdwYXRoJ1xuXG5cdGRlZiB0b2Ncblx0XHRAZGF0YSBhbmQgQGRhdGE6dG9jWzBdXG5cblx0ZGVmIGJvZHlcblx0XHRAZGF0YSBhbmQgQGRhdGE6Ym9keVxuXG5cbmV4cG9ydCB2YXIgQ2FjaGUgPSB7fVxudmFyIHJlcXVlc3RzID0ge31cblxuZXhwb3J0IGNsYXNzIEFwcFxuXHRwcm9wIHJlcVxuXHRwcm9wIGNhY2hlXG5cdHByb3AgaXNzdWVzXG5cdFxuXHRkZWYgc2VsZi5kZXNlcmlhbGl6ZSBkYXRhID0gJ3t9J1xuXHRcdHNlbGYubmV3IEpTT04ucGFyc2UoZGF0YS5yZXBsYWNlKC/Cp8KnU0NSSVBUwqfCpy9nLFwic2NyaXB0XCIpKVxuXG5cdGRlZiBpbml0aWFsaXplIGNhY2hlID0ge31cblx0XHRAY2FjaGUgPSBjYWNoZVxuXHRcdEBkb2NzID0ge31cblx0XHRpZiAkd2ViJFxuXHRcdFx0QGxvYyA9IGRvY3VtZW50OmxvY2F0aW9uXG5cdFx0XHRcblx0XHRpZiBAY2FjaGU6Z3VpZGVcblx0XHRcdEBndWlkZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoQGNhY2hlOmd1aWRlKSlcblx0XHRcdCMgZm9yIGl0ZW0saSBpbiBAZ3VpZGVcblx0XHRcdCMgXHRAZ3VpZGVbaXRlbTppZF0gPSBpdGVtXG5cdFx0XHQjIFx0aXRlbTpuZXh0ID0gQGd1aWRlW2kgKyAxXVxuXHRcdFx0IyBcdGl0ZW06cHJldiA9IEBndWlkZVtpIC0gMV1cblx0XHRzZWxmXG5cblx0ZGVmIHJlc2V0XG5cdFx0Y2FjaGUgPSB7fVxuXHRcdHNlbGZcblxuXHRkZWYgcm91dGVyXG5cdFx0QHJvdXRlciB8fD0gUm91dGVyLm5ldyhzZWxmKVxuXG5cdGRlZiBwYXRoXG5cdFx0JHdlYiQgPyBAbG9jOnBhdGhuYW1lIDogcmVxOnBhdGhcblxuXHRkZWYgaGFzaFxuXHRcdCR3ZWIkID8gQGxvYzpoYXNoLnN1YnN0cigxKSA6ICcnXG5cblx0ZGVmIGRvYyBzcmNcblx0XHRAZG9jc1tzcmNdIHx8PSBEb2MubmV3KHNyYyxzZWxmKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRAZ3VpZGUgfHw9IEBjYWNoZTpndWlkZSAjIC5tYXAgZG8gfHxcblx0XHRcblx0ZGVmIHNlcmlhbGl6ZVxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShjYWNoZSkucmVwbGFjZSgvXFxic2NyaXB0L2csXCLCp8KnU0NSSVBUwqfCp1wiKVxuXG5cdGlmICRub2RlJFxuXHRcdGRlZiBmZXRjaCBzcmNcblx0XHRcdGxldCByZXMgPSBjYWNoZVtzcmNdID0gQ2FjaGVbc3JjXVxuXHRcdFx0bGV0IHByb21pc2UgPSB7dGhlbjogKHxjYnwgY2IoQ2FjaGVbc3JjXSkpIH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHByb21pc2UgaWYgcmVzXG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nIFwidHJ5IHRvIGZldGNoIHtzcmN9XCJcblx0XHRcdFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdGlmIHNyYy5tYXRjaCgvXFwubWQkLylcblx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdCMgc2hvdWxkIGFsc28gaW5jbHVkZSBtZD9cblx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRsZXQgaHRtbCA9IGhsLkhpZ2hsaWdodGVyLmhpZ2hsaWdodChib2R5LHttb2RlOiAnZnVsbCd9KVxuXHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblxuXHRcdFx0Y2FjaGVbc3JjXSA9IENhY2hlW3NyY10gPSByZXNcblx0XHRcdHJldHVybiBwcm9taXNlXG5cdFxuXHRpZiAkd2ViJFxuXHRcdGRlZiBmZXRjaCBzcmNcblx0XHRcdGlmIGNhY2hlW3NyY11cblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZVtzcmNdKVxuXHRcdFx0XG5cdFx0XHRyZXF1ZXN0c1tzcmNdIHx8PSBQcm9taXNlLm5ldyBkbyB8cmVzb2x2ZXxcblx0XHRcdFx0dmFyIHJlcSA9IGF3YWl0IHdpbmRvdy5mZXRjaChzcmMpXG5cdFx0XHRcdHZhciByZXNwID0gYXdhaXQgcmVxLmpzb25cblx0XHRcdFx0cmVzb2x2ZShjYWNoZVtzcmNdID0gcmVzcClcblx0XHRcdFxuXHRkZWYgZmV0Y2hEb2N1bWVudCBzcmMsICZjYlxuXHRcdHZhciByZXMgPSBkZXBzW3NyY11cblx0XHRjb25zb2xlLmxvZyBcIm5vIGxvbmdlcj9cIlxuXG5cdFx0aWYgJG5vZGUkXG5cdFx0XHR2YXIgZnMgPSByZXF1aXJlICdmcydcblx0XHRcdHZhciBwYXRoID0gcmVxdWlyZSAncGF0aCdcblx0XHRcdHZhciBtZCA9IHJlcXVpcmUgJy4vdXRpbC9tYXJrZG93bidcblx0XHRcdHZhciBobCA9IHJlcXVpcmUgJy4vc2NyaW1ibGEvY29yZS9oaWdobGlnaHRlcidcblx0XHRcdHZhciBmaWxlcGF0aCA9IFwie19fZGlybmFtZX0vLi4vZG9jcy97c3JjfVwiLnJlcGxhY2UoL1xcL1xcLy9nLCcvJylcblxuXHRcdFx0aWYgIXJlc1xuXHRcdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRcdGlmIHNyYy5tYXRjaCgvXFwubWQkLylcblx0XHRcdFx0XHRyZXMgPSBtZC5yZW5kZXIoYm9keSlcblxuXHRcdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHRcdCMgc2hvdWxkIGFsc28gaW5jbHVkZSBtZD9cblx0XHRcdFx0XHRyZXMgPSBKU09OLnBhcnNlKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0XHRsZXQgaHRtbCA9IGhsLkhpZ2hsaWdodGVyLmhpZ2hsaWdodChib2R5LHttb2RlOiAnZnVsbCd9KVxuXHRcdFx0XHRcdHJlcyA9IHtib2R5OiBib2R5LCBodG1sOiBodG1sfVxuXHRcdFx0XG5cdFx0XHRkZXBzW3NyY10gfHw9IHJlc1xuXHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRlbHNlXG5cdFx0XHQjIHNob3VsZCBndWFyZCBhZ2FpbnN0IG11bHRpcGxlIGxvYWRzXG5cdFx0XHRpZiByZXNcblx0XHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRcdFx0cmV0dXJuIHt0aGVuOiAoZG8gfHZ8IHYocmVzKSl9ICMgZmFrZSBwcm9taXNlIGhhY2tcblxuXHRcdFx0dmFyIHhociA9IFhNTEh0dHBSZXF1ZXN0Lm5ld1xuXHRcdFx0eGhyLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnIGRvIHxyZXN8XG5cdFx0XHRcdHJlcyA9IGRlcHNbc3JjXSA9IEpTT04ucGFyc2UoeGhyOnJlc3BvbnNlVGV4dClcblx0XHRcdFx0Y2IgYW5kIGNiKHJlcylcblx0XHRcdHhoci5vcGVuKFwiR0VUXCIsIHNyYylcblx0XHRcdHhoci5zZW5kXG5cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBpc3N1ZXNcblx0XHRAaXNzdWVzIHx8PSBEb2MuZ2V0KCcvaXNzdWVzL2FsbCcsJ2pzb24nKVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwLmltYmEiLCJleHRlcm4gaGlzdG9yeSwgZ2FcblxuZXhwb3J0IGNsYXNzIFJvdXRlclxuXG5cdHByb3AgcGF0aFxuXG5cdGRlZiBzZWxmLnNsdWcgc3RyXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKS50b0xvd2VyQ2FzZSAjIHRyaW1cblxuXHRcdHZhciBmcm9tID0gXCLDoMOhw6TDosOlw6jDqcOrw6rDrMOtw6/DrsOyw7PDtsO0w7nDusO8w7vDscOnwrcvXyw6O1wiXG5cdFx0dmFyIHRvICAgPSBcImFhYWFhZWVlZWlpaWlvb29vdXV1dW5jLS0tLS0tXCJcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvW15hLXowLTkgLV0vZywgJycpICMgcmVtb3ZlIGludmFsaWQgY2hhcnNcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxzKy9nLCAnLScpICMgY29sbGFwc2Ugd2hpdGVzcGFjZSBhbmQgcmVwbGFjZSBieSAtXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoLy0rL2csICctJykgIyBjb2xsYXBzZSBkYXNoZXNcblxuXHRcdHJldHVybiBzdHJcblxuXHRkZWYgaW5pdGlhbGl6ZSBhcHBcblx0XHRAYXBwID0gYXBwXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0d2luZG93Om9ucG9wc3RhdGUgPSBkbyB8ZXxcblx0XHRcdFx0cmVmcmVzaFxuXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZyZXNoXG5cdFx0aWYgJHdlYiRcblx0XHRcdGRvY3VtZW50OmJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLXJvdXRlJyxzZWdtZW50KDApKVxuXHRcdFx0SW1iYS5jb21taXRcblx0XHRzZWxmXG5cblx0ZGVmIHBhdGhcblx0XHRAYXBwLnBhdGhcblxuXHRkZWYgaGFzaFxuXHRcdEBhcHAuaGFzaFxuXG5cdGRlZiBleHRcblx0XHR2YXIgcGF0aCA9IHBhdGhcblx0XHR2YXIgbSA9IHBhdGgubWF0Y2goL1xcLihbXlxcL10rKSQvKVxuXHRcdG0gYW5kIG1bMV0gb3IgJydcblxuXHRkZWYgc2VnbWVudCBuciA9IDBcblx0XHRwYXRoLnNwbGl0KCcvJylbbnIgKyAxXSBvciAnJ1xuXG5cdGRlZiBnbyBocmVmLCBzdGF0ZSA9IHt9LCByZXBsYWNlID0gbm9cblx0XHRpZiBocmVmID09ICcvaW5zdGFsbCdcblx0XHRcdCMgcmVkaXJlY3RzIGhlcmVcblx0XHRcdGhyZWYgPSAnL2d1aWRlcyN0b2MtaW5zdGFsbGF0aW9uJ1xuXHRcdFx0XG5cdFx0aWYgcmVwbGFjZVxuXHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsbnVsbCxocmVmKVxuXHRcdFx0cmVmcmVzaFxuXHRcdGVsc2Vcblx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRcdCMgZ2EoJ3NlbmQnLCAncGFnZXZpZXcnLCBocmVmKVxuXG5cdFx0aWYgIWhyZWYubWF0Y2goL1xcIy8pXG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8oMCwwKVxuXHRcblx0XHRzZWxmXG5cblx0ZGVmIHNjb3BlZCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cdFx0aWYgcmVnIGlzYSBTdHJpbmdcblx0XHRcdHZhciBueHQgPSBwYXRoW3JlZzpsZW5ndGhdXG5cdFx0XHRwYXRoLnN1YnN0cigwLHJlZzpsZW5ndGgpID09IHJlZyBhbmQgKCFueHQgb3Igbnh0ID09ICctJyBvciBueHQgPT0gJy8nIG9yIG54dCA9PSAnIycgb3Igbnh0ID09ICc/JyBvciBueHQgPT0gJ18nKVxuXHRcdGVsaWYgcmVnIGlzYSBSZWdFeHBcblx0XHRcdHZhciBtID0gcGF0aC5tYXRjaChyZWcpXG5cdFx0XHRwYXJ0ICYmIG0gPyBtW3BhcnRdIDogbVxuXHRcdGVsc2Vcblx0XHRcdG5vXG5cblx0ZGVmIG1hdGNoIHJlZywgcGFydFxuXHRcdHZhciBwYXRoID0gcGF0aCArICcjJyArIGhhc2hcblxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHRwYXRoID09IHJlZ1xuXHRcdGVsaWYgcmVnIGlzYSBSZWdFeHBcblx0XHRcdHZhciBtID0gcGF0aC5tYXRjaChyZWcpXG5cdFx0XHRwYXJ0ICYmIG0gPyBtW3BhcnRdIDogbVxuXHRcdGVsc2Vcblx0XHRcdG5vXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRhdHRyIHJvdXRlXG5cblx0ZGVmIHJvdXRlclxuXHRcdGFwcC5yb3V0ZXJcblxuXHRkZWYgcmVyb3V0ZVxuXHRcdHZhciBzY29wZWQgPSByb3V0ZXIuc2NvcGVkKHJvdXRlLHNlbGYpXG5cdFx0ZmxhZygnc2NvcGVkJyxzY29wZWQpXG5cdFx0ZmxhZygnc2VsZWN0ZWQnLHJvdXRlci5tYXRjaChyb3V0ZSxzZWxmKSlcblx0XHRpZiBzY29wZWQgIT0gQHNjb3BlZFxuXHRcdFx0QHNjb3BlZCA9IHNjb3BlZFxuXHRcdFx0c2NvcGVkID8gZGlkc2NvcGUgOiBkaWR1bnNjb3BlXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgZGlkc2NvcGVcblx0XHRzZWxmXG5cblx0ZGVmIGRpZHVuc2NvcGVcblx0XHRzZWxmXG5cbiMgZXh0ZW5kIGxpbmtzXG5leHRlbmQgdGFnIGFcblx0XG5cdGRlZiByb3V0ZVxuXHRcdEByb3V0ZSBvciBocmVmXG5cblx0ZGVmIG9udGFwIGVcblx0XHR2YXIgaHJlZiA9IGhyZWYucmVwbGFjZSgvXmh0dHBcXDpcXC9cXC9pbWJhXFwuaW8vLCcnKVxuXG5cdFx0aWYgZS5ldmVudDptZXRhS2V5IG9yIGUuZXZlbnQ6YWx0S2V5XG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXG5cblx0XHRpZiBsZXQgbSA9IGhyZWYubWF0Y2goL2dpc3RcXC5naXRodWJcXC5jb21cXC8oW15cXC9dKylcXC8oW0EtWmEtelxcZF0rKS8pXG5cdFx0XHRjb25zb2xlLmxvZyAnZ2lzdCEhJyxtWzFdLG1bMl1cblx0XHRcdCNnaXN0Lm9wZW4obVsyXSlcblx0XHRcdHJldHVybiBlLnByZXZlbnQuc3RvcFxuXG5cdFx0aWYgaHJlZlswXSA9PSAnIycgb3IgaHJlZlswXSA9PSAnLydcblx0XHRcdGUucHJldmVudC5zdG9wXG5cdFx0XHRyb3V0ZXIuZ28oaHJlZix7fSlcblx0XHRcdEltYmEuRXZlbnRzLnRyaWdnZXIoJ3JvdXRlJyxzZWxmKVxuXHRcdGVsc2Vcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcdFx0XG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHRyZXJvdXRlIGlmICR3ZWIkXG5cdFx0c2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJpbXBvcnQgSG9tZVBhZ2UgZnJvbSAnLi9Ib21lUGFnZSdcbmltcG9ydCBHdWlkZXNQYWdlIGZyb20gJy4vR3VpZGVzUGFnZSdcbmltcG9ydCBEb2NzUGFnZSBmcm9tICcuL0RvY3NQYWdlJ1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblxuXHRkZWYgcm9vdFxuXHRcdEBvd25lcl8gPyBAb3duZXJfLnJvb3QgOiBzZWxmXG5cblx0ZGVmIGFwcFxuXHRcdHJvb3QuYXBwXG5cblxuZXhwb3J0IHRhZyBTaXRlXG5cdFxuXHRkZWYgYXBwXG5cdFx0ZGF0YVxuXHRcdFxuXHRkZWYgcm9vdFxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJvdXRlclxuXHRcdGFwcC5yb3V0ZXJcblx0XHRcblx0ZGVmIGxvYWRcblx0XHRjb25zb2xlLmxvZyBcImxvYWRpbmcgYXBwLnJvdXRlclwiXG5cdFx0UHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRjb25zb2xlLmxvZyBcIlNpdGUjbG9hZFwiXG5cdFx0XHRzZXRUaW1lb3V0KHJlc29sdmUsMjAwKVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0Y29uc29sZS5sb2cgXCJyZW5kZXIgc2l0ZVwiLGFwcC5wYXRoXG5cdFx0PHNlbGY+XG5cdFx0XHQ8aGVhZGVyI2hlYWRlcj5cblx0XHRcdFx0PG5hdi5jb250ZW50PlxuXHRcdFx0XHRcdDxhLnRhYi5sb2dvIGhyZWY9Jy9ob21lJz4gPGk+ICdpbWJhJ1xuXHRcdFx0XHRcdDxhLnRhYi5ob21lIGhyZWY9Jy9ob21lJz4gPGk+ICdob21lJ1xuXHRcdFx0XHRcdDxhLnRhYi5ndWlkZXMgaHJlZj0nL2d1aWRlJz4gPGk+ICdndWlkZXMnXG5cdFx0XHRcdFx0PGEudGFiLmRvY3MgaHJlZj0nL2RvY3MnPiA8aT4gJ2FwaSdcblx0XHRcdFx0XHQ8YS50YWIuYmxvZyBocmVmPScvYmxvZyc+IDxpPiAnYmxvZydcblx0XHRcdFx0XHRpZiBhcHAucm91dGVyLnNlZ21lbnQoMCkgPT0gJ2dpc3RzJ1xuXHRcdFx0XHRcdFx0PGEudGFiLmJsb2cgaHJlZj0nL2dpc3RzJz4gPGk+ICdnaXN0cydcblxuXHRcdFx0XHRcdDxzcGFuLmdyZWVkeT5cblx0XHRcdFx0XHQ8YS50d2l0dGVyIGhyZWY9J2h0dHA6Ly90d2l0dGVyLmNvbS9pbWJhanMnPiA8aT4gJ3R3aXR0ZXInXG5cdFx0XHRcdFx0PGEuZ2l0aHViIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiA8aT4gJ2dpdGh1Yidcblx0XHRcdFx0XHQ8YS5pc3N1ZXMgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiA8aT4gJ2lzc3Vlcydcblx0XHRcdFx0XHQ8YS5tZW51IDp0YXA9J3RvZ2dsZU1lbnUnPiA8Yj5cblx0XHRcdFxuXHRcdFx0PG1haW4+XG5cdFx0XHRcdGlmIHJvdXRlci5zY29wZWQoJy9ob21lJylcblx0XHRcdFx0XHQ8SG9tZVBhZ2U+XG5cdFx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2d1aWRlJylcblx0XHRcdFx0XHQ8R3VpZGVzUGFnZVthcHAuZ3VpZGVdPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9kb2NzJylcblx0XHRcdFx0XHQ8RG9jc1BhZ2U+XG5cblx0XHRcdDxmb290ZXIjZm9vdGVyPiBcblx0XHRcdFx0PGhyPlxuXHRcdFx0XHQ8LmxmdD4gXCJJbWJhIMKpIDIwMTUtMjAxOFwiXG5cdFx0XHRcdDwucmd0PlxuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly90d2l0dGVyLmNvbS9pbWJhanMnPiAnVHdpdHRlcidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiAnR2l0SHViJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiAnSXNzdWVzJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXR0ZXIuaW0vc29tZWJlZS9pbWJhJz4gJ0NoYXQnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU2l0ZS5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG5pbXBvcnQgRXhhbXBsZSBmcm9tICcuL1NuaXBwZXQnXG5pbXBvcnQgTWFya2VkIGZyb20gJy4vTWFya2VkJ1xuaW1wb3J0IFBhdHRlcm4gZnJvbSAnLi9QYXR0ZXJuJ1xuXG5cbmV4cG9ydCB0YWcgSG9tZVBhZ2UgPCBQYWdlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiA8LmJvZHk+XG5cdFx0XHQ8ZGl2I2hlcm8uZGFyaz5cblx0XHRcdFx0PFBhdHRlcm5AcGF0dGVybj5cblx0XHRcdFx0IyA8aGVyb3NuaXBwZXQuaGVyby5kYXJrIHNyYz0nL2hvbWUvZXhhbXBsZXMvaGVyby5pbWJhJz5cblx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kLndlbGNvbWUuaHVnZS5saWdodD4gXCJcIlwiXG5cdFx0XHRcdFx0IyBDcmVhdGUgY29tcGxleCB3ZWIgYXBwcyB3aXRoIGVhc2UhXG5cblx0XHRcdFx0XHRJbWJhIGlzIGEgbmV3IHByb2dyYW1taW5nIGxhbmd1YWdlIGZvciB0aGUgd2ViIHRoYXQgY29tcGlsZXMgdG8gaGlnaGx5IFxuXHRcdFx0XHRcdHBlcmZvcm1hbnQgYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIEl0IGhhcyBsYW5ndWFnZSBsZXZlbCBzdXBwb3J0IGZvciBkZWZpbmluZywgXG5cdFx0XHRcdFx0ZXh0ZW5kaW5nLCBzdWJjbGFzc2luZywgaW5zdGFudGlhdGluZyBhbmQgcmVuZGVyaW5nIGRvbSBub2Rlcy4gRm9yIGEgc2ltcGxlIFxuXHRcdFx0XHRcdGFwcGxpY2F0aW9uIGxpa2UgVG9kb01WQywgaXQgaXMgbW9yZSB0aGFuIFxuXHRcdFx0XHRcdFsxMCB0aW1lcyBmYXN0ZXIgdGhhbiBSZWFjdF0oaHR0cDovL3NvbWViZWUuZ2l0aHViLmlvL3RvZG9tdmMtcmVuZGVyLWJlbmNobWFyay9pbmRleC5odG1sKSBcblx0XHRcdFx0XHR3aXRoIGxlc3MgY29kZSwgYW5kIGEgbXVjaCBzbWFsbGVyIGxpYnJhcnkuXG5cblx0XHRcdFx0XHQtLS1cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnNwaXJhdGlvblxuXHRcdFx0XHRcdCAgSW1iYSBicmluZ3MgdGhlIGJlc3QgZnJvbSBSdWJ5LCBQeXRob24sIGFuZCBSZWFjdCAoKyBKU1gpIHRvZ2V0aGVyIGluIGEgY2xlYW4gbGFuZ3VhZ2UgYW5kIHJ1bnRpbWUuXG5cblx0XHRcdFx0XHQtICMjIEltYmEuaW50ZXJvcGVyYWJpbGl0eVxuXHRcdFx0XHRcdCAgSW1iYSBjb21waWxlcyBkb3duIHRvIGNsZWFuIGFuZCByZWFkYWJsZSBKYXZhU2NyaXB0LiBVc2UgYW55IEpTIGxpYnJhcnkgaW4gSW1iYSBhbmQgdmljYS12ZXJzYS5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQtICMjIEltYmEucGVyZm9ybWFuY2Vcblx0XHRcdFx0XHQgIEJ1aWxkIHlvdXIgYXBwbGljYXRpb24gdmlld3MgdXNpbmcgSW1iYSdzIG5hdGl2ZSB0YWdzIGZvciB1bnByZWNlZGVudGVkIHBlcmZvcm1hbmNlLlxuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJTaW1wbGUgcmVtaW5kZXJzXCIgc3JjPScvaG9tZS9leGFtcGxlcy9yZW1pbmRlcnMuaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBSZXVzYWJsZSBjb21wb25lbnRzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0QSBjdXN0b20gdGFnIC8gY29tcG9uZW50IGNhbiBtYWludGFpbiBpbnRlcm5hbCBzdGF0ZSBhbmQgY29udHJvbCBob3cgdG8gcmVuZGVyIGl0c2VsZi5cblx0XHRcdFx0XHRXaXRoIHRoZSBwZXJmb3JtYW5jZSBvZiBET00gcmVjb25jaWxpYXRpb24gaW4gSW1iYSwgeW91IGNhbiB1c2Ugb25lLXdheSBkZWNsYXJhdGl2ZSBiaW5kaW5ncyxcblx0XHRcdFx0XHRldmVuIGZvciBhbmltYXRpb25zLiBXcml0ZSBhbGwgeW91ciB2aWV3cyBpbiBhIHN0cmFpZ2h0LWZvcndhcmQgbGluZWFyIGZhc2hpb24gYXMgaWYgeW91IGNvdWxkXG5cdFx0XHRcdFx0cmVyZW5kZXIgeW91ciB3aG9sZSBhcHBsaWNhdGlvbiBvbiAqKmV2ZXJ5IHNpbmdsZSoqIGRhdGEvc3RhdGUgY2hhbmdlLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiV29ybGQgY2xvY2tcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2Nsb2NrLmltYmEnPlxuXG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZD4gXCJcIlwiXG5cdFx0XHRcdFx0IyMgRXh0ZW5kIG5hdGl2ZSB0YWdzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0SW4gYWRkaXRpb24gdG8gZGVmaW5pbmcgY3VzdG9tIHRhZ3MsIHlvdSBjYW4gYWxzbyBleHRlbmQgbmF0aXZlIHRhZ3MsIG9yIGluaGVyaXQgZnJvbSB0aGVtLlxuXHRcdFx0XHRcdEJpbmRpbmcgdG8gZG9tIGV2ZW50cyBpcyBhcyBzaW1wbGUgYXMgZGVmaW5pbmcgbWV0aG9kcyBvbiB5b3VyIHRhZ3M7IGFsbCBldmVudHMgd2lsbCBiZVxuXHRcdFx0XHRcdGVmZmljaWVudGx5IGRlbGVnYXRlZCBhbmQgaGFuZGxlZCBieSBJbWJhLiBMZXQncyBkZWZpbmUgYSBzaW1wbGUgc2tldGNocGFkLi4uXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJDdXN0b20gY2FudmFzXCIgc3JjPScvaG9tZS9leGFtcGxlcy9jYW52YXMuaW1iYSc+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0hvbWVQYWdlLmltYmEiLCIjIGRlZmluZSByZW5kZXJlclxudmFyIG1hcmtlZCA9IHJlcXVpcmUgJ21hcmtlZCdcbnZhciBtZHIgPSBtYXJrZWQuUmVuZGVyZXIubmV3XG5cbmRlZiBtZHIuaGVhZGluZyB0ZXh0LCBsdmxcblx0XCI8aHtsdmx9Pnt0ZXh0fTwvaHtsdmx9PlwiXG5cdFx0XG5leHBvcnQgdGFnIE1hcmtlZFxuXHRkZWYgcmVuZGVyZXJcblx0XHRzZWxmXG5cblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRleHRcblx0XHRcdEB0ZXh0ID0gdGV4dFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IG1hcmtlZCh0ZXh0LCByZW5kZXJlcjogbWRyKVxuXHRcdHNlbGZcblxuXHRkZWYgc2V0Q29udGVudCB2YWwsdHlwXG5cdFx0c2V0VGV4dCh2YWwsMClcblx0XHRyZXR1cm4gc2VsZlxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCIvKipcbiAqIG1hcmtlZCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IG5vb3AsXG4gIGhyOiAvXiggKlstKl9dKXszLH0gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgbGhlYWRpbmc6IC9eKFteXFxuXSspXFxuICooPXwtKXsyLH0gKig/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggKj5bXlxcbl0rKFxcbig/IWRlZilbXlxcbl0rKSpcXG4qKSsvLFxuICBsaXN0OiAvXiggKikoYnVsbCkgW1xcc1xcU10rPyg/OmhyfGRlZnxcXG57Mix9KD8hICkoPyFcXDFidWxsIClcXG4qfFxccyokKS8sXG4gIGh0bWw6IC9eICooPzpjb21tZW50ICooPzpcXG58XFxzKiQpfGNsb3NlZCAqKD86XFxuezIsfXxcXHMqJCl8Y2xvc2luZyAqKD86XFxuezIsfXxcXHMqJCkpLyxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogK1tcIihdKFteXFxuXSspW1wiKV0pPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBwYXJhZ3JhcGg6IC9eKCg/OlteXFxuXStcXG4/KD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfHRhZ3xkZWYpKSspXFxuKi8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGQrXFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpIFteXFxuXSooPzpcXG4oPyFcXDFidWxsIClbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IHJlcGxhY2UoYmxvY2suaXRlbSwgJ2dtJylcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCk7XG5cbmJsb2NrLmxpc3QgPSByZXBsYWNlKGJsb2NrLmxpc3QpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86Wy0qX10gKil7Myx9KD86XFxcXG4rfCQpKScpXG4gICgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IHJlcGxhY2UoYmxvY2suYmxvY2txdW90ZSlcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG5ibG9jay5fdGFnID0gJyg/ISg/OidcbiAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGUnXG4gICsgJ3x2YXJ8c2FtcHxrYmR8c3VifHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkbydcbiAgKyAnfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITovfFteXFxcXHdcXFxcc0BdKkApXFxcXGInO1xuXG5ibG9jay5odG1sID0gcmVwbGFjZShibG9jay5odG1sKVxuICAoJ2NvbW1lbnQnLCAvPCEtLVtcXHNcXFNdKj8tLT4vKVxuICAoJ2Nsb3NlZCcsIC88KHRhZylbXFxzXFxTXSs/PFxcL1xcMT4vKVxuICAoJ2Nsb3NpbmcnLCAvPHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8pXG4gICgvdGFnL2csIGJsb2NrLl90YWcpXG4gICgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCdocicsIGJsb2NrLmhyKVxuICAoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICgnYmxvY2txdW90ZScsIGJsb2NrLmJsb2NrcXVvdGUpXG4gICgndGFnJywgJzwnICsgYmxvY2suX3RhZylcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgZmVuY2VzOiAvXiAqKGB7Myx9fH57Myx9KVsgXFwuXSooXFxTKyk/ICpcXG4oW1xcc1xcU10qPylcXHMqXFwxICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiAvXi8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSArKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvXG59KTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJyg/IScsICcoPyEnXG4gICAgKyBibG9jay5nZm0uZmVuY2VzLnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMicpICsgJ3wnXG4gICAgKyBibG9jay5saXN0LnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMycpICsgJ3wnKVxuICAoKTtcblxuLyoqXG4gKiBHRk0gKyBUYWJsZXMgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLnRhYmxlcyA9IG1lcmdlKHt9LCBibG9jay5nZm0sIHtcbiAgbnB0YWJsZTogL14gKihcXFMuKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKVxcbigoPzouKlxcfC4qKD86XFxufCQpKSopXFxuKi8sXG4gIHRhYmxlOiAvXiAqXFx8KC4rKVxcbiAqXFx8KCAqWy06XStbLXwgOl0qKVxcbigoPzogKlxcfC4qKD86XFxufCQpKSopXFxuKi9cbn0pO1xuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cblxuZnVuY3Rpb24gTGV4ZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2Vucy5saW5rcyA9IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMudGFibGVzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2sudGFibGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBCbG9jayBSdWxlc1xuICovXG5cbkxleGVyLnJ1bGVzID0gYmxvY2s7XG5cbi8qKlxuICogU3RhdGljIExleCBNZXRob2RcbiAqL1xuXG5MZXhlci5sZXggPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG59O1xuXG4vKipcbiAqIFByZXByb2Nlc3NpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHNyYyA9IHNyY1xuICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKVxuICAgIC5yZXBsYWNlKC9cXHUwMGEwL2csICcgJylcbiAgICAucmVwbGFjZSgvXFx1MjQyNC9nLCAnXFxuJyk7XG5cbiAgcmV0dXJuIHRoaXMudG9rZW4oc3JjLCB0cnVlKTtcbn07XG5cbi8qKlxuICogTGV4aW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLnRva2VuID0gZnVuY3Rpb24oc3JjLCB0b3AsIGJxKSB7XG4gIHZhciBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpXG4gICAgLCBuZXh0XG4gICAgLCBsb29zZVxuICAgICwgY2FwXG4gICAgLCBidWxsXG4gICAgLCBiXG4gICAgLCBpdGVtXG4gICAgLCBzcGFjZVxuICAgICwgaVxuICAgICwgbDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBjYXAucmVwbGFjZSgvXFxuKyQvLCAnJylcbiAgICAgICAgICA6IGNhcFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmZW5jZXMgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5mZW5jZXMuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgbGFuZzogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLm5wdGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV0uc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdocidcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYmxvY2txdW90ZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrcXVvdGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfc3RhcnQnXG4gICAgICB9KTtcblxuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gKj4gPy9nbSwgJycpO1xuXG4gICAgICAvLyBQYXNzIGB0b3BgIHRvIGtlZXAgdGhlIGN1cnJlbnRcbiAgICAgIC8vIFwidG9wbGV2ZWxcIiBzdGF0ZS4gVGhpcyBpcyBleGFjdGx5XG4gICAgICAvLyBob3cgbWFya2Rvd24ucGwgd29ya3MuXG4gICAgICB0aGlzLnRva2VuKGNhcCwgdG9wLCB0cnVlKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaXN0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGlzdC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWxsID0gY2FwWzJdO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3Rfc3RhcnQnLFxuICAgICAgICBvcmRlcmVkOiBidWxsLmxlbmd0aCA+IDFcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICBsID0gY2FwLmxlbmd0aDtcbiAgICAgIGkgPSAwO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpdGVtID0gY2FwW2ldO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBpdGVtJ3MgYnVsbGV0XG4gICAgICAgIC8vIHNvIGl0IGlzIHNlZW4gYXMgdGhlIG5leHQgdG9rZW4uXG4gICAgICAgIHNwYWNlID0gaXRlbS5sZW5ndGg7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL14gKihbKistXXxcXGQrXFwuKSArLywgJycpO1xuXG4gICAgICAgIC8vIE91dGRlbnQgd2hhdGV2ZXIgdGhlXG4gICAgICAgIC8vIGxpc3QgaXRlbSBjb250YWlucy4gSGFja3kuXG4gICAgICAgIGlmICh+aXRlbS5pbmRleE9mKCdcXG4gJykpIHtcbiAgICAgICAgICBzcGFjZSAtPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgICBpdGVtID0gIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgPyBpdGVtLnJlcGxhY2UobmV3IFJlZ0V4cCgnXiB7MSwnICsgc3BhY2UgKyAnfScsICdnbScpLCAnJylcbiAgICAgICAgICAgIDogaXRlbS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgbmV4dCBsaXN0IGl0ZW0gYmVsb25ncyBoZXJlLlxuICAgICAgICAvLyBCYWNrcGVkYWwgaWYgaXQgZG9lcyBub3QgYmVsb25nIGluIHRoaXMgbGlzdC5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgYiA9IGJsb2NrLmJ1bGxldC5leGVjKGNhcFtpICsgMV0pWzBdO1xuICAgICAgICAgIGlmIChidWxsICE9PSBiICYmICEoYnVsbC5sZW5ndGggPiAxICYmIGIubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgIHNyYyA9IGNhcC5zbGljZShpICsgMSkuam9pbignXFxuJykgKyBzcmM7XG4gICAgICAgICAgICBpID0gbCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgaXRlbSBpcyBsb29zZSBvciBub3QuXG4gICAgICAgIC8vIFVzZTogLyhefFxcbikoPyEgKVteXFxuXStcXG5cXG4oPyFcXHMqJCkvXG4gICAgICAgIC8vIGZvciBkaXNjb3VudCBiZWhhdmlvci5cbiAgICAgICAgbG9vc2UgPSBuZXh0IHx8IC9cXG5cXG4oPyFcXHMqJCkvLnRlc3QoaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSBsIC0gMSkge1xuICAgICAgICAgIG5leHQgPSBpdGVtLmNoYXJBdChpdGVtLmxlbmd0aCAtIDEpID09PSAnXFxuJztcbiAgICAgICAgICBpZiAoIWxvb3NlKSBsb29zZSA9IG5leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBsb29zZVxuICAgICAgICAgICAgPyAnbG9vc2VfaXRlbV9zdGFydCdcbiAgICAgICAgICAgIDogJ2xpc3RfaXRlbV9zdGFydCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSwgYnEpO1xuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fZW5kJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBodG1sXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHRtbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAncGFyYWdyYXBoJ1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA+XSsoQHw6XFwvKVteID5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86W15fXXxfXykrPylfXFxifF5cXCooKD86XFwqXFwqfFtcXHNcXFNdKSs/KVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKylcXHMqKFtcXHNcXFNdKj9bXmBdKVxccypcXDEoPyFgKS8sXG4gIGJyOiAvXiB7Mix9XFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wLFxuICB0ZXh0OiAvXltcXHNcXFNdKz8oPz1bXFxcXDwhXFxbXypgXXwgezIsfVxcbnwkKS9cbn07XG5cbmlubGluZS5faW5zaWRlID0gLyg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dfFxcXSg/PVteXFxbXSpcXF0pKSovO1xuaW5saW5lLl9ocmVmID0gL1xccyo8PyhbXFxzXFxTXSo/KT4/KD86XFxzK1snXCJdKFtcXHNcXFNdKj8pWydcIl0pP1xccyovO1xuXG5pbmxpbmUubGluayA9IHJlcGxhY2UoaW5saW5lLmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgnaHJlZicsIGlubGluZS5faHJlZilcbiAgKCk7XG5cbmlubGluZS5yZWZsaW5rID0gcmVwbGFjZShpbmxpbmUucmVmbGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopL1xufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogcmVwbGFjZShpbmxpbmUuZXNjYXBlKSgnXSknLCAnfnxdKScpKCksXG4gIHVybDogL14oaHR0cHM/OlxcL1xcL1teXFxzPF0rW148Liw6O1wiJylcXF1cXHNdKS8sXG4gIGRlbDogL15+fig/PVxcUykoW1xcc1xcU10qP1xcUyl+fi8sXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLnRleHQpXG4gICAgKCddfCcsICd+XXwnKVxuICAgICgnfCcsICd8aHR0cHM/Oi8vfCcpXG4gICAgKClcbn0pO1xuXG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiByZXBsYWNlKGlubGluZS5icikoJ3syLH0nLCAnKicpKCksXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLmdmbS50ZXh0KSgnezIsfScsICcqJykoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICBpZiAoIXRoaXMubGlua3MpIHtcbiAgICB0aHJvdyBuZXdcbiAgICAgIEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbGlua1xuICAgICwgdGV4dFxuICAgICwgaHJlZlxuICAgICwgY2FwO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGNhcFsxXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBjYXBbMV0uY2hhckF0KDYpID09PSAnOidcbiAgICAgICAgICA/IHRoaXMubWFuZ2xlKGNhcFsxXS5zdWJzdHJpbmcoNykpXG4gICAgICAgICAgOiB0aGlzLm1hbmdsZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGhpcy5tYW5nbGUoJ21haWx0bzonKSArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHVybCAoZ2ZtKVxuICAgIGlmICghdGhpcy5pbkxpbmsgJiYgKGNhcCA9IHRoaXMucnVsZXMudXJsLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBocmVmID0gdGV4dDtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGV4dChlc2NhcGUodGhpcy5zbWFydHlwYW50cyhjYXBbMF0pKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGVzY2FwZShsaW5rLmhyZWYpXG4gICAgLCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuXG4gIHJldHVybiBjYXBbMF0uY2hhckF0KDApICE9PSAnISdcbiAgICA/IHRoaXMucmVuZGVyZXIubGluayhocmVmLCB0aXRsZSwgdGhpcy5vdXRwdXQoY2FwWzFdKSlcbiAgICA6IHRoaXMucmVuZGVyZXIuaW1hZ2UoaHJlZiwgdGl0bGUsIGVzY2FwZShjYXBbMV0pKTtcbn07XG5cbi8qKlxuICogU21hcnR5cGFudHMgVHJhbnNmb3JtYXRpb25zXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLnNtYXJ0eXBhbnRzID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5zbWFydHlwYW50cykgcmV0dXJuIHRleHQ7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59O1xuXG4vKipcbiAqIE1hbmdsZSBMaW5rc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5tYW5nbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLm1hbmdsZSkgcmV0dXJuIHRleHQ7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbCA9IHRleHQubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgY2g7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5cbmZ1bmN0aW9uIFJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBsYW5nLCBlc2NhcGVkKSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJ1xcbjwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICdcXG48L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcpIHtcbiAgcmV0dXJuICc8aCdcbiAgICArIGxldmVsXG4gICAgKyAnIGlkPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeFxuICAgICsgcmF3LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHddKy9nLCAnLScpXG4gICAgKyAnXCI+J1xuICAgICsgdGV4dFxuICAgICsgJzwvaCdcbiAgICArIGxldmVsXG4gICAgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQpIHtcbiAgdmFyIHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyAnPHRib2R5PlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3Rib2R5PlxcbidcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIHN0eWxlPVwidGV4dC1hbGlnbjonICsgZmxhZ3MuYWxpZ24gKyAnXCI+J1xuICAgIDogJzwnICsgdHlwZSArICc+JztcbiAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cbi8vIHNwYW4gbGV2ZWwgcmVuZGVyZXJcblJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHN0cm9uZz4nICsgdGV4dCArICc8L3N0cm9uZz4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxlbT4nICsgdGV4dCArICc8L2VtPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGNvZGU+JyArIHRleHQgKyAnPC9jb2RlPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxkZWw+JyArIHRleHQgKyAnPC9kZWw+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG4gIHZhciBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cblxuZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbiA9IG51bGw7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG59XG5cbi8qKlxuICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICovXG5cblBhcnNlci5wYXJzZSA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucywgcmVuZGVyZXIpIHtcbiAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucywgcmVuZGVyZXIpO1xuICByZXR1cm4gcGFyc2VyLnBhcnNlKHNyYyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExvb3BcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc3JjKSB7XG4gIHRoaXMuaW5saW5lID0gbmV3IElubGluZUxleGVyKHNyYy5saW5rcywgdGhpcy5vcHRpb25zLCB0aGlzLnJlbmRlcmVyKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMucG9wKCk7XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHRoaXMudG9rZW4udGV4dCk7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJ1xuICAgICAgICAsIGJvZHkgPSAnJ1xuICAgICAgICAsIGlcbiAgICAgICAgLCByb3dcbiAgICAgICAgLCBjZWxsXG4gICAgICAgICwgZmxhZ3NcbiAgICAgICAgLCBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbGFncyA9IHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9O1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdibG9ja3F1b3RlX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJ1xuICAgICAgICAsIG9yZGVyZWQgPSB0aGlzLnRva2VuLm9yZGVyZWQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkKTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rZW4udHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgPyB0aGlzLnBhcnNlVGV4dCgpXG4gICAgICAgICAgOiB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbG9vc2VfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgIHZhciBodG1sID0gIXRoaXMudG9rZW4ucHJlICYmICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgPyB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KVxuICAgICAgICA6IHRoaXMudG9rZW4udGV4dDtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmh0bWwoaHRtbCk7XG4gICAgfVxuICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSk7XG4gICAgfVxuICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZVRleHQoKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UoIWVuY29kZSA/IC8mKD8hIz9cXHcrOykvZyA6IC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcblx0Ly8gZXhwbGljaXRseSBtYXRjaCBkZWNpbWFsLCBoZXgsIGFuZCBuYW1lZCBIVE1MIGVudGl0aWVzIFxuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vZywgZnVuY3Rpb24oXywgbikge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZShyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIHJldHVybiBmdW5jdGlvbiBzZWxmKG5hbWUsIHZhbCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgdmFsID0gdmFsLnJlcGxhY2UoLyhefFteXFxbXSlcXF4vZywgJyQxJyk7XG4gICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMVxuICAgICwgdGFyZ2V0XG4gICAgLCBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayB8fCB0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG5cbiAgICB2YXIgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodFxuICAgICAgLCB0b2tlbnNcbiAgICAgICwgcGVuZGluZ1xuICAgICAgLCBpID0gMDtcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5kZWZhdWx0cyA9IHtcbiAgZ2ZtOiB0cnVlLFxuICB0YWJsZXM6IHRydWUsXG4gIGJyZWFrczogZmFsc2UsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzYW5pdGl6ZXI6IG51bGwsXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc21hcnRMaXN0czogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG4gIGhpZ2hsaWdodDogbnVsbCxcbiAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgc21hcnR5cGFudHM6IGZhbHNlLFxuICBoZWFkZXJQcmVmaXg6ICcnLFxuICByZW5kZXJlcjogbmV3IFJlbmRlcmVyLFxuICB4aHRtbDogZmFsc2Vcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xuXG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcblxubWFya2VkLklubGluZUxleGVyID0gSW5saW5lTGV4ZXI7XG5tYXJrZWQuaW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlci5vdXRwdXQ7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLm1hcmtlZCA9IG1hcmtlZDtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJkZWYgc2h1ZmZsZSBhcnJheVxuXHR2YXIgY291bnRlciA9IGFycmF5Omxlbmd0aCwgdGVtcCwgaW5kZXhcblxuXHQjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcblx0d2hpbGUgY291bnRlciA+IDBcblx0XHQjIFBpY2sgYSByYW5kb20gaW5kZXhcblx0XHRpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20gKiBjb3VudGVyKVxuXHRcdGNvdW50ZXItLSAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuXHRcdCMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG5cdFx0dGVtcCA9IGFycmF5W2NvdW50ZXJdXG5cdFx0YXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cblx0XHRhcnJheVtpbmRleF0gPSB0ZW1wXG5cdFxuXHRyZXR1cm4gYXJyYXlcblxuZXhwb3J0IHRhZyBQYXR0ZXJuXG5cblx0ZGVmIHNldHVwXG5cdFx0cmV0dXJuIHNlbGYgaWYgJG5vZGUkXG5cdFx0dmFyIHBhcnRzID0ge3RhZ3M6IFtdLCBrZXl3b3JkczogW10sIG1ldGhvZHM6IFtdfVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIGxpbmVzID0gW11cblxuXHRcdGZvciBvd24gayx2IG9mIEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdFx0aXRlbXMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXHRcdFx0cGFydHM6bWV0aG9kcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cblx0XHRmb3IgayBpbiBJbWJhLkhUTUxfVEFHUyBvciBIVE1MX1RBR1Ncblx0XHRcdGl0ZW1zLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblx0XHRcdHBhcnRzOnRhZ3MucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXG5cdFx0dmFyIHdvcmRzID0gXCJkZWYgaWYgZWxzZSBlbGlmIHdoaWxlIHVudGlsIGZvciBpbiBvZiB2YXIgbGV0IGNsYXNzIGV4dGVuZCBleHBvcnQgaW1wb3J0IHRhZyBnbG9iYWxcIlxuXG5cdFx0Zm9yIGsgaW4gd29yZHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXHRcdFx0cGFydHM6a2V5d29yZHMucHVzaChcIjxpPntrfTwvaT5cIilcblxuXHRcdHZhciBzaHVmZmxlZCA9IHNodWZmbGUoaXRlbXMpXG5cdFx0dmFyIGFsbCA9IFtdLmNvbmNhdChzaHVmZmxlZClcblx0XHR2YXIgY291bnQgPSBpdGVtczpsZW5ndGggLSAxXG5cblx0XHRmb3IgbG4gaW4gWzAgLi4gMTRdXG5cdFx0XHRsZXQgY2hhcnMgPSAwXG5cdFx0XHRsaW5lc1tsbl0gPSBbXVxuXHRcdFx0d2hpbGUgY2hhcnMgPCAzMDBcblx0XHRcdFx0bGV0IGl0ZW0gPSAoc2h1ZmZsZWQucG9wIG9yIGFsbFtNYXRoLmZsb29yKGNvdW50ICogTWF0aC5yYW5kb20pXSlcblx0XHRcdFx0aWYgaXRlbVxuXHRcdFx0XHRcdGNoYXJzICs9IGl0ZW06bGVuZ3RoXG5cdFx0XHRcdFx0bGluZXNbbG5dLnB1c2goaXRlbSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNoYXJzID0gNDAwXG5cblx0XHRkb206aW5uZXJIVE1MID0gJzxkaXY+JyArIGxpbmVzLm1hcCh8bG4saXxcblx0XHRcdGxldCBvID0gTWF0aC5tYXgoMCwoKGkgLSAyKSAqIDAuMyAvIDE0KSkudG9GaXhlZCgyKVxuXHRcdFx0XCI8ZGl2IGNsYXNzPSdsaW5lJyBzdHlsZT0nb3BhY2l0eToge299Oyc+XCIgKyBsbi5qb2luKFwiIFwiKSArICc8L2Rpdj4nXG5cdFx0KS5qb2luKCcnKSArICc8L2Rpdj4nXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYXR0ZXJuLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cbnRhZyBHdWlkZVRPQ1xuXHRwcm9wIHRvY1xuXHRhdHRyIGxldmVsXG5cblx0ZGVmIHRvZ2dsZVxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cdFx0XG5cdGRlZiB0b2Ncblx0XHRAdG9jIG9yIGRhdGEudG9jXG5cdFx0XG5cdGRlZiByb3V0ZVxuXHRcdFwie2RhdGEucGF0aH0je3RvYzpzbHVnfVwiXHRcdFxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRhdGEucmVhZHlcblxuXHRcdGxldCB0b2MgPSB0b2Ncblx0XHRyZXJvdXRlXG5cdFxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdGlmIHRvYzpjaGlsZHJlbjpsZW5ndGggYW5kIHRvYzpsZXZlbCA8IDNcblx0XHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0XHQ8R3VpZGVUT0NbZGF0YV0gdG9jPWNoaWxkPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblxudGFnIEd1aWRlXG5cdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAYm9keS5kb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0aWYgJHdlYiRcblx0XHRcdGF3YWtlblNuaXBwZXRzXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYubWQ+XG5cdFx0XHQ8ZGl2QGJvZHk+XG5cdFx0XHQ8Zm9vdGVyPlxuXHRcdFx0XHRpZiBsZXQgcmVmID0gYXBwLmd1aWRlW2RhdGE6cHJldl1cblx0XHRcdFx0XHQ8YS5wcmV2IGhyZWY9XCIvZ3VpZGUve3JlZjppZH1cIj4gXCLihpAgXCIgKyByZWY6dGl0bGVcblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOm5leHRdXG5cdFx0XHRcdFx0PGEubmV4dCBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IHJlZjp0aXRsZSArIFwiIOKGklwiXG5cblx0ZGVmIGF3YWtlblNuaXBwZXRzXG5cdFx0Zm9yIGl0ZW0gaW4gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbmlwcGV0Jylcblx0XHRcdGxldCBjb2RlID0gaXRlbTp0ZXh0Q29udGVudFxuXHRcdFx0aWYgY29kZS5pbmRleE9mKCdJbWJhLm1vdW50JykgPj0gMFxuXHRcdFx0XHRTbmlwcGV0LnJlcGxhY2UoaXRlbSlcblx0XHRzZWxmXG5cbnRhZyBUT0MgPCBsaVxuXHRwcm9wIHRvY1xuXHRwcm9wIGV4cGFuZGVkIGRlZmF1bHQ6IHRydWVcblx0YXR0ciBsZXZlbFxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0XCIvZ3VpZGUve2RhdGE6cm91dGV9I3t0b2M6c2x1Z31cIlxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhOnRvY1swXVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAyIGFuZCBleHBhbmRlZFxuXHRcdFx0XHQ8dWw+IGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW4gd2hlbiBjaGlsZDpsZXZlbCA8IDNcblx0XHRcdFx0XHQ8VE9DW2RhdGFdIHRvYz1jaGlsZD5cblxuZXhwb3J0IHRhZyBHdWlkZXNQYWdlIDwgUGFnZVxuXHRcblx0ZGVmIG1vdW50XG5cdFx0QG9uc2Nyb2xsIHx8PSBkbyBzY3JvbGxlZFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXG5cdGRlZiB1bm1vdW50XG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cdFx0XG5cdGRlZiBndWlkZVxuXHRcdGRhdGFbcm91dGVyLnBhdGgucmVwbGFjZSgnL2d1aWRlLycsJycpXSBvciBkYXRhWydlc3NlbnRpYWxzL2ludHJvZHVjdGlvbiddXG5cdFx0XG5cdGRlZiBzY3JvbGxlZFxuXHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgaXRlbXMgPSBkb20ucXVlcnlTZWxlY3RvckFsbCgnW2lkXScpXG5cdFx0dmFyIG1hdGNoXG5cblx0XHR2YXIgc2Nyb2xsVG9wID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0dmFyIHdoID0gd2luZG93OmlubmVySGVpZ2h0XG5cdFx0dmFyIGRoID0gZG9jdW1lbnQ6Ym9keTpzY3JvbGxIZWlnaHRcblxuXHRcdGlmIEBzY3JvbGxGcmVlemUgPj0gMFxuXHRcdFx0dmFyIGRpZmYgPSBNYXRoLmFicyhzY3JvbGxUb3AgLSBAc2Nyb2xsRnJlZXplKVxuXHRcdFx0cmV0dXJuIHNlbGYgaWYgZGlmZiA8IDUwXG5cdFx0XHRAc2Nyb2xsRnJlZXplID0gLTFcblxuXHRcdHZhciBzY3JvbGxCb3R0b20gPSBkaCAtIChzY3JvbGxUb3AgKyB3aClcblxuXHRcdGlmIHNjcm9sbEJvdHRvbSA9PSAwXG5cdFx0XHRtYXRjaCA9IGl0ZW1zW2l0ZW1zLmxlbiAtIDFdXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdFx0dmFyIHQgPSAoaXRlbTpvZmZzZXRUb3AgKyAzMCArIDYwKSAjIGhhY2tcblx0XHRcdFx0dmFyIGRpc3QgPSBzY3JvbGxUb3AgLSB0XG5cblx0XHRcdFx0aWYgZGlzdCA8IDBcblx0XHRcdFx0XHRicmVhayBtYXRjaCA9IGl0ZW1cblx0XHRcblx0XHRpZiBtYXRjaFxuXHRcdFx0aWYgQGhhc2ggIT0gbWF0Y2g6aWRcblx0XHRcdFx0QGhhc2ggPSBtYXRjaDppZFxuXHRcdFx0XHRyb3V0ZXIuZ28oJyMnICsgQGhhc2gse30seWVzKVxuXHRcdFx0XHRyZW5kZXJcblxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucm91dGUgZVxuXHRcdGUuc3RvcFxuXHRcdGxvZyAnZ3VpZGVzIHJvdXRlZCdcblx0XHR2YXIgc2Nyb2xsID0gZG9cblx0XHRcdGlmIGxldCBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKCcjJyArIHJvdXRlci5oYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlldyh0cnVlKVxuXHRcdFx0XHRAc2Nyb2xsRnJlZXplID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0XHRcdHJldHVybiBlbFxuXHRcdFx0cmV0dXJuIG5vXG5cblx0XHRpZiByb3V0ZXIuaGFzaFxuXHRcdFx0IyByZW5kZXJcblx0XHRcdHNjcm9sbCgpIG9yIHNldFRpbWVvdXQoc2Nyb2xsLDIwKVxuXG5cdFx0c2VsZlxuXHQjIHByb3AgZ3VpZGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0bGV0IGN1cnIgPSBndWlkZVxuXG5cdFx0PHNlbGYuX3BhZ2U+XG5cdFx0XHQ8bmF2QG5hdj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBpdGVtIGluIGRhdGE6dG9jXG5cdFx0XHRcdFx0XHQ8aDE+IGl0ZW06dGl0bGUgb3IgaXRlbTppZFxuXHRcdFx0XHRcdFx0PHVsPlxuXHRcdFx0XHRcdFx0XHRmb3Igc2VjdGlvbiBpbiBpdGVtOnNlY3Rpb25zXG5cdFx0XHRcdFx0XHRcdFx0PFRPQ1tkYXRhW3NlY3Rpb25dXSBleHBhbmRlZD0oZGF0YVtzZWN0aW9uXSA9PSBjdXJyKT5cblx0XHRcdFx0XHQjIGZvciBndWlkZSBpbiBkYXRhXG5cdFx0XHRcdFx0I1x0PFRPQ1tndWlkZV0gdG9jPWd1aWRlOnRvY1swXSBleHBhbmRlZD0oZ3VpZGUgPT0gY3Vycik+XG5cdFx0XHQ8LmJvZHkubGlnaHQ+XG5cdFx0XHRcdGlmIGd1aWRlXG5cdFx0XHRcdFx0PEd1aWRlQHtndWlkZTppZH1bZ3VpZGVdPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9HdWlkZXNQYWdlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmRlZiBwYXRoVG9BbmNob3IgcGF0aFxuXHQnYXBpLScgKyBwYXRoLnJlcGxhY2UoL1xcLi9nLCdfJykucmVwbGFjZSgvXFwjL2csJ19fJykucmVwbGFjZSgvXFw9L2csJ19zZXQnKVxuXG50YWcgRGVzY1xuXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgaHRtbCAhPSBAaHRtbFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IEBodG1sID0gaHRtbFxuXHRcdHNlbGZcblxudGFnIFJlZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblxudGFnIEl0ZW1cblxudGFnIFBhdGggPCBzcGFuXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgc2V0dXBcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBzdHIgPSBkYXRhXG5cdFx0aWYgc3RyIGlzYSBTdHJpbmdcblx0XHRcdGlmIHNob3J0XG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8oW0EtWl1cXHcqXFwuKSooPz1bQS1aXSkvZywnJylcblxuXHRcdFx0aHRtbCA9IHN0ci5yZXBsYWNlKC9cXGIoW1xcd10rfFxcLnxcXCMpXFxiL2cpIGRvIHxtLGl8XG5cdFx0XHRcdGlmIGkgPT0gJy4nIG9yIGkgPT0gJyMnXG5cdFx0XHRcdFx0XCI8aT57aX08L2k+XCJcblx0XHRcdFx0ZWxpZiBpWzBdID09IGlbMF0udG9VcHBlckNhc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdjb25zdCc+e2l9PC9iPlwiXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdpZCc+e2l9PC9iPlwiXG5cdFx0c2VsZlxuXG5cbnRhZyBSZXR1cm5cblx0YXR0ciBuYW1lXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PFBhdGhbZGF0YTp2YWx1ZV0udmFsdWU+XG5cdFx0XHQ8c3Bhbi5kZXNjPiBkYXRhOmRlc2NcblxudGFnIENsYXNzIDwgSXRlbVxuXG5cdHByb3AgZGF0YSB3YXRjaDogOnBhcnNlXG5cblx0ZGVmIHBhcnNlXG5cdFx0QHN0YXRpY3MgPSAobSBmb3IgbSBpbiBkYXRhWycuJ10gd2hlbiBtOmRlc2MpXG5cdFx0QG1ldGhvZHMgPSAobSBmb3IgbSBpbiBkYXRhWycjJ10gd2hlbiBtOmRlc2MpXG5cdFx0QHByb3BlcnRpZXMgPSBbXVxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKT5cblx0XHRcdDwuaGVhZGVyPiA8LnRpdGxlPiA8UGF0aFtkYXRhOm5hbWVwYXRoXT5cblx0XHRcdDxEZXNjIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0aWYgZGF0YTpjdG9yXG5cdFx0XHRcdDwuY29udGVudC5jdG9yPlxuXHRcdFx0XHRcdDxNZXRob2RbZGF0YTpjdG9yXSBwYXRoPShkYXRhOm5hbWVwYXRoICsgJy5uZXcnKT5cblxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRpZiBAc3RhdGljczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ1N0YXRpYyBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBzdGF0aWNzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6bmFtZXBhdGg+XG5cblx0XHRcdFx0aWYgQG1ldGhvZHM6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdJbnN0YW5jZSBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBtZXRob2RzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6aW5hbWU+XG5cbnRhZyBWYWx1ZVxuXG5cdGRlZiByZW5kZXJcblx0XHRpZiBkYXRhOnR5cGVcblx0XHRcdDxzZWxmIC57ZGF0YTp0eXBlfT5cblx0XHRcdFx0ZGF0YTp2YWx1ZVxuXHRcdGVsaWYgZGF0YSBpc2EgU3RyaW5nXG5cdFx0XHQ8c2VsZi5zdHIgdGV4dD1kYXRhPlxuXHRcdGVsaWYgZGF0YSBpc2EgTnVtYmVyXG5cdFx0XHQ8c2VsZi5udW0gdGV4dD1kYXRhPlxuXHRcdHNlbGZcblx0XHRcblxudGFnIFBhcmFtXG5cblx0ZGVmIHR5cGVcblx0XHRkYXRhOnR5cGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLnt0eXBlfT5cblx0XHRcdGlmIHR5cGUgPT0gJ05hbWVkUGFyYW1zJ1xuXHRcdFx0XHRmb3IgcGFyYW0gaW4gZGF0YTpub2Rlc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDwubmFtZT4gZGF0YTpuYW1lXG5cdFx0XHRcdGlmIGRhdGE6ZGVmYXVsdHNcblx0XHRcdFx0XHQ8aT4gdHlwZSA9PSAnTmFtZWRQYXJhbScgPyAnOiAnIDogJyA9ICdcblx0XHRcdFx0XHQ8VmFsdWVbZGF0YTpkZWZhdWx0c10+XG5cbnRhZyBNZXRob2QgPCBJdGVtXG5cblx0cHJvcCBpbmFtZVxuXHRwcm9wIHBhdGhcblxuXHRkZWYgdGFnc1xuXHRcdDxkaXZAdGFncz5cblx0XHRcdDxSZXR1cm5bZGF0YTpyZXR1cm5dIG5hbWU9J3JldHVybnMnPiBpZiBkYXRhOnJldHVyblxuXG5cdFx0XHRpZiBkYXRhOmRlcHJlY2F0ZWRcblx0XHRcdFx0PC5kZXByZWNhdGVkLnJlZD4gJ01ldGhvZCBpcyBkZXByZWNhdGVkJ1xuXHRcdFx0aWYgZGF0YTpwcml2YXRlXG5cdFx0XHRcdDwucHJpdmF0ZS5yZWQ+ICdNZXRob2QgaXMgcHJpdmF0ZSdcblxuXG5cdGRlZiBwYXRoXG5cdFx0QHBhdGggb3IgKGluYW1lICsgJy4nICsgZGF0YTpuYW1lKVxuXG5cdGRlZiBzbHVnXG5cdFx0cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC5kZXByZWNhdGVkPShkYXRhOmRlcHJlY2F0ZWQpID5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9c2x1Zz5cblx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHQ8UGF0aFtwYXRoXT5cblx0XHRcdFx0PC5wYXJhbXM+IGZvciBwYXJhbSBpbiBkYXRhOnBhcmFtc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRcdDwuZ3Jvdz5cblx0XHRcdDxEZXNjLm1kIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0dGFnc1xuXG50YWcgTGluayA8IGFcblx0cHJvcCBzaG9ydFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiBocmVmPVwiL2RvY3Mje3BhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKX1cIj4gPFBhdGhbZGF0YTpuYW1lcGF0aF0gc2hvcnQ9c2hvcnQ+XG5cdFx0c3VwZXJcblxuXHRkZWYgb250YXBcblx0XHRzdXBlclxuXHRcdHRyaWdnZXIoJ3JlZm9jdXMnKVxuXG50YWcgR3JvdXBcblxuXHRkZWYgb250YXBcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXG5cbmV4cG9ydCB0YWcgRG9jc1BhZ2UgPCBQYWdlXG5cblx0cHJvcCB2ZXJzaW9uIGRlZmF1bHQ6ICdjdXJyZW50J1xuXHRwcm9wIHJvb3RzXG5cblx0ZGVmIHNyY1xuXHRcdFwiL2FwaS97dmVyc2lvbn0uanNvblwiXG5cblx0ZGVmIGRvY3Ncblx0XHRAZG9jc1xuXG5cdGRlZiBzZXR1cFxuXHRcdGxvYWRcblx0XHRzdXBlclxuXG5cdGRlZiBsb2FkXG5cdFx0dmFyIGRvY3MgPSBhd2FpdCBhcHAuZmV0Y2goc3JjKVxuXHRcdERPQ1MgPSBAZG9jcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG5cdFx0RE9DTUFQID0gQGRvY3M6ZW50aXRpZXNcblx0XHRnZW5lcmF0ZVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRsb2FkZWRcblxuXHRkZWYgbG9hZGVkXG5cdFx0cmVuZGVyXG5cdFx0aWYgZG9jdW1lbnQ6bG9jYXRpb246aGFzaFxuXHRcdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJlZm9jdXMgZVxuXHRcdHJlZm9jdXNcblxuXHRkZWYgcmVmb2N1c1xuXHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblxuXHRkZWYgbG9va3VwIHBhdGhcblx0XHRkb2NzOmVudGl0aWVzW3BhdGhdXG5cblx0ZGVmIGdlbmVyYXRlXG5cdFx0QHJvb3RzID0gW11cblx0XHR2YXIgZW50cyA9IEBkb2NzOmVudGl0aWVzXG5cblx0XHRmb3Igb3duIHBhdGgsaXRlbSBvZiBkb2NzOmVudGl0aWVzXG5cdFx0XHRpZiBpdGVtOnR5cGUgPT0gJ2NsYXNzJyBvciBwYXRoID09ICdJbWJhJ1xuXHRcdFx0XHRpdGVtWycuJ10gPSAoaXRlbVsnLiddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXHRcdFx0XHRpdGVtWycjJ10gPSAoaXRlbVsnIyddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXG5cdFx0XHRcdEByb290cy5wdXNoKGl0ZW0pIGlmIGl0ZW06ZGVzY1xuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRvY3Ncblx0XHRcblx0XHQ8c2VsZj5cblx0XHRcdDxuYXZAbmF2PiA8LmNvbnRlbnQ+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PEdyb3VwLnRvYy5jbGFzcy5zZWN0aW9uLmNvbXBhY3Q+XG5cdFx0XHRcdFx0XHQ8LmhlYWRlcj4gPExpbmtbcm9vdF0uY2xhc3M+XG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0XHRcdDwuc3RhdGljPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJy4nXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdFx0XHRcdFx0PC5pbnN0YW5jZT5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycjJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHQ8LmJvZHk+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PENsYXNzW3Jvb3RdLmRvYy5sPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0RvY3NQYWdlLmltYmEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbGVzcy9zaXRlLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=