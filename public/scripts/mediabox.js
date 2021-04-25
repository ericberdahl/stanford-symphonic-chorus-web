/*
	Mediabox version 0.7.2 - John Einselen (http://iaian7.com)
	updated 15.12.07

	tested in OS X 10.5 using FireFox 2, Flock 2, Opera 9, Safari 3, and Camino 1.5
	tested in Windows Vista using Internet Explorer 7, FireFox 2, Opera 9, and Safari 3
	loads flash, flv, quicktime, wmv, and html content in a Lightbox-style window effect.

	based on Slimbox version 1.4 - Christophe Beyls (http://www.digitalia.be)
			 Slimbox Extended version 1.3.1 - Yukio Arita (http://homepage.mac.com/yukikun/software/slimbox_ex/)
			 Videobox Mod version 0.1 - Faruk Can 'farkob' Bilir (http://www.gobekdeligi.com/videobox/)
			 DM_Moviebox.js - Ductchmonkey (http://lib.dutchmoney.com/)
			(licensed same as originals, MIT-style)

	inspired by the grandaddy of them all, Lightbox v2 - Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)

	distributed under the MIT license, terms:
	copyright (c) 2007 dutchmoney llc

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

var Mediabox = {
	init: function(options){
		this.options = Object.assign({
			resizeDuration: 240,
			resizeTransition: (A) => { return this.sineInOut(A); },
			topDistance: 15,			// Divisor of the total visible window height, higher number = higher Mediabox placement on screen
										// If you wish to change this to an absolute pixel value, scroll down to lines 116 and 117 and swap the commenting slashes
			initialWidth: 360,
			initialHeight: 360,
			defaultWidth: 640,			// Default width (px)
			defaultHeight: 360,			// Default height(px)
		}, options || {});

		this.anchors = [];
		Array.from(document.links).forEach((el) => {
			if (el.rel && (/^mediabox/i).test(el.rel)) {
				el.onclick = () => { return this.click(el); }
				this.anchors.push(el);
			}
		});
		this.eventKeyDown = (e) => { return this.keyboardListener(e); }
		this.eventPosition = () => { return this.position(); }

		this.overlay = document.createElement('div');
		this.overlay.id = 'lbOverlay';
		this.overlay.onclick = () => { return this.close(); }
		document.body.appendChild(this.overlay);

		this.viewer = document.createElement('div');
		this.viewer.id = 'lbViewer';
		Object.assign(this.viewer.style, {
			width: this.options.initialWidth+'px',
			marginLeft: '-'+(this.options.initialWidth/2)+'px',
			display: 'none'
		});
		document.body.appendChild(this.viewer);

		this.center = document.createElement('div');
		this.center.id = 'lbCenter';
		Object.assign(this.center.style, {
			height: this.options.initialHeight+'px',
		});
		this.viewer.appendChild(this.center);

		this.canvas = document.createElement('div');
		this.canvas.id = 'lbCanvas';
		this.center.appendChild(this.canvas);

		this.bottomContainer = document.createElement('div');
		this.bottomContainer.id = 'lbBottomContainer';
		this.bottomContainer.style.display = 'none';
		this.viewer.appendChild(this.bottomContainer);

		this.bottom = document.createElement('div');
		this.bottom.id = 'lbBottom';
		this.bottomContainer.appendChild(this.bottom);

		var child = document.createElement('a');
		child.id = 'lbCloseLink';
		child.setAttribute('href', '#');
		child.onclick = this.overlay.onclick;
		this.bottom.appendChild(child);

		this.caption = document.createElement('div');
		this.caption.id = 'lbCaption';
		this.bottom.appendChild(this.caption);

		child = document.createElement('div');
		child.style.clear = 'both';
		this.bottom.appendChild(child);
	},

	click: function(link){
		return this.open(link);
	},

	open: function(link){
		this.position();

		var aDim = link.rel.match(/[0-9]+/g);													// videobox rel settings

		this.displayContext = {
			hiddenElements: [],
			contentsWidth: (aDim && (aDim[0] > 0)) ? aDim[0] : this.options.defaultWidth,	// videobox rel settings,
			contentsHeight: (aDim && (aDim[1] > 0)) ? aDim[1] : this.options.defaultHeight,	// videobox rel settings,
			iframe: null,
		};	

		var elements = Array.from(document.getElementsByTagName('object'));						// hide page content
		elements = elements.concat(Array.from(document.getElementsByTagName(window.ie ? 'select' : 'embed')));
		elements.forEach((el) => {
			this.displayContext.hiddenElements.push({
				el: el,
				visibility: el.style.visibility
			});
			el.style.visibility = 'hidden';
		});

		window.addEventListener('scroll', this.eventPosition);
		window.addEventListener('resize', this.eventPosition);
		document.addEventListener('keydown', this.eventKeyDown);
		
		var wh = (document.documentElement.clientHeight == 0) ? document.documentElement.scrollHeight : document.documentElement.clientHeight;
		var st = document.body.scrollTop  || document.documentElement.scrollTop;
		this.top = st + (wh / this.options.topDistance);
		Object.assign(this.viewer.style, {
			top: this.top+'px',
			display: ''
		});
		// animate opacity of this.overlay over 500ms
		this.overlay.style.display = 'block';
		this.overlay.style.opacity = 0.8;
		this.center.classList.add('lbLoading');

		// Setup the iframe that will hold the image
		this.displayContext.iframe = document.createElement('iframe');
		this.displayContext.iframe.id = "lbFrame_" + new Date().getTime();	// Safari would not update iframe content that had a static id.
		this.displayContext.iframe.setAttribute('width', this.displayContext.contentsWidth);
		this.displayContext.iframe.setAttribute('height', this.displayContext.contentsHeight);
		this.displayContext.iframe.setAttribute('frameBorder', 0);
		this.displayContext.iframe.setAttribute('scrolling', 'auto');
		this.displayContext.iframe.setAttribute('src', link.href);

		/*
		open:
			Set up image object
			Resize canvas optimistically based on assumed size of image
		when image is loaded:
			show image
			Resize canvas again based on actual size of image
			Resize bottomContainer to reveal caption and close button
		*/

		this.canvas.appendChild(this.displayContext.iframe);

		Object.assign(this.canvas.style, {
			width: this.displayContext.contentsWidth+'px',
			height: this.displayContext.contentsHeight+'px'
		});
		this.caption.innerHTML = link.title;


		if (this.center.clientHeight != this.canvas.offsetHeight || this.viewer.clientWidth != this.canvas.offsetWidth) {
			Object.assign(this.viewer.style, {
				width: this.canvas.offsetWidth + 'px',
				marginLeft: -this.canvas.offsetWidth/2 + 'px'
			});
			this.center.style.height = this.canvas.offsetHeight + 'px';

			var next = () => {
				this.viewer.removeEventListener('transitionend', next);
				this.revealCanvas();
				return false;
			};
			this.viewer.addEventListener('transitionend', next);
		}
		else {
			this.revealCanvas();
		}

		return false;
	},

	close: function() {
		this.canvas.innerHTML = '';
		this.canvas.style.opacity = 0.0;

		if (!this.displayContext) return;

		this.viewer.style.display = 'none';
		this.bottomContainer.style.height = 0;
		// animate opacity of this.overlay over 500ms then call this.setup(false)

		var displayContext = this.displayContext;
		var next = () => {
			this.overlay.removeEventListener('transitionend', next);

			this.overlay.style.display = 'none';
			displayContext.hiddenElements.forEach((hiddenEl) => {
				hiddenEl.el.style.visibility = hiddenEl.visibility;
			});

			return false;
		}
		this.overlay.addEventListener('transitionend', next);
		this.overlay.style.opacity = 0.0;

		window.removeEventListener('scroll', this.eventPosition);
		window.removeEventListener('resize', this.eventPosition);
		document.removeEventListener('keydown', this.eventKeyDown);
		this.displayContext = null;

		return false;
	},

	position: function(){
		Object.assign(this.overlay.style, {
			'top': window.pageYOffset+'px',
			'height': document.documentElement.clientHeight+'px'
		});
	},

	keyboardListener: function(event){
		switch (event.keyCode){
			case 27: case 88: case 67: this.close(); break;
		}
	},

	debugPrint: function(label) {
		var data = {
			viewer: {
				clientHeight: this.viewer.clientHeight,
				clientWidth: this.viewer.clientWidth,
				'style.marginLeft': this.viewer.style.marginLeft
			},
			center: {
				clientHeight: this.center.clientHeight,
				clientWidth: this.center.clientWidth
			},
			canvas: {
				offsetHeight: this.canvas.offsetHeight,
				offsetWidth: this.canvas.offsetWidth
			},
			bottomContainer: {
				offsetHeight: this.bottomContainer.offsetHeight
			}
		};
		if (this.displayContext) {
			data.displayContext = {
				contentsWidth: this.displayContext.contentsWidth,
				contentsHeight: this.displayContext.contentsHeight,
			};
		}

		console.log(label + ': ' + JSON.stringify(data, null, 2));
	},

	revealCanvas: function() {
		Object.assign(this.bottomContainer.style, {
			top: (this.top + this.center.clientHeight)+'px',
			marginLeft: this.center.style.marginLeft,
			width: this.center.style.width,
			display: ''
		});

		this.canvas.appendChild(this.displayContext.iframe);
		this.center.classList.remove('lbLoading');

		this.canvas.style.opacity = 1.0;
		this.bottomContainer.style.height = this.bottom.offsetHeight + 'px';
	},

	sineInOut: function(C) {
		var sine = (theta) => {
			return 1 - Math.sin((1 - theta) * Math.PI / 2);
		};

		return (C <= 0.5) ? sine(2 * C) / 2 : (2 - sine(2 * (1 - C))) / 2;
	}	
};

window.addEventListener('load', () => {
	Mediabox.init();
});
