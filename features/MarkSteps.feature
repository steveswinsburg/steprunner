Feature: Marking step results
  As a test engineer
  I want to mark test steps with different statuses
  So that I can track which steps passed, failed, or were skipped

  Background:
    Given the user has selected a feature
    And scenarios are displayed with steps

  Scenario: Mark a step as passed
    Given a scenario is displayed
    When the user clicks the Pass button on a step
    Then the step should be marked as passed
    And the step background should turn green
    And the activity log should record the action

  Scenario: Mark a step as failed
    Given a step has not been marked
    When the user clicks the Fail button
    Then the step should be marked as failed
    And the step background should turn red
    And the activity log should show "Marked step X.Y as 'fail'"

  Scenario: Mark a step as skipped
    Given a step is unmarked
    When the user clicks the Skip button
    Then the step should be marked as skipped
    And the step background should turn yellow

  Scenario: Mark a step as undefined
    Given a step has been marked
    When the user clicks the Undefined button
    Then the step should be unmarked
    And the step background should return to default

  Scenario: Mark all steps in a scenario as passed
    Given a scenario has multiple steps
    When the user clicks "Pass All" for the scenario
    Then all steps in that scenario should be marked as passed

  Scenario: Mark all steps in a scenario as failed
    Given a scenario has multiple steps
    When the user clicks "Fail All" for the scenario
    Then all steps in that scenario should be marked as failed

  Scenario: Button tooltips show status descriptions
    When the user hovers over the Pass button
    Then a tooltip should show "Mark as Passed"
    And hovering over Fail should show "Mark as Failed"
    And hovering over Skip should show "Mark as Skipped"
    And hovering over Undefined should show "Mark as Undefined"
