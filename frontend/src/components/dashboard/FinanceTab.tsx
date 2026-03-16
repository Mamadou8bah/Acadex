import type { FormEvent } from "react";
import { createFeeStructure, generateInvoices, recordPayment, type FeeSummary, type OutstandingSummary, type PaymentHistoryItem } from "../../features/platform/api";
import { Items, Panel } from "./shared";

interface Session {
  accessToken: string;
  tenantId: string;
}

interface FinanceTabProps {
  session: Session;
  isSchoolAdmin: boolean;
  isSuperAdmin: boolean;
  isParent: boolean;
  finance: FeeSummary | undefined;
  outstanding: OutstandingSummary | undefined;
  payments: PaymentHistoryItem[];
  defaultStudentId: string;
  handle: (
    event: FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<unknown>,
    refresh?: string[],
    success?: string
  ) => Promise<void>;
  formatCurrency: (value: number) => string;
}

export function FinanceTab({
  session,
  isSchoolAdmin,
  isSuperAdmin,
  isParent,
  finance,
  outstanding,
  payments,
  defaultStudentId,
  handle,
  formatCurrency
}: FinanceTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel subtitle="Fees and collections" title="Finance summary">
        <Items values={[
          `Invoiced: ${finance?.totalInvoiced ?? 0}`,
          `Collected: ${finance?.totalCollected ?? 0}`,
          `Outstanding: ${finance?.outstandingBalance ?? 0}`
        ]} />
      </Panel>

      <Panel subtitle="Student finance" title="Outstanding balances">
        <Items values={[
          `Reference student: ${defaultStudentId || "No student available"}`,
          `Outstanding total: ${String(outstanding?.totalOutstanding ?? 0)}`,
          `Invoices: ${outstanding?.invoices?.length ?? 0}`,
          `Payments: ${payments.length}`
        ]} />
        <Items values={(outstanding?.invoices ?? []).slice(0, 4).map((invoice) => [
          invoice.id,
          formatCurrency(invoice.amount),
          invoice.status
        ].join(" • "))} />
      </Panel>

      {isSchoolAdmin || isSuperAdmin ? (
        <>
          <Panel subtitle="Finance operations" title="Create fee structure">
            <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createFeeStructure(session, {
              name: String(fd.get("name")),
              classId: String(fd.get("classId")),
              amount: Number(fd.get("amount")),
              dueDate: String(fd.get("dueDate"))
            }), ["finance"], "Fee structure created.")}>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Fee structure name" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="classId" placeholder="Class ID" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="amount" placeholder="Amount" type="number" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="dueDate" type="date" />
              <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create fee structure</button>
            </form>
          </Panel>

          <Panel subtitle="Billing actions" title="Invoices and payments">
            <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => generateInvoices(session, {
              feeStructureId: String(fd.get("feeStructureId")),
              classId: String(fd.get("classId"))
            }), ["finance"], "Invoices generated.")}>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="feeStructureId" placeholder="Fee structure ID" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="classId" placeholder="Class ID" />
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Generate invoices</button>
            </form>
            <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => recordPayment(session, {
              invoiceId: String(fd.get("invoiceId")),
              studentId: String(fd.get("studentId")),
              amount: Number(fd.get("amount")),
              reference: String(fd.get("reference"))
            }), ["finance"], "Payment recorded.")}>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="invoiceId" placeholder="Invoice ID" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="studentId" placeholder="Student ID" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="amount" placeholder="Amount" type="number" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="reference" placeholder="Payment reference" />
              <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Record payment</button>
            </form>
          </Panel>
        </>
      ) : (
        <Panel subtitle="Finance access" title={isParent ? "Family billing visibility" : "Student billing visibility"}>
          <p className="text-sm leading-7 text-black/70">
            {isParent
              ? "Parent-specific student finance will appear here once parent-student links are modeled. For now, only direct messages and notifications are shown."
              : "Students can see their own billing health and payment status, but fee setup remains school-admin only."}
          </p>
          <Items values={payments.slice(0, 4).map((payment) => [payment.reference, formatCurrency(payment.amount)].join(" • "))} />
        </Panel>
      )}
    </div>
  );
}
