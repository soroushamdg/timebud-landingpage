"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/slug";
import type { Post } from "@/db/schema";
import { CoverImageUploader } from "./CoverImageUploader";
import { MediaPanel } from "./MediaPanel";

// react-md-editor touches the DOM at module scope, so it's loaded client-only.
const MarkdownEditorField = dynamic(
  () => import("./MarkdownEditorField").then((mod) => mod.MarkdownEditorField),
  { ssr: false, loading: () => <p style={{ padding: "1rem" }}>Loading editor…</p> }
);

type State = "idle" | "saving" | "error";

function toDatetimeLocalValue(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostEditor({ post }: { post?: Post }) {
  const isEditing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<Post["status"]>(post?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt ? toDatetimeLocalValue(post.scheduledAt) : "");

  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [ogDescription, setOgDescription] = useState(post?.ogDescription ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [coverImageAlt, setCoverImageAlt] = useState(post?.coverImageAlt ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(post?.ogImageUrl ?? "");
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>(post?.relatedSlugs ?? []);
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState(
    post?.internalLinkSuggestions ?? []
  );

  const [aiMeta, setAiMeta] = useState<unknown>(post?.aiMeta ?? null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState("");

  const [generatingField, setGeneratingField] = useState<"slug" | "tags" | "excerpt" | null>(null);
  const [fieldError, setFieldError] = useState("");

  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleInsertIntoContent(snippet: string) {
    setContent((c) => c + snippet);
  }

  async function handleOptimizeForSeo() {
    if (!title.trim() || !content.trim()) {
      setOptimizeError("Add a title and some content first.");
      return;
    }

    setOptimizing(true);
    setOptimizeError("");

    try {
      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          coverImageUrl: coverImageUrl || null,
          postId: post?.id ?? null,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        const result = data.result;
        setSeoTitle(result.seoTitle);
        setDescription(result.metaDescription);
        setOgDescription(result.ogDescription);
        if (result.coverImageAlt) setCoverImageAlt(result.coverImageAlt);
        if (!excerpt.trim() && result.excerpt) setExcerpt(result.excerpt);
        if (!tags.trim() && Array.isArray(result.tags)) setTags(result.tags.join(", "));
        if (Array.isArray(result.relatedSlugs)) setRelatedSlugs(result.relatedSlugs);
        if (Array.isArray(result.internalLinkSuggestions)) {
          setInternalLinkSuggestions(result.internalLinkSuggestions);
        }
        setAiMeta(result);
      } else {
        setOptimizeError(data.error ?? "Something went wrong.");
      }
    } catch {
      setOptimizeError("Network error. Please try again.");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleGenerateField(field: "slug" | "tags" | "excerpt") {
    if (!title.trim() || !content.trim()) {
      setFieldError("Add a title and some content first.");
      return;
    }

    setGeneratingField(field);
    setFieldError("");

    try {
      const res = await fetch("/api/admin/generate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, title, content }),
      });
      const data = await res.json();

      if (data.ok) {
        if (field === "slug") {
          setSlug(data.value as string);
          setSlugTouched(true);
        } else if (field === "tags") {
          setTags((data.value as string[]).join(", "));
        } else if (field === "excerpt") {
          setExcerpt(data.value as string);
        }
      } else {
        setFieldError(data.error ?? "Something went wrong.");
      }
    } catch {
      setFieldError("Network error. Please try again.");
    } finally {
      setGeneratingField(null);
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setState("error");
      setErrorMsg("Title and content are required.");
      return;
    }
    if (status === "scheduled" && !scheduledAt) {
      setState("error");
      setErrorMsg("Pick a date/time to schedule this post for.");
      return;
    }

    setState("saving");
    setErrorMsg("");

    const payload = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      scheduledAt: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      seoTitle: seoTitle || null,
      description: description || null,
      ogDescription: ogDescription || null,
      coverImageUrl: coverImageUrl || null,
      coverImageAlt: coverImageAlt || null,
      ogImageUrl: ogImageUrl || null,
      relatedSlugs,
      internalLinkSuggestions,
      aiMeta,
    };

    try {
      const res = await fetch(isEditing ? `/api/admin/posts/${post!.id}` : "/api/admin/posts", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        // Hard navigation, not router.push()+refresh() — that pair can race
        // with Next's client-side Router Cache and show a stale (pre-save)
        // dashboard. A full navigation guarantees the list reflects the save.
        window.location.href = "/admin";
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "2rem", alignItems: "start" }}>
      {/* Left: editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="pixel-input"
          style={{ fontSize: "1.25rem", fontWeight: 700 }}
        />

        <MarkdownEditorField value={content} onChange={setContent} />
      </div>

      {/* Right: media panel + post settings + SEO */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <MediaPanel onInsert={handleInsertIntoContent} />

        <div className="pixel-border" style={{ padding: "1.25rem", background: "var(--yellow)" }}>
          <label style={fieldLabelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Post["status"])}
            className="pixel-input"
            style={{ width: "100%" }}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>

          {status === "scheduled" && (
            <>
              <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>Publish at</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="pixel-input"
                style={{ width: "100%", fontSize: "0.85rem" }}
              />
            </>
          )}

          <FieldLabelWithAi label="Slug" field="slug" generatingField={generatingField} onGenerate={handleGenerateField} />
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />

          <FieldLabelWithAi label="Tags (comma separated)" field="tags" generatingField={generatingField} onGenerate={handleGenerateField} />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />

          <FieldLabelWithAi label="Excerpt" field="excerpt" generatingField={generatingField} onGenerate={handleGenerateField} />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem", minHeight: "70px", resize: "vertical" }}
          />

          {fieldError && (
            <p
              className="error-msg"
              style={{ fontSize: "0.8rem", borderLeft: "4px solid #000", paddingLeft: "0.5rem", marginTop: "1rem" }}
            >
              {fieldError}
            </p>
          )}
        </div>

        <div className="pixel-border" style={{ padding: "1.25rem", background: "var(--yellow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p className="display-font" style={{ fontSize: "0.7rem", margin: 0 }}>
              SEO &amp; social
            </p>
            <button
              type="button"
              onClick={handleOptimizeForSeo}
              disabled={optimizing}
              className="pixel-btn-outline"
              style={{ fontSize: "0.7rem", padding: "0.4rem 0.7rem", cursor: "pointer" }}
            >
              {optimizing ? "Thinking…" : "✨ Optimize for SEO"}
            </button>
          </div>

          {optimizeError && (
            <p
              className="error-msg"
              style={{ fontSize: "0.8rem", borderLeft: "4px solid #000", paddingLeft: "0.5rem", marginBottom: "1rem" }}
            >
              {optimizeError}
            </p>
          )}

          <label style={fieldLabelStyle}>Cover image</label>
          <CoverImageUploader
            url={coverImageUrl}
            alt={coverImageAlt}
            onUploaded={({ url, ogUrl }) => {
              setCoverImageUrl(url);
              if (ogUrl) setOgImageUrl(ogUrl);
            }}
          />

          <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>Cover image alt text</label>
          <input
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />

          <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>SEO title</label>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />

          <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>Meta description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem", minHeight: "70px", resize: "vertical" }}
          />

          <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>OG description</label>
          <textarea
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            className="pixel-input"
            style={{ width: "100%", fontSize: "0.85rem", minHeight: "70px", resize: "vertical" }}
          />

          {relatedSlugs.length > 0 && (
            <>
              <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>Related posts (AI-suggested)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {relatedSlugs.map((s) => (
                  <span key={s} className="pixel-tag">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          {internalLinkSuggestions.length > 0 && (
            <>
              <label style={{ ...fieldLabelStyle, marginTop: "1rem" }}>
                Internal links (AI-suggested — auto-inserted into the published post when the anchor text matches)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {internalLinkSuggestions.map((s, i) => (
                  <code
                    key={i}
                    style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.06)", padding: "0.4rem 0.5rem", wordBreak: "break-all" }}
                  >
                    [{s.anchorText}](/blog/{s.targetSlug})
                  </code>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={handleSave} disabled={state === "saving"} className="pixel-btn" style={{ width: "100%" }}>
          {state === "saving" ? "Saving..." : isEditing ? "Save changes" : "Create post"}
        </button>

        {state === "error" && (
          <p
            className="error-msg"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderLeft: "4px solid #000",
              paddingLeft: "0.75rem",
            }}
          >
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-pixel), monospace",
  fontSize: "0.6rem",
  marginBottom: "0.4rem",
};

function FieldLabelWithAi({
  label,
  field,
  generatingField,
  onGenerate,
}: {
  label: string;
  field: "slug" | "tags" | "excerpt";
  generatingField: "slug" | "tags" | "excerpt" | null;
  onGenerate: (field: "slug" | "tags" | "excerpt") => void;
}) {
  const busy = generatingField === field;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "1rem",
        marginBottom: "0.4rem",
      }}
    >
      <label style={{ ...fieldLabelStyle, marginBottom: 0 }}>{label}</label>
      <button
        type="button"
        onClick={() => onGenerate(field)}
        disabled={generatingField !== null}
        title={`Generate ${label.toLowerCase()} with AI`}
        style={{
          fontSize: "0.65rem",
          padding: "0.15rem 0.45rem",
          border: "2px solid var(--black)",
          background: busy ? "var(--black)" : "var(--yellow)",
          color: busy ? "var(--yellow)" : "var(--black)",
          cursor: generatingField !== null ? "default" : "pointer",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        {busy ? "…" : "✨ AI"}
      </button>
    </div>
  );
}
