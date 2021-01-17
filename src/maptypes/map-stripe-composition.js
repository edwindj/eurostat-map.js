import { select, create, arc, pie } from "d3";
import { schemeCategory10 } from "d3-scale-chromatic";
//schemeSet3 schemeDark2 schemePastel1 schemeTableau10
import * as smap from '../core/stat-map';
import * as lgscomp from '../legend/legend-stripe-composition';

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
	out.stripeWidth_ = 50;
	//orientation - vertical by default
	out.stripeOrientation_ = 0;

	//colors - indexed by dataset code
	out.catColors_ = undefined;
	//colors - indexed by dataset code
	out.catLabels_ = undefined;
	//style for no data regions
	out.noDataFillStyle_ = "darkgray";

	//labels
	out.labelText_ = {};


    /**
	 * Definition of getters/setters for all previously defined attributes.
	 * Each method follow the same pattern:
	 *  - There is a single method as getter/setter of each attribute. The name of this method is the attribute name, without the trailing "_" character.
	 *  - To get the attribute value, call the method without argument.
	 *  - To set the attribute value, call the same method with the new value as single argument.
	*/
	["stripeWidth_", "stripeOrientation_", "catColors_", "catLabels_", "noDataFillStyle_", "labelText_"]
		.forEach(function (att) {
			out[att.substring(0, att.length - 1)] = function(v) { if (!arguments.length) return out[att]; out[att] = v; return out; };
		});

	//override attribute values with config values
	if(config) ["stripeWidth", "stripeOrientation", "catColors", "catLabels", "noDataFillStyle", "labelText"].forEach(function (key) {
		if(config[key]!=undefined) out[key](config[key]);
	});


	/**
	 * 
	 * @param {*} stat 
	 * @param {*} dim 
	 * @param {*} dimValues 
	 */
	out.statComp = function(stat, dim, dimValues, labels, colors) {

		//assign stat configs
		stat.filters = stat.filters || {};
		for(let i=0; i<dimValues.length; i++) {
			//stat config by dimension value
			const dv = dimValues[i]
			stat.filters[dim] = dv
			const sc_ = {};
			for(let key in stat) sc_[key] = stat[key]
			sc_.filters = {};
			for(let key in stat.filters) sc_.filters[key] = stat.filters[key]
			out.stat(dv, sc_)

			//if specified, retrieve color
			if(colors) {
				out.catColors_ = out.catColors_ || {};
				out.catColors_[dv] = colors[i];
			}
			if(labels) {
				out.catLabels_ = out.catLabels_ || {};
				out.catLabels_[dv] = labels[i];
			}
		}

		//set statCodes
		statCodes = dimValues;

		return out;
	}


	/**  */
	let statCodes = undefined;

	/** Function to compute composition for region id, for each category */
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



	//@override
	out.updateClassification = function () {

		if(!statCodes) {
			//get list of stat codes. Remove "default".
			statCodes = Object.keys(out.statData_);
			const index = statCodes.indexOf("default");
			if (index > -1) statCodes.splice(index, 1);
		}

		return out;
	};


	//@override
	out.updateStyle = function () {

		//if not specified, build color ramp
		if(!out.catColors()) {
			out.catColors({});
			for(let i=0; i<statCodes.length; i++)
				out.catColors()[statCodes[i]] = schemeCategory10[i%12];
		}

		//initialise catlabels
		out.catLabels_ = out.catLabels_ || {};

		//build and assign texture to the regions
		out.svg().selectAll("path.nutsrg")
			.transition().duration(out.transitionDuration())
			.attr("fill", function (d) {
				const id = d.properties.id;

				//compute composition
				const comp = getComposition(id);

				//case when no or missing data
				if (!comp) return out.noDataFillStyle() || "gray";

				//make stripe pattern
				const patt = out.svg().append("pattern").attr("id", "pattern_" + id).attr("x", "0").attr("y", "0")
				.attr("width", out.stripeWidth()).attr("height", 1).attr("patternUnits", "userSpaceOnUse");
				if(out.stripeOrientation()) patt.attr("patternTransform", "rotate("+out.stripeOrientation()+")")
				let x=0;
				for(let s in comp) {
					const dx = comp[s] * out.stripeWidth();
					const col = out.catColors()[s] || "lightgray";
					patt.append("rect").attr("x", x).attr("y", 0).attr("width", dx).attr("height", 1).style("stroke", "none").style("fill", col)
					x += dx;
				}

				//return pattern reference
				return "url(#pattern_" + id + ")"
			});

		return out;
	};

	//@override
	out.getLegendConstructor = function() {
		return lgscomp.legend;
	}


	//specific tooltip text function
	out.tooltipText_ =  function (rg, map) {

		//get tooltip
		const tp = select("#tooltip_eurostat")

		//clear
		tp.selectAll("*").remove();
	
		//write region name
		tp.append("div").html("<b>" + rg.properties.na + "</b><br>");

		//TODO skip for countries
		//prepare pie chart data
		const data = []
		const comp = getComposition(rg.properties.id);
		for(const key in comp) data.push({ code:key, value:comp[key] })

		//create svg for pie chart
		//TODO center it ?
		const radius = 40, inRadius = 15;
		const svg = tp.append("svg").attr("viewBox", [-radius, -radius, 2*radius, 2*radius]).attr("width", 2*radius);

		//make pie chart. See https://observablehq.com/@d3/pie-chart
		const pie_ = pie().sort(null).value(d => d.value)
		svg.append("g")
		.attr("stroke", "white")
		.selectAll("path")
		.data( pie_(data) )
		.join("path")
		.attr("fill", d => { return out.catColors()[d.data.code] || "lightgray"} )
		.attr("d", arc().innerRadius(inRadius).outerRadius(radius) )
	};

	return out;
}
