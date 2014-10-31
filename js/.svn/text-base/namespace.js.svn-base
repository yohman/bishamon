if (typeof window['namespace'] !== 'undefined') {
	alert ("namespace conflict in namespace.js");
}

var namespace = {
	request: function ($name, $parent) {
		var parent = $parent == undefined ? window : $parent;
		if (typeof parent[$name] != 'undefined') {
			alert ("Could not reserve namespace " + $name);
		}
	}
};