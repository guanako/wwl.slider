
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
		 * @var string The desired effect: slide
		 */
		o.effect = null;

		/*
		 * @var string The direction of the change: left or right
		 */
		o.direction = null;

		/*
		 * @var string Wich slide is it, the entering one (in) or the exiting one (out)
		 */
		o.which = null;

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
		o.init = function(effect, direction, which, duration, easing) {
			if (typeof effect !== "string" && effect !== "slide" && effect !== "fade")
				throw new Error("Parameter 'effect' must be a valid animation effect");

			if (direction !== "left" && direction !== "right")
				throw new Error("Parameter 'direction' must be a valid transition direction");

			if (which !== "in" && which !== "out")
				throw new Error("Parameter 'which' must be a valid valid transitive slide type");

			if (typeof duration === "undefined")
				throw new Error("Parameter 'duration' must be a valid number of seconds (float)");

			this.effect = effect;
			this.direction = direction;
			this.which = which;
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
					this.which + " " +
					this.duration + "s " +
					this.easing;

				dom.addEventListener("animationend", listener, false);
				dom.style.webkitAnimation = animation;
				dom.style.khtmlAnimation  = animation;
				dom.style.mozAnimation    = animation;
				dom.style.msAnimation     = animation;
				dom.style.oAnimation      = animation;
				dom.style.animation       = animation;
			}.bind(this));
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)();
