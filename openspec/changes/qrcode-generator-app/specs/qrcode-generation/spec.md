# Spec Delta

## Purpose

Generates QR codes from a text payload with a transparent background by default, optional background, an optional black-and-white logo at the center, and PNG download with or without background.

## ADDED Requirements

### Requirement: Generate QR code from payload
The system SHALL render a QR code for the currently configured payload whenever the user activates generation, and the QR code SHALL encode exactly the payload that was configured.

#### Scenario: Generate QR code from text
- **WHEN** the user configures a payload and triggers generation
- **THEN** the system renders a QR code whose decoded content is identical to the configured payload

#### Scenario: Empty payload is not generated
- **WHEN** the user triggers generation without providing a valid payload
- **THEN** the system SHALL NOT render a QR code and SHALL show a validation message indicating the required fields

#### Scenario: Payload changes require regeneration
- **WHEN** the user edits the payload after a QR code has been rendered
- **THEN** the previously rendered QR code SHALL be flagged as stale until generation is triggered again

### Requirement: Transparent background by default
The system SHALL render QR codes with a transparent (no) background by default, and SHALL offer an explicit option to render them with a background.

#### Scenario: Default rendering has no background
- **WHEN** the user generates a QR code without changing the background option
- **THEN** the QR code is rendered with a transparent background

#### Scenario: Background can be enabled
- **WHEN** the user selects the "with background" option and generates a QR code
- **THEN** the QR code is rendered with a white background

#### Scenario: Background can be re-disabled
- **WHEN** the user selects the "without background" option after having enabled a background
- **THEN** the QR code is rendered with a transparent background again

### Requirement: Download QR code as image
The system SHALL allow the user to download the generated QR code as a PNG image, honoring the selected background option.

#### Scenario: Download without background
- **WHEN** the user downloads the QR code while the "without background" option is active
- **THEN** the system downloads a PNG image whose background is transparent

#### Scenario: Download with background
- **WHEN** the user downloads the QR code while the "with background" option is active
- **THEN** the system downloads a PNG image that includes the background

### Requirement: Optional black-and-white logo at center
The system SHALL allow the user to select an image to place at the center of the QR code, and SHALL render that image in black and white (grayscale).

#### Scenario: No logo selected
- **WHEN** the user generates a QR code without selecting a logo
- **THEN** the QR code is rendered without any logo at its center

#### Scenario: Logo is centered
- **WHEN** the user selects an image as the logo and generates a QR code
- **THEN** the QR code is rendered with the image centered in its middle

#### Scenario: Logo is black and white
- **WHEN** the user selects a colored image as the logo
- **THEN** the rendered logo inside the QR code is black and white, regardless of the original image colors