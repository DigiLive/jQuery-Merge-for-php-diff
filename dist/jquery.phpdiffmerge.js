/*!
* jQuery-Merge-for-php-diff - A jQuery plugin for handling the conflicts between two documents.
* v0.3.0 - 2014-04-14 9:04:20 AM UTC
* Copyright (c) 2014 Hannes Diercks <github@xiphe.net>; License: MIT
*/
(function($){
	"use strict";

	var pluginName = 'phpdiffmerge',
		defaults = {
			left: '',
			right: '',
			debug: false,
			pupupResult: false,
			pupupSources: false,
			merged: function() {}
		},
		count = 0;

	/* PHPDiffMerge constructor */
	function PHPDiffMerge(element, options) {
		this._id = 1 + count++;
		this.$el = $( element );

		this.options = $.extend( {}, defaults, options );

		this._defaults = defaults;
		this._name = pluginName;

		this._init();
	}

	PHPDiffMerge.prototype = {

		/*** PUBLIC VARIABLES ***/

		/* The conflict elements */
		$conflicts: $(),

		/* Collection of conflict classes */
		conflicts: [],

		/* Counters of conflicts left */
		toResolve: 0,
		toMerge: 0,

		/* Indicator if the diff is inline or side-by-side */
		inline: false,

		/* The resulting merge */
		result: '',

		lineOffset: 0,
		_tmpLineOffset: 0,

		/*** CONSTRUCTION ***/
		_init: function() {
			var self = this;

			/* Say Hello */
			self._debug( 'PHPDiffMerge about to be initiated with options:', self.options );

			/* Find conflict containers */
			self.$conflicts = self.$el.find( '.ChangeReplace, .ChangeDelete, .ChangeInsert' );
			/* Set the counters */
			self.toResolve = self.$conflicts.length;

			/* Check if we have enough data to work */
			if (self.toResolve <= 0 || (self.options.left === '' && self.options.right === '')) {
				self._debug( 'Nothing to merge or merge sources not available - Please submit left and right on plug-in initiation!' );
				return false;
			}

			/* Check if table style is inline */
			this.inline = self.$el.hasClass( 'DifferencesInline' );

			self._ensurePresenceOfMergeButton();

			/* Initiate Conflicts */
			$.each( self.$conflicts, function() {
				self.conflicts.push( new Conflict( this, self ) );
			});

			/* Register event listeners for completion actions */
			self.$conflicts.on( 'xiphe_phpdiffmerge_resolved', $.proxy( self._conflictResolved, self ) );
			self.$conflicts.on( 'xiphe_phpdiffmerge_merged', $.proxy( self._conflictMerged, self ) );
			self.$conflicts.on( 'xiphe_phpdiffmerge_merged', $.proxy( self._updateLineOffset, self ) );

			self._debug( 'PHPDiffMerge initiated', self );
		},


		/*** PUBLIC METHODS ***/

		/**
		 * Select all changes on the right side.
		 */
		useRight: function() {
			this.$conflicts.find( 'td.Right' ).click();
			if (this.$el.hasClass( 'DifferencesInline' )) {
				this.$el.find( '.ChangeDelete td.Left' ).click().click();
			}
		},

		/**
		 * Selects all changes on the right.
		 */
		useLeft: function() {
			this.$conflicts.find( 'td.Left' ).click();
			if (this.$el.hasClass( 'DifferencesInline' )) {
				this.$el.find( '.ChangeInsert td.Right' ).click().click();
			}
		},

		/**
		 * Start the merge process
		 */
		merge: function(event) {
			if (typeof event !== 'undefined' && event !== null) {
				event.preventDefault();
			}

			/* Don't work, if any conflicts are unresolved */
			if (this.options.button.attr( 'disabled' ) === 'disabled') {
				this._debug( 'Unable to merge: not all conflicts have been resolved.' );
				return;
			}

			/* Initiate the end by cloning the left side. */
			this.result = this.options.left.slice( 0 );

			/* Reset line offset */
			this.lineOffset = 0;

			/* Reset the todo counter */
			this.toMerge = this.$conflicts.length;

			for (var i = 0; i < this.conflicts.length; i++) {
				this.conflicts[i].merge();
			}
		},

		/**
		 * change options AFTER initialization
		 *
		 * @param {object} options a plain options object
		 */
		option: function( options ){
			if ($.isPlainObject( options )){
				this.options = $.extend( true, this.options, options );
			}
		},


		/*** PROTECTED METHODS ***/

		/*
		 * Check if a merge button is available or generate one.
		 */
		_ensurePresenceOfMergeButton: function() {
			if (typeof this.options.button === 'undefined' || !$( this.options.button ).length) {
				this.options.button = $( '<button />' )
					.html( 'Merge' )
					.attr( 'disabled', 'disabled' )
					.css({
						display: 'block',
						height: '50px',
						width: '200px',
						margin: '50px auto'
					});
				this.$el.after( this.options.button );
			} else {
				this.options.button = $( this.options.button ).attr( 'disabled', 'disabled' );
			}

			/* Merge on click */
			this.options.button.click( $.proxy( this.merge, this ) );
		},

		_debug: function() {
			if (this.options.debug && window.console && console.log) {
				console.log( Array.prototype.slice.call( arguments ) );
			}
		},

		/* callback for whenever a conflict is resolved */
		_conflictResolved: function() {
			this.toResolve--;
			if (this.toResolve === 0) {
				this.options.button.removeAttr('disabled');
			}
		},

		/* callback for whenever a conflict is merged */
		_conflictMerged: function() {
			this.toMerge--;
			if (this.toMerge === 0) {
				if (this.options.pupupResult) {
					popup('end', this.result.join("\n"));
				}
				/* Pup-up the sources if set in configuration */
				if (this.options.pupupSources) {
					popup('left', this.options.left.join("\n"));
					popup('right', this.options.right.join("\n"));
				}
				/* Call the merged-callback if callable */
				if (typeof this.options.merged === 'function') {
					this.options.merged.call(this, this.result, this.options.left, this.options.right);
				}
			}
		},

		/* Delete a given amount of rows at a specific index from the result. */
		_deleteResult: function(index, length) {
			/* Delete the left rows */
			this._debug( "Deleting Left: " + index + " - " + (index + length - 1) + '.' );
			var out = this.result.splice( (index + this.lineOffset - 1), length );

			if (this.options.debug) {
				out = out.map( function(value) { return $.trim( value ).substring( 0, 10 ) + '...'; } );
				this._debug( 'Content: ', out );
			}

			/* Set new Line Offset */
			this._tmpLineOffset -= length;
		},

		/* Insert a given amount of rows at a specific index from the right side to the result. */
		_insertResult: function(index, length, targetIndex) {
			var insert = [];

			/* Insert the right rows. */
			for (var i = 0; i < length; i++) {
				/* Get the content from the right site */
				var line = this.options.right[index - 1 + i];
				insert.push( line );

				/* inject it to the following line on the left side */
				this.result.splice( (targetIndex - 1 + this.lineOffset + i), 0, line );
			}

			if (this.options.debug) {
				this._debug("Left line prior to insertion: " + (targetIndex - 1) );
				this._debug("Content: ", $.trim( this.result[targetIndex - 2 + this.lineOffset] ).substring( 0, 10 ) );

				this._debug("Inserted Right: Row " + index + " - " + (index + length - 1) + '.');

				insert = insert.map( function(value) { return $.trim( value ).substring( 0, 10 ) + '...'; } );
				this._debug( 'Content: (' + insert.join(', ') + ')' );
			}

			/* Set new Line Offset */
			this._tmpLineOffset += length;
		},

		_updateLineOffset: function() {
			this._debug( "Change lineOffset from: " + this.lineOffset + " to " + (this.lineOffset + this._tmpLineOffset) + '.' );
			this.lineOffset += this._tmpLineOffset;
			this._tmpLineOffset = 0;
		}
	};

	/* Conflict Constructor */
	function Conflict(element, master) {
		this.$el = $( element );
		this.master = master;

		this._init();
	}

	Conflict.prototype = {
		_resolved: false,
		type: '',
		useLeft: false,
		leftLine: 0,
		rightLine: 0,
		rowsLeft: 0,
		rowsRight: 0,


		/*** CONSTRUCTION ***/

		_init: function() {
			this.type = this.$el.attr( 'class' ).match( /Change([\w]+)/ )[1];

			this.$el.find('td')
				.click( $.proxy( this._clicked, this ) )
				.hover( $.proxy( this._hoverIn, this ), $.proxy( this._hoverOut, this ) );

			this._setLine();
			this._setRows();

			this.master._debug( 'Conflict initiated:', this );
		},


		/*** PUBLIC METHODS ***/

		merge: function() {
			if (this.useLeft) {
				this.master._debug( 'Ignoring lines ' + this.leftLine + ' - ' + ( this.leftLine + this.rowsLeft - 1 ) + '.');
				this.$el.trigger( 'xiphe_phpdiffmerge_merged' );
				return;
			}

			this.master._debug( 'Merging Conflict:', this );

			switch(this.type) {
			case 'Replace':
				this._delete();
				this._insert();
				break;
			case 'Insert':
				this._insert();
				break;
			case 'Delete':
				this._delete();
				break;
			default:
				logError( 'Undefined merge method "' + this.type + '".' );
				return;
			}

			this.$el.trigger( 'xiphe_phpdiffmerge_merged' );
		},


		/*** PRIVATE METHODS ***/

		_hoverIn: function(event) {
			var $target = $( event.delegateTarget );

			var h = $target.hasClass( 'Left' ) ? 'Left' : 'Right';
			this.$el.find( 'td.'+h ).addClass( 'hover' );
		},

		_hoverOut: function() {
			this.$el.find( 'td.hover' ).removeClass( 'hover' );
		},

		_clicked: function(event) {
			var $target = $( event.delegateTarget ), use, dont;

			if (!this.master.inline) {
				this.useLeft = $target.hasClass( 'Left' );
			} else {
				this.useLeft = $target.hasClass( 'use' );
				if ($target.hasClass( 'Left' )) {
					this.useLeft = !this.useLeft;
				}
			}

			use = this.useLeft ? 'Left' : 'Right';
			dont = this.useLeft ? 'Right' : 'Left';

			/* Highlight the current clicked change. */
			if (this.master.inline &&
				(this.type === 'Delete' || this.type === 'Insert')
			) {
				var $c = this.$el.find( 'td' );
				$c.toggleClass( 'use' );
				$c.toggleClass( 'dontUse', !$c.hasClass( 'use' ) );
			} else {
				this.$el.find( 'td.'+use ).removeClass( 'dontUse' ).addClass( 'use' );
				this.$el.find( 'td.'+dont ).removeClass( 'use' ).addClass( 'dontUse' );
			}

			/* Consider this conflict as resolved if it is clicked for the first time. */
			if (!this._resolved) {
				this._resolved = true;
				this.$el.trigger( 'xiphe_phpdiffmerge_resolved' );
			}
		},

		_setLine: function() {
			/*
			 * Get the first line of the conflict from the previous table
			 * because there was a bug with the line numbers in php-diff.
			 */
			var previousRow = this.$el.prev( 'tbody' ).find( 'tr' ).last();

			this.leftLine = parseInt( (previousRow.find( 'th' ).first().html() || 0), 10 ) + 1;
			this.rightLine = parseInt( (previousRow.find( 'th' ).last().html() || 0), 10 ) + 1;
		},

		_setRows: function() {
			var self = this;

			if (self.master.inline) {
				self.rowsLeft = self.$el.find('.Left').length;
				self.rowsRight = self.$el.find('.Right').length;
			} else {
				self.rowsLeft = 0;
				self.$el.find('.Left').each(function() {
					if ($(this).prev('th').html() !== '&nbsp;') {
						self.rowsLeft++;
					}
				});
				self.rowsRight = 0;
				self.$el.find('.Right').each(function() {
					if ($(this).prev('th').html() !== '&nbsp;') {
						self.rowsRight++;
					}
				});
			}
		},

		_insert: function() {
			this.master._insertResult(this.rightLine, this.rowsRight, this.leftLine);
		},

		_delete: function() {
			this.master._deleteResult(this.leftLine, this.rowsLeft);
		}
	};

	/**
	 * Generate a pup-up window with the given content.
	 *
	 * @param {string} title   the title for the new window
	 * @param {string} content the content for the new window
	 */
	function popup(title, content) {
		var newWin = window.open('popup.html');
		// http://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
		content = content
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;');
		newWin.document.write("<html><head><title>"+title+"</title></head><body><pre>"+content+"</pre></body></html>");
	}

	// helper function for logging errors
	// $.error breaks jQuery chaining
	// From jquery.isotope.js
	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	// =======================  Plugin bridge  ===============================
	// From jquery.isotope.js
	// https://github.com/desandro/isotope/blob/master/jquery.isotope.js#L1363
	//
	// A bit from jQuery UI
	//   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
	// A bit from jcarousel
	//   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js
	$.fn[pluginName] = function( options ) {
		if ( typeof options === 'string' ) {
			// call method
			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function(){
				var instance = $.data( this, 'plugin_' + pluginName );
				if ( !instance ) {
					logError( "cannot call methods on " + pluginName + " prior to initialization; " +
							"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for " + pluginName + " instance" );
					return;
				}
				// apply method
				instance[ options ].apply( instance, args );
			});
		} else {
			this.each(function() {
				var instance = $.data( this, 'plugin_' + pluginName );
				if ( instance ) {
					// apply options & init
					instance.option( options );
					instance._init();
				} else {
					// initialize new instance
					$.data( this, 'plugin_' + pluginName, new PHPDiffMerge( this, options ) );
				}
			});
		}
		// return jQuery object
		// so plugin methods do not have to
		return this;
	};

})(jQuery);