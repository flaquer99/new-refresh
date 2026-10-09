export const PERCEIVABLE_GUIDANCE = {
  "1.1.1":
    "Check that each image's text alternative describes its content or purpose, and that decorative images have empty alt text.",
  "1.2.1":
    "Check that prerecorded audio-only content has a transcript and video-only content has a transcript or audio track.",
  "1.2.2":
    "Check that prerecorded videos with sound have accurate, synchronized captions.",
  "1.2.3":
    "Check that prerecorded videos have an audio description or a full text alternative of the visual content.",
  "1.2.4":
    "Check that live video streams with sound provide real-time captions.",
  "1.2.5":
    "Check that prerecorded videos have an audio description of important visual information.",
  "1.3.2":
    "Check that the reading order exposed to assistive technology matches the visual, meaningful order of the content.",
  "1.3.3":
    "Check that instructions do not rely only on shape, color, size, position, or sound (for example, 'click the round button').",
  "1.4.1":
    "Check that color is not the only way information is conveyed, such as links, errors, or required fields.",
  "1.4.5":
    "Check that text is presented as real text rather than images of text, except for logos or essential presentations.",
  "1.4.10":
    "Content scrolls horizontally at 320 px wide. Check that it reflows into one column without losing information or functionality.",
  "1.4.11":
    "Check that icons, input borders, focus indicators, and other meaningful graphics have at least 3:1 contrast against adjacent colors.",
  "1.4.12":
    "Check that no content is clipped or overlaps when line height, paragraph, letter, and word spacing are increased.",
  "1.4.13":
    "Check that content shown on hover or focus can be dismissed, can be hovered itself, and stays visible until dismissed.",
} as const;
