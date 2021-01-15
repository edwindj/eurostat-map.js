import * as smap from '../core/stat-map';

/**
 * Return a stripe composition map.
 * See: https://gistbok.ucgis.org/bok-topics/multivariate-mapping
 * 
 * @param {*} config 
 */
export const map = function (config) {

	//create map object to return, using the template
	const out = smap.statMap(config);

	//width of the stripes serie
	out.stripeWidth_ = 10;
	//colors - indexed by dataset code
	out.stripeColors_ = {};
	//orientation - vertical by default
	//out.stripeOrientation_ = 0;

	//style for no data regions
	out.noDataFillStyle_ = "darkgray";
	//specific tooltip text function
	//out.tooltipText_ = tooltipTextFunBiv;


    /**
	 * Definition of getters/setters for all previously defined attributes.
	 * Each method follow the same pattern:
	 *  - There is a single method as getter/setter of each attribute. The name of this method is the attribute name, without the trailing "_" character.
	 *  - To get the attribute value, call the method without argument.
	 *  - To set the attribute value, call the same method with the new value as single argument.
	*/
	["stripeWidth_", "stripeColors_", "noDataFillStyle_"]
		.forEach(function (att) {
			out[att.substring(0, att.length - 1)] = function(v) { if (!arguments.length) return out[att]; out[att] = v; return out; };
		});

	//override attribute values with config values
	if(config) ["stripeWidth", "stripeColors", "noDataFillStyle"].forEach(function (key) {
		if(config[key]!=undefined) out[key](config[key]);
	});

	//@override
	out.updateClassification = function () {
		return out;
	};


	//@override
	out.updateStyle = function () {

		//get list of stat codes. Remove "default".
		const statCodes = Object.keys(out.statData_);
		const index = statCodes.indexOf("default");
		if (index > -1) statCodes.splice(index, 1);

		//function to compute composition for region id, for each category
		const getComposition = function(id) {
			let comp = {}, sum = 0;
			for(let i=0; i<statCodes.length; i++) {
				const sc = statCodes[i]
				const s = out.statData(sc).get(id);
				if(!s || (s.value!=0 && !s.value) || isNaN(s.value)) return null;
				comp[sc] = s.value;
				sum += s.value;
			}
			if(sum == 0) return null;
			for(let i=0; i<statCodes.length; i++) comp[statCodes[i]] /= sum;
			return comp;
		}


		//build and assign texture to the regions
		out.svg().selectAll("path.nutsrg")
			.transition().duration(out.transitionDuration())
			.attr("fill", function (d) {
				const id = d.properties.id;

				//compute composition
				const comp = getComposition(id);

				//case when no or missing data
				if (!comp) return out.noDataFillStyle() || "gray";

				//make tripe texture
				//const patt = svg.append("pattern").attr("id", "pattern_" + id).attr("x", "0").attr("y", "0").attr("width", ps).attr("height", ps).attr("patternUnits", "userSpaceOnUse");
				//patt.append("rect").attr("x", 0).attr("y", 0).attr("width", ps).attr("height", ps).style("stroke", "none").style("fill", opts.bckColor)
				//patt.append("rect").attr("x", 0).attr("y", 0).attr("width", si).attr("height", si).style("stroke", "none").style("fill", opts.symbColor)

				//return "red";
				return "url(#pattern_" + id + ")"
			});


		return out;
	};

	//@override
	/*out.getLegendConstructor = function() {
		return lgchbi.legend;
	}*/

	return out;
}
