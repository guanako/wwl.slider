
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
			throw new Error("Unmet dependency: Layer");

		/*
		 * Alias to the class itself and its prototype
		 */
		var Class = function() {
			return this.init.apply(this, arguments);
		}, o = Class.prototype;

		/*
		 * @var HTMLElement
		 */
		o.dom = null;

		/*
		 * @var string
		 */
		o.cssDisplay = null;

		/*
		 * @var hash<string property, string attribute>
		 */
		o.attributes = null;

		/*
		 * @var float
		 */
		o.delay = null;

		/*
		 * @var string
		 */
		o.animationEffect = null;

		/*
		 * @var string
		 */
		o.animationEasing = null;

		/*
		 * @var float
		 */
		o.animationDuration = null;

		/*
		 * Create a Slide
		 */
		o.init = function(dom, options) {
			options = options || {};

			if (! dom instanceof HTMLElement)
				throw new TypeError("Invalid DOM Node (must be an HTMLElement)");

			this.dom = dom;
			this.cssDisplay = dom.style.display !== "none"
				? dom.style.display : "block";

			options.attributes = options.attributes || {};
			this.attributes = {};
			this.attributes.delay             = options.attributes.delay             || "data-delay";
			this.attributes.animationEffect   = options.attributes.animationEffect   || "data-animation";
			this.attributes.animationEasing   = options.attributes.animationEasing   || "data-animation-easing";
			this.attributes.animationDuration = options.attributes.animationDuration || "data-animation-duration";

			this.delay             = this.dom.getAttribute(this.attributes.delay)             || options.defaultDelay             || 2.0;
			this.animationEffect   = this.dom.getAttribute(this.attributes.animationEffect)   || options.defaultAnimationEffect   || "slide";
			this.animationEasing   = this.dom.getAttribute(this.attributes.animationEasing)   || options.defaultAnimationEasing   || "ease";
			this.animationDuration = this.dom.getAttribute(this.attributes.animationDuration) || options.defaultAnimationDuration || 0.5;

			this.delay    = parseFloat(this.delay);
			this.duration = parseFloat(this.duration);
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
		 * Get the delay this slide must be displayed
		 *
		 * @return float
		 */
		o.getDelay = function() {
			return this.delay;
		};

		/*
		 * Get the animation effect
		 *
		 * @return string
		 */
		o.getAnimationEffect = function() {
			return this.animationEffect;
		};

		/*
		 * Get the animation timing function
		 *
		 * @return string
		 */
		o.getAnimationEasing = function() {
			return this.animationEasing;
		};

		/*
		 * Get the animation duration
		 *
		 * @return float
		 */
		o.getAnimationDuration = function() {
			return this.animationDuration;
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)(
	wwl.slider.Layer,
	wwl.slider.Animation
);
