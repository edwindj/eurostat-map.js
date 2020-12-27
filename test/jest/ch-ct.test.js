var assert = require('assert');
const puppeteer = require("puppeteer");
const path = require("path")



// opens test.html using headless chrome
// to run tests in open browser, set headless to false.
test('choropleth and categorical maps', async () => {
    let browser = await puppeteer.launch({
        headless: true,
        //sloMo: 80,
        args: ["--window-size=1000,1000"]
    })

    const page = await browser.newPage();

    await page.goto(`file:${path.join(__dirname, 'test.html')}`)

    // evaluate will run the function in the page context
    await page.evaluate(_ => {
        // these will be executed within test.html, that was loaded before
        //builds test map in test.html
        eurostatmap
            .map("ch")
            .svgId("testMap1")
            .title("Population in Europe")
            .width(400)
            .scale("20M")
            .stat( { eurostatDatasetCode:"demo_r_d3dens" } )
            .classifMethod("threshold").threshold([50, 75, 100, 150, 300, 850])
            .unitText("people/km²")
            .tooltipShowFlags(false)
            .withLegend({
                titleText: "test",
                    labelDecNb: 0,
                }
            )
            .build();

        eurostatmap
            .map("ct")
            .svgId("testMap2")
            .title("NUTS urban/rural typology")
            .width(400)
            .scale("60M")
            .NUTSyear(2013)
            .nutsLvl(3)
            .stat( { csvURL: "https://raw.githubusercontent.com/eurostat/eurostat-map.js/dev/examples/urb_rur_typo.csv", geoCol: "NUTS_ID_2013", valueCol: "urban_rural" } )
            .classToFillStyleCT({ urb: "#fdb462", int: "#ffffb3", rur: "#ccebc5" })
            .classToText({ "urb": "Urban", "int": "Intermediate", "rur": "Rural" })
            .withLegend({
                titleText: "test",
                    labelDecNb: 0,
                }
            )
            .build();
    });

    // we're done; close the browser
    await browser.close();

})