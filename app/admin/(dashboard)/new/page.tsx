import { PostEditor } from "../../components/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="display-font" style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
        New post
      </h1>
      <PostEditor />
    </div>
  );
}
