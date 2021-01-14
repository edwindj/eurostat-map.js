import { select } from "d3-selection";
import { format } from "d3-format";
import * as lg from '../core/legend';

/**
 * A legend for choropleth maps
 * 
 * @param {*} map 
 */
export const legendChoropleth = function (map, config) {

	//build generic legend object for the map
	const out = lg.legend(map, config);

	//the order of the legend elements. Set to false to invert.
	out.ascending1 = true;
	out.ascending2 = true;

	out.shapeSize = 20;

	//the font size of the legend label
	out.labelFontSize = 12;

	//show no data
	out.noData = true;
	//no data text label
	out.noDataText = "No data";

	//override attribute values with config values
	if(config) for (let key in config) out[key] = config[key];


	//@override
	out.update = function () {
		const m = out.map;
		const svgMap = m.svg();
		const lgg = out.lgg;
		const clnb = m.clnb();

		//remove previous content
		lgg.selectAll("*").remove();

		//draw legend background box
		out.makeBackgroundBox();

		//draw title
		if(out.title)
			lgg.append("text").attr("x", out.boxPadding).attr("y", out.boxPadding + out.titleFontSize)
			.text(out.title)
			.style("font-size", out.titleFontSize).style("font-weight", out.titleFontWeight)
			.style("font-family", out.fontFamily).style("fill", out.fontFill)

		//set font family
		lgg.style("font-family", out.fontFamily);

		//the vertical position of the legend element
		let y = out.boxPadding + (out.title? out.titleFontSize + out.boxPadding : 0);

		for(let i=0; i<clnb; i++)
			for(let j=0; j<clnb; j++) {

				//the class numbers, depending on order
				const ecl1 = out.ascending1? clnb-i-1 : i;
				const ecl2 = out.ascending2? clnb-j-1 : j;

				//draw rectangle
				lgg.append("rect").attr("x", out.boxPadding+(clnb-1-i)*out.shapeSize).attr("y", y+j*out.shapeSize)
				.attr("width", out.shapeSize).attr("height", out.shapeSize)
				.attr("fill", m.classToFillStyle()(ecl1,ecl2))
			}


		//frame
		lgg.append("rect").attr("x", out.boxPadding).attr("y", y)
		.attr("width", out.shapeSize * clnb).attr("height", out.shapeSize * clnb)
		.attr("fill", "none").style("stroke", "black").attr("stroke-width", 0.5)

			//rectangle
			/*/lgg.append("rect").attr("x", out.boxPadding).attr("y", y)
			.attr("width", out.shapeWidth).attr("height", out.shapeHeight)
			.attr("fill", m.classToFillStyle()(ecl, m.clnb()))
			.on("mouseover", function () {
				const sel = svgMap.select("#g_nutsrg").selectAll("[ecl='" + ecl + "']");
				sel.style("fill", m.nutsrgSelFillSty());
				sel.attr("fill___", function (d) { select(this).attr("fill"); });
				select(this).style("fill", m.nutsrgSelFillSty());
			})
			.on("mouseout", function () {
				const sel = svgMap.select("#g_nutsrg").selectAll("[ecl='" + ecl + "']");
				sel.style("fill", function (d) { select(this).attr("fill___"); });
				select(this).style("fill", m.classToFillStyle()(ecl, m.clnb()));
			});

			//separation line
			if(i>0)
				lgg.append("line").attr("x1", out.boxPadding).attr("y1", y).attr("x2", out.boxPadding+out.sepLineLength).attr("y2", y)
				.attr("stroke", out.sepLineStroke).attr("stroke-width", out.sepLineStrokeWidth);

			//label
			if(i<m.clnb()-1)
				lgg.append("text").attr("x", out.boxPadding+Math.max(out.shapeWidth, out.sepLineLength)+out.labelOffset).attr("y", y+out.shapeHeight)
				.attr("alignment-baseline", "middle")
				.text( f( m.classifier().invertExtent(ecl)[ out.ascending?0:1 ] ) )
				.style("font-size", out.labelFontSize).style("font-family", out.fontFamily).style("fill", out.fontFill)
		}*/

		//'no data' legend box
		if(out.noData) {
			y = y + out.shapeSize * clnb + out.boxPadding;

			//rectangle
			lgg.append("rect").attr("x", out.boxPadding).attr("y", y)
			.attr("width", out.shapeSize).attr("height", out.shapeSize)
			.attr("fill", m.noDataFillStyle() )
			.attr("stroke", "black").attr("stroke-width", 0.5)
			.on("mouseover", function () {
				const sel = svgMap.select("#g_nutsrg").selectAll("[ecl2='nd']"); //TODO also ecl2
				sel.style("fill", m.nutsrgSelFillSty());
				sel.attr("fill___", function (d) { select(this).attr("fill"); });
				select(this).style("fill", m.nutsrgSelFillSty());
			})
			.on("mouseout", function () {
				const sel = svgMap.select("#g_nutsrg").selectAll("[ecl2='nd']"); //TODO also ecl2
				sel.style("fill", function (d) { select(this).attr("fill___"); });
				select(this).style("fill", m.noDataFillStyle());
			});
			//'no data' label
			lgg.append("text").attr("x", out.boxPadding+out.shapeSize+5).attr("y", y+out.shapeSize*0.5)
			.attr("alignment-baseline", "middle")
			.text(out.noDataText)
			.style("font-size", out.labelFontSize).style("font-family", out.fontFamily).style("fill", out.fontFill)
		}

		//set legend box dimensions
		out.setBoxDimension();
	}

	return out;
}
