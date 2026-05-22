"use client";

const skills = [
  { label: "Tư vấn học viên", current: 4.2, target: 5, average: 3.6 },
  { label: "Quản lý lớp học", current: 3.9, target: 5, average: 3.5 },
  { label: "Vận hành CRM", current: 4.1, target: 5, average: 3.4 },
  { label: "Xử lý phụ huynh", current: 3.7, target: 5, average: 3.3 },
  { label: "Theo dõi học tập", current: 4.4, target: 5, average: 3.8 },
];

const centerX = 260;
const centerY = 210;
const radius = 115;
const maxScore = 5;

function getPoint(index: number, value: number, customRadius?: number) {
  const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
  const r = customRadius ?? (value / maxScore) * radius;

  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle),
  };
}

function getPolygon(key: "current" | "target" | "average") {
  return skills
    .map((item, index) => {
      const point = getPoint(index, item[key]);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function getTextAnchor(index: number) {
  if (index === 0) return "middle";
  if (index === 1 || index === 2) return "start";
  return "end";
}

export default function CompetencyRadar() {
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <svg viewBox="0 0 520 430" className="h-[420px] w-full max-w-[620px]">
          {[1, 2, 3, 4, 5].map((level) => (
            <polygon
              key={level}
              points={skills
                .map((_, index) => {
                  const point = getPoint(index, level);
                  return `${point.x},${point.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          ))}

          {skills.map((item, index) => {
            const outer = getPoint(index, maxScore);
            const label = getPoint(index, 0, 155);

            return (
              <g key={item.label}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={getTextAnchor(index)}
                  dominantBaseline="middle"
                  className="fill-slate-900 text-[12px] font-bold"
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          <polygon
            points={getPolygon("target")}
            fill="#2563eb"
            fillOpacity="0.06"
            stroke="#2563eb"
            strokeWidth="2.5"
          />

          <polygon
            points={getPolygon("average")}
            fill="#64748b"
            fillOpacity="0.1"
            stroke="#64748b"
            strokeWidth="2"
          />

          <polygon
            points={getPolygon("current")}
            fill="#f97316"
            fillOpacity="0.28"
            stroke="#f97316"
            strokeWidth="3"
          />

          {skills.map((item, index) => {
            const point = getPoint(index, item.current);

            return (
              <circle
                key={item.label}
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="#f97316"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {[1, 2, 3, 4, 5].map((level) => {
            const y = centerY - (level / maxScore) * radius;
            return (
              <text
                key={level}
                x={centerX + 8}
                y={y + 3}
                className="fill-slate-400 text-[10px]"
              >
                {level}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500" />
          <span>Điểm thực tế</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          <span>Mục tiêu</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-500" />
          <span>Trung bình</span>
        </div>
      </div>
    </div>
  );
}