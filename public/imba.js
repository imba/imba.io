(() => {
  // src/imba/core/imba.imba
  var $_parent$ = Symbol.for("#parent");
  var $_state$ = Symbol.for("#state");
  var $_window$ = Symbol.for("#window");
  var $_document$ = Symbol.for("#document");
  var $_imba$ = Symbol.for("#imba");
  var ImbaContext2 = class {
    constructor(parent, state = {}) {
      this[$_parent$] = parent;
      this[$_state$] = state;
      this;
    }
    get state() {
      return this[$_state$];
    }
    get version() {
      return "2.0.0-alpha.100";
    }
    get window() {
      return this[$_window$] || globalThis.window;
    }
    get document() {
      return this[$_document$] || globalThis.document;
    }
    get dom() {
      return this.window;
    }
    get clearInterval() {
      return globalThis.clearInterval;
    }
    get clearTimeout() {
      return globalThis.clearTimeout;
    }
    setTimeout(fn, ms) {
      var self = this;
      return setTimeout(function() {
        fn();
        self.commit();
        return;
      }, ms);
    }
    setInterval(fn, ms) {
      var self = this;
      return setInterval(function() {
        fn();
        self.commit();
        return;
      }, ms);
    }
    run(cb) {
      return cb();
    }
  };
  globalThis.ImbaContext = ImbaContext2;
  globalThis.imba = globalThis[$_imba$] = new ImbaContext2();

  // src/imba/core/dom.imba
  imba.mount = function(mountable, into) {
    let parent = into || document.body;
    let element2 = mountable;
    if (mountable instanceof Function) {
      let ctx = {_: parent};
      let tick = function() {
        imba.ctx = ctx;
        return mountable(ctx);
      };
      element2 = tick();
      imba.scheduler.listen("render", tick);
    } else {
      element2.__F |= 64;
    }
    ;
    return parent.appendChild(element2);
  };
  imba.unmount = function(node2) {
    throw "Not implemented";
    return true;
  };
  imba.getElementById = function(id) {
    return document.getElementById(id);
  };
  imba.q$ = function(query, ctx) {
    return (ctx instanceof window.Element ? ctx : document).querySelector(query);
  };
  imba.q$$ = function(query, ctx) {
    return (ctx instanceof window.Element ? ctx : document).querySelectorAll(query);
  };

  // src/imba/core/utils.imba
  var $___listeners__$ = Symbol.for("#__listeners__");
  var dashRegex = /-./g;
  imba.toCamelCase = function(str) {
    if (str.indexOf("-") >= 0) {
      return str.replace(dashRegex, function(_0) {
        return _0.charAt(1).toUpperCase();
      });
    } else {
      return str;
    }
    ;
  };
  var emit__ = function(event2, args, node2) {
    let prev;
    let cb;
    let ret;
    while ((prev = node2) && (node2 = node2.next)) {
      if (cb = node2.listener) {
        if (node2.path && cb[node2.path]) {
          ret = args ? cb[node2.path].apply(cb, args) : cb[node2.path]();
        } else {
          ret = args ? cb.apply(node2, args) : cb.call(node2);
        }
        ;
      }
      ;
      if (node2.times && --node2.times <= 0) {
        prev.next = node2.next;
        node2.listener = null;
      }
      ;
    }
    ;
    return;
  };
  imba.listen = function(obj, event2, listener, path) {
    var $0;
    let cbs;
    let list;
    let tail;
    cbs = obj[$___listeners__$] || (obj[$___listeners__$] = {});
    list = cbs[event2] || (cbs[event2] = {});
    tail = list.tail || (list.tail = list.next = {});
    tail.listener = listener;
    tail.path = path;
    list.tail = tail.next = {};
    return tail;
  };
  imba.once = function(obj, event2, listener) {
    let tail = imba.listen(obj, event2, listener);
    tail.times = 1;
    return tail;
  };
  imba.unlisten = function(obj, event2, cb, meth) {
    let node2;
    let prev;
    let meta = obj[$___listeners__$];
    if (!meta) {
      return;
    }
    ;
    if (node2 = meta[event2]) {
      while ((prev = node2) && (node2 = node2.next)) {
        if (node2 == cb || node2.listener == cb) {
          prev.next = node2.next;
          node2.listener = null;
          break;
        }
        ;
      }
      ;
    }
    ;
    return;
  };
  imba.emit = function(obj, event2, params) {
    let cb;
    if (cb = obj[$___listeners__$]) {
      if (cb[event2]) {
        emit__(event2, params, cb[event2]);
      }
      ;
      if (cb.all) {
        emit__(event2, [event2, params], cb.all);
      }
      ;
    }
    ;
    return;
  };

  // src/imba/core/scheduler.imba
  function extend$(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  function iter$(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var $_scheduler$ = Symbol.for("#scheduler");
  var raf = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : function(blk) {
    return setTimeout(blk, 1e3 / 60);
  };
  var ImbaScheduler = class {
    constructor() {
      var self = this;
      this.queue = [];
      this.stage = -1;
      this.batch = 0;
      this.scheduled = false;
      this.listeners = {};
      this.commit = function() {
        self.add("render");
        return self;
      };
      this.$promise = null;
      this.$resolve = null;
      this.$ticker = function(e) {
        self.scheduled = false;
        return self.tick(e);
      };
      this;
    }
    add(item, force) {
      if (force || this.queue.indexOf(item) == -1) {
        this.queue.push(item);
      }
      ;
      if (!this.scheduled) {
        this.schedule();
      }
      ;
      return this;
    }
    listen(ns, item) {
      var $0;
      ($0 = this.listeners)[ns] || ($0[ns] = new Set());
      return this.listeners[ns].add(item);
    }
    unlisten(ns, item) {
      return this.listeners[ns] && this.listeners[ns].delete(item);
    }
    get promise() {
      var self = this;
      return this.$promise || (this.$promise = new Promise(function(resolve) {
        return self.$resolve = resolve;
      }));
    }
    tick(timestamp) {
      var self = this;
      var items = this.queue;
      if (!this.ts) {
        this.ts = timestamp;
      }
      ;
      this.dt = timestamp - this.ts;
      this.ts = timestamp;
      this.queue = [];
      this.stage = 1;
      this.batch++;
      if (items.length) {
        for (let i = 0, $items = iter$(items), $len = $items.length; i < $len; i++) {
          let item = $items[i];
          if (typeof item === "string" && this.listeners[item]) {
            this.listeners[item].forEach(function(item2) {
              if (item2.tick instanceof Function) {
                return item2.tick(self);
              } else if (item2 instanceof Function) {
                return item2(self);
              }
              ;
            });
          } else if (item instanceof Function) {
            item(this.dt, this);
          } else if (item.tick) {
            item.tick(this.dt, this);
          }
          ;
        }
        ;
      }
      ;
      this.stage = 2;
      this.stage = this.scheduled ? 0 : -1;
      if (this.$promise) {
        this.$resolve(this);
        this.$promise = this.$resolve = null;
      }
      ;
      return this;
    }
    schedule() {
      if (!this.scheduled) {
        this.scheduled = true;
        if (this.stage == -1) {
          this.stage = 0;
        }
        ;
        raf(this.$ticker);
      }
      ;
      return this;
    }
  };
  globalThis.ImbaScheduler = ImbaScheduler;
  extend$(ImbaContext, {
    get scheduler() {
      return this[$_scheduler$] || (this[$_scheduler$] = new ImbaScheduler());
    },
    commit() {
      return this.scheduler.add("render").promise;
    }
  });

  // src/imba/core/styles.imba
  function extend$2(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var VALID_CSS_UNITS = {
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
    "%": 1,
    in: 1,
    turn: 1,
    grad: 1,
    rad: 1,
    deg: 1,
    Hz: 1,
    kHz: 1
  };
  var CSS_STR_PROPS = {
    prefix: 1,
    suffix: 1,
    content: 1
  };
  var CSS_PX_PROPS = /^([xyz])$/;
  var CSS_DIM_PROPS = /^([tlbr]|size|[whtlbr]|[mps][tlbrxy]?|[rcxy]?[gs])$/;
  var resets = "*,::before,::after {\nbox-sizing: border-box;\nborder-width: 0;\nborder-style: solid;\nborder-color: currentColor;\n}";
  var Styles = class {
    constructor() {
      this.entries = {};
    }
    register(id, styles2) {
      let entry = this.entries[id];
      if (!entry) {
        entry = this.entries[id] = {sourceId: id, css: styles2};
        if (!this.entries.resets) {
          this.register("resets", resets);
        }
        ;
        entry.node = document.createElement("style");
        entry.node.textContent = entry.css;
        document.head.appendChild(entry.node);
      } else if (entry) {
        entry.css = styles2;
        if (entry.node) {
          entry.node.textContent = styles2;
        }
        ;
      }
      ;
      return;
    }
    toString() {
      return Object.values(this.entries).map(function(_0) {
        return _0.css;
      }).join("\n\n");
    }
    toValue(value, unit, key) {
      if (CSS_STR_PROPS[key]) {
        value = String(value);
      }
      ;
      let typ = typeof value;
      if (typ == "number") {
        if (!unit) {
          if (CSS_PX_PROPS.test(key)) {
            unit = "px";
          } else if (CSS_DIM_PROPS.test(key)) {
            unit = "u";
          } else if (key == "rotate") {
            unit = "turn";
          }
          ;
        }
        ;
        if (unit) {
          if (VALID_CSS_UNITS[unit]) {
            return value + unit;
          } else if (unit == "u") {
            return value * 4 + "px";
          } else {
            return "calc(var(--u_" + unit + ",1px) * " + value + ")";
          }
          ;
        } else {
          true;
        }
        ;
      } else if (typ == "string" && key) {
        if (CSS_STR_PROPS[key] && value[0] != '"' && value[0] != "'") {
          if (value.indexOf('"') >= 0) {
            if (value.indexOf("'") == -1) {
              value = "'" + value + "'";
            } else {
              false;
            }
            ;
          } else {
            value = '"' + value + '"';
          }
          ;
        }
        ;
      }
      ;
      return value;
    }
    parseDimension(val) {
      if (typeof val == "string") {
        let [m, num, unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/);
        return [parseFloat(num), unit];
      } else if (typeof val == "number") {
        return [val];
      }
      ;
    }
  };
  extend$2(imba.dom.Element, {
    css$(key, value, mods) {
      return this.style[key] = value;
    },
    css$var(name, value, unit, key) {
      let cssval = globalThis.imba.styles.toValue(value, unit, key);
      this.style.setProperty(name, cssval);
      return;
    }
  });
  ImbaContext.prototype.styles = new Styles();

  // src/imba/dom/node.imba
  function extend$3(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var $_parent$2 = Symbol.for("#parent");
  var $_init$ = Symbol.for("#init");
  var $__parent$ = Symbol.for("##parent");
  var Node = window.Node;
  extend$3(Node, {
    get [$_parent$2]() {
      return this[$__parent$] || this.parentNode;
    },
    [$_init$]() {
      return this;
    },
    replaceWith$(other) {
      if (!(other instanceof Node) && other.replace$) {
        other.replace$(this);
      } else {
        this.parentNode.replaceChild(other, this);
      }
      ;
      return other;
    },
    insertInto$(parent) {
      parent.appendChild$(this);
      return this;
    },
    insertBefore$(el, prev) {
      return this.insertBefore(el, prev);
    },
    insertBeforeBegin$(other) {
      return this.parentNode.insertBefore(other, this);
    },
    insertAfterEnd$(other) {
      if (this.nextSibling) {
        return this.nextSibling.insertBeforeBegin$(other);
      } else {
        return this.parentNode.appendChild(other);
      }
      ;
    },
    insertAfterBegin$(other) {
      if (this.childNodes[0]) {
        return this.childNodes[0].insertBeforeBegin$(other);
      } else {
        return this.appendChild(other);
      }
      ;
    }
  });

  // src/imba/dom/comment.imba
  function extend$4(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  extend$4(imba.dom.Comment, {
    replaceWith$(other) {
      if (other && other.joinBefore$) {
        other.joinBefore$(this);
      } else {
        this.parentNode.insertBefore$(other, this);
      }
      ;
      this.parentNode.removeChild(this);
      return other;
    }
  });

  // src/imba/dom/element.imba
  function extend$5(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var {Node: Node2, Element, Comment, Text} = window;
  var doc = document;
  extend$5(Element, {
    log(...params) {
      console.log(...params);
      return this;
    },
    slot$(name, ctx) {
      return this;
    },
    text$(item) {
      this.textContent = item;
      return this;
    },
    insert$(item, f, prev) {
      let type = typeof item;
      if (type === "undefined" || item === null) {
        if (prev && prev instanceof Comment) {
          return prev;
        }
        ;
        let el = doc.createComment("");
        prev ? prev.replaceWith$(el) : el.insertInto$(this);
        return el;
      }
      ;
      if (item === prev) {
        return item;
      } else if (type !== "object") {
        let res;
        let txt = item;
        if (f & 128 && f & 256) {
          this.textContent = txt;
          return;
        }
        ;
        if (prev) {
          if (prev instanceof Text) {
            prev.textContent = txt;
            return prev;
          } else {
            res = doc.createTextNode(txt);
            prev.replaceWith$(res, this);
            return res;
          }
          ;
        } else {
          this.appendChild$(res = doc.createTextNode(txt));
          return res;
        }
        ;
      } else {
        prev ? prev.replaceWith$(item, this) : item.insertInto$(this);
        return item;
      }
      ;
      return;
    },
    open$() {
      return this;
    },
    close$() {
      return this;
    },
    end$() {
      if (this.render) {
        this.render();
      }
      ;
      return;
    }
  });
  Element.prototype.appendChild$ = Element.prototype.appendChild;
  Element.prototype.removeChild$ = Element.prototype.removeChild;
  Element.prototype.insertBefore$ = Element.prototype.insertBefore;
  Element.prototype.replaceChild$ = Element.prototype.replaceChild;
  Element.prototype.set$ = Element.prototype.setAttribute;
  Element.prototype.setns$ = Element.prototype.setAttributeNS;
  imba.createElement = function(name, parent, flags2, text) {
    let el = doc.createElement(name);
    if (flags2) {
      el.className = flags2;
    }
    ;
    if (text !== null) {
      el.text$(text);
    }
    ;
    if (parent && parent instanceof Node2) {
      el.insertInto$(parent);
    }
    ;
    return el;
  };

  // src/imba/dom/shadow.imba
  function extend$6(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var $_parent$3 = Symbol.for("#parent");
  var {Element: Element2, ShadowRoot} = imba.dom;
  ShadowRoot.prototype.insert$ = Element2.prototype.insert$;
  ShadowRoot.prototype.appendChild$ = Element2.prototype.appendChild$;
  extend$6(ShadowRoot, {
    get [$_parent$3]() {
      return this.host;
    }
  });

  // src/imba/dom/svg.imba
  function extend$7(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var {Node: Node3, SVGElement} = imba.dom;
  var descriptorCache = {};
  function getDescriptor(item, key, cache) {
    if (!item) {
      return cache[key] = null;
    }
    ;
    if (cache[key] !== void 0) {
      return cache[key];
    }
    ;
    let desc = Object.getOwnPropertyDescriptor(item, key);
    if (desc !== void 0 || item == SVGElement) {
      return cache[key] = desc || null;
    }
    ;
    return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
  }
  extend$7(SVGElement, {
    set$(key, value) {
      var $0;
      let cache = descriptorCache[$0 = this.nodeName] || (descriptorCache[$0] = {});
      let desc = getDescriptor(this, key, cache);
      if (!desc || !desc.set) {
        this.setAttribute(key, value);
      } else {
        this[key] = value;
      }
      ;
      return;
    }
  });
  extend$7(SVGElement, {
    flag$(str) {
      let ns = this.flags$ns;
      this.className.baseVal = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
      return;
    },
    flagSelf$(str) {
      var self = this;
      this.flag$ = function(str2) {
        return self.flagSync$(self.flags$ext = str2);
      };
      this.flagSelf$ = function(str2) {
        return self.flagSync$(self.flags$own = str2);
      };
      return this.flagSelf$(str);
    },
    flagSync$() {
      return this.className.baseVal = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
    }
  });
  imba.createSVGElement = function(name, parent, flags2, text, ctx) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (flags2) {
      if (false) {
      } else {
        el.className.baseVal = flags2;
      }
      ;
    }
    ;
    if (parent && parent instanceof Node3) {
      el.insertInto$(parent);
    }
    ;
    return el;
  };

  // src/imba/dom/fragment.imba
  function iter$2(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  function extend$8(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var $_parent$4 = Symbol.for("#parent");
  var $__up$ = Symbol.for("##up");
  var $__parent$2 = Symbol.for("##parent");
  var {Element: Element3, Text: Text2} = imba.dom;
  extend$8(imba.dom.DocumentFragment, {
    get [$_parent$4]() {
      return this[$__up$] || this[$__parent$2];
    },
    setup$(flags2, options) {
      this.$start = document.createComment("start");
      this.$end = document.createComment("end");
      this.$end.replaceWith$ = function(other) {
        this.parentNode.insertBefore(other, this);
        return other;
      };
      this.appendChild(this.$start);
      return this.appendChild(this.$end);
    },
    text$(item) {
      if (!this.$text) {
        this.$text = this.insert$(item);
      } else {
        this.$text.textContent = item;
      }
      ;
      return;
    },
    insert$(item, options, toReplace) {
      if (this[$__parent$2]) {
        return this[$__parent$2].insert$(item, options, toReplace || this.$end);
      } else {
        return Element3.prototype.insert$.call(this, item, options, toReplace || this.$end);
      }
      ;
    },
    insertInto$(parent, before) {
      if (!this[$__parent$2]) {
        this[$__parent$2] = parent;
        parent.appendChild$(this);
      }
      ;
      return this;
    },
    replaceWith$(other, parent) {
      this.$start.insertBeforeBegin$(other);
      var el = this.$start;
      while (el) {
        let next = el.nextSibling;
        this.appendChild(el);
        if (el == this.$end) {
          break;
        }
        ;
        el = next;
      }
      ;
      return other;
    },
    appendChild$(child) {
      this.$end ? this.$end.insertBeforeBegin$(child) : this.appendChild(child);
      return child;
    },
    removeChild$(child) {
      child.parentNode && child.parentNode.removeChild(child);
      return this;
    },
    isEmpty$() {
      let el = this.$start;
      let end = this.$end;
      while (el = el.nextSibling) {
        if (el == end) {
          break;
        }
        ;
        if (el instanceof Element3 || el instanceof Text2) {
          return false;
        }
        ;
      }
      ;
      return true;
    }
  });
  var VirtualFragment = class {
    constructor(f, parent) {
      this.__F = f;
      this[$_parent$4] = parent;
      if (!(f & 128) && this instanceof KeyedTagFragment) {
        this.$start = document.createComment("start");
        if (parent) {
          parent.appendChild$(this.$start);
        }
        ;
      }
      ;
      if (!(f & 256)) {
        this.$end = document.createComment("end");
        if (parent) {
          parent.appendChild$(this.$end);
        }
        ;
      }
      ;
      this.setup();
    }
    appendChild$(item, index) {
      if (this.$end && this[$_parent$4]) {
        this.$end.insertBeforeBegin$(item);
      } else if (this[$_parent$4]) {
        this[$_parent$4].appendChild$(item);
      }
      ;
      return;
    }
    replaceWith$(other) {
      this.detachNodes();
      this.$end.insertBeforeBegin$(other);
      this[$_parent$4].removeChild$(this.$end);
      this[$_parent$4] = null;
      return;
    }
    joinBefore$(before) {
      return this.insertInto$(before.parentNode, before);
    }
    insertInto$(parent, before) {
      if (!this[$_parent$4]) {
        this[$_parent$4] = parent;
        before ? before.insertBeforeBegin$(this.$end) : parent.appendChild$(this.$end);
        this.attachNodes();
      }
      ;
      return this;
    }
    replace$(other) {
      if (!this[$_parent$4]) {
        this[$_parent$4] = other.parentNode;
      }
      ;
      other.replaceWith$(this.$end);
      this.attachNodes();
      return this;
    }
    setup() {
      return this;
    }
  };
  var KeyedTagFragment = class extends VirtualFragment {
    setup() {
      this.array = [];
      this.changes = new Map();
      this.dirty = false;
      return this.$ = {};
    }
    push(item, idx) {
      if (!(this.__F & 1)) {
        this.array.push(item);
        this.appendChild$(item);
        return;
      }
      ;
      let toReplace = this.array[idx];
      if (toReplace === item) {
        true;
      } else {
        this.dirty = true;
        let prevIndex = this.array.indexOf(item);
        let changed = this.changes.get(item);
        if (prevIndex === -1) {
          this.array.splice(idx, 0, item);
          this.insertChild(item, idx);
        } else if (prevIndex === idx + 1) {
          if (toReplace) {
            this.changes.set(toReplace, -1);
          }
          ;
          this.array.splice(idx, 1);
        } else {
          if (prevIndex >= 0) {
            this.array.splice(prevIndex, 1);
          }
          ;
          this.array.splice(idx, 0, item);
          this.insertChild(item, idx);
        }
        ;
        if (changed == -1) {
          this.changes.delete(item);
        }
        ;
      }
      ;
      return;
    }
    insertChild(item, index) {
      if (index > 0) {
        let other = this.array[index - 1];
        other.insertAfterEnd$(item);
      } else if (this.$start) {
        this.$start.insertAfterEnd$(item);
      } else {
        this[$_parent$4].insertAfterBegin$(item);
      }
      ;
      return;
    }
    removeChild(item, index) {
      if (item.parentNode == this[$_parent$4]) {
        this[$_parent$4].removeChild(item);
      }
      ;
      return;
    }
    attachNodes() {
      for (let i = 0, $items = iter$2(this.array), $len = $items.length; i < $len; i++) {
        let item = $items[i];
        this.$end.insertBeforeBegin$(item);
      }
      ;
      return;
    }
    detachNodes() {
      for (let $i = 0, $items = iter$2(this.array), $len = $items.length; $i < $len; $i++) {
        let item = $items[$i];
        this[$_parent$4].removeChild(item);
      }
      ;
      return;
    }
    end$(index) {
      var self = this;
      if (!(this.__F & 1)) {
        this.__F |= 1;
        return;
      }
      ;
      if (this.dirty) {
        this.changes.forEach(function(pos, item) {
          if (pos == -1) {
            return self.removeChild(item);
          }
          ;
        });
        this.changes.clear();
        this.dirty = false;
      }
      ;
      if (this.array.length > index) {
        while (this.array.length > index) {
          let item = this.array.pop();
          this.removeChild(item);
        }
        ;
      }
      ;
      return;
    }
  };
  var IndexedTagFragment = class extends VirtualFragment {
    setup() {
      this.$ = [];
      return this.length = 0;
    }
    end$(len) {
      let from = this.length;
      if (from == len || !this[$_parent$4]) {
        return;
      }
      ;
      let array = this.$;
      let par = this[$_parent$4];
      if (from > len) {
        while (from > len) {
          par.removeChild$(array[--from]);
        }
        ;
      } else if (len > from) {
        while (len > from) {
          this.appendChild$(array[from++]);
        }
        ;
      }
      ;
      this.length = len;
      return;
    }
    attachNodes() {
      for (let i = 0, $items = iter$2(this.$), $len = $items.length; i < $len; i++) {
        let item = $items[i];
        if (i == this.length) {
          break;
        }
        ;
        this.$end.insertBeforeBegin$(item);
      }
      ;
      return;
    }
    detachNodes() {
      let i = 0;
      while (i < this.length) {
        let item = this.$[i++];
        this[$_parent$4].removeChild$(item);
      }
      ;
      return;
    }
  };
  imba.createLiveFragment = function(bitflags, options, par) {
    var el = document.createDocumentFragment();
    el.setup$(bitflags, options);
    if (par) {
      el[$__up$] = par;
    }
    ;
    return el;
  };
  imba.createIndexedFragment = function(bitflags, parent) {
    return new IndexedTagFragment(bitflags, parent);
  };
  imba.createKeyedFragment = function(bitflags, parent) {
    return new KeyedTagFragment(bitflags, parent);
  };

  // src/imba/dom/context.imba
  function extend$9(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var $_context$ = Symbol.for("#context");
  var $_parent$5 = Symbol.for("#parent");
  var $__context$ = Symbol.for("##context");
  var handler = {
    get(target, name) {
      let ctx = target;
      let val = void 0;
      while (ctx && val == void 0) {
        if (ctx = ctx[$_parent$5]) {
          val = ctx[name];
        }
        ;
      }
      ;
      return val;
    }
  };
  extend$9(imba.dom.Node, {
    get $context() {
      return console.warn("$context is deprecated - use #context instead");
    },
    get [$_context$]() {
      return this[$__context$] || (this[$__context$] = new Proxy(this, handler));
    }
  });

  // src/imba/dom/component.imba
  var $_init$2 = Symbol.for("#init");
  var $__parent$3 = Symbol.for("##parent");
  var DOM = imba.dom;
  var doc2 = imba.document;
  window.ImbaElement = class ImbaElement extends window.HTMLElement {
    constructor() {
      super();
      if (this.flags$ns) {
        this.flag$ = this.flagExt$;
      }
      ;
      this.setup$();
      this.build();
    }
    setup$() {
      this.__slots = {};
      return this.__F = 0;
    }
    [$_init$2]() {
      this.__F |= 1 | 2;
      return this;
    }
    flag$(str) {
      this.className = this.flags$ext = str;
      return;
    }
    slot$(name, ctx) {
      var $0;
      if (name == "__" && !this.render) {
        return this;
      }
      ;
      return ($0 = this.__slots)[name] || ($0[name] = imba.createLiveFragment(0, null, this));
    }
    build() {
      return this;
    }
    awaken() {
      return this;
    }
    mount() {
      return this;
    }
    unmount() {
      return this;
    }
    rendered() {
      return this;
    }
    dehydrate() {
      return this;
    }
    hydrate() {
      this.autoschedule = true;
      return this;
    }
    tick() {
      return this.commit();
    }
    visit() {
      return this.commit();
    }
    commit() {
      if (!this.isRender) {
        return this;
      }
      ;
      this.__F |= 256;
      this.render && this.render();
      this.rendered();
      return this.__F = (this.__F | 512) & ~256;
    }
    get autoschedule() {
      return (this.__F & 64) != 0;
    }
    set autoschedule(value) {
      value ? this.__F |= 64 : this.__F &= ~64;
    }
    get isRender() {
      return true;
    }
    get isMounting() {
      return (this.__F & 16) != 0;
    }
    get isMounted() {
      return (this.__F & 32) != 0;
    }
    get isAwakened() {
      return (this.__F & 8) != 0;
    }
    get isRendered() {
      return (this.__F & 512) != 0;
    }
    get isRendering() {
      return (this.__F & 256) != 0;
    }
    get isScheduled() {
      return (this.__F & 128) != 0;
    }
    get isHydrated() {
      return (this.__F & 2) != 0;
    }
    schedule() {
      imba.scheduler.listen("render", this);
      this.__F |= 128;
      return this;
    }
    unschedule() {
      imba.scheduler.unlisten("render", this);
      this.__F &= ~128;
      return this;
    }
    end$() {
      return this.visit();
    }
    connectedCallback() {
      let flags2 = this.__F;
      let inited = flags2 & 1;
      let awakened = flags2 & 8;
      if (flags2 & (16 | 32)) {
        return;
      }
      ;
      this.__F |= 16;
      if (!inited) {
        this[$_init$2]();
      }
      ;
      if (!(flags2 & 2)) {
        this.flags$ext = this.className;
        this.hydrate();
        this.__F |= 2;
        this.commit();
      }
      ;
      if (!awakened) {
        this.awaken();
        this.__F |= 8;
      }
      ;
      let res = this.mount();
      if (res && res.then instanceof Function) {
        res.then(imba.scheduler.commit);
      }
      ;
      flags2 = this.__F = (this.__F | 32) & ~16;
      if (flags2 & 64) {
        this.schedule();
      }
      ;
      return this;
    }
    disconnectedCallback() {
      this.__F = this.__F & (~32 & ~16);
      if (this.__F & 128) {
        this.unschedule();
      }
      ;
      return this.unmount();
    }
  };
  var CustomTagConstructors = {};
  var ImbaElementRegistry = class {
    constructor() {
      this.types = {};
    }
    lookup(name) {
      return this.types[name];
    }
    get(name, klass) {
      if (!name || name == "component") {
        return DOM.ImbaElement;
      }
      ;
      if (this.types[name]) {
        return this.types[name];
      }
      ;
      if (false) {
      }
      ;
      if (klass && DOM[klass]) {
        return DOM[klass];
      }
      ;
      return DOM.customElements.get(name) || DOM.ImbaElement;
    }
    create(name) {
      if (this.types[name]) {
        return this.types[name].create$();
      } else {
        return doc2.createElement(name);
      }
      ;
    }
    define(name, klass, options = {}) {
      this.types[name] = klass;
      klass.nodeName = name;
      let proto2 = klass.prototype;
      let basens = proto2._ns_;
      if (options.ns) {
        let ns = options.ns;
        let flags2 = ns + " " + ns + "_ ";
        if (basens) {
          flags2 += proto2.flags$ns;
          ns += " " + basens;
        }
        ;
        proto2._ns_ = ns;
        proto2.flags$ns = flags2;
      }
      ;
      if (options.extends) {
        CustomTagConstructors[name] = klass;
      } else {
        DOM.customElements.define(name, klass);
      }
      ;
      return klass;
    }
  };
  imba.tags = new ImbaElementRegistry();
  var proto = window.ImbaElement.prototype;
  imba.createComponent = function(name, parent, flags2, text, ctx) {
    var el;
    if (typeof name != "string") {
      if (name && name.nodeName) {
        name = name.nodeName;
      }
      ;
    }
    ;
    if (CustomTagConstructors[name]) {
      el = CustomTagConstructors[name].create$(el);
      el.slot$ = proto.slot$;
      el.__slots = {};
    } else {
      el = doc2.createElement(name);
    }
    ;
    el[$__parent$3] = parent;
    el[$_init$2]();
    if (text !== null) {
      el.slot$("__").text$(text);
    }
    ;
    if (flags2 || el.flags$ns) {
      el.flag$(flags2 || "");
    }
    ;
    return el;
  };

  // src/imba/dom/flags.imba
  function extend$10(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var {Element: Element4} = imba.dom;
  var Flags = class {
    constructor(dom2) {
      this.dom = dom2;
      this.string = "";
    }
    contains(ref) {
      return this.dom.classList.contains(ref);
    }
    add(ref) {
      if (this.contains(ref)) {
        return this;
      }
      ;
      this.string += (this.string ? " " : "") + ref;
      this.dom.classList.add(ref);
      return this;
    }
    remove(ref) {
      if (!this.contains(ref)) {
        return this;
      }
      ;
      var regex = new RegExp("(^|\\s)*" + ref + "(\\s|$)*", "g");
      this.string = this.string.replace(regex, "");
      this.dom.classList.remove(ref);
      return this;
    }
    toggle(ref, bool) {
      if (bool === void 0) {
        bool = !this.contains(ref);
      }
      ;
      return bool ? this.add(ref) : this.remove(ref);
    }
    incr(ref) {
      let m = this.stacks || (this.stacks = {});
      let c = m[ref] || 0;
      if (c < 1) {
        this.add(ref);
      }
      ;
      m[ref] = Math.max(c, 0) + 1;
      return this;
    }
    decr(ref) {
      let m = this.stacks || (this.stacks = {});
      let c = m[ref] || 0;
      if (c == 1) {
        this.remove(ref);
      }
      ;
      m[ref] = Math.max(c, 1) - 1;
      return this;
    }
    valueOf() {
      return this.string;
    }
    toString() {
      return this.string;
    }
    sync() {
      return this.dom.flagSync$();
    }
  };
  extend$10(Element4, {
    get flags() {
      if (!this.$flags) {
        this.$flags = new Flags(this);
        if (this.flag$ == Element4.prototype.flag$) {
          this.flags$ext = this.className;
        }
        ;
        this.flagDeopt$();
      }
      ;
      return this.$flags;
    },
    flag$(str) {
      let ns = this.flags$ns;
      this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
      return;
    },
    flagDeopt$() {
      var self = this;
      this.flag$ = this.flagExt$;
      this.flagSelf$ = function(str) {
        return self.flagSync$(self.flags$own = str);
      };
      return;
    },
    flagExt$(str) {
      return this.flagSync$(this.flags$ext = str);
    },
    flagSelf$(str) {
      this.flagDeopt$();
      return this.flagSelf$(str);
    },
    flagSync$() {
      return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
    }
  });

  // src/imba/dom/bind.imba
  function iter$3(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  function extend$11(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var toBind = {
    INPUT: true,
    SELECT: true,
    TEXTAREA: true,
    BUTTON: true
  };
  var isGroup = function(obj) {
    return obj instanceof Array || obj && obj.has instanceof Function;
  };
  var bindHas = function(object, value) {
    if (object == value) {
      return true;
    } else if (object instanceof Array) {
      return object.indexOf(value) >= 0;
    } else if (object && object.has instanceof Function) {
      return object.has(value);
    } else if (object && object.contains instanceof Function) {
      return object.contains(value);
    } else {
      return false;
    }
    ;
  };
  var bindAdd = function(object, value) {
    if (object instanceof Array) {
      return object.push(value);
    } else if (object && object.add instanceof Function) {
      return object.add(value);
    }
    ;
  };
  var bindRemove = function(object, value) {
    if (object instanceof Array) {
      let idx = object.indexOf(value);
      if (idx >= 0) {
        return object.splice(idx, 1);
      }
      ;
    } else if (object && object.delete instanceof Function) {
      return object.delete(value);
    }
    ;
  };
  function createProxyProperty(target) {
    function getter() {
      return target[0] ? target[0][target[1]] : void 0;
    }
    ;
    function setter(v) {
      return target[0] ? target[0][target[1]] = v : null;
    }
    ;
    return {
      get: getter,
      set: setter
    };
  }
  extend$11(imba.dom.Element, {
    getRichValue() {
      return this.value;
    },
    setRichValue(value) {
      return this.value = value;
    },
    bind$(key, value) {
      let o = value || [];
      if (key == "data" && !this.$$bound && toBind[this.nodeName]) {
        this.$$bound = true;
        if (this.change$) {
          this.addEventListener("change", this.change$ = this.change$.bind(this));
        }
        ;
        if (this.input$) {
          this.addEventListener("input", this.input$ = this.input$.bind(this), {capture: true});
        }
        ;
        if (this.click$) {
          this.addEventListener("click", this.click$ = this.click$.bind(this), {capture: true});
        }
        ;
      }
      ;
      Object.defineProperty(this, key, o instanceof Array ? createProxyProperty(o) : o);
      return o;
    }
  });
  Object.defineProperty(imba.dom.Element.prototype, "richValue", {
    get: function() {
      return this.getRichValue();
    },
    set: function(v) {
      return this.setRichValue(v);
    }
  });
  extend$11(imba.dom.HTMLSelectElement, {
    change$(e) {
      let model = this.data;
      let prev = this.$$value;
      this.$$value = void 0;
      let values = this.getRichValue();
      if (this.multiple) {
        if (prev) {
          for (let $i = 0, $items = iter$3(prev), $len = $items.length; $i < $len; $i++) {
            let value = $items[$i];
            if (values.indexOf(value) != -1) {
              continue;
            }
            ;
            bindRemove(model, value);
          }
          ;
        }
        ;
        for (let $i = 0, $items = iter$3(values), $len = $items.length; $i < $len; $i++) {
          let value = $items[$i];
          if (!prev || prev.indexOf(value) == -1) {
            bindAdd(model, value);
          }
          ;
        }
        ;
      } else {
        this.data = values[0];
      }
      ;
      imba.commit();
      return this;
    },
    getRichValue() {
      var $res;
      if (this.$$value) {
        return this.$$value;
      }
      ;
      $res = [];
      for (let $i = 0, $items = iter$3(this.selectedOptions), $len = $items.length; $i < $len; $i++) {
        let o = $items[$i];
        $res.push(o.richValue);
      }
      ;
      return this.$$value = $res;
    },
    syncValue() {
      let model = this.data;
      if (this.multiple) {
        let vals = [];
        for (let i = 0, $items = iter$3(this.options), $len = $items.length; i < $len; i++) {
          let option = $items[i];
          let val = option.richValue;
          let sel = bindHas(model, val);
          option.selected = sel;
          if (sel) {
            vals.push(val);
          }
          ;
        }
        ;
        this.$$value = vals;
      } else {
        for (let i = 0, $items = iter$3(this.options), $len = $items.length; i < $len; i++) {
          let option = $items[i];
          let val = option.richValue;
          if (val == model) {
            this.$$value = [val];
            this.selectedIndex = i;
            break;
          }
          ;
        }
        ;
      }
      ;
      return;
    },
    end$() {
      return this.syncValue();
    }
  });
  extend$11(imba.dom.HTMLOptionElement, {
    setRichValue(value) {
      this.$$value = value;
      return this.value = value;
    },
    getRichValue() {
      if (this.$$value !== void 0) {
        return this.$$value;
      }
      ;
      return this.value;
    }
  });
  extend$11(imba.dom.HTMLTextAreaElement, {
    setRichValue(value) {
      this.$$value = value;
      return this.value = value;
    },
    getRichValue() {
      if (this.$$value !== void 0) {
        return this.$$value;
      }
      ;
      return this.value;
    },
    input$(e) {
      this.data = this.value;
      return imba.commit();
    },
    end$() {
      if (this.$$bound && this.value != this.data) {
        return this.value = this.data;
      }
      ;
    }
  });
  extend$11(imba.dom.HTMLInputElement, {
    input$(e) {
      let typ = this.type;
      if (typ == "checkbox" || typ == "radio") {
        return;
      }
      ;
      this.$$value = void 0;
      this.data = this.richValue;
      return imba.commit();
    },
    change$(e) {
      let model = this.data;
      let val = this.richValue;
      if (this.type == "checkbox" || this.type == "radio") {
        let checked = this.checked;
        if (isGroup(model)) {
          checked ? bindAdd(model, val) : bindRemove(model, val);
        } else {
          this.data = checked ? val : false;
        }
        ;
      }
      ;
      return imba.commit();
    },
    setRichValue(value) {
      if (this.$$value !== value) {
        this.$$value = value;
        if (this.value !== value) {
          this.value = value;
        }
        ;
      }
      ;
      return;
    },
    getRichValue() {
      if (this.$$value !== void 0) {
        return this.$$value;
      }
      ;
      let value = this.value;
      let typ = this.type;
      if (typ == "range" || typ == "number") {
        value = this.valueAsNumber;
        if (Number.isNaN(value)) {
          value = null;
        }
        ;
      } else if (typ == "checkbox") {
        if (value == void 0 || value === "on") {
          value = true;
        }
        ;
      }
      ;
      return value;
    },
    end$() {
      if (this.$$bound) {
        let typ = this.type;
        if (typ == "checkbox" || typ == "radio") {
          let val = this.data;
          if (val === true || val === false || val == null) {
            this.checked = !!val;
          } else {
            this.checked = bindHas(val, this.richValue);
          }
          ;
        } else {
          this.richValue = this.data;
        }
        ;
      }
      ;
      return;
    }
  });
  extend$11(imba.dom.HTMLButtonElement, {
    get checked() {
      return this.$checked;
    },
    set checked(val) {
      if (val != this.$checked) {
        this.$checked = val;
        this.flags.toggle("checked", !!val);
      }
      ;
    },
    setRichValue(value) {
      this.$$value = value;
      return this.value = value;
    },
    getRichValue() {
      if (this.$$value !== void 0) {
        return this.$$value;
      }
      ;
      return this.value;
    },
    click$(e) {
      let data = this.data;
      let toggled = this.checked;
      let val = this.richValue;
      if (isGroup(data)) {
        toggled ? bindRemove(data, val) : bindAdd(data, val);
      } else {
        this.data = toggled ? null : val;
      }
      ;
      this.end$();
      return imba.commit();
    },
    end$() {
      if (this.$$bound) {
        let val = this.data;
        if (val === true || val === false || val == null) {
          this.checked = !!val;
        } else {
          this.checked = bindHas(val, this.richValue);
        }
        ;
      }
      ;
      return;
    }
  });

  // src/imba/dom/event.imba
  function extend$12(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  function iter$4(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var {Event, Element: Element5} = imba.dom;
  var keyCodes = {
    esc: [27],
    tab: [9],
    enter: [13],
    space: [32],
    up: [38],
    down: [40],
    left: [37],
    right: [39],
    del: [8, 46]
  };
  Event.log$mod = function(...params) {
    console.log(...params);
    return true;
  };
  Event.sel$mod = function(expr) {
    return !!this.event.target.matches(String(expr));
  };
  Event.if$mod = function(expr) {
    return !!expr;
  };
  Event.wait$mod = function(num = 250) {
    return new Promise(function(_0) {
      return setTimeout(_0, num);
    });
  };
  Event.self$mod = function() {
    return this.event.target == this.element;
  };
  Event.throttle$mod = function(ms = 250) {
    var self = this;
    if (this.handler.throttled) {
      return false;
    }
    ;
    this.handler.throttled = true;
    this.element.flags.incr("throttled");
    imba.once(this.current, "end", function() {
      return setTimeout(function() {
        self.element.flags.decr("throttled");
        return self.handler.throttled = false;
      }, ms);
    });
    return true;
  };
  Event.flag$mod = function(name, sel) {
    let el = sel instanceof imba.dom.Element ? sel : sel ? this.element.closest(sel) : this.element;
    if (!el) {
      return true;
    }
    ;
    let step = this.step;
    this.state[step] = this.id;
    el.flags.incr(name);
    let ts = Date.now();
    imba.once(this.current, "end", function() {
      let elapsed = Date.now() - ts;
      let delay = Math.max(250 - elapsed, 0);
      return setTimeout(function() {
        return el.flags.decr(name);
      }, delay);
    });
    return true;
  };
  Event.busy$mod = function(sel) {
    return Event.flag$mod.call(this, "busy", 250, sel);
  };
  Event.mod$mod = function(name) {
    return Event.flag$mod.call(this, "mod-" + name, document.documentElement);
  };
  var EventHandler = class {
    constructor(params, closure) {
      this.params = params;
      this.closure = closure;
    }
    getHandlerForMethod(el, name) {
      if (!el) {
        return null;
      }
      ;
      return el[name] ? el : this.getHandlerForMethod(el.parentNode, name);
    }
    emit(name, ...params) {
      return imba.emit(this, name, params);
    }
    on(name, ...params) {
      return imba.listen(this, name, ...params);
    }
    once(name, ...params) {
      return imba.once(this, name, ...params);
    }
    un(name, ...params) {
      return imba.unlisten(this, name, ...params);
    }
    async handleEvent(event2) {
      var target = event2.target;
      var element2 = event2.currentTarget;
      var mods = this.params;
      var i = 0;
      let commit = true;
      let awaited = false;
      let prevRes = void 0;
      this.count || (this.count = 0);
      this.state || (this.state = {});
      let state = {
        element: element2,
        event: event2,
        modifiers: mods,
        handler: this,
        id: ++this.count,
        step: -1,
        state: this.state,
        current: null
      };
      state.current = state;
      if (event2.handle$mod) {
        if (event2.handle$mod.apply(state, mods.options || []) == false) {
          return;
        }
        ;
      }
      ;
      let guard = Event[this.type + "$handle"] || Event[event2.type + "$handle"] || event2.handle$mod;
      if (guard && guard.apply(state, mods.options || []) == false) {
        return;
      }
      ;
      this.currentEvents || (this.currentEvents = new Set());
      this.currentEvents.add(event2);
      for (let $i = 0, $keys = Object.keys(mods), $l = $keys.length, handler2, val; $i < $l; $i++) {
        handler2 = $keys[$i];
        val = mods[handler2];
        state.step++;
        if (handler2[0] == "_") {
          continue;
        }
        ;
        if (handler2.indexOf("~") > 0) {
          handler2 = handler2.split("~")[0];
        }
        ;
        let modargs = null;
        let args = [event2, state];
        let res = void 0;
        let context2 = null;
        let m;
        let isstring = typeof handler2 == "string";
        if (handler2[0] == "$" && handler2[1] == "_" && val[0] instanceof Function) {
          handler2 = val[0];
          args = [event2, state].concat(val.slice(1));
          context2 = element2;
        } else if (val instanceof Array) {
          args = val.slice();
          modargs = args;
          for (let i2 = 0, $items = iter$4(args), $len = $items.length; i2 < $len; i2++) {
            let par = $items[i2];
            if (typeof par == "string" && par[0] == "~" && par[1] == "$") {
              let name = par.slice(2);
              let chain = name.split(".");
              let value = state[chain.shift()] || event2;
              for (let i3 = 0, $ary = iter$4(chain), $len2 = $ary.length; i3 < $len2; i3++) {
                let part = $ary[i3];
                value = value ? value[part] : void 0;
              }
              ;
              args[i2] = value;
            }
            ;
          }
          ;
        }
        ;
        if (typeof handler2 == "string" && (m = handler2.match(/^(emit|flag|mod|moved|pin|fit|refit|map|remap)-(.+)$/))) {
          if (!modargs) {
            modargs = args = [];
          }
          ;
          args.unshift(m[2]);
          handler2 = m[1];
        }
        ;
        if (handler2 == "stop") {
          event2.stopImmediatePropagation();
        } else if (handler2 == "prevent") {
          event2.preventDefault();
        } else if (handler2 == "commit") {
          commit = true;
        } else if (handler2 == "silence" || handler2 == "silent") {
          commit = false;
        } else if (handler2 == "ctrl") {
          if (!event2.ctrlKey) {
            break;
          }
          ;
        } else if (handler2 == "alt") {
          if (!event2.altKey) {
            break;
          }
          ;
        } else if (handler2 == "shift") {
          if (!event2.shiftKey) {
            break;
          }
          ;
        } else if (handler2 == "meta") {
          if (!event2.metaKey) {
            break;
          }
          ;
        } else if (handler2 == "once") {
          element2.removeEventListener(event2.type, this);
        } else if (handler2 == "options") {
          continue;
        } else if (keyCodes[handler2]) {
          if (keyCodes[handler2].indexOf(event2.keyCode) < 0) {
            break;
          }
          ;
        } else if (handler2 == "emit") {
          let name = args[0];
          let detail = args[1];
          let e = new CustomEvent(name, {bubbles: true, detail});
          e.originalEvent = event2;
          let customRes = element2.dispatchEvent(e);
        } else if (typeof handler2 == "string") {
          let fn = this.type && Event[this.type + "$" + handler2 + "$mod"];
          fn || (fn = event2[handler2 + "$mod"] || Event[event2.type + "$" + handler2] || Event[handler2 + "$mod"]);
          if (fn instanceof Function) {
            handler2 = fn;
            context2 = state;
            args = modargs || [];
          } else if (handler2[0] == "_") {
            handler2 = handler2.slice(1);
            context2 = this.closure;
          } else {
            context2 = this.getHandlerForMethod(element2, handler2);
          }
          ;
        }
        ;
        if (handler2 instanceof Function) {
          res = handler2.apply(context2 || element2, args);
        } else if (context2) {
          res = context2[handler2].apply(context2, args);
        }
        ;
        if (res && res.then instanceof Function && res != imba.scheduler.$promise) {
          if (commit) {
            imba.scheduler.commit();
          }
          ;
          awaited = true;
          res = await res;
        }
        ;
        if (res === false) {
          break;
        }
        ;
        state.value = res;
      }
      ;
      imba.emit(state, "end", state);
      if (commit) {
        imba.scheduler.commit();
      }
      ;
      this.currentEvents.delete(event2);
      if (this.currentEvents.size == 0) {
        this.emit("idle");
      }
      ;
      return;
    }
  };
  extend$12(Element5, {
    emit(name, detail, o = {bubbles: true}) {
      if (detail != void 0) {
        o.detail = detail;
      }
      ;
      let event2 = new CustomEvent(name, o);
      let res = this.dispatchEvent(event2);
      return event2;
    },
    on$(type, mods, scope) {
      let check = "on$" + type;
      let handler2;
      if (this[check] instanceof Function) {
        handler2 = this[check](mods, scope);
      }
      ;
      handler2 = new EventHandler(mods, scope);
      let capture = mods.capture;
      let passive = mods.passive;
      let o = capture;
      if (passive) {
        o = {passive, capture};
      }
      ;
      if (/^(pointerdrag|touch)$/.test(type)) {
        handler2.type = type;
        type = "pointerdown";
      }
      ;
      this.addEventListener(type, handler2, o);
      return handler2;
    }
  });

  // src/imba/dom/asset.imba
  var assets = {};
  var ext = imba.assets || (imba.assets = {});
  var Node4 = window.Node;
  ext.register = function(name, asset2) {
    assets[name] = asset2;
    return this;
  };
  ext.create = function(name, parent, flags2) {
    let asset2 = assets[name];
    if (!asset2) {
      console.warn("asset " + name + " not included in bundle");
    }
    ;
    if (false) {
    }
    ;
    if (!asset2) {
      return null;
    }
    ;
    if (!asset2.node) {
      let el2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      for (let $o = asset2.attributes, $i = 0, $keys = Object.keys($o), $l = $keys.length, k, v; $i < $l; $i++) {
        k = $keys[$i];
        v = $o[k];
        el2.setAttribute(k, v);
      }
      ;
      el2.innerHTML = asset2.content;
      el2.className.baseVal = asset2.flags.join(" ");
      asset2.node = el2;
    }
    ;
    let el = asset2.node.cloneNode(true);
    let cls = el.flags$ns = el.className.baseVal + " ";
    el.className.baseVal = cls + flags2;
    if (parent && parent instanceof Node4) {
      el.insertInto$(parent);
    }
    ;
    return el;
    return null;
  };
  ImbaContext.prototype.registerAsset = ext.register;
  ImbaContext.prototype.createAssetElement = ext.create;

  // src/imba/dom/events/pointer.imba
  function extend$13(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  var {Event: Event2, PointerEvent, Element: Element6} = imba.dom;
  function round(val, step = 1) {
    let inv = 1 / step;
    return Math.round(val * inv) / inv;
  }
  function clamp(val, min, max) {
    if (min > max) {
      return Math.max(max, Math.min(min, val));
    } else {
      return Math.min(max, Math.max(min, val));
    }
    ;
  }
  function parseDimension(val) {
    if (typeof val == "string") {
      let [m, num, unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/);
      return [parseFloat(num), unit];
    } else if (typeof val == "number") {
      return [val];
    }
    ;
  }
  function scale(a0, a1, b0r, b1r, s = 0.1) {
    let [b0, b0u] = parseDimension(b0r);
    let [b1, b1u] = parseDimension(b1r);
    let [sv, su] = parseDimension(s);
    if (b0u == "%") {
      b0 = (a1 - a0) * (b0 / 100);
    }
    ;
    if (b1u == "%") {
      b1 = (a1 - a0) * (b1 / 100);
    }
    ;
    if (su == "%") {
      sv = (b1 - b0) * (sv / 100);
    }
    ;
    return function(value, fit) {
      let pct = (value - a0) / (a1 - a0);
      let val = b0 + (b1 - b0) * pct;
      if (s) {
        val = round(val, sv);
      }
      ;
      if (fit) {
        val = clamp(val, b0, b1);
      }
      ;
      return val;
    };
  }
  extend$13(PointerEvent, {
    primary$mod() {
      return !!this.event.isPrimary;
    },
    mouse$mod() {
      return this.event.pointerType == "mouse";
    },
    pen$mod() {
      return this.event.pointerType == "pen";
    },
    touch$mod() {
      return this.event.pointerType == "touch";
    },
    pressure$mod(threshold = 0) {
      return this.event.pressure > threshold;
    },
    lock$mod(dr) {
      return true;
    }
  });
  var Touch = class {
    constructor(e, handler2, el) {
      this.phase = "init";
      this.events = [];
      this.event = e;
      this.handler = handler2;
      this.target = this.currentTarget = el;
    }
    set event(value) {
      this.x = value.clientX;
      this.y = value.clientY;
      this.events.push(value);
    }
    get start() {
      return this.events[0];
    }
    get event() {
      return this.events[this.events.length - 1];
    }
    get elapsed() {
      return this.event.timeStamp - this.events[0].timeStamp;
    }
    get pointerId() {
      return this.event.pointerId;
    }
    get clientX() {
      return this.event.clientX;
    }
    get clientY() {
      return this.event.clientY;
    }
    get offsetX() {
      return this.event.offsetX;
    }
    get offsetY() {
      return this.event.offsetY;
    }
    get type() {
      return this.event.type;
    }
    emit(name, ...params) {
      return imba.emit(this, name, params);
    }
    on(name, ...params) {
      return imba.listen(this, name, ...params);
    }
    once(name, ...params) {
      return imba.once(this, name, ...params);
    }
    un(name, ...params) {
      return imba.unlisten(this, name, ...params);
    }
  };
  Event2.touch$in$mod = function() {
    return Event2.touch$reframe$mod.apply(this, arguments);
  };
  Event2.touch$fit$mod = function() {
    var $1, $0;
    let o = ($1 = this.state)[$0 = this.step] || ($1[$0] = {clamp: true});
    return Event2.touch$reframe$mod.apply(this, arguments);
  };
  Event2.touch$snap$mod = function(sx = 1, sy = sx) {
    this.event.x = round(this.event.x, sx);
    this.event.y = round(this.event.y, sy);
    return true;
  };
  Event2.touch$moved$mod = function(a, b) {
    var self = this, $1, $0;
    let o = ($1 = this.state)[$0 = this.step] || ($1[$0] = {});
    if (!o.setup) {
      let th2 = a || 4;
      if (typeof a == "string" && a.match(/^(up|down|left|right|x|y)$/)) {
        o.dir = a;
        th2 = b || 4;
      }
      ;
      o.setup = true;
      let [tv, tu] = parseDimension(th2);
      o.threshold = tv;
      o.sy = tv;
      o.x0 = this.event.x;
      o.y0 = this.event.y;
      if (tu && tu != "px") {
        console.warn("only px threshold allowed in @touch.moved");
      }
      ;
    }
    ;
    if (o.active) {
      return true;
    }
    ;
    let th = o.threshold;
    let dx = this.event.x - o.x0;
    let dy = this.event.y - o.y0;
    let hit = false;
    if (dx > th && (o.dir == "right" || o.dir == "x")) {
      hit = true;
    }
    ;
    if (!hit && dx < -th && (o.dir == "left" || o.dir == "x")) {
      hit = true;
    }
    ;
    if (!hit && dy > th && (o.dir == "down" || o.dir == "y")) {
      hit = true;
    }
    ;
    if (!hit && dy < -th && (o.dir == "up" || o.dir == "y")) {
      hit = true;
    }
    ;
    if (!hit) {
      let dr = Math.sqrt(dx * dx + dy * dy);
      if (dr > th && !o.dir) {
        hit = true;
      }
      ;
    }
    ;
    if (hit) {
      o.active = true;
      let pinned = this.state.pinTarget;
      this.element.flags.incr("_move_");
      if (pinned) {
        pinned.flags.incr("_move_");
      }
      ;
      imba.once(this.current, "end", function() {
        if (pinned) {
          pinned.flags.decr("_move_");
        }
        ;
        return self.element.flags.decr("_move_");
      });
    }
    ;
    return !!o.active;
  };
  Event2.touch$reframe$mod = function(...params) {
    var $1, $0;
    let o = ($1 = this.state)[$0 = this.step] || ($1[$0] = {});
    if (!o.rect) {
      let el = this.element;
      let len = params.length;
      let box = params[0];
      let min = 0;
      let max = "100%";
      let snap = 1;
      let typ = typeof box;
      if (typ == "number" || typ == "string" && /^([-+]?\d[\d\.]*)(%|\w+)$/.test(box) || box instanceof Array) {
        box = null;
      } else if (typ == "string") {
        if (box == "this" || box == "") {
          box = this.element;
        } else if (box == "up") {
          box = this.element.parentNode;
        } else if (box == "op") {
          box = this.element.offsetParent;
        } else {
          box = el.closest(box) || el.querySelector(box);
        }
        ;
      }
      ;
      if (box == null) {
        len++;
        params.unshift(box = el);
      }
      ;
      if (len == 2) {
        snap = params[1];
      } else if (len > 2) {
        [min, max, snap = 1] = params.slice(1);
      }
      ;
      let rect = box.getBoundingClientRect();
      if (!(min instanceof Array)) {
        min = [min, min];
      }
      ;
      if (!(max instanceof Array)) {
        max = [max, max];
      }
      ;
      if (!(snap instanceof Array)) {
        snap = [snap, snap];
      }
      ;
      o.rect = rect;
      o.x = scale(rect.left, rect.right, min[0], max[0], snap[0]);
      o.y = scale(rect.top, rect.bottom, min[1], max[1], snap[1]);
      this.state.scaleX = o.x;
      this.state.scaleY = o.y;
      this.event.x0 = this.event.x = o.x(this.event.x, o.clamp);
      this.event.y0 = this.event.y = o.y(this.event.y, o.clamp);
    } else {
      let x = this.event.x = o.x(this.event.x, o.clamp);
      let y = this.event.y = o.y(this.event.y, o.clamp);
      this.event.dx = x - this.event.x0;
      this.event.dy = y - this.event.y0;
    }
    ;
    return true;
  };
  Event2.touch$pin$mod = function(...params) {
    let o = this.state[this.step];
    if (!o) {
      let box = params[0];
      if (typeof box == "string") {
        box = this.element.closest(box) || this.element.querySelector(box);
      }
      ;
      if (!(box instanceof Element6)) {
        params.unshift(box = this.state.target);
      }
      ;
      let ax = params[1] || 0;
      let ay = params[2] == null ? params[2] = ax : params[2];
      let rect = box.getBoundingClientRect();
      o = this.state[this.step] = {
        x: this.state.clientX - (rect.left + rect.width * ax),
        y: this.state.clientY - (rect.top + rect.height * ay)
      };
      if (box) {
        this.state.pinTarget = box;
        box.flags.incr("_touch_");
        this.state.once("end", function() {
          return box.flags.decr("_touch_");
        });
      }
      ;
    }
    ;
    this.event.x -= o.x;
    this.event.y -= o.y;
    return true;
  };
  Event2.touch$lock$mod = function(...params) {
    let o = this.state[this.step];
    if (!o) {
      o = this.state[this.step] = this.state.target.style;
      let prev = o.touchAction;
      o.touchAction = "none";
      this.state.once("end", function() {
        return o.removeProperty("touch-action");
      });
    }
    ;
    return true;
  };
  Event2.touch$sync$mod = function(item, xalias = "x", yalias = "y") {
    let o = this.state[this.step];
    if (!o) {
      o = this.state[this.step] = {
        x: item[xalias] || 0,
        y: item[yalias] || 0,
        tx: this.state.x,
        ty: this.state.y
      };
    }
    ;
    if (xalias) {
      item[xalias] = o.x + (this.state.x - o.tx);
    }
    ;
    if (yalias) {
      item[yalias] = o.y + (this.state.y - o.ty);
    }
    ;
    return true;
  };
  Event2.touch$handle = function() {
    var self = this;
    let e = this.event;
    let el = this.element;
    let id = this.state.pointerId;
    this.current = this.state;
    if (id != void 0) {
      return id == e.pointerId;
    }
    ;
    let t = this.state = this.handler.state = this.current = new Touch(e, this.handler, el);
    let canceller = function(e2) {
      e2.preventDefault();
      return false;
    };
    let listener = function(e2) {
      let typ = e2.type;
      let ph = t.phase;
      t.event = e2;
      try {
        self.handler.handleEvent(t);
      } catch (e3) {
      }
      ;
      if (typ == "pointerup" || typ == "pointercancel") {
        return el.releasePointerCapture(e2.pointerId);
      }
      ;
    };
    let teardown = function(e2) {
      el.flags.decr("_touch_");
      t.emit("end");
      self.handler.state = {};
      el.removeEventListener("pointermove", listener);
      el.removeEventListener("pointerup", listener);
      el.removeEventListener("pointercancel", listener);
      return document.removeEventListener("selectstart", canceller);
    };
    el.flags.incr("_touch_");
    el.setPointerCapture(e.pointerId);
    el.addEventListener("pointermove", listener);
    el.addEventListener("pointerup", listener);
    el.addEventListener("pointercancel", listener);
    el.addEventListener("lostpointercapture", teardown, {once: true});
    document.addEventListener("selectstart", canceller, {capture: true});
    listener(e);
    return false;
  };

  // src/imba/dom/events/intersect.imba
  function iter$5(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var observers = new (globalThis.WeakMap || Map)();
  var defaults = {threshold: [0]};
  var rootTarget = {};
  var {Event: Event3, CustomEvent: CustomEvent2, Element: Element7} = imba.dom;
  Event3.intersect$handle = function() {
    let obs = this.event.detail.observer;
    return this.modifiers._observer == obs;
  };
  Event3.intersect$in = function() {
    return this.event.delta >= 0 && this.event.entry.isIntersecting;
  };
  Event3.intersect$out = function() {
    return this.event.delta < 0;
  };
  function callback(name, key) {
    return function(entries, observer) {
      let map = observer.prevRatios || (observer.prevRatios = new WeakMap());
      for (let $i = 0, $items = iter$5(entries), $len = $items.length; $i < $len; $i++) {
        let entry = $items[$i];
        let prev = map.get(entry.target) || 0;
        let ratio = entry.intersectionRatio;
        let detail = {entry, ratio, from: prev, delta: ratio - prev, observer};
        let e = new CustomEvent2(name, {bubbles: false, detail});
        e.entry = entry;
        e.isIntersecting = entry.isIntersecting;
        e.delta = detail.delta;
        e.ratio = detail.ratio;
        map.set(entry.target, ratio);
        entry.target.dispatchEvent(e);
      }
      ;
      return;
    };
  }
  function getIntersectionObserver(opts = defaults) {
    let key = opts.threshold.join("-") + opts.rootMargin;
    let target = opts.root || rootTarget;
    let map = observers.get(target);
    map || observers.set(target, map = {});
    return map[key] || (map[key] = new IntersectionObserver(callback("intersect", key), opts));
  }
  Element7.prototype.on$intersect = function(mods, context2) {
    let obs;
    if (mods.options) {
      let th = [];
      let opts = {threshold: th};
      for (let $i = 0, $items = iter$5(mods.options), $len = $items.length; $i < $len; $i++) {
        let arg = $items[$i];
        if (arg instanceof Element7) {
          opts.root = arg;
        } else if (typeof arg == "number") {
          th.push(arg);
        }
        ;
      }
      ;
      if (th.length == 1) {
        let num = th[0];
        if (num > 1) {
          th[0] = 0;
          while (th.length < num) {
            th.push(th.length / (num - 1));
          }
          ;
        }
        ;
      }
      ;
      if (th.length == 0) {
        th.push(0);
      }
      ;
      obs = getIntersectionObserver(opts);
    } else {
      obs = getIntersectionObserver();
    }
    ;
    mods._observer = obs;
    return obs.observe(this);
  };

  // src/imba/dom/events/resize.imba
  function extend$14(target, ext2) {
    var descriptors = Object.getOwnPropertyDescriptors(ext2);
    Object.defineProperties(target.prototype, descriptors);
    return target;
  }
  function iter$6(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var {Event: Event4, CustomEvent: CustomEvent3, Element: Element8} = imba.dom;
  var resizeObserver = null;
  function getResizeObserver() {
    if (!globalThis.ResizeObserver) {
      if (!resizeObserver) {
        console.warn(":resize not supported in this browser");
        resizeObserver = {observe: function() {
          return true;
        }};
      }
      ;
    }
    ;
    return resizeObserver || (resizeObserver = new ResizeObserver(function(entries) {
      for (let $i = 0, $items = iter$6(entries), $len = $items.length; $i < $len; $i++) {
        let entry = $items[$i];
        let e = new CustomEvent3("resize", {bubbles: false, detail: entry});
        e.entry = entry;
        e.rect = entry.contentRect;
        e.width = entry.target.offsetWidth;
        e.height = entry.target.offsetHeight;
        entry.target.dispatchEvent(e);
      }
      ;
      return;
    }));
  }
  extend$14(Element8, {
    on$resize(chain, context2) {
      return getResizeObserver().observe(this);
    }
  });

  // src/imba/dom/events/selection.imba
  var {Event: Event5, CustomEvent: CustomEvent4, Element: Element9} = imba.dom;
  var selHandler;
  var handledSym = Symbol();
  function activateSelectionHandler() {
    if (!selHandler) {
      selHandler = function(e) {
        if (e[handledSym]) {
          return;
        }
        ;
        e[handledSym] = true;
        let target = document.activeElement;
        if (target && target.matches("input,textarea")) {
          let custom = new CustomEvent4("selection", {
            detail: {
              start: target.selectionStart,
              end: target.selectionEnd
            }
          });
          return target.dispatchEvent(custom);
        }
        ;
      };
      return document.addEventListener("selectionchange", selHandler);
    }
    ;
  }
  Element9.prototype.on$selection = function(mods, context2) {
    return activateSelectionHandler();
  };

  // src/imba/core.imba
  if (false) {
  }
})();
