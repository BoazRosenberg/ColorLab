#' Launch the ColorLab Tutorial in RStudio
#'
#' Launches the shiny_prerendered learnr tutorial optimized for the RStudio
#' Tutorial Pane. Once launched, it appears under the 'Tutorial' tab in RStudio
#' or opens in a standalone web browser window.
#'
#' @param ... Additional arguments forwarded to \code{learnr::run_tutorial()}.
#' @return Runs the learnr interactive tutorial application.
#' @export
#' @examples
#' \dontrun{
#' ColorLab::run_colorlab()
#' }
run_colorlab <- function(...) {
  tuts <- tryCatch(learnr::available_tutorials("ColorLab")$name, error = function(e) character(0))
  tut <- if ("palette_designer" %in% tuts) "palette_designer" else if ("colors" %in% tuts) "colors" else "palette_designer"
  learnr::run_tutorial(tut, package = "ColorLab", ...)
}

#' @rdname run_colorlab
#' @export
launch_palette_tutorial <- function(...) {
  run_colorlab(...)
}
