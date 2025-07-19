import { Database, CheckCircle, XCircle, Calendar } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentActivity } from "@/components/RecentActivity";
import { ExtractionChart } from "@/components/ExtractionChart";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your data extraction operations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Extractions Today"
          value="156"
          description="Across all configured jobs"
          icon={Database}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Successful Runs"
          value="148"
          description="95% success rate"
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Failed Runs"
          value="8"
          description="5% failure rate"
          icon={XCircle}
          trend={{ value: -2, isPositive: true }}
          variant="destructive"
        />
        <StatCard
          title="Jobs Scheduled"
          value="24"
          description="Next run in 2 hours"
          icon={Calendar}
          trend={{ value: 3, isPositive: true }}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <ExtractionChart />
        </div>
      </div>
    </div>
  );
}