# Spec Delta

## Purpose

Persists QR code configurations in local storage so users can reuse, edit, and delete previously generated QR codes without regenerating them, presenting the records ordered newest-first with 50 items per page.

## ADDED Requirements

### Requirement: Save generated configurations locally
The system SHALL save the configuration of every generated QR code (payload type, payload fields, background option, logo, and creation timestamp) to the browser's local storage.

#### Scenario: Generation saves a record
- **WHEN** the user generates a QR code
- **THEN** the configuration is persisted to local storage and appears in the saved list

#### Scenario: Saving an edited record updates it
- **WHEN** the user edits an existing saved configuration and generates again
- **THEN** the existing record is updated instead of duplicating the QR configuration

#### Scenario: Data survives reload
- **WHEN** the user reloads the page after saving records
- **THEN** the previously saved configurations are still present

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