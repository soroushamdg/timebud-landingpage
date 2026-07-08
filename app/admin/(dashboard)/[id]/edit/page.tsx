import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import { PostEditor } from "../../../components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="display-font" style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
        Edit post
      </h1>
      <PostEditor post={post} />
    </div>
  );
}
