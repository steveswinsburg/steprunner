Feature: Exporting report results
  As a test engineer
  I want to export test results in multiple formats
  So that I can share and archive test execution reports

  Scenario: Export report as Cucumber JSON
    Given the user has completed marking steps
    When they click "Export Report"
    Then a cucumber-report.json file should be downloaded
    And the JSON should follow Cucumber report format
    And all step statuses should be mapped correctly (pass→passed, fail→failed, skip→skipped)

  Scenario: Export report as HTML report
    Given the user has marked steps in a session
    When they click "Export Report"
    Then a cucumber-report.html file should also be downloaded
    And the HTML should be a standalone browsable report
    And embedded images should be included as base64
    And the report should show pass/fail statistics

  Scenario: Export with embedded images
    Given the user has attached images to steps
    When they export the report
    Then images should be embedded in the JSON as base64
    And images should be visible in the HTML report

  Scenario: Export without completing all steps
    Given some steps are unmarked
    When the user exports the report
    Then unmarked steps should have "undefined" status
    And the output should still include all scenarios
