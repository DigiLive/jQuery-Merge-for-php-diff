/*global test, equal, module, ok, deepEqual, expectCall */

var fxtr = function() { return $( '#qunit-fixture' ).children( '.Differences' ).first(); };

module( "instantiation" );

test( "plugin exists", function() {
	equal( typeof jQuery.fn.phpdiffmerge, 'function', "phpdiffmerge jQuery plugin does not exist." );
});

test( "new instance can be applied to DOM elements", function() {
	equal(
		fxtr().phpdiffmerge().data( 'plugin_phpdiffmerge' )._name,
		'phpdiffmerge',
		'instance is not applied to element.'
	);
});

test( "instance will not be overwritten on double initiation", function() {
	var inst1 = fxtr().phpdiffmerge().data( 'plugin_phpdiffmerge' ),
		inst2 = fxtr().phpdiffmerge().data( 'plugin_phpdiffmerge' );

	deepEqual( inst1, inst2, 'instance has been overwritten.' );
});

test( "instance is reinitiated when created with different options", function() {
	var inst = fxtr().phpdiffmerge().data( 'plugin_phpdiffmerge' );

	expectCall( inst, "_init" );

	fxtr().phpdiffmerge( { debug: true } );
});