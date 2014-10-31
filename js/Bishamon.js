namespace.request("Bishamon");

Bishamon = (function () {
	var _map = null,
        _map2 = null,
        _map1Layer = null,
        _map2Layer = null,
		_googleDocUrl = 'https://spreadsheets.google.com/feeds/list/0AuXnU2fvgMAFdC1Mc1phUU50dGloY1RWZjZXREdyalE/od6/public/values?alt=json-in-script&callback=?',
		_intro = true,
		_urlVars = {},
        _refreshActions = [],
		_mapStyles = {
            regular : [{
                stylers: [{
                    saturation: 0
                }, {
                    lightness: 0
                }, {
                    gamma: 0
                }]
            }],
            bw : [{
                stylers: [{
                    saturation: -99
                }, {
                    lightness: 36
                }, {
                    gamma: 1.21
                }]
                }],
            night: 	[{
                stylers: [{
                    invert_lightness: true
                }, {
                    saturation: -100
                }]
            }]
        },
        _city = {name: ""},
        _cityBounds = {
            "minamisoma" : {
                south : 37.5,
                west : 140.76,
                north: 37.76,
                east: 141
            }, "namie" : {
                south : 37.412,
                west : 140.688,
                north: 37.626,
                east: 141.051
            }, "naraha" : {
                south : 37.234,
                west : 140.866,
                north: 37.339,
                east: 141.039
            }
        }
        ;
                
	var _updateMapLink = function () {
		var maplink = 'http://gis.ats.ucla.edu/bishamon/?zl='
			+ _map.getZoom() + '&lat=' + _map.getCenter().lat()
			+ '&lng=' + _map.getCenter().lng() 
			// TODO: fill in catranges
			+ '&catranges=' + Bishamon.RadiationSlider.getRanges().join(",");
		$('#maplink').val(maplink);
	}
	
	var _parseGoogleDoc = function ($data) {

		var zoomLevel = _urlVars.zl != undefined ? _urlVars.zl 
                : parseInt($data.feed.entry[0].gsx$zoomlevel.$t),
			lat = _urlVars.lat != undefined ? _urlVars.lat 
                : parseFloat($data.feed.entry[0].gsx$lat.$t),
			lng = _urlVars.lon != undefined ? _urlVars.lon 
                : parseFloat($data.feed.entry[0].gsx$lng.$t),
			title = $data.feed.entry[0].gsx$title.$t,
			description = $data.feed.entry[0].gsx$description.$t,
			sw = null,
			ne = null,
			bounds = null,
			catRanges = typeof _urlVars.catranges != "undefined" ? 
				_urlVars.catranges.split(",") : [0.3,0.6,0.9,1.2]
			;

		$('#title').html(title);
		$('#description').html(description);
	
	
        var mapOptions = {
            zoom: zoomLevel,
            center: new google.maps.LatLng(lat,lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            maxZoom: _urlVars.maxzoom ? _urlVars.maxzoom : 17,
            scaleControl: true
        };

        var map2Options = {
            zoom: zoomLevel,
            center: new google.maps.LatLng(lat,lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
            panControl: false,
            draggable: false,
            maxZoom: _urlVars.maxzoom ? _urlVars.maxzoom : 17,
            scaleControl: true
        };

		_map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
		_map2 = new google.maps.Map(document.getElementById("map_canvas2"),map2Options);

		//adding event listener to sync maps
		google.maps.event.addListener(_map, 'drag', function(event) {
			_map2.setCenter(_map.getCenter());
		});
        google.maps.event.addListener(_map, 'zoom_changed', function(event) {
            _map2.setZoom(_map.getZoom());
            _map2.setCenter(_map.getCenter());
        });
        google.maps.event.addListener(_map, 'bounds_changed', function(event) {
            _map2.setZoom(_map.getZoom());
            _map2.setCenter(_map.getCenter());
        });


		Bishamon.CitySearch.init(_map, bounds);

		//City override
        var possibleCity = window.location.pathname
            .split("/").pop();
        _city.name = possibleCity;
        if (typeof _cityBounds[possibleCity] != 'undefined') {
            _city.bounds = _cityBounds[possibleCity];
            sw = new google.maps.LatLng(_city.bounds.south,_city.bounds.west);
            ne = new google.maps.LatLng(_city.bounds.north,_city.bounds.east);
            bounds = new google.maps.LatLngBounds(sw,ne);
		} else {
			sw = new google.maps.LatLng(36.701, 138.806);
			ne = new google.maps.LatLng(38.093, 141.368);
			bounds = new google.maps.LatLngBounds(sw,ne);
		}

		_map.setCenter(new google.maps.LatLng(lat,lng));
		_map.setZoom(zoomLevel);
	
		_map.fitBounds(bounds);

        //default date for map1
        var map1date = "2012_Q3";
        var map2date = "2012_Q1";

        //Draw the radiation data layer
        _map1Layer = new Bishamon.GridLayer(_map, {
            city: _city.name,
            clipToCity: ((_city.name == 'minamisoma')
                ?  "CITY2 = '南相馬市'"
                : (_city.name == 'namie')
                ?  "CITY2 = '浪江町'"
                : (_city.name == 'naraha')
                ?  "CITY2 = '楢葉町'"
                : undefined
                ),
            cityClipPoints: ((_city.name == 'minamisoma')
                ?  'ST_INTERSECTS(Latitude,RECTANGLE('
                    + 'LATLNG(37.507,140.81),LATLNG(37.76,142)))'
                : undefined
                ),
            dateSelectSelector: "#toggledate",
            dateDisplaySelector: "#date-display",
            radioPrefix: "left_"
            },
            map1date
        );
        //Draw the radiation data layer
        _map2Layer = new Bishamon.GridLayer(_map2, {
            city: _city.name,
            clipToCity: ((_city.name == 'minamisoma')
                ?  "CITY2 = '南相馬市'"
                : (_city.name == 'namie')
                ?  "CITY2 = '浪江町'"
                : (_city.name == 'naraha')
                ?  "CITY2 = '楢葉町'"
                : undefined
                ),
            cityClipPoints: ((_city.name == 'minamisoma')
                ?  'ST_INTERSECTS(Latitude,RECTANGLE('
                    + 'LATLNG(37.507,140.81),LATLNG(37.76,142)))'
                : undefined
                ),
            dateSelectSelector: "#toggledate2",
            dateDisplaySelector: "#date-display2",
            radioPrefix: "right_"
            },
            map2date
        );
        _map1Layer.alsoUpdate(_map2Layer);
        _map2Layer.alsoUpdate(_map1Layer);
		Bishamon.RadiationSlider.init([_map1Layer, _map2Layer], {
            city: _city.name,
            maxRange: _urlVars.maxrange ? _urlVars.maxrange : 2,
            catRanges: catRanges
        });
	
		// This as an array of functions to call, which each component
		// can add to	
        _refreshActions.push(_updateMapLink);
		google.maps.event.addListener(_map, 'zoom_changed', function() {
	        $('#micro-instructions').show();
            for (var i in _refreshActions) {
                _refreshActions[i]();
            }
		});
	
		google.maps.event.addListener(_map, 'dragend', function(){
			_updateMapLink();
		});
        
		Bishamon.LayerSelector.init(_map, {
            city: _city.name
        });
        
		//Show opening box and resize windows
		if(_intro) {	 
			Bishamon.Intro.init(_city) ;
		}


	};
	
    var _toggleMapType = function ($e) {
		var target = $e.target.id,
			mapType = target.split('-')[1],
            style = _mapStyles.regular,
            mapTypeId = google.maps.MapTypeId.ROADMAP
            ;

		//toggle button classes
		$('#toggle-map-type').children().removeClass('active');
		$('#'+target).addClass('active');
		$('#maptype-display').html($('#'+target).html());

        switch (mapType) {
            case 'night':
                style = _mapStyles.night;
                break;
            case 'light':
                style = _mapStyles.bw;
                break;
            case 'regular':
                style = _mapStyles.regular;
                break;
            case 'satellite':
                mapTypeId = google.maps.MapTypeId.HYBRID;
                break;
            case 'terrain':
                mapTypeId = google.maps.MapTypeId.TERRAIN;
                break;
            default:
                alert("Invalid map type");
        }
        _map.setMapTypeId(mapTypeId);
        _map2.setMapTypeId(mapTypeId);
        _map.setOptions({styles: style});
        _map2.setOptions({styles: style});
        $e.stopPropagation();
        return false;
    };

    var _mode = 'Single map';

    var _toggleView = function($e) {
        var mode = $e.target.innerHTML;
        _mode = mode;
        switch(mode) {
            case 'Dual map':
                $('#map_canvas').css('width','50%');
                google.maps.event.trigger(_map, "resize");
                $('#map_canvas2').fadeIn();
                google.maps.event.trigger(_map2, "resize");
                $('#btn-group-date2').show();
                $('#btn-group-date1').animate({right: '50%'});
                $('.reticule').show();
                $('.reticule2').show();
                
                // _map2.setCenter(_map.getCenter());
                break;
            case 'Single map':
                $('#map_canvas').css('width','100%');
                google.maps.event.trigger(_map, "resize");
                $('#map_canvas2').fadeOut();
                google.maps.event.trigger(_map2, "resize");
                $('#btn-group-date2').hide();
                $('#btn-group-date1').animate({right: '0%'});
                $('.reticule').hide();
                $('.reticule2').hide();
                //_map2.panTo(_map.getCenter());
                break;
            default:
                alert("invalid map mode");
        }
    }


	return {
		init: function () {
			var hash;
			var hashes = window.location.href.slice(
                window.location.href.indexOf('?') + 1
            ).split('&');

			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				_urlVars[hash[0]] = hash[1];
			}
            //Make it draggable
            $( ".draggable" ).draggable({containment: "parent"});
            
            //Toggle buttons
            $( "#toggledate" ).buttonset();
            //$( "#toggle-map-type" ).buttonset();
			$.getJSON(_googleDocUrl, _parseGoogleDoc);
            $("#toggle-map-type").click(_toggleMapType);

            //dual view controller
            //for now, turn off dual view w/jquery (Dave, please reconsider this)
            $("#toggle-view").click(_toggleView);


            
		},
        registerRefreshAction: function ($fn) {
            _refreshActions.push($fn);
        },
        getMode: function () {
            return _mode;
        }
	}
})();
