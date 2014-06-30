
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

wwl.slider.Animation = (
	function(undefined) {
		"use strict";

		/*
		 * Alias to the class itself and its prototype
		 */
		var Class = function() {
			return this.init.apply(this, arguments);
		}, o = Class.prototype;

		/*
		 * Animation effects
		 */
		Class.EFFECTS = {
			SLIDE: "slide",
			FADE:  "fade"
		};

		/*
		 * Animation directions
		 */
		Class.DIRECTIONS = {
			LEFT:  "left",
			RIGHT: "right"
		};

		/*
		 * Animation types
		 */
		Class.TYPES = {
			INCOMING: "in",
			OUTGOING: "out"
		};

		/*
		 * @var string The desired effect: slide
		 */
		o.effect = null;

		/*
		 * @var string The direction of the change: left or right
		 */
		o.direction = null;

		/*
		 * @var string Animation type
		 */
		o.type = null;

		/*
		 * @var float (seconds)
		 */
		o.duration = null;

		/*
		 * @var string
		 */
		o.easing = null;

		/*
		 * Create a Slide
		 */
		o.init = function(effect, direction, type, duration, easing) {
			if (! effect in Class.EFFECTS)
				throw new Error("Parameter 'effect' must be a valid animation effect");

			if (! direction in Class.DIRECTIONS)
				throw new Error("Parameter 'direction' must be a valid animation direction");

			if (! type in Class.TYPES)
				throw new Error("Parameter 'type' must be a valid valid animation type");

			if (typeof duration === "undefined")
				throw new Error("Parameter 'duration' must be a valid number of seconds (float)");

			this.effect = effect;
			this.direction = direction;
			this.type = type;
			this.duration = duration;
			this.easing = easing || "ease";
		};

		/*
		 * Animate a DOM Element
		 *
		 * @param HTMLElement dom
		 *
		 * @return Promise
		 */
		o.animate = function(dom) {
			return new Promise(function(resolve, reject) {
				var listener = function(event) {
					dom.removeEventListener("animationend", listener, false);
					resolve();
				};

				var animation =
					"wwl-slider-fx-" +
					this.effect + "-" +
					this.direction + "-" +
					this.type + " " +
					this.duration + "s " +
					this.easing;

				dom.addEventListener("animationend", listener, false);
				dom.addEventListener("oanimationend", listener, false);
				dom.addEventListener("MSAnimationEnd", listener, false);
				dom.addEventListener("webkitAnimationEnd", listener, false);
				dom.style.webkitAnimation = animation;
				dom.style.khtmlAnimation  = animation;
				dom.style.mozAnimation    = animation;
				dom.style.msAnimation     = animation;
				dom.style.oAnimation      = animation;
				dom.style.animation       = animation;
			}.bind(this));
		};

		/*
		 * @return string Animation type
		 */
		o.getType = function() {
			return this.type;
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)();
