# Spec Delta

## ADDED Requirements

### Requirement: Section navigation

The system SHALL provide navigation between two distinct sections: "QR Code" and "Orçamentos", and SHALL make the QR Code section the default when the application opens.

#### Scenario: Navigation exposes both sections

- **WHEN** the application shell is displayed
- **THEN** the navigation shows the "QR Code" and "Orçamentos" sections

#### Scenario: QR Code is the default section

- **WHEN** the user opens the application without choosing a section
- **THEN** the QR Code generator section is displayed

#### Scenario: Navigate to budgets

- **WHEN** the user selects the "Orçamentos" section
- **THEN** the budget registration section is displayed

#### Scenario: Navigate back to QR codes

- **WHEN** the user selects the "QR Code" section after visiting budgets
- **THEN** the QR code generator is displayed again

## MODIFIED Requirements

### Requirement: Top app bar

The system SHALL display a top app bar containing the application logo, the application name "LaserGest", and the section navigation.

#### Scenario: App bar is visible

- **WHEN** the user opens the application
- **THEN** a top app bar shows the application logo, the name "LaserGest", and the section navigation

### Requirement: Generator area layout

The system SHALL present the QR Code section with the form (tabs and their fields) on the left side and the QR code preview on the right side, and SHALL present the Orçamentos section with the budget registration form and saved budget list.

#### Scenario: Main screen opens on the generator

- **WHEN** the user opens the application
- **THEN** the QR Code section is displayed with the QR code generator

#### Scenario: Form is on the left

- **WHEN** the QR Code section is displayed
- **THEN** the tabs and their fields are shown on the left side

#### Scenario: Preview is on the right

- **WHEN** the QR Code section is displayed
- **THEN** the QR code preview (with its download options) is shown on the right side

#### Scenario: Budgets section shows its own area

- **WHEN** the user navigates to the Orçamentos section
- **THEN** the budget registration form and the saved budget list are displayed
