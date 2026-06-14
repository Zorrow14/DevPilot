import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { Feedback } from "@/src/types";

type FeedbackTableProps = {
  feedback: Feedback[];
};

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 pr-4 font-semibold">User</th>
              <th className="py-3 pr-4 font-semibold">Category</th>
              <th className="py-3 pr-4 font-semibold">Message</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-700"
              >
                <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                  {item.userName}
                </td>
                <td className="py-4 pr-4">
                  <Badge>{item.category}</Badge>
                </td>
                <td className="py-4 pr-4">{item.message}</td>
                <td className="py-4 pr-4">
                  <Badge tone={item.status === "open" ? "amber" : "green"}>
                    {item.status}
                  </Badge>
                </td>
                <td className="py-4 pr-4">{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
