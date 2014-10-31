namespace.request("LayerSelector", Bishamon);

Bishamon.LayerSelector = (function () {
	
	var _map = null,
		_legendShowing = false,
        _city = "",
        _cityTranslations = {
            "minamisoma": "南相馬市",
            "naraha"	: "楢葉町",
            "namie"		: "浪江町"
        },
		_layers = {
			minamisoma : [new google.maps.FusionTablesLayer({
				clickable: true,
				query: {
					select: 'Geocodable address',
					from: 2639597
				}
			})],
			
			
			evacuation_order_lift_preparing_zone : [new google.maps.FusionTablesLayer({
				clickable: true,
				query: {
					select: 'geometry',
					from: 3511362
				}
			})],
			
			homing_difficulty_zone : [new google.maps.FusionTablesLayer({
				clickable: true,
				query: {
					select: 'geometry',
					from: 3512057
				}
			})],
			
			residential_restrict_zone : [new google.maps.FusionTablesLayer({
				clickable: true,
				query: {
					select: 'geometry',
					from: 3511546
				}
			})],
			
			photos : [new google.maps.FusionTablesLayer({
				clickable: true,
				query: {
					select: 'geometry',
					from: 5333876
				}
			})],
			
			fukushima20kmAndEvacuationZone : [new google.maps.FusionTablesLayer({
				clickable: false,
					query: {
						select: 'geometry',
						from:3075892
					},
					suppressInfoWindows: true 
				}),
                 new google.maps.FusionTablesLayer({
				clickable: false,
				query: {
					select: 'geometry',
					from:  3075592
				},
				suppressInfoWindows: true 
			})]
		}
        ;

	var _displayLegend = function () {
		var imageSource = "images/";
		if (_legendShowing) {
			$('#legend-container').fadeIn();
			imageSource += "close.png";
		} else {
			$('#legend-container').fadeOut();
			imageSource += "options.png";
		}
		$("#legend-toggle > img").attr('src', imageSource);
		_legendShowing = !_legendShowing;
	};

	var _clickHandler = function ($e) {
		var target = $($e.target),
			layerName = target.attr('id').split('-')[0],
            status = $("#" + layerName + "-toggle").attr("checked") == "checked" ? _map : null
            ;
			
		if (_layers[layerName]) {
            _setAllLayers(_layers[layerName], status);
		}
        $e.stopPropagation();
        //return false;
	};
	
    var _setAllLayers = function ($layers, $map) {
        for (var i in $layers) {
            $layers[i].setMap($map);
        }
    };

	return {
		init: function ($map, $options) {
			_map = $map;
		
            _city = $options.city;

			_layers.japan_cities = [new google.maps.FusionTablesLayer({
				clickable: false,
				query: {
					select: 'geometry',
					from: 3297165,
                    where: "CITY2 = '" + _cityTranslations[_city] + "'"
				}
			})]
			
			//if city is not defined, don't allow (hide) layer toggle
			if(typeof _cityTranslations[_city] == 'undefined') $('#layer-toggle-city').hide();

			//handle city specific layers
			if(_city == 'minamisoma')
			{
	            // _setAllLayers(_layers.evacuation_order_lift_preparing_zone, _map);
	            // _setAllLayers(_layers.residential_restrict_zone, _map);
	            // _setAllLayers(_layers.homing_difficulty_zone, _map);
			}
			else if(_city == 'namie')
			{
				//hide the minamisoma toggle checkboxes
				$('#layer-toggle-minamisoma-evacuation').hide();
				$('#layer-toggle-minamisoma-homing').hide();
				$('#layer-toggle-minamisoma-residential').hide();
				$('#layer-toggle-minamisoma-school').hide();
				//also hide the dates that do not have measurements for Namie City
				$('#dropdown-2012_Q1').hide();
				$('#dropdown-2012_01').hide();
				$('#dropdown-2012_02').hide();
				$('#dropdown-2012_03').hide();
			}
			else if(_city == 'naraha')
			{
				//hide the minamisoma toggle checkboxes
				$('#layer-toggle-minamisoma-evacuation').hide();
				$('#layer-toggle-minamisoma-homing').hide();
				$('#layer-toggle-minamisoma-residential').hide();
				$('#layer-toggle-minamisoma-school').hide();
				//also hide the dates that do not have measurements for Namie City
				$('#dropdown-2012_Q1').hide();
				$('#dropdown-2012_01').hide();
				// $('#dropdown-2012_02').hide();
				$('#dropdown-2012_03').hide();
				$('#dropdown-2012_08').hide();
			}
            _setAllLayers(_layers.japan_cities, _map);
			
			$("#legend-container").click(_clickHandler);
		}
	}	
})();
