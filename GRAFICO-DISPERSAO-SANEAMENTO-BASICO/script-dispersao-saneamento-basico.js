// Definições do Gráfico
const margin = { top: 20, right: 30, bottom: 70, left: 80 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Cria o SVG
const svg = d3.select("#minha-vizualizacao-scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Carrega e Processa os Dados
d3.csv("../dados/life-expectancy-with-improved-sanitation-faciltities.csv").then(data => {
    
    // Converte strings para números
    data.forEach(d => {
        d.sanitation_access = +d.sanitation_access;
        d.life_expectancy = +d.life_expectancy;
    });

    // Define as Escalas
    // Eixo X (Saneamento) - Escala Logarítmica
    const xScale = d3.scaleLog()
        .domain([d3.min(data, d => d.sanitation_access) * 0.9, 101]) // Domínio de ~10 a 100
        .range([0, width]);

    // Eixo Y (Expectativa de Vida) - Escala Linear
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.life_expectancy) - 5, d3.max(data, d => d.life_expectancy) + 5])
        .range([height, 0]);

    // Define os Eixos
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d + "%"); // Adiciona o % nos ticks

    const yAxis = d3.axisLeft(yScale);

    // Desenha os eixos
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // Desenha os Pontos (Círculos)
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.sanitation_access))
        .attr("cy", d => yScale(d.life_expectancy))
        .attr("r", 7)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                    .html(`<strong>${d.country}</strong><br/>Saneamento: ${d.sanitation_access.toFixed(1)}%<br/>Exp. de Vida: ${d.life_expectancy.toFixed(1)} anos`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // Adiciona Labels aos Eixos
    // Label Eixo X
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .text("Acesso a Saneamento Básico (% da população) - Escala Logarítmica");

    // adiciona créditos da fonte
    svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 250)
    .attr("y", height + margin.bottom - 1)
    .style("font-size", "12px")
    .style("font-family", "sans-serif")
    .text("Fonte: OurWorldData - https://ourworldindata.org");

    // Label Eixo Y
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Expectativa de Vida (anos)");
});