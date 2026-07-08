"use client";

import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { calloutTipCommand, calloutWarningCommand, ctaButtonCommand } from "./mdxToolbarCommands";

export function MarkdownEditorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={520}
        preview="live"
        commands={[
          ...commands.getCommands(),
          commands.divider,
          ctaButtonCommand,
          calloutTipCommand,
          calloutWarningCommand,
        ]}
        extraCommands={commands.getExtraCommands()}
        textareaProps={{ placeholder: "Write your post in Markdown/MDX..." }}
      />
    </div>
  );
}
