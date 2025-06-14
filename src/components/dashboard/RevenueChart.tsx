
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <div className="symbol-card p-6">
      <div className="space-y-4">
        <div>
          <h3 className="brand-subheading text-lg text-symbol-black">
            Tendência de Faturamento
          </h3>
          <p className="brand-body text-symbol-gray-600 text-sm">
            Evolução mensal dos últimos 6 meses
          </p>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
