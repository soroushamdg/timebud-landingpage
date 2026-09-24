import { getAllFaqs } from "@/lib/faqs";
import { FaqManager } from "../../components/FaqManager";

export const dynamic = "force-dynamic";

export default async function FaqAdminPage() {
  const faqs = await getAllFaqs();
  return (
    <div>
      <h1>FAQ</h1>
      <p className="sub">
        The questions on the landing page, in the order they appear. Order is changed with the move
        buttons, so it works on a phone and from a keyboard.
      </p>
      <FaqManager initial={faqs} />
    </div>
  );
}
