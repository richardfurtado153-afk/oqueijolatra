interface BadgeProps {
  percentage: number
}

export default function Badge({ percentage }: BadgeProps) {
  return (
    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
      -{percentage}%
    </span>
  )
}
