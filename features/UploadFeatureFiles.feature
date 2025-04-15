Feature: Uploading feature files

  Scenario: Upload a single .feature file
    Given the user is on a session page
    When they drag and drop a .feature file into the drop zone
    Then the file should appear in the feature list

  Scenario: Upload multiple .feature files
    Given the user is on a session page
    When they drop multiple .feature files
    Then each file should appear in the feature list
