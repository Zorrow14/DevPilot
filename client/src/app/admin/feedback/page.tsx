import { AdminShell } from "@/src/components/layout/AdminShell";
import { FeedbackTable } from "@/src/components/admin/FeedbackTable";
import { mockFeedback } from "@/src/data/mockData";

export default function AdminFeedbackPage() {
  return (
    <AdminShell title="Feedback" description="Static feedback queue for future admin workflows.">
      <FeedbackTable feedback={mockFeedback} />
    </AdminShell>
  );
}
