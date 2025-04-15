Feature: Viewing scenarios within a feature

  Scenario: Select a feature from the sidebar
    Given the user has uploaded one or more feature files
    When they click a feature in the sidebar
    Then the middle panel should display its scenarios

  Scenario: Display scenario steps
    Given a feature with multiple scenarios
    When the user selects one
    Then all steps should be listed in order
