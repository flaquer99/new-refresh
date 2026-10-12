import {
	formatExactTime,
	formatRelativeTime,
} from "@/lib/history/relative-time";

type RelativeTimeProps = {
	iso: string;
	now: Date;
};

export function RelativeTime({ iso, now }: RelativeTimeProps) {
	const exact = formatExactTime(iso);
	return (
		<time dateTime={iso} title={exact}>
			{formatRelativeTime(iso, now)}
			<span className="text-muted-foreground text-xs"> ({exact})</span>
		</time>
	);
}
