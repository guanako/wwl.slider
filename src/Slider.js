
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

		if (typeof Animation === "undefined")
			throw new Error("Unmet dependency: Animation");

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
		 * @var hash<string property, string attribute>
		 */
		o.attributes = null;

		/*
		 * @var bool Enable autoplay
		 */
		o.autoplay = null;

		/*
		 * @var float
		 */
		o.defaultDelay = null;

		/*
		 * @var string
		 */
		o.defaultAnimationEffect = null;

		/*
		 * @var string
		 */
		o.defaultAnimationEasing = null;

		/*
		 * @var float
		 */
		o.defaultAnimationDuration = null;

		/*
		 * @var hash<string>
		 */
		o.slideStateClasses = null;

		/*
		 * Create a Slider
		 *
		 * @param HTMLElement dom     The Slider root DOM Element
		 * @param hash        options Options to give to the slider
		 * @throws TypeError If the container is not an HTMLElement
		 */
		o.init = function(dom, options) {
			if (! dom instanceof HTMLElement)
				throw new TypeError("Invalid DOM Node (must be an HTMLElement)");

			options = options || {};
			options.attributes = options.attributes || {};

			this.dom = dom;
			this.slides = [];
			this.playing = false;
			this.inTransition = false;
			this.playTimeout = null;
			this.slideSelector = options.slideSelector || ".slide";
			this.slideStateClasses = options.slideStateClasses || {};

			this.attributes = {};
			this.attributes.autoplay          = options.attributes.autoplay          || "data-autoplay";
			this.attributes.delay             = options.attributes.delay             || "data-delay";
			this.attributes.animationEffect   = options.attributes.animationEffect   || "data-animation";
			this.attributes.animationEasing   = options.attributes.animationEasing   || "data-animation-easing";
			this.attributes.animationDuration = options.attributes.animationDuration || "data-animation-duration";

			this.defaultDelay             = this.dom.getAttribute(this.attributes.delay)             || options.defaultDelay             || 2.0;
			this.defaultAnimationEffect   = this.dom.getAttribute(this.attributes.animationEffect)   || options.defaultAnimationEffect   || Animation.EFFECTS.SLIDE;
			this.defaultAnimationEasing   = this.dom.getAttribute(this.attributes.animationEasing)   || options.defaultAnimationEasing   || "ease";
			this.defaultAnimationDuration = this.dom.getAttribute(this.attributes.animationDuration) || options.defaultAnimationDuration || 0.5;

			this.delay    = parseFloat(this.delay);
			this.duration = parseFloat(this.duration);

			if (typeof options.autoplay !== "undefined") {
				this.autoplay = options.autoplay;
			} else if (this.dom.getAttribute(this.attributes.autoplay) !== null) {
				this.autoplay = this.dom.getAttribute(this.attributes.autoplay) !== null;
			} else {
				this.autoplay = false;
			}

			this.importSlides();
			/* TODO: note that when new slides are added, we must watch their
			 *       order in the list, and update the currentSlideIndex... */

			if (this.slides.length) {
				this.currentSlideId = 0;

				/* Show the current slide */
				var currentSlide = this.getCurrentSlide();
				currentSlide.moveZ(1);
				currentSlide.show();
				currentSlide.setState(Slide.STATES.PRESENT);

				if (this.autoplay)
					this.play();
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
			/* Typecast string to int, useful when dealing with HTMLElement
			 * attributes */
			id = parseInt(id);

			if (isNaN(id))
				throw new TypeError("Parameter 'id' must be an integer");

			if (id < 0 || id >= this.slides.length)
				throw new RangeError("Parameter 'id' must be a valid slide id");

			if (id === this.currentSlideId) {
				return Promise.resolve();
			}

			if (typeof direction === "undefined")
				var direction = id < this.currentSlideId
					? Animation.DIRECTIONS.LEFT
					: Animation.DIRECTIONS.RIGHT;

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

			var animEffect   = nextSlide.getAnimationEffect();
			var animEasing   = nextSlide.getAnimationEasing();
			var animDuration = nextSlide.getAnimationDuration();

			this.currentSlideId = id;

			nextSlide.moveZ(2);
			nextSlide.show();
			nextSlide.animate(new Animation(animEffect, direction, Animation.TYPES.INCOMING, animDuration, animEasing));

			return currentSlide
				.animate(new Animation(animEffect, direction, Animation.TYPES.OUTGOING, animDuration, animEasing))
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
			if (isNaN(n) && parseInt(n) !== n)
				throw new TypeError("Parameter 'n' must be an integer");

			var id = (this.currentSlideId + n) % this.slides.length;

			if (id < 0)
				id += this.slides.length;

			return this.show(id,
				n < 0
					? Animation.DIRECTIONS.LEFT
					: Animation.DIRECTIONS.RIGHT
			);
		};

		/*
		 * Go to a next slide
		 *
		 * @param int n Advance value (default +1)
		 * @return Promise
		 */
		o.next = function(n) {
			if (typeof n !== "undefined" && (isNaN(n) || parseInt(n) !== n))
				throw new TypeError("Parameter 'n' must be an integer (or undefined)");

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
			if (typeof n !== "undefined" && (isNaN(n) || parseInt(n) !== n))
				throw new TypeError("Parameter 'n' must be an integer (or undefined)");

			if (typeof n === "undefined")
				n = 1;

			return this.go(-n);
		};

		/*
		 * Play the slides
		 */
		o.play = function() {
			this.playing = true;

			this.playTimeout = setTimeout(function(that) {

				var replay = that.play.bind(that);
				that.next().then(replay, replay);

			}, this.getCurrentSlide().getDelay() * 1000, this);
		};

		/*
		 * Stop playing slides
		 */
		o.stop = function() {
			if (this.playing) {

				if (this.playTimeout) {
					clearTimeout(this.playTimeout);
					this.playTimeout = null;
				}

				this.playing = false;
			}
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
			if (isNaN(id) || parseInt(id) !== id)
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
		 * Count slides
		 *
		 * @return int
		 */
		o.countSlides = function() {
			return this.slides.length;
		};

		/*
		 * Count slides
		 *
		 * @return int
		 */
		o.getSlideIds = function() {
			var ids = [];

			for (var i = 0; i < this.slides.length; i++) {
				ids.push(i);
			}

			return ids;
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
		 * Import existing slides
		 */
		o.importSlides = function() {
			var slides = this.dom.querySelectorAll(this.slideSelector);
			Array.prototype.slice.call(slides).forEach(this.addSlide, this);
		};

		/*
		 * Add a slide
		 *
		 * @param HTMLElement dom
		 */
		o.addSlide = function(dom) {
			if (! this.hasSlideByElement(dom)) {
				var slide = new Slide(dom, {
					defaultDelay:             this.defaultDelay,
					defaultAnimationEffect:   this.defaultAnimationEffect,
					defaultAnimationEasing:   this.defaultAnimationEasing,
					defaultAnimationDuration: this.defaultAnimationDuration,
					stateClasses:             this.slideStateClasses,
					attributes: {
						delay:             this.attributes.delay,
						animationEffect:   this.attributes.animationEffect,
						animationEasing:   this.attributes.animationEasing,
						animationDuration: this.attributes.animationDuration,
					}
				});

				this.slides.push(slide);
				slide.setState(Slide.STATES.BEHIND);
				slide.hide();
			}
		};

		/*
		 * Tell if the given element is registered as a slide
		 *
		 * @param HTMLElement dom
		 */
		o.hasSlideByElement = function(dom) {
			for (/*let*/ var i = 0; i < this.slides.length; i++) {
				if (this.slides[i].dom === dom) {
					return true;
				}
			}

			return false;
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


/*
 * Create one or more Slider(s) (shorthand for wwl.slider.Slider.create())
 *
 * @param  HTMLElement|NodeList dom     The DOM HTMLElement, or a NodeList containing HTMLElements
 * @param  hash                 options Options to give to the slider
 * @return Slider|Array<Slider>         Depends on if it was an HTMLElement or a NodeList
 */
wwl.slider.create = function(domElement, options) {
	return wwl.slider.Slider.create(domElement, options);
};
