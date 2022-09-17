const educationOfUS = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const countiesOfUS = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([d3.json(educationOfUS), d3.json(countiesOfUS)]).
then(data => generate(data[0], data[1])).
catch(err => console.log(err));

function generate(educationUS, countiesUS) {
  const width = 1200;
  const height = 800;
  const padding = {
    top: 150,
    right: 100,
    bottom: 50,
    left: 100 };

  const eduValue = {
    min: 2.6,
    max: 75.1,
    step: (75.1 - 2.6) / 8 };

  const usColor = d3.scaleThreshold().
  domain(d3.range(eduValue.min, eduValue.max, eduValue.step)).
  range(d3.schemeBlues[9]);
  const path = d3.geoPath();
  const svg = d3.select('#svg-container').
  append('svg').
  attr('width', width).
  attr('height', height);
  const xScale = d3.scaleLinear().
  domain([eduValue.min, eduValue.max]).
  rangeRound([0, 200]);
  const legendAxis = d3.axisBottom(xScale).
  tickSize(5).
  tickValues(usColor.domain()).
  tickFormat(function (num) {
    if (num <= 3) {
      return '';
    }
    return d3.format('d')(num) + '%';
  });

  const legendWidth = 200;
  const legendHeight = 20;
  const legend = svg.append('g').
  attr('id', 'legend').
  attr('transform', 'translate(' + (padding.left - 30) + ', ' + (padding.top - 50) + ')');

  const tooltip = d3.select('body').
  append('div').
  attr('id', 'tooltip').
  style('opacity', 0);

  legend.append('g').
  attr('transform', 'translate(' + 0 + ', ' + legendHeight * 2 + ')').
  call(legendAxis);

  legend.append('g').
  selectAll('rect').
  data(usColor.range().map(
  function (color) {
    const arr = usColor.invertExtent(color);

    if (arr[0] == null) {
      arr[0] = xScale.domain()[0];
    }

    if (arr[1] == null) {
      arr[1] = xScale.domain()[1];
    }

    return arr;
  })).
  enter().
  append('rect').
  attr('x', d => xScale(d[0])).
  attr('y', d => 20).
  style('fill', d => usColor(d[0])).
  attr('width', d => xScale(d[1]) - xScale(d[0])).
  attr('height', d => legendHeight);

  svg.append('g').
  attr('transform', 'translate(' + width / 4 + ', ' + padding.top / 3 + ')').
  append('text').
  attr('id', 'title').
  text('Education Level of United State');

  svg.append('g').
  attr('transform', 'translate(' + width / 5.2 + ', ' + padding.top / 1.7 + ')').
  append('text').
  attr('id', 'description').
  text('bachelors or higher in terms of percentage from 2010 to 2014');

  svg.append('g').
  attr('transform', 'translate(' + padding.left + ', ' + padding.top + ')').
  selectAll('path').
  data(topojson.feature(countiesUS, countiesUS.objects.counties).features).
  enter().
  append('path').
  attr('class', 'county').
  style('fill', function (d) {
    const selectCounty = educationUS.filter(function (obj) {
      return obj.fips === d.id;
    });

    if (selectCounty[0]) {
      return usColor(selectCounty[0].bachelorsOrHigher);
    };

    return usColor(0);
  }).
  attr('data-fips', function (d) {
    return d.id;
  }).
  attr('data-education', function (d) {
    const selectCounty = educationUS.filter(function (obj) {
      return obj.fips === d.id;
    });

    if (selectCounty[0]) {
      return selectCounty[0].bachelorsOrHigher;
    }
    return 0;
  }).
  attr('d', path).
  on('mouseover', function (e, d) {
    tooltip.transition().
    duration(200).
    style('opacity', 0.7);

    tooltip.html(
    function () {
      const selectCounty = educationUS.filter(function (obj) {
        return obj.fips === d.id;
      });

      if (selectCounty[0]) {
        return (
          selectCounty[0]['area_name'] + ', ' +
          selectCounty[0].state + '<br/>' +
          'Bachelor or higher : ' +
          selectCounty[0].bachelorsOrHigher + '%');

      }
      return 0;
    });


    tooltip.attr('data-education', function () {
      const selectCounty = educationUS.filter(function (obj) {
        return obj.fips === d.id;
      });

      if (selectCounty[0]) {
        return selectCounty[0].bachelorsOrHigher;
      }

      return 0;
    });
  }).
  on('mouseout', function () {
    tooltip.transition().
    duration(0).
    style('opacity', 0);
  });
}