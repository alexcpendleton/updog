
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.17.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\Tailwindcss.svelte generated by Svelte v3.17.2 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    class AppDataFacade {
      constructor() {
        this.latestEntriesByDate = null;
        this.allEntries = null;
        this.numberOfDaysInLatest = 30;

        this.initData();
      }
      initData() {
        this.addEntry({
          id: 1000,
          selectables: [{ key: "poop" }, { key: "pee" }],
          when: new Date("2020-01-22T02:00:00")
        });
        this.addEntry({
          id: 1001,
          selectables: [{ key: "pee" }, { key: "fed" }, { key: "meds" }],
          when: new Date("2020-01-22T04:00:00")
        });
        this.addEntry({
          id: 1003,
          selectables: [{ key: "pee" }],
          note: "peed a few times",
          when: new Date("2020-01-22T06:00:00")
        });
        this.addEntry({
          id: 1004,
          selectables: [],
          note: "was playful",
          when: new Date("2020-01-21T06:00:00")
        });
        this.addEntry({
          id: 1005,
          selectables: [{ key: "flag" }],
          note: "this one is old",
          when: new Date("2019-01-21T06:00:00")
        });
        this.addEntry({
          id: 1006,
          selectables: [{ key: "pee" }, { key: "flag" }],
          note: "xmas",
          when: new Date("2019-12-25T14:00:00")
        });
        console.log(this);
      }
      async getSelectables() {
        return [
          {
            key: "poop",
            icon: "💩",
            humanDescription: "poop",
            type: "checkbox"
          },
          {
            key: "pee",
            icon: "💧",
            humanDescription: "pee",
            type: "checkbox"
          },
          {
            key: "fed",
            icon: "🍽️",
            humanDescription: "fed",
            type: "checkbox"
          },
          {
            key: "meds",
            icon: "💊",
            humanDescription: "gave medication",
            type: "checkbox"
          },
          {
            key: "flag",
            icon: "🚩",
            humanDescription: "flag",
            type: "checkbox"
          }
        ];
      }
      makeDateKey(from) {
        return new Date(from.getFullYear(), from.getMonth(), from.getDay());
      }
      async getLatestEntriesByDate() {
        if (this.latestEntriesByDate === null) {
          this.latestEntriesByDate = {};
          // fetch from data store
        }

        return this.latestEntriesByDate;
      }

      async getAllEntries() {
        if (this.allEntries === null) {
          this.allEntries = {}; // fetch from data store
        }
        return this.allEntries;
      }

      async addEntry(entry) {
        let dateKey = this.makeDateKey(entry.when);

        if (this.latestEntriesByDate === null) {
          this.latestEntriesByDate = {};
        }
        if (!this.latestEntriesByDate[dateKey]) {
          this.latestEntriesByDate[dateKey] = {
            entries: [],
            dateKey: dateKey,
            date: new Date(dateKey)
          };
        }
        this.latestEntriesByDate[dateKey].entries.unshift(entry);

        if (this.allEntries === null) {
          this.allEntries = {};
        }
        this.allEntries[entry.id] = entry;
      }
    }

    /* src\SelectableIcon.svelte generated by Svelte v3.17.2 */

    const file = "src\\SelectableIcon.svelte";

    function create_fragment$1(ctx) {
    	let span;
    	let t_value = /*selectable*/ ctx[0].icon + "";
    	let t;
    	let span_aria_label_value;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "role", "img");
    			attr_dev(span, "aria-label", span_aria_label_value = /*selectable*/ ctx[0].humanDescription);
    			attr_dev(span, "title", span_title_value = /*selectable*/ ctx[0].humanDescription);
    			add_location(span, file, 4, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectable*/ 1 && t_value !== (t_value = /*selectable*/ ctx[0].icon + "")) set_data_dev(t, t_value);

    			if (dirty & /*selectable*/ 1 && span_aria_label_value !== (span_aria_label_value = /*selectable*/ ctx[0].humanDescription)) {
    				attr_dev(span, "aria-label", span_aria_label_value);
    			}

    			if (dirty & /*selectable*/ 1 && span_title_value !== (span_title_value = /*selectable*/ ctx[0].humanDescription)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { selectable } = $$props;
    	const writable_props = ["selectable"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectableIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("selectable" in $$props) $$invalidate(0, selectable = $$props.selectable);
    	};

    	$$self.$capture_state = () => {
    		return { selectable };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectable" in $$props) $$invalidate(0, selectable = $$props.selectable);
    	};

    	return [selectable];
    }

    class SelectableIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { selectable: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectableIcon",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectable*/ ctx[0] === undefined && !("selectable" in props)) {
    			console.warn("<SelectableIcon> was created without expected prop 'selectable'");
    		}
    	}

    	get selectable() {
    		throw new Error("<SelectableIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<SelectableIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SingleEntry.svelte generated by Svelte v3.17.2 */
    const file$1 = "src\\SingleEntry.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (26:2) {#if usedSelectables}
    function create_if_block_1(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*usedSelectables*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[7].key;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "inline");
    			add_location(ul, file$1, 26, 4, 826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const each_value = /*usedSelectables*/ ctx[0];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(26:2) {#if usedSelectables}",
    		ctx
    	});

    	return block;
    }

    // (28:6) {#each usedSelectables as item (item.key)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let t;
    	let current;

    	const selectableicon = new SelectableIcon({
    			props: { selectable: /*item*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(selectableicon.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "inline");
    			add_location(li, file$1, 28, 8, 905);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(selectableicon, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectableicon_changes = {};
    			if (dirty & /*usedSelectables*/ 1) selectableicon_changes.selectable = /*item*/ ctx[7];
    			selectableicon.$set(selectableicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectableicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectableicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(selectableicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(28:6) {#each usedSelectables as item (item.key)}",
    		ctx
    	});

    	return block;
    }

    // (35:2) {#if note}
    function create_if_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*note*/ ctx[1]);
    			attr_dev(span, "class", "note");
    			add_location(span, file$1, 35, 4, 1042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*note*/ 2) set_data_dev(t, /*note*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(35:2) {#if note}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let strong;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*usedSelectables*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*note*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(/*time*/ ctx[2]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(strong, "class", "time inline");
    			add_location(strong, file$1, 24, 2, 752);
    			attr_dev(div, "class", "single-entry text-xs");
    			add_location(div, file$1, 23, 0, 714);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t0);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*time*/ 4) set_data_dev(t0, /*time*/ ctx[2]);

    			if (/*usedSelectables*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*note*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { entry } = $$props;
    	let { selectableMap } = $$props;

    	function getSelectableFromMap(keyed) {
    		return selectableMap.find(i => i.key == keyed.key);
    	}

    	function toTime() {
    		return new Intl.DateTimeFormat("default",
    		{
    				hour12: true,
    				hour: "numeric",
    				minute: "numeric"
    			}).format(entry.when);
    	}

    	let { usedSelectables = entry.selectables.map(getSelectableFromMap) } = $$props;
    	let { note = entry.note } = $$props;
    	let { time = toTime() } = $$props;
    	const writable_props = ["entry", "selectableMap", "usedSelectables", "note", "time"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SingleEntry> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("entry" in $$props) $$invalidate(3, entry = $$props.entry);
    		if ("selectableMap" in $$props) $$invalidate(4, selectableMap = $$props.selectableMap);
    		if ("usedSelectables" in $$props) $$invalidate(0, usedSelectables = $$props.usedSelectables);
    		if ("note" in $$props) $$invalidate(1, note = $$props.note);
    		if ("time" in $$props) $$invalidate(2, time = $$props.time);
    	};

    	$$self.$capture_state = () => {
    		return {
    			entry,
    			selectableMap,
    			usedSelectables,
    			note,
    			time
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("entry" in $$props) $$invalidate(3, entry = $$props.entry);
    		if ("selectableMap" in $$props) $$invalidate(4, selectableMap = $$props.selectableMap);
    		if ("usedSelectables" in $$props) $$invalidate(0, usedSelectables = $$props.usedSelectables);
    		if ("note" in $$props) $$invalidate(1, note = $$props.note);
    		if ("time" in $$props) $$invalidate(2, time = $$props.time);
    	};

    	return [usedSelectables, note, time, entry, selectableMap];
    }

    class SingleEntry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {
    			entry: 3,
    			selectableMap: 4,
    			usedSelectables: 0,
    			note: 1,
    			time: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SingleEntry",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*entry*/ ctx[3] === undefined && !("entry" in props)) {
    			console.warn("<SingleEntry> was created without expected prop 'entry'");
    		}

    		if (/*selectableMap*/ ctx[4] === undefined && !("selectableMap" in props)) {
    			console.warn("<SingleEntry> was created without expected prop 'selectableMap'");
    		}
    	}

    	get entry() {
    		throw new Error("<SingleEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<SingleEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectableMap() {
    		throw new Error("<SingleEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectableMap(value) {
    		throw new Error("<SingleEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get usedSelectables() {
    		throw new Error("<SingleEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set usedSelectables(value) {
    		throw new Error("<SingleEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get note() {
    		throw new Error("<SingleEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set note(value) {
    		throw new Error("<SingleEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<SingleEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<SingleEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EntriesByDate.svelte generated by Svelte v3.17.2 */
    const file$2 = "src\\EntriesByDate.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (26:4) {#each entries as entry, i (entry.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let t;
    	let li_class_value;
    	let current;

    	const singleentry = new SingleEntry({
    			props: {
    				entry: /*entry*/ ctx[5],
    				selectableMap: /*selectableMap*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(singleentry.$$.fragment);
    			t = space();
    			attr_dev(li, "class", li_class_value = css(/*i*/ ctx[7]));
    			add_location(li, file$2, 26, 6, 625);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(singleentry, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const singleentry_changes = {};
    			if (dirty & /*entries*/ 4) singleentry_changes.entry = /*entry*/ ctx[5];
    			if (dirty & /*selectableMap*/ 2) singleentry_changes.selectableMap = /*selectableMap*/ ctx[1];
    			singleentry.$set(singleentry_changes);

    			if (!current || dirty & /*entries*/ 4 && li_class_value !== (li_class_value = css(/*i*/ ctx[7]))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(singleentry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(singleentry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(singleentry);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:4) {#each entries as entry, i (entry.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let strong;
    	let t0;
    	let t1;
    	let ol;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*entries*/ ctx[2];
    	const get_key = ctx => /*entry*/ ctx[5].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(/*headerText*/ ctx[0]);
    			t1 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(strong, "class", "underline px-1");
    			add_location(strong, file$2, 23, 2, 513);
    			add_location(ol, file$2, 24, 2, 569);
    			attr_dev(div, "class", "mb-2 text-xs");
    			add_location(div, file$2, 22, 0, 483);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t0);
    			append_dev(div, t1);
    			append_dev(div, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*headerText*/ 1) set_data_dev(t0, /*headerText*/ ctx[0]);
    			const each_value = /*entries*/ ctx[2];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ol, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function css(i) {
    	let bg = "";

    	if (i % 2 == 0) {
    		bg = "bg-gray-700";
    	}

    	return `px-1 py-1 ${bg}`;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { selectableMap = {} } = $$props;
    	let { headerText = "" } = $$props;
    	let { entries = [] } = $$props;
    	let { date } = $$props;

    	if (date && !headerText) {
    		headerText = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
    	}

    	const writable_props = ["selectableMap", "headerText", "entries", "date"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EntriesByDate> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("selectableMap" in $$props) $$invalidate(1, selectableMap = $$props.selectableMap);
    		if ("headerText" in $$props) $$invalidate(0, headerText = $$props.headerText);
    		if ("entries" in $$props) $$invalidate(2, entries = $$props.entries);
    		if ("date" in $$props) $$invalidate(4, date = $$props.date);
    	};

    	$$self.$capture_state = () => {
    		return { selectableMap, headerText, entries, date };
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectableMap" in $$props) $$invalidate(1, selectableMap = $$props.selectableMap);
    		if ("headerText" in $$props) $$invalidate(0, headerText = $$props.headerText);
    		if ("entries" in $$props) $$invalidate(2, entries = $$props.entries);
    		if ("date" in $$props) $$invalidate(4, date = $$props.date);
    	};

    	return [headerText, selectableMap, entries, css, date];
    }

    class EntriesByDate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {
    			selectableMap: 1,
    			headerText: 0,
    			entries: 2,
    			date: 4,
    			css: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EntriesByDate",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*date*/ ctx[4] === undefined && !("date" in props)) {
    			console.warn("<EntriesByDate> was created without expected prop 'date'");
    		}
    	}

    	get selectableMap() {
    		throw new Error("<EntriesByDate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectableMap(value) {
    		throw new Error("<EntriesByDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerText() {
    		throw new Error("<EntriesByDate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerText(value) {
    		throw new Error("<EntriesByDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entries() {
    		throw new Error("<EntriesByDate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entries(value) {
    		throw new Error("<EntriesByDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<EntriesByDate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<EntriesByDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get css() {
    		return css;
    	}

    	set css(value) {
    		throw new Error("<EntriesByDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.17.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$3 = "src\\App.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (77:8) {#each selectables as item (item.key)}
    function create_each_block_1(key_1, ctx) {
    	let label;
    	let t0;
    	let div;
    	let input;
    	let input_name_value;
    	let input_id_value;
    	let t1;
    	let current;
    	let dispose;

    	const selectableicon = new SelectableIcon({
    			props: { selectable: /*item*/ ctx[14] },
    			$$inline: true
    		});

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[9].call(input, /*item*/ ctx[14]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			create_component(selectableicon.$$.fragment);
    			t0 = space();
    			div = element("div");
    			input = element("input");
    			t1 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = /*item*/ ctx[14].key);
    			attr_dev(input, "id", input_id_value = /*item*/ ctx[14].key);
    			add_location(input, file$3, 80, 14, 2477);
    			attr_dev(div, "class", "text-center");
    			add_location(div, file$3, 79, 12, 2437);
    			attr_dev(label, "class", "cursor-pointer text-center inline-block text-2xl px-2");
    			add_location(label, file$3, 77, 10, 2306);
    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			mount_component(selectableicon, label, null);
    			append_dev(label, t0);
    			append_dev(label, div);
    			append_dev(div, input);
    			input.checked = /*item*/ ctx[14].checked;
    			append_dev(label, t1);
    			current = true;
    			dispose = listen_dev(input, "change", input_change_handler);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const selectableicon_changes = {};
    			if (dirty & /*selectables*/ 1) selectableicon_changes.selectable = /*item*/ ctx[14];
    			selectableicon.$set(selectableicon_changes);

    			if (!current || dirty & /*selectables*/ 1 && input_name_value !== (input_name_value = /*item*/ ctx[14].key)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (!current || dirty & /*selectables*/ 1 && input_id_value !== (input_id_value = /*item*/ ctx[14].key)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*selectables*/ 1) {
    				input.checked = /*item*/ ctx[14].checked;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectableicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectableicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			destroy_component(selectableicon);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(77:8) {#each selectables as item (item.key)}",
    		ctx
    	});

    	return block;
    }

    // (113:6) {#each latestEntriesByDate as group (group.id)}
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let t;
    	let current;

    	const entriesbydate = new EntriesByDate({
    			props: {
    				entries: /*group*/ ctx[11].entries,
    				date: /*group*/ ctx[11].date,
    				selectableMap: /*defaultSelectables*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(entriesbydate.$$.fragment);
    			t = space();
    			add_location(li, file$3, 113, 8, 3349);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(entriesbydate, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const entriesbydate_changes = {};
    			if (dirty & /*latestEntriesByDate*/ 4) entriesbydate_changes.entries = /*group*/ ctx[11].entries;
    			if (dirty & /*latestEntriesByDate*/ 4) entriesbydate_changes.date = /*group*/ ctx[11].date;
    			if (dirty & /*defaultSelectables*/ 16) entriesbydate_changes.selectableMap = /*defaultSelectables*/ ctx[4];
    			entriesbydate.$set(entriesbydate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(entriesbydate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(entriesbydate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(entriesbydate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(113:6) {#each latestEntriesByDate as group (group.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let main;
    	let section0;
    	let form;
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t1;
    	let label;
    	let span;
    	let t3;
    	let textarea;
    	let t4;
    	let div1;
    	let button;
    	let t6;
    	let section1;
    	let ol;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let dispose;
    	const tailwindcss = new Tailwindcss({ $$inline: true });
    	let each_value_1 = /*selectables*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[14].key;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*latestEntriesByDate*/ ctx[2];
    	const get_key_1 = ctx => /*group*/ ctx[11].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			main = element("main");
    			section0 = element("section");
    			form = element("form");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			label = element("label");
    			span = element("span");
    			span.textContent = "Note:";
    			t3 = space();
    			textarea = element("textarea");
    			t4 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "save";
    			t6 = space();
    			section1 = element("section");
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "selectables");
    			add_location(div0, file$3, 75, 6, 2223);
    			attr_dev(span, "class", "hidden");
    			add_location(span, file$3, 91, 8, 2728);
    			attr_dev(textarea, "id", "note");
    			attr_dev(textarea, "name", "note");
    			attr_dev(textarea, "placeholder", "enter a note, if you want");
    			attr_dev(textarea, "class", "text-gray-800 px-2 text-sm");
    			add_location(textarea, file$3, 92, 8, 2770);
    			attr_dev(label, "class", "note");
    			add_location(label, file$3, 90, 6, 2699);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "bg-purple-600 hover:bg-purple-400 text-white font-bold py-1\n          px-4 rounded my-2");
    			add_location(button, file$3, 100, 8, 2983);
    			add_location(div1, file$3, 99, 6, 2969);
    			attr_dev(form, "name", "updog");
    			attr_dev(form, "method", "post");
    			add_location(form, file$3, 74, 4, 2183);
    			attr_dev(section0, "id", "log-form");
    			add_location(section0, file$3, 73, 2, 2155);
    			add_location(ol, file$3, 111, 4, 3282);
    			attr_dev(section1, "id", "history");
    			attr_dev(section1, "class", " text-sm text-left ");
    			add_location(section1, file$3, 110, 2, 3227);
    			attr_dev(main, "class", "bg-gray-800 text-white text-center mx-auto py-2");
    			set_style(main, "width", "280px");
    			add_location(main, file$3, 70, 0, 2066);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, form);
    			append_dev(form, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(form, t1);
    			append_dev(form, label);
    			append_dev(label, span);
    			append_dev(label, t3);
    			append_dev(label, textarea);
    			set_input_value(textarea, /*note*/ ctx[1]);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, button);
    			append_dev(main, t6);
    			append_dev(main, section1);
    			append_dev(section1, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    				listen_dev(button, "click", /*handleSave*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const each_value_1 = /*selectables*/ ctx[0];
    			group_outros();
    			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    			check_outros();

    			if (dirty & /*note*/ 2) {
    				set_input_value(textarea, /*note*/ ctx[1]);
    			}

    			const each_value = /*latestEntriesByDate*/ ctx[2];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, ol, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function adaptSelectable(i) {
    	return Object.assign({}, i, { checked: false });
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let data = new AppDataFacade();
    	let defaultSelectables;
    	let { selectables = [] } = $$props;
    	let { note = "" } = $$props;
    	let { latestEntriesByDate = [] } = $$props;

    	async function init() {
    		// copy the source data version, slap on a "checked attribute" for the view
    		// keep those clean and make a copy for working data
    		$$invalidate(4, defaultSelectables = (await data.getSelectables()).map(adaptSelectable));

    		$$invalidate(0, selectables = defaultSelectables.map(adaptSelectable));
    		let latestAsObj = await data.getLatestEntriesByDate();
    		let latestArray = [];

    		// transform the object into an array, then maybe sort it?
    		for (let key in latestAsObj) {
    			latestArray.push(latestAsObj[key]);
    		}

    		$$invalidate(2, latestEntriesByDate = latestArray);
    		console.log("init.latestEntriesByDate", latestEntriesByDate);
    	}

    	async function resetForm() {
    		$$invalidate(1, note = "");

    		// todo: this doesn't seem to be resetting the checked status in the form...
    		$$invalidate(0, selectables = defaultSelectables.map(Object.assign));
    	}

    	async function handleSave(event) {
    		event.preventDefault();
    		event.stopImmediatePropagation();
    		var newEntry = {};
    		newEntry.id = new Date(); // todo make this a real id?

    		newEntry.selectables = selectables.filter(i => i.checked).map(i => {
    			i.key;
    		});

    		newEntry.note = note;

    		// todo put this in the form?
    		newEntry.when = new Date();

    		data.addEntry(newEntry);
    		onEntryAdded();
    		resetForm();
    	}

    	async function onEntryAdded(entry) {
    		await init();
    	}

    	init();
    	const writable_props = ["selectables", "note", "latestEntriesByDate"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler(item) {
    		item.checked = this.checked;
    		$$invalidate(0, selectables);
    	}

    	function textarea_input_handler() {
    		note = this.value;
    		$$invalidate(1, note);
    	}

    	$$self.$set = $$props => {
    		if ("selectables" in $$props) $$invalidate(0, selectables = $$props.selectables);
    		if ("note" in $$props) $$invalidate(1, note = $$props.note);
    		if ("latestEntriesByDate" in $$props) $$invalidate(2, latestEntriesByDate = $$props.latestEntriesByDate);
    	};

    	$$self.$capture_state = () => {
    		return {
    			data,
    			defaultSelectables,
    			selectables,
    			note,
    			latestEntriesByDate
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    		if ("defaultSelectables" in $$props) $$invalidate(4, defaultSelectables = $$props.defaultSelectables);
    		if ("selectables" in $$props) $$invalidate(0, selectables = $$props.selectables);
    		if ("note" in $$props) $$invalidate(1, note = $$props.note);
    		if ("latestEntriesByDate" in $$props) $$invalidate(2, latestEntriesByDate = $$props.latestEntriesByDate);
    	};

    	return [
    		selectables,
    		note,
    		latestEntriesByDate,
    		handleSave,
    		defaultSelectables,
    		resetForm,
    		data,
    		init,
    		onEntryAdded,
    		input_change_handler,
    		textarea_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {
    			selectables: 0,
    			note: 1,
    			latestEntriesByDate: 2,
    			resetForm: 5,
    			handleSave: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get selectables() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectables(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get note() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set note(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get latestEntriesByDate() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set latestEntriesByDate(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetForm() {
    		return this.$$.ctx[5];
    	}

    	set resetForm(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleSave() {
    		return this.$$.ctx[3];
    	}

    	set handleSave(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world"
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
