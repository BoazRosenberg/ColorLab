test_that("ColorLab tutorials exist in package", {
  tutorials <- learnr::available_tutorials("ColorLab")
  expect_true(any(c("palette_designer", "colors") %in% tutorials$name))
})
