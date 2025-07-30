// Carrega os dados
d3.csv("/dados/brasil_indicadores.csv").then(data => {

    // Converte os dados para os tipos corretos
    data.forEach(d => {
        d.year = +d.year;
        d.life_expectancy = +d.life_expectancy;
        d.gini = +d.gini;
        d.literacy_rate = +d.literacy_rate;
        d.health_expenditure_gdp = +d.health_expenditure_gdp;
    });

    const tooltip = d3.select(".tooltip");

    // Função reutilizável para criar cada gráfico
    function createChart(containerId, chartData, yValue, title, color) {
        const margin = {top: 20, right: 30, bottom: 40, left: 50};
        const container = d3.select(containerId);
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        container.insert("div", "svg")
                    .attr("class", "chart-title")
                    .text(title);

        // Escalas
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(chartData, d => d[yValue]) * 0.95, d3.max(chartData, d => d[yValue]) * 1.05])
            .range([height, 0]);

        // Eixos
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(5));

        // Linha
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d[yValue]));

        svg.append("path")
            .datum(chartData)
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", color);
        
        return { svg, xScale, yScale, width, height };
    }

    // Criando os gráficos
    const lifeChart = createChart("#main-chart", data, 'life_expectancy', 'Expectativa de Vida (Anos)', '#1f77b4');
    const giniChart = createChart("#chart-gini", data, 'gini', 'Índice de Gini (Desigualdade)', '#ff7f0e');
    const literacyChart = createChart("#chart-literacy", data, 'literacy_rate', 'Taxa de Alfabetização (%)', '#2ca02c');
    const healthChart = createChart("#chart-health", data, 'health_expenditure_gdp', 'Gastos com Saúde (% do PIB)', '#d62728');

    // Lógica de interatividade (linha de foco e tooltip)
    const charts = [lifeChart, giniChart, literacyChart, healthChart];
    const bisectDate = d3.bisector(d => d.year).left;

    const focusElements = charts.map(chart => {
        const focusGroup = chart.svg.append('g').style('display', 'none');
        const focusLine = focusGroup.append('line').attr('class', 'focus-line').attr('y1', 0).attr('y2', chart.height);
        const focusCircle = focusGroup.append('circle').attr('r', 4.5).attr('class', 'focus-circle');
        return { focusGroup, focusLine, focusCircle };
    });

    d3.select("#dashboard")
        .append("rect")
        .attr("width", lifeChart.width + 100) // Área de captura mais ampla
        .attr("height", 800)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', `translate(${60},${20})`)
        .on("mouseover", () => {
            focusElements.forEach(fe => fe.focusGroup.style('display', null));
            tooltip.style("opacity", 1);
        })
        .on("mouseout", () => {
            focusElements.forEach(fe => fe.focusGroup.style('display', 'none'));
            tooltip.style("opacity", 0);
        })
        .on("mousemove", function(event) {
            const x0 = lifeChart.xScale.invert(d3.pointer(event)[0]);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            if (!d1) return; // Sai se estiver no final do array
            const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
            
            const xPos = lifeChart.xScale(d.year);

            // Atualiza a posição dos elementos de foco em cada gráfico
            focusElements[0].focusGroup.attr("transform", `translate(${xPos},0)`);
            focusElements[0].focusCircle.attr("cy", lifeChart.yScale(d.life_expectancy));

            focusElements[1].focusGroup.attr("transform", `translate(${giniChart.xScale(d.year)},0)`);
            focusElements[1].focusCircle.attr("cy", giniChart.yScale(d.gini));

            focusElements[2].focusGroup.attr("transform", `translate(${literacyChart.xScale(d.year)},0)`);
            focusElements[2].focusCircle.attr("cy", literacyChart.yScale(d.literacy_rate));
            
            focusElements[3].focusGroup.attr("transform", `translate(${healthChart.xScale(d.year)},0)`);
            focusElements[3].focusCircle.attr("cy", healthChart.yScale(d.health_expenditure_gdp));

            // Atualiza o tooltip
            tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .html(
                        `<strong>Ano: ${d.year}</strong><br/>
                        Expectativa de Vida: ${d.life_expectancy.toFixed(1)} anos<br/>
                        Índice de Gini: ${d.gini.toFixed(3)}<br/>
                        Alfabetização: ${d.literacy_rate.toFixed(1)}%<br/>
                        Gastos Saúde/PIB: ${d.health_expenditure_gdp.toFixed(1)}%`
                    );
            
        });


}).catch(error => {
    console.error("Erro ao carregar os dados:", error);
});