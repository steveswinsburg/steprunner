Feature: Marking step results

  Scenario: Mark a step as passed
    Given a scenario is displayed
    When the user clicks "Pass" on a step
    Then the step should be marked as passed

  Scenario: Mark a step as failed
    Given a step has not been marked
    When the user clicks "Fail"
    Then the step should be marked as failed

  Scenario: Mark a step as skipped
    Given a step is unmarked
    When the user clicks "Skip"
    Then the step should be marked as skipped
