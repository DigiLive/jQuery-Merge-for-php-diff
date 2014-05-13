/*global jQuery */
(function($) {
  'use strict';

  var pluginName = 'phpdiffmerge',
    defaults = {
      left: '',
      right: '',
      debug: false,
      pupupResult: false,
      pupupSources: false,
      merged: $.noop()
    },
    count = 0;

  /* PHPDiffMerge constructor */
  function PHPDiffMerge(element, options) {
    var self = this;

    self._id = 1 + count++;
    self.$el = $(element);

    self.options = $.extend({}, defaults, options);

    self._defaults = defaults;
    self._name = pluginName;

    /*** PUBLIC VARIABLES ***/

    /* The conflict elements */
    self.$conflicts = $();

    /* Collection of conflict classes */
    self.conflicts = [];

    /* Counters of conflicts left */
    self.toResolve = 0;
    self.toMerge = 0;

    /* Indicator if the diff is inline or side-by-side */
    self.inline = false;

    /* The resulting merge */
    self.result = [];

    self.lineOffset = 0;
    self._tmpLineOffset = 0;


    self._init();
  }

  PHPDiffMerge.prototype = {

    /*** CONSTRUCTION ***/
    _init: function() {
      var self = this;

      /* Say Hello */
      self._debug('PHPDiffMerge about to be initiated with options:', self.options);

      /* Find conflict containers */
      self.$conflicts = self.$el.find('.ChangeReplace, .ChangeDelete, .ChangeInsert');
      /* Set the counters */
      self.toResolve = self.$conflicts.length;

      /* Check if we have enough data to work */
      if (self.toResolve <= 0 || (self.options.left === '' && self.options.right === '')) {
        self._debug('Nothing to merge or merge sources not available - ' +
          'Please submit left and right on plug-in initiation!');
        return false;
      }

      /* Check if table style is inline */
      this.inline = self.$el.hasClass('DifferencesInline');

      self._ensurePresenceOfMergeButton();

      /* Initiate Conflicts */
      $.each(self.$conflicts, function() {
        self.conflicts.push(new Conflict(this, self));
      });

      /* Register event listeners for completion actions */
      self.$conflicts.on('xiphe_phpdiffmerge_resolved', $.proxy(self._conflictResolved, self));
      self.$conflicts.on('xiphe_phpdiffmerge_merged', $.proxy(self._conflictMerged, self));
      self.$conflicts.on('xiphe_phpdiffmerge_merged', $.proxy(self._updateLineOffset, self));

      self._debug('PHPDiffMerge initiated', self);
    },


    /*** PUBLIC METHODS ***/

    /**
     * Select all changes on the right side.
     */
    useRight: function() {
      var self = this;

      self.$conflicts.find('td.Right').click();
      if (self.$el.hasClass('DifferencesInline')) {
        self.$el.find('.ChangeDelete td.Left').click().click();
      }
    },

    /**
     * Selects all changes on the right.
     */
    useLeft: function() {
      var self = this;

      self.$conflicts.find('td.Left').click();
      if (self.$el.hasClass('DifferencesInline')) {
        self.$el.find('.ChangeInsert td.Right').click().click();
      }
    },

    /**
     * Start the merge process
     */
    merge: function(event) {
      var self = this;

      if (typeof event !== 'undefined' && event !== null) {
        event.preventDefault();
      }

      /* Don't work, if any conflicts are unresolved */
      if (self.options.button.attr('disabled') === 'disabled') {
        self._debug('Unable to merge: not all conflicts have been resolved.');
        return;
      }

      /* Initiate the end by cloning the left side. */
      self.result = self.options.left.slice(0);

      /* Reset line offset */
      self.lineOffset = 0;

      /* Reset the todo counter */
      self.toMerge = self.$conflicts.length;

      for (var i = 0; i < self.conflicts.length; i++) {
        self.conflicts[i].merge();
      }
    },

    /**
     * change options AFTER initialization
     *
     * @param {object} options a plain options object
     */
    option: function(options) {
      var self = this;

      if ($.isPlainObject(options)) {
        self.options = $.extend(true, self.options, options);
      }
    },


    /*** PROTECTED METHODS ***/

    /*
     * Check if a merge button is available or generate one.
     */
    _ensurePresenceOfMergeButton: function() {
      var self = this;

      if (typeof self.options.button === 'undefined' || !$(self.options.button).length) {
        self.options.button = $('<button />')
          .html('Merge')
          .attr('disabled', 'disabled')
          .css({
            display: 'block',
            height: '50px',
            width: '200px',
            margin: '50px auto'
          });
        self.$el.after(self.options.button);
      } else {
        self.options.button = $(self.options.button).attr('disabled', 'disabled');
      }

      /* Merge on click */
      self.options.button.click($.proxy(self.merge, self));
    },

    _debug: function() {
      if (this.options.debug && window.console && window.console.log) {
        window.console.log(Array.prototype.slice.call(arguments));
      }
    },

    /* callback for whenever a conflict is resolved */
    _conflictResolved: function() {
      var self = this;

      self.toResolve--;
      if (self.toResolve === 0) {
        self.options.button.removeAttr('disabled');
      }
    },

    /* callback for whenever a conflict is merged */
    _conflictMerged: function() {
      var self = this;

      self.toMerge--;
      if (self.toMerge === 0) {
        if (self.options.pupupResult) {
          popup('end', self.result.join('\n'));
        }
        /* Pup-up the sources if set in configuration */
        if (self.options.pupupSources) {
          popup('left', self.options.left.join('\n'));
          popup('right', self.options.right.join('\n'));
        }
        /* Call the merged-callback if callable */
        if (typeof self.options.merged === 'function') {
          self.options.merged.call(self, self.result, self.options.left, self.options.right);
        }
      }
    },

    /* Delete a given amount of rows at a specific index from the result. */
    _deleteResult: function(index, length) {
      var self = this;

      /* Delete the left rows */
      self._debug('Deleting Left: ' + index + ' - ' + (index + length - 1) + '.');
      var out = self.result.splice((index + self.lineOffset - 1), length);

      if (self.options.debug) {
        out = out.map(function(value) { return $.trim(value).substring(0, 10) + '...'; });
        self._debug('Content: ', out);
      }

      /* Set new Line Offset */
      self._tmpLineOffset -= length;
    },

    /* Insert a given amount of rows at a specific index from the right side to the result. */
    _insertResult: function(index, length, targetIndex) {
      var self = this;
      var insert = [];

      /* Insert the right rows. */
      for (var i = 0; i < length; i++) {
        /* Get the content from the right site */
        var line = self.options.right[index - 1 + i];
        insert.push(line);

        /* inject it to the following line on the left side */
        self.result.splice((targetIndex - 1 + self.lineOffset + i), 0, line);
      }

      if (self.options.debug) {
        self._debug('Left line prior to insertion: ' + (targetIndex - 1));
        self._debug(
          'Content: ', $.trim(self.result[targetIndex - 2 + self.lineOffset]).substring(0, 10)
        );

        self._debug('Inserted Right: Row ' + index + ' - ' + (index + length - 1) + '.');

        insert = insert.map(function(value) {
          return $.trim(value).substring(0, 10) + '...';
        });
        self._debug('Content: (' + insert.join(', ') + ')');
      }

      /* Set new Line Offset */
      self._tmpLineOffset += length;
    },

    _updateLineOffset: function() {
      var self = this;

      self._debug('Change lineOffset from: ' + self.lineOffset + ' to ' +
        (self.lineOffset + self._tmpLineOffset) + '.');
      self.lineOffset += self._tmpLineOffset;
      self._tmpLineOffset = 0;
    }
  };

  /* Conflict Constructor */
  function Conflict(element, master) {
    var self = this;

    self.$el = $(element);
    self.master = master;

    self._resolved = false;
    self.type = '';
    self.useLeft = false;
    self.leftLine = 0;
    self.rightLine = 0;
    self.rowsLeft = 0;
    self.rowsRight = 0;

    self._init();
  }

  Conflict.prototype = {

    /*** CONSTRUCTION ***/
    _init: function() {
      var self = this;

      self.type = self.$el.attr('class').match(/Change([\w]+)/)[1];

      self.$el.find('td')
        .click($.proxy(self._clicked, self))
        .hover($.proxy(self._hoverIn, self), $.proxy(self._hoverOut, self));

      self._setLine();
      self._setRows();

      self.master._debug('Conflict initiated:', self);
    },


    /*** PUBLIC METHODS ***/

    merge: function() {
      var self = this;

      if (self.useLeft) {
        self.master._debug(
          'Ignoring lines ' + self.leftLine + ' - ' + (self.leftLine + self.rowsLeft - 1) + '.'
        );
        self.$el.trigger('xiphe_phpdiffmerge_merged');
        return;
      }

      self.master._debug('Merging Conflict:', self);

      switch (self.type) {
        case 'Replace':
          self._delete();
          self._insert();
          break;
        case 'Insert':
          self._insert();
          break;
        case 'Delete':
          self._delete();
          break;
        default:
          logError('Undefined merge method "' + self.type + '".');
          return;
      }

      self.$el.trigger('xiphe_phpdiffmerge_merged');
    },


    /*** PRIVATE METHODS ***/

    _hoverIn: function(event) {
      var $target = $(event.delegateTarget);

      var h = $target.hasClass('Left') ? 'Left' : 'Right';
      this.$el.find('td.' + h).addClass('hover');
    },

    _hoverOut: function() {
      this.$el.find('td.hover').removeClass('hover');
    },

    _clicked: function(event) {
      var self = this;
      var $target = $(event.delegateTarget), use, dont;

      if (!self.master.inline) {
        self.useLeft = $target.hasClass('Left');
      } else {
        self.useLeft = $target.hasClass('use');
        if ($target.hasClass('Left')) {
          self.useLeft = !self.useLeft;
        }
      }

      use = self.useLeft ? 'Left' : 'Right';
      dont = self.useLeft ? 'Right' : 'Left';

      /* Highlight the current clicked change. */
      if (self.master.inline &&
        (self.type === 'Delete' || self.type === 'Insert')
      ) {
        var $c = self.$el.find('td');
        $c.toggleClass('use');
        $c.toggleClass('dontUse', !$c.hasClass('use'));
      } else {
        self.$el.find('td.' + use).removeClass('dontUse').addClass('use');
        self.$el.find('td.' + dont).removeClass('use').addClass('dontUse');
      }

      /* Consider this conflict as resolved if it is clicked for the first time. */
      if (!self._resolved) {
        self._resolved = true;
        self.$el.trigger('xiphe_phpdiffmerge_resolved');
      }
    },

    _setLine: function() {
      var self = this;

      /*
       * Get the first line of the conflict from the previous table
       * because there was a bug with the line numbers in php-diff.
       */
      var previousRow = self.$el.prev('tbody').find('tr').last();

      self.leftLine = parseInt((previousRow.find('th').first().html() || 0), 10) + 1;
      self.rightLine = parseInt((previousRow.find('th').last().html() || 0), 10) + 1;
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
      var self = this;

      self.master._insertResult(self.rightLine, self.rowsRight, self.leftLine);
    },

    _delete: function() {
      var self = this;

      self.master._deleteResult(self.leftLine, self.rowsLeft);
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
    content = content.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    newWin.document.write('<html><head><title>' + title + '</title></head><body><pre>' +
      content + '</pre></body></html>');
  }

  // helper function for logging errors
  // $.error breaks jQuery chaining
  // From jquery.isotope.js
  var logError = function(message) {
    if (window.console) {
      window.console.error(message);
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
  $.fn[pluginName] = function(options) {
    var self = this;

    if (typeof options === 'string') {
      // call method
      var args = Array.prototype.slice.call(arguments, 1);

      self.each(function() {
        var instance = $.data(this, 'plugin_' + pluginName);
        if (!instance) {
          logError('cannot call methods on ' + pluginName + ' prior to initialization; ' +
              'attempted to call method "' + options + '"');
          return;
        }
        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
          logError('no such method "' + options + '" for ' + pluginName + ' instance');
          return;
        }
        // apply method
        instance[options].apply(instance, args);
      });
    } else {
      self.each(function() {
        var instance = $.data(this, 'plugin_' + pluginName);
        if (instance) {
          // apply options & init
          instance.option(options);
          instance._init();
        } else {
          // initialize new instance
          $.data(this, 'plugin_' + pluginName, new PHPDiffMerge(this, options));
        }
      });
    }
    // return jQuery object
    // so plugin methods do not have to
    return self;
  };

})(jQuery);
