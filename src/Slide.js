
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

#include "Layer.js"
#include "Animation.js"

var wwl        = wwl        || {};
    wwl.slider = wwl.slider || {};

wwl.slider.Slide = (
	function(Layer, Animation, undefined) {
		"use strict";

		if (typeof Layer === "undefined")
			throw {"name": "DependencyError", "message": "Unmet dependency: Layer"};

		/*
		 * Alias to the class itself and its prototype
		 */
		var Class = function() {
			return this.init.apply(this, arguments);
		}, o = Class.prototype;

		/*
		 * @var HTMLElement
		 */
		o.dom;

		/*
		 * @var string
		 */
		o.cssDisplay;

		/*
		 * Create a Slide
		 */
		o.init = function(dom) {
			this.dom = dom;
			this.cssDisplay = dom.style.display !== "none"
				? dom.style.display
				: "block";
		};

		/*
		 * Apply an effect on a slide
		 *
		 * @param Animation animation
		 */
		o.animate = function(animation) {
			return animation.animate(this.dom);
		};

		/*
		 * Show the current slide
		 */
		o.show = function() {
			this.dom.style.display = this.cssDisplay;
		};

		/*
		 * Hide the current slide
		 */
		o.hide = function() {
			this.dom.style.display = "none";
		};

		/*
		 * Move to the specified Z plan
		 *
		 * @param int index The plan index; higher is closer to the eye
		 */
		o.moveZ = function(index) {
			this.dom.style.zIndex = index;
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)(
	wwl.slider.Layer,
	wwl.slider.Stylist,
	wwl.slider.Animation
);
