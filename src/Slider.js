
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

#include "Slide.js"
#include "Animation.js"

var wwl        = wwl        || {};
    wwl.slider = wwl.slider || {};

/*
 * The main class of the WWL Slider. Manipulation functions return a Promise.
 *
 *   var sliderElement = document.querySelector("#slider");
 *   var sliderManager = wwl.slider.Slider.create(sliderElement);
 *
 * There are 2 main custom events:
 *
 *   - SlideTransitionStart (cancellable) { currentSlideId, nextSlideId, direction     }
 *   - SlideTransitionEnd:                { currentSlideId, previousSlideId, direction }
 */
wwl.slider.Slider = (
	function(Slide, Animation, undefined) {
		"use strict";

		if (typeof Promise !== "function")
			throw new Error("Unmet depencency: EC6 Promise");

		if (typeof Slide === "undefined")
			throw new Error("Unmet dependency: Slide");

		/*
		 * Alias to the class itself and its prototype
		 */
		var Class = function() {
			return this.init.apply(this, arguments);
		}, o = Class.prototype;

		/*
		 * Create one or more Slider(s)
		 *
		 * @param  HTMLElement|NodeList dom     The DOM HTMLElement, or a NodeList containing HTMLElements
		 * @param  hash                 options Options to give to the slider
		 * @return Slider|Array<Slider>         Depends on if it was an HTMLElement or a NodeList
		 */
		Class.create = function(domElement, options) {
			if (domElement instanceof NodeList) {
				return Array.prototype.slice.call(domElement).map(function(domElement) {
					return new Class(domElement, options);
				});
			}

			/* Assume it's an HTMLElement */
			return new Class(domElement, options);
		};

		/*
		 * @var HTMLElement
		 */
		o.dom = null;

		/*
		 * @var Array<Slide>
		 */
		o.slides = null;

		/*
		 * @var int Numeric id of the current slide for the slides array
		 */
		o.currentSlideId = null;

		/*
		 * @var string Selector that will be passed to the HTMLElement.prototype.querySelectorAll()
		 */
		o.slideSelector = null;

		/*
		 * @var string Selector that will be passed to the HTMLElement.prototype.querySelectorAll()
		 */
		o.layerSelector = null;

		/*
		 * @var bool Is the actual play state of the Slider "playing" or "not playing"
		 */
		o.playing = null;

		/*
		 * @var Timeout
		 */
		o.playTimeout = null;

		/*
		 * @var bool Is there a transition running
		 */
		o.inTransition = null;

		/*
		 * Create a Slider
		 *
		 * @param HTMLElement dom     The Slider root DOM Element
		 * @param hash        options Options to give to the slider
		 * @throws TypeError If the container is not an HTMLElement
		 */
		o.init = function(dom, options) {
			options = options || {};

			if (! dom instanceof HTMLElement)
				throw new TypeError("Invalid DOM Node (must be an HTMLElement)");

			this.dom = dom;
			this.slides = [];
			this.playing = false;
			this.inTransition = false;
			this.slideSelector = options.slideSelector || ".wwl-slider-slide";
			this.layerSelector = options.layerSelector || ".wwl-slider-layer";

			this.importSlides();
			/* TODO: note that when new slides are added, we must watch their
			 *       order in the list, and update the currentSlideIndex... */

			if (this.slides.length) {
				this.currentSlideId = 0;

				/* Show the current slide */
				var currentSlide = this.getCurrentSlide();
				currentSlide.moveZ(1);
				currentSlide.show();
			}
		};

		/*
		 * Move to a specific slide. This is the master transition method.
		 *
		 * @param int id     The id of the slide to display
		 * @param int direction The direction to go: "left" or "right"
		 * @throws TypeError  If id is undefined or is not a number
		 * @throws RangeError If id is not a valid slide id
		 * @return Promise
		 */
		o.show = function(id, direction) {
			if (typeof id === "undefined" || isNaN(id))
				throw new TypeError("Parameter 'id' must be an integer");

			if (id < 0 || id >= this.slides.length)
				throw new RangeError("Parameter 'id' must be a valid slide id");

			if (id === this.currentSlideId)
				return Promise.resolve();

			if (typeof direction === "undefined")
				var direction = id < this.currentSlideId ? "left" : "right";

			var prevId = this.currentSlideId;

			if (! this.startTransition({
				currentSlideId: prevId,
				nextSlideId: id,
				direction: direction
			})) {
				return Promise.reject();
			}

			var currentSlide = this.getCurrentSlide();
			var nextSlide = this.getSlide(id);

			this.currentSlideId = id;

			nextSlide.moveZ(2);
			nextSlide.show();
			nextSlide.animate(new Animation("slide-" + direction + "-in", 0.6));

			return currentSlide
				.animate(new Animation("slide-" + direction + "-out", 0.6))
				.then(function() {

					currentSlide.hide();
					nextSlide.moveZ(1);

					this.endTransition({
						previousSlideId: prevId,
						currentSlideId: id,
						direction: direction
					});

				}.bind(this));
		};

		/*
		 * Move to a specific slide
		 *
		 * @param int n The direction to go (.., -2, -1, 1, 2, ..)
		 * @throws TypeError If n is undefined or is not a number
		 * @return Promise
		 */
		o.go = function(n) {
			if (typeof n === "undefined" || isNaN(n))
				throw new TypeError("Parameter 'n' must be an integer");

			var id = (this.currentSlideId + n) % this.slides.length;

			if (id < 0)
				id += this.slides.length;

			return this.show(id, n < 0 ? "left" : "right");
		};

		/*
		 * Go to a next slide
		 *
		 * @param int n Advance value (default +1)
		 * @return Promise
		 */
		o.next = function(n) {
			if (typeof n === "undefined")
				n = 1;

			return this.go(n);
		};

		/*
		 * Go to a previous slide
		 *
		 * @param int n Recoil value (default +1)
		 * @return Promise
		 */
		o.previous = function(n) {
			if (typeof n === "undefined")
				n = 1;

			return this.go(-n);
		};

		/*
		 * Get the current slide
		 *
		 * @return Slide
		 */
		o.getCurrentSlide = function() {
			return this.getSlide(this.currentSlideId);
		};

		/*
		 * Get a slide
		 *
		 * @param int n The direction to go (.., -2, -1, 1, 2, ..)
		 *
		 * @return Slide
		 *
		 * @throws TypeError  If id is undefined or is not a number
		 * @throws RangeError If id is not a valid slide id
		 */
		o.getSlide = function(id) {
			if (typeof id === "undefined" || isNaN(id))
				throw new TypeError("Parameter 'id' must be an integer");

			if (id < 0 || id >= this.slides.length)
				throw new RangeError("Parameter 'id' must be a valid slide id");

			return this.slides[id];
		};

		/*
		 * Tell if the slider play state is "playing" or "not playing"
		 *
		 * @return bool
		 */
		o.isPlaying = function() {
			return this.playing;
		};

		/*
		 * Change the state and dispatch the SlideTransitionStart event
		 *
		 * @param object detail
		 * @return bool Success (was the transition started?)
		 */
		o.startTransition = function(detail) {
			if (this.inTransition)
				return false;

			this.inTransition = true;

			var event = new CustomEvent("SlideTransitionStart", {
				cancelable: true,
				detail: detail
			});

			if (! this.dom.dispatchEvent(event)) {
				this.inTransition = false;
				return false;
			}

			return true;
		};

		/*
		 * Change the state and dispatch the SlideTransitionEnd event
		 * 
		 * @param object detail
		 * @return bool Success (was the transition ended?)
		 */
		o.endTransition = function(detail) {
			if (! this.inTransition)
				return false;

			this.inTransition = false;

			this.dom.dispatchEvent(new CustomEvent("SlideTransitionEnd", {
				cancelable: false,
				detail: detail
			}));

			return true;
		};

		/*
		 * Add a slide
		 *
		 * @param HTMLElement dom
		 */
		o.addSlide = function(dom) {
			if (! this.hasSlideElement(dom)) {
				var slide = new Slide(dom);
				this.slides.push(slide);
				slide.hide();
			}
		};

		/*
		 * Tell if the given element is registered as a slide
		 *
		 * @param HTMLElement dom
		 */
		o.hasSlideElement = function(dom) {
			for (/*let*/ var i = 0; i < this.slides.length; i++) {
				if (this.slides[i].dom === dom) {
					return true;
				}
			}

			return false;
		};

		/*
		 * Import existing slides
		 */
		o.importSlides = function() {
			var slides = this.dom.querySelectorAll(this.slideSelector);
			Array.prototype.slice.call(slides).forEach(this.addSlide, this);
		};

		/*
		 * :Commit :)
		 */
		return Class;
	}
)(
	wwl.slider.Slide,
	wwl.slider.Animation
);
