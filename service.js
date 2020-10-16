console.log("Hello World")
d3.csv("./database.csv").then(function(data) {
    
  
    let baseDepurada = data.map(obj=> ({ ...obj, date: `${obj.año}-${obj.mesNumero}-01` }))
    let baseDiciembre = baseDepurada.filter(obj => obj.mesNumero == '12' );
    console.log(baseDiciembre)

    
    d3.create("span")
    .style("color", "white")
    .style("background-color", "black")
    .html("Hello, world!")
  .node()
  
})