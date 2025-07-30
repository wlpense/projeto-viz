// Definições do gráfico
const margin = { top: 30, right: 30, bottom: 70, left: 80 };
const width = 1000 - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

// Cria o SVG
const svg = d3.select("#minha-vizualizacao-scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Carrega os dados
d3.csv("/dados/life-expectancy-un-vs-gdp-per-capita-wb.csv").then(data => {
    // Formata os dados
    data.forEach(d => {
        d.gdp_per_capita = +d.gdp_per_capita;
        d.life_expectancy = +d.life_expectancy;
    });

    // Escalas
    const xScale = d3.scaleLog()
        .domain([d3.min(data, d => d.gdp_per_capita) * 0.9, d3.max(data, d => d.gdp_per_capita) * 1.2])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.life_expectancy) * 0.9, d3.max(data, d => d.life_expectancy) * 1.1])
        .range([height, 0]);

    // Eixos
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format(".2s"));

    const yAxis = d3.axisLeft(yScale);

    // Adiciona os eixos ao SVG
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // Adiciona os círculos (pontos)
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.gdp_per_capita))
        .attr("cy", d => yScale(d.life_expectancy))
        .attr("r", 8)
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`País: ${d.country}<br/>PIB per Capita: $${d3.format(",.2s")(d.gdp_per_capita)}<br/>Expectativa de Vida: ${d3.format(".1f")(d.life_expectancy)} anos`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Labels dos eixos
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .style("text-anchor", "middle")
        .text("PIB per Capita (Escala Logarítmica)");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Expectativa de Vida (anos)");

    // adiciona créditos da fonte
        svg.append("text")
        .attr("class", "source-credit")
        .attr("x", width - 250)
        .attr("y", height + margin.bottom - 1)
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text("Fonte: OurWorldData - https://ourworldindata.org");
});