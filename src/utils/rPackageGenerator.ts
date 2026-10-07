import JSZip from 'jszip';

export interface RPackageFile {
  path: string;
  description: string;
  content: string;
}

const tutorialContent = `---
title: "ColorLab"
description: "Interactive Color and Shape Palette Designer for ggplot2"
output: learnr::tutorial
runtime: shiny_prerendered
tutorial: true
---

\`\`\`{r setup, include=FALSE}
library(learnr)
library(shiny)
library(ggplot2)

knitr::opts_chunk$set(echo = FALSE)

# Initial Palette
init_colors <- c("#2C3E50", "#E74C3C", "#F1C40F", "#27AE60")

# Contrast calculation for hex labels (White on dark, black on light)
get_contrast_color <- function(hex) {
  if (is.na(hex) || hex == "" || !grepl("^#[0-9A-Fa-f]{6}", hex)) return("black")
  rgb <- col2rgb(hex)
  lum <- (0.299 * rgb[1] + 0.587 * rgb[2] + 0.114 * rgb[3]) / 255
  if (lum > 0.5) "#0F172A" else "#FFFFFF"
}

# Pure Base R Color Vision Deficiency (CVD) Simulation
sim_cvd <- function(cols, mode = "normal") {
  if (is.null(cols) || length(cols) == 0) return(character(0))
  mode <- tolower(if (is.null(mode) || length(mode) == 0) "normal" else as.character(mode[1]))
  if (mode %in% c("normal", "", "none")) return(cols)
  
  cols_clean <- sapply(cols, function(col) {
    if (!grepl("^#[0-9A-Fa-f]{6}", col)) return("#2C3E50")
    substr(col, 1, 7)
  })
  
  m_protan <- matrix(c(0.56667, 0.43333, 0, 0.55833, 0.44167, 0, 0, 0.24167, 0.75833), nrow = 3, byrow = TRUE)
  m_deutan <- matrix(c(0.62500, 0.37500, 0, 0.70000, 0.30000, 0, 0, 0.30000, 0.70000), nrow = 3, byrow = TRUE)
  m_tritan <- matrix(c(0.95000, 0.05000, 0, 0, 0.43333, 0.56667, 0, 0.47500, 0.52500), nrow = 3, byrow = TRUE)
  m_gray   <- matrix(c(0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114), nrow = 3, byrow = TRUE)
  
  mat <- switch(mode,
    "protan" = m_protan, "protanopia" = m_protan,
    "deutan" = m_deutan, "deuteranopia" = m_deutan,
    "tritan" = m_tritan, "tritanopia" = m_tritan,
    "grayscale" = m_gray, NULL
  )
  if (is.null(mat)) return(cols_clean)
  
  tryCatch({
    rgb_mat <- col2rgb(cols_clean) / 255
    sim_rgb <- mat %*% rgb_mat
    sim_rgb[sim_rgb < 0] <- 0
    sim_rgb[sim_rgb > 1] <- 1
    rgb(sim_rgb[1, ], sim_rgb[2, ], sim_rgb[3, ])
  }, error = function(e) cols_clean)
}

# Verified Metadata Engine (Qualitative, Sequential, Diverging)
pal_meta <- list(
  # Distinct / Qualitative
  "Okabe-Ito"   = list(int = "Okabe-Ito",  type = "base",    cb = TRUE,  kind = "qual"),
  "Tableau 10"  = list(int = "Tableau 10", type = "base",    cb = TRUE,  kind = "qual"),
  "Set 2"       = list(int = "Set2",       type = "brewer",  cb = TRUE,  kind = "qual"),
  "Dark 2"      = list(int = "Dark2",      type = "brewer",  cb = TRUE,  kind = "qual"),
  "Paired"      = list(int = "Paired",     type = "brewer",  cb = TRUE,  kind = "qual"),
  "Set 1"       = list(int = "Set1",       type = "brewer",  cb = FALSE, kind = "qual"),
  "Set 3"       = list(int = "Set3",       type = "brewer",  cb = FALSE, kind = "qual"),
  
  # Sequential (Viridis)
  "Viridis"     = list(int = "viridis",    type = "viridis", cb = TRUE,  kind = "seq"),
  "Cividis"     = list(int = "cividis",    type = "viridis", cb = TRUE,  kind = "seq"),
  "Magma"       = list(int = "magma",      type = "viridis", cb = TRUE,  kind = "seq"),
  "Plasma"      = list(int = "plasma",     type = "viridis", cb = TRUE,  kind = "seq"),
  "Inferno"     = list(int = "inferno",    type = "viridis", cb = TRUE,  kind = "seq"),
  
  # Sequential (Brewer)
  "Blues"       = list(int = "Blues",      type = "brewer",  cb = TRUE,  kind = "seq"),
  "Greens"      = list(int = "Greens",     type = "brewer",  cb = TRUE,  kind = "seq"),
  "Purples"     = list(int = "Purples",    type = "brewer",  cb = TRUE,  kind = "seq"),
  "Greys"       = list(int = "Greys",      type = "brewer",  cb = TRUE,  kind = "seq"),
  "Reds"        = list(int = "Reds",       type = "brewer",  cb = FALSE, kind = "seq"),
  "Oranges"     = list(int = "Oranges",    type = "brewer",  cb = FALSE, kind = "seq"),
  "YlOrRd"      = list(int = "YlOrRd",     type = "brewer",  cb = FALSE, kind = "seq"),
  
  # Diverging
  "RdBu"        = list(int = "RdBu",       type = "brewer",  cb = TRUE,  kind = "div"),
  "PiYG"        = list(int = "PiYG",       type = "brewer",  cb = TRUE,  kind = "div"),
  "PRGn"        = list(int = "PRGn",       type = "brewer",  cb = TRUE,  kind = "div"),
  "BrBG"        = list(int = "BrBG",       type = "brewer",  cb = TRUE,  kind = "div"),
  "Spectral"    = list(int = "Spectral",   type = "brewer",  cb = FALSE, kind = "div")
)

qual_list <- names(Filter(function(x) x$kind == "qual", pal_meta))
seq_list  <- names(Filter(function(x) x$kind == "seq",  pal_meta))
div_list  <- names(Filter(function(x) x$kind == "div",  pal_meta))
\`\`\`

\`\`\`{css, echo=FALSE}
body {
  background-color: #FFFFFF;
  font-family: system-ui, -apple-system, sans-serif;
  color: #0F172A;
}

.tutorial-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #E2E8F0;
}

.tutorial-brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.brand-icon {
  width: 20px;
  height: 20px;
  background-color: #2563EB;
  color: #FFFFFF;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11px;
}

.tutorial-brand-text {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.02em;
}

.nav-pills {
  background-color: #F1F5F9;
  padding: 3px;
  border-radius: 8px;
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.nav-pills .nav-link {
  color: #64748B;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  transition: all 0.15s ease;
  flex: 1;
  text-align: center;
}

.nav-pills .nav-link:hover {
  color: #0F172A;
}

.nav-pills .nav-link.active {
  background-color: #FFFFFF !important;
  color: #0F172A !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.palette-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  margin: 10px 0;
}

.color-box {
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  background-color: #FFFFFF;
  position: relative;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.color-box:hover {
  transform: translateY(-2px);
  border-color: #94A3B8;
}

.color-box.selected {
  transform: translateY(-3px);
  border: 3px solid #0F172A !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.color-box-add {
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #CBD5E1;
  border-radius: 8px;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.color-box-add:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.hex-label {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-weight: 700;
  font-size: 11px;
  pointer-events: none;
  letter-spacing: -0.02em;
}

.usage-box {
  background: #F8FAFC;
  color: #0F172A;
  padding: 8px 10px;
  border-radius: 6px;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 11px;
  border: 1px solid #E2E8F0;
  word-break: break-all;
  margin-top: 4px;
}

.mini-box {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin: 2px;
  border: 1px solid #CBD5E1;
}

.mini-box.active {
  border: 2px solid #0F172A !important;
  outline: 1px solid #FFF;
}
\`\`\`

\`\`\`{r studio_ui, echo=FALSE}
fluidPage(
  theme = bslib::bs_theme(version = 5, bg = "#FFFFFF", fg = "#0F172A", primary = "#2563EB"),
  
  div(class = "tutorial-title",
    div(class = "tutorial-brand-badge",
      span(class = "brand-icon", "C"),
      span(class = "tutorial-brand-text", "ColorLab")
    ),
    div(style = "display: flex; align-items: center; gap: 6px;",
      span(style = "font-size: 11px; color: #64748B;", "Vision:"),
      selectInput(
        "cvd_mode",
        label = NULL,
        choices = c(
          "Normal" = "normal",
          "Protanopia" = "protan",
          "Deuteranopia" = "deutan",
          "Tritanopia" = "tritan",
          "Grayscale" = "grayscale"
        ),
        selected = "normal",
        width = "115px"
      )
    )
  ),
  
  tabsetPanel(
    id = "main_tabs",
    type = "pills",
    
    tabPanel("Custom",
      div(style = "padding-top: 6px;",
        div(style = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding: 6px 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;",
          uiOutput("custom_picker_ui"),
          div(style = "display: flex; gap: 4px;",
            actionButton("add_btn", "+ Add Square", class = "btn-sm btn-primary", style = "font-size: 11px; padding: 3px 8px;"),
            actionButton("del_btn", "Remove", class = "btn-sm btn-outline-secondary", style = "font-size: 11px; padding: 3px 8px;")
          )
        ),
        uiOutput("palette_ui"),
        div(style = "display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px solid #F1F5F9;",
          checkboxInput("show_labels", tags$span(style="font-size:11px; color:#475569;", "Include Variable Names"), value = FALSE),
          actionLink("reverse_btn", tags$span(style="font-size:11px; color:#64748B;", "Reverse Order"))
        ),
        div(style = "margin-top: 6px;",
          div(style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;",
            tags$span(style = "font-size: 10px; font-weight: 700; color: #64748B;", "R VECTOR CODE:"),
            tags$button(
              "Copy",
              onclick = "navigator.clipboard.writeText(document.getElementById('palette_code').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);",
              style = "font-size: 10px; padding: 1px 7px; border: 1px solid #CBD5E1; background: #FFF; border-radius: 4px; cursor: pointer; color: #334155;"
            )
          ),
          div(class = "usage-box", verbatimTextOutput("palette_code"))
        )
      )
    ),
    
    tabPanel("Presets",
      div(style = "padding-top: 6px;",
        radioButtons("gen_type", NULL, choices = c("Qualitative" = "qual", "Sequential" = "seq", "Diverging" = "div"), inline = TRUE),
        div(style = "display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;",
          div(style = "flex: 1;", uiOutput("gen_name_ui")),
          div(style = "margin-top: 14px;", checkboxInput("gen_cb", tags$span(style="font-size:11px;", "CVD Safe Only"), value = TRUE))
        ),
        sliderInput("gen_n", "Colors (n):", min = 2, max = 12, value = 5, step = 1, width = "100%"),
        div(style = "display: flex; align-items: center; justify-content: space-between;",
          checkboxInput("enable_prune", tags$span(style="font-size:11px; color:#475569;", "Edge Pruning"), value = FALSE),
          checkboxInput("preset_as_vector", tags$span(style="font-size:11px; color:#475569;", "Output as Vector"), value = FALSE)
        ),
        conditionalPanel(
          condition = "input.enable_prune == true",
          sliderInput("gen_clip", "Cutoff (%):", min = 0, max = 100, value = c(0, 100), step = 5, width = "100%")
        ),
        plotOutput("gen_preview_plot", height = "32px"),
        actionButton("apply_gen", "Import to Custom", class = "btn-sm btn-dark w-100", style = "margin: 8px 0; font-size: 11px;"),
        div(style = "margin-top: 4px;",
          div(style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;",
            tags$span(style = "font-size: 10px; font-weight: 700; color: #64748B;", "R CODE:"),
            tags$button(
              "Copy",
              onclick = "navigator.clipboard.writeText(document.getElementById('gen_code_output').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);",
              style = "font-size: 10px; padding: 1px 7px; border: 1px solid #CBD5E1; background: #FFF; border-radius: 4px; cursor: pointer; color: #334155;"
            )
          ),
          div(class = "usage-box", verbatimTextOutput("gen_code_output"))
        )
      )
    ),
    
    tabPanel("Gradient",
      div(style = "padding-top: 6px;",
        div(style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;",
          uiOutput("gradient_header_ui"),
          div(style = "display: flex; gap: 4px;",
            actionButton("reverse_grad_btn", "Reverse", class = "btn-sm btn-outline-secondary", style = "font-size: 11px; padding: 2px 7px;"),
            actionButton("add_grad_anchor", "+ Add Anchor", class = "btn-sm btn-primary", style = "font-size: 11px; padding: 2px 8px;")
          )
        ),
        uiOutput("gradient_anchors_ui"),
        plotOutput("gradient_ribbon_plot", height = "32px"),
        uiOutput("gradient_import_btn_ui"),
        div(style = "margin-top: 4px;",
          div(style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;",
            tags$span(style = "font-size: 10px; font-weight: 700; color: #64748B;", "R CODE:"),
            tags$button(
              "Copy",
              onclick = "navigator.clipboard.writeText(document.getElementById('gradient_code_output').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);",
              style = "font-size: 10px; padding: 1px 7px; border: 1px solid #CBD5E1; background: #FFF; border-radius: 4px; cursor: pointer; color: #334155;"
            )
          ),
          div(class = "usage-box", verbatimTextOutput("gradient_code_output"))
        )
      )
    ),
    
    tabPanel("Shapes",
      div(style = "padding-top: 6px;",
        fluidRow(
          column(7,
            div(style = "border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px; background: #FFFFFF;",
              plotOutput("shape_grid", click = "grid_click", height = "165px")
            )
          ),
          column(5,
            plotOutput("shape_preview", height = "80px"),
            tags$div(style = "font-size: 10px; font-weight: 600; color: #64748B; margin: 4px 0 2px 0;", "Border Color:"),
            uiOutput("color_selector_ui"),
            uiOutput("fill_selector_ui")
          )
        )
      )
    )
  ),
  
  hr(style = "margin: 8px 0;"),
  div(style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;",
    tags$span(style = "font-size: 11px; font-weight: 700; color: #334155;", "Live Plot Preview"),
    radioButtons("plot_mode_toggle", NULL, choices = c("Bars" = "bars", "Scatter" = "scatter"), inline = TRUE, selected = "bars")
  ),
  plotOutput("live_preview_plot", height = "145px")
)
\`\`\`

\`\`\`{r studio_server, context="server"}
rv <- reactiveValues(
  palette = init_colors,
  selected_idx = 1,
  selected_shape = 21,
  preview_color = init_colors[1],
  preview_fill = init_colors[2],
  grad_anchors = c("#2C3E50", "#E74C3C", "#F1C40F"),
  grad_steps = c(2, 2)
)

output$custom_picker_ui <- renderUI({
  cur_col <- rv$palette[rv$selected_idx]
  if (is.null(cur_col) || is.na(cur_col)) cur_col <- "#2C3E50"
  
  div(
    style = "display: flex; align-items: center; gap: 8px;",
    tags$label(style = "font-size: 11px; font-weight: 700; color: #334155; margin: 0;", paste0("Square #", rv$selected_idx, ":")),
    div(
      style = paste0("width: 28px; height: 28px; border-radius: 5px; background: ", cur_col, "; border: 2px solid #0F172A; position: relative; overflow: hidden; cursor: pointer;"),
      tags$input(
        type = "color",
        id = "col_picker_input",
        value = cur_col,
        style = "opacity: 0; width: 100%; height: 100%; position: absolute; cursor: pointer;",
        oninput = "Shiny.setInputValue('col_picker_change', this.value, {priority: 'event'})",
        onchange = "Shiny.setInputValue('col_picker_change', this.value, {priority: 'event'})"
      )
    ),
    tags$input(
      type = "text",
      value = cur_col,
      maxlength = "7",
      style = "width: 72px; text-transform: uppercase; font-family: monospace; font-size: 11px; font-weight: 700; text-align: center; border: 1px solid #CBD5E1; border-radius: 4px; padding: 2px 4px;",
      onchange = "if(this.value.match(/^#[0-9A-Fa-f]{6}$/)) Shiny.setInputValue('col_picker_change', this.value, {priority: 'event'})"
    )
  )
})

observeEvent(input$col_picker_change, {
  req(rv$selected_idx)
  rv$palette[rv$selected_idx] <- toupper(input$col_picker_change)
})

output$palette_ui <- renderUI({
  cvd <- if (!is.null(input$cvd_mode)) input$cvd_mode else "normal"
  simmed <- sim_cvd(rv$palette, cvd)
  
  boxes <- lapply(seq_along(rv$palette), function(i) {
    is_sel <- if (rv$selected_idx == i) "selected" else ""
    txt_col <- get_contrast_color(simmed[i])
    tags$div(
      class = paste("color-box", is_sel),
      style = paste0("background-color:", simmed[i], ";"),
      onclick = sprintf("Shiny.setInputValue('box_clicked', %d, {priority: 'event'})", i),
      tags$span(class = "hex-label", style = paste0("color:", txt_col, ";"), rv$palette[i]),
      tags$span(style = paste0("color:", txt_col, "; font-size: 9px; opacity: 0.8; font-weight: 600; margin-top: 1px;"), paste0("#", i))
    )
  })
  
  add_box <- tags$div(
    class = "color-box-add",
    onclick = "Shiny.setInputValue('add_btn_click', Math.random(), {priority: 'event'})",
    title = "Add new color square",
    tags$span(style = "font-size: 18px; color: #94A3B8; font-weight: 300;", "+"),
    tags$span(style = "font-size: 10px; color: #64748B; font-weight: 600;", "Add")
  )
  
  tags$div(class = "palette-container", c(boxes, list(add_box)))
})

observeEvent(input$box_clicked, {
  rv$selected_idx <- as.integer(input$box_clicked)
})

add_square_fn <- function() {
  next_colors <- c("#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6", "#06B6D4")
  new_color <- next_colors[(length(rv$palette) %% length(next_colors)) + 1]
  rv$palette <- c(rv$palette, new_color)
  rv$selected_idx <- length(rv$palette)
}

observeEvent(input$add_btn, { add_square_fn() })
observeEvent(input$add_btn_click, { add_square_fn() })

observeEvent(input$del_btn, {
  if (length(rv$palette) > 1) {
    rv$palette <- rv$palette[-rv$selected_idx]
    rv$selected_idx <- max(1, min(rv$selected_idx, length(rv$palette)))
  }
})

observeEvent(input$reverse_btn, {
  rv$palette <- rev(rv$palette)
})

output$palette_code <- renderText({
  if (isTRUE(input$show_labels)) {
    items <- sapply(seq_along(rv$palette), function(i) paste0("c", i, " = '", rv$palette[i], "'"))
    paste0("c(", paste(items, collapse = ", "), ")")
  } else {
    paste0("c('", paste(rv$palette, collapse = "', '"), "')")
  }
})

output$gen_name_ui <- renderUI({
  sub_type <- if (!is.null(input$gen_type)) input$gen_type else "qual"
  pool_meta <- Filter(function(x) x$kind == sub_type, pal_meta)
  if (isTRUE(input$gen_cb)) pool_meta <- Filter(function(x) isTRUE(x$cb), pool_meta)
  choices <- names(pool_meta)
  if (length(choices) == 0) choices <- names(pal_meta)
  selectInput("gen_name", "Palette:", choices = choices, width = "100%")
})

generated_pal_reactive <- reactive({
  req(input$gen_name)
  meta <- pal_meta[[input$gen_name]]
  if (is.null(meta)) meta <- pal_meta[[1]]
  n <- if (!is.null(input$gen_n)) as.integer(input$gen_n) else 5
  
  pal_raw <- if (meta$type == "viridis") {
    if (requireNamespace("viridis", quietly = TRUE)) {
      viridis::viridis(100, option = meta$int)
    } else {
      colorRampPalette(c("#440154", "#21908C", "#FDE725"))(100)
    }
  } else if (meta$type == "brewer") {
    if (requireNamespace("RColorBrewer", quietly = TRUE)) {
      max_cols <- RColorBrewer::brewer.pal.info[meta$int, "maxcolors"]
      colorRampPalette(RColorBrewer::brewer.pal(max_cols, meta$int))(100)
    } else {
      colorRampPalette(c("#1B9E77", "#D95F02", "#7570B3"))(100)
    }
  } else {
    colorRampPalette(palette.colors(palette = meta$int))(100)
  }
  
  if (isTRUE(input$enable_prune) && !is.null(input$gen_clip)) {
    rng <- input$gen_clip / 100
    idx <- round(seq(from = max(1, round(rng[1] * 100)), to = min(100, round(rng[2] * 100)), length.out = 100))
    pal_raw <- pal_raw[idx]
  }
  colorRampPalette(pal_raw)(n)
})

output$gen_preview_plot <- renderPlot({
  pal <- generated_pal_reactive()
  cvd <- if (!is.null(input$cvd_mode)) input$cvd_mode else "normal"
  simmed <- sim_cvd(pal, cvd)
  df <- data.frame(x = seq_along(simmed), y = 1)
  ggplot(df, aes(x, y, fill = factor(x))) +
    geom_tile(width = 0.98, height = 0.9) +
    scale_fill_manual(values = simmed) +
    theme_void() +
    theme(legend.position = "none", plot.margin = margin(1, 1, 1, 1))
})

observeEvent(input$apply_gen, {
  rv$palette <- generated_pal_reactive()
  rv$selected_idx <- 1
  updateTabsetPanel(session, "main_tabs", selected = "Custom")
})

output$gen_code_output <- renderText({
  req(input$gen_name)
  meta <- pal_meta[[input$gen_name]]
  if (isTRUE(input$preset_as_vector)) {
    return(paste0("c('", paste(generated_pal_reactive(), collapse = "', '"), "')"))
  }
  if (isTRUE(input$enable_prune)) {
    return(paste0("scale_color_manual(values = c('", paste(generated_pal_reactive(), collapse = "', '"), "'))"))
  }
  if (meta$type == "viridis") {
    paste0("scale_color_viridis_d(option = '", meta$int, "')")
  } else if (meta$type == "brewer") {
    paste0("scale_color_brewer(palette = '", meta$int, "')")
  } else {
    paste0("scale_color_manual(values = c('", paste(generated_pal_reactive(), collapse = "', '"), "'))")
  }
})

gradient_counts <- reactive({
  n_anchors <- length(rv$grad_anchors)
  steps_sum <- if (n_anchors > 1) sum(rv$grad_steps[1:(n_anchors - 1)]) else 0
  list(anchors = n_anchors, steps = steps_sum, total = n_anchors + steps_sum)
})

output$gradient_header_ui <- renderUI({
  cnt <- gradient_counts()
  tags$span(
    style = "font-size: 11px; font-weight: 700; color: #334155;",
    sprintf("Anchors & Steps (%d anchors + %d steps = %d colors)", cnt$anchors, cnt$steps, cnt$total)
  )
})

output$gradient_import_btn_ui <- renderUI({
  cnt <- gradient_counts()
  actionButton(
    "apply_gradient",
    sprintf("Import %d Colors to Custom", cnt$total),
    class = "btn-sm btn-dark w-100",
    style = "margin: 8px 0; font-size: 11px;"
  )
})

observeEvent(input$add_grad_anchor, {
  pool <- c("#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6")
  next_col <- pool[(length(rv$grad_anchors) %% length(pool)) + 1]
  rv$grad_anchors <- c(rv$grad_anchors, next_col)
  rv$grad_steps   <- c(rv$grad_steps, 2)
})

observeEvent(input$reverse_grad_btn, {
  rv$grad_anchors <- rev(rv$grad_anchors)
  rv$grad_steps <- rev(rv$grad_steps)
})

observeEvent(input$move_grad_left, {
  idx <- as.integer(input$move_grad_left)
  if (idx > 1 && idx <= length(rv$grad_anchors)) {
    tmp <- rv$grad_anchors[idx]
    rv$grad_anchors[idx] <- rv$grad_anchors[idx - 1]
    rv$grad_anchors[idx - 1] <- tmp
  }
})

observeEvent(input$move_grad_right, {
  idx <- as.integer(input$move_grad_right)
  if (idx >= 1 && idx < length(rv$grad_anchors)) {
    tmp <- rv$grad_anchors[idx]
    rv$grad_anchors[idx] <- rv$grad_anchors[idx + 1]
    rv$grad_anchors[idx + 1] <- tmp
  }
})

observeEvent(input$del_grad_anchor, {
  idx <- as.integer(input$del_grad_anchor)
  if (length(rv$grad_anchors) > 2 && idx >= 1 && idx <= length(rv$grad_anchors)) {
    rv$grad_anchors <- rv$grad_anchors[-idx]
    rv$grad_steps <- rv$grad_steps[-min(idx, length(rv$grad_steps))]
  }
})

observeEvent(input$grad_anchor_val, {
  evt <- input$grad_anchor_val
  if (!is.null(evt) && !is.null(evt$index) && !is.null(evt$val)) {
    idx <- as.integer(evt$index)
    if (idx >= 1 && idx <= length(rv$grad_anchors)) {
      rv$grad_anchors[idx] <- toupper(evt$val)
    }
  }
})

observeEvent(input$grad_step_val, {
  evt <- input$grad_step_val
  if (!is.null(evt) && !is.null(evt$index) && !is.null(evt$val)) {
    idx <- as.integer(evt$index)
    val <- max(0, min(8, as.integer(evt$val)))
    if (idx >= 1 && idx <= length(rv$grad_steps)) {
      rv$grad_steps[idx] <- val
    }
  }
})

output$gradient_anchors_ui <- renderUI({
  cvd <- if (!is.null(input$cvd_mode)) input$cvd_mode else "normal"
  sim_anchors <- sim_cvd(rv$grad_anchors, cvd)
  
  nodes <- list()
  for (i in seq_along(rv$grad_anchors)) {
    anchor_box <- div(
      style = "display: inline-flex; flex-direction: column; align-items: center; margin: 2px;",
      div(
        style = paste0("width: 38px; height: 38px; border-radius: 6px; background: ", sim_anchors[i], "; border: 2px solid #0F172A; position: relative; overflow: hidden; cursor: pointer;"),
        title = paste0("Anchor #", i, ": ", rv$grad_anchors[i]),
        tags$input(
          type = "color",
          value = rv$grad_anchors[i],
          style = "opacity: 0; width: 100%; height: 100%; position: absolute; top:0; left:0; cursor: pointer;",
          oninput = sprintf("Shiny.setInputValue('grad_anchor_val', {index: %d, val: this.value}, {priority: 'event'})", i),
          onchange = sprintf("Shiny.setInputValue('grad_anchor_val', {index: %d, val: this.value}, {priority: 'event'})", i)
        )
      ),
      tags$span(style = "font-size: 10px; font-weight: 700; color: #475569; margin-top: 2px;", paste0("K", i)),
      div(style = "display: flex; gap: 2px; margin-top: 1px;",
        if (i > 1) {
          tags$button("‹", style = "font-size: 10px; padding: 0 4px; border: 1px solid #CBD5E1; background: #FFF; border-radius: 2px; cursor: pointer;",
            onclick = sprintf("Shiny.setInputValue('move_grad_left', %d, {priority: 'event'})", i))
        } else NULL,
        if (i < length(rv$grad_anchors)) {
          tags$button("›", style = "font-size: 10px; padding: 0 4px; border: 1px solid #CBD5E1; background: #FFF; border-radius: 2px; cursor: pointer;",
            onclick = sprintf("Shiny.setInputValue('move_grad_right', %d, {priority: 'event'})", i))
        } else NULL,
        if (length(rv$grad_anchors) > 2) {
          tags$button("×", style = "font-size: 10px; padding: 0 4px; border: 1px solid #CBD5E1; background: #FFF; color: #EF4444; border-radius: 2px; cursor: pointer;",
            onclick = sprintf("Shiny.setInputValue('del_grad_anchor', %d, {priority: 'event'})", i))
        } else NULL
      )
    )
    nodes[[length(nodes) + 1]] <- anchor_box
    
    if (i < length(rv$grad_anchors)) {
      st <- if (i <= length(rv$grad_steps)) rv$grad_steps[i] else 2
      inter_ramp <- colorRampPalette(c(rv$grad_anchors[i], rv$grad_anchors[i + 1]))(st + 2)
      inter_cols <- if (st > 0) inter_ramp[2:(st + 1)] else character(0)
      inter_sim  <- sim_cvd(inter_cols, cvd)
      
      small_squares <- lapply(seq_along(inter_sim), function(sIdx) {
        div(style = paste0("width: 14px; height: 14px; border-radius: 2px; background: ", inter_sim[sIdx], "; border: 1px solid #CBD5E1;"),
            title = inter_cols[sIdx])
      })
      
      step_box <- div(
        style = "display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;",
        tags$span(style = "font-size: 9px; color: #64748B;", "steps"),
        tags$input(
          type = "number",
          min = "0", max = "8", value = st,
          style = "width: 38px; height: 24px; text-align: center; font-size: 11px; border: 1px solid #CBD5E1; border-radius: 4px;",
          onchange = sprintf("Shiny.setInputValue('grad_step_val', {index: %d, val: this.value}, {priority: 'event'})", i)
        ),
        div(style = "display: flex; gap: 2px; margin-top: 3px;", small_squares)
      )
      nodes[[length(nodes) + 1]] <- step_box
    }
  }
  
  div(style = "display: flex; align-items: center; flex-wrap: wrap; gap: 2px; margin-bottom: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px; border-radius: 6px;", nodes)
})

gradient_full_reactive <- reactive({
  anchors <- rv$grad_anchors
  steps   <- rv$grad_steps
  if (length(anchors) == 0) return(character(0))
  if (length(anchors) == 1) return(anchors)
  
  res <- c()
  for (i in 1:(length(anchors) - 1)) {
    k1 <- anchors[i]
    k2 <- anchors[i + 1]
    st <- if (i <= length(steps)) steps[i] else 2
    seg <- colorRampPalette(c(k1, k2))(st + 2)
    if (i > 1) seg <- seg[-1]
    res <- c(res, seg)
  }
  res
})

output$gradient_ribbon_plot <- renderPlot({
  pal <- gradient_full_reactive()
  cvd <- if (!is.null(input$cvd_mode)) input$cvd_mode else "normal"
  simmed <- sim_cvd(pal, cvd)
  df <- data.frame(x = seq_along(simmed), y = 1)
  ggplot(df, aes(x, y, fill = factor(x))) +
    geom_tile(width = 1.05, height = 1) +
    scale_fill_manual(values = simmed) +
    theme_void() +
    theme(legend.position = "none", plot.margin = margin(1, 1, 1, 1))
})

observeEvent(input$apply_gradient, {
  rv$palette <- gradient_full_reactive()
  rv$selected_idx <- 1
  updateTabsetPanel(session, "main_tabs", selected = "Custom")
})

output$gradient_code_output <- renderText({
  paste0("scale_color_gradientn(colors = c('", paste(rv$grad_anchors, collapse = "', '"), "'))")
})

shape_df <- data.frame(
  pch = 0:25,
  col = rep(1:7, length.out = 26),
  row = rep(4:1, each = 7)[1:26]
)

output$shape_grid <- renderPlot({
  ggplot(shape_df, aes(x = col, y = row)) +
    geom_tile(
      data = subset(shape_df, pch == rv$selected_shape),
      fill = "#0F172A", alpha = 0.15, width = 0.9, height = 0.9
    ) +
    geom_point(aes(shape = pch), size = 4, fill = "gray90", color = "black") +
    geom_text(aes(label = pch), vjust = 2.2, size = 3.5, fontface = "bold", color = "#475569") +
    scale_shape_identity() +
    scale_x_continuous(limits = c(0.5, 7.5)) +
    scale_y_continuous(limits = c(0.5, 4.5)) +
    coord_fixed(ratio = 1) +
    theme_void() +
    theme(plot.margin = margin(4, 4, 4, 4))
})

observeEvent(input$grid_click, {
  clicked <- nearPoints(shape_df, input$grid_click, threshold = 20, maxpoints = 1, xvar = "col", yvar = "row")
  if (nrow(clicked) > 0) rv$selected_shape <- clicked$pch
})

output$shape_preview <- renderPlot({
  ggplot(data.frame(x = 1, y = 1), aes(x, y)) +
    geom_point(shape = rv$selected_shape, size = 16, color = rv$preview_color, fill = rv$preview_fill, stroke = 2.5) +
    theme_void() +
    labs(title = paste0("pch = ", rv$selected_shape)) +
    coord_fixed(xlim = c(0.5, 1.5), ylim = c(0.5, 1.5)) +
    theme(plot.title = element_text(hjust = 0.5, face = "bold", size = 13, color = "#0F172A"))
})

output$color_selector_ui <- renderUI({
  lapply(seq_along(rv$palette), function(i) {
    is_active <- if (rv$preview_color == rv$palette[i]) "active" else ""
    tags$div(
      class = paste("mini-box", is_active),
      style = paste0("background-color:", rv$palette[i], ";"),
      onclick = sprintf("Shiny.setInputValue('sel_border_hex', '%s')", rv$palette[i])
    )
  })
})

output$fill_selector_ui <- renderUI({
  if (rv$selected_shape >= 21 && rv$selected_shape <= 25) {
    tagList(
      tags$div(style = "font-size: 10px; font-weight: 600; color: #64748B; margin: 4px 0 2px 0;", "Fill Color:"),
      lapply(seq_along(rv$palette), function(i) {
        is_active <- if (rv$preview_fill == rv$palette[i]) "active" else ""
        tags$div(
          class = paste("mini-box", is_active),
          style = paste0("background-color:", rv$palette[i], ";"),
          onclick = sprintf("Shiny.setInputValue('sel_fill_hex', '%s')", rv$palette[i])
        )
      })
    )
  } else NULL
})

observeEvent(input$sel_border_hex, { rv$preview_color <- input$sel_border_hex })
observeEvent(input$sel_fill_hex,   { rv$preview_fill   <- input$sel_fill_hex })

output$live_preview_plot <- renderPlot({
  tab <- if (!is.null(input$main_tabs)) input$main_tabs else "Custom"
  cvd <- if (!is.null(input$cvd_mode))  input$cvd_mode  else "normal"
  mode <- if (!is.null(input$plot_mode_toggle)) input$plot_mode_toggle else "bars"
  
  cols <- if (identical(tab, "Presets")) {
    generated_pal_reactive()
  } else if (identical(tab, "Gradient")) {
    gradient_full_reactive()
  } else {
    rv$palette
  }
  
  if (is.null(cols) || length(cols) == 0) cols <- "#2C3E50"
  simmed <- sim_cvd(cols, cvd)
  
  if (identical(mode, "scatter")) {
    set.seed(42)
    n_pts <- min(120, length(simmed) * 20)
    groups <- factor(rep(paste0("g", seq_along(simmed)), length.out = n_pts))
    x_val <- rnorm(n_pts, mean = as.numeric(groups) * 1.5, sd = 0.8)
    y_val <- rnorm(n_pts, mean = as.numeric(groups) * 1.2, sd = 0.7)
    df_scat <- data.frame(x = x_val, y = y_val, group = groups)
    
    return(
      ggplot(df_scat, aes(x = x, y = y, color = group)) +
        geom_point(size = 3, alpha = 0.85) +
        scale_color_manual(values = simmed) +
        theme_minimal() +
        theme(
          legend.position = "none",
          plot.background = element_rect(fill = "#FFFFFF", color = NA),
          panel.background = element_rect(fill = "#FFFFFF", color = NA),
          plot.title = element_text(size = 11, face = "bold", color = "#0F172A"),
          axis.title = element_blank(),
          axis.text = element_text(size = 9, color = "#64748B")
        ) +
        labs(title = paste0("Active Palette Preview (", cvd, ")"))
    )
  }
  
  df <- data.frame(
    Category = factor(paste0("g", seq_along(simmed)), levels = paste0("g", seq_along(simmed))),
    Value = seq(12, by = 4, length.out = length(simmed))
  )
  
  ggplot(df, aes(x = Category, y = Value, fill = Category)) +
    geom_col(width = 0.6) +
    scale_fill_manual(values = simmed) +
    theme_minimal() +
    theme(
      legend.position = "none",
      plot.background = element_rect(fill = "#FFFFFF", color = NA),
      panel.background = element_rect(fill = "#FFFFFF", color = NA),
      plot.title = element_text(size = 11, face = "bold", color = "#0F172A"),
      axis.title = element_blank(),
      axis.text = element_text(size = 9, color = "#475569")
    ) +
    labs(title = paste0("Active Palette Preview (", cvd, ")"))
})
\`\`\`

## Practice Exercise

\`\`\`{r practice_palette, exercise=TRUE}
my_palette <- c("#2C3E50", "#E74C3C", "#F1C40F", "#27AE60")

ggplot(iris, aes(x = Petal.Length, y = Petal.Width, color = Species)) +
  geom_point(size = 3) +
  scale_color_manual(values = my_palette) +
  theme_minimal()
\`\`\`
`;

