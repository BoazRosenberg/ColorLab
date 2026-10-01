# ColorLab 🎨

> **Interactive Color & Shape Palette Designer for ggplot2 and RStudio**

[![R-CMD-check](https://img.shields.io/badge/R-4.0%2B-blue.svg)](https://www.r-project.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![learnr](https://img.shields.io/badge/learnr-shiny__prerendered-green.svg)](https://rstudio.github.io/learnr/)
[![GitHub](https://img.shields.io/badge/GitHub-BoazRosenberg%2FColorLab-181717.svg?logo=github)](https://github.com/BoazRosenberg/ColorLab)

**ColorLab** is an R package containing a minimalist, interactive `learnr` tutorial designed specifically for the narrow dimensions of the **RStudio Tutorial Pane**.

Design custom swatches, sample and prune preset scales, construct asymmetric interpolated gradients, and pair colors with ggplot2 shape scales (`pch` 0–25)—all with real-time Color Vision Deficiency (CVD) simulation.

---

## ⚡ Quick Installation

You can install **ColorLab** directly from GitHub using your preferred package installer:

```r
# Option 1: Using pak (Fastest & recommended)
if (!requireNamespace("pak", quietly = TRUE)) install.packages("pak")
pak::pak("BoazRosenberg/ColorLab")

# Option 2: Using remotes
if (!requireNamespace("remotes", quietly = TRUE)) install.packages("remotes")
remotes::install_github("BoazRosenberg/ColorLab")

# Option 3: Using devtools
if (!requireNamespace("devtools", quietly = TRUE)) install.packages("devtools")
devtools::install_github("BoazRosenberg/ColorLab")
```

### Dependencies

`ColorLab` is built with lightweight, standard CRAN packages:
- `learnr` (>= 0.11.0)
- `shiny` (>= 1.8.0)
- `bslib` (>= 0.7.0)
- `ggplot2` (>= 3.5.0)
- `colorspace` (>= 2.1-0)

---

## 🚀 How to Launch in RStudio

Once installed, there are two easy ways to run ColorLab:

### Method 1: RStudio Tutorial Pane (Recommended)
1. Open RStudio.
2. In the top-right pane, click the **Tutorial** tab.
3. Locate **"Interactive Palette & Shape Studio"** and click **Start Tutorial**.

### Method 2: From the R Console
Run either of the following commands in your R console:

```r
library(ColorLab)
run_colorlab()

# Or use the alias:
launch_palette_tutorial()
```

---

## 🧭 Features Overview

| Feature | Description | Code Output |
| :--- | :--- | :--- |
| **1. Custom Palette** | Starts with 3 swatches. Add/remove colors, HTML5 color pickers, HEX inputs, reverse order, randomize, and optional labels. | `c("#1F77B4", "#FF7F0E", "#2CA02C")` |
| **2. Presets** | Filter by **Qualitative**, **Sequential**, or **Diverging**. Includes Viridis, Okabe-Ito, Paul Tol, RColorBrewer, and base R. Edge pruning slider trims extremes (e.g. 20%–80%). | `scale_color_viridis_d()` or `scale_color_brewer()` |
| **3. Gradient Builder** | Multi-anchor control points ($K$). Reorder anchors with Up/Down buttons. Adjust asymmetric step counts between adjacent pairs. | `scale_color_gradientn(colors = c(...))` |
| **4. Shape Selector** | Pair point symbols (`pch` 0–25) with active palette colors. Customize both perimeter `color` and interior `fill` for fillable shapes 21–25. | `scale_shape_manual()` + `scale_color_manual()` |
| **5. CVD Simulator** | Simulate all swatches and live ggplot2 previews under **Protanopia**, **Deuteranopia**, **Tritanopia**, or **Grayscale** via `colorspace`. | Real-time visual feedback |

---

## 💡 Quick Examples

### 1. Using a Custom Palette in ggplot2
```r
library(ggplot2)

my_palette <- c("#1F77B4", "#FF7F0E", "#2CA02C")

ggplot(iris, aes(x = Petal.Length, y = Petal.Width, color = Species)) +
  geom_point(size = 3) +
  scale_color_manual(values = my_palette) +
  theme_minimal()
```

### 2. Dual Encoding: Accessible Shapes + Colors
```r
library(ggplot2)

# Shapes: circle (16), triangle (17), square (15)
ggplot(iris, aes(x = Petal.Length, y = Petal.Width, color = Species, shape = Species)) +
  geom_point(size = 3.5, stroke = 1.2) +
  scale_shape_manual(values = c(16, 17, 15)) +
  scale_color_manual(values = c("#E69F00", "#56B4E9", "#009E73")) +
  theme_minimal()
```

### 3. Edge-Pruned Sequential Gradient
```r
library(ggplot2)

# Sampled from viridis with extreme bright yellow and dark black trimmed
pruned_scale <- c("#450F5F", "#721F81", "#9F2F7F", "#CD4071", "#F1605D")

ggplot(mpg, aes(x = displ, y = hwy, color = cty)) +
  geom_point(size = 3) +
  scale_color_gradientn(colors = pruned_scale) +
  theme_minimal()
```

---

## 🛠️ Offline & Local Source Installation

If you prefer to install without an internet connection or from a downloaded `.zip` file:

```r
# After downloading ColorLab_0.1.0.zip from the applet:
devtools::install_local("path/to/ColorLab.zip")
```

---

## 📄 License

This package is open-source under the [MIT License](LICENSE).
