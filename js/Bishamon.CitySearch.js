namespace.request('CitySearch', Bishamon);

Bishamon.CitySearch = (function () {
	var _map = null,
		_bounds = null,
		_autoCompleteOptions = null,
		_autoComplete = null,
		_searchMaker = null,
		_searchShowing = false,
		_infoWindow = null
		;
	
	var _parseResponse = function () {
		//close modal
		$('#modal-search').modal('toggle');

		var place = _autoComplete.getPlace();
		var lat = place.geometry.location.lat();
		var lng = place.geometry.location.lng();

		if (place.geometry.viewport) 
		{
			_map.fitBounds(place.geometry.viewport);
		} 
		else 
		{
			_map.setCenter(place.geometry.location);
			_map.setZoom(17);  // Why 17? Because it looks good.
			$('#coords').html(lat + ', ' + lng);
		}

		var image = new google.maps.MarkerImage(
			place.icon,
			new google.maps.Size(71, 71),
			new google.maps.Point(0, 0),
			new google.maps.Point(17, 34),
			new google.maps.Size(35, 35)
		);
		_searchMaker.setIcon(image);
		_searchMaker.setPosition(place.geometry.location);

		var address = '';
		if (place.address_components) 
		{
			address = [(place.address_components[0] &&
					place.address_components[0].short_name || ''),
				(place.address_components[1] &&
					place.address_components[1].short_name || ''),
				(place.address_components[2] &&
					place.address_components[2].short_name || '')
			].join(' ');
		}

		_infoWindow.setContent('<div style="font-size:14px; font-family:\'san-serif\'"><strong>' + place.name + '</strong><br>' + address);
		_infoWindow.open(_map, _searchMaker);
		_showSearch();
	};
	var _showSearch = function () {
		var imageSource = "images/";
		if(!_searchShowing) {
			$('#search-container').fadeIn();
			imageSource += "close.png";
		} else {
			$('#search-container').fadeOut();
			imageSource += "search.png";
		}
		$("#search-toggle > img").attr('src', imageSource);
		_searchShowing = !_searchShowing;
	}
	return {
		init: function ($map, $bounds) {
			_map = $map;
			_bounds = $bounds;
            $("#search-toggle").click(_showSearch);
			// TODO: will this cause a bug? Bounds may be restricted to the 
			// initial map bounds if a URL is specified
			_autoCompleteOptions = {
				bounds: _bounds
			};
			var input = document.getElementById('location');	
			
			_autoComplete = new google.maps.places.Autocomplete(input, _autoCompleteOptions);

			_infoWindow = new google.maps.InfoWindow();
			_searchMaker = new google.maps.Marker({
				map: _map
			});

			//Autocomplete
			google.maps.event.addListener(_autoComplete, 'place_changed', _parseResponse);
	
		}
	}
	})();