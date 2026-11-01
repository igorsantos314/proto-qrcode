# Budget Management Specification

## Purpose

Permite registrar, calcular, salvar e exportar orçamentos de gravação laser, transformando material, tempo de máquina e custos indiretos em custo por unidade e preço de venda com margem.

## Requirements

### Requirement: Budget input fields

The system SHALL provide a budget registration form with the following editable inputs: material type, material cost per square meter (R$/m²), piece width and height in millimeters, quantity of pieces, engraving time per piece in hours, depreciation rate of the machine in R$/h, profit margin, sale price, additional costs, and applied reusable parameters.

#### Scenario: Required budget fields are available

- **WHEN** the user opens the budget registration section
- **THEN** the form shows fields for material type, material cost per m², piece width and height in millimeters, quantity, engraving time per piece, depreciation, margin, sale price, additional costs, and reusable parameters

#### Scenario: Dimensions use millimeters

- **WHEN** the user enters the width and height of a piece
- **THEN** the values are interpreted as millimeters and the piece area is derived in square meters

#### Scenario: Material cost uses square meters

- **WHEN** the user enters the material cost
- **THEN** the value is interpreted as Brazilian reais per square meter (R$/m²)

### Requirement: Cost breakdown calculation

The system SHALL calculate and display the piece area, unit material cost, total material cost, machine cost per hour, total machine cost, additional costs total, total cost, and cost per unit from the budget inputs and active reusable parameters.

#### Scenario: Piece area is calculated

- **WHEN** the user provides width and height in millimeters
- **THEN** the system calculates the piece area in m² as (width / 1000) × (height / 1000)

#### Scenario: Material cost is calculated

- **WHEN** the piece area, material cost per m², and quantity are provided
- **THEN** the unit material cost is the piece area × material cost per m² and the total material cost is the unit material cost × quantity

#### Scenario: Machine cost per hour is calculated

- **WHEN** the active energy cost (R$/kWh), machine consumption per hour (kWh/h), and depreciation rate (R$/h) are available
- **THEN** the machine cost per hour is (consumption per hour × energy cost) + depreciation rate

#### Scenario: Total machine cost is calculated

- **WHEN** the machine cost per hour, engraving time per piece, and quantity are provided
- **THEN** the total machine cost is the machine cost per hour × engraving time per piece × quantity

#### Scenario: Additional costs are totaled

- **WHEN** the user adds additional costs or applies reusable parameters with quantities
- **THEN** the additional costs total is the sum of all additional cost values plus all applied parameter values multiplied by their quantities

#### Scenario: Total and unit cost are calculated

- **WHEN** material, machine, and additional costs are available
- **THEN** the total cost is the sum of the total material cost, total machine cost, and additional costs total, and the cost per unit is the total cost divided by the quantity of pieces

#### Scenario: Quantity must be greater than zero to calculate unit cost

- **WHEN** the quantity of pieces is zero or empty
- **THEN** the system SHALL NOT calculate a cost per unit and SHALL show a validation message

### Requirement: Editable margin and sale price

The system SHALL provide editable profit margin and sale price fields that update each other bidirectionally, using margin over the sale price.

#### Scenario: Editing margin updates sale price

- **WHEN** the user edits the profit margin and the cost per unit is available
- **THEN** the system updates the unit sale price to cost per unit / (1 − margin / 100)

#### Scenario: Editing sale price updates margin

- **WHEN** the user edits the unit sale price and the cost per unit is available
- **THEN** the system updates the profit margin to (1 − cost per unit / sale price) × 100

#### Scenario: Invalid margin

- **WHEN** the user enters a profit margin equal to or greater than 100%
- **THEN** the system SHALL NOT calculate a sale price and SHALL show a validation message

#### Scenario: Invalid sale price

- **WHEN** the user enters a sale price less than or equal to zero
- **THEN** the system SHALL NOT calculate a margin and SHALL show a validation message

### Requirement: Budget validation

The system SHALL prevent saving or exporting a budget that is missing required inputs or that contains invalid numeric values.

#### Scenario: Missing material type

- **WHEN** the user attempts to save a budget without a material type
- **THEN** the system SHALL NOT save it and SHALL show a validation message

#### Scenario: Negative or non-numeric values

- **WHEN** the user enters a negative or non-numeric value for a cost, dimension, quantity, time, or percentage field
- **THEN** the system SHALL NOT save it and SHALL show a validation message identifying the invalid field

#### Scenario: Valid budget can be saved

- **WHEN** all required inputs are valid and the user saves the budget
- **THEN** the system saves the budget and shows a confirmation message

### Requirement: Cache budgets locally

The system SHALL persist saved budgets in the browser's local storage only when the user explicitly saves them, and SHALL list saved budgets from most recent to oldest.

#### Scenario: Saving persists a budget

- **WHEN** the user saves a valid budget
- **THEN** the budget is persisted to local storage and appears in the saved budget list

#### Scenario: Data survives reload

- **WHEN** the user reloads the application after saving budgets
- **THEN** the previously saved budgets are still available

#### Scenario: Newest first ordering

- **WHEN** there are multiple saved budgets
- **THEN** the list is ordered by creation date/time from most recent to oldest

#### Scenario: Empty list

- **WHEN** there are no saved budgets
- **THEN** the system shows an empty state message in the saved budget list

### Requirement: Load and edit a saved budget

The system SHALL allow the user to load a saved budget back into the form and to update it without duplicating the record.

#### Scenario: Load a saved budget

- **WHEN** the user selects a saved budget
- **THEN** the form is populated with the saved inputs and applied parameters

#### Scenario: Editing updates the same record

- **WHEN** the user saves while editing a loaded budget
- **THEN** the existing record is updated instead of creating a new one

### Requirement: Delete a saved budget

The system SHALL allow the user to delete a saved budget after confirming the action.

#### Scenario: Confirmation before deletion

- **WHEN** the user triggers deletion of a saved budget
- **THEN** the system asks for confirmation before permanently removing the record

#### Scenario: Deletion removes the record

- **WHEN** the user confirms the deletion
- **THEN** the budget is removed from local storage and from the list

### Requirement: Export a budget as XLSX

The system SHALL allow the user to export any saved budget as an .xlsx spreadsheet containing the inputs, the calculation breakdown, the totals, the margin, and the sale price.

#### Scenario: Export creates an XLSX file

- **WHEN** the user requests the export of a saved budget
- **THEN** the system downloads an .xlsx file for that budget

#### Scenario: Export contains the calculation breakdown

- **WHEN** the exported .xlsx file is opened
- **THEN** it contains the budget inputs, the calculated costs, the cost per unit, the profit margin, and the sale price

#### Scenario: Export is available per saved budget

- **WHEN** the saved budget list is displayed
- **THEN** each saved budget exposes an export action
