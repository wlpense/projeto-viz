// 1. Definições do Gráfico
const margin = { top: 20, right: 120, bottom: 50, left: 60 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// 2. Cria o SVG
const svg = d3.select("#minha-vizualizacao-linhas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 3. Carrega e Processa os Dados
d3.csv("../dados/life-expectancy.csv").then(data => {
    
    // Converte strings para números
    data.forEach(d => {
        d.year = +d.year;
        d.life_expectancy = +d.life_expectancy;
    });

    // Agrupa os dados por entidade (país/mundo)
    const groupedData = d3.group(data, d => d.entity);

    // 4. Define as Escalas
    // Eixo X (Anos)
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    // Eixo Y (Expectativa de Vida)
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.life_expectancy) - 5, d3.max(data, d => d.life_expectancy) + 5])
        .range([height, 0]);
    
    // Escala de Cores
    const colorScale = d3.scaleOrdinal()
        .domain(['Brasil', 'Japão', 'Índia', 'Mundo'])
        .range(['#2ca02c', '#d62728', '#ff7f0e', '#1f77b4']); // Verde, Vermelho, Laranja, Azul

    // 5. Define e Desenha os Eixos
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // Formato "d" para remover vírgula dos anos
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // 6. Define o Gerador de Linha
    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.life_expectancy));

    // 7. Desenha as Linhas
    svg.selectAll(".line")
        .data(groupedData)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d[0]))
        .attr("stroke-width", 2.5)
        .attr("d", d => lineGenerator(d[1]));

    // 8. Cria a Legenda
    const legend = svg.selectAll(".legend")
        .data(groupedData.keys())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("class", "legend-text")
        .style("text-anchor", "start")
        .text(d => d);

    // 9. Adiciona Labels aos Eixos
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Ano");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Expectativa de Vida (anos)");

    // 10. Adiciona Créditos da Fonte
    svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 250)
    .attr("y", height + margin.bottom - 1)
    .style("font-size", "12px")
    .style("font-family", "sans-serif")
    .text("Fonte: OurWorldData - https://ourworldindata.org");
    
});