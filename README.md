# ColorLab 🎨

> **Interactive Color & Shape Palette Designer for ggplot2 and RStudio**

[![R-CMD-check](https://img.shields.io/badge/R-4.0%2B-blue.svg)](https://www.r-project.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Viewer](https://img.shields.io/badge/RStudio-Viewer_Pane-blue.svg)](https://posit.co/)
[![GitHub](https://img.shields.io/badge/GitHub-BoazRosenberg%2FColorLab-181717.svg?logo=github)](https://github.com/BoazRosenberg/ColorLab)

**ColorLab** is an interactive, modern color palette and ggplot2 shape designer designed specifically to run in the **RStudio Viewer Pane** (or web browser). 

**Key benefit:** `colorlab()` runs **asynchronously and non-blocking**. It does **NOT stop your R console from running** — you can keep ColorLab open side-by-side in your Viewer pane while you write, execute R code, and create plots in your console!

---

## ⚡ Quick Installation

Install **ColorLab** directly from GitHub:

```r
# Option 1: Using pak (Fastest)
if (!requireNamespace("pak", quietly = TRUE)) install.packages("pak")
pak::pak("BoazRosenberg/ColorLab")

# Option 2: Using remotes
if (!requireNamespace("remotes", quietly = TRUE)) install.packages("remotes")
remotes::install_github("BoazRosenberg/ColorLab")
```

---

## 🚀 How to Launch in RStudio

Simply run `colorlab()` in your R console:

```r
library(ColorLab)
colorlab()
```

- **RStudio Viewer Pane:** Opens immediately in the Viewer tab.
- **Unblocked Console:** The R prompt returns instantly (`>`). You can type and run code freely!
- **1-Click Copy:** Click "Copy" on any color scale or vector, and paste (`Ctrl+V` / `Cmd+V`) directly into your R scripts.
- **External Browser:** Want a bigger window? Run `colorlab(browser = TRUE)`.

---

## 🧭 Features Overview

| Feature | Description | Code Output |
| :--- | :--- | :--- |
| **1. Custom Palette** | Compact square swatches. Click any square to pick/type colors. Add, delete, and reverse order. Optional name labels. | `c("#2C3E50", "#E74C3C", "#F1C40F", "#27AE60")` |
| **2. Presets** | Qualitative, Sequential, Diverging. Uses native R preset functions (**Okabe-Ito**, **ColorBrewer**, **Viridis**) instead of raw hexes. Slider with edge pruning. | `scale_color_discrete(type = palette.colors(palette = "Okabe-Ito"))` or `scale_color_brewer(palette = "Set2")` |
| **3. Gradient Builder** | Asymmetric multi-anchor builder. Up/down step clickers between anchors. Accurately calculates and renders **all colors (anchors + intermediate steps)**. | `scale_color_manual(values = c(...))` (all colors) or `scale_color_gradientn()` |
| **4. Shape Studio** | Pair point symbols (`pch` 0–25) with palette colors and fills. Preview is automatically a **scatter plot** displaying shapes and colors together. | `scale_shape_manual()` + `scale_color_manual()` |
| **5. CVD Simulator** | Simulate all palettes under **Protanopia**, **Deuteranopia**, **Tritanopia**, or **Grayscale** in real-time. | Real-time visual feedback |

---

## 💡 Quick Examples

### 1. Gold-Standard Colorblind-Safe Palette (Okabe-Ito)
```r
library(ggplot2)

# Copy directly from ColorLab Presets tab:
ggplot(iris, aes(x = Petal.Length, y = Petal.Width, color = Species)) +
  geom_point(size = 3) +
  scale_color_discrete(type = palette.colors(palette = "Okabe-Ito")) +
  theme_minimal()
```

### 2. Dual Encoding: Accessible Shapes + Colors
```r
library(ggplot2)

ggplot(iris, aes(x = Petal.Length, y = Petal.Width, color = Species, shape = Species)) +
  geom_point(size = 3.5, stroke = 1.2) +
  scale_shape_manual(values = c(21, 22, 24)) +
  scale_color_manual(values = c("#0F172A", "#0F172A", "#0F172A")) +
  scale_fill_manual(values = c("#3B82F6", "#10B981", "#F59E0B")) +
  theme_minimal()
```

### 3. Asymmetric Interpolated Gradient
```r
library(ggplot2)

# 3 anchors + steps = all 7 interpolated colors
grad_colors <- c("#2C3E50", "#6A4345", "#A8473A", "#E74C3C", "#EC8424", "#EFC315", "#F1C40F")

ggplot(mpg, aes(x = displ, y = hwy, color = class)) +
  geom_point(size = 3) +
  scale_color_manual(values = grad_colors) +
  theme_minimal()
```

---

## 📄 License

This package is open-source under the [MIT License](LICENSE).
