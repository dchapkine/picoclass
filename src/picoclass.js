
/**
 * Picoclass.js is a lightweight javascript class builder for browsers and nodejs.
 *
 * @thxto:
 *	http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
 *	http://kevinoncode.blogspot.com/2011/04/understanding-javascript-inheritance.html
 *	http://javascript.crockford.com/prototypal.html
 *	https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
 *
 * @author dmitri.chapkine
 */
var picoclass = function(o)
{
	/**
	 * Single inheritance
	 *
	 * Usage:
	   
	   A = function(){};
	   A.prototype.foo = function(){};
	   
	   B = picoclass({
		extends: A,
		
		constructor: function()
		{
			this.super();// calls A's constructor in the scope of B's instance if needed ;)
		}
	   });
	   
	   var tmp = new B();
	   tmp.foo();
	 */
	var _extends = o['extends'] || null;
	
	
	/**
	 * Super method (for constructor and instance methods only)
	 */
	var _super = function(){ // this.super() will be a shortcut for this.super.construct()
		_super["construct"].apply(this, arguments); 
	};
	if (_extends)
	{
		_super["construct"] = (function(){
			_extends.apply(this, arguments);
		});
		
		for (var i in _extends.prototype)
		{
			if (_extends.prototype[i] instanceof Function)
			{
				_super[i] = _extends.prototype[i];
			}
		}
	}
	else
	{
		_super["construct"] = (function(){
			throw Error("Can't call super(), This class does NOT have a parent class.");
		});
	}
	
	/**
	 * Super method (for static methods (= class's methods))
	 */
	var _staticSuper = function(){};
	if (_extends)
	{
		for (var i in _extends)
		{
			if (_extends[i] instanceof Function)
			{
				_staticSuper[i] = _extends[i];
			}
		}
	}
	
	/**
	 * Constructor method
	 *
	 * Usage:
	 
	   B = picoclass({
		constructor: function(param1)
		{
			this.foo = param1;
		}
	   });
	   
	   var tmp = new B("bar");
	   tmp.foo; // "bar"
	 *
	 */
	var _constructor = (function(_construct, _super, _extends)
	{return function(){

		if (_construct)
		{
			this.super = _super;
			_construct.apply(this, arguments);
		}
		else if (_extends)
		{
			_super["construct"].apply(this, arguments);
		}
		
	}})(o['construct'], _super, _extends);
	
	
	/**
	 * Static attributes and methods
	 *
	 * Usage:
	 
	   B = picoclass({
		static: {
			foo: "bar"
		}
	   });
	   
	   B.foo; // "bar"
	 */
	var _static = o['static'] || null;
	
	/**
	 * Alternative to multiple inheritance
	 * @see http://www.php.net/manual/fr/language.oop5.traits.php
	 *
	 * Usage:
	 
	   A = picoclass({
			say: function()
			{
				console.log("Say");
			}
		});


		B = picoclass({
			
			use: [A],
			
			hello: function()
			{
				console.log("Hello");
			}
		});

		var tmp = new B();
		tmp.say(); // "Say"
		tmp.hello(); // "Hello"
	 
	 */
	var _use = o['use'] || null;
	
	// Don't need it any more, everything else will be a method of the class
	delete o['extends'];
	delete o['construct'];
	delete o['static'];
	delete o['use'];
	
	// Inherit methods and attributes (from prototype = instance specific)
	// @see http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	var tmp = function(){};
	if (_extends)
		tmp.prototype = _extends.prototype;
	
	var newClass = _constructor;
	newClass.prototype = new tmp;
	newClass.prototype.constructor = _constructor;
	
		
	// We add methods and attributes from classes specified with use attribute
	if (_use)
	{
		// Use multiple classes
		if (_use.constructor == Array)
		{
			for (var i in _use)
			{
				// Use instance methods ans attributes
				if (_use[i].prototype)
				{
					for (var j in _use[i].prototype)
					{
						newClass.prototype[j] = _use[i].prototype[j];
					}
				}
				
				// Use static methods and attributes
				for (var k in _use[i])
				{
					newClass[k] = _use[i][k];
				}
			}
		}
		// Use one classe
		else
		{
			if (_use.prototype)
			{
				// Use instance methods ans attributes
				for (var j in _use.prototype)
				{
					newClass.prototype[j] = _use.prototype[j];
				}
				
				// Use static methods and attributes
				for (var k in _use)
				{
					newClass[k] = _use[k];
				}
			}
		}
	}
	
	// We add methods to the new class
	for (var i in o)
	{
		if (o[i] instanceof Function)
		{
			var _method = (function(_method, _super)
			{return function(){

				this.super = _super;
				return _method.apply(this, arguments);
				
			}})(o[i], _super);
			
			newClass.prototype[i] = _method;
		}
		else
		{
			newClass.prototype[i] = o[i];
		}
	}
	
	// Inherit static methods and attributes
	if (_extends)
	{
		for (var i in _extends)
		{
			newClass[i] = _extends[i];
		}
	}
	
	// Class's Own Static methods, and attributes
	if (_static)
	{
		for (var i in _static)
		{
			if (_static[i] instanceof Function)
			{
				var _method = (function(_method, _staticSuper)
				{return function(){

					this.super = _staticSuper;
					return _method.apply(this, arguments);
					
				}})(_static[i], _staticSuper);
				
				newClass[i] = _method;
			}
			else
			{
				newClass[i] = _static[i];
			}
			
			//newClass[i] = _static[i];
		}
	}
	
	
	return newClass;
};


// Works in the browser or with node.js
if (typeof module !== 'undefined' && module.exports)
	module.exports = picoclass;
else
{
	window.picoclass = picoclass;
	window.$class = picoclass; // retrocompatibility: this name was used before
}	
	
	
	