Feature: Exporting session results

  Scenario: Export test results
    Given the user has completed marking steps
    When they click "Export"
    Then the session data should be downloaded as JSON

  Scenario: Export without completing all steps
    Given some steps are unmarked
    When the user exports the session
    Then the output should still include all scenarios and their statuses
