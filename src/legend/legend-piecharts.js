import { format } from "d3-format";
import { select } from "d3-selection";
import { max } from "d3-array";
import * as lg from '../core/legend';

/**
 * A legend for proportional symbol map
 * 
 * @param {*} map 
 */
export const legend = function (map, config) {

	//build generic legend object for the map
	const out = lg.legend(map);

	//spacing between color & size legends (if applicable)
	out.legendSpacing = 15;
	//the width of the legend box elements
	out.shapeWidth = 13;
	//the height of the legend box elements
	out.shapeHeight = 15;
	//the distance between consecutive legend box elements
	out.shapePadding = 5;
	//the font size of the legend label
	out.labelFontSize = 12;
	//the distance between the legend box elements to the corresponding text label
	out.labelOffset = 5;
	//show no data
	out.noData = true;
	//no data label text
	out.noDataText = "No data";
	out.titleFontSize = 12;

	//size legend config (legend illustrating the values of different symbol sizes)
	out.sizeLegend = {
		title: null,
		titlePadding: 15, //padding between title and body
		values: null
	}

	out.colorLegend = {
		title: null,
	}
	out._sizeLegendHeight = 0;

	//override attribute values with config values
	if (config) for (let key in config) {
		if (key == "colorLegend" || key == "sizeLegend") {
			for (let p in out[key]) {
				//override each property in size and color legend configs
				if (config[key][p]) {
					out[key][p] = config[key][p]
				}
			}
		} else {
			out[key] = config[key];
		}
	}


	//@override
	out.update = function () {
		const m = out.map;
		const lgg = out.lgg;

		//remove previous content
		lgg.selectAll("*").remove();

		//draw legend background box
		out.makeBackgroundBox();

		//set font family
		lgg.style("font-family", out.fontFamily);

		// legend for sizes
		buildSizeLegend(m, lgg, out.sizeLegend)

		// legend for ps color values
		buildColorLegend(m, lgg, out.colorLegend)

		//set legend box dimensions
		out.setBoxDimension();
	}

	/**
	 * Builds a legend which illustrates the statistical values of different pie chart sizes
	 * 
	 * @param {*} m map 
	 * @param {*} lgg parent legend object from core/legend.js 
	 * @param {*} config size legend config object (sizeLegend object specified as property of legend() config object)
	 */
	function buildSizeLegend(m, lgg, config) {
		let domain = m.sizeClassifier_.domain();
			//assign default circle radiuses if none specified by user
			if (!config.values) {
			  config.values = [Math.floor(domain[1]), Math.floor(domain[1] / 2), Math.floor(domain[1] / 10)]
			}
		
		//draw title
		if (config.title)
			lgg.append("text").attr("x", out.boxPadding).attr("y", out.boxPadding + out.titleFontSize)
				.text(config.title)
				.style("font-size", out.titleFontSize).style("font-weight", out.titleFontWeight)
				.style("font-family", out.fontFamily).style("fill", out.fontFill)

			//circles
			let maxSize = m.sizeClassifier_(max(config.values)); //maximum circle radius to be shown in legend
			let y = out.boxPadding + (config.title ? out.titleFontSize + out.boxPadding + config.titlePadding : 0) + (maxSize*2);
			let container = lgg
			  .append("g")
			  .attr("fill", "black")
			  .attr("transform", `translate(${maxSize + out.boxPadding},${y})`) //needs to be dynamic
			  .attr("text-anchor", "right")
			  .selectAll("g")
			  .data(config.values)
			  .join("g");
			  container
			  .append("circle")
			  .attr("fill", "none")
			  .attr("stroke", "black")
			  .attr("cy", (d) => -m.sizeClassifier_(d))
			  .attr("r", m.sizeClassifier_);
		
			//labels
			container
			  .append("text")
			  .style("font-size", out.labelFontSize)
			  .attr("y", (d, i) => {
				let y = -1 - 2 * m.sizeClassifier_(d) - out.labelFontSize;
				return y;
			  })
			  .attr("x", 30)
			  .attr("dy", "1.2em")
			  .attr("xml:space", "preserve")
			  .text((d) => {
				return d.toLocaleString("en").replace(/,/gi, " ");
			  })
			//line pointing to top of corresponding circle:
			container.append("line")
			  .style("stroke-dasharray", 2)
			  .style("stroke", "grey")
			  .attr("x1", 2)
			  .attr("y1", (d, i) => {
				let y = -1 - 2 * m.sizeClassifier_(d); //add padding
				return y;
			  })
			  .attr("xml:space", "preserve")
			  .attr("x2", 30)
			  .attr("y2", (d, i) => {
				let y = -1 - 2 * m.sizeClassifier_(d); //add padding
				return y;
			  })

			  out._sizeLegendHeight = y; //save height value for positioning colorLegend
return out;
	}


	/**
 * Builds a legend illustrating the statistical values of the pie charts' different colours
 * 
 * @param {*} m map 
 * @param {*} lgg parent legend object from core/legend.js 
 * @param {*} config color legend config object (colorLegend object specified as property of legend config parameter)
 */
	function buildColorLegend(m, lgg, config) {

		const svgMap = m.svg();

		//draw title
		if (config.title)
			lgg.append("text").attr("x", out.boxPadding).attr("y", out._sizeLegendHeight + out.legendSpacing + out.boxPadding + out.titleFontSize)
				.text(config.title)
				.style("font-size", out.titleFontSize).style("font-weight", out.titleFontWeight)
				.style("font-family", out.fontFamily).style("fill", out.fontFill)

		//set font family
		lgg.style("font-family", out.fontFamily);


		//draw legend elements for classes: rectangle + label
		let i = 0;
		const scs = m.catColors();
		for (let code in scs) {

			//the vertical position of the legend element
			const y = out._sizeLegendHeight + out.legendSpacing + out.boxPadding + (config.title ? out.titleFontSize + out.boxPadding : 0) + i * (out.shapeHeight + out.shapePadding);
			//the color
			const col = m.catColors()[code] || "lightgray";

			//rectangle
			lgg.append("rect").attr("x", out.boxPadding).attr("y", y)
				.attr("width", out.shapeWidth).attr("height", out.shapeHeight)
				.attr("fill", scs[code])
				.attr("stroke", "black").attr("stroke-width", 0.5)
				.on("mouseover", function () {
					svgMap.selectAll("pattern").selectAll("rect[code='" + code + "']")
						.style("fill", m.nutsrgSelFillSty())
					select(this).style("fill", m.nutsrgSelFillSty())
				})
				.on("mouseout", function () {
					svgMap.selectAll("pattern").selectAll("rect[code='" + code + "']")
						.style("fill", col)
					select(this).style("fill", col)
				})

			//label
			lgg.append("text").attr("x", out.boxPadding + out.shapeWidth + out.labelOffset).attr("y", y + out.shapeHeight * 0.5)
				.attr("alignment-baseline", "middle")
				.text(m.catLabels()[code] || code)
				.style("font-size", out.labelFontSize).style("font-family", out.fontFamily).style("fill", out.fontFill)
				.on("mouseover", function () {
					svgMap.selectAll("pattern").selectAll("rect[code='" + code + "']")
						.style("fill", m.nutsrgSelFillSty())
				})
				.on("mouseout", function () {
					const col = m.catColors()[code] || "lightgray";
					svgMap.selectAll("pattern").selectAll("rect[code='" + code + "']")
						.style("fill", col)
				})

			i++;
		}

		//'no data' legend box
		if (out.noData) {
			const y = out._sizeLegendHeight+ out.legendSpacing + out.boxPadding + (config.title ? out.titleFontSize + out.boxPadding : 0) + i * (out.shapeHeight + out.shapePadding);

			//rectangle
			lgg.append("rect").attr("x", out.boxPadding).attr("y", y)
				.attr("width", out.shapeWidth).attr("height", out.shapeHeight)
				.attr("fill", m.noDataFillStyle())
				.attr("stroke", "black").attr("stroke-width", 0.5)
				.on("mouseover", function () {
					svgMap.select("#g_nutsrg").selectAll("[nd='nd']")
						.style("fill", m.nutsrgSelFillSty())
					select(this).style("fill", m.nutsrgSelFillSty())
				})
				.on("mouseout", function () {
					const sel = svgMap.select("#g_nutsrg").selectAll("[nd='nd']")
						.style("fill", function (d) { m.noDataFillStyle() })
					select(this).style("fill", m.noDataFillStyle())
				});

			//'no data' label
			lgg.append("text").attr("x", out.boxPadding + out.shapeWidth + out.labelOffset).attr("y", y + out.shapeHeight * 0.5)
				.attr("alignment-baseline", "middle")
				.text(out.noDataText)
				.style("font-size", out.labelFontSize).style("font-family", out.fontFamily).style("fill", out.fontFill)
				.on("mouseover", function () {
					svgMap.select("#g_nutsrg").selectAll("[nd='nd']")
						.style("fill", m.nutsrgSelFillSty())
				})
				.on("mouseout", function () {
					const sel = svgMap.select("#g_nutsrg").selectAll("[nd='nd']")
						.style("fill", function (d) { m.noDataFillStyle() })
				});
		}

	}

	return out;

}
