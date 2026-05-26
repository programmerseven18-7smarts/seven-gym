"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const AttendanceChart: React.FC = () => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#10B981"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["6-8", "8-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: "Jam",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      title: {
        text: "Pengunjung",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} orang`,
      },
    },
  };

  const series = [
    {
      name: "Check-ins",
      data: [12, 25, 18, 8, 15, 35, 42, 20],
    },
  ];

  return (
    <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Peak Hours
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Jam keramaian hari ini
        </p>
      </div>
      <div className="-mx-5 -mb-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

export default AttendanceChart;
