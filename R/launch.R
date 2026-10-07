# Internal environment for background server state
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
#' @param browser Logical. If \code{TRUE}, opens in the system web browser
#'   instead of the RStudio Viewer pane. Default is \code{FALSE}.
#' @param port Integer. Preferred TCP port if using a local background HTTP server.
#'   Default selects a random available port.
#'
#' @return Invisibly returns the URL or local path to the running application.
#' @export
#' @examples
#' \dontrun{
#' library(ColorLab)
#'
#' # Launch in RStudio Viewer (console remains active!)
#' colorlab()
#'
#' # Or open in external web browser
#' colorlab(browser = TRUE)
#' }
colorlab <- function(browser = FALSE, port = NULL) {
  # 1. Locate the bundled self-contained application
  app_file <- system.file("app", "index.html", package = "ColorLab")
  if (!nzchar(app_file) || !file.exists(app_file)) {
    app_file <- system.file("dist", "index.html", package = "ColorLab")
  }
  if (!nzchar(app_file) || !file.exists(app_file)) {
    # Check current directory during development
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
      "ColorLab application bundle not found.\n",
      "Please reinstall ColorLab: remotes::install_github('BoazRosenberg/ColorLab')",
      call. = FALSE
    )
  }

  viewer <- getOption("viewer")
  use_viewer <- !isTRUE(browser) && !is.null(viewer)

  # Check if we should serve via non-blocking background httpuv server:
  # Preferred on RStudio Server / Posit Cloud, or when a port is specified.
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
      message("Console remains free. Write and execute code while ColorLab is running!")
      return(invisible(url))
    }
  }

  # Direct Viewer Pane display using tempdir() (native RStudio mechanism, 0 dependencies, non-blocking)
  temp_dir <- file.path(tempdir(), "ColorLab")
  if (!dir.exists(temp_dir)) dir.create(temp_dir, recursive = TRUE, showWarnings = FALSE)
  dest_file <- file.path(temp_dir, "index.html")
  file.copy(app_file, dest_file, overwrite = TRUE)

  if (use_viewer) {
    viewer(dest_file)
    message("ColorLab launched in RStudio Viewer Pane.")
    message("Console remains free. Write and execute code while ColorLab is running!")
  } else {
    utils::browseURL(dest_file)
    message("ColorLab opened in default browser.")
  }

  invisible(dest_file)
}

#' Stop ColorLab Background Server
#'
#' Stops any local background HTTP server started by \code{colorlab()}.
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
