Feature: Display feature descriptions and backgrounds
  As a test engineer
  I want to see feature descriptions and background steps
  So that I understand the context and common setup for scenarios

  Scenario: Display feature description
    Given a feature file contains a description after the Feature line
    When the feature is displayed
    Then the description should appear below the feature title
    And the description should be in italics
    And the description should preserve line breaks

  Scenario: Display Background section
    Given a feature has a Background section
    When the feature is displayed
    Then the Background heading should appear before scenarios
    And Background steps should be displayed in gray
    And Background steps should be visually distinct from scenario steps

  Scenario: Feature without description
    Given a feature file has no description text
    When the feature is displayed
    Then only the feature title should be shown
    And no empty description block should appear

  Scenario: Feature without Background
    Given a feature has no Background section
    When the feature is displayed
    Then scenarios should be displayed normally
    And no Background section should appear
