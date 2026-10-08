test_that("ColorLab app bundle exists in package", {
  app_file <- system.file("app", "index.html", package = "ColorLab")
  expect_true(nzchar(app_file) || file.exists("inst/app/index.html") || file.exists("dist/index.html"))
})

test_that("colorlab function is exported", {
  expect_true(is.function(colorlab))
  expect_true(is.function(run_colorlab))
  expect_true(is.function(ColorLab))
})
