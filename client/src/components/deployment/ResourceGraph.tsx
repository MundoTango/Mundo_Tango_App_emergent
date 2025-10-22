/**
 * RESOURCE GRAPH
 * Phase 3 - Stream 2: Real-time CPU/RAM graphs
 * Uses Chart.js for live performance monitoring
 */

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResourceGraphProps {
  type: 'cpu' | 'memory';
  data: number[];
  timestamps: string[];
}

export function ResourceGraph({ type, data, timestamps }: ResourceGraphProps) {
  const isCPU = type === 'cpu';
  
  const chartData = {
    labels: timestamps.map(t => new Date(t).toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })),
    datasets: [
      {
        label: isCPU ? 'CPU Usage (%)' : 'Memory Usage (MB)',
        data: data,
        fill: true,
        backgroundColor: isCPU 
          ? 'rgba(34, 211, 238, 0.1)' 
          : 'rgba(168, 85, 247, 0.1)',
        borderColor: isCPU 
          ? 'rgba(34, 211, 238, 1)' 
          : 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: isCPU 
          ? 'rgba(34, 211, 238, 1)' 
          : 'rgba(168, 85, 247, 1)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isCPU ? 'rgba(34, 211, 238, 1)' : 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}${isCPU ? '%' : ' MB'}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          color: 'rgba(0, 0, 0, 0.6)'
        }
      },
      y: {
        beginAtZero: true,
        max: isCPU ? 100 : undefined,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: function(value: any) {
            return `${value}${isCPU ? '%' : ''}`;
          },
          color: 'rgba(0, 0, 0, 0.6)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
