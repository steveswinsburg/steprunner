Feature: Viewing scenarios within a feature
  As a test engineer
  I want to view and navigate through feature scenarios
  So that I can execute tests step by step

  Scenario: Select a feature from the sidebar
    Given the user has uploaded one or more feature files
    When they click a feature in the sidebar
    Then the feature should be highlighted
    And the main panel should display its scenarios
    And the feature title should be shown

  Scenario: Display scenario steps
    Given a feature with multiple scenarios
    When the user views the feature
    Then all scenarios should be displayed
    And each scenario should show its title
    And all steps should be listed in order with keywords (Given/When/Then/And)

  Scenario: Display step metadata from imported reports
    Given a Cucumber report was imported with timing data
    When viewing the steps
    Then step durations should be shown in milliseconds
    And error messages should be displayed for failed steps
    And match locations should be visible for steps with metadata

  Scenario: Steps display in card format
    Given scenarios are displayed
    Then each step should be in a card-style layout
    And steps should have rounded corners
    And step status colors should be clearly visible
    And there should be proper spacing between steps
