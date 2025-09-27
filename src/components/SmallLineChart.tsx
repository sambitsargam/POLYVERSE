interface SmallLineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export const SmallLineChart = ({ data, color = '#6C5CE7', height = 40 }: SmallLineChartProps) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Create SVG path
  const width = 120;
  const stepX = width / (data.length - 1);
  
  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <div className="w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Add dots at each point */}
        {points.map((point, index) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="opacity-60"
            />
          );
        })}
      </svg>
    </div>
  );
};