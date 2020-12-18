import { json, csv } from "d3-fetch";
import { getEstatDataURL } from '../lib/eurostat-base';
import JSONstat from "jsonstat-toolkit";
import { csvToIndex, jsonstatToIndex } from '../lib/eurostat-map-util';

/**
 * A statistical dataset, to be used for a statistical map.
 */
export const statData = function () {

	const out = {};

	out.datasetCode_ = "demo_r_d3dens";
	out.filters_ = { lastTimePeriod: 1 };
	out.precision_ = 2;
    out.csvDataSource_ = null; //TODO decompose CSV and jsonstat types?
	out.statDataIndex_ = null;
	let jsonStatTime = undefined;

	/**
	 * Return the stat value {value,status} from a nuts id, using the index.
	 * @param {*} nutsId 
	 */
	out.getStat = (nutsId) => out.statDataIndex_ ? out.statDataIndex_[nutsId] : undefined;



	/**
	 * Return promise for Nuts2JSON topojson data.
	 */
	out.getStatDataPromise = function(nutsLvl) {

		//set precision
		out.filters_["precision"] = out.precision_;
		//select only required geo groups, depending on the specified nuts level
		out.filters_["geoLevel"] = nutsLvl + "" === "0" ? "country" : "nuts" + nutsLvl;
		//force filtering of euro-geo-aggregates
		out.filters_["filterNonGeo"] = 1;

		//retrieve stat data from Eurostat API
		return json(getEstatDataURL(out.datasetCode_, out.filters_))
	}


	out.updateStatDataB = function (nutsLvl, callback) {

		//erase previous data
		out.statDataIndex_ = null;

		if (out.csvDataSource_ == null) {
			//for statistical data to retrieve from Eurostat API
			out.getStatDataPromise(nutsLvl).then(
				function (data___) {

					//TODO overlap in indexing?
					//decode stat data
					const s = jsonstatToIndex(JSONstat(data___));
					jsonStatTime = JSONstat(data___).Dimension("time");
					//TODO: may use https://github.com/badosa/JSON-stat/blob/master/utils/fromtable.md ?
					out.statDataIndex_ = buildIndex(s);

					callback();
				});
		} else {
			//for statistical data to retrieve from custom CSV file

			//retrieve csv data
			csv(out.csvDataSource_.url).then(
				function (data___) {

					//TODO overlap in indexing?
					//decode stat data
					const s = csvToIndex(data___, out.csvDataSource_.geoCol, out.csvDataSource_.valueCol);
					//TODO directly indexed? Test and debug.
					//TODO: may use https://github.com/badosa/JSON-stat/blob/master/utils/fromtable.md ?
					out.statDataIndex_ = buildIndex( s );

					callback();
				});
		}
		return out;
	}



	/**
	 * Retrieve the time stamp of the dataset.
	*/
	out.getTime = function () {
		const t = out.filters_.time;
		if (t) return t;
		if (!out.statDataIndex_) return;
		t = jsonStatTime; //TODO test and simplify?
		if (!t || !t.id || t.id.length == 0) return;
		return t.id[0]
	};



    return out;
}




//TODO: move to em-util
//TODO: double indexing?
/**
 * 
 */
const buildIndex = function(jsonStatData) {
	//index stat values by NUTS id.
	const ind = {};
	for (const id in jsonStatData) {
		const value = jsonStatData[id];
		if (value.value != 0 && !value.value) continue;
		let v = value.value;
		if (!isNaN(+v)) { v = +v; value.value = +v; }
		ind[id] = value;
	}
	return ind;
}
