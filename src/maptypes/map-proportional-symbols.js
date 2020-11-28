import { scaleSqrt } from "d3-scale";
import * as mt from '../core/stat-map-template';
import * as lgps from '../legend/legend-proportional-symbols';


export const map = function () {

	//create map object to return, using the template
	const out = mt.mapTemplate(true);

	//out.psShape_ = CIRCLE; //TODO specify other shapes than simply circles
	out.psMaxSize_ = 30;
	out.psMinSize_ = 0.8;
	out.psMinValue_ = 0;
	out.psFill_ = "#B45F04";
	out.psFillOpacity_ = 0.7;
	out.psStroke_ = "#fff";
	out.psStrokeWidth_ = 0.3;
	//the classifier: a function which return a class number from a stat value.
	out.classifier_ = undefined;


	/**
	 * Definition of getters/setters for all previously defined attributes.
	 * Each method follow the same pattern:
	 *  - There is a single method as getter/setter of each attribute. The name of this method is the attribute name, without the trailing "_" character.
	 *  - To get the attribute value, call the method without argument.
	 *  - To set the attribute value, call the same method with the new value as single argument.
	*/
	["psMaxSize_","psMinSize_","psMinValue_","psFill_","psFillOpacity_","psStroke_","psStrokeWidth_","classifier_"]
	.forEach(function(att) {
		out[att.substring(0, att.length - 1)] = function (v) { if (!arguments.length) return out[att]; out[att] = v; return out; };
	});

	//override of some special getters/setters
    out.legend = function (v) {
		if (!arguments.length) {
			//create legend if needed
			if(!out.legend_) out.legend_ = lgps.legendProportionalSymbols(out);
			return out.legend_;
		}
		//setter: link map and legend
		out.legend_ = v; v.map(out);
		return out;
	};



	//@override
	out.updateClassification = function () {
		//get max value
		const maxValue = Object.values(out._statDataIndex).map(s=>s.value).filter(s=>(s==0||s)).reduce( (acc,v) => Math.max(acc,v), 0);
		//define classifier
		out.classifier( scaleSqrt().domain([out.psMinValue_, maxValue]).range([out.psMinSize_ * 0.5, out.psMaxSize_ * 0.5]) );
		return out;
	};



	//@override
	out.updateStyle = function () {
		//see https://bl.ocks.org/mbostock/4342045 and https://bost.ocks.org/mike/bubble-map/

		//set circle radius depending on stat value
		out.svg().select("#g_ps").selectAll("circle.symbol")
			.transition().duration(out.transitionDuration())
			.attr("r", function (rg) {
				const sv = out.getStat(rg.properties.id);
				if( !sv || !sv.value ) return 0;
				return out.classifier()(+sv.value);
			})

			//TODO no need to execute that everytime stat values change - should be extracted somewhere else. Use a new "updateStaticStyle" function?
			.style("fill", out.psFill_)
			.style("fill-opacity", out.psFillOpacity_)
			.style("stroke", out.psStroke_)
			.style("stroke-width", out.psStrokeWidth_);

        return out;
	};


    return out;
}
