import type { ICommand, TextAreaTextApi, TextState } from "@uiw/react-md-editor";

export const ctaButtonCommand: ICommand = {
  name: "cta-button",
  keyCommand: "cta-button",
  buttonProps: { "aria-label": "Insert CTA button", title: "Insert CTA button" },
  icon: (
    <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }}>[CTA]</span>
  ),
  execute: (_state: TextState, api: TextAreaTextApi) => {
    api.replaceSelection('<CTAButton href="https://app.timebud.app" label="Try TimeBud free" />');
  },
};

export const calloutTipCommand: ICommand = {
  name: "callout-tip",
  keyCommand: "callout-tip",
  buttonProps: { "aria-label": "Insert tip callout", title: "Insert tip callout" },
  icon: <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }}>[i]</span>,
  execute: (state: TextState, api: TextAreaTextApi) => {
    const body = state.selectedText || "Your tip goes here.";
    api.replaceSelection(`<Callout type="tip">\n${body}\n</Callout>`);
  },
};

export const calloutWarningCommand: ICommand = {
  name: "callout-warning",
  keyCommand: "callout-warning",
  buttonProps: { "aria-label": "Insert warning callout", title: "Insert warning callout" },
  icon: <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }}>[!]</span>,
  execute: (state: TextState, api: TextAreaTextApi) => {
    const body = state.selectedText || "Your warning goes here.";
    api.replaceSelection(`<Callout type="warning">\n${body}\n</Callout>`);
  },
};
