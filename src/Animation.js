
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
		 * @var string
		 */
		o.name = null;

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
		o.init = function(name, duration, easing) {
			if (typeof name === "undefined")
				throw new Error("Parameter 'name' must be a valid animation name");

			if (typeof duration === "undefined")
				throw new Error("Parameter 'duration' must be a valid number of seconds (float)");

			this.name = name;
			this.duration = duration;
			this.easing = easing;
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

				dom.addEventListener("animationend", listener, false);

				dom.style.webkitAnimation = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
				dom.style.khtmlAnimation  = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
				dom.style.mozAnimation    = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
				dom.style.msAnimation     = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
				dom.style.oAnimation      = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
				dom.style.animation       = "wwl-slider-fx-" + this.name + " " + this.duration + "s";
			}.bind(this));
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)();
