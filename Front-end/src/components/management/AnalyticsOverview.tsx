import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIssues } from '@/hooks/useIssues';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)', 'hsl(0, 84%, 60%)'];

export function AnalyticsOverview() {
  const { issues } = useIssues();

  const categoryData = [
    { name: 'Plumbing', value: issues.filter(i => i.category === 'plumbing').length },
    { name: 'Electrical', value: issues.filter(i => i.category === 'electrical').length },
    { name: 'Internet', value: issues.filter(i => i.category === 'internet').length },
    { name: 'Cleanliness', value: issues.filter(i => i.category === 'cleanliness').length },
  ];

  const trendData = [
    { month: 'Jan', issues: 12 },
    { month: 'Feb', issues: 19 },
    { month: 'Mar', issues: 15 },
    { month: 'Apr', issues: 25 },
    { month: 'May', issues: 22 },
  ];

  const statusData = [
    { name: 'Reported', value: issues.filter(i => i.status === 'reported').length },
    { name: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length },
    { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="issues" stroke="hsl(217, 91%, 60%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
