# Reusable Parameters Specification

## Purpose

Centraliza preços, consumos e taxas reutilizáveis para que os orçamentos sejam preenchidos e calculados de forma consistente, sem redigitar valores a cada novo orçamento.

## Requirements

### Requirement: Manage reusable parameters

The system SHALL provide a section where the user can create, edit, and delete reusable parameters, each with a name, an optional description, a unit of measure, and a numeric value.

#### Scenario: Create a parameter

- **WHEN** the user adds a reusable parameter with a name, unit, and value
- **THEN** the parameter is available for use in budget calculations

#### Scenario: Edit a parameter

- **WHEN** the user edits the value or unit of a reusable parameter
- **THEN** the updated values are used by budgets created after the change

#### Scenario: Delete a parameter

- **WHEN** the user deletes a reusable parameter
- **THEN** it is no longer offered when composing new budgets

#### Scenario: Invalid parameter value

- **WHEN** the user enters a non-numeric or negative value for a reusable parameter
- **THEN** the system SHALL NOT save it and SHALL show a validation message

### Requirement: Default reusable parameter set

The system SHALL provide a default set of reusable parameters covering the common costs of a laser engraving shop, including varnish price, cleaning product price, energy cost per kWh, machine consumption per hour, machine depreciation, and default profit margin.

#### Scenario: Default parameters are available

- **WHEN** the user opens the reusable parameters section for the first time
- **THEN** the section shows varnish price, cleaning product price, energy cost per kWh, machine consumption per hour, machine depreciation, and default profit margin

#### Scenario: Default machine consumption reflects the diode laser

- **WHEN** the default parameters are created
- **THEN** the machine consumption per hour defaults to the consumption equivalent of a 5 W diode laser

#### Scenario: Values are editable

- **WHEN** the user edits a default parameter
- **THEN** the new value is stored and used in subsequent budgets

### Requirement: Persist reusable parameters

The system SHALL persist reusable parameters in the browser's local storage so they remain available after a page reload.

#### Scenario: Parameters survive reload

- **WHEN** the user reloads the application after editing reusable parameters
- **THEN** the edited parameters are still present

#### Scenario: Local storage unavailable

- **WHEN** the browser's local storage is unavailable
- **THEN** the system shows an error message and continues to allow the use of in-memory parameters

### Requirement: Apply reusable parameters to a budget

The system SHALL allow the user to apply one or more reusable parameters to a budget by providing a quantity, and SHALL copy the parameter's value into the budget at the moment it is applied.

#### Scenario: Apply a parameter with quantity

- **WHEN** the user selects a reusable parameter and enters a quantity in the budget
- **THEN** the budget includes a cost line equal to the parameter value × quantity

#### Scenario: Parameters prefill the budget form

- **WHEN** the user opens a new budget
- **THEN** the energy cost, machine consumption, depreciation, and default margin are prefilled from the reusable parameters

#### Scenario: Saved budgets keep the applied values

- **WHEN** a reusable parameter is edited after a budget was saved
- **THEN** the saved budget keeps the values it was saved with and is not recalculated from the new parameter values
