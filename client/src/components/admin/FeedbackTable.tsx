import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { Feedback } from "@/src/types";

type FeedbackTableProps = {
  feedback: Feedback[];
};

const statusTones = { open: "beacon", reviewed: "heading", closed: "nominal" } as const;

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              <th className="py-3 pr-4 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-dim">
                User
              </th>
              <th className="py-3 pr-4 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-dim">
                Category
              </th>
              <th className="py-3 pr-4 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-dim">
                Message
              </th>
              <th className="py-3 pr-4 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-dim">
                Status
              </th>
              <th className="py-3 pr-4 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-dim">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item.id} className="border-b border-bezel last:border-0">
                <td className="py-4 pr-4 font-semibold text-ink">{item.userName}</td>
                <td className="py-4 pr-4">
                  <Badge>{item.category}</Badge>
                </td>
                <td className="py-4 pr-4 text-ink-dim">{item.message}</td>
                <td className="py-4 pr-4">
                  <Badge tone={statusTones[item.status]}>{item.status}</Badge>
                </td>
                <td className="py-4 pr-4 text-ink-dim">{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
