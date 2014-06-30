
/*
 * Copyright © 2013 Max Ruman, Guanako
 * 
 * This file is part of Web Widget Library ("WWL").
 * 
 * WWL is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 * 
 * WWL is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with WWL. If not, see <http://www.gnu.org/licenses/>.
 */

var wwl        = wwl        || {};
    wwl.slider = wwl.slider || {};

wwl.slider.Layer = (
	function(undefined) {
		"use strict";

		/*
		 * Alias to the class itself and its prototype
		 */
		var Class = function() {
			return this.init.apply(this, arguments);
		}, o = Class.prototype;

		/*
		 * Hold the value for a state
		 */
		Class.STATES = {
			INCOMING: "incoming",
			OUTGOING: "outgoing",
			PRESENT:  "present",
			BEHIND:   "behind"
		};

		/*
		 * @var HTMLElement
		 */
		o.dom = null;

		/*
		 * @var string
		 */
		o.state = null;

		/*
		 * @var hash<string>
		 */
		o.stateClasses = null;

		/*
		 * Create a Slide
		 */
		o.init = function(dom, options) {
			if (! dom instanceof HTMLElement)
				throw new TypeError("Invalid DOM Node (must be an HTMLElement)");

			options = options || {};
			options.stateClasses = options.stateClasses || {};

			this.dom = dom;

			this.stateClasses = {};
			this.stateClasses[Class.STATES.INCOMING] = options.stateClasses[Class.STATES.INCOMING] || "is-incoming";
			this.stateClasses[Class.STATES.OUTGOING] = options.stateClasses[Class.STATES.OUTGOING] || "is-outgoing";
			this.stateClasses[Class.STATES.PRESENT]  = options.stateClasses[Class.STATES.PRESENT]  || "is-present";
			this.stateClasses[Class.STATES.BEHIND]   = options.stateClasses[Class.STATES.BEHIND]   || "is-behind";

			this.setState("behind");
		};

		/*
		 * Set the current state of the layer
		 */
		o.setState = function(state) {
			if (! state in Class.STATES)
				throw new TypeError("Parameter 'state' must be a valid state (see Layer.STATES)");

			if (state === this.state)
				return false;

			this.dom.classList.remove(this.stateClasses[this.state]);
			this.dom.classList.add(this.stateClasses[state]);
			this.state = state;
			return true;
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)();
