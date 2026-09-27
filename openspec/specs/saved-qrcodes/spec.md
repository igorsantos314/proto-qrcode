# Saved QR Codes Specification

## Purpose

Persists QR code configurations in local storage so users can reuse, edit, and delete previously generated QR codes without regenerating them, presenting the records ordered newest-first with 50 items per page.

## Requirements

### Requirement: Save current configuration explicitly
The system SHALL persist the current QR code configuration (payload type, payload fields, background option, logo, and creation timestamp) to the browser's local storage only when the user explicitly saves it. Generating a QR code SHALL NOT persist it.

#### Scenario: Saving persists a record
- **WHEN** the user clicks Save with a valid configuration
- **THEN** the configuration is persisted to local storage and appears in the saved list

#### Scenario: Generating does not persist
- **WHEN** the user generates a QR code without saving it
- **THEN** nothing is added to the saved list

#### Scenario: Saving an edited record updates it
- **WHEN** the user saves while editing an existing saved configuration
- **THEN** the existing record is updated instead of duplicating the QR configuration

#### Scenario: Data survives reload
- **WHEN** the user reloads the page after saving records
- **THEN** the previously saved configurations are still present

### Requirement: Confirmation dialog after saving
The system SHALL show a dialog when a configuration is saved, informing the user that the content was saved locally and that clearing the browser cache will lose everything.

#### Scenario: Dialog appears after saving
- **WHEN** the user saves a configuration
- **THEN** a dialog appears stating that the content was saved locally and that clearing the browser cache will remove all saved QR codes

#### Scenario: Dialog can be dismissed
- **WHEN** the dialog is shown
- **THEN** the user can close it and continue using the application

### Requirement: List saved configurations
The system SHALL display the saved configurations below the generator form, ordered by date and time from most recent to oldest, with 50 items per page.

#### Scenario: Newest first ordering
- **WHEN** there are multiple saved configurations
- **THEN** the list is ordered by creation date/time from most recent to oldest

#### Scenario: Pagination at 50 items per page
- **WHEN** there are more than 50 saved configurations
- **THEN** the list is paginated with at most 50 items per page and controls to navigate between pages

#### Scenario: Empty list
- **WHEN** there are no saved configurations
- **THEN** the system shows an empty state message in the saved list area

### Requirement: Load a saved configuration
The system SHALL allow the user to load any saved configuration back into the generator form.

#### Scenario: Clicking a saved item loads it
- **WHEN** the user clicks a saved configuration
- **THEN** the generator form is populated with that configuration's payload fields, background option, and logo

### Requirement: Edit a saved configuration
The system SHALL allow the user to edit a saved configuration from the list.

#### Scenario: Editing is available per item
- **WHEN** a saved configuration is displayed
- **THEN** the item exposes an edit action

### Requirement: Delete a saved configuration
The system SHALL allow the user to delete any saved configuration.

#### Scenario: Deleting removes the record
- **WHEN** the user deletes a saved configuration
- **THEN** the record is removed from local storage and from the list

#### Scenario: Confirmation before deletion
- **WHEN** the user triggers deletion of a saved configuration
- **THEN** the system asks for confirmation before permanently removing the record

### Requirement: Persisted data is exactly what was saved
The system SHALL store and return saved configurations without altering their content.

#### Scenario: Round-trip integrity
- **WHEN** a configuration is saved, reloaded, and then loaded into the form
- **THEN** every field of the configuration (payload type, fields, background, logo) matches exactly what the user originally saved