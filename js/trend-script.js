
// Leer base de datos de inec 2020, tasa de desempleo
d3.csv("database.csv")
  // El dataset tendra el nombre de data:
  .then(data => {

    let datosLimpios = []
    data.forEach(d => {
      datosLimpios.push({ date: d3.timeParse("%Y-%m-%d")(`${d.anio}-${d.mesNumero}-${d.dia}`), value: parseFloat(d.Nacional), valueTooltip: `${d.mes} ${d.anio}` })
    });

    data = datosLimpios

    // Ordenar el dataset por el atributo date (fechas)
    data.sort(function (a, b) {
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    console.log(data)

    // Configurar los margenes del grafico
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
    
    // Crear el grafico svg
    var svg = d3.select("#chart-area1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Agregar el eje X con el atributo date
    var x = d3.scaleTime()
      .domain(d3.extent(data, function (d) { return d.date; }))
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    //  Agregar el eje Y con los respectivos valores para cada date
    var y = d3.scaleLinear()
      .domain([3, 7])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Agregar la linea del grafico
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function (d) { return x(d.date) })
        .y(function (d) { return y(d.value) })
      )

    // Agregar puntos al grafico de los puntos pintados
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return x(d.date) })
      .attr("cy", function (d) { return y(d.value) })
      .attr("r", 5)
      .attr("fill", "#69b3a2")
      .on("mouseover", d => {
        pintarTooltip(d)
      })
      .on("mouseout", borrarTooltip)

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")

    // Borrar tooltip
    function borrarTooltip() {
      tooltip
        .transition()
        .style("opacity", 0)
    }

    // Dibujar Tooltip
    function pintarTooltip(d) {
      tooltip
        //.text (d.partido)
        .text(`${d.valueTooltip.toUpperCase()}: ${d.value}%`)
        .style("top", d3.event.pageY + "px") 
        .style("left", parseInt(d3.event.pageX +20) + "px")
        .transition()
        .style("opacity", 1)

    }
  })