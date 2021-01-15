
# eurostat-map.js API reference

**Map**<br>[Creation](#map-creation) - [Definition](#map-definition) - [Geography](#map-geography)

**Statistical data**<br>
[Eurostat](#eurostat-database) - [CSV](#csv) - [Custom JS](#custom-js)

**Map types**<br>
[Choropleth map](#choropleth-map) - [Proportional symbol map](#proportional-symbol-map) - [Categorical map](#categorical-map) - [Bivariate choropleth map](#bivariate-choropleth-map)

**Map elements and methods**<br>
[Title](#map-title) - [Frame](#map-frame) - [Legend](#map-legend) - [Tooltip](#tooltip) - [Styling](#styling) - [Insets](#insets) - [Bottom text](#bottom-text) - [Export](#export) - [Miscellaneous](#miscellaneous) - [Build & update](#build-and-update)

Anything unclear or missing? Feel free to [ask](https://github.com/eurostat/eurostat.js/issues/new) !

## Map creation

Create a map with ``let map = eurostatmap.map( mapType )``. Set the parameter ``mapType`` to a value corresponding with the desired map type:
- ``"ch"`` for a [choropleth map](#choropleth-map),
- ``"ps"`` for a [proportional symbol map](#proportional-symbol-map),
- ``"ct"`` for a [categorical map](#categorical-map).

The ``map`` can then be customised with the methods listed in the tables below. Most of the map methods follow the pattern *map*.**myMethod**([*value*]): If a *value* is specified, the method sets the parameter value and returns the *map* object itself. If no *value* is specified, the method returns the current value of the parameter.

It is also possible to specify the map parameters as an object: ``let map = eurostatmap.map( mapType, { param1: v1, param2: v2} );``. This is equivalent to: ``let map = eurostatmap.map( mapType ).param1(v1).param2(v2);`` 

## Map definition

Specify the map SVG element.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**svgId**([*value*]) | String | *"map"* | The id of the SVG element of the HTML page where to draw the map. |
| *map*.**width**([*value*]) | int | *800* | The width of the map, in pixel. |
| *map*.**height**([*value*]) | int | *auto* | The height of the map, in pixel. If not specified, the height is set automatically as 85% of the width. |

## Map geography

Specify the NUTS geometries and the geographical extent of the map.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**nutsLvl**([*value*]) | int | *3* | The nuts level to show on the map, from 0 (national level) to 3 (more local level). Note that not all NUTS levels are always available for Eurostat databases. |
| *map*.**nutsYear**([*value*]) | int | *2016* | The version of the NUTS dataset to use. Possible values are given in [Nuts2json](https://github.com/eurostat/Nuts2json/#api). Note that the default value will be adjusted in the future depending on the [NUTS legislation in force](https://ec.europa.eu/eurostat/web/nuts/legislation). |
| *map*.**geo**([*value*]) | String | *"EUR"* | The map geographical territory, by default the entire European territory *"EUR"*. Other possible values are given in [Nuts2json](https://github.com/eurostat/Nuts2json/#overseas-territories---map-insets). |
| *map*.**proj**([*value*]) | String | *"3035"* | The map projection EPSG code. Possible values are given in [Nuts2json](https://github.com/eurostat/Nuts2json/#api). Note that these values depend on the geographical territory. |
| *map*.**scale**([*value*]) | String | *"20M"* | The simplification level of the map, among *"03M"*, *"10M"*, *"20M"*, *"60M"* (for Europe). The most simplified version is *"60M"*. The level *"01M"* is also available for some geographical territories: For more information on possible values by geographical territory, see [Nuts2json](https://github.com/eurostat/Nuts2json/). |
| *map*.**geoCenter**([*value*]) | Array ([x,y]) | *auto* | The geographical coordinates of the position where to center the map view. These coordinates are expected to be expressed in the map projection. If not specified, a position is computed automatically. |
| *map*.**pixSize**([*value*]) | number | *auto* | The zoom level of the map view. This is expressed as the size of a pixel in geographical unit (or the map resolution). If not specified, a value is computed automatically to show the map extent. |
| *map*.**zoomExtent**([*value*]) | Array | *null* | The zoom extent. The first value within [0,1] defines the maximum zoom out factor - the second value within [1,infinity] defines the maximum zoom in factor. Set to *[1,1]* to forbid zooming and allow panning. Set to *null* to forbid both. |

## Statistical data

The map statistical data can be accessed with the *map*.**statData**() method, which returns an object with the following methods:

| Method | Description |
| -------- | ------ |
| **get**([*nutsId*]) | Return the stat value {value,status} from a nuts id. If no argument is specified, returns the entire index. |
| **getValue**([*nutsId*]) | Return the stat value from a nuts id. |
| **set**([*nutsId,stat*]) | Set a stat value from a nuts id. The new statistical data format can be either {value:34.324,status:"e"} or a the value only. |
| **setData**([*index*]) | Set statistical data, already indexed by nutsId. The index has a structure like: { "PT":0.2, "LU":0.6, ...}, or with status: { "PT": {value:0.2, status:"e"}, "LU":0.6, ...} |
| **getArray**() | Return all stat values as an array. This can be used to classify the values. |
| **getUniqueValues**() | Return stat unique values. This can be used for categorical maps. |
| **getMin**() | Get minimum value. |
| **getMax**() | Get maximum value. |
| **unitText**([*value*]) | String | *undefined* | The text of the unit of measurement, to show in the tooltip. |


The map statistical data source can be accessed with the *map*.**stat**([*value*]) method. Several types of data sources are supported (see sections below).

### Eurostat database

Specify statistical data to be retrieved on-the-fly from [Eurostat database](https://ec.europa.eu/eurostat/web/main/data/database). The query parameters can be retrieved from [this page](https://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/generate-new-query).

Example:

```javascript
map = eurostatmap.map(...);
map.stat( {
	eurostatDatasetCode: "lfst_r_lfu3rt",
	filters:{
		age: "Y20-64",
		sex: "T",
		unit: "PC",
		time: "2019"
	}
});
```

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **datasetCode** | String | *"demo_r_d3dens"* | The Eurostat database code of the statistical variable. See [here](https://ec.europa.eu/eurostat/data/database) to find them. |
| **filters** | Object | *{ lastTimePeriod : 1 }* | The Eurostat dimension codes to filter/select the chosen statistical variable. See [here](https://ec.europa.eu/eurostat/data/database) or [here](https://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/query-builder) to find them. |
| **precision** | int | *2* | The precision of the statistical variable to retrieve (number of decimal places). |


### CSV

Specify statistical data to be retrieved from CSV data.

Example:

```javascript
map = eurostatmap.map(...);
map.stat( {
	csvURL: "https://raw.githubusercontent.com/eurostat/eurostat-map.js/master/examples/urb_rur_typo.csv",
	geoCol: "NUTS_ID_2013",
	valueCol: "urban_rural"
});
```

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **csvURL** | String | *undefined* | The CSV file URL. |
| **geoCol** | String | *"geo"* | The column with the NUTS ids. |
| **valueCol** | String | *"value"* | The column with the statistical values. |


### Custom JS

Specify statistical data from JavaScript code, or any kind of JSON data source.

Example:

```javascript
map = eurostatmap.map(...);

//specify values one by one
map.statData().set("LU",500).set("DE",400).set("FR",100).set("IT",600)

//or in one time. Note that the 'status' can be specified but is not mandatory.
map.statData().setData({
	"FR": 10,
	"DE": {value:7,status:"e"},
	"UK": 12,
})
```

## Choropleth map

[![Example](https://raw.githubusercontent.com/eurostat/eurostat-map.js/master/docs/img/ch_ex.png)](https://eurostat.github.io/eurostat-map.js/examples/population-density.html)

A [choropleth map](https://en.wikipedia.org/wiki/Choropleth_map) shows areas **colored or patterned** in proportion to a statistical variable. These maps should be used to show *intensive* statistical variables such as proportions, ratios, densities, rates of change, percentages, etc.

Here is [an example](https://eurostat.github.io/eurostat-map.js/examples/population-density.html) with color value (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/population-density.html)), [another](https://eurostat.github.io/eurostat-map.js/examples/population-change.html) with a diverging color scheme (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/population-change.html)), and [a last one](https://eurostat.github.io/eurostat-map.js/examples/population-dot-density.html) with a texture pattern (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/population-dot-density.html)).

Example:

```javascript
eurostatmap.map("ch")
	.title("Population in Europe")
    .stat( { eurostatDatasetCode:"demo_r_d3dens", unitText: "inhab./km²" } )
	.classifMethod("threshold")
	.threshold([50, 75, 100, 150, 300, 850])
	.tooltipShowFlags(false)
	.legend({ noData:false, labelDecNb:0, x:15, y:160, })
	.build();
```

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**clnb**([*value*]) | int | *7* | The number of classes. When *classifMethod = "threshold"*, this parameter is inferred from the number of breaks specified. |
| *map*.**classifMethod**([*value*]) | String | *"quantile"* | The classification method. Possible values are *"quantile"*, *"equinter"* for equal intervals, and *"threshold"* for user defined threshol (see threshold method). |
| *map*.**threshold**([*value*]) | Array | *[0]* | If *classifMethod = "threshold"*, the breaks of the classification. |
| *map*.**makeClassifNice**([*value*]) | *boolean* | true | Make nice break values. Works only for *classifMethod = "equinter"*. |
| *map*.**colorFun**([*value*]) | Function | *d3.interpolateYlOrBr* | The color function, as defined in [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic/) |
| *map*.**classToFillStyle**([*value*]) | Function | See description | A function returning a fill style for each class number. The default values is the function returned by ``eurostatmap.getColorLegend(colorFun())``. |
| *map*.**noDataFillStyle**([*value*]) | String | *"lightgray"* | The fill style to be used for regions where no data is available. |


In addition to [the default legend parameters](#map-legend), choropleth maps have the following specific legend parameters:

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **ascending** | String | *true* | The legend cells order. Set to false to invert. |
| **shapeWidth** | int | *15* | The cell width. |
| **shapeHeight** | int | *13* | The cell heigth. |
| **sepLineLength** | int | *17* | The separation line length. |
| **sepLineStroke** | int | *"black"* | The separation line color. |
| **sepLineStrokeWidth** | int | *1* | The separation line width. |
| **labelFontSize** | int | *13* | The label font size. |
| **labelDecNb** | String | *" - "* | The number of decimal for the legend labels. |
| **labelOffset** | int | *3* | The distance between the legend box elements to the corresponding text label. |
| **noData** | boolean | *true* | Show 'no data' style. |
| **noDataText** | Text | *"No data"* | 'No data' text label. |


## Proportional symbol map

[![Example](https://raw.githubusercontent.com/eurostat/eurostat-map.js/master/docs/img/ps_ex.png)](https://eurostat.github.io/eurostat-map.js/examples/prop-circles.html)

A proportional symbol map shows symbols (typically circles) **sized** in proportion to a statistical variable. These maps should be used to show statistical *extensive* variables such as quantities, populations, numbers, etc. Here is [an example](https://eurostat.github.io/eurostat-map.js/examples/prop-circles.html) (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/prop-circles.html)).

Example:

```javascript
eurostatmap.map("ps")
	.nutsLvl(1)
	.stat( { eurostatDatasetCode:"demo_r_pjangrp3", filters:{ age: "TOTAL", sex: "T", unit: "NR", time: 2016 }, unitText: "inhabitants" } )
	.psMaxSize(25)
	.psFill("red")
	.build();
```

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**psShape**([*value*]) | string | *circle* | The shape of the symbol. Accepted values: circle, bar, square, star, cross, diamond, triangle, wye or custom |
| *map*.**psCustomShape**([*value*]) | Object | null | A custom symbol to be used with d3.symbol when psShape is set to "custom". See http://using-d3js.com/05_10_symbols.html#h_66iIQ5sJIT |
| *map*.**psMaxSize**([*value*]) | number | *30* | The maximum size of the symbol, in pixels. |
| *map*.**psBarWidth**([*value*]) | number | *5* | Width in pixels of the vertical bars. Only to be used with a psShape of type "bar" |
| *map*.**psMinSize**([*value*]) | number | *0.8* | The minimum size of the symbol, for non null values, in pixels. |
| *map*.**psMinValue**([*value*]) | number | *0* | The minimum value of the range domain. |
| *map*.**psFill**([*value*]) | String | *"#B45F04"* | The fill color or pattern of the symbol. |
| *map*.**psFillOpacity**([*value*]) | number | *0.7* | The opacity of the symbol, from 0 to 1. |
| *map*.**psStroke**([*value*]) | String | *"#fff"* | The stroke color of the symbol. |
| *map*.**psStrokeWidth**([*value*]) | number | *0.3* | The width of the stroke. |

In addition to [the default legend parameters](#map-legend), proportional symbol maps have the following specific legend parameters:

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **cellNb** | int | *4* | Number of legend elements. |
| **ascending** | String | *true* | The legend cells order. Set to false to invert. |
| **shapePadding** | number | *5* | The distance between consecutive legend elements |
| **labelFontSize** | int | *13* | The label font size. |
| **labelDecNb** | String | *" - "* | The number of decimal for the legend labels. |
| **labelOffset** | int | *5* | The distance between the legend box elements to the corresponding text label. |
| **format** | Function | *format(",." + labelDecNb + "r")* | D3 format function which formats the labels. |


## Categorical map

[![Example](https://raw.githubusercontent.com/eurostat/eurostat-map.js/master/docs/img/ct_ex.png)](https://eurostat.github.io/eurostat-map.js/examples/categorical.html)

A categorical map shows areas according to categories (or discrete values). Here is [an example](https://eurostat.github.io/eurostat-map.js/examples/categorical.html) of such map (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/categorical.html)).

Example:

```javascript
eurostatmap.map("ct")
	.nutsYear(2013)
	.nutsLvl(3)
	.stat( { csvURL: "https://raw.githubusercontent.com/eurostat/eurostat-map.js/dev/examples/urb_rur_typo.csv", geoCol: "NUTS_ID_2013", valueCol: "urban_rural" } )
	.classToFillStyle({ urb: "#fdb462", int: "#ffffb3", rur: "#ccebc5" })
	.classToText({ "urb": "Urban", "int": "Intermediate", "rur": "Rural" })
	.build();
```

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**classToFillStyle**([*value*]) | Object | null | An object giving the fill style depending on the class code. |
| *map*.**classToText**([*value*]) | Object | null | An object giving the legend label text depending on the class code. |
| *map*.**noDataFillStyle**([*value*]) | String | *"lightgray"* | The fill style to be used for regions where no data is available. |

In addition to [the default legend parameters](#map-legend), categorical maps have the following specific legend parameters:

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **shapeWidth** | int | *15* | The cell width. |
| **shapeHeight** | int | *13* | The cell heigth. |
| **shapePadding** | number | *5* | The distance between consecutive legend elements |
| **labelFontSize** | int | *13* | The label font size. |
| **labelOffset** | int | *5* | The distance between the legend box elements to the corresponding text label. |
| **noData** | boolean | *true* | Show 'no data' style. |
| **noDataText** | Text | *"No data"* | 'No data' text label. |


## Bivariate choropleth map

[![Example](https://raw.githubusercontent.com/eurostat/eurostat-map.js/master/docs/img/chbi_ex.png)](https://eurostat.github.io/eurostat-map.js/examples/pop-unemploy-bivariate.html)

A bivariate choropleth map is a choropleth map showing the combination of two statistical variables. It shows how the correlation between these variables varies across space. Here is [an example](https://eurostat.github.io/eurostat-map.js/examples/pop-unemploy-bivariate.html) of such map (see [the code](https://github.com/eurostat/eurostat-map.js/blob/master/examples/pop-unemploy-bivariate.html)).

Example:

```javascript
eurostatmap.map("chbi")
	.nutsLvl(2)
	.nutsYear(2016)
	.stat("v1", { eurostatDatasetCode:"demo_r_d3dens", unitText: "inh./km²" } )
	.stat("v2", { eurostatDatasetCode:"lfst_r_lfu3rt", filters:{ age: "Y20-64", sex: "T", unit: "PC", time: 2017 }, unitText: "%" } )
	.clnb(4)
	.build();
```

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**clnb**([*value*]) | int | *3* | The number of classes for the classification. The same value is used for both variables. |
| *map*.**startColor**([*value*]) | color | *"#e8e8e8"* | The color for lowest values of both variables. |
| *map*.**color1**([*value*]) | color | *"#73ae80"* | The color for the highest values of variable 1, and lowest of variable 2. |
| *map*.**color2**([*value*]) | color | *"#6c83b5"* | The color for the highest values of variable 2, and lowest of variable 1. |
| *map*.**endColor**([*value*]) | color | *"#2a5a5b"* | The color for highest values of both variables. |
| *map*.**classToFillStyle**([*value*]) | Function | *auto* | A function returning the colors for each pair of classes i,j. |
| *map*.**noDataFillStyle**([*value*]) | color | *"darkgray"* | Fill style for regions with no data available. |

In addition to [the default legend parameters](#map-legend), bivariate choropleth maps have the following specific legend parameters:

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **squareSize** | number | *50* | The size, in pixel, of the legend square. |
| **label1** | string | *"Variable 1"* | The text for the label of variable 1. |
| **label2** | string | *"Variable 2"* | The text for the label of variable 1. |
| **labelFontSize** | int | *12* | The font size of the legend label. |
| **noData** | boolean | *true* | Show 'no data' style. |
| **noDataShapeSize** | number | *15* | . |
| **noDataText** | Text | *"No data"* | 'No data' text label. |


## Map title

Specify the map title, its style and position.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**title**([*value*]) | String | "" | The title text. |
| *map*.**titleFontSize**([*value*]) | int | 25 | The title font size. |
| *map*.**titleFill**([*value*]) | String | "black" | The title text color. |
| *map*.**titlePosition**([*value*]) | Array ([x,y]) | auto | The title position. If not specified, a position is automatically computed, on the top left corner. |
| *map*.**titleFontFamily**([*value*]) | String | "Helvetica, Arial, sans-serif" | The title font. |
| *map*.**titleFontWeight**([*value*]) | String | "bold" | The title font weight. |



## Map frame

Specify the style of the map frame (the rectangle around the map).

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**frameStroke**([*value*]) | Color | "#222" | Color of the map frame |
| *map*.**frameStrokeWidth**([*value*]) | number | 2 | The map frame stroke width |



## Map legend

Specify the style of the map legend with *map*.**legend**({*parameters*}).

Example:

```javascript
map = eurostatmap.map(...)
	.legend({
		title: "Legend (%)",
		titleFontSize: "12",
		x: 10, y: 120,
		boxFill: "darkgray",
	});
```

| Parameter | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| **svgId** | String | *auto* | The SVG element where to draw the legend. If not specified, an element is automatically built within the map. |
| **x** | number | *auto* | The legend element X position, in case it is embeded within the map. If not specified, an automatic value is computed. |
| **y** | number | *auto* | The legend element Y position, in case it is embeded within the map. If not specified, an automatic value is computed. |
| **boxMargin** | number | *10* | The legend box margin, in pixel. |
| **boxPadding** | number | *7* | The legend box padding, in pixel. |
| **boxCornerRad** | number | *7* | The legend box corner radius, in pixel. |
| **boxFill** | color | *"#eeeeee"* | The legend box fill style. |
| **boxOpacity** | number | *0.5* | The legend box opacity, from 0 to 1. |
| **fontFamily** | font | *"Helvetica, Arial, sans-serif"* | The legend font family. |
| **fontFill** | Color | *"black"* | The legend font color. |
| **title** | Text | *""* | The legend title. |
| **titleFontSize** | int | *15* | The legend title font size. |
| **titleFontWeight** | String | *"normal"* | The legend title font weight. |



## Tooltip

The tooltip is the little rectangle showing information on the map feature under the mouse/finger pointer.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**tooltipText**([*value*]) | Function | *auto* | A function returning the text to show in a tooltip which appears when the mouse passes over map features. The function signature is `function(rg, map)` where `rg` is the selected region and `map` is the map. Set to *null* if no tooltip is needed.|
| *map*.**tooltipShowFlags**([*value*]) | String | *"short"* | Set to *null*, *0* or *false* if no [flag](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Tutorial:Symbols_and_abbreviations#Statistical_symbols.2C_abbreviations_and_units_of_measurement) should be shown in the tooltip. Set to *"short"* to show the flag as a letter. Set to *"long"* to show the flag as a text. |

## Styling

Specify specific map styles.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**nutsrgFillStyle**([*value*]) | String | *"#eee"* | The fill style of the NUTS regions, used for proportional symbol maps only. |
| *map*.**nutsrgSelFillSty**([*value*]) | String | *"#purple"* | The fill style of the selected NUTS regions. |
| *map*.**nutsbnStroke**([*value*]) | Object | *{0:"#777", 1:"#777", 2:"#777", 3:"#777", oth:"#444", co:"#1f78b4"}* | The stroke style of the NUTS boundaries, depending on the NUTS level, if it is a border with another country (*'oth'*) and if it is coastal (*'co'*) |
| *map*.**nutsbnStrokeWidth**([*value*]) | Object | *{0:1, 1:0.2, 2:0.2, 3:0.2, oth:1, co:1}* | The stroke width of the NUTS boundaries, depending on the NUTS level, if it is a border with another country (*'oth'*) and if it is coastal (*'co'*). |
| *map*.**cntrgFillStyle**([*value*]) | String | *"lightgray"* | The fill style of the countries. |
| *map*.**cntrgSelFillSty**([*value*]) | String | *"darkgray"* | The fill style of the selected countries. |
| *map*.**cntbnStroke**([*value*]) | Object | *{def:"#777", co:"#1f78b4"}* | The stroke style of the country boundaries. *'co'* is for coastal boundaries, *'def'* for other boundaries. |
| *map*.**cntbnStrokeWidth**([*value*]) | Object | *{def:1, co:1}* | The stroke width of the country boundaries. *'co'* is for coastal boundaries, *'def'* for other boundaries. |
| *map*.**seaFillStyle**([*value*]) | String | *"#b3cde3"* | The fill style of the sea areas. |
| *map*.**drawCoastalMargin**([*value*]) | boolean | *true* | Set to true to show a coastal blurry margin. False otherwise. |
| *map*.**coastalMarginColor**([*value*]) | String | *"white"* | The color of the coastal blurry margin. |
| *map*.**coastalMarginWidth**([*value*]) | number | *12* | The width of the coastal blurry margin. |
| *map*.**coastalMarginStdDev**([*value*]) | number | *12* | The standard deviation of the coastal blurry margin. |
| *map*.**drawGraticule**([*value*]) | boolean | *true* | Set to true to show the graticule (meridian and parallel lines). False otherwise. |
| *map*.**graticuleStroke**([*value*]) | String | *"gray"* | The stroke style of the graticule. |
| *map*.**graticuleStrokeWidth**([*value*]) | number | *1* | The stroke width of the graticule. |


## Insets

To add map insets, use the *map*.**insets**([*values*]) method.

For default map insets showing European overseas territories and small countries, use:

```javascript
eurostatmap.map(...)
	.insets("default");
```

To specify more precisely which insets to show, their geographical extent, scale, position, etc., specify the list of insets such as:

```javascript
eurostatmap.map(...)
	.insets(
		{ geo:"MT", scale:"01M", pixSize:3000, title:"Martinique", titleFontSize:16, width:200, height:90, x:0, y:0 },
		{ geo:"GF", scale:"03M", pixSize:10000, title:"French Guyana", titleFontSize:16, width:200, height:90, x:210, y:0 }
	)
	.insetBoxPosition([335,345]);
);
```

See also [this example with a focus on Spain](https://eurostat.github.io/eurostat-map.js/examples/spain.html) (see [the code](../examples/spain.html)).

Note that a map inset is built as a proper map within a map: It has all properties of a map, and share most of them with its parent map. It is thus possible to define map insets within map insets, following a recursive structure.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**insets**([*values*]) | List | *[]* | The list of insets. Each map inset is described as an object with the map inset attributes. |
| *map*.**insetBoxPosition**([*value*]) | number | *auto* | The position of the insets box element within the map. |
| *map*.**insetBoxPadding**([*value*]) | number | *5* | When several insets are specified within the map, the distance between the different insets. |
| *map*.**insetBoxWidth**([*value*]) | number | *210* | The default width of the insets box, which are squared by default. |
| *map*.**insetZoomExtent**([*value*]) | Array | *[1,3]* | The default zoom extent of the insets. |
| *map*.**insetScale**([*value*]) | String | *"03M"* | The default scale of the insets. |


## Bottom text

Specify the note text to be shown at the bottom of the map.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**bottomText**([*value*]) | String | *Some default text* | The text. Note that the default value is mandatory. |
| *map*.**botTxtFontSize**([*value*]) | int | *12* | The font size. |
| *map*.**botTxtFill**([*value*]) | String | *"black"* | The text color. |
| *map*.**botTxtFontFamily**([*value*]) | String | *"Helvetica, Arial, sans-serif"* | The font family. |
| *map*.**botTxtPadding**([*value*]) | number | *10* | The padding, in pixel. |
| *map* .**botTxtTooltipTxt**([*value*]) | String | The default disclaimer message. | Set a text to be shown in a tooltip when passing over the bottom text. Set to *null* if no tooltip has to be shown. |



## Export

Export the map as a PNG image or a SVG file.

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**exportMapToPNG**() | *this* | Export the map as a PNG image. |
| *map*.**exportMapToSVG**() | *this* | Export the map as a SVG image. |

## Miscellaneous

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**noDataText**([*value*]) | String | *"No data available"* | The text to show for regions where no data is available. |
| *map*.**lg**([*value*]) | String | *"en"* | The language code, for multilingual maps. |
| *map*.**transitionDuration**([*value*]) | int | *800* | When updating statistical figures, the map style changes progressively. This parameter sets the duration of this transition, in ms. |
| *map*.**filtersDefinitionFun**([*value*]) | Function | *function() {}* | A function defining SVG filter elements. To be used to defined fill patterns. |
| *map*.**callback**([*value*]) | Function | *undefined* | A function to execute after the map build is complete. |
| *map*.**getTime**() | String | - | Return the *time* parameter of the statistical data. When a filter such as *{ lastTimePeriod : 1 }* is used, this method allows a retrieval of the map timestamp. |
| *map*.**setFromURL**() | *this* | - | Set some map parameters based on URL parameters: "w" for width, "h" for height, "x" for xGeoCenter, "y" for yGeoCenter, "z" for pixGeoSize, "s" for scale, "lvl" for nuts level, "time" for time, "proj" for the CRS, "geo" for the geographical territory, "ny" for the NUTS version, "lg" for the langage, "sl" to show legend, "clnb" for the number of classes. |

## Build and update

After changing some parameters, one of the following methods need to be executed:

| Method | Type | Default value | Description |
| -------- | ------ | ---------- | ----------- |
| *map*.**build**() | *this* | Build (or rebuild) the entire map. |
| *map*.**updateGeoData**() | *this* | Get new geometrical data. It should be used to update the map when parameters on the map geometries have changed. 
| *map*.**buildMapTemplate**() | *this* | Update the map when parameters on the map template have changed. |
| *map*.**updateStatData**() | *this* | Get new statistical data. It should be used to update the map when parameters on the statistical data sources have changed. |
| *map*.**updateStatValues**() | *this* | Update client side information related to statistical values. It should be used to update the map when statistical values have changed. |
| *map*.**updateClassification**() | *this* | Update the map when parameters on the classification have changed. |
| *map*.**updateStyle**() | *this* | Update the map when parameters on the styling have changed. |


Anything unclear or missing? Feel free to [ask](https://github.com/eurostat/eurostat.js/issues/new) !