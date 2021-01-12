import { select } from "d3-selection";

/**
 * A eurostat-map legend. This is an abstract method.
*/
export const legend = function (map, config) {

	//build legend object
	const out = {};

	//link map to legend
	out.map = map;

	//the SVG where to make the legend
	out.svgId = "legend_" + Math.round(10e15 * Math.random());
	out.svg = undefined;
	out.lgg = undefined;

	//the legend element position, in case it is embeded within the map SVG
	out.x = undefined;
	out.y = undefined;

	//the legend box
	out.boxMargin = 10;
	out.boxPadding = 7;
	out.boxCornerRad = 7;
	out.boxFill = "#eeeeee";
	out.boxOpacity = 0.5;

	//font
	out.fontFamily = "Helvetica, Arial, sans-serif";

	//legend title
	out.title = "";
	out.titleFontSize = 15;

	/** Build legend. */
	out.build = function () {
		//set SVG element and add main drawing group
		out.svg = select("#" + out.svgId);
		out.lgg = out.svg.append("g").attr("id", "g_" + out.svgId);
	}

	/**
	 * Update the legend element.
	 * This is an abstract method to be defined for each specific legend.
	 */
	out.update = function () {
		console.log("Legend update function not implemented")
		return out;
	};



	/** Draw legend background box */
	out.makeBackgroundBox = function(){
		out.lgg.append("rect")
			.attr("id", "legendBR")
			.attr("rx", out.boxCornerRad)
			.attr("ry", out.boxCornerRad)
			.style("fill", out.boxFill)
			.style("opacity", out.boxOpacity);
	}	

	/** Set legend box dimensions, ensuring it has suitable dimensions to fit to all legend graphic elements */
	out.setBoxDimension = function() {
		//get legend elements bounding box
		const bb = out.lgg.node().getBBox({stroke:true});
		//apply to legend box dimensions
		const p = out.boxPadding;
		out.svg.select("#legendBR")
			.attr("x",bb.x-p).attr("y",bb.y-p).attr("width", bb.width+2*p).attr("height", bb.height+2*p)
	}

	return out;
}
