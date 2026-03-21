Here’s a clean, production-ready **style guide extracted from your image**, structured so you can directly use it in design systems or code.

---

# 🎨 Design System Style Guide

## 1. Color Palette

### 🔹 Neutral Colors

| Token                    | Hex       | Usage                 |
| ------------------------ | --------- | --------------------- |
| `color-primary-dark`     | `#272D32` | Primary text, headers |
| `color-secondary`        | `#818D99` | Secondary text        |
| `color-tertiary`         | `#C7CED6` | Disabled text/icons   |
| `color-background-light` | `#F2F8FD` | Background shade      |
| `color-white`            | `#FFFFFF` | Base background       |

---

### 🔵 Brand / UI Colors

| Token        | Hex       | Usage                      |
| ------------ | --------- | -------------------------- |
| `color-blue` | `#027CEC` | Main buttons, status icons |
| `color-cyan` | `#62C6FF` | Checkbox, badge            |

---

### 🔴 Status Colors

| Token           | Hex       | Usage              |
| --------------- | --------- | ------------------ |
| `color-error`   | `#CA0061` | Errors, overdue    |
| `color-success` | `#009292` | Success, due today |

---

### 🟢 Priority (Frame)

| Token                     | Hex       | Usage |
| ------------------------- | --------- | ----- |
| `priority-low-frame`      | `#2FBD00` |       |
| `priority-high-frame`     | `#FAC300` |       |
| `priority-critical-frame` | `#EB0000` |       |

---

### 🌈 Priority (Background)

| Token                  | Hex       |
| ---------------------- | --------- |
| `priority-low-bg`      | `#F9FFF6` |
| `priority-high-bg`     | `#FFFDF2` |
| `priority-critical-bg` | `#FFF6F6` |

---

### 🔤 Priority (Text)

| Token                    | Hex       |
| ------------------------ | --------- |
| `priority-low-text`      | `#165700` |
| `priority-high-text`     | `#624D00` |
| `priority-critical-text` | `#7F0000` |

---

## 2. Typography

### Font Family

```
Roboto, sans-serif
```

---

### Type Scale

| Role         | Weight   | Size | Example    |
| ------------ | -------- | ---- | ---------- |
| `heading-xl` | Bold     | 34px | Sign In    |
| `heading-lg` | SemiBold | 22px | Title Name |
| `heading-md` | Medium   | 20px | Subtitle   |
| `body-lg`    | Regular  | 16px | Sign out   |
| `label`      | Bold     | 14px | Task Title |
| `body-sm`    | Regular  | 14px | Complete   |
| `caption`    | Regular  | 12px | Date       |

---

## 3. Design Tokens (JSON)

```json
{
  "colors": {
    "primaryDark": "#272D32",
    "secondary": "#818D99",
    "tertiary": "#C7CED6",
    "backgroundLight": "#F2F8FD",
    "white": "#FFFFFF",

    "blue": "#027CEC",
    "cyan": "#62C6FF",

    "error": "#CA0061",
    "success": "#009292",

    "priority": {
      "low": {
        "frame": "#2FBD00",
        "bg": "#F9FFF6",
        "text": "#165700"
      },
      "high": {
        "frame": "#FAC300",
        "bg": "#FFFDF2",
        "text": "#624D00"
      },
      "critical": {
        "frame": "#EB0000",
        "bg": "#FFF6F6",
        "text": "#7F0000"
      }
    }
  },
  "typography": {
    "fontFamily": "Roboto, sans-serif",
    "scale": {
      "headingXL": { "size": 34, "weight": 700 },
      "headingLG": { "size": 22, "weight": 600 },
      "headingMD": { "size": 20, "weight": 500 },
      "bodyLG": { "size": 16, "weight": 400 },
      "label": { "size": 14, "weight": 700 },
      "bodySM": { "size": 14, "weight": 400 },
      "caption": { "size": 12, "weight": 400 }
    }
  }
}
```

---

## 4. CSS Variables (Ready to Use)

```css
:root {
  /* Neutral */
  --color-primary-dark: #272D32;
  --color-secondary: #818D99;
  --color-tertiary: #C7CED6;
  --color-bg-light: #F2F8FD;
  --color-white: #FFFFFF;

  /* Brand */
  --color-blue: #027CEC;
  --color-cyan: #62C6FF;

  /* Status */
  --color-error: #CA0061;
  --color-success: #009292;

  /* Priority */
  --priority-low: #2FBD00;
  --priority-high: #FAC300;
  --priority-critical: #EB0000;

  --priority-low-bg: #F9FFF6;
  --priority-high-bg: #FFFDF2;
  --priority-critical-bg: #FFF6F6;

  --priority-low-text: #165700;
  --priority-high-text: #624D00;
  --priority-critical-text: #7F0000;
}

/* Typography */
body {
  font-family: 'Roboto', sans-serif;
}

.h1 { font-size: 34px; font-weight: 700; }
.h2 { font-size: 22px; font-weight: 600; }
.h3 { font-size: 20px; font-weight: 500; }
.body { font-size: 16px; font-weight: 400; }
.label { font-size: 14px; font-weight: 700; }
.small { font-size: 14px; font-weight: 400; }
.caption { font-size: 12px; font-weight: 400; }
```

---

## 5. Component Usage Guidelines

### Buttons

* Primary → `--color-blue`
* Disabled → `--color-tertiary`
* Hover → slightly darker blue

### Status Indicators

* Error → `--color-error`
* Success → `--color-success`

### Priority Tags

* Use **frame + background + text combo**
* Always pair for accessibility

---

## 6. Quick Notes (UX Best Practices)

* Maintain contrast ratio (especially for priority colors)
* Use **bold sparingly** for hierarchy
* Stick to **Roboto scale only** (avoid random sizes)
* Use semantic tokens (not raw hex in components)

---

If you want, I can convert this into:

* ✅ Figma Design Tokens
* ✅ Tailwind config
* ✅ React UI theme (MUI / Chakra)
* ✅ Full component library

Just tell me 👍
