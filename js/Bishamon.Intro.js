namespace.request("Intro", Bishamon);

Bishamon.Intro = (function () {
	var _show = function () {
		
		$('#modal-intro').modal({
			keyboard: false,
			backdrop: 'static'
		})
	};

	return {
		init: function (_city) {
			_show();
			
			//change city in intro box
			if(_city.name == 'namie')
			{
				$('.display-city').html('浪江町')
			}

			if(_city.name == 'naraha')
			{
				$('.display-city').html('楢葉町')
			}

			//Translate
			
			
		}
	}
})();
