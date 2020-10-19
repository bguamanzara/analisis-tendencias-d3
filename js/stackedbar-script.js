// set svg width and height
const width = 900,
  height = 500;
const margin = { top: 100, right: 100, bottom: 100, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Leer base de datos de inec 2020, tasa de desempleo
d3.csv("database.csv")
  .then((data) => {
    // Filtrar los meses de diciembre
    let datos = data.filter(d => d.mesNumero === '12');

    // transformar el dataset para poder realizar el grafico
    let finalData = []
    datos.forEach(d => {
        finalData.push({ year: d.anio, male: d.Hombre, female: d.Mujer  })
    });
    finalData.forEach((d) => {
      d.year = d.year;
      d.female = parseFloat(d.female);
      d.male = parseFloat(d.male);
    });

    // configurar las dos variables Mujer y Hombre
    const stack = d3.stack().keys(["female", "male"]);

    const series = stack(finalData);

    // Configurar las escalas para el eje X
    const xScale = d3
      .scaleBand()
      .domain(finalData.map((d) => d.year))
      .range([0, innerWidth])
      .padding(0.1);

    const xAxis = d3.axisBottom().scale(xScale);

    // Configurar las escalas para el eje Y
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (d) => {
        console.log(d[0]+d[1])
        return parseFloat(d[0])+parseFloat(d[1])
      }))])
      .rangeRound([innerHeight, 0]);

    const yAxis = d3.axisLeft().scale(yScale);

    // Definir los colores para cada parametro seleccionado (male, female)
    const colors = d3
      .scaleOrdinal()
      .domain(series.map((d) => d.key))
      .range(
        d3
          .quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), series.length)
          .reverse()
      )
      .unknown("#ccc");

    // Crear grafico svg
    const svg = d3
      .select("#chart-area3")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    const mainG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Agregar un grupo a cada conjunto de datos (male, female)
    const g = mainG
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .style("fill", (d) => colors(d.key))
      .attr("transform", `translate(0,0)`);

    // Dibujar para cada grupo en el grafico
    g.selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        return xScale(d.data.year);
      })
      .attr("y", function (d) {
        return yScale(d[1]);
      })
      .attr("height", function (d) {
        return yScale(d[0]) - yScale(d[1]);
      })
      .attr("width", xScale.bandwidth())
      .on("mouseover", function (d) {
        // Configurar el tooltip
        let xPosition =
          parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() * 2;
        let yPosition = parseFloat(d3.select(this).attr("y")) + innerHeight / 2;

        // Fijar la posicion del tooltip
        d3.select("#chart-area3")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")
          .select("#year")
          .text(`${d.data.year}`);

        d3.select("#tooltip2")
          .select("#gender")
          .text(d[0] === 0 ? `${d.data.female}% Mujeres` : `${d.data.male}% Hombres`);

        // Mostrar tooltip
        d3.select("#tooltip2").classed("hidden", false);
      })
      .on("mouseout", function () {
        // Ocultar el tooltip
        d3.select("#tooltip2").classed("hidden", true);
      });

    // Dibujar la leyenda
    const legend = mainG
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (innerWidth - 110) + "," + 20 + ")")
      .selectAll("g")
      .data(series)
      .enter()
      .append("g");

    // Pintar los colores de la leyenda
    legend
      .append("rect")
      .attr("y", (d, i) => i * 30)
      .attr("height", 10)
      .attr("width", 10)
      .attr("fill", (d) => colors(d.key));

    // Configurar los textos de las leyendas
    legend
      .append("text")
      .attr("y", (d, i) => i * 30 + 9)
      .attr("x", 5 * 3)
      .text((d) => d.key==="male"?"Hombres":"Mujeres");

    mainG
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0,${innerHeight})`);

    mainG.append("g").call(yAxis);

    mainG
      .append("text")
      .attr("class", "chart-title")
      .attr("y", -40)
      .attr("x", innerHeight / 2)
  })
  .catch((error) => {
    console.log(error);
  });
