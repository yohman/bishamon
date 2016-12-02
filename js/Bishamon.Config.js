namespace.request("Config", Bishamon);

/**
 * The general format for these:
 * cityName: {
 *  moduleName: {
 *   option1: {
 * ....
 */
Bishamon.Config = {

    namie: {
        GridLayer: {
            defaultDate: "2012_Q3"
        },
        RadiationSlider: {
            maxRange: 15.0,
            catRanges: [0.23, 3.8, 9.5, 12]
        }
    },
    naraha: {
        GridLayer: {
            defaultDate: "2012_02"
        }
    },
    minamisoma: {
        GridLayer: {
            defaultDate: "2016"
        }
    } 

};
