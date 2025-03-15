// Part 1: Side-by-Side Boxplot (Distribution of Likes)

d3.csv("socialMedia.csv").then(function(data) {
    data.forEach(d => {
        d.Likes = +d.Likes;
    });

    const margin = {top: 40, right: 40, bottom: 60, left: 60},
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svgBox = d3.select("#boxplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    const xScaleBox = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.4);

    const yScaleBox = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .nice()
        .range([height, 0]);


    svgBox.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScaleBox));

    svgBox.append("g").call(d3.axisLeft(yScaleBox));


    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort((a, b) => a - b);
        return {
            min: d3.min(values),
            q1: d3.quantile(values, 0.25) || d3.min(values),
            median: d3.quantile(values, 0.5) || d3.min(values),
            q3: d3.quantile(values, 0.75) || d3.max(values),
            max: d3.max(values),
        };
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, platform) => {
        const x = xScaleBox(platform);
        const boxWidth = xScaleBox.bandwidth();

        svgBox.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBox(quantiles.min))
            .attr("y2", yScaleBox(quantiles.max))
            .attr("stroke", "black");


        svgBox.append("rect")
            .attr("x", x)
            .attr("y", yScaleBox(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", Math.max(1, yScaleBox(quantiles.q1) - yScaleBox(quantiles.q3)))
            .attr("fill", "#f4a8a8")
            .attr("stroke", "black");

    
        svgBox.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBox(quantiles.median))
            .attr("y2", yScaleBox(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 3);
    });
});

/// Part 2: Side-by-Side Bar Chart 
d3.csv("socialMediaAvg.csv").then(function(data) {
    data.forEach(d => { d.AvgLikes = +d.AvgLikes; });

    const margin = {top: 60, right: 120, bottom: 80, left: 60}, 
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svgBar = d3.select("#barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top + 30})`); 

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.3);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    svgBar.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svgBar.append("g").call(d3.axisLeft(y));

    const barGroups = svgBar.selectAll(".bar-group")
        .data(d3.groups(data, d => d.Platform))
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${x0(d[0])},0)`);

    barGroups.selectAll("rect")
        .data(d => d[1])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    const legend = svgBar.append("g")
        .attr("transform", `translate(${width - 180}, -40)`); 

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});


// Part 3: Line Chart 
d3.csv("SocialMediaTime.csv").then(function(data) {
    data.forEach(d => { d.AvgLikes = +d.AvgLikes; });

    const margin = {top: 50, right: 50, bottom: 100, left: 60},
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svgLine = d3.select("#linechart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    svgLine.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    svgLine.append("g").call(d3.axisLeft(y));

    svgLine.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.Date) + x.bandwidth() / 2)
            .y(d => y(d.AvgLikes))
            .curve(d3.curveLinear));

    svgLine.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Date) + x.bandwidth() / 2)
        .attr("cy", d => y(d.AvgLikes))
        .attr("r", 4)
        .attr("fill", "purple");
});
