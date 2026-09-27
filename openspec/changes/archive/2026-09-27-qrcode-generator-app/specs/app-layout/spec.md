# Spec Delta

## Purpose

Renders the application shell: the top app bar with logo and app name, the main generator area with the form (tabs and fields) on the left and the QR code preview on the right, the saved list below the form, and the footer with copyright and Proto Gestão attribution.

## ADDED Requirements

### Requirement: Top app bar
The system SHALL display a top app bar containing the application logo and the application name.

#### Scenario: App bar is visible
- **WHEN** the user opens the application
- **THEN** a top app bar shows the application logo and the application name

### Requirement: Generator area layout
The system SHALL present the main screen as the QR code generator directly, with the form (tabs and their fields) on the left side and the QR code preview on the right side.

#### Scenario: Main screen opens on the generator
- **WHEN** the user opens the application
- **THEN** the main screen shows the QR code generator without requiring any navigation

#### Scenario: Form is on the left
- **WHEN** the generator is displayed
- **THEN** the tabs and their fields are shown on the left side

#### Scenario: Preview is on the right
- **WHEN** the generator is displayed
- **THEN** the QR code preview (with its download options) is shown on the right side

### Requirement: Saved list placement
The system SHALL display the saved QR code list below the generator form area.

#### Scenario: List appears below the form
- **WHEN** the generator area is displayed and there are saved configurations
- **THEN** the saved list is rendered below the form fields

### Requirement: Footer
The system SHALL display a footer at the bottom of the page with the copyright notice, the attribution text "Essa aplicação é mais uma solução do Proto Gestão.", and a link to https://protogestao.com.

#### Scenario: Footer shows copyright and attribution
- **WHEN** the user scrolls to the bottom of the page
- **THEN** the footer displays the copyright notice and the text "Essa aplicação é mais uma solução do Proto Gestão."

#### Scenario: Link to Proto Gestão
- **WHEN** the footer is displayed
- **THEN** it contains a link pointing to https://protogestao.com