// Leer base de datos de inec 2020, tasa de desempleo
d3.csv("database.csv").then(data => {
    // Filtrar los meses de diciembre
    let datos = data.filter(d => d.mesNumero === '12');

    // transformar el dataset para poder realizar el grafico
    datos.forEach(element => {
        element['key'] = `${element.anio}`
    });
    let groupData = datos.reduce((r, { key: key, ...object }) => {
        var temp = r.find(o => o.key === key);
        if (!temp) r.push(temp = { key, values: [] });
        delete object.anio
        delete object.mes
        delete object.mesNumero
        delete object.dia
        delete object.Tasa
        delete object.Nacional
        delete object.Hombre
        delete object.Mujer
        let arr = Object.keys(object)
        for (let i in arr) {
            temp.values.push({ grpName: arr[i], grpValue: parseFloat(object[arr[i]]) });
        }

        return r;
    }, []);

    console.log(JSON.stringify(groupData, 0, 3))

    // Definir margenes y tamaños del grafico
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var x0 = d3.scaleBand().rangeRound([0, width], .5);
    var x1 = d3.scaleBand();
    var y = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis = d3.axisBottom().scale(x0)
        .tickValues(groupData.map(d => d.key));

    var yAxis = d3.axisLeft().scale(y);

    // Definir colores de acuerdo a las categorias o grupos de edades
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    var svg = d3.select('#chart-area2').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Obtener los parametros grupos de edades
    var categoriesNames = groupData.map(function (d) { return d.key; });
    var rateNames = groupData[0].values.map(function (d) { return d.grpName; });

    x0.domain(categoriesNames);
    x1.domain(rateNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(groupData, function (key) { return d3.max(key.values, function (d) { return d.grpValue; }); })]);

    // Dibujar el eje x
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Dibujar el eje y
    svg.append("g")
        .attr("class", "y axis")
        .style('opacity', '0')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight', 'bold')
        .text("Value");

    svg.select('.y').transition().duration(500).delay(1300).style('opacity', '1');

    var slice = svg.selectAll(".slice")
        .data(groupData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) { return "translate(" + x0(d.key) + ",0)"; });

    // Seleccionar y agrupar de acuerdo al nombre y el grupo de edades
    slice.selectAll("rect")
        .data(function (d) { return d.values; })
        .enter().append("rect")
        .attr("width", x1.bandwidth())
        .attr("x", function (d) { return x1(d.grpName); })
        .style("fill", function (d) { return color(d.grpName) })
        .attr("y", function (d) { return y(0); })
        .attr("height", function (d) { return height - y(0); })
        .on("mouseover", function (d) {
            d3.select(this).style("fill", d3.rgb(color(d.grpName)).darker(2));
        })
        .on("mouseout", function (d) {
            d3.select(this).style("fill", color(d.grpName));
        });

    slice.selectAll("rect")
        .transition()
        .delay(function (d) { return Math.random() * 1000; })
        .duration(1000)
        .attr("y", function (d) { return y(d.grpValue); })
        .attr("height", function (d) { return height - y(d.grpValue); });

    // Definir leyenda
    var legend = svg.selectAll(".legend")
        .data(groupData[0].values.map(function (d) { return d.grpName; }).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity", "0");

    // Definir colores para la leyenda
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) { return color(d); });

    // Definir el texto para la leyenda
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });

    // Transiciones al cargar el dataset
    legend.transition().duration(500).delay(function (d, i) { return 1300 + 100 * i; }).style("opacity", "1");
})