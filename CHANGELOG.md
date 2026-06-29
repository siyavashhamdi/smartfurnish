# Changelog

All notable project changes are documented in this file.

## Unreleased

### Brand Migration: Smart Furnish

Date: 2026-06-13

The application branding has been migrated to Smart Furnish across the API, administration dashboard, documentation, and localized user-facing copy. Persian interface text now uses the English brand name, `Smart Furnish`, consistently.

#### Updated Surfaces

- Application metadata now identifies the API package as `smart-furnish-api` and the dashboard package as `smart-furnish`.
- Dashboard browser title, package description, and keywords now reference Smart Furnish.
- Persian authentication and layout locale strings now display `Smart Furnish` in all brand-related copy.
- Swagger API documentation title, site title, production server URL, and commented contact metadata now use Smart Furnish naming.
- Example environment configuration now uses `smart-furnish` for the MongoDB database and MinIO bucket names.
- Quick start documentation now uses Smart Furnish in headings, database examples, Docker container names, and production readiness messaging.
- Package lockfiles were updated to keep root package metadata aligned with the renamed packages.

#### Verification

- Confirmed no remaining matches for legacy brand spellings across the workspace.
- Confirmed edited files report no IDE linter diagnostics.
