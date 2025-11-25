Feature: Attaching images to test steps
  As a test engineer
  I want to attach screenshots and images to test steps
  So that I can provide visual evidence of test execution

  Background:
    Given the user has selected a feature with scenarios
    And steps are displayed

  Scenario: Drag and drop image onto a step
    Given a step is displayed
    When the user drags an image file over the step
    Then the step should highlight with a blue border
    When the user drops the image
    Then the image should be attached to that step
    And the image should be stored in IndexedDB
    And the activity log should record "Added image to step X.Y"

  Scenario: Attach multiple images to a single step
    Given a step already has one image attached
    When the user drags and drops another image
    Then both images should be displayed under the step

  Scenario: Click to view full-size image
    Given a step has an attached image
    When the user clicks on the thumbnail
    Then the image should open in a new tab at full size

  Scenario: Delete an attached image
    Given a step has an image attached
    When the user hovers over the image
    Then a delete button should appear
    When the user clicks the delete button
    Then a confirmation dialog should appear
    When the user confirms deletion
    Then the image should be removed from the step
    And the image should be deleted from IndexedDB
    And the activity log should record "Deleted image from step X.Y"

  Scenario: Images are included in exports
    Given multiple steps have images attached
    When the user exports the session
    Then images should be embedded as base64 in the JSON
    And images should be visible in the HTML report

  Scenario: Images are preserved when importing Cucumber reports
    Given a Cucumber JSON report contains embedded images
    When the user uploads the report
    Then the images should be extracted and stored
    And the images should be displayed on the corresponding steps
