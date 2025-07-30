const width = 960;
const height = 600;

const svg = d3.select("#minha-vizualizacao-mapa-mundi")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select(".tooltip");

// Projeção do mapa
const projection = d3.geoMercator()
    .scale(140)
    .center([0, 20])
    .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

// Paleta de cores: de tons mais frios (amarelo/azul claro) para quentes (vermelho/roxo)
const colorScale = d3.scaleSequential(d3.interpolateInferno).domain([30, 85]);

// Carregamento dos dados em paralelo
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("/dados/life_expectancy_world_by_year.csv")
]).then(([worldData, lifeData]) => {
    
    const lifeDataByYearAndCountry = new Map();
    
    // Processa e agrupa os dados de expectativa de vida
    d3.group(lifeData, d => d.year).forEach((values, year) => {
        const countryData = new Map();
        values.forEach(d => {
            countryData.set(d.country_code, +d.life_expectancy);
        });
        lifeDataByYearAndCountry.set(year, countryData);
    });

    const countries = topojson.feature(worldData, worldData.objects.countries);

    const yearSlider = d3.select("#year-slider");
    const yearLabel = d3.select("#year-label");

    function updateMap(year) {
        yearLabel.text(year);
        const currentYearData = lifeDataByYearAndCountry.get(findClosestYear(year));
        
        svg.selectAll(".country")
            .data(countries.features)
            .join("path")
            .attr("class", "country")
            .attr("d", pathGenerator)
            .attr("fill", d => {
                const lifeExp = currentYearData ? currentYearData.get(d.id) : undefined;
                return lifeExp ? colorScale(lifeExp) : "#ccc"; // Cinza para países sem dados
            })
            .on("mouseover", function(event, d) {
                const lifeExp = currentYearData ? currentYearData.get(d.id) : "N/A";
                tooltip.style("opacity", 1)
                        .html(`<strong>${d.properties.name}</strong><br>Expectativa de Vida: ${typeof lifeExp === 'number' ? lifeExp.toFixed(1) : lifeExp}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                d3.select(this).style('stroke-width', 1.5).style('stroke', 'black');
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
                d3.select(this).style('stroke-width', 0.5).style('stroke', 'white');
            });
    }

    function findClosestYear(selectedYear) {
        const availableYears = Array.from(lifeDataByYearAndCountry.keys()).map(Number);
        return availableYears.reduce((prev, curr) => 
            Math.abs(curr - selectedYear) < Math.abs(prev - selectedYear) ? curr : prev
        );
    }

    // Event listener para o slider
    yearSlider.on("input", (event) => {
        updateMap(event.target.value);
    });

    // Desenho inicial
    updateMap(yearSlider.property("value"));

    // Adiciona uma legenda para a escala de cores
    const legendWidth = 300, legendHeight = 20;
    const legendSvg = svg.append("g").attr("transform", `translate(${width - legendWidth - 20},${height - legendHeight - 20})`);
    
    const legendScale = d3.scaleLinear().domain([30, 85]).range([0, legendWidth]);
    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    const defs = legendSvg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");
    
    legendSvg.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .select(".domain").remove();
});