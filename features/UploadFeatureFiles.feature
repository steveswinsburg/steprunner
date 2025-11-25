Feature: Uploading feature files and Cucumber reports
  As a test engineer
  I want to upload feature files and Cucumber JSON reports
  So that I can track test execution

  Scenario: Upload a single .feature file
    Given the user is on a session page
    When they drag and drop a .feature file into the drop zone
    Then the file should appear in the feature list
    And the feature should be parsed with title and scenarios

  Scenario: Upload multiple .feature files
    Given the user is on a session page
    When they drop multiple .feature files
    Then each file should appear in the feature list

  Scenario: Upload a Cucumber JSON report
    Given the user is on a session page
    When they drag and drop a cucumber-report.json file
    Then the report should be imported with all features
    And step statuses should be preserved (passed/failed/skipped)
    And embedded images should be stored
    And step metadata (duration, error messages) should be preserved

  Scenario: Upload feature file with description and Background
    Given the user uploads a .feature file with a description
    And the feature has a Background section
    When the file is parsed
    Then the feature description should be displayed
    And the Background steps should be shown before scenarios
