// define dimensões e margens para o gráfico
const margin = {top: 20, right: 200, bottom: 60, left: 80};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// cria o elemento svg integrando a área definida para o gráfico
const svg = d3.select("#minha-vizualizacao-linha-multiseries")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// cria a div tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// carrega e processa os dados
d3.csv("/dados/REGION-estimates.csv").then(data => { 
    // Formata os dados
    data.forEach(d => {
        d.year = +d.ano;
        d.population = +d.taxa_mudanca_natural_x1000;
    });

console.log(data);

    // Agrupa os dados por região
    const dataByRegion = d3.group(data, d => d.region_sub_country);

    // define os domínios máximos e mínimos para as escalas de x e y
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.population)])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // define os eixos x e y
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(""));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // gera as Linhas
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.population));

    svg.selectAll(".line")
        .data(dataByRegion)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d[0]))
        .attr("stroke-width", 2)
        .attr("d", d => line(d[1]));

    // Pontos de dados por ano e tooltips
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 2.5)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.population))
        .style("fill", d => colorScale(d.region_sub_country))
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Região: ${d.region_sub_country}<br/>Ano: ${d.year}<br/>Taxa de ${d3.format(",")(d.population)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Legenda do gráfico
    const legend = svg.selectAll(".legend")
        .data(dataByRegion.keys())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width + 30)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width + 55)
        .attr("y", 9)
        .attr("dy", ".25em")
        .style("text-anchor", "start")
        .text(d => d);
        
    // Labels dos Eixos
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 20)
        .text("Ano");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 5)
        .text("Taxa ((nascimentos - óbitos)/total população)");
});