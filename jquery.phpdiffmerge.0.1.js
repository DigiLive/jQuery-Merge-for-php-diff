/**
 * jQuery Merge for php-diff v0.1
 * 
 * A jQuery plugin for handling the conflicts between two documents.
 * Requires [php-diff](https://github.com/chrisboulton/php-diff) on the server side.
 * 
 * https://github.com/Xiphe/jQuery-Merge-for-php-diff
 * Distributed under GNU General Public License.
 */

/*
 Copyright (C) 2012 Hannes Diercks

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License along
 with this program; if not, write to the Free Software Foundation, Inc.,
 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

(function( $ ){
    "use strict";

    $.fn.phpdiffmerge = function(userConfig) {
        /**
         * Default configuration
         *
         * @type {Object}
         */
        var config = {
                left: '',
                right: '',
                debug: false,
                pupupResult: false,
                pupupSources: false,
                merged: function() {}
            },
            $self = this;

        /* Merge userConfig into default configuration. */
        config = $.extend({}, config, userConfig);

        /*
         * Check if a merge button is available or generate some.
         */
        if (typeof config.button === 'undefined' || !$(config.button).length) {
            config.button = $('<button />')
                .html('Merge')
                .attr('disabled', 'disabled')
                .css({
                    display: 'block',
                    height: '50px',
                    width: '200px',
                    margin: '50px auto'
                });
            $self.after(config.button);
        } else {
            config.button = $(config.button).attr('disabled', 'disabled');
        }

        /**
         * Selects all changes on the left.
         *
         * @return {Object} $self
         */
        this.useRight = function() {
            $conflicts.find('td.Right').click();
            if ($self.hasClass('DifferencesInline')) {
                $self.find('.ChangeDelete td.Left').click().click();
            }
            return $self;
        };

        /**
         * Selects all changes on the right.
         *
         * @return {Object} $self
         */
        this.useLeft = function() {
            $conflicts.find('td.Left').click();
            if ($self.hasClass('DifferencesInline')) {
                $self.find('.ChangeInsert td.Right').click().click();
            }
            return $self;
        };

        /**
         * Clones an array
         *
         * @param {Array} obj
         *
         * @return {Array}
         */
        function cloneArr(a) {
            var r = [];
            if (typeof a === 'object' && a.length) {
                $.each(a, function(i, v) {
                    r[i] = v;
                });
            }
            return r;
        }

        /**
         * Generates a pup-up window with the given content.
         *
         * @param {string} title   the title for the new window
         * @param {string} content the content for the new window
         *
         * @return {void}
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

        /**
         * Outputs a debug message if useDebug is true and console available.
         *
         * @param {mixed} v
         *
         * @return {void}
         */
        function debug(v) {
            if (config.debug && window.console && console.log) {
                console.log(v);
            }
        }

        debug('Config: ');
        debug(config);


        if (config.left === '' && config.right === '') {
            debug('Nothing to merge or merge sources not available - Please submit left and right on plug-in initiation!');
            return false;
        }

        /* Initiate some variables. */
        var $conflicts = $self.find('.ChangeReplace, .ChangeDelete, .ChangeInsert'),
            toResolve = $conflicts.length; 

        /* Add interactivity */
        $conflicts.each(function() {
            var $conflict = $(this);

            $conflict.find('td').click(function() {
                var u = 'Right',
                    d = 'Left';

                if ($(this).hasClass('Left')) {
                    u = 'Left';
                    d = 'Right';
                }

                /* Consider this conflict as resolved if it is clicked. */
                if (!$conflict.find('.use, .dontUse').length) {
                    toResolve--;
                }

                /* Highlight the current clicked change. */
                if ($self.hasClass('DifferencesInline') &&
                    ($conflict.hasClass('ChangeDelete') || $conflict.hasClass('ChangeInsert'))
                ) {
                    var $c = $conflict.find('td');
                    $c.toggleClass('use');
                    if ($c.hasClass('use')) {
                        $c.removeClass('dontUse');
                    } else {
                        $c.addClass('dontUse');
                    }
                } else {
                    $conflict.find('td.'+u).removeClass('dontUse').addClass('use');
                    $conflict.find('td.'+d).removeClass('use').addClass('dontUse');
                }

                /* If every conflict is clicked enable the merge button. */
                if (toResolve === 0) {
                    config.button.removeAttr('disabled');
                }
            }).hover(function() {
                /* Use js-hover because multiple rows have to be highlighted. */
                var h = 'Right';
                if ($(this).hasClass('Left')) {
                    h = 'Left';
                }
                $conflict.find('td.'+h).addClass('hover');
            }, function() {
                $conflict.find('td').removeClass('hover');
            });
        });
        
        /* The Merge */
        config.button.click(function(e) {
            /* Initiate the end by cloning the left side. */
            var end = cloneArr(config.left),
                lineOffset = 0;

            e.preventDefault();

            var attr = $(this).attr('disabled');
            if (typeof attr !== 'undefined' && attr !== false) {
                return false;
            }

            /* Loop through all conflicts. */
            $conflicts.each(function() {
                var $conflict = $(this),
                    $c = $conflict.find('.use').first(),
                    $prv = $conflict.prev('tbody').find('tr').last(),
                    /* 
                     * Get the first line of the conflict from the previous table
                     * because there is a bug with the line numbers in php-diff.
                     *
                     * The lineOffset have to be added to the endLine because 
                     * the line might have changed when inserted or deleted previous
                     * changes.
                     */
                    endLine = parseInt($prv.find('th').first().html(), 10)+lineOffset,
                    rightLine = parseInt($prv.find('th').last().html(), 10),
                    /* How many rows are affected. */
                    rows = parseInt($conflict.find('td.Left').length, 10),
                    i;

                /* If first line is a conflict, the previous line is NaN -> set to 0 */
                if (isNaN(endLine)) {
                    endLine = 0;
                }
                if (isNaN(rightLine)) {
                    rightLine = 0;
                }

                /*
                 * Skip this conflict if the left side of the conflict should be used.
                 * (End === Left by default.)
                 */
                if ($c.hasClass('Left')) {
                    debug("Ignoring lines "+(endLine+1)+" - "+(endLine+rows)+" because Left will be keeped.");
                    debug('-----');
                    return;
                }
                
                debug("Doing "+$conflict.attr('class')+':');

                if ($conflict.hasClass('ChangeReplace')) {
                    var rowsLeft, rowsRight;
                    /* Count the rows that have to be deleted and inserted. */
                    if ($self.hasClass('DifferencesInline')) {
                        rowsLeft = $conflict.find('.Left').length;
                        rowsRight = $conflict.find('.Right').length;
                    } else {
                        rowsLeft = 0;
                        $conflict.find('.Left').each(function() {
                            if ($(this).prev('th').html() !== '&nbsp;') {
                                rowsLeft++;
                            }
                        });
                        rowsRight = 0;
                        $conflict.find('.Right').each(function() {
                            if ($(this).prev('th').html() !== '&nbsp;') {
                                rowsRight++;
                            }
                        });
                    }

                    /* Delete the left rows */
                    debug("Deleting Left: Row "+(endLine+1)+" - "+(endLine+rowsLeft)+" for change to right");
                    for (i = 0; i < rowsLeft; i++) {
                        end.splice(endLine, 1);
                    }

                    /* Insert the right rows. */
                    debug("Inserting Right: Row "+(rightLine+1)+" - "+(rightLine+rowsRight)+" into Left row "+(endLine+1));
                    for (i = 0; i < rowsRight; i++) {
                        end.splice(endLine+i, 0, config.right[rightLine+i]);
                    }

                    /*
                     * Get the difference of lines inserted and deleted
                     * and add it to the lineOffset.
                     */
                    var d = rowsRight-rowsLeft;
                    debug("Manipulating lineOffset ("+lineOffset+") with "+d+".");
                    lineOffset = lineOffset+d;
                } else if ($conflict.hasClass('ChangeInsert')) {
                    if ($self.hasClass('DifferencesInline')) {
                        if ($conflict.find('.use').length === 0) {
                            debug('Skipping due unused.');
                            debug('-----');
                            return;
                        }
                        rows = parseInt($conflict.find('td.Right').length, 10);
                    }

                    /* Insert the new right rows */
                    debug("Inserting Right: Row "+(rightLine+1)+" - "+(rightLine+rows)+" into Left row "+(endLine+1));
                    for (i = 0; i < rows; i++) {
                        end.splice(endLine+i, 0, config.right[rightLine+i]);
                    }

                    /* Add the amount of rows to the lineOffset */
                    debug("Manipulating lineOffset ("+lineOffset+") with "+rows+".");
                    lineOffset += rows;
                } else if($conflict.hasClass('ChangeDelete')) {
                    /* Delete the left rows */
                    debug("Deleting Left: Row "+(endLine+1)+" - "+(endLine+rows)+".");
                    for (i = 0; i < rows; i++) {
                        end.splice(endLine, 1);
                    }

                    /* Subtract the amount of rows to the lineOffset */
                    debug("Manipulating lineOffset ("+lineOffset+") with "+(rows*-1)+".");
                    lineOffset -= rows;
                }
                debug('-----');
            });

            /* Pup-up the result if set in configuration */
            if (config.pupupResult) {
                popup('end', end.join("\n"));
            }
            /* Pup-up the sources if set in configuration */
            if (config.pupupSources) {
                popup('left', config.left.join("\n"));
                popup('right', config.right.join("\n"));
            }
            /* Call the merged-callback if callable */        
            if (typeof config.merged === 'function') {
                config.merged.call($self, end, config.left, config.right);
            }

        });
        
        return this;
    };
})(jQuery);