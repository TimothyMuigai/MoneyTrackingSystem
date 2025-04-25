import React from 'react'
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export const CustomPieChart = ({ data, label, totalAmount, colors, showTextAnchor }) => {
  return (
    <>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}

          {showTextAnchor && (
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox;
                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fill="#00FF00"
                      fontSize="17px"
                    >
                      {label}
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      fill="#F59E0B"
                      fontSize="24px"
                      fontWeight="bold"
                    >
                      {totalAmount.toLocaleString()}
                    </text>
                  </>
                );
              }}
            />
          )}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: "rgba(31, 41, 55, 0.9)",
            borderColor: "#4B5563",
            color: "#fff",
          }}
          itemStyle={{ color: "#fff" }}
        />
      </PieChart>
    </ResponsiveContainer>

    <div className="flex flex-wrap justify-center mt-4 space-x-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="text-sm text-gray-700">{entry.name}</span>
        </div>
      ))}
      </div>
    </>
  );
};