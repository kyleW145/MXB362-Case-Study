// visualisation.js
import { state } from './state.js';

export function createLegend(grades, scheme) {
    if (state.legend) {
        state.legend.remove();
    }

    const legendWidth = 130;
    const legendHeight = 400;

    state.legend = d3.select("body").append("svg")
        .attr("class", "legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("position", "absolute")
        .style("top", "250px")
        .style("right", "20px");

    state.legend.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Crime Count");

    const gradient = state.legend.append("defs")
        .append("linearGradient")
        .attr("id", "colorGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    scheme.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", `${(i / (scheme.length - 1)) * 100}%`)
            .attr("stop-color", color);
    });

    state.legend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 30)
        .attr("height", legendHeight - 60)
        .style("fill", "url(#colorGradient)")
        .style("fill-opacity", 0.9);

    const labelHeight = (legendHeight - 60) / (grades.length - 1);

    grades.forEach((grade, i) => {
        state.legend.append("text")
            .attr("x", 50)
            .attr("y", 35 + labelHeight * i)
            .attr("font-size", "14px")
            .text(grade);
    });
}

export function displayBarChart(data, event, regionName) {
    // Remove any existing charts
    if (state.activeChart) {
        state.activeChart.remove();
    }
    d3.selectAll('.bar-chart').remove();

    if (!data || Object.keys(data).length === 0) {
        console.log('No data to display'); // Debug log
        return;
    }

    const chartWidth = 500; 
    const chartHeight = 250; 
    const margin = { top: 60, right: 40, bottom: 60, left: 150 }; // Reduced left margin
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    // Calculate position based on mouse event
    let xPosition = event.containerPoint.x;
    let yPosition = event.containerPoint.y;

    // Get map container position
    const mapRect = state.map.getContainer().getBoundingClientRect();
    xPosition += mapRect.left;
    yPosition += mapRect.top;

    // Ensure chart stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (xPosition + chartWidth > viewportWidth) {
        xPosition = Math.max(0, xPosition - chartWidth - 20);
    }
    if (yPosition + chartHeight > viewportHeight) {
        yPosition = Math.max(0, yPosition - chartHeight - 20);
    }

    console.log('Chart position:', { xPosition, yPosition }); // Debug log

    const svg = d3.select('body').append('svg')
        .attr('class', 'bar-chart visible') // Added 'visible' class immediately
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .style('position', 'fixed')
        .style('left', xPosition + 'px')
        .style('top', yPosition + 'px')
        .style('z-index', 1000)
        .style('opacity', 1); // Force opacity to 1

    // Add white background with border
    svg.append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('opacity', 0.95);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort data by value in descending order and take top 8
    const sortedData = Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8);

    console.log('Sorted data:', sortedData); // Debug log

    // Calculate total count
    const totalCount = sortedData.reduce((acc, [, count]) => acc + count, 0);

    // Add title with total count
    svg.append('text')
        .attr('class', 'bar-chart-title')
        .attr('x', chartWidth / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`${regionName} - Total Crimes: ${totalCount}`);

    // Set up scales
    const y = d3.scaleBand()
        .range([0, height])
        .padding(0.4)
        .domain(sortedData.map(d => d[0]));

    const maxValue = Math.ceil(d3.max(sortedData, d => d[1]));
    const x = d3.scaleLinear()
        .range([0, width])
        .domain([0, maxValue]);

    // Add X axis with grid lines
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickValues(Array.from({ length: maxValue + 1 }, (_, i) => i))
            .tickFormat(d3.format('d'))
            .tickSize(-height))
        .selectAll('.tick line')
        .attr('stroke', '#ddd');

    // Add Y axis
    g.append('g')
        .call(d3.axisLeft(y)
            .tickSize(0))
        .selectAll('.tick text')
        .style('font-size', '12px')

    // Add bars with animation
    g.selectAll('.bar')
        .data(sortedData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d[0]))
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('width', 0)
        .transition()
        .duration(500)
        .attr('width', d => x(d[1]));

    // Store the current chart
    state.activeChart = svg.node();
}

// Helper function to wrap long text
function wrap(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy") || 0);
        let tspan = text.text(null).append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", dy + "em");
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}