export const R_PACKAGE_FILES: RPackageFile[] = [
  {
    path: 'DESCRIPTION',
    description: 'R Package Metadata and CRAN-compliant dependency specification',
    content: `Package: ColorLab
Title: Interactive Color and Shape Palette Designer for ggplot2
Version: 0.1.0
Authors@R: person("Boaz", "Rosenberg", email = "boazrsnbrg@gmail.com", role = c("aut","cre"))
Description: Provides interactive tools for exploring color and shape combinations in R,
    using learnr platform for integration in RStudio Tutorial Pane.
License: MIT + file LICENSE
Encoding: UTF-8
LazyData: true
Imports:
    learnr (>= 0.11.0),
    shiny (>= 1.8.0),
    colourpicker (>= 1.3.0),
    ggplot2 (>= 3.5.0),
    shinyjs (>= 2.1.0),
    RColorBrewer (>= 1.1-3),
Package: ColorLab
Title: Interactive Color and Shape Palette Designer for ggplot2
Version: 0.2.0
Authors@R: person("Boaz", "Rosenberg", email = "boazrsnbrg@gmail.com", role = c("aut", "cre"))
Description: An interactive, modern color palette and ggplot2 shape designer
    that runs seamlessly in the RStudio Viewer Pane without blocking the R console.
    Provides custom color ramps, curated presets (Okabe-Ito, ColorBrewer, Viridis),
    gradient interpolation, color-vision deficiency simulation, and instant R code generation.
License: MIT + file LICENSE
Encoding: UTF-8
LazyData: true
RoxygenNote: 7.3.1
Imports:
    utils
Suggests:
    httpuv,
    rstudioapi,
    ggplot2,
    RColorBrewer,
    viridis,
    testthat (>= 3.0.0)
URL: https://github.com/BoazRosenberg/ColorLab
BugReports: https://github.com/BoazRosenberg/ColorLab/issues
`,
  },
  {
    path: '.Rbuildignore',
    description: 'Instructs R CMD build to exclude non-R repository files',
    content: `^src$
^node_modules$
^package\\.json$
^package-lock\\.json$
^tsconfig.*\\.json$
^vite\\.config\\.ts$
^\\.env.*$
^metadata\\.json$
^index\\.html$
^\\.git$
^\\.gitignore$
^\\.aistudio.*$
^dist$
`,
  },
  {
    path: 'NAMESPACE',
    description: 'Exported R functions and imported dependencies',
    content: `# Generated by roxygen2: do not edit by hand

export(colorlab)
export(colorlab_stop)
export(ColorLab)
export(run_colorlab)
export(launch_palette_tutorial)
importFrom(utils,browseURL)
`,
  },
  {
    path: 'R/launch.R',
    description: 'Non-blocking launch function for RStudio Viewer Pane',
    content: `# Internal environment for background server state
.colorlab_env <- new.env(parent = emptyenv())
.colorlab_env$server <- NULL
.colorlab_env$port <- NULL

#' Launch ColorLab in RStudio Viewer Pane
#'
#' Opens the interactive ColorLab color palette and shape designer in
#' RStudio's Viewer Pane (or default web browser if outside RStudio).
#' ColorLab runs asynchronously and does NOT block the R console, so you can
#' continue writing, executing code, and creating plots while ColorLab is open.
#'
#' @param browser Logical. If \\code{TRUE}, opens in the system web browser
#'   instead of the RStudio Viewer pane. Default is \\code{FALSE}.
#' @param port Integer. Preferred TCP port if using a local background HTTP server.
#'   Default selects a random available port.
#'
#' @return Invisibly returns the URL or local path to the running application.
#' @export
#' @examples
#' \\dontrun{
#' library(ColorLab)
#'
#' # Launch in RStudio Viewer (console remains active!)
#' colorlab()
#'
#' # Or open in external web browser
#' colorlab(browser = TRUE)
#' }
colorlab <- function(browser = FALSE, port = NULL) {
  app_file <- system.file("app", "index.html", package = "ColorLab")
  if (!nzchar(app_file) || !file.exists(app_file)) {
    app_file <- system.file("dist", "index.html", package = "ColorLab")
  }
  if (!nzchar(app_file) || !file.exists(app_file)) {
    dev_paths <- c(
      file.path(getwd(), "inst", "app", "index.html"),
      file.path(getwd(), "dist", "index.html")
    )
    for (p in dev_paths) {
      if (file.exists(p)) {
        app_file <- p
        break
      }
    }
  }

  if (!nzchar(app_file) || !file.exists(app_file)) {
    stop(
      "ColorLab application bundle not found.\\n",
      "Please reinstall ColorLab: remotes::install_github('BoazRosenberg/ColorLab')",
      call. = FALSE
    )
  }

  viewer <- getOption("viewer")
  use_viewer <- !isTRUE(browser) && !is.null(viewer)

  is_rstudio_server <- nzchar(Sys.getenv("RSTUDIO_HTTP_REFERER")) ||
    nzchar(Sys.getenv("RSTUDIO_SERVER")) ||
    nzchar(Sys.getenv("POSIT_CLOUD"))

  if (requireNamespace("httpuv", quietly = TRUE) && (is_rstudio_server || !is.null(port))) {
    if (is.null(.colorlab_env$server)) {
      if (is.null(port)) {
        port <- sample(3100:8999, 1)
      }
      
      app_handler <- list(
        call = function(req) {
          list(
            status = 200L,
            headers = list(
              "Content-Type" = "text/html; charset=utf-8",
              "Access-Control-Allow-Origin" = "*"
            ),
            body = readBin(app_file, "raw", file.info(app_file)$size)
          )
        }
      )

      tryCatch({
        .colorlab_env$server <- httpuv::startServer("127.0.0.1", port, app_handler)
        .colorlab_env$port <- port
      }, error = function(e) {
        .colorlab_env$server <- NULL
      })
    }

    if (!is.null(.colorlab_env$server)) {
      url <- sprintf("http://127.0.0.1:%d", .colorlab_env$port)
      if (use_viewer) {
        viewer(url)
        message("ColorLab launched in RStudio Viewer Pane (", url, ")")
      } else {
        utils::browseURL(url)
        message("ColorLab opened in browser (", url, ")")
      }
      message("  Console remains free. Write and execute code while ColorLab is running!")
      return(invisible(url))
    }
  }

  temp_dir <- file.path(tempdir(), "ColorLab")
  if (!dir.exists(temp_dir)) dir.create(temp_dir, recursive = TRUE, showWarnings = FALSE)
  dest_file <- file.path(temp_dir, "index.html")
  file.copy(app_file, dest_file, overwrite = TRUE)

  if (use_viewer) {
    viewer(dest_file)
    message("ColorLab launched in RStudio Viewer Pane.")
    message("  Console remains free. Write and execute code while ColorLab is running!")
  } else {
    utils::browseURL(dest_file)
    message("ColorLab opened in default browser.")
  }

  invisible(dest_file)
}

#' Stop ColorLab Background Server
#'
#' Stops any local background HTTP server started by \\code{colorlab()}.
#'
#' @export
colorlab_stop <- function() {
  if (!is.null(.colorlab_env$server)) {
    tryCatch({
      httpuv::stopServer(.colorlab_env$server)
    }, error = function(e) NULL)
    .colorlab_env$server <- NULL
    .colorlab_env$port <- NULL
    message("ColorLab background server stopped.")
  } else {
    message("No ColorLab background server is currently running.")
  }
  invisible(NULL)
}

#' @rdname colorlab
#' @export
run_colorlab <- function(...) {
  colorlab(...)
}

#' @rdname colorlab
#' @export
ColorLab <- function(...) {
  colorlab(...)
}

#' @rdname colorlab
#' @export
launch_palette_tutorial <- function(...) {
  colorlab(...)
}
`,
  },
  {
    path: 'man/colorlab.Rd',
    description: 'Documentation for colorlab and Viewer Pane integration',
    content: `% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/launch.R
\\name{colorlab}
\\alias{colorlab}
\\alias{colorlab_stop}
\\alias{run_colorlab}
\\alias{ColorLab}
\\alias{launch_palette_tutorial}
\\title{Launch ColorLab in RStudio Viewer Pane}
\\usage{
colorlab(browser = FALSE, port = NULL)

colorlab_stop()

run_colorlab(...)

ColorLab(...)

launch_palette_tutorial(...)
}
\\arguments{
\\item{browser}{Logical. If \\code{TRUE}, opens in the default system web browser
instead of RStudio's Viewer pane. Default is \\code{FALSE}.}

\\item{port}{Integer. Preferred TCP port if using a local background HTTP server.
Default selects a random available port.}

\\item{...}{Additional arguments forwarded to \\code{colorlab()}.}
}
\\value{
Invisibly returns the local file path or server URL.
}
\\description{
Opens the interactive ColorLab color palette and ggplot2 shape designer in
RStudio's Viewer Pane (or external web browser). ColorLab runs asynchronously
and does NOT block the R console, allowing you to continue writing and
executing R code while the tool remains open and interactive.
}
\\examples{
\\dontrun{
library(ColorLab)

# Launch in RStudio Viewer Pane (non-blocking)
colorlab()

# Or open in external browser
colorlab(browser = TRUE)

# Stop background server if started
colorlab_stop()
}
}
`,
  },
  {
    path: 'README.md',
    description: 'Package documentation and RStudio Viewer Pane instructions',
    content: `# ColorLab 🎨

Interactive Color and Shape Palette Designer for ggplot2 and RStudio.

## Installation

\`\`\`r
# Install from GitHub
remotes::install_github("BoazRosenberg/ColorLab")

# Or with pak
pak::pak("BoazRosenberg/ColorLab")
\`\`\`

## Launching in RStudio

Simply run:

\`\`\`r
library(ColorLab)
colorlab()
\`\`\`

- **RStudio Viewer Pane:** Opens directly in your Viewer pane.
- **Console Unblocked:** Keep coding while ColorLab stays open.
- **Copy to Console:** Click 'Copy' and paste into your R scripts!
`,
  },
  {
    path: 'tests/testthat/test-palette.R',
    description: 'Unit tests verifying tutorial existence and package launch',
    content: `test_that("palette_designer tutorial exists in package", {
  tutorials <- learnr::available_tutorials("ColorLab")
  expect_true(any(c("palette_designer", "colors") %in% tutorials$name))
})
`,
  },
];

/**
 * Creates and downloads the complete R package as a zip archive using JSZip.
 */
export async function downloadRPackageZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('ColorLab');

  if (!rootFolder) {
    throw new Error('Failed to create zip root folder');
  }

  // Add all files
  for (const file of R_PACKAGE_FILES) {
    rootFolder.file(file.path, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ColorLab_0.1.0.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
