export const OPERABLE_GUIDANCE = {
  "2.1.1":
    "Check that every link, button, and control can be reached and operated with the keyboard alone.",
  "2.1.2":
    "Check that keyboard focus never gets stuck inside a component, such as a modal or embedded widget.",
  "2.1.4":
    "Check that single-key shortcuts (letters, numbers, punctuation) can be turned off, remapped, or only work when the component has focus.",
  "2.2.1":
    "Check that time limits, such as session timeouts or automatic refreshes, can be turned off, adjusted, or extended.",
  "2.2.2":
    "Check that moving, blinking, scrolling, or auto-updating content lasting more than 5 seconds can be paused, stopped, or hidden.",
  "2.3.1": "Check that nothing flashes more than three times per second.",
  "2.4.3":
    "Check that the keyboard focus order follows a logical sequence that preserves meaning and operability.",
  "2.4.5":
    "Check that there is more than one way to find each page, such as navigation, search, or a site map.",
  "2.4.6":
    "Check that headings and labels describe the topic or purpose of the content they introduce.",
  "2.4.7":
    "Check that every focusable element shows a visible focus indicator when reached with the keyboard.",
  "2.4.11":
    "Check that sticky or fixed elements, such as headers or cookie banners, do not fully hide the focused element.",
  "2.5.1":
    "Check that actions using multipoint or path-based gestures can also be done with a single pointer without a path.",
  "2.5.2":
    "Check that single-pointer actions fire on release (not press) or can be aborted or undone.",
  "2.5.4":
    "Check that features triggered by device or user motion also work through regular controls and that motion can be disabled.",
  "2.5.7":
    "Check that any dragging action can also be completed with a single pointer, such as clicking or tapping.",
} as const;
