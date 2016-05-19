import React, { PropTypes } from 'react';
import { LineChart } from 'react-d3';
import * as chart from '../../utilities/chart';

export default function DashLineChart({ visualisation, datasets }) {
  const chartData = chart.getChartData(visualisation, datasets);
  const { name, spec } = visualisation;

  const gridHorizontal = true;
  const gridVertical = true;

  return (
    <div className="DashLineChart dashChart">
      <LineChart
        title={name}
        height={400}
        width={800}
        data={chartData}
        gridHorizontal={gridHorizontal}
        gridVertical={gridVertical}
        xAxisLabel={spec.labelX || ''}
        yAxisLabel={spec.labelY || ''}
        xAxisLabelOffset={50}
        yAxisLabelOffset={75}
      />
    </div>
  );
}

DashLineChart.propTypes = {
  visualisation: PropTypes.object.isRequired,
  datasets: PropTypes.object.isRequired,
};
