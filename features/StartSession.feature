Feature: Starting a new test session

  Scenario: User starts a new session from the home screen
    Given StepRunner is open
    And no previous sessions exist
    When the user clicks "Start a Test Session"
    Then a new session should be created
    And the user should be navigated to the session page

  Scenario: User starts a session with existing sessions
    Given StepRunner is open
    And previous sessions exist
    When the user clicks "Start New Session"
    Then a new session should be created
