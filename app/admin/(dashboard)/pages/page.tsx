import { getAllDocuments } from "@/lib/documents";
import { DocumentManager } from "../../components/DocumentManager";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const documents = await getAllDocuments();
  return (
    <div>
      <h1>Pages</h1>
      <p className="sub">
        The footer and legal pages. Markdown bodies, same as a blog post. Product and positioning copy
        deliberately is not here: it lives in the code so git reviews it.
      </p>
      <DocumentManager initial={documents} />
    </div>
  );
}
