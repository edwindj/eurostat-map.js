import { scaleSqrt } from "d3-scale";
import { select, arc, pie, extent, sum } from "d3";
import { interpolateOrRd } from "d3-scale-chromatic";
import * as smap from '../core/stat-map';
import * as lgpc from '../legend/legend-piecharts';

/**
 * Returns a proportional pie chart map.
 * 
 * @param {*} config 
 */
export const map = function (config) {

    //create map object to return, using the template
    const out = smap.statMap(config, true);

    out.pieMinRadius_ = 5;
    out.pieMaxRadius_ = 15;

    // pie charts
    out.pieChartRadius_ = 10;
    out.pieChartInnerRadius_ = 0;

    //tooltip pie chart
    out.tooltipPieRadius_ = 40;
    out.tooltipPieInnerRadius_ = 0;

    //colors - indexed by category code
    out.catColors_ = undefined;
    //labels - indexed by category code
    out.catLabels_ = undefined;

    //show stripes only when data for all categories is complete.
    //Otherwise, consider the regions as being with no data at all.
    out.showOnlyWhenComplete_ = false;
    //style for no data regions
    out.noDataFillStyle_ = "darkgray";

    out.sizeClassifier_ = null; //d3 scale for scaling pie sizes
    out.statPie_ = null;

    /**
     * Definition of getters/setters for all previously defined attributes.
     * Each method follow the same pattern:
     *  - There is a single method as getter/setter of each attribute. The name of this method is the attribute name, without the trailing "_" character.
     *  - To get the attribute value, call the method without argument.
     *  - To set the attribute value, call the same method with the new value as single argument.
    */
    ["catColors_", "catLabels_", "showOnlyWhenComplete_", "noDataFillStyle_", "pieMaxRadius_", "pieMinRadius_", "pieChartRadius_", "pieChartInnerRadius_"]
        .forEach(function (att) {
            out[att.substring(0, att.length - 1)] = function (v) { if (!arguments.length) return out[att]; out[att] = v; return out; };
        });

    //override attribute values with config values
    if (config) ["catColors", "catLabels", "showOnlyWhenComplete", "noDataFillStyle", "pieMaxRadius", "pieMinRadius", "pieChartRadius", "pieChartInnerRadius"].forEach(function (key) {
        if (config[key] != undefined) out[key](config[key]);
    });

    /** The codes of the categories to consider for the composition. */
    let statCodes = undefined;

    /**
     * A function to define a pie chart map easily, without repetition of information.
     * Only for eurobase data sources.
     * 
     * @param {*} stat A pattern for the stat data source
     * @param {String} dim The dimension (defined in eurostat REST API) of the composition.
     * @param {Array} codes The category codes of the composition
     * @param {Array} labels Optional: The labels for the category codes
     * @param {Array} colors Optional: The colors for the category
     */
    out.statPie = function (stat, dim, codes, labels, colors) {

        //set unitText of stat() from statPie()
        // out.statData().unitText(stat.unitText);

        //add one dataset config for each category
        stat.filters = stat.filters || {};
        for (let i = 0; i < codes.length; i++) {

            //category code
            const code = codes[i]
            stat.filters[dim] = code
            const sc_ = {};
            for (let key in stat) sc_[key] = stat[key]
            sc_.filters = {};
            for (let key in stat.filters) sc_.filters[key] = stat.filters[key]
            out.stat(code, sc_)

            //if specified, retrieve and assign color
            if (colors) {
                out.catColors_ = out.catColors_ || {};
                out.catColors_[code] = colors[i];
            }
            //if specified, retrieve and assign label
            if (labels) {
                out.catLabels_ = out.catLabels_ || {};
                out.catLabels_[code] = labels[i];
            }
        }

        //set statCodes
        statCodes = codes;

        //set 

        return out;
    }


    /**
     * Function to compute composition for region id, for each category.
     * Return an object with, for each category, the share [0,1] of the category.
     * @param {*} id 
     */
    const getComposition = function (id) {
        let comp = {}, sum = 0;
        //get stat value for each category. Compute the sum.
        for (let i = 0; i < statCodes.length; i++) {

            //retrieve code and stat value
            const sc = statCodes[i]
            const s = out.statData(sc).get(id);

            //case when some data is missing
            if (!s || (s.value != 0 && !s.value) || isNaN(s.value)) {
                if (out.showOnlyWhenComplete()) return undefined;
                else continue;
            }

            comp[sc] = s.value;
            sum += s.value;
        }

        //case when no data
        if (sum == 0) return undefined;

        //compute ratios
        for (let i = 0; i < statCodes.length; i++) comp[statCodes[i]] /= sum;

        return comp;
    }

    //@override
    out.updateClassification = function () {

        //if not provided, get list of stat codes from the map stat data
        if (!statCodes) {
            //get list of stat codes.
            statCodes = Object.keys(out.statData_);
            //remove "default", if present
            const index = statCodes.indexOf("default");
            if (index > -1) statCodes.splice(index, 1);
        }


        //define size scaling function
        let domain = getDatasetMaxMin();
        out.sizeClassifier_ = scaleSqrt().domain(domain).range([out.pieMinRadius_, out.pieMaxRadius_])

        return out;
    };


    /**
     * @function getDatasetMaxMin
     * @description gets the maximum and minimum total of all dimensions combined for each region. Used to define the domain of the pie size scaling function.
     * @returns [min,max]
     */
    function getDatasetMaxMin() {

        let totals = [];
        let sel = out.svg().select("#g_ps").selectAll("g.symbol").data();

        sel.forEach((rg) => {
            let id = rg.properties.id;
            let total = getRegionTotal(id);
            if (total) {
                totals.push(total);
            }

        })

        let minmax = extent(totals);
        return minmax;
    }

    /**
 * Get absolute total value of combined statistical values for a specific region. E.g total livestock
 * @param {*} id nuts region id
 */
    const getRegionTotal = function (id) {
        let sum = 0;
        //get stat value for each category. Compute the sum.
        for (let i = 0; i < statCodes.length; i++) {

            //retrieve code and stat value
            const sc = statCodes[i]
            const s = out.statData(sc).get(id);

            //case when some data is missing
            if (!s || (s.value != 0 && !s.value) || isNaN(s.value)) {
                if (out.showOnlyWhenComplete()) return undefined;
                else continue;
            }

            sum += s.value;
        }

        //case when no data
        if (sum == 0) return undefined;

        return sum;
    }

    //@override
    out.updateStyle = function () {

        //if not specified, build default color ramp
        if (!out.catColors()) {
            out.catColors({});
            for (let i = 0; i < statCodes.length; i++)
                out.catColors()[statCodes[i]] = schemeCategory10[i % 10];
        }

        //if not specified, initialise category labels
        out.catLabels_ = out.catLabels_ || {};

        //build and assign pie charts to the regions
        //collect nuts ids from g elements. TODO: find better way of getting IDs
        let nutsIds = [];
        out.svg().select("#g_ps").selectAll("g.symbol").append("g").attr("id", rg => { nutsIds.push(rg.properties.id); return "pie_" + rg.properties.id; })
        addPieChartsToMap(nutsIds);

        return out;
    };

    function addPieChartsToMap(ids) {

        ids.forEach((nutsid) => {
            //prepare data for pie chart
            const data = []
            const comp = getComposition(nutsid);
            for (const key in comp) data.push({ code: key, value: comp[key] })

            //case of regions with no data
            if (!data || data.length == 0) {
                return;
            };

            //create svg for pie chart
            let node = select("#pie_" + nutsid);
            const svg = node.append("g")

            // define radius
            const r = out.sizeClassifier_(getRegionTotal(nutsid));
            const ir = out.pieChartInnerRadius_;

            //make pie chart. See https://observablehq.com/@d3/pie-chart
            const pie_ = pie().sort(null).value(d => d.value)
            svg.append("g")
                .attr("stroke", "white")
                .attr("stroke-width", "0.5px")
                .selectAll("path")
                .data(pie_(data))
                .join("path")
                .attr("fill", d => { return out.catColors()[d.data.code] || "lightgray" })
                .attr("d", arc().innerRadius(ir).outerRadius(r))

        })
    }

    //@override
    out.getLegendConstructor = function () {
        return lgpc.legend;
    }


    //specific tooltip text function
    out.tooltipText_ = function (rg, map) {

        //get tooltip
        const tp = select("#tooltip_eurostat")

        //clear
        tp.html("")
        tp.selectAll("*").remove();

        //write region name
        tp.append("div").html("<b>" + rg.properties.na + "</b><br>");

        //prepare data for pie chart
        const data = []
        const comp = getComposition(rg.properties.id);
        for (const key in comp) data.push({ code: key, value: comp[key] })

        //case of regions with no data
        if (!data || data.length == 0) {
            tp.append("div").html(out.noDataText());
            return;
        };

        //create svg for pie chart
        // set the dimensions and margins of the graph
        var width = 150,
            height = 150,
            margin = 30

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        var radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div called 'my_dataviz'
        var svg = tp
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // const svg = tp.append("svg")
        // .attr("viewBox", [-radius, -radius, 3 * radius, 3 * radius])
        // .attr("width", 3 * radius);

        let units = out.statData(statCodes[0]).unitText();

        //make pie chart. See https://observablehq.com/@d3/pie-chart
        const pie_ = pie().sort(null).value(d => d.value)
        // svg.append("g")
        //     .attr("stroke", "black")
        //     .selectAll("path")
        //     .data(pie_(data))
        //     .join("path")
        //     .attr("fill", d => { return out.catColors()[d.data.code] || "lightgray" })
        //     .attr("d", arc().innerRadius(ir).outerRadius(r))
        // const arcGenerator = arc().innerRadius(ir).outerRadius(r)
        var innerArc = arc()
            .innerRadius(radius * 0.5)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

        const pieData = pie_(data);
        svg
            .selectAll('allSlices')
            .data(pieData)
            .enter()
            .append('path')
            .attr('d', innerArc)
            .attr('fill', d => { return out.catColors()[d.data.code] || "lightgray" })
            .attr("stroke", "white")
            .style("stroke-width", "1px")
            .style("opacity", 0.7)

        // Add the polylines between chart and labels:
        svg
            .selectAll('allPolylines')
            .data(pieData)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                var posA = innerArc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })

        // Add the polylines between chart and labels:
        svg
            .selectAll('allLabels')
            .data(pieData)
            .enter()
            .append('text')
            .text(function (d) { let n = (d.data.value * 100).toFixed(); if (!isNaN(n)) return n + "%"; })
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
            .style("font-size", 12)

        // Now add the annotation. Use the centroid method to get the best coordinates
        // svg
        //     .selectAll('mySlices')
        //     .data(pieData)
        //     .enter()
        //     .append('text')
        //     .text(function (d) { let num = d.data.value.toFixed(2); if(!isNaN(num)) return num; else return; })
        //     .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        //     .style("text-anchor", "middle")
        //     .style("font-size", 12)

        // region total
        tp.append("g").append("text").text((d) => {
            if (rg)
                return "Total: " + Math.floor(getRegionTotal(rg.properties.id)) + " " + units
        })
    };


    return out;
}

