# Spec Delta

## Purpose

Builds the exact QR payload string for each supported tab type (pix, instagram, wifi, facebook, and text) from the fields the user fills in, and drives which tab is active by default.

## ADDED Requirements

### Requirement: Text payload (default tab)
The system SHALL offer a "text" tab as the default, and the payload for it SHALL be the literal text the user entered.

#### Scenario: Text tab is active by default
- **WHEN** the user opens the application
- **THEN** the "text" tab is the active tab and the payload builder for plain text is shown

#### Scenario: Payload equals the entered text
- **WHEN** the user is on the text tab and enters text
- **THEN** the QR payload is exactly the entered text, trimmed

#### Scenario: Empty text is invalid
- **WHEN** the user attempts to generate with an empty text field
- **THEN** the system SHALL NOT build a payload and SHALL show a validation message

### Requirement: Pix payload
The system SHALL offer a "pix" tab and SHALL build a valid Pix copy-and-paste (copia e cola) payload from the fields the user fills in (Pix key, receiver name, city, amount, and description).

#### Scenario: Valid pix payload is built
- **WHEN** the user is on the pix tab and fills the required fields with valid values
- **THEN** the system builds a Pix payload that conforms to the EMV/BR Code structure expected by Pix

#### Scenario: Missing required pix fields
- **WHEN** the user attempts to generate on the pix tab without filling the required fields
- **THEN** the system SHALL NOT build a payload and SHALL show a validation message listing the missing required fields

### Requirement: Instagram payload
The system SHALL offer an "instagram" tab and SHALL build the payload from the Instagram profile the user provides.

#### Scenario: Payload is the Instagram profile URL
- **WHEN** the user is on the instagram tab and enters an Instagram username or profile
- **THEN** the system builds a payload that is the corresponding Instagram profile URL

#### Scenario: Missing instagram profile
- **WHEN** the user attempts to generate on the instagram tab without providing a profile
- **THEN** the system SHALL NOT build a payload and SHALL show a validation message

### Requirement: WiFi payload
The system SHALL offer a "wifi" tab and SHALL build a payload in the standard WiFi QR format (`WIFI:T:<type>;S:<ssid>;P:<password>;;`), including hidden-network support.

#### Scenario: WPA2 network payload
- **WHEN** the user is on the wifi tab and enters an SSID and password for a WPA2 network
- **THEN** the system builds a payload in the standard `WIFI:T:WPA;S:<ssid>;P:<password>;;` format

#### Scenario: Hidden network flag
- **WHEN** the user marks the network as hidden on the wifi tab
- **THEN** the payload includes the hidden-network flag (`H:true`)

#### Scenario: Missing SSID
- **WHEN** the user attempts to generate on the wifi tab without entering an SSID
- **THEN** the system SHALL NOT build a payload and SHALL show a validation message

### Requirement: Facebook payload
The system SHALL offer a "facebook" tab and SHALL build the payload from the Facebook page or profile the user provides.

#### Scenario: Payload is the Facebook URL
- **WHEN** the user is on the facebook tab and enters a Facebook page or profile
- **THEN** the system builds a payload that is the corresponding Facebook URL

#### Scenario: Missing facebook profile
- **WHEN** the user attempts to generate on the facebook tab without providing a page or profile
- **THEN** the system SHALL NOT build a payload and SHALL show a validation message

### Requirement: Plain-text payload preview for non-text tabs
The system SHALL display, below the form fields of every tab except text, the plain-text payload currently being built, so the user can validate the exact content that will be encoded in the QR code.

#### Scenario: Preview reflects the filled fields
- **WHEN** the user is on a non-text tab and fills in its fields
- **THEN** the plain-text payload built from those fields is shown below the fields

#### Scenario: No preview on the text tab
- **WHEN** the user is on the text tab
- **THEN** no separate payload preview is shown, since the text field itself is the payload