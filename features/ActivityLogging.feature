Feature: Activity logging
  As a test engineer
  I want to see a history of all actions taken in a session
  So that I can track who did what and when

  Background:
    Given the user is viewing a test session
    And the activity log is visible in the sidebar

  Scenario: Log displays user actions
    When the user marks a step as passed
    Then the activity log should show "Steve Swinsburg Marked step 1.1 as 'pass' 2:09:09 pm"
    And the most recent action should appear at the top

  Scenario: Log records image uploads
    When the user attaches an image to a step
    Then the activity log should record "Added image to step 1.2"

  Scenario: Log records image deletions
    When the user deletes an image from a step
    Then the activity log should record "Deleted image from step 1.2"

  Scenario: Log records feature uploads
    When the user uploads a new feature file
    Then the activity log should record the upload

  Scenario: Log records session exports
    When the user exports the session
    Then the activity log should record "Exported session as Cucumber report"

  Scenario: Activity log is compact and readable
    Given multiple actions have been logged
    Then each entry should be on a single line
    And the format should be: "User action timestamp"
    And the log should be scrollable when it exceeds the visible area

  Scenario: Activity log persists across page reloads
    Given actions have been logged
    When the user refreshes the page
    Then all logged activities should still be visible
    And they should be in reverse chronological order
