"use client";

import React from "react";
import {
  BarChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  BarSeries,
  Bar,
  GridlineSeries,
  Gridline,
} from "reaviz";

interface TherapistViewData {
  therapistId: string;
  therapistName: string;
  therapistCity: string;
  therapistStatus: string;
  viewCount: number;
}

interface TherapistViewRankingProps {
  data: TherapistViewData[];
}

const BAR_CHART_COLOR_SCHEME = ["#d4af37", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

interface ChartDataItem {
  key: string;
  data: number;
}

const validateBarChartData = (data: ChartDataItem[]): ChartDataItem[] => {
  return data.map((item) => ({
    ...item,
    data: typeof item.data !== "number" || isNaN(item.data) ? 0 : Number(item.data),
  }));
};

const TherapistViewRanking: React.FC<TherapistViewRankingProps> = ({ data }) => {
  const chartData: ChartDataItem[] = data.map((item) => ({
    key: item.therapistName,
    data: item.viewCount,
  }));

  const validatedChartData = validateBarChartData(chartData);

  return (
    <>
      <style jsx global>{`
        :root {
          --reaviz-tick-fill: #9a9aaf;
          --reaviz-gridline-stroke: #7e7e8f75;
          --reaviz-y-axis-label-fill: #9a9aaf;
        }
        .dark {
          --reaviz-tick-fill: #a0aec0;
          --reaviz-gridline-stroke: rgba(74, 85, 104, 0.6);
          --reaviz-y-axis-label-fill: #a0aec0;
        }
      `}</style>
      <div className="bg-white/5 backdrop-blur-sm border border-space-3 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">技师浏览排行榜</h3>

        {data.length > 0 ? (
          <div className="reaviz-chart-container h-[300px]">
            <BarChart
              height={300}
              id="therapist-view-ranking"
              data={validatedChartData}
              yAxis={
                <LinearYAxis
                  type="category"
                  tickSeries={
                    <LinearYAxisTickSeries
                      label={
                        <LinearYAxisTickLabel
                          format={(text) =>
                            typeof text === "string"
                              ? text.length > 8
                                ? `${text.slice(0, 8)}...`
                                : text
                              : ""
                          }
                          fill="var(--reaviz-y-axis-label-fill)"
                        />
                      }
                      tickSize={10}
                    />
                  }
                />
              }
              xAxis={
                <LinearXAxis
                  type="value"
                  axisLine={null}
                  tickSeries={<LinearXAxisTickSeries label={null} line={null} tickSize={10} />}
                />
              }
              series={
                <BarSeries
                  layout="horizontal"
                  bar={<Bar glow={{ blur: 20, opacity: 0.5 }} gradient={null} />}
                  colorScheme={BAR_CHART_COLOR_SCHEME}
                  padding={0.2}
                />
              }
              gridlines={
                <GridlineSeries line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />} />
              }
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            暂无浏览数据
          </div>
        )}

        {/* 详细列表 */}
        <div className="mt-6 space-y-3">
          {data.map((therapist, index) => (
            <div
              key={therapist.therapistId}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-quantum-300">#{index + 1}</span>
                <div>
                  <p className="text-white font-medium">{therapist.therapistName}</p>
                  <p className="text-gray-400 text-sm">{therapist.therapistCity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-quantum-300">{therapist.viewCount}</p>
                <p className="text-gray-400 text-sm">浏览次数</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TherapistViewRanking;
