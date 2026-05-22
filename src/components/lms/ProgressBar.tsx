type Props = {
  value: number;
};

export default function ProgressBar({ value }: Props) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-orange-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}