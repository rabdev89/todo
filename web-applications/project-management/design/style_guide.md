# Design System Style Guide: TodoAppCertification

## 1. Color Palette

### 🔹 Neutral Colors

| Token                    | Hex       | Usage                 |
| ------------------------ | --------- | --------------------- |
| `color-primary-dark`     | `#272D32` | Primary text, headers |
| `color-secondary`        | `#818D99` | Secondary text        |
| `color-tertiary`         | `#C7CED6` | Disabled text/icons   |
| `color-background-light` | `#F2F8FD` | Background shade      |
| `color-white`            | `#FFFFFF` | Base background       |

### 🔵 Brand / UI Colors

| Token        | Hex       | Usage                      |
| ------------ | --------- | -------------------------- |
| `color-blue` | `#027CEC` | Main buttons, status icons |
| `color-cyan` | `#62C6FF` | Checkbox, badge            |

### 🔴 Status Colors

| Token           | Hex       | Usage              |
| --------------- | --------- | ------------------ |
| `color-error`   | `#CA0061` | Errors, overdue    |
| `color-success` | `#009292` | Success, due today |

### 🟢 Priority (Frame)

| Token                     | Hex       | Usage |
| ------------------------- | --------- | ----- |
| `priority-low-frame`      | `#2FBD00` | Low priority border |
| `priority-high-frame`     | `#FAC300` | High priority border |
| `priority-critical-frame` | `#EB0000` | Critical priority border |

### 🌈 Priority (Background)

| Token                  | Hex       |
| ---------------------- | --------- |
| `priority-low-bg`      | `#F9FFF6` |
| `priority-high-bg`     | `#FFFDF2` |
| `priority-critical-bg` | `#FFF6F6` |

### 🔤 Priority (Text)

| Token                    | Hex       |
| ------------------------ | --------- |
| `priority-low-text`      | `#165700` |
| `priority-high-text`     | `#624D00` |
| `priority-critical-text` | `#7F0000` |

---

## 2. Typography

### Font Family
**Roboto**, sans-serif

### Type Scale

| Role         | Weight   | Size | Usage      |
| ------------ | -------- | ---- | ---------- |
| `heading-xl` | Bold     | 34px | Main Titles|
| `heading-lg` | SemiBold | 22px | Section Headers |
| `heading-md` | Medium   | 20px | Sub-headers |
| `body-lg`    | Regular  | 16px | Main Content |
| `label`      | Bold     | 14px | Form Labels |
| `body-sm`    | Regular  | 14px | Small Text |
| `caption`    | Regular  | 12px | De-emphasized |

---

## 3. CSS Variables

```css
:root {
  --color-primary-dark: #272D32;
  --color-secondary: #818D99;
  --color-tertiary: #C7CED6;
  --color-bg-light: #F2F8FD;
  --color-white: #FFFFFF;
  --color-blue: #027CEC;
  --color-cyan: #62C6FF;
  --color-error: #CA0061;
  --color-success: #009292;
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
```
