namespace.request("GridLayer", Bishamon);

Bishamon.GridLayer = (function ($map, $options, $date, $dateSelector) {
    var _map = $map,
        _otherMap = $options.alsoUpdate,
        _dateSelector = $options.dateSelectSelector,
        _dateDisplaySelector = $options.dateDisplaySelector,
        _radioPrefix = $options.radioPrefix,
        _activeLayers = [],
        _radiationMarkers = [],
        _radiationMarkerStyle = {
            icon: 'images/radiationmarker.png',
            labelContent: "",
            labelAnchor: new google.maps.Point(12, 30),
            labelClass: "labels", // the CSS class for the label
            labelInBackground: false
        },
        _distances = ['3200', '1600', '800', '400', '200', '100', 
            '50'//, 'RadPoints'
        ],
        _layers = {
            '3200': {
                'timeIds' : {
                    '2011_Q4' : 3431586, 
                    '2012_01' : 3439381,
                    '2012_02' : 3439392,
                    '2012_03' : 3447784,
                    '2012_Q1' : 3448839,
                    '2012_08' : 5116624,
                    '2012_Q3' : 5417690,
                    '2013_Q1' : 20133200,
                    '2013_09' : 2013093200,
                    '2014_08' : 2014083200
                }
            }, 
            '1600' : {
                'timeIds' : {
                    '2011_Q4' : 3432120, 
                    '2012_01' : 3440149,
                    '2012_02' : 3440067,
                    '2012_03' : 3448832,
                    '2012_Q1' : 3448255,
                    '2012_08' : 5116625,
                    '2012_Q3' : 5418950,
                    '2013_Q1' : 20131600,
                    '2013_09' : 2013091600,
                    '2014_08' : 2014081600
                }
            }, 
            '800': {
                'timeIds' : {
                    '2011_Q4' : 3430970, 
                    '2012_01' : 3440150,
                    '2012_02' : 3439391,
                    '2012_03' : 3448238,
                    '2012_Q1' : 3448840,
                    '2012_08' : 5116521,
                    '2012_Q3' : 5417972,
                    '2013_Q1' : 2013800,
                    '2013_09' : 201309800,
                    '2014_08' : 201408800
                }
            },
            '400': {
                'timeIds' : {
                    '2011_Q4' : 3448257,
                    '2012_01' : 3441124,
                    '2012_02' : 3441218,
                    '2012_03' : 3446688,
                    '2012_Q1' : 3446698,
                    '2012_08' : 5116724,
                    '2012_Q3' : 5419936,
                    '2013_Q1' : 2013400,
                    '2013_09' : 201309400,
                    '2014_08' : 201408400
                }
            },
            '200': {
                'timeIds' : {
                    '2011_Q4' : 3430853, 
                    '2012_01' : 3440056,
                    '2012_02' : 3441152,
                    '2012_03' : 3448237,
                    '2012_Q1' : 3447798,
                    '2012_08' : 5117320,
                    '2012_Q3' : 5425574,
                    '2013_Q1' : 2013200,
                    '2013_09' : 201309200,
                    '2014_08' : 201408200
                }
            },
            '100': {
                'timeIds' : {
                    '2011_Q4' : 3431045,
                    '2012_01' : 3441212,
                    '2012_02' : 3440157,
                    '2012_03' : 3448436,
                    '2012_Q1' : 3448452,
                    '2012_08' : 5116522,
                    '2012_Q3' : 5429704,
                    '2013_Q1' : 2013100,
                    '2013_09' : 201309100,
                    '2014_08' : 201408100
                }
            },
            '50': {
                'timeIds' : {
                    '2011_Q4' : 3431044,
                    '2012_01' : 3441213,
                    '2012_02' : 3441151,
                    '2012_03' : 3448437,
                    '2012_Q1' : 3526051,
                    '2012_08' : 5116523,
                    '2012_Q3' : 5425882,
                    '2013_Q1' : 201350,
                    '2013_09' : 20130950,
                    '2014_08' : 20140850
                }
            } 
        },
        _encryptedLayerIDs = {
            3431045 : "1IMVQoGnuyymp_e-HPYyVJkdukjyjLzupWdR38hM",
            3432120 : "1qnWNGR9XuCXvXiIX1xxvE_SWNhexqBvgmPNFYzE",
            3430853 : "13yRez17ZAXFmoUw7upzX0QK2Uqa1lU9e7EdxfFM",
            3431586 : "1w_0igoPBmZidPZVWz5X64KV3z5EGkjvvRpwJwaw",
            3448257 : "12KbaPUaUd-N_rcM_lT3mXrKwmI5AFWgdxZVr7II",
            3431044 : "1VHVI3SRMStPwOSBZ4exdnKzNXAg1d9Bh4WtoMh0",
            3430970 : "1COhJbfBRkEXtZA_Y_NAJDTChTOuWvD8N3SmIEhQ",
            3441212 : "1vP5Sk1CbHoJO_nkLtNcQ5vhlOJNiKJy9mqqZZ4o",
            3440149 : "1oViSWCd4OmE_eRTd7UEaKAV4J8CpoXhr0i-eGWQ",
            3440056 : "16oU_CteDUgru7nPylAK_UoD4_HE5h3mIqgyVEyQ",
            3439381 : "1pFvMqZZ9emoEORTRySRsjgEHb2Jkmy-4m6GuFLk",
            3441124 : "1TMsIC4sxlzxHXGF3GxZ-C-G4aniYNIUWtY8aRMs",
            3441213 : "12eaAZaieAXPCbpipyh-cHnkErC4lppocPrFP4eM",
            3440150 : "1v7pjyVYCtmi-ZwbXiREdOCPCqIiTv476_FecBCs",
            3440157 : "1terhA-47NYGxAWpB6KahG7VSyuFrl_B2TgR5oiY",
            3440067 : "1B7-OeIzJm-bCsYOoGX_9L6sbMsXOyVeKA27x5i4",
            3441152 : "1Uyei3aWE_9UNh8_EEiCUgSabyJSdjY7V32zhF6Y",
            3439392 : "1M8pdBa7AIrJamYIN0Y1MdDDsqpJLZlbuRujqN-0",
            3441218 : "1SK5wa5W9TqWjWkTevCu6QqvGvbCbhNwaHchMdjQ",
            3441151 : "1w60w6h3W6Vn7SqgW0bZod4-o_pCe22Y9tIEM7iA",
            3439391 : "1pz6OxnxjGLFmL2OCQHynlfb2jtgEQkASRY9X0-Q",
            3448436 : "1mf5OvOP2vUazl3jq-eAzUe-AVp3AC3IIas2c9J4",
            3448832 : "10C8K4D-IboyKpQorXZcqW9SmwX9k8fF-41S760M",
            3447784 : "1UoL7S1ibqpckNqpnTfTrHukKi9J-0zZE30cUFKI",
            3446688 : "1Ust_pqdiAcQPmJ7QxmWlVnmyYTNTzp_aCLZ5DLw",
            3448237 : "102gcS0T-WjJw-clXbflEgWssqpZJYdWbdj56-Go",
            3448437 : "1LhP-B2K1kF_2oqNHIBzwCsFpTrsQH8OYYRozjSQ",
            3448238 : "1Aswd2dUa9VqQLMjnHQNbtRV5gixBvt8v2zLfMU8",
            5116522 : "1uaVq5N8Il3hsQhY6MfNavKvqWOjb4VwtjONhz44",
            5116625 : "1X8mv5uOXb9PL77HDS9EoYbSt4vzoEi3rwH-janw",
            5117320 : "1ipdAKA-9jFsV_i1QkSzSdKe2mqSEUtZ9EIwY8O0",
            5116624 : "1_d6GqubtxNYLHzp4J5CbeDy6zfBSWy2mo6Ohjqk",
            5116724 : "1NEBX6BLMQUsfPhy_RbN3CoFYk8viJLODd5BPb7c",
            5116523 : "1UXf1YfpUrNFp_6TkUreQJqz1kl3FJzNpKPuvIS8",
            5116521 : "1haa8I_xqf7HfanVtTPP8_zPz8yG0a4wlOwQAzws",
            3448452 : "1LbjSrgAr5tpY9zV0SdlWXHzSrVjm3h_RU5O2QEs",
            3448255 : "138npl-rb1IFzX8p1yBeL5CoY-tTRhDhvOizcwSg",
            3447798 : "1-tQGILZZ0Kt54ikW6bns7kw1ssa45UJqJRJ7YSY",
            3448839 : "1FCDGpIXX_aapH_NU09UmyyONZA_0KGwtQIZfxcw",
            3446698 : "1UzRksUOxHvmKA0q8vVrG2L81MO_tUzYx0pikmr0",
            3526051 : "1k4AnPWMrndYlrw-9zvJFRd4TJyOss3t8Qd5Tn3s",
            3447799 : "1MHEk95o-jVBLOsivLHvndQvUIv3Rfe-mQps36tE",
            3448840 : "1Yk6M8jikQbbyRcYPy4fEM2pH4DUIT5dcOl8ZUHY",
			
            //2012 Q3
            // 5417690 : "1ZSQLIiI2oiD3VoIVE_iHtH_qFlS1Tmw3gZ2wC6A",   //3200
            // 5418950 : "1YUKhl3D1grRoV4zKz0x81keZ0E6vFvW1wce_uXI",   //1600
            // 5417972 : "1o4N6Ofb0F1_duRSHtxUmpeSlGGIfS2YNBeWnwvU",   //800
            // 5419936 : "1UAEJ0II3o0KKOuNx6OakM6Ew8KKrpFdn1PZnv7I",   //400
            // 5425574 : "1ES-NoqHpMDbxTpsynCJkbLIQdzxDU_ptTH5l4B8",   //200
            // 5429704 : "13ePoQrGl4eB7whlYqYsqEmPYC4nzadnlz0LtXO0",   //100
            // 5425882 : "19-hf9I4XjXqn3LzU7py-ch4AqwX07v55Hfjux9I",   //50

            //2012 Q3
            5417690 : "1-FPaO11UjeRKV3TUJxc_bZgGm1X1sYL7FCAKk1FC",   //3200
            5418950 : "1QBIwca2jwArlqvpkNqGAbegLAKXDp6Gp54kcRZa2",   //1600
            5417972 : "18iHkje5DtsXWrCFP9Z3nVSuos12voWDQ5yXaF1WQ",   //800
            5419936 : "133rZ42FvoTGpmVwhH-WI1Xw2wlWAP5TS7soFaRuQ",   //400
            5425574 : "11V3JohOwLBh6HJuyXhOPq8OxyimcRwzypWxxLQuK",   //200
            5429704 : "1KnM0NBqCV4ATVdF4quWfFIhcaA8qJUD9CrgcoLyC",   //100
            5425882 : "17bzJq_szmiHTT5pBIEXW4Fx6mubkIU6C4iBi67a-",   //50


            20133200    : "1om6oH9XvFiUj6KdPjE46Hsc6PeEtnaScrS02jJ0", 
            20131600    : "1rIPbZ_ukTO9-lLnJWksfNOO6vRAO45kwY4Mtaeo",
            2013800 : "16qf6cfCQcKWxnFt1jHF2X8cQH6_2gVfujz6ydZU",
            2013400 : "1zCt8JsXbMcf9ULttacu0Mxx3SL_Rzl8RQZTaqx4",
            2013200 : "1tdQHHBH362582zWJ2LfGt7f0A_aA_KMY1mZhGvc",
            2013100 : "1YJY-3Mp_7-wffn9IWrb7RQh7B4I7yUryRgjAyOo",
            201350  : "14sUCCKdGRlY5aUVSoqJ1zWakE13KihwedgGC5A8",
            
			// updated again 2013 11 14
			2013093200   : "1u-b-XQXUntwJBZOQZ8p8rDc2YGT8u1VMyo7NvhU", 
			2013091600   : "1kEuUUuL2pSOJXeKoS9BwndJD8QHPOKFUVoS4dIM",
			201309800    : "1IDGGq08JM1upg7vARoRt3GmLY8ca1UT7sruLvwI",
			201309400    : "1CWJ4UcMaKTaa6clrWgCToEZ9Rx-LDtBt1jFlcaU",
			201309200    : "1Ec_Q508zV_njYdP4y1mC5bd-Qct8CtZ39pq67kM",
			201309100    : "1Jdrx3256gFzdMnLhuWwYlDAa4li39GjRkpWlTLI",
			20130950     : "1Oyj6Y-97dh2ZUSOM54GN3Mis2ckzxeVqDvJs8uI",

			// updated again 2014 09 19
			// 2014083200   : "1gkvjdFLbfT8joATd7XwVLPQc1XMrS6EdLu3xfnxE", 
			// 2014081600   : "1uX6Nwf_TrMltYDGVkhoGNGYuIWOfi8zJVq-zY1pk",
			// 201408800    : "11n1PmbAK39S97HmPU_wXqxWIpupJSPLyRkhS48O-",
			// 201408400    : "1a1HH_D9BulkagSx1U1W3f4lru_dAxh-enOplb2zt",
			// 201408200    : "1RAROicb0jUoP9Pg2XhyZhVhT2nIwA6pZGLHYUNVz",
			// 201408100    : "1TXnYDFVXXjyCB6WCIKbKW1OBQDhgWFtFbGk1zPYc",
			// 20140850     : "1nxDkChwPtU2xVNYKttnT7CvxFZtrLx_bVJo9A7g-"

			// updated again 2014 09 24
			2014083200   : "1xhSB8qzvOy-aYX9uyClwxFznubhVnGwcK_-rUL1x", 
			2014081600   : "1fEAMbEAMq6ibFVPVKg7dTv9m1iVooYHGOUjZdt6H",
			201408800    : "1AGdM4diNYAkdvzF0BB0nZ97YFUNtP_FbvhaBNygy",
			201408400    : "11GeT2daPWRzc_g8i6MiUnPTXY6v-9yzb5fCe0wu0",
			201408200    : "1n2DsB9RKhFaPAvjcLsL1tMWdl-RS2eNvsCSywqhz",
			201408100    : "1969ivoZuJVpvXGvq589RTuL3yMcWl2K7RVuFeoSg",
			20140850     : "1q-wyCfuczMQ8YXA-7Ar26a4pHQJEXISWhvP4mMQw"

			
        },
        _clipToCity = $options.clipToCity,
        _cityClipPoints = $options.cityClipPoints
        ;
        

    // begin private methods

    var _regenerateQuery = function ($layer, $select, $date, $clip) {
        return {
            query: {
                select: $select,
                from: _encryptedLayerIDs[$layer.timeIds[$date]],
                where: $clip
            }
        }
    };

    var _deferredDisplayRadiationMarker = function ($data) {
        return function ($e) {
            if (typeof $e.error != "undefined") {
                alert($e.error);
                return;
            }
            // There may not be any data for this layer at this point. If so,
            // fail silently.
            if (typeof $e.rows == "undefined") {
                return;
            }
            var marker = new MarkerWithLabel(_radiationMarkerStyle),
                index = _radiationMarkers.push(marker) - 1,
                radiation = $e.rows[0][1]
                ;

            _radiationMarkers[index].setPosition(new google.maps.LatLng(
                $data.latLng.lat(), $data.latLng.lng())
            );
            _radiationMarkers[index].set('labelContent', 
                Math.round(radiation * 100)/100
            );
            _radiationMarkers[index].setMap(_map);
            
            // var breakPoint = Bishamon.RadiationSlider.getRadiationBreakpoint(
            var color = Bishamon.RadiationSlider.getRadiationBreakpoint(
                Math.round(radiation * 100)/100
            );
            _radiationMarkers[index].setOptions({
                icon: 'images/radiationmarker_' + color.fileKey + '.png'
            });
            
            $('#radiationmarkerimage').attr('src',
                'images/radiationmarker_' + color.fileKey + '.png'
            ); 
            $('#micro-radiation').css('color', color.color);
            
            //Let user delete the marker by clicking on it again
            google.maps.event.addListener(_radiationMarkers[index],
                'click', function() { 
                    _radiationMarkers[index].setMap(null); 
                }
            );
        }
    }

    var _displayRadiationMarker = function ($e) {
			
        var samples = '';

        if(typeof $e.row.Join_Count !== "undefined") {
            samples = $e.row.Join_Count.value;
        }
        $('#micro').show();
        $('#micro-radiation').html(Math.round($e.row.radiation.value*100)/100);
        
		var extrahtml = '';
		//show city and count if it exists
		if(typeof $e.row.PREF !== "undefined") 
		{
			extrahtml = '<div style="font-size:24px;color:#fff;">' + $e.row.PREF.value + ' ' + $e.row.CITY2.value + '</div>';
		} 

		if(typeof $e.row.Join_Count !== "undefined") 
		{
			extrahtml += '( 測定ポイント数 ' + $e.row.Join_Count.value+' )';
		} 

		$('#micro-extra').html(extrahtml);
        $('#micro-samples').html(samples);
        $('#micro-instructions').hide();
		
        var marker = new MarkerWithLabel(_radiationMarkerStyle);
        var index = _radiationMarkers.push(marker);
        _radiationMarkers[index-1].setPosition(new google.maps.LatLng(
            $e.latLng.lat(), $e.latLng.lng())
        );
        _radiationMarkers[index-1].set('labelContent', 
            Math.round($e.row.radiation.value*100)/100
        );
        _radiationMarkers[index-1].setMap(_map);
        
        // var breakPoint = Bishamon.RadiationSlider.getRadiationBreakpoint(
        var color = Bishamon.RadiationSlider.getRadiationBreakpoint(
            Math.round($e.row.radiation.value*100)/100
        );
        _radiationMarkers[index-1].setOptions({
            icon: 'images/radiationmarker_' + color.fileKey + '.png'
        });
        
		$('#radiationmarkerimage').attr('src',
            'images/radiationmarker_' + color.fileKey + '.png'
        ); 
        $('#micro-radiation').css('color', color.color);
		
        //Let user delete the marker by clicking on it again
        google.maps.event.addListener(_radiationMarkers[index-1],
            'click', function() { 
                _radiationMarkers[index-1].setMap(null); 
            }
        );
    };
	
    var _layerZoomLevels = {
        '10' : '1600',
        '11' : '800',
        '12' : '400',
        '13' : '200',
        '14' : '100',
        '15' : '50',
        '16' : '50'
    };
    var _selectLayerToShow = function ($styles) {
        if ($styles != undefined) {
            var keys = [];
            for (var i in $styles) {
                keys.push(i);
            }
            keys.sort();
            var styles = [];
            for (var i in keys) {
                styles.push($styles[keys[i]]);
            }
            for (var d in _layers) {
				if (d != "RadPoints") _layers[d].layerObject
                    .setOptions({styles: styles});
            }
        }

        for (var l in _activeLayers) {
            _layers[_activeLayers[l]].layerObject.setMap(null);
        }
        _activeLayers = [];
        var zoom = _map.getZoom();

        if (zoom < 10) {
            _activeLayers.push(3200);
        } else if (zoom >= 10 && zoom <= 16) {
            _activeLayers.push(_layerZoomLevels[zoom]);
        } else if (zoom >= 17) {
            _activeLayers.push(50);
        }
        for (var l in _activeLayers) {
            _layers[_activeLayers[l]].layerObject.setMap(_map);
        }
    }

    /**
	 * Date is provided in element ID, like "radio-2011_Q4"
	 */
    var _changeDate = function ($id) {
		//toggle button classes
		$(_dateSelector).find('.active').removeClass('active');
		$('#'+ $id).addClass('active');
		$(_dateDisplaySelector).text($('#' + $id).text());
        //dual

        var date = $id.split("-")[1];	
        if (date == undefined) {
            date = $id;
        }
        for (var l in _layers) {
            var layer = _layers[l],
                select = (l == "RadPoints") ? 'Latitude' : 'geometry',
                clip = (l == "RadPoints") ? _cityClipPoints : _clipToCity ;
            layer.layerObject.setOptions(_regenerateQuery(layer, select, date, clip));
        }	
    };

    var _clickHandler = function ($e) {
        var id = $e.target.id;
        _changeDate(id);
        $e.stopPropagation();
        return false;
    };

    // event listener on date drop down
    $(_dateSelector).click(_clickHandler);

    // default grid layer
    var date = $date;
    if (typeof $options["city"] != "undefined") {
        date =  ((typeof Bishamon.Config[$options.city] != "undefined") 
                ? Bishamon.Config[$options.city].GridLayer.defaultDate
                : date)
        ;
    }
    // Add Fusion Table layer objects and event listeners
    for (var i in _distances) {
        var distance = _distances[i];
        _layers[distance].layerObject = new google.maps.FusionTablesLayer({
            clickable: true,
            suppressInfoWindows: true 
        });
        google.maps.event.addListener(_layers[distance].layerObject,
            'click',
            function ($e) {
                _displayRadiationMarker($e);
//                google.maps.event.trigger(_otherMap, "click", $e);
                if (Bishamon.getMode() == 'Dual map') {
                    _otherMap.showRadMarker($e);
                }
            }
        );
    }

    _changeDate(_radioPrefix + "radio-" + date);

    // On zoom end, redraw layer and erase all markers
    Bishamon.registerRefreshAction(function () {
        _selectLayerToShow();
        for (var i in _radiationMarkers) {
            _radiationMarkers[i].setMap(null);
        }
        _radiationMarkers = [];
        $('#micro-radiation').html(''); //erase the existing radiation reading
        $('#micro-extra').html(''); //erase the existing radiation reading
    });


    // end Constructor
    return {
        alsoUpdate: function ($map) {
            _otherMap = $map;
        },
        showRadMarker: function ($e) {
            var x = "SELECT Join_Count,radiation,geometry FROM " 
                        + "1LbjSrgAr5tpY9zV0SdlWXHzSrVjm3h_RU5O2QEs " 
                        + " WHERE ST_INTERSECTS(geometry,CIRCLE(LATLNG("
                        + $e.latLng.lat() + "," + $e.latLng.lng() + "),0.00001))"; 
            var activeTime = $(_dateSelector).find("a.active").attr("id").split("-")[1];
            for (var l in _activeLayers) {
                $.get( "https://www.googleapis.com/fusiontables/v1/query?callback=?", {
                        sql: "SELECT Join_Count,radiation,geometry FROM " 
                            + _encryptedLayerIDs[_layers[_activeLayers[l]]["timeIds"][activeTime]]
                            + " WHERE ST_INTERSECTS(geometry,CIRCLE(LATLNG("
                            + $e.latLng.lat() + "," + $e.latLng.lng() + "),10))",
                        key: "AIzaSyDyQm0_KZjkKaAZqtC159ymVloDxb7m1Y4"
                    },
                    _deferredDisplayRadiationMarker($e),
                    "json"
                )
//                google.maps.event.trigger(
//                    _layers[_activeLayers[l]].layerObject, "click", {latLng: $e.latLng} 
//                );
            }
        },
        redraw: function ($styles) {
            _selectLayerToShow($styles);
        }
    }
});
