// define dimensões e margens para o gráfico
const margin = { top: 70, right: 60, bottom: 50, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// define escalas de x e y
const x = d3.scaleTime()
  .range([0, width]);

  const y = d3.scaleLinear()
  .range([height, 0]);

// cria o elemento svg integrando a área definida para o gráfico
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// cria a div tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

// cria uma segunda div para manipulação dos dados brutos
const tooltipRawDate = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

// cria o gradiente  
const gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 1);

gradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 0);

// carrega e processa os dados
d3.csv("../dados/SDG-Africa.csv").then(data => {
  //conversão de datas e números
  const parseDate = d3.timeParse("%Y");
  data.forEach(d => {
    d.Data = parseDate(d.ano);
    d.Tot_Pop = +d.tot_pop;
  });

console.log(data)

  // define os domínios máximos e mínimos para as escalas de x e y
  x.domain(d3.extent(data, d => d.Data));
  y.domain([50000, d3.max(data, d => d.Tot_Pop)]);

  // adiciona x-axis
  svg.append("g")
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeYear.every(2)))
      .tickFormat(d3.timeFormat("%Y")))
    .selectAll(".tick line")
    .style("stroke-opacity", 1)
  svg.selectAll(".tick text")
    .attr("fill", "#777");

  // adiciona y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width},0)`)
    .style("font-size", "14px")
    .call(d3.axisRight(y)
      .ticks(10)
      .tickFormat(d => {
        if (isNaN(d)) return "";
        return `${(d/1000).toFixed(0)}M`;
      }))

    .selectAll(".tick text")
    .style("fill", "#777");
  
  // define o gerador da linha
    const line = d3.line()
    .x(d => x(d.Data))
    .y(d => y(d.Tot_Pop));

  // cria o gerador de área
  const area = d3.area()
    .x(d => x(d.Data))
    .y0(height)
    .y1(d => y(d.Tot_Pop));

  // adiciona o caminho da área
  svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", "url(#gradient)")
    .style("opacity", .5);

  // adiciona o caminho da linha
  const path = svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#85bb65")
    .attr("stroke-width", 1)
    .attr("d", line);

  // adiciona o elemento círculo
  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "red")
    .style("stroke", "white")
    .attr("opacity", 0.7)
    .style("pointer-events", "none");

// Adicione linhas vermelhas que se estendem do círculo até a data e o valor definido
  const tooltipLineX = svg.append("line")
    .attr("class", "tooltip-line")
    .attr("id", "tooltip-line-x")
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");

  const tooltipLineY = svg.append("line")
    .attr("class", "tooltip-line")
    .attr("id", "tooltip-line-y")
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");

// cria retângulo de acompanhamento do eixo xy
  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  // cria a função mousemove
  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.Data).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Data > d1.Data - x0 ? d1 : d0;
    const xPos = x(d.Data);
    const yPos = y(d.Tot_Pop);  

  // atualiza a posição do círculo
  circle.attr("cx", xPos).attr("cy", yPos);

  // Adiciona transição para o raio do círculo
  circle.transition()
  .duration(50)
  .attr("r", 5);

  // atualiza a posição das linhas vermelhas
  tooltipLineX.style("display", "block").attr("x1", xPos).attr("x2", xPos).attr("y1", 0).attr("y2", height);
  tooltipLineY.style("display", "block").attr("y1", yPos).attr("y2", yPos).attr("x1", 0).attr("x2", width);

  // adiciona o tooltip
  tooltip
  .style("display", "block")
  .style("left", `${width + 90}px`)
  .style("top", `${yPos + 68}px`)
  .html(`${d.Tot_Pop !== undefined ? d.Tot_Pop.toFixed(0) : 'N/A'}`);

  tooltipRawDate
  .style("display", "block")
  .style("left", `${xPos + 60}px`)
  .style("top", `${height + 53}px`)
  .html(`${d.Data !== undefined ? d.Data.toISOString().slice(0, 10) : 'N/A'}`);

});

  // função que atualiza o retângulo com evento mouseleave
  listeningRect.on("mouseleave", function () {
    circle.transition().duration(50).attr("r", 0);
    tooltip.style("display", "none");
    tooltipRawDate.style("display", "none");
    tooltipLineX.attr("x1", 0).attr("x2", 0);
    tooltipLineY.attr("y1", 0).attr("y2", 0);
    tooltipLineX.style("display", "none");
    tooltipLineY.style("display", "none");
  });

  
  // Define o slider
  const sliderRange = d3
    .sliderBottom()
    .min(d3.min(data, d => d.Data))
    .max(d3.max(data, d => d.Data))
    .width(300)
    .tickFormat(d3.timeFormat('%Y'))
    .ticks(3)
    .default([d3.min(data, d => d.Data), d3.max(data, d => d.Data)])
    .fill('#85bb65');

  sliderRange.on('onchange', val => {
    // define o novo domínio da escala de x
    x.domain(val);

    // filtra os dados com base nos valores do slider
    const filteredData = data.filter(d => d.Data >= val[0] && d.Data <= val[1]);

    // atualiza a linha e a área para o novo domínio
    svg.select(".line").attr("d", line(filteredData));
    svg.select(".area").attr("d", area(filteredData));
    
    // define o novo domínio da escala de y com base nos novos dados
    y.domain([0, d3.max(filteredData, d => d.Tot_Pop)]);

    // atualiza x-axis com o novo domínio
    svg.select(".x-axis")
      .transition()
      .duration(300) // transição em ms
      .call(d3.axisBottom(x)
        .tickValues(x.ticks(d3.timeYear.every(2)))
        .tickFormat(d3.timeFormat("%Y")));

    // atualiza y-axis com o novo domínio
    svg.select(".y-axis")
      .transition()
      .duration(300) // transição em ms
      .call(d3.axisRight(y)
        .ticks(10)
        .tickFormat(d => {
          if (d <= 0) return "";
            return `${(d/1000).toFixed(0)}M`;
        }));
  });

  // adiciona o slider ao DOM
  const gRange = d3
    .select('#slider-range')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(90,30)');

  gRange.call(sliderRange);

  // Adiciona título
  svg.append("text")
  .attr("class", "chart-title")
  .attr("x", margin.left - 115)
  .attr("y", margin.top - 100)
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("População da África de 1950 a 2023 (x1000)");

  // adiciona créditos da fonte
  svg.append("text")
  .attr("class", "source-credit")
  .attr("x", width - 250)
  .attr("y", height + margin.bottom - 1)
  .style("font-size", "12px")
  .style("font-family", "sans-serif")
  .text("Fonte: UN - Databank - https://data.un.org/");

});