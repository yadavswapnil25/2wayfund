import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, Printer, ShieldAlert, ShieldCheck } from "lucide-react";
import { Note, ReviewLine } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { Modal } from "../../components/ui/Modal";
import { Btn } from "../../components/ui/Button";
import { displayMoney, formatCode } from "../../lib/format";
import { amountInWordsInr } from "../../lib/words";
import { clockTime, todayIso } from "../../lib/dates";

/** The Receipt (stage 3) and print voucher views for Transfer Funds —
 * split out purely to keep TransferFundsPage.tsx within this project's
 * file-length ceiling; both are pure presentational views driven by the
 * receipt the parent page already holds in state. */
export interface TransferReceiptView {
  reference: string;
  utr: string;
  held: boolean;
  debit: number;
  commission: number;
  commissionRate: number;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccount: string;
  routing: string;
  channelLabel: string;
  clearing: string;
  balance: number;
}

interface ReceiptPanelProps {
  receipt: TransferReceiptView;
  balancesHidden: boolean;
  onOpenVoucher: () => void;
  onReset: () => void;
}

export function TransferReceiptPanel({ receipt, balancesHidden, onOpenVoucher, onReset }: ReceiptPanelProps) {
  return (
    <div>
      <div className={`px-5 py-7 text-center border-b border-border-lt ${receipt.held ? "bg-[#FBF4E1]" : "bg-[#F0F8F3]"}`}>
        <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-3 ${receipt.held ? "bg-amber" : "bg-pos"}`}>
          {receipt.held ? <ShieldAlert size={22} /> : <CheckCircle2 size={22} />}
        </div>
        <h2 className="text-[19px] mb-1.5">{receipt.held ? "Submitted — Under Review" : "Payment Processed Successfully!"}</h2>
        <p className="m-0 text-ink-2 text-[12.5px]">
          {receipt.held
            ? "Authorised and accepted, then held for compliance screening before settlement."
            : "Amount debited and credited to beneficiary account. Core ledger transaction is finalised."}
        </p>
      </div>
      <div className="p-4.5 sm:p-5">
        <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-2 mb-4">
          <ReviewLine k="Bank UTR Number" v={receipt.utr} />
          <ReviewLine k="Transaction Ref No" v={receipt.reference} />
          <ReviewLine k="Beneficiary Payee" v={receipt.beneficiaryName} />
          <ReviewLine k="Beneficiary Bank" v={receipt.beneficiaryBank} />
          <ReviewLine k="Amount Transferred" v={formatCode(receipt.debit, "INR")} kind="total" />
          <ReviewLine k="Updated Balance" v={displayMoney(receipt.balance, "INR", balancesHidden)} kind="total" />
        </div>

        {receipt.held ? (
          <Note className="mt-2">
            Value band screening flagged this transaction for manual review, so it appears on your ledger as <strong>Under review</strong> rather
            than Completed. A reviewer adjudicates it before settlement.
          </Note>
        ) : null}
        <Note danger className="mt-2">
          2 Way Fund International is a fictional institution created for this design prototype — no real bank, no real funds. The debit and
          ledger entry above are real within this demonstration account.
        </Note>

        <div className="flex items-center gap-2.5 flex-wrap border-t border-border-lt pt-4 mt-4">
          <button
            type="button"
            onClick={onOpenVoucher}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            <Printer size={13} /> Download / Print Official Receipt
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-tint"
          >
            Make Another Transfer
          </button>
          <Link
            to="/statements"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink no-underline hover:bg-tint"
          >
            View in Passbook <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface VoucherModalProps {
  receipt: TransferReceiptView;
  accountNumber: string;
  ifsc: string;
  micr: string;
  balancesHidden: boolean;
  onClose: () => void;
}

export function TransferVoucherModal({ receipt, accountNumber, ifsc, micr, balancesHidden, onClose }: VoucherModalProps) {
  return (
    <Modal
      title={
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-navy" /> Official Bank Transaction Advisory Voucher
        </span>
      }
      onClose={onClose}
      footerExtra={
        <Btn variant="primary" onClick={() => window.print()}>
          <Printer size={13} className="inline -mt-0.5 mr-1" /> Print Receipt
        </Btn>
      }
    >
      <span className="inline-block text-[9.5px] font-bold tracking-wide uppercase text-neg bg-[#FBEAE8] border border-[#E0AEA7] px-2 py-0.5 rounded mb-2.5">
        Academic demo — fictional record, no real funds moved
      </span>
      <h4 className="mb-1 text-[15px]">2 Way Fund International</h4>
      <p className="text-ink-2 text-[11.5px] mb-1">Core Electronic Settlement &amp; Clearing Advisory</p>
      <p className="text-ink-2 text-[11.5px] mb-3">
        IFSC: {ifsc} · MICR: {micr}
      </p>
      <Tag variant={receipt.held ? "review" : "completed"} className="!inline-block mb-3">
        <span className="inline-flex items-center gap-1">
          {receipt.held ? <ShieldAlert size={11} /> : <Check size={11} />} Status: {receipt.held ? "Under Review" : "Successful"}
        </span>
      </Tag>
      <ReviewLine k="Bank UTR Number" v={receipt.utr} />
      <ReviewLine k="Core Reference ID" v={receipt.reference} />
      <ReviewLine k="Transaction Date" v={`${todayIso()} ${clockTime()}`} />
      <ReviewLine k="Remitter Account" v={accountNumber} />
      <ReviewLine k="Beneficiary Payee" v={receipt.beneficiaryName} />
      <ReviewLine k="Beneficiary Bank" v={receipt.beneficiaryBank} />
      <ReviewLine k="Routing / IFSC Code" v={receipt.routing} />
      <ReviewLine k="Payment Channel" v={receipt.channelLabel} />
      <ReviewLine k="Settled Amount" v={formatCode(receipt.debit, "INR")} kind="total" />
      <p className="text-ink-2 text-[11.5px] italic mt-2">Amount in words: {amountInWordsInr(receipt.debit)} Only</p>
      <ReviewLine k="Closing Balance" v={displayMoney(receipt.balance, "INR", balancesHidden)} />
      <p className="text-xs text-ink-2 mt-3">This is a computer-generated bank electronic advisory. No physical signature is required under Indian IT Act 2000.</p>
      <p className="text-xs text-neg font-semibold">2 Way Fund International is a fictional institution created for this design prototype. No real funds were transferred.</p>
    </Modal>
  );
}